var express = require('express');
var router = express.Router();
var async = require('async');

var db = require('../models/db');
require('../models/notimodel');
require('../models/usermodel');
var NotiModel = db.model('Noti');
var UserModel = db.model('User');

function isNaturalNumber (str) {
  var pattern = /^(0|([1-9]\d*))$/;
  return pattern.test(str);
}

// 7.1. 노티리스트 조회 - GET - /api/1/noti
// 내가 받은 노티리스트 보여주기
router.get('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;

  var per_page = 5;
  var req_now_page = req.query.now_page;
  var req_total_page = req.query.total_page;

  var data = [];

  // asyncFunc 함수 시작
  var asyncFunc = function(page_num, message) {
    async.waterfall([
      function(callback) {
        NotiModel.paginate({res_user_id: token_user_id}, {sort: {noti_time: -1}, limit: per_page, page: page_num}, function(err, docs) {
          if (err) { return next(err); }
          callback(null, docs);
        });
      },
      function(arg1, callback) {
        async.each(arg1.docs, function(item, cb) {
          UserModel.findOne({user_id: docs.req_user_id}, function(err, docs2) {
            if (err) { return next(err); }
            if (item.proposal_id) { // 요청서가 있으면
              data.push({
                noti_id       : item.noti_id,
                noti_check    : item.noti_check,
                noti_type     : item.noti_type,
                noti_message  : item.noti_message,
                noti_time     : item.noti_time,
                proposal_id   : item.proposal_id,
                user_id       : docs2.user_id,
                user_type     : docs2.user_type,
                username      : docs2.username,
                thumbnail_img : docs2.thumbnail_img
              });
              cb();
            } else { // 요청서가 없으면(채팅이면)
              data.push({
                noti_id       : item.noti_id,
                noti_check    : item.noti_check,
                noti_type     : item.noti_type,
                noti_message  : item.noti_message,
                noti_time     : item.noti_time,
                chat_id       : item.chat_id,
                user_id       : docs2.user_id,
                user_type     : docs2.user_type,
                username      : docs2.username,
                thumbnail_img : docs2.thumbnail_img
              });
              cb();
            }
          });
        }, function(err) {
          if (err) { return next(err); }
          var result = {
            data  : data,
            page  : arg1.page,
            limit : arg1.limit,
            total : arg1.total
          };
          callback(null, result);
        });
      }
    ], function(err, result) {
      if (err) { return next(err); }
      var total_page = Math.ceil(result.total / result.limit);

      var final_result = {
        success    : 1,
        message    : message,
        data       : data,
        now_page   : result.page,
        total_page : total_page
      };
      res.json(final_result);
    });
  };
  // asyncFunc 함수 끝

  if (req_now_page == undefined && req_total_page == undefined) {
    // 노티 최상단 페이지
    asyncFunc(1, "노티리스트 최상단페이지입니다.");
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    if (req_now_page == req_total_page) {
      res.json({ success: 0, message: "더 가져올 노티리스타가 없습니다." });
    } else if (req_now_page < req_total_page) {
      // 노티 더 불러오기
      var new_page = parseInt(req_now_page) + 1;
      asyncFunc(new_page, "노티리스트더보기.");
    } else if (req_now_page == 1 && req_total_page == 0) {
      res.json({ success: 0, message: "노티가 없습니다" });
    } else {
      res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
    }
  } else {
    res.json({success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)"});
  }
});

module.exports = router;

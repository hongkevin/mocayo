var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment-timezone');

var db = require('../models/db');
require('../models/usermodel');
require('../models/bookmodel'); // /mypage에서 밑에 갤러리까지 같이 가져와야함
var UserModel = db.model('User');
var BookModel = db.model('Book');

// 3.1. 마이페이지
router.get('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var req_now_page = req.query.now_page;
  var req_total_page = req.query.total_page;

  // 자연수 정규식
  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

  if (req_now_page == undefined && req_total_page == undefined) {
    UserModel.findOne({user_id: token_user_id}, function (err, docs) {
      if (err) { return next(err); }

      // 만약 모델/작가라면 BookModel(갤러리)정보까지 모두 주고, 아닌 경우(최초가입유저/본인인증유저)에는 기본 정보(UserModel)만 주자.
      if (docs.user_type == "M" || docs.user_type == "P") {
	var portfolio;
 
	if (docs.portfolio.length != 0) {
	  portfolio = docs.portfolio[0].img_url;
	} 

        var data = {
	  myself : true,
          user_id : docs.user_id,
          user_type : docs.user_type,
          username : docs.username,
          age : docs.age,
          average_rank : docs.average_rank, // 4.7이면 4.5로 잘 넘어가야되는데
          wanted_addr : docs.wanted_addr[0], // 1개만 - 나중에 넣자, 값
          concept_price : docs.concept_price,
          portfolio : portfolio,
          // portfolio : docs.portfolio[0], // 1개만
          thumbnail_img : docs.thumbnail_img
        };

        if (data.portfolio == undefined) { delete data.portfolio; } // undefined에 대한 에러 처리
        if (data.thumbnail_img == undefined) { delete data.thumbnail_img; }

        var data2 = [];
        async.waterfall([
          function(callback) {
            BookModel.paginate({user_id: token_user_id}, { sort: { book_id: -1}, limit: 5, page: 1}, function(err, docs2) {
              if (err) { return next(err); }
              callback(null, docs2)
            });
          },
          function(arg1, callback) {
            async.each(arg1.docs, function (item, cb) {

              var liked = true;
              if (item.like_user.indexOf(token_user_id) == -1) { liked = false; }

	      var seoul_time = moment.tz(item.upload_time, "Asia/Seoul").format();

              data2.push({
                book_id      : item.book_id,
                book_img     : item.book_img,
                upload_time  : seoul_time,
                book_desc    : item.book_desc,
                like_count   : item.like_user.length,
                liked        : liked,
                user_id      : item.user_id,
                username     : docs.username,
                user_type    : docs.user_type,
                thumbnail_img: docs.thumbnail_img
              });
              cb();
            }, function (err) {
              if (err) { return next(err); }
              var result = {
                data2 : data2,
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
            message    : "모델/작가의 마이페이지입니다(첫요청).",
            data       : data,
            data2      : result.data2,
            now_page   : result.page,
            total_page : total_page
          };
          res.json(final_result);
        });
        // 최초가입유저/본인인증유저인 경우
      } else {
        var data3 = {
	  myself : true,
          user_id : docs.user_id,
          user_type : docs.user_type,
          username : docs.username,
	  potfolio : docs.portfolio[0],
          thumbnail_img : docs.thumbnail_img
        };

        if (data3.portfolio == undefined) { delete data3.portfolio; } // undefined에 대한 에러 처리
	if (data3.thumbnail_img == undefined) { delete data3.thumbnail; }

        var result = {
          success: 1,
          message: "최초가입유저/본인인증유저의 마이페이지입니다.",
          data: data3
        };
        res.json(result);
      }
    });
    // 더 불러오기
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    UserModel.findOne({user_id: token_user_id}, function (err, docs) {
      if (docs.user_type == "M" || docs.user_type == "P") {
        if (req_now_page == req_total_page) {
          res.json({ success: 0, message: "더 가져올 사진이 없습니다." });
        } else if (req_now_page < req_total_page) {
          var data5 = [];
          var new_page = parseInt(req_now_page) + 1;
          async.waterfall([
            function (callback) {
              BookModel.paginate({user_id: token_user_id}, {sort: {book_id: -1}, limit: 5, page: new_page}, function (err, docs2) {
                if (err) { return next(err); }
                callback(null, docs2)
              })
            },
            function (arg1, callback) {
              async.each(arg1.docs, function (item, cb) {
                
                var liked = true;
                if (item.like_user.indexOf(token_user_id) == -1) { liked = false; }

		var seoul_time = moment.tz(item.upload_time, "Asia/Seoul").format();

                data5.push({
                  book_id: item.book_id,
                  book_img: item.book_img,
                  upload_time: seoul_time,
                  book_desc: item.book_desc,
                  like_count: item.like_user.length,
                  liked: liked,
                  user_id: item.user_id,
                  username: docs.username,
                  user_type: docs.user_type,
                  thumbnail_img: docs.thumbnail_img
                });
                cb();
              }, function (err) {
                if (err) { return next(err); }
                var result = {
                  data: data5,
                  page: arg1.page
                };
                callback(null, result);
              });
            }
          ], function (err, result) {
            if (err) { return next(err); }
            var final_result = {
              success: 1,
              message: "모델/작가의 마이페이지에서 갤러리 더 불러오기입니다.",
              data: result.data,
              now_page: result.page,
              total_page: req_total_page
            };
            res.json(final_result);
          });
        } else if (req_now_page == 1 && req_total_page == 0) {
          res.json({ success: 0, message: "갤러리에 업로드된 사진이 없습니다(아직 사진업로드를 하나도 하지 않은)" });
        } else {
          res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
        }
      } else {
        res.json({success: 0, message: "옳지 않은 요청입니다(갤러리 더보기는 최초가입/본인인증유저에게 해당하지 않음)"})
      }
    });
  } else {
    res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)" });
  }
});

module.exports = router;


var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment');
var schedule = require('node-schedule');

var gcm = require('node-gcm');
var server_api_key = 'AIzaSyDBon20wR74S5mzKTzv5ixkHDWuEf7uujg';
var sender = new gcm.Sender(server_api_key);

var db = require('../models/db');
require('../models/proposalmodel');
require('../models/usermodel');
var ProposalModel = db.model('Proposal');
var UserModel = db.model('User');

// 5-3. Sending a proposal(요청서 보내기(생성))
// 입력받은 값(string, number, array)에 대한 자료형 처리 필요!
// 푸시 해야됨.
router.post('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var res_user_id = req.body.res_user_id;

  // sendProposal(요청서 보내는 함수) 시작
  var sendProposal = function() {
    // var work_day = req.body.work_day;
    var work_hour = req.body.work_hour;
    var work_addr = JSON.parse(req.body.work_addr);
    var work_concept = req.body.work_concept;
    var work_price = req.body.work_price;
    var in_or_out = req.body.in_or_out;
    var work_desc = req.body.work_desc; // 얘만 선택 정보

    var original_day = req.body.work_day;
    var work_day = moment(original_day, "YYYY-MM-DD HH");
    var end_time_calculate = original_day.split(" ")[0] + " " + (parseInt(original_day.split(" ")[1]) + parseInt(work_hour));
    var end_time = moment(end_time_calculate, "YYYY-MM-DD HH");

    var data = new ProposalModel({
      req_user_id  : token_user_id,
      res_user_id  : res_user_id,
      work_day     : work_day,
      work_hour    : work_hour,
      work_addr    : work_addr,
      work_concept : work_concept,
      work_price   : work_price,
      in_or_out    : in_or_out,
      work_desc    : work_desc,
      end_time     : end_time
    });

    // 선택정보 에러 처리
    if (work_desc == undefined) { delete data.work_desc; }

    data.save(function(err, docs) {
      if (err) { return next(err); }
      UserModel.findOne({user_id: res_user_id}, function(err, docs2) {
	if (err) { return next(err) };
	
	var registrationIds = [];

	var message = new gcm.Message({
	  collapseKey: 'demo',
	  delayWhileIdle: true,
	  timeToLive : 3,
  	  data: {
	    type: 'proposal',
	    id: docs.proposal_id,
	    message: '새로운 요청서가 도착했습니다'
	  }
	});
console.log(docs2.gcm_token);
	var token = docs2.gcm_token;
	registrationIds.push(token);

	if (token) {
	  sender.send(message, registrationIds, 4, function(err, result) {
	    console.log(message);
	    if (err) { return next(err) };
	    res.json({ success: 1, message: "요청서를 보냈습니다" });
	  });
	} else {
	  res.json({ success: 1, message: "요청서를 보냈습니다" });
	}
      });
    });
  };
  // sendProposal(요청서 보내는 함수) 끝

  UserModel.findOne({ user_id: token_user_id }, function(err, docs1) {
    if (err) { return next(err); }
    UserModel.findOne({ user_id: res_user_id }, function(err, docs2) {
      if (err) { return next(err); }
      if (docs1.user_type == "V" && docs2.user_type == "P") {
        // 내가 V일 때 상대방이 P이면
        sendProposal();
      } else if ((docs1.user_type == "M" || docs1.user_type == "P") && (docs2.user_type == "M" || docs2.user_type == "P")) {
        // 내가 M 혹은 P일 때, 상대방이 M 혹은 P이면.
        sendProposal();
      } else {
        res.json({ success: 0, message: "요청서를 보낼 수 없습니다.(내가 최초가입유저(I)거나, 내가 본인인증유저(V)인데 모델(M)/최초가입유저(I)/본인인증유저(V)한테 요청서를 보냈거나, 내가 모델(M)/작가(P)인데 최초가입유저(I)/본인인증유저(V)한테 보냈거나)" });
      }
    });
  });
});

// 5.1. 요청서 리스트 조회
router.get('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;

  var per_page = 10;
  var req_now_page = req.query.now_page;
  var req_total_page = req.query.total_page;

console.log(req_now_page);
console.log(req_total_page);

  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

  if (req_now_page == undefined && req_total_page == undefined) {
    var data = [];
    async.waterfall([
      function (callback) {
        ProposalModel.paginate({$or: [{req_user_id: token_user_id}, {res_user_id: token_user_id}]}, {sort: {proposal_id: -1}, limit: per_page, page: 1}, function(err, docs) {
          if (err) { return next(err); }
          callback(null, docs);
        });
      },
      function (arg1, callback) {
        async.each(arg1.docs, function (item, cb) {
          // 내가 요청서를 보낸 사람 - 받은 사람의 정보를 검색해서 보여줌
          if (token_user_id == item.req_user_id) {
            UserModel.findOne({user_id: item.res_user_id}, function(err, docs2) {
              if (err) { return next(err); }
              data.push({
                requested : true,
                proposal_id : item.proposal_id,
                proposal_stat : item.proposal_stat,
                work_day : item.work_day,
                work_hour: item.work_hour,
                work_concept : item.work_concept,
                work_price : item.work_price,
                work_addr : item.work_addr[0],
                user_id : item.res_user_id,
                user_type : docs2.user_type,
                username : docs2.username,
                thumbnail_img : docs2.thumbnail_img
              });
              cb();
            });
          } else {
            // 내가 요청서를 받은 사람 - 보낸 사람의 정보를 검색해서 보여줌
            UserModel.findOne({user_id: item.req_user_id}, function(err, docs2) {
              if (err) { return next(err); }
              data.push({
                requested : false,
                proposal_id : item.proposal_id,
                proposal_stat : item.proposal_stat,
                work_day : item.work_day,
                work_hour: item.work_hour,
                work_concept : item.work_concept,
                work_price : item.work_price,
                work_addr : item.work_addr[0],
                user_id : item.res_user_id,
                user_type : docs2.user_type,
                username : docs2.username,
                thumbnail_img : docs2.thumbnail_img
              });
              cb();
            });
          }
        }, function (err) {
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
    ], function (err, result) {
      if (err) { return next(err); }
      var total_page = Math.ceil(result.total / result.limit);

console.log('처음 나우페이지: ', result.page);
console.log('처음 토탈페이지: ', total_page);
      var final_result = {
        success: 1,
        message: "요청서리스트 최상단페이지입니다.",
        data: result.data,
        now_page: result.page,
        total_page: total_page
      };
      res.json(final_result);
    });
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    if (req_now_page == req_total_page) {
      res.json({ success: 0, message: "더 가져올 요청서가 없습니다." });
    } else if (req_now_page < req_total_page) {
      var data2 = [];
      var new_page = parseInt(req_now_page) + 1;
      async.waterfall([
        function(callback) {
          ProposalModel.paginate({$or: [{req_user_id: token_user_id}, {res_user_id: token_user_id}]}, {sort: {proposal_id: -1}, limit: per_page, page: new_page}, function(err, docs) {
            if (err) { return next(err); }
            callback(null, docs);
          });
        },
        function(arg1, callback) {
          async.each(arg1.docs, function (item, cb) {
            if (token_user_id == item.req_user_id) {
              UserModel.findOne({user_id: item.res_user_id}, function(err, docs2) {
                if (err) { return next(err); }
                data2.push({
                  requested : true,
                  proposal_id : item.proposal_id,
                  proposal_stat : item.proposal_stat,
                  work_day : item.work_day,
                  work_hour: item.work_hour,
                  work_concept : item.work_concept,
                  work_price : item.work_price,
                  work_addr : item.work_addr[0],
                  user_id : item.res_user_id,
                  user_type : docs2.user_type,
                  username : docs2.username,
                  thumbnail_img : docs2.thumbnail_img
                });
                cb();
              });
            } else {
              UserModel.findOne({user_id: item.req_user_id}, function(err, docs2) {
                if (err) { return next(err); }
                data2.push({
                  requested : false,
                  proposal_id : item.proposal_id,
                  proposal_stat : item.proposal_stat,
                  work_day : item.work_day,
                  work_hour: item.work_hour,
                  work_concept : item.work_concept,
                  work_price : item.work_price,
                  work_addr : item.work_addr[0],
                  user_id : item.res_user_id,
                  user_type : docs2.user_type,
                  username : docs2.username,
                  thumbnail_img : docs2.thumbnail_img
                });
                cb();
              });
            }
          }, function (err) {
            if (err) { return next(err); }
            var result = {
              data  : data2,
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
          success: 1,
          message: "요청서리스트 더보기입니다",
          data: result.data,
          now_page: result.page,
          total_page: total_page
        };
        res.json(final_result);
      });
    } else if (req_now_page == 1 && req_total_page == 0) {
      res.json({ success: 0, message: "주고받은 요청서가 없습니다." });
    } else {
      res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
    }
  } else {
    res.json({success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)"});
  }
});


// 5.4. 특정 요청서 보기
router.get('/:proposal_id', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.params.proposal_id;

  // 특정 요청서 검색
  ProposalModel.findOne({proposal_id: proposal_id}, function(err, docs) {
    if (err) { return next(err); }
    // 내가 해당 요청서의 주인인지 확인
    if (docs.req_user_id == token_user_id || docs.res_user_id == token_user_id) {
      if (token_user_id == docs.req_user_id) {
        // 내가 요청서를 보낸 사람 - 받은 사람의 정보 검색해서 보여주기
        UserModel.findOne({user_id: docs.res_user_id}, function(err, docs2) {
          if (err) { return next(err); }
	  var reviewed = false; // 내가 평가했는지 안했는지

	  if ((docs.rank.length == 1 && docs.rank[0].user_id == token_user_id) || docs.rank.length == 2) { reviewed = true; } 

          var data = {
            requested : true,
            proposal_id : docs.proposal_id,
            proposal_stat : docs.proposal_stat,
	    reviewed : reviewed, // 내가 평가했는지
            work_day : docs.work_day,
            work_hour: docs.work_hour,
            work_concept : docs.work_concept,
            work_price : docs.work_price,
            work_addr : docs.work_addr,
	    work_desc : docs.work_desc,
	    in_or_out : docs.in_or_out,
	    no_reason : docs.no_reason,
            user_id : docs.res_user_id,
            user_type : docs2.user_type,
            username : docs2.username,
            thumbnail_img : docs2.thumbnail_img,
	    average_rank : docs2.average_rank
          };

	  if (data.no_reason == undefined) { delete data.no_reason; }
  	  if (data.work_desc == undefined) { delete data.work_desc; }	  

	  var result = {
	    success : 1,
	    message : "요청서 상세조회입니다.",
	    data    : data
  	  };
	  res.json(result);
        });
      } else {
        // 내가 요청서를 받은 사람 - 보낸 사람의 정보 검색해서 보여주기
        UserModel.findOne({user_id: docs.req_user_id}, function(err, docs2) {
          if (err) { return next(err); }
	  var reviewed = false;

	  if ((docs.rank.length == 1 && docs.rank[0].user_id == token_user_id) || docs.rank.length == 2) { reviewed = true; }
	  
          var data = {
            requested : false,
            proposal_id : docs.proposal_id,
            proposal_stat : docs.proposal_stat,
	    reviewed : reviewed,
            work_day : docs.work_day,
            work_hour: docs.work_hour,
            work_concept : docs.work_concept,
            work_price : docs.work_price,
            work_addr : docs.work_addr,
	    work_desc : docs.work_desc,
	    in_or_out : docs.in_or_out,
	    no_reason : docs.no_reason,
            user_id : docs.req_user_id,
            user_type : docs2.user_type,
            username : docs2.username,
            thumbnail_img : docs2.thumbnail_img,
	    average_rank : docs2.average_rank
          };

	  if (data.no_reason == undefined) { delete data.no_reason; }
	  if (data.work_desc == undefined) { delete data.work_desc; }

	  var result = {
	    success : 1,
	    message : "요청서 상세조회입니다.",
	    data    : data
	  };
	  res.json(result);
        });
      }
    } else {
      res.json({ success: 0, message: "권한이 없습니다.(내가 요청했거나 요청받은 요청서가 아님)" });
    }
  });
});

router.get('/:proposal_id/review', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.params.proposal_id;
  var data;

  // 특정 요청서 검색
  ProposalModel.findOne({proposal_id: proposal_id}, function(err, docs) {
    if (err) { return next(err); }
    // 내가 해당 요청서의 주인인지 확인
    if (docs.req_user_id == token_user_id || docs.res_user_id == token_user_id) {
      // 평가개수 확인하기 - 평가가 하나인데 내가 한 거(내 평가를 보여주자)
      if (docs.rank.length == 1 && docs.rank[0].user_id == token_user_id) {
        UserModel.findOne({user_id: token_user_id}, function(err, docs2) {
          if (err) { return next(err); }
          data = [{
            user_id       : token_user_id,
            username      : docs2.username,
            user_type     : docs2.user_type,
            thumbnail_img : docs2.thumbnail_img,
            score         : docs.rank[0].score,
            comment       : docs.rank[0].comment
          }];
          res.json({
            success : 1,
            message : "나만 평가한 경우입니다.",
            data    : data
          });
        });
      } else if (docs.rank.length == 2) { // 평가를 둘 다 한 거
        UserModel.findOne({user_id: token_user_id}, function(err, docs2) {
          if (err) { return next(err); }
          /*
          var reviewFunc = function(his, my) {
            data = [{
              user_id: docs3.user_id,
              username: docs3.username,
              user_type: docs3.user_type,
              thumbnail_img: docs3.thumbnail_img,
              score: docs.rank[his].score,
              comment: docs.rank[his].comment
            }, {
              user_id : docs2.user_id, // 내정보들과
              username : docs2.username,
              user_type: docs2.user_type,
              thumbnail_img: docs2.thumbnail_img,
              score : docs.rank[my].score, // 내가 첫번째로 평가했으니까.
              comment: docs.rank[my].comment
            }];
            res.json({
              success: 1,
              message: "평가 2개 자세히보기",
              data: data
            });
          }
          */

          if (token_user_id == docs.req_user_id) { // 내가 요청한 사람(상대방이 요청받은 사람)
            UserModel.findOne({user_id: docs.res_user_id}, function(err, docs3) {
              if (err) { return next(err); }
              // 내가 첫 번째로 평가한 사람인가?
              if (token_user_id == docs.rank[0].user_id) {
                // reviewFunc(1, 0);
                
                data = [{
                  user_id: docs3.user_id,
                  username: docs3.username,
                  user_type: docs3.user_type,
                  thumbnail_img: docs3.thumbnail_img,
                  score: docs.rank[1].score,
                  comment: docs.rank[1].comment
                }, {
                  user_id : docs2.user_id, // 내정보들과
                  username : docs2.username,
                  user_type: docs2.user_type,
                  thumbnail_img: docs2.thumbnail_img,
                  score : docs.rank[0].score, // 내가 첫번째로 평가했으니까.
                  comment: docs.rank[0].comment
                }];
                res.json({
                  success: 1,
                  message: "평가 2개 자세히보기",
                  data: data
                });
              } else { // 내가 두 번째로 평가한 사람.
                // reviewFunc(0, 1);
                
                data = [{
                  user_id: docs3.user_id,
                  username: docs3.username,
                  user_type: docs3.user_type,
                  thumbnail_img: docs3.thumbnail_img,
                  score: docs.rank[0].score,
                  comment: docs.rank[0].comment
                }, {
                  user_id : docs2.user_id, // 내정보들과
                  username : docs2.username,
                  user_type: docs2.user_type,
                  thumbnail_img: docs2.thumbnail_img,
                  score : docs.rank[1].score, // 내가 첫번째로 평가했으니까.
                  comment: docs.rank[1].comment
                }];
                res.json({
                  success: 1,
                  message: "평가 2개 자세히보기",
                  data: data
                });
                
              }
            });
          } else { // 내가 요청받은 사람(상대방이 요청한 사람
            UserModel.findOne({user_id: docs.req_user_id}, function(err, docs3) {
              if (err) { return next(err); }
              // 내가 첫 번째로 평가한 사람인가?
              if (token_user_id == docs.rank[0].user_id) {
                // reviewFunc(1, 0);
                
                data = [{
                  user_id: docs3.user_id,
                  username: docs3.username,
                  user_type: docs3.user_type,
                  thumbnail_img: docs3.thumbnail_img,
                  score: docs.rank[1].score,
                  comment: docs.rank[1].comment
                }, {
                  user_id : docs2.user_id, // 내정보들과
                  username : docs2.username,
                  user_type: docs2.user_type,
                  thumbnail_img: docs2.thumbnail_img,
                  score : docs.rank[0].score, // 내가 첫번째로 평가했으니까.
                  comment: docs.rank[0].comment
                }];
                res.json({
                  success: 1,
                  message: "평가 2개 자세히보기",
                  data: data
                });
                
              } else { // 내가 두 번째로 평가한 사람.
                // reviewFunc(0, 1);
                
                data = [{
                  user_id: docs3.user_id,
                  username: docs3.username,
                  user_type: docs3.user_type,
                  thumbnail_img: docs3.thumbnail_img,
                  score: docs.rank[0].score,
                  comment: docs.rank[0].comment
                }, {
                  user_id : docs2.user_id, // 내정보들과
                  username : docs2.username,
                  user_type: docs2.user_type,
                  thumbnail_img: docs2.thumbnail_img,
                  score : docs.rank[1].score, // 내가 첫번째로 평가했으니까.
                  comment: docs.rank[1].comment
                }];
                res.json({
                  success: 1,
                  message: "평가 2개 자세히보기",
                  data: data
                });
                
              }
            });
          }
        });
      } else { // 내가 안 한거
        res.json({ success : 0, message : "내가 평가를 하지 않았습니다." });
      }
    } else {
      res.json({ success: 0, message: "권한이 없습니다.(내가 요청했거나 요청받은 요청서가 아님)" });
    }
  });
});

/*
router.get('/:proposal_id/review', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.params.proposal_id;

  // 특정 요청서 검색
  ProposalModeL.findOne({proposal_id: proposal_id}, function(err, docs) {
    if (err) { return next(err); }
    // 내가 해당 요청서의 주인인지 확인
    if (docs.req_user_id == token_user_id || docs.res_user_id == token_user_id) {
      if (token_user_id == docs.req_user_id) {
        // 내가 요청서를 보낸 사람 - 받은 사람의 정보 검색해서 보여주기
        UserModel.findOne({user_id: docs.res_user_id}, function(err, docs2) {
          if (err) { return next(err); }
          UserModel.findOne({user_id: token_user_id}, function(err, docs3) {
            if (err) { return next(err); }
            var data = {
              rank : docs.rank,
              you : docs2,
              me : docs3
            };
            res.json({
              success : 1,
              message : "요청서에 대한 평가내역입니다.",
              data    : data
            });
          });
        });
      } else {
        // 내가 요청서를 받은 사람
      }
    } else {
      res.json({ success: 0, message: "권한이 없습니다.(내가 요청했거나 요청받은 요청서가 아님)" });
    }
  });
});
*/

router.post('/:proposal_id/yes', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.params.proposal_id;

  ProposalModel.findOne({ proposal_id: proposal_id }, function(err, docs) {
    if (err) { return next(err); }
    // 본인이 요청서를 받은 사람인지, 요청서의 상태가 '승인대기중(pending)'인지 확인
    if (token_user_id == docs.res_user_id && docs.proposal_stat == "P") {
      // 요청서의 상태: 승인(Y, yes)
      var data = { proposal_stat : "Y" };
      ProposalModel.findOneAndUpdate({ proposal_id: proposal_id }, {$set: data}, function(err, doc) {
        if (err) { return next(err); }
// 푸시시작
        UserModel.findOne({user_id: docs.req_user_id}, function(err, docs2) {
          if (err) { return next(err); }

          var registrationIds = [];

          var message = new gcm.Message({
            collapseKey : 'demo',
            delayWhileIdle : true,
            timeToLive : 3,
            data : {
              type : 'proposal',
              id : docs.proposal_id,
              message : '상대방이 요청서를 승인했습니다.'
            }
          });
          var token = docs2.gcm_token;
          registrationIds.push(token);

	
	  if (token) {
            sender.send(message, registrationIds, 4, function(err, result) {
              if (err) { return next(err); }
              res.json({ success: 1, message: "요청서를 승인했습니다." });
            });
	  } else {
	    res.json({ success: 1, message: "요청서를 승인했습니다." });
	  }
        });
// 푸시 끝
        // res.json({ success: 1, message: "요청서를 승인했습니다." });
      });
    } else {
      res.json({ success: 0, message: "요청서를 승인할 수 없습니다.(내가 요청받은 사람이 아니거나 요청서의 상태가 '승인대기중'이 아닐 경우)" });
    }
  });
});

// 5-7. Proposal No(요청서 거절하기)
router.post('/:proposal_id/no', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.params.proposal_id;
  var no_reason = req.body.no_reason;

  ProposalModel.findOne({ proposal_id: proposal_id}, function(err, docs) {
    if (err) { return next(err); }
    // 본인이 요청서를 받은 사람인지, 요청서의 상태가 '승인대기중(pending)'인지 확인
    if (token_user_id == docs.res_user_id && docs.proposal_stat == "P") {
      // 요청서 거절(N, no) + 거절사유(no_reason)
      var data = { proposal_stat : "N", no_reason : no_reason };
      ProposalModel.findOneAndUpdate({ proposal_id: proposal_id }, { $set: data }, function(err, doc) {
        if (err) { return next(err); }
// 푸시 시작
	UserModel.findOne({user_id: docs.req_user_id}, function(err, docs2) {
          if (err) { return next(err); }

          var registrationIds = [];

          var message = new gcm.Message({
            collapseKey : 'demo',
            delayWhileIdle : true,
            timeToLive : 3,
            data : {
              type : 'proposal',
              id : docs.proposal_id,
              message : '상대방이 요청서를 거절했습니다.'
            }
          });

          var token = docs2.gcm_token;
          registrationIds.push(token);

	  if (token) {
            sender.send(message, registrationIds, 4, function(err, result) {
              if (err) { return next(err); }
              res.json({ success: 1, message: "요청서를 거절했습니다." });
            });
	  } else {
	    res.json({ success: 1, message: "요청서를 거절했습니다." });
	  }
        });
// 푸시 끝
        // res.json({ success: 1, message: "요청서를 거절했습니다."})
      });
    } else {
      res.json({ success: 0, message: "요청서를 거절할 수 없습니다.(내가 요청받은 사람이 아니거나 요청서의 상태가 '승인대기중'이 아닐 경우)" });
    }
  });
});

// 5.8. rank(작업상대방 평가하기)
// score는 무조건 입력받아야 함. 그리고 1~5 사이의 자연수.
router.post('/:proposal_id/review', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.params.proposal_id;

  // sendReview(평가하기 함수) 시작
  var sendReview = function() {
    var score = req.body.score;
    var comment = req.body.comment; // 선택 정보
    var rank = { user_id: token_user_id, score: score, comment: comment };
    if (comment == undefined) { delete rank.comment; } // 선택정보 에러처리

    var rankSum = 0;
    var final_average_rank = 0;

    ProposalModel.findOneAndUpdate({ proposal_id: proposal_id }, {$push: {"rank": rank}}, {new: true}, function(err, doc) {
      if (err) { return next(err); }
      if (doc.rank.length == 1) {

        // 평균점수 다시 업데이트하는 함수 시작
        var averageRankFunc = function(target) {
          async.waterfall([
            function(callback) {
              UserModel.findOneAndUpdate({user_id: target}, {$push: {"rank": rank}}, {new: true}, function(err, doc2) {
                if (err) { return next(err); }
                callback(null, doc2);
              });
            },
            function(arg1, callback) {
              async.each(arg1.rank, function(item, cb) {
                rankSum = rankSum + parseInt(item.score);
                cb();
              }, function(err) {
                if (err) { return next(err); }
                var final_rank = (rankSum / arg1.rank.length);
                
                if (final_rank == 0) {
                  final_average_rank = 0;
                } else if (final_rank <= 0.5) {
                  final_average_rank = 0.5;
                } else if (final_rank <= 1) {
                  final_average_rank = 1;
                } else if (final_rank <= 1.5) {
                  final_average_rank = 1.5;
                } else if (final_rank <= 2) {
                  final_average_rank = 2;
                } else if (final_rank <= 2.5) {
                  final_average_rank = 2.5;
                } else if (final_rank <= 3) {
                  final_average_rank = 3;
                } else if (final_rank <= 3.5) {
                  final_average_rank = 3.5;
                } else if (final_rank <= 4) {
                  final_average_rank = 4;
                } else if (final_rank <= 4.5) {
                  final_average_rank = 4.5;
                } else if (final_rank <= 5) {
                  final_average_rank = 5;
                } else {
                  final_average_rank = 0;
                }
                callback(null, final_average_rank);
              });
            }
          ], function(err, result) {
            if (err) { return next(err); }
            UserModel.findOneAndUpdate({user_id: target}, {$set: {average_rank: result}}, function(err, doc3) {
              if (err) { return next(err); }
              res.json({ success: 1, message: "평가를 완료했습니다." });
            });
          });
        };
        // 평균점수 다시 업데이트하는 함수끝

        if (token_user_id == doc.req_user_id) { // 내가 요청한 유저
          averageRankFunc(doc.res_user_id);
        } else { // 내가 요청받은 유저
          averageRankFunc(doc.req_user_id);
        }
      } else if (doc.rank.length == 2) {

        // 평균점수 다시 업데이트하는 함수2 시작
        var averageRankFunc2 = function(target) {
          var data = { proposal_stat : "E" }; // 요청서 상태: E(Evaluation done, 평가까지 완료)
          ProposalModel.findOneAndUpdate({ proposal_id: proposal_id}, { $set: data }, function(err, doc) {
            if (err) { return next(err); }
            // 채팅창도 비활성화시켜야겠네. docs.chat_id로 찾아서 + findOneAndUpdate(chat_stat=false)
            async.waterfall([
              function(callback) {
                UserModel.findOneAndUpdate({user_id: target}, {$push: {"rank": rank}}, {new: true}, function(err, doc3) {
                  if (err) { return next(err); }
                  callback(null, doc3);
                });
              },
              function(arg1, callback) {
                async.each(arg1.rank, function(item, cb) {
                  rankSum = rankSum + parseInt(item.score);
                  cb();
                }, function(err) {
                  if (err) { return next(err); }
		  var final_rank = (rankSum / arg1.rank.length);

                  if (final_rank == 0) {
                    final_average_rank = 0;
                  } else if (final_rank <= 0.5) {
                    final_average_rank = 0.5;
                  } else if (final_rank <= 1) {
                    final_average_rank = 1;
                  } else if (final_rank <= 1.5) {
                    final_average_rank = 1.5;
                  } else if (final_rank <= 2) {
                    final_average_rank = 2;
                  } else if (final_rank <= 2.5) {
                    final_average_rank = 2.5;
                  } else if (final_rank <= 3) {
                    final_average_rank = 3;
                  } else if (final_rank <= 3.5) {
                    final_average_rank = 3.5;
                  } else if (final_rank <= 4) {
                    final_average_rank = 4;
                  } else if (final_rank <= 4.5) {
                    final_average_rank = 4.5;
                  } else if (final_rank <= 5) {
                    final_average_rank = 5;
                  } else {
                    final_average_rank = 0;
                  }
                  callback(null, final_average_rank);
                });
              }
            ], function(err, result) {
              if (err) { return next(err); }
              UserModel.findOneAndUpdate({user_id: target}, {$set: {average_rank: result}}, function(err, doc3) {
                if (err) { return next(err); }
	        if (doc.chat_id) {
	          ChatModel.findOneAndUpdate({proposal_id: proposal_id}, {$set: {chat_stat: false}}, function(err, doc2) {
	      	    if (err) { return next(err); }
                    res.json({ success: 1, message: "평가를 완료했습니다." });
                  });
	        } else {
		  res.json({ success: 1, message: "평가를 완료했습니다." });
                }
	      });
            });
          });
        };
        // 평균점수 다시 업데이트하는 함수 끝

        if (token_user_id == doc.req_user_id) { // 내가 요청한 유저
          averageRankFunc2(doc.res_user_id);
        } else { // 내가 요청받은 유저
          averageRankFunc2(doc.req_user_id);
        }
      } else {
        res.json({ success: 0, message: "알 수 없는 문제가 발생했습니다." });
      }
    });
  };
  // sendReview(평가하기 함수) 끝

  ProposalModel.findOne({ proposal_id: proposal_id }, function(err, docs) {
    if (err) { return next(err); }
    if ((token_user_id == docs.req_user_id || token_user_id == docs.res_user_id) && docs.proposal_stat == "D" && docs.rank.length == 0) {
      // 내가 관련된 요청서이면서, 요청서의 상태가 작업완료(D)이고, 아무도 평가하지 않았을 때
      sendReview();
    } else if ((token_user_id == docs.req_user_id || token_user_id == docs.res_user_id) && docs.proposal_stat == "D" && docs.rank.length == 1 && token_user_id !== docs.rank[0].user_id) {
      // 내가 관련된 요청서이면서, 요청서의 상태가 작업완료(D)이고, 한 명이 평가했지만 그게 내가 아니라 상대방일 때
      sendReview();
    } else {
      res.json({ success: 0, message: "평가를 할 수 없습니다. "});
    }
  });
});






/*
// 5.8. rank(작업상대방 평가하기)
// score는 무조건 입력받아야 함. 그리고 1~5 사이의 자연수.
router.post('/:proposal_id/review', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.params.proposal_id;

  // sendReview(평가하기 함수) 시작
  var sendReview = function() {
    var score = req.body.score;
    var comment = req.body.comment; // 선택 정보
    var rank = { user_id: token_user_id, score: score, comment: comment };
    if (comment == undefined) { delete rank.comment; } // 선택정보 에러처리

    ProposalModel.findOneAndUpdate({ proposal_id: proposal_id }, {$push: {"rank": rank}}, {new: true}, function(err, doc) {
      if (err) { return next(err); }
      if (doc.rank.length == 1) {
        res.json({ success: 1, message: "평가를 완료했습니다." });
      } else if (doc.rank.length == 2) {
        var data = { proposal_stat : "E" }; // 요청서 상태: E(Evaluation done, 평가까지 완료)
        ProposalModel.findOneAndUpdate({ proposal_id: proposal_id}, { $set: data }, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message: "평가를 완료했습니다." });
          // 채팅창도 비활성화시켜야겠네. docs.chat_id로 찾아서 + findOneAndUpdate(chat_stat=false)
        });
      } else {
        res.json({ success: 0, message: "알 수 없는 문제가 발생했습니다." });
      }
    });
  };
  // sendReview(평가하기 함수) 끝

  ProposalModel.findOne({ proposal_id: proposal_id }, function(err, docs) {
    if (err) { return next(err); }
    if ((token_user_id == docs.req_user_id || token_user_id == docs.res_user_id) && docs.proposal_stat == "D" && docs.rank.length == 0) {
      // 내가 관련된 요청서이면서, 요청서의 상태가 작업완료(D)이고, 아무도 평가하지 않았을 때
      sendReview();
    } else if ((token_user_id == docs.req_user_id || token_user_id == docs.res_user_id) && docs.proposal_stat == "D" && docs.rank.length == 1 && token_user_id !== docs.rank[0].user_id) {
      // 내가 관련된 요청서이면서, 요청서의 상태가 작업완료(D)이고, 한 명이 평가했지만 그게 내가 아니라 상대방일 때
      sendReview();
    } else {
      res.json({ success: 0, message: "평가를 할 수 없습니다. "});
    }
  });
});
*/




/*
// 매시 5초마다 작업이 완료된 시간을 검색(Y인데 시간이 지난 것)해서 proposal_stat을 D로 업데이트하고 평가를 해달라고 푸시메시지 send
var cronjob = schedule.scheduleJob('55 00 * * * *', function(){
  var right_now = moment(Date.now()).format();
  var data = [];

  async.waterfall([
    function(callback) {
      ProposalModel.find({
        $and: [
          {proposal_stat: "Y"},
          {end_time: {$lte: right_now}}
        ]
      }, function (err, docs) {
        if (err) { return next(err); }
        docs.forEach(function(doc) {
          data.push(
            doc.proposal_id
          );
        });
        callback(null, data);
      });
    },
    function(arg1, callback) {
      async.each(arg1, function(item, cb) {
        ProposalModel.findOneAndUpdate({proposal_id: item}, {$set: {proposal_stat: "D"}}, function(err, doc) {
          if (err) { return next(err); }
          console.log(doc);
        });
        cb();
      }, function(err) {
        if (err) { return next(err); }
        callback(null, data);
      });
    }
  ], function(err, result) {
    if (err) { return next(err); }
    console.log(result);
  });
});
*/

module.exports = router;

var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment-timezone');
var _ = require('underscore');

var gcm = require('node-gcm');
var server_api_key = 'AIzaSyDBon20wR74S5mzKTzv5ixkHDWuEf7uujg';
var sender = new gcm.Sender(server_api_key);

var db = require('../models/db');
require('../models/proposalmodel');
require('../models/usermodel');
require('../models/chatmodel');
var ProposalModel = db.model('Proposal');
var UserModel = db.model('User');
var ChatModel = db.model('Chat');

function isNaturalNumber (str) {
  var pattern = /^(0|([1-9]\d*))$/;
  return pattern.test(str);
}

// 6.1. 채팅리스트 조회
// 비어 있을 때 사람들 보여주는 거 - 썸네일 있는 작가/모델 보여주자
router.get('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;

  var per_page = 5;
  var req_now_page = req.query.now_page;
  var req_total_page = req.query.total_page;

  var data = [];
  var people_number = 5;

  // asyncFunc 함수 시작
  var asyncFunc = function(page_num, message) {
    async.waterfall([
      function(callback) {
        ChatModel.paginate({$or: [{req_user_id: token_user_id}, {res_user_id: token_user_id}]}, {sort: {last_time: -1}, limit: per_page, page: page_num}, function(err, docs) {
          if (err) { return next(err); }
          callback(null, docs);
        });
      },
      function(arg1, callback) {
        async.each(arg1.docs, function(item, cb) {

          // getChat 함수 시작
          var getChat = function(search_user_id) {
            UserModel.findOne({user_id: search_user_id}, function(err, docs2) {
              if (err) { return next(err); }

	      // var last_time = moment.tz(item.message[item.message.length-1].time, "Asia/Seoul").format(); 
	
	      var message_content;
	      var message_time;
	      var empty = false;

	      if (item.message.length != 0) {
		message_content = item.message[item.message.length-1].content;
		message_time = moment.tz(item.message[item.message.length-1].time, "Asia/Seoul").format();
	      } else {
		message_content = null;
		message_time = null;
		empty = true;
	      }

              data.push({
                chat_id : item.chat_id,
                chat_stat : item.chat_stat,
                proposal_id : item.proposal_id,
                user_id : search_user_id,
                user_type : docs2.user_type,
                username : docs2.username,
                thumbnail_img : docs2.thumbnail_img,
		message_content : message_content,
                message_time : message_time,
		empty : empty
              });
              cb();
            });
          };
          // getChat 함수 끝

          if (token_user_id == item.req_user_id) {
            getChat(item.res_user_id);
          } else {
            getChat(item.req_user_id);
          }
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

  // 내가 채팅을 주고받은 사람이 한 명도 없으면
  
  ChatModel.find({$or: [{req_user_id: token_user_id}, {res_user_id: token_user_id}]}, function(err, docs3) {
    // 시작된 채팅이 하나도 없거나, 채팅방이 생성되어도 주고받은 메시지가 없는 경우
    if (docs3.length == 0 || docs3[0].message == undefined) {
      res.json({
        success : 2,
        message : "모카가 추천하는 모델과 작가를 만나보세요!"
      });
    } else { 
      if (req_now_page == undefined && req_total_page == undefined) {
        // 채팅 최상단 페이지
        asyncFunc(1, "채팅리스트 최상단페이지입니다.");
      } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
        if (req_now_page == req_total_page) {
          res.json({ success: 0, message: "더 가져올 채팅방이 없습니다." });
        } else if (req_now_page < req_total_page) {
          // 채팅 더 불러오기
          var new_page = parseInt(req_now_page) + 1;
          asyncFunc(new_page, "채팅리스트더보기.");
        } else if (req_now_page == 1 && req_total_page == 0) {
          res.json({ success: 0, message: "주고받은 채팅이 없습니다.(채팅이 아무것도 없는ㅠ)" });
        } else {
          res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
        }
      } else {
        res.json({success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)"});
      }
    }
  });
});

router.get('/nolist', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var data = [];  
  var pg_number = 3;
  var md_number = 2;

  UserModel.find({
    $and: [
      {user_id: {$ne: token_user_id}}, 
      {user_type: "P"},
      {thumbnail_img: {$ne: null}}
    ]
  }).limit(pg_number).exec(function(err, docs) {
    UserModel.find({
      $and: [
	{user_id: {$ne: token_user_id}},
        {user_type: "M"},
        {thumbnail_img: {$ne: null}}
      ]
    }).limit(md_number).exec(function(err, docs2) {
      data[0] = {
        user_id : docs[0].user_id,
        username : docs[0].username,
        user_type : docs[0].user_type,
        thumbnail_img : docs[0].thumbnail_img
      };
      data[2] = {
        user_id : docs[1].user_id,
        username : docs[1].username,
        user_type : docs[1].user_type,
        thumbnail_img : docs[1].thumbnail_img
      };
      data[4] = {
        user_id : docs[2].user_id,
        username : docs[2].username,
        user_type : docs[2].user_type,
        thumbnail_img : docs[2].thumbnail_img
      };
      data[1] = {
        user_id : docs2[0].user_id,
        username : docs2[0].username,
        user_type : docs2[0].user_type,
        thumbnail_img : docs2[0].thumbnail_img
      };
      data[3] = {
        user_id : docs2[1].user_id,
        username : docs2[1].username,
        user_type : docs2[1].user_type,
        thumbnail_img : docs2[1].thumbnail_img
      };
/*
      docs.forEach(function(doc) {
        data.push({
          user_id : doc.user_id,
          username : doc.username,
          user_type : doc.user_type,
          thumbnail_img : doc.thumbnail_img
        });
      });
      docs2.forEach(function(doc) {
        data.push({
          user_id : doc.user_id,
          username : doc.username,
          user_type : doc.user_type,
          thumbnail_img : doc.thumbnail_img
        });
      });
*/
      res.json({
        success : 1,
        message : "채팅상태가 없을 때 랜덤하게 추천되는 5명",
        data    : data
      });
    });
  });

/*
  UserModel.find({
    $and: [
      {$or: [{user_type: "P"}, {user_type: "M"}]},
      {thumbnail_img:{$ne: null}}
    ]
  }).limit(people_number).exec(function(err, docs) {
    docs.forEach(function(doc) {
      data.push({
        user_id       : doc.user_id,
        username      : doc.username,
        user_type     : doc.user_type,
        thumbnail_img : doc.thumbnail_img
      });
    });
    res.json({
      success : 1,
      message : "채팅상대가 없을 때 랜덤하게 추천되는 5명",
      data    : data
    });
  });
*/
});

// 6.2. 채팅 시작하기(open new chatroom)
router.post('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var proposal_id = req.body.proposal_id;

  ProposalModel.findOne({proposal_id: proposal_id}, function(err, docs1) {
    if (err) { return next(err); }
    // 채팅시작조건 - 요청서가 승인대기중(P)이면서 내가 요청받은 유저. 혹은 승인(Y)된 요청서.
    if ((docs1.proposal_stat == "P" && docs1.res_user_id == token_user_id) || docs1.proposal_stat == "Y") {
      ChatModel.findOne({proposal_id: proposal_id}, function(err, docs2) {
        if (err) { return next(err); }
        // 기존의 채팅이 있는지 확인 - 기존의 채팅이 있으면 기존 정보를 보여주자
        if (docs2) {

          // getChat 함수 시작
          var getChat = function(search_user_id) {
            UserModel.findOne({user_id: search_user_id}, function(err, docs5) {
              if (err) { return next(err) }
              var previous_chat_data = {
                chat_id       : docs2.chat_id,
		chat_stat     : docs2.chat_stat,
                message       : docs2.message, // 근데 최신 몇 개만 보여줘야하지 않나?
                user_id       : docs5.user_id,
                username      : docs5.username,
                user_type     : docs5.user_type,
                thumbnail_img : docs5.thumbnail_img,
                age           : docs5.age,
                average_rank  : docs5.average_rank,
                concept       : docs1.work_concept,
                address       : docs1.work_addr[0]
              };
              res.json({
                success : 1,
                message : "채팅방으로 이동합니다.",
                data    : previous_chat_data
              });
            });
          };
          // getChat 함수 끝

          if (token_user_id == docs1.res_user_id) {
            // 만약 내가 요청받은 유저
            getChat(docs1.req_user_id);
          } else {
            // 만약 내가 요청한 유저
            getChat(docs1.res_user_id);
          }
        } else {
          // 기존의 채팅이 없으면 채팅방을 생성하고 관련 정보를 보여주자.
          var time_now = moment.tz(moment(Date.now()), "Asia/Seoul").format();	  

          var data = new ChatModel({
            proposal_id : proposal_id,
            req_user_id : docs1.req_user_id,
            res_user_id : docs1.res_user_id,
	    last_time   : time_now
          });
          data.save(function(err, docs3) {
            if (err) { return next(err); }

            // createChat 함수 시작
            var createChat = function(search_user_id) {
              var chatdata = { chat_id : docs3.chat_id };
              // 요청서에 연관된 chat_id 추가하기
              ProposalModel.findOneAndUpdate({proposal_id: proposal_id}, {$set: chatdata}, function(err, docs5) {
                if (err) { return next(err); }
                // 채팅에서 세부 내용 볼 수 있도록 상대방 정보 주기
                UserModel.findOne({user_id: search_user_id}, function (err, docs4) {
                  if (err) { return next(err); }

                  var new_chat_data = {
		    chat_id       : docs3.chat_id, // 바로뽑히는 chat_id
		    chat_stat     : true,
		    message       : docs3.message, // 없으면 빈배열로 나옴
                    user_id       : docs4.user_id,
                    username      : docs4.username,
                    user_type     : docs4.user_type,
                    thumbnail_img : docs4.thumbnail_img,
                    age           : docs4.age,
                    average_rank  : docs4.average_rank,
 		    concept       : docs1.work_concept, // 포트폴리오에서 뽑은 정보
                    address       : docs1.work_addr[0] // 포트폴리오에서 뽑은 정보
                  };
                  res.json({
                    success : 1,
                    message : "채팅을 시작합니다.",
                    data    : new_chat_data
                  });
                });
              });
            };
            // createChat 함수 끝

            if (token_user_id == docs1.res_user_id) {
              // 내가 요청서를 받은 사람이면 채팅을 만들고 나서 요청서를 보낸 사람의 정보를 넣어서 보여줘
              createChat(docs1.req_user_id);
            } else {
              // 내가 요청서를 보낸 사람이면 채팅을 만들고 나서 요청서를 받은 사람의 정보를 넣어서 보여줘
              createChat(docs1.res_user_id);
            }
          });
        }
      });
    } else {
      res.json({ success: 0, message: "채팅을 시작할 수 없습니다.(요청서의 상태가 P 또는 Y가 아니거나 내가 요청한 사람)" });
    }
  });
});


router.post('/:chat_id/send', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var chat_id = req.params.chat_id;
  var content = req.body.content;

  ChatModel.findOne({chat_id: chat_id}, function(err, docs) {
    if (err) { return next(err); }
    // 내가 채팅방의 주인인지 확인
    if (docs.req_user_id == token_user_id || docs.res_user_id == token_user_id) {
      // 활성화된 채팅방인지 확인
      var time_now = moment.tz(moment(Date.now()), "Asia/Seoul").format();

      if (docs.chat_stat == true) {
        var data = {
          user_id : token_user_id,
          content : content,
          time : time_now // 이게 되려나ㅠㅠ
        };
        // DB에 보낸메시지 저장
        ChatModel.findOneAndUpdate({chat_id: chat_id}, {$push: {"message": data}}, {new: true}, function(err, doc) {
          if (err) { return next(err); }
          var data2 = {
            last_time : doc.message[doc.message.length-1].time
          };
          // 가장 최신 날짜 업데이트
          ChatModel.findOneAndUpdate({chat_id: chat_id}, {$set: data2}, function(err, doc) {
            if (err) { return next(err); }

	    var chatPushFunc = function(gcm_token) {
	      var registrationIds = [];

              var message = new gcm.Message({
                collapseKey : 'demo',
                delayWhileIdle : true,
                timeToLive : 10,
                data : {
                  type : 'chat',
                  id : docs.chat_id,
                  message : '상대방이 채팅메시지를 보냈습니다.'
                }
              });

              var token = gcm_token;
              registrationIds.push(token);

              sender.send(message, registrationIds, 10, function(err, result) {
                if (err) { return next(err); }

		var data_in_array = [];
	        data_in_array.push(data);

                res.json({ 
		  success: 1, 
		  message: "채팅메시지를 보냈습니다.",
		  data : data_in_array
		 });
              });
	    }

	    if (docs.req_user_id == token_user_id) {
	      UserModel.findOne({user_id: docs.res_user_id}, function(err, docs2) {
		if (err) { return next(err); }
	        chatPushFunc(docs2.gcm_token);
	      });
	    } else {
              UserModel.findOne({user_id: docs.req_user_id}, function(err, docs2) {
		if (err) { return next(err); }
		chatPushFunc(docs2.gcm_token);
	      });
            }
          });
        });
      } else {
        res.json({ success: 0, message: "채팅을 할 수 없는 채팅방입니다.(이미 작업종료됨)" });
      }
    } else {
      res.json({ success: 0, message: "권한이 없습니다.(내가 요청했거나 요청받은 요청서가 아님)" });
    }
  });
});

// 6.4. 채팅 상세히 보기
// message들 몇 개씩 끊어서 보여줄지 결정이 필요.
router.get('/:chat_id', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var chat_id = req.params.chat_id;
  var last_time = req.query.last_time;
  var first_time = req.query.first_time;
/*
  if (last_time == undefined && first_time == undefined) {
    console.log("그냥 줘");
  } else if (last_time && first_time == undefined) {
    console.log("최신 것 줘");
  } else if (last_time == undefined && first_time) {
    console.log("옛날 것 줘");
  } else {
    console.log("옳지 않은 요청");
  }
*/
  if (last_time == undefined && first_time == undefined) {
    ChatModel.findOne({chat_id: chat_id}, function(err, docs) {
      if (err) { return next(err); }
      ProposalModel.findOne({proposal_id: docs.proposal_id}, function(err, docs2) {
        if (err) { return next(err); }
        // 내가 채팅(요청서)의 주인인지 확인
        if (docs.req_user_id == token_user_id || docs.res_user_id == token_user_id) {

          var getChat = function(search_user_id) {
            UserModel.findOne({user_id: search_user_id}, function(err, docs3) {
              if (err) { return next(err); }
              var data = {
                chat_id       : docs.chat_id,
                chat_stat     : docs.chat_stat,
                proposal_id   : docs.proposal_id,
                message       : docs.message,
                user_id       : search_user_id,
                username      : docs3.username,
                user_type     : docs3.user_type,
                thumbnail_img : docs3.thumbnail_img,
                age           : docs3.age,
                concept       : docs2.work_concept,
                address       : docs2.work_addr[0],
                average_rank  : docs3.average_rank
              };
              var result = {
                success : 1,
                message : "채팅 상세조회입니다.",
                data    : data
              };
              res.json(result);
            });
          };

          if (docs.req_user_id == token_user_id) {
            // 내가 요청을 보낸 사람 - 요청을 받은 사람의 정보가 필요
            getChat(docs.res_user_id);
          } else {
            // 내가 요청을 받은 사람 - 요청을 보낸 사람의 정보가 필요
            getChat(docs.req_user_id);
          }
        } else {
          res.json({ success: 0, message: "권한이 없습니다.(내가 요청했거나 요청받은 요청서가 아님)" });
        }
      });
    });
  } else if (last_time && first_time == undefined) {
    var real_last_time = moment.tz(last_time, "Asia/Seoul").format();
    ChatModel.findOne({"chat_id" : chat_id}, function(err, docs9) {
      if (err) { return next(err); }

      var superdata = docs9.message[docs9.message.length-1];

      res.json({
	success: 1, 
	message: "최신메시지입니다.",
	data : [superdata]
      });      
      /* 
      var message_array = docs9.message; // message를 배열에 담고

      for (var i = 0; i < message_array.length; i++) {
	if (message_array[i].time == real_last_time) {
	  var indexNum = i + 1;
	  var data9 = _.rest(message_array, indexNum);

	  res.json({
	    success: 1,
	    message: "최신메시지입니다.",
	    data: data9
	  });
	}
      }
      */
    });
  } else if (last_time == undefined && first_time) {
    console.log("옛날 것 줘");
  } else {
    console.log("옳지않은 요청");
  }
});

module.exports = router;


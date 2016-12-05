var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment-timezone');

var db = require('../models/db');
require('../models/usermodel');
require('../models/bookmodel');
require('../models/proposalmodel');
var UserModel = db.model('User');
var BookModel = db.model('Book');
var ProposalModel = db.model('Proposal');

// 이미지 업로드 셋팅
var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';
var s3 = new AWS.S3();

// 2.1. 모델리스트
router.get('/models', function(req, res, next) {
  var req_now_page = req.query.now_page;
  var req_total_page = req.query.total_page;
  var per_page = 5;

  // 자연수 정규식
  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

  if (req_now_page == undefined && req_total_page == undefined) {
    UserModel.paginate({user_type: "M"}, {sort: {user_id: -1}, limit: per_page, page: 1}, function(err, docs) {
      if (err) { return next(err); }
      var data = [];
      docs.docs.forEach(function(doc) {
        data.push({
          user_id       : doc.user_id,
          username      : doc.username,
          thumbnail_img : doc.thumbnail_img,
          age           : doc.age,
          concept       : doc.concept_price[0].concept,
          wanted_addr   : doc.wanted_addr[0],
          average_rank  : doc.average_rank // 평점.
        });
      });

      var total_page = Math.ceil(docs.total / docs.limit);
      var now_page = docs.page;

      res.json({
        success: 1,
        message: "모델리스트 최상단 리스트입니다.",
        data: data,
        now_page: now_page,
        total_page: total_page
      });
    });
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    if (req_now_page == req_total_page) {
      res.json({ success: 0, message: "더 가져올 모델리스트가 없습니다." })
    } else if (req_now_page < req_total_page) {
      var data = [];
      var new_page = parseInt(req_now_page) + 1;

      UserModel.paginate({user_type: "M"}, {sort: {user_id: -1}, limit: per_page, page: new_page}, function(err, docs) {
        if (err) { return next(err); }

        docs.docs.forEach(function(doc) {
          data.push({
            user_id : doc.user_id,
            username : doc.username,
            thumbnail_img : doc.thumbnail_img,
            age           : doc.age,
            concept       : doc.concept_price[0].concept,
            wanted_addr   : doc.wanted_addr[0],
            average_rank  : doc.average_rank // 평점.
          });
        });
        var total_page = Math.ceil(docs.total / docs.limit);
        var now_page = docs.page;

        res.json({
          success: 1,
          message: "모델리스트 더 불러오기입니다.",
          data: data,
          now_page: now_page,
          total_page : total_page
        });
      });
    } else {
      res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
    }
  } else {
    res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)" });
  }
});

// 2.5. 작가리스트
router.get('/photographers', function(req, res, next) {
  var req_now_page = req.query.now_page;
  var req_total_page = req.query.total_page;
  var per_page = 5;

  // 자연수 정규식
  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

  if (req_now_page == undefined && req_total_page == undefined) {
    UserModel.paginate({user_type: "P"}, {sort: {user_id: -1}, limit: per_page, page: 1}, function(err, docs) {
      if (err) { return next(err); }

      var data = [];
      var portfolio = [];
      docs.docs.forEach(function(doc) {
	portfolio = [];
	async.waterfall([
	  function(callback) {
	    async.each(doc.portfolio, function(item, cb) {
	      portfolio.push(item.img_url);
	      cb();
	    }, function(err) {
	      if (err) { return next(err); }
	      callback(null, portfolio);
	    });
	  },
	  function(portfolio, callback) {
	    data.push({
	      user_id : doc.user_id,
	      username : doc.username,
	      thumbnail_img : doc.thumbnail_img,
	      portfolio : portfolio.slice(0,4),
	      average_rank : doc.average_rank
	    });
	    callback(null, data);
	  }
	], function(err, result) {
	  if (err) { return next(err); }
	});
      });

      // if (data.portfolio == undefined) { delete data.portfolio; } // 포트폴리오 비어있는 거 처리

      var total_page = Math.ceil(docs.total / docs.limit);
      var now_page = docs.page;

      res.json({
        success: 1,
        message: "작가리스트 최상단 리스트입니다.",
        data: data,
        now_page: now_page,
        total_page: total_page
      });
    });
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    if (req_now_page == req_total_page) {
      res.json({ success: 0, message: "더 가져올 작가리스트가 없습니다." })
    } else if (req_now_page < req_total_page) {
      var data = [];
      var portfolio = [];
      var new_page = parseInt(req_now_page) + 1;

      UserModel.paginate({user_type: "P"}, {sort: {user_id: -1}, limit: per_page, page: new_page}, function(err, docs) {
        if (err) { return next(err); }

	docs.docs.forEach(function(doc) {
          portfolio = [];
          async.waterfall([
            function(callback) {
              async.each(doc.portfolio, function(item, cb) {
                portfolio.push(item.img_url);
                cb();
              }, function(err) {
                if (err) { return next(err); }
                callback(null, portfolio);
              });
            },
            function(portfolio, callback) {
              data.push({
                user_id       : doc.user_id,
                username      : doc.username,
                thumbnail_img : doc.thumbnail_img,
                portfolio     : portfolio.slice(0,4),
                // portfolio     : doc.portfolio.slice(0,4) // 이거 적은 거 에러 처리
                average_rank : doc.average_rank // 평점
              });
              callback(null, data);
            }
          ], function(err, result) {
            if (err) { return next(err); }
          });
        });	

        var total_page = Math.ceil(docs.total / docs.limit);
        var now_page = docs.page;

        res.json({
          success: 1,
          message: "작가리스트 더 불러오기입니다.",
          data: data,
          now_page: now_page,
          total_page : total_page
        });
      });
    } else {
      res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
    }
  } else {
    res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)" });
  }
});


// 4.1. 특정유저를 눌렀을 때 보이는 마이페이지
router.get('/:user_id', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var target_user_id = req.params.user_id;
  var myself = (token_user_id == target_user_id); // myself true/false 판별

  var per_page = 5;
  var req_now_page = req.query.now_page;
  var req_total_page = req.query.total_page;

  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

  // 본인의 마이페이지인지 아닌지 확인해보는 것.
  if (req_now_page == undefined && req_total_page == undefined) {
    // 마이페이지
    UserModel.findOne({user_id: token_user_id}, function(err, docs) { // 내정보 가져오기
      if (err) { return next(err); }
      UserModel.findOne({user_id: target_user_id}, function(err, docs2) { // 타겟유저정보 가져오기
        if (err) { return next(err); }
        if ((docs.user_type == "V" && docs2.user_type == "P") || ((docs.user_type == "M" || docs.user_type == "P") && (docs2.user_type == "M" || docs2.user_type == "P"))) {
          // 본인인증 유저가 작가 프로필 보거나 모델/작가가 모델/작가를 보는 것

          var portfolio = undefined;
          if (docs2.portfolio.length != 0) {
	    portfolio = docs2.portfolio[0].img_url;
	  } 
          var data = {
	    myself : myself,
            user_id : docs2.user_id,
            user_type : docs2.user_type,
            username : docs2.username,
            age : docs2.age,
            average_rank : docs2.average_rank,
            wanted_addr : docs2.wanted_addr[0],
            concept_price : docs2.concept_price,
	    portfolio : portfolio,
            // portfolio : docs2.portfolio[0].img_url,
            thumbnail_img : docs2.thumbnail_img
          };

          // if (data.portfolio == undefined) { delete data.portfolio; } // undefined에 대한 에러 처리
          if (data.thumbnail_img == undefined) { delete data.thumbnail_img; }

          var data2 =[];
          async.waterfall([
            function(callback) {
              BookModel.paginate({user_id: target_user_id}, {sort: {book_id: -1}, limit: per_page, page: 1}, function(err, docs3) {
                if (err) { return next(err); }
                callback(null, docs3)
              });
            },
            function(arg1, callback) {
              async.each(arg1.docs, function(item, cb) {
                var liked = true;
                if (item.like_user.indexOf(token_user_id) == -1) {liked = false; }

		var seoul_time = moment.tz(item.upload_time, "Asia/Seoul").format();

                data2.push({
                  book_id       : item.book_id,
                  book_img      : item.book_img,
                  upload_time   : seoul_time,
                  book_desc     : item.book_desc,
                  like_count    : item.like_user.length,
                  liked         : liked,
                  user_id       : item.user_id,
                  username      : docs2.username,
                  user_type     : docs2.user_type,
                  thumbnail_img : docs2.thumbnail_img
                });
                cb();
              }, function(err) {
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
              message    : "모델/작가의 프로필페이지입니다(첫요청).",
              data       : data,
              data2      : result.data2,
              now_page   : result.page,
              total_page : total_page
            };
            res.json(final_result);
          });
	} else if (docs.user_type == "V" && docs2.user_type == "M") {
          res.json({
            success: 2,
            message: "모델 프로필을 보려면 모델/작가 등록이 필요합니다."
          });
        } else if (docs.user_type == "I" && docs2.user_type == "P") {
          res.json({
            success: 3,
            message: "작가 프로필을 보려면 본인인증이 필요합니다."
          });
        } else if (docs.user_type == "I" && docs2.user_type == "M") {
          res.json({
            success: 4,
            message: "모델 프로필을 보려면 본인인증 및 모델/작가 등록이 필요합니다."
          });
        } else {
          res.json({ success: 0, message: "권한이 없습니다." });
        }
      });
    });
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    // 마이페이지 더보기
    UserModel.findOne({user_id: token_user_id}, function(err, docs) { // 내정보 가져오기
      if (err) { return next(err); }
      UserModel.findOne({user_id: target_user_id}, function (err, docs2) { // 타겟유저정보 가져오기
        if (err) { return next(err); }
        if ((docs.user_type == "V" && docs2.user_type == "P") || ((docs.user_type == "M" || docs.user_type == "P") && (docs2.user_type == "M" || docs2.user_type == "P"))) {
          // 본인인증 유저가 작가 프로필 보거나 모델/작가가 모델/작가를 보는 것
          if (req_now_page == req_total_page) {
            res.json({ success: 0, message: "더 가져올 사진이 없습니다." });
          } else if (req_now_page < req_total_page) {
            var data3 = [];
            var new_page = parseInt(req_now_page) + 1;

            async.waterfall([
              function(callback) {
                BookModel.paginate({user_id: target_user_id}, {sort: {book_id: -1}, limit: per_page, page: new_page}, function(err, docs3) {
                  if (err) { return next(err); }
                  callback(null, docs3);
                });
              },
              function(arg1, callback) {
                async.each(arg1.docs, function(item, cb) {
                  var liked = true;
                  if (item.like_user.indexOf(token_user_id) == -1) { liked = false; }

		  var seoul_time = moment.tz(item.upload_time, "Asia/Seoul").format();

                  data3.push({
                    book_id       : item.book_id,
                    book_img      : item.book_img,
                    upload_time   : seoul_time,
                    book_desc     : item.book_desc,
                    like_count    : item.like_user.length,
                    liked         : liked,
                    user_id       : item.user_id,
                    username      : docs2.username,
                    user_type     : docs2.user_type,
                    thumbnail_img : docs2.thumbnail_img
                  });
                  cb();
                }, function(err) {
                  if (err) { return next(err); }
                  var result = {
                    data : data3,
                    page : arg1.page
                  };
                  callback(null, result);
                });
              }
            ], function(err, result) {
              if (err) { return next(err); }
              var final_result = {
                success : 1,
                message : "모델/작가의 프로필에서 갤러리 더 불러오기입니다.",
                data    : result.data,
                now_page : result.page,
                total_page : req_total_page
              };
              res.json(final_result);
            });
	  } else if (req_now_page == 1 && req_total_page == 0) {
	    res.json({ success: 0, message: "갤러리에 업로드된 사진이 없습니다(아직 사진업로드를 하나도 하지 않은)" });
          } else {
            res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
          }
        } else {
          res.json({ success: 0, message: "권한이 없습니다." });
        }
      });
    });
  } else {
    res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)" });
  }
});


// 4.2. 모델 프로필 더보기
router.get('/:user_id/detail/md', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var target_user_id = req.params.user_id;
  var myself = (token_user_id == target_user_id);
  var data;

  UserModel.findOne({user_id: token_user_id}, function(err, docs) {
    if (err) { return next(err); }
    UserModel.findOne({user_id: target_user_id}, function(err, docs2) {
      if (err) { return next(err); }

      if ((docs.user_type == "M" || docs.user_type == "P") && (docs2.user_type == "M")) {
	ProposalModel.findOne({
	  $and: [
	    {$or: [{req_user_id: target_user_id}, {res_user_id: target_user_id}]},
	    {proposal_stat: "E"}
	  ]
	}, function(err, docs3) {
	  if (err) { return next(err); }

	  // 평가된 내역이 없을 때
	  if (docs3 == undefined) {
            data = {
              myself        : myself,
              user_id       : docs2.user_id,
              user_type     : docs2.user_type,
              username      : docs2.username,
              average_rank  : docs2.average_rank,
              thumbnail_img : docs2.thumbnail_img,
              age           : docs2.age,
              gender        : docs2.gender,
              wanted_addr   : docs2.wanted_addr,
              pay_type      : docs2.pay_type,
              concept_price : docs2.concept_price,
              height        : docs2.height,
              weight        : docs2.weight,
              bust          : docs2.bust,
              waist         : docs2.waist,
              hip           : docs2.hip,
              introduction  : docs2.introduction,
              job           : docs2.job,
              career        : docs2.career,
              prize         : docs2.prize,
              foot          : docs2.foot,
              top_size      : docs2.top_size,
              bra           : docs2.bra
            };
            res.json({
              success: 1,
              message: "모델 프로필 자세히 보기입니다.",
              data :data
            });
	  } else {
	    if (target_user_id == docs3.rank[0].user_id) {
	      UserModel.findOne({user_id: docs3.rank[1].user_id}, function(err, docs4) {
		if (err) { return next(err); }
		var rank_score1 = parseInt(docs3.rank[1].score);
 		data = {
                  myself        : myself,
                  user_id       : docs2.user_id,
                  user_type     : docs2.user_type,
                  username      : docs2.username,
                  average_rank  : docs2.average_rank,
                  thumbnail_img : docs2.thumbnail_img,
                  rank_username : docs4.username,
                  rank_score    : rank_score1,
                  rank_comment  : docs3.rank[1].comment,
                  age           : docs2.age,
                  gender        : docs2.gender,
                  wanted_addr   : docs2.wanted_addr,
                  pay_type      : docs2.pay_type,
                  concept_price : docs2.concept_price,
                  height        : docs2.height,
                  weight        : docs2.weight,
                  bust          : docs2.bust,
                  waist         : docs2.waist,
                  hip           : docs2.hip,
                  introduction  : docs2.introduction,
                  job           : docs2.job,
                  career        : docs2.career,
                  prize         : docs2.prize,
                  foot          : docs2.foot,
                  top_size      : docs2.top_size,
                  bra           : docs2.bra
                };
                res.json({
                  success : 1,
                  message : "모델 프로필 자세히 보기입니다.",
                  data    : data
                });
              });
	    } else {
	      UserModel.findOne({user_id: docs3.rank[0].user_id}, function (err, docs4) {
                if (err) { return next(err); }
		var rank_score0 = parseInt(docs3.rank[0].score);
                data = {
                  myself: myself,
                  user_id: docs2.user_id,
                  user_type: docs2.user_type,
                  username: docs2.username,
                  average_rank: docs2.average_rank,
                  thumbnail_img: docs2.thumbnail_img,
                  rank_username: docs4.username,
                  rank_score: rank_score0,
                  rank_comment: docs3.rank[0].comment,
                  age: docs2.age,
                  gender: docs2.gender,
                  wanted_addr: docs2.wanted_addr,
                  pay_type: docs2.pay_type,
                  concept_price: docs2.concept_price,
                  height: docs2.height,
                  weight: docs2.weight,
                  bust: docs2.bust,
                  waist: docs2.waist,
                  hip: docs2.hip,
                  introduction: docs2.introduction,
                  job: docs2.job,
                  career: docs2.career,
                  prize: docs2.prize,
                  foot: docs2.foot,
                  top_size: docs2.top_size,
                  bra: docs2.bra
                };
                res.json({
                  success: 1,
                  message: "모델 프로필 자세히 보기입니다.",
                  data: data
                });
              });
	    }
	  }
	});
      } else {
        res.json({ success: 0, message: "권한이 없습니다." });
      }
    });
  });
});

// 4.3. 작가 프로필 더보기
router.get('/:user_id/detail/pg', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var target_user_id = req.params.user_id;
  var myself = (token_user_id == target_user_id);

  UserModel.findOne({user_id: token_user_id}, function(err, docs) {
    if (err) { return next(err); }
    UserModel.findOne({user_id: target_user_id}, function(err, docs2) {
      if (err) { return next(err); }
      ProposalModel.findOne({
        $and: [
          {$or: [{req_user_id: target_user_id}, {res_user_id: target_user_id}]},
          {proposal_stat: "E"}
        ]
      }, function(err, docs3) {
        if (err) { return next(err); }
        if ((docs.user_type == "M" || docs.user_type == "P" || docs.user_type == "V") && (docs2.user_type == "P")) {
          // 평가된 내역이 없을 때
          if (docs3 == undefined) {
            data = {
              myself        : myself,
              user_id       : docs2.user_id,
              user_type     : docs2.user_type,
              username      : docs2.username,
              average_rank  : docs2.average_rank,
              thumbnail_img : docs2.thumbnail_img,
              age           : docs2.age,
              gender        : docs2.gender,
              wanted_addr   : docs2.wanted_addr,
              pay_type      : docs2.pay_type,
              concept_price : docs2.concept_price,
              introduction  : docs2.introduction,
              camera        : docs2.camera,
              job           : docs2.job,
              career        : docs2.career,
              prize         : docs2.prize
            };
            res.json({
              success: 1,
              message: "작가 프로필 자세히 보기입니다.(평가가 없네요ㅠ)",
              data :data
            });
          } else {
            if (target_user_id == docs3.rank[0].user_id) {
              // rank 작성을 두 번째로 한 사람의 리뷰와 data를 함께 보여주자 - 내가 첫 번째로 리뷰한 사람이니까
              UserModel.findOne({user_id: docs3.rank[1].user_id}, function(err, docs4) {
                if (err) { return next(err); }
		var rank_score1 = parseInt(docs3.rank[1].score);
                data = {
                  myself        : myself,
                  user_id       : docs2.user_id,
                  user_type     : docs2.user_type,
                  username      : docs2.username,
                  average_rank  : docs2.average_rank,
                  thumbnail_img : docs2.thumbnail_img,
                  rank_username : docs4.username, // 최신평가
                  rank_score    : rank_score1, // 최신평가
                  rank_comment  : docs3.rank[1].comment, // 최신평가
                  age           : docs2.age,
                  gender        : docs2.gender,
                  wanted_addr   : docs2.wanted_addr,
                  pay_type      : docs2.pay_type,
                  concept_price : docs2.concept_price,
                  introduction  : docs2.introduction,
                  camera        : docs2.camera,
                  job           : docs2.job,
                  career        : docs2.career,
                  prize         : docs2.prize
                };

		if (data.rank_username == undefined) { delete data.rank_username; }
		if (data.rank_score == undefined) { delete data.rank_score; }
		if (data.rank_comment == undefined) { delete data.rank_comment; }
		
                res.json({
                  success: 1,
                  message: "작가 프로필 자세히 보기입니다.",
                  data :data
                });
              });
            } else {
              // rank 작성을 첫 번째로 한 사람의 리뷰와 data를 함께 보여주자 - 내가 두 번째로 리뷰한 사람이니까
              UserModel.findOne({user_id: docs3.rank[0].user_id}, function(err, docs4) {
                if (err) { return next(err); }
		var rank_score0 = parseInt(docs3.rank[0].score);
                data = {
                  myself        : myself,
                  user_id       : docs2.user_id,
                  user_type     : docs2.user_type,
                  username      : docs2.username,
                  average_rank  : docs2.average_rank,
                  thumbnail_img : docs2.thumbnail_img,
                  rank_username : docs4.username, // 최신평가
                  rank_score    : rank_score0, // 최신평가
                  rank_comment  : docs3.rank[0].comment, // 최신평가
                  age           : docs2.age,
                  gender        : docs2.gender,
                  wanted_addr   : docs2.wanted_addr,
                  pay_type      : docs2.pay_type,
                  concept_price : docs2.concept_price,
                  introduction  : docs2.introduction,
                  camera        : docs2.camera,
                  job           : docs2.job,
                  career        : docs2.career,
                  prize         : docs2.prize
                };

		if (data.rank_username == undefined) { delete data.rank_username; }
		if (data.rank_score == undefined) { delete data.rank_score; }
		if (data.rank_comment == undefined) {delete data.rank_comment; }

                res.json({
                  success: 1,
                  message: "작가 프로필 자세히 보기입니다.",
                  data :data
                });
              });
            }
          }
        } else {
          res.json({ success: 0, message: "권한이 없습니다." });
        }
      });
    });
  });
});

var uploadThumb = multer({
  storage: multerS3({
    s3 : s3,
    bucket : 'mocatest',
    acl : 'public-read',
    key : function(req, file, callback) {
      var tmp = file.mimetype.split('/')[1]; // file.mimetype을 뽑아낸 뒤 확장자를 추출
      if (tmp == 'jpeg') { tmp = 'jpg' }
      var ext = "." + tmp;
      var keyword = "Moca_Thumbnail_";
      var newname = keyword + Date.now().toString() + ext; // 일단은 이렇게 하고 동일 시간에 올라가면서 중복되면 uuid로 보완
      callback(null, newname);
    }
  })
});

// 3.14. 썸네일이미지 업로드하기(uploading thumbnail)
router.post('/:user_id/thumbnail', uploadThumb.single('img'), function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var url_user_id = req.params.user_id;
  var thumbnail_img = req.file.location;

  if (token_user_id == url_user_id) {
    UserModel.findOne({user_id: token_user_id}, function(err, docs) {
      if (err) { return next(err); }
      // 기존에 업로드한 썸네일 이미지가 있는지(아직 삭제 못했는지) 확인
      if (docs.thumbnail_img) {
        res.json({ success: 0, message: "기존에 업로드한 썸네일을 삭제해주세요" });
      } else {
        UserModel.findOneAndUpdate({user_id: token_user_id}, {$set: {"thumbnail_img": thumbnail_img}}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message: "썸네일 이미지를 업로드했습니다." });
        });
      }
    });
  } else {
    res.json({ success: 0, message: "권한이 없습니다.(토큰의 user_id와 URL의 user_id의 불일치)" });
  }
});


// 3.15. 썸네일이미지 삭제하기(deleting thumbnail)
router.delete('/:user_id/thumbnail', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var url_user_id = req.params.user_id;

  if (token_user_id == url_user_id) {
    UserModel.findOne({user_id: token_user_id}, function(err, docs) {
      if (err) { return next(err); }
      // 기존에 업로드한 썸네일 이미지가 있는지(삭제할 것이 있는지) 확인
      if (docs.thumbnail_img) {
        UserModel.findOneAndUpdate({user_id: token_user_id}, {$set: {"thumbnail_img": ""}}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message: "썸네일 이미지를 삭제했습니다." });
        });
      } else {
        res.json({ success: 0, message: "삭제할 썸네일 이미지가 없습니다." });
      }
    });
  } else {
    res.json({ success: 0, message: "권한이 없습니다.(토큰의 user_id와 URL의 user_id의 불일치)" });
  }
});


// 8-5. Authentication(본인인증) - 원래는 Get(외부인증모듈로)이지만 1차개발에서 POST로 내부에서 처리
// 입력받은 값(realname(문자), ssn(숫자))에 대한 자료형 처리 필요!
// ssn의 유효성 체크 - 7자리 숫자인지, 맨 뒤가 1~4 사이, 맨 뒤가 3~4일 때 맨앞의 두 개가 00~16 사이, 앞에서 3~4번째가 1~12 사이, 앞에서 5~6번째가 1에서 31 사이.
router.post('/valid', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var realname = req.body.realname; // 홍석유
  var ssn = req.body.ssn; // 9007142

/*
  // 이름 확인 정규식
  function isValidKorean(data){
    // 유니코드 중 AC00부터 D7A3 값인지 검사
    var format = /^[\uac00-\ud7a3]*$/g;
    if (data.search(format) == -1) {
      return false;
    } else {
      return true; //올바른 포맷 형식
    }
  }
  
  // 주민번호 확인 정규식
  function isValidSsnFormat(data) {
    var format = /[0-9]{2}[0-9]{2}[0-9]{2}[1-4]/;
    if(data.search(format) == -1) {
      return false;
    } else {
      return true;
    }
  }
*/

//  if (isValidKorean(realname) && isValidSsnFormat(data)) {
    UserModel.findOne({user_id: token_user_id }, function(err, docs) {
      if (err) { return next(err); }
      // 이미 본인인증을 했는지(V, M, P) 확인.
      if (docs.user_type == "I") {
        // 9007142의 맨 앞의 두 개로 birth_year, 맨 뒤의 한 개로 gender_num 도출
        var birth_year = ssn.substring(0,2); // 90
        var gender_num = ssn.substring(6,7); // 2

        // 나이와 성별을 도출 -> 27, "F"
        var age = (gender_num < 3) ? 117 - birth_year : 17 - birth_year; // 27(117-90)
        var gender = (gender_num == 1 || gender_num == 3) ? "M" : "F"; // "F"(2)

        var data = {
          realname  : realname,
          ssn       : ssn,
          age       : age,
          gender    : gender,
          user_type : "V" // 본인인증 유저
        };

        UserModel.findOneAndUpdate({user_id: token_user_id}, {$set:data}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message: "본인인증 성공" });
        });
      } else {
        res.json({ success: 0, message: "이미 본인인증을 했습니다.(기존의 user_type이 I(invalid)가 아님)" });
      }
    });
//  } else {
//    res.json({ success: 0, message: "이름과 주민번호를 정확하게 입력해주세요." });
//  }
});

// 2.3 & 2.4. 모델 필터조회 - /api/1/users/models/filter?gender=M&pay_type=F
router.post('/models/filter', function(req, res, next) {
  var gender = req.body.gender; // 0은 전체, M은 남성, F는 여성
  var pay_type = req.body.pay_type; // 0은 전체, P은 페이, F는 무료
  if (gender == "A") { gender = 0;}
  if (pay_type == "A") { pay_type = 0;}

  var start_age = req.body.start_age; // 기본값 0
  var end_age = req.body.end_age // 기본값 99
  var wanted_addr = req.body.wanted_addr; // "경기도 고양시" - 사람들이 해당하는 것이 있는지 확인해봐야ㅠ
  var concept = req.body.concept;
  if (wanted_addr == "") { wanted_addr = 0; }
  if (concept.length == 0) {
    concept = 0;
  } else {
    concept = JSON.parse(concept);
  }

  var req_now_page = req.body.now_page;
  var req_total_page = req.body.total_page;
  var per_page = 5;

  // 자연수 정규식
  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

  var resultMessage;
  var condition;

  // 필터 함수 시작
  var filterFunc = function(gender, pay_type, wanted_addr, concept, start_age, end_age, now_page, message) {
    if (concept != 0) {
      condition = {
        user_type   : "M",
        pay_type    : pay_type,
        gender      : gender,
        age         : {$gte: start_age, $lte: end_age}, // 나이 범위에 따라
        wanted_addr : {$in: [wanted_addr]}, // 각 유저별 희망지역배열에 "입력받은 주소"가 들어있는지 확인
        "concept_price.concept" : {$in: concept} // 이런식으로 접근이 되는건가?
      };
    } else {
      condition = {
        user_type   : "M",
        pay_type    : pay_type,
        gender      : gender,
        age         : {$gte: start_age, $lte: end_age},
        wanted_addr : {$in: [wanted_addr]}
      };
    }

    if (pay_type == 0) { delete condition.pay_type; }
    if (gender == 0) { delete condition.gender; }
    if (wanted_addr == 0) {delete condition.wanted_addr; }

    UserModel.paginate({$and: [condition]}, {sort: {user_id: -1}, limit: per_page, page: now_page}, function(err, docs) {
      if (err) { return next(err); }
      var data = [];
      docs.docs.forEach(function(doc) {
        data.push({
          user_id       : doc.user_id,
          username      : doc.username,
          thumbnail_img : doc.thumbnail_img,
          age           : doc.age,
          concept       : doc.concept_price[0].concept,
          wanted_addr   : doc.wanted_addr[0],
          average_rank  : doc.average_rank
        });
      });

      if (data.length == 0) {
        res.json({ success: 0, message: "조건에 맞는 검색결과가 없습니다." });
      } else {
        var total_page = Math.ceil(docs.total / docs.limit);
        var now_page = docs.page;

        res.json({
          success: 1,
          message: message,
          data : data,
          now_page : now_page,
          total_page : total_page
        });
      }
    });
  };
  // 필터 함수 끝

  if (req_now_page == undefined && req_total_page == undefined) {
    resultMessage = "모델리스트 최상단리스트입니다.";
    filterFunc(gender, pay_type, wanted_addr, concept, start_age, end_age, 1, resultMessage);
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    if (req_now_page == req_total_page) {
      res.json({ success: 0, message: "더 가져올 모델리스트가 없습니다." });
    } else if (req_now_page < req_total_page) {
      var new_page = parseInt(req_now_page) + 1;
      resultMessage = "모델리스트 더 불러오기입니다.";
      filterFunc(gender, pay_type, wanted_addr, concept, start_age, end_age, new_page, resultMessage);
    } else {
      res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
    }
  } else {
    res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)" });
  }
});

// 2.7 & 2.8. 작가 필터조회 - /api/1/users/photograpers/filter
router.post('/photographers/filter', function(req, res, next) {
  var gender = req.body.gender; // 0은 전체, M은 남성, F는 여성
  var pay_type = req.body.pay_type; // 0은 전체, P은 페이, F는 무료
  if (gender == "A") { gender = 0;}
  if (pay_type == "A") { pay_type = 0;}

  var start_age = req.body.start_age; // 기본값 0
  var end_age = req.body.end_age; // 기본값 99
  var wanted_addr = req.body.wanted_addr; // "경기도 고양시" - 사람들이 해당하는 것이 있는지 확인해봐야ㅠ
  var concept = req.body.concept; // 배열은 json 파싱을 해줘야
  if (wanted_addr == "") { wanted_addr = 0; } 
  if (concept.length == 0) {
    concept = 0;
  } else {
    concept = JSON.parse(concept);
  }

  var req_now_page = req.body.now_page;
  var req_total_page = req.body.total_page;
  var per_page = 5;

  // 자연수 정규식
  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

  var resultMessage;
  var condition;

  // 필터 함수 시작
  var filterFunc = function(gender, pay_type, wanted_addr, concept, start_age, end_age, now_page, message) {
    if (concept != 0) {
      condition = {
        user_type   : "P",
        pay_type    : pay_type,
        gender      : gender,
        age         : {$gte: start_age, $lte: end_age}, // 나이 범위에 따라
        wanted_addr : {$in: [wanted_addr]}, // 각 유저별 희망지역배열에 "입력받은 주소"가 들어있는지 확인
        "concept_price.concept" : {$in: concept} // 이런식으로 접근이 되는건가?
      };
    } else {
      condition = {
        user_type   : "P",
        pay_type    : pay_type,
        gender      : gender,
        age         : {$gte: start_age, $lte: end_age}, // 나이 범위에 따라
        wanted_addr : {$in: [wanted_addr]} // 각 유저별 희망지역배열에 "입력받은 주소"가 들어있는지 확인
      };
    }

    if (pay_type == 0) { delete condition.pay_type; }
    if (gender == 0) { delete condition.gender; }
    if (wanted_addr == 0) {delete condition.wanted_addr; }

    UserModel.paginate({$and: [condition]}, {sort: {user_id: -1}, limit: per_page, page: now_page}, function(err, docs) {
      if (err) { return next(err); }

      var data = [];
      var portfolio = [];

      docs.docs.forEach(function(doc) {
        portfolio = [];
        async.waterfall([
          function(callback) {
            async.each(doc.portfolio, function(item, cb) {
              portfolio.push(item.img_url);
              cb();
            }, function(err) {
              if (err) { return next(err); }
              callback(null, portfolio);
            });
          },
          function(portfolio, callback) {
            data.push({
              user_id       : doc.user_id,
              username      : doc.username,
              thumbnail_img : doc.thumbnail_img,
              portfolio     : portfolio.slice(0,4),
              // portfolio     : doc.portfolio.slice(0,4) // 이거 적은 거 에러 처리
              average_rank : doc.average_rank // 평점
            });
            callback(null, data);
          }
        ], function(err, result) {
          if (err) { return next(err); }
        });
      });

/*
      docs.docs.forEach(function(doc) {
	doc.portfolio.forEach(function(item) {
	  portfolio.push(item.img_url);
	});

        data.push({
          user_id       : doc.user_id,
          username      : doc.username,
          thumbnail_img : doc.thumbnail_img,
	  portfolio     : portfolio.slice(0,4),
          // portfolio     : doc.portfolio.slice(0,4),
          average_rank  : doc.average_rank
        });
      });
*/
      if (data.length == 0) {
        res.json({ success: 0, message: "조건에 맞는 검색결과가 없습니다." });
      } else {
        var total_page = Math.ceil(docs.total / docs.limit);
        var now_page = docs.page;

        res.json({
          success: 1,
          message: message,
          data: data,
          now_page: now_page,
          total_page: total_page
        });
      }
    });
  };
  // 필터 함수 끝

  if (req_now_page == undefined && req_total_page == undefined) {
    resultMessage = "작가리스트 최상단리스트입니다.";
    filterFunc(gender, pay_type, wanted_addr, concept, start_age, end_age, 1, resultMessage);
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    if (req_now_page == req_total_page) {
      res.json({ success: 0, message: "더 가져올 작가리스트가 없습니다." });
    } else if (req_now_page < req_total_page) {
      var new_page = parseInt(req_now_page) + 1;
      resultMessage = "작가리스트 더 불러오기입니다.";
      filterFunc(gender, pay_type, wanted_addr, concept, start_age, end_age, new_page, resultMessage);
    } else {
      res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
    }
  } else {
    res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)" });
  }
});

// 3-4. Model Registration(모델 등록하기)
// 입력받은 값(string과 number, array)에 대한 자료형 처리 필요!
// 필수로 입력받아야할 값(wanted_addr부터 hip까지 필수 vs. foot부터 prize는 선택)
router.post('/models', function(req, res, next) {
  var token_user_id = req.decoded.user_id;

  UserModel.findOne({ user_id: token_user_id }, function(err, docs) {
    if (err) { return next(err); }
    // 모델로 등록할 수 있는 본인인증 유저(V)인지
    if (docs.user_type == "V") {
      var wanted_addr = JSON.parse(req.body.wanted_addr);
      var pay_type = req.body.pay_type;
      var concept_price = JSON.parse(req.body.concept_price);
      var introduction = req.body.introduction;
      var height = req.body.height;
      var weight = req.body.weight;
      var bust = req.body.bust;
      var waist = req.body.waist;
      var hip = req.body.hip;
      // 여기서부터 선택 정보 - 값이 입력되지 않을 수도(undefined) 있기 때문에 그것에 대한 에러 처리를 진행해줘야 함.
      var bra = req.body.bra;
      var foot = req.body.foot;
      var top_size = req.body.top_size;
      var job = req.body.job;
      var career = req.body.career;
      var prize = req.body.prize;

      var data = {
        wanted_addr : wanted_addr,
        pay_type : pay_type,
        concept_price : concept_price,
        introduction : introduction,
        height : height,
        weight : weight,
        bust : bust,
        waist : waist,
        hip : hip,
        user_type : "M", // 모델 유저타입
        bra : bra,
        foot : foot,
        top_size : top_size,
        job : job,
        career : career,
        prize : prize
      };

      // 선택정보 에러 처리
      if (bra == undefined) { delete data.bra; }
      if (foot == undefined) { delete data.foot; }
      if (top_size == undefined) { delete data.top_size; }
      if (job == undefined) { delete data.job; }
      if (career == undefined) { delete data.career; }
      if (prize == undefined) { delete data.prize; }

      UserModel.findOneAndUpdate({ user_id: token_user_id }, { $set: data }, function(err, doc) {
        if (err) { return next(err); }
        res.json({ success: 1, message: "모델로 등록되었습니다." });
      });
    } else {
      res.json({ success: 0, message: "모델 등록에 실패했습니다.(미인증, 모델, 작가 유저일 경우)" });
    }
  });
});

/*
// 3-5, 3-7. Model modify(모델/작가 정보수정하기)
router.post('/:user_id', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var target_user_id = req.params.user_id;
  var data;
  
  if (token_user_id == target_user_id) {
    UserModel.findOne({user_id: token_user_id}, function(err, docs) {
      if (docs.user_type == "M") {
        data = {
          wanted_addr : req.body.wanted_addr,
          pay_type : req.body.pay_type,
          concept_price : req.body.concept_price,
          introduction : req.body.introduction,
          height : req.body.height,
          weight : req.body.weight,
          bust : req.body.bust,
          waist : req.body.waist,
          hip : req.body.hip,
          // 여기서부터 선택 정보 - 값이 입력되지 않을 수도(undefined) 있기 때문에 그것에 대한 에러 처리를 진행해줘야 함.
          bra : req.body.bra,
          foot : req.body.foot,
          top_size : req.body.top_size,
          job : req.body.job,
          career : req.body.career,
          prize : req.body.prize
        };

        if (data.bra == undefined) { delete data.bra; }
        if (data.foot == undefined) { delete data.foot; }
        if (data.top_size == undefined) { delete data.top_size; }
        if (data.job == undefined) { delete data.job; }
        if (data.career == undefined) { delete data.career; }
        if (data.prize == undefined) { delete data.prize; }

        UserModel.findOneAndUpdate({user_id: token_user_id}, {$set:data}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message : "모델 정보 수정완료했습니다." });
        });
      } else if (docs.user_type == "P") {
        data = {
          wanted_addr : req.body.wanted_addr,
          pay_type : req.body.pay_type,
          concept_price : req.body.concept_price,
          introduction : req.body.introduction,
          // 여기서부터 선택 정보 - 값이 입력되지 않을 수도(undefined) 있기 때문에 그것에 대한 에러 처리를 진행해줘야 함.
          job : req.body.job,
          career : req.body.career,
          prize : req.body.prize,
          camera : req.body.camera
        };

        if (data.job == undefined) { delete data.job; }
        if (data.career == undefined) { delete data.career; }
        if (data.prize == undefined) { delete data.prize; }
        if (data.camera == undefined) { delete data.camera; }

        UserModel.findOneAndUpdate({user_id: token_user_id}, {$set:data}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message : "작가 정보 수정완료했습니다." });
        });

      } else {
        res.json({ success: 0, message: "모델/작가만 개인정보 수정이 가능합니다." });
      }
    });
  } else {
    res.json({ success: 0, message: "권한이 없습니다.(토큰의 user_id와 URL의 user_id의 불일치ddd)" });
  }
});
*/

// 3-6. Photographer Registration(작가 등록하기)
// 입력받은 값(string, number, array)에 대한 자료형 처리 필요!
// 필수로 입력받아야할 값(wanted_addr부터 introduction까지 필수 vs.job부터 camera까지 선택)
router.post('/photographers', function(req, res, next) {
  var token_user_id = req.decoded.user_id;

  UserModel.findOne({ user_id: token_user_id }, function(err, docs) {
    if (err) { return next(err); }
    if (docs.user_type == "V") {
      var wanted_addr = JSON.parse(req.body.wanted_addr);
      var pay_type = req.body.pay_type;
      var concept_price = JSON.parse(req.body.concept_price);
      var introduction = req.body.introduction;
      // 여기서부터 선택 정보 - 값이 입력되지 않을 수도(undefined) 있기 때문에 그것에 대한 에러 처리를 진행해줘야 함.
      var job = req.body.job;
      var career = req.body.career;
      var prize = req.body.prize;
      var camera = req.body.camera;

      var data = {
        wanted_addr : wanted_addr,
        pay_type : pay_type,
        concept_price : concept_price,
        introduction : introduction,
        user_type : "P", // 작가 유저타입
        job : job,
        career : career,
        prize : prize,
        camera : camera
      };

      // 선택정보 에러 처리
      if (job == undefined) { delete data.job; }
      if (career == undefined) { delete data.career; }
      if (prize == undefined) { delete data.prize; }
      if (camera == undefined) { delete data.camera; }

      UserModel.findOneAndUpdate({ user_id: token_user_id }, { $set: data }, function(err, doc) {
        if (err) { return next(err); }
        res.json({ success: 1, message: "작가로 등록되었습니다." });
      })
    } else {
      res.json({ success: 0, message: "작가 등록에 실패했습니다.(미인증, 모델, 작가 유저일 경우)" })
    }
  });
});


// 4.4. [업데이트] 포트폴리오 보기
router.get('/:user_id/portfolio', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var target_user_id = req.params.user_id;

  UserModel.findOne({user_id: token_user_id}, function(err, docs) {
    if (err) { return next(err); }
    UserModel.findOne({user_id: target_user_id}, function(err, docs2) {
      if (err) { return next(err);}
      if ((docs.user_type == "V" && docs2.user_type == "P") || (docs.user_type == "M" || docs.user_type == "P")) {

        // object array 형태로 되어있는 "포트폴리오에 있는 이미지"들을 하나씩 넣어서 전달해주기
        var data = [];
        docs2.portfolio.forEach(function(item) {
          data.push(item.img_url)
        });

        res.json({
          success : 1,
          message : "포트폴리오입니다.",
          data    : data
        });
      } else {
        res.json({ success: 0, message: "권한이 없습니다." });
      }
    });
  });
});

var uploadPort = multer({
  storage: multerS3({
    s3 : s3,
    bucket : 'mocatest',
    acl : 'public-read',
    key : function(req, file, callback) {
      var tmp = file.mimetype.split('/')[1]; // file.mimetype을 뽑아낸 뒤 확장자를 추출
      if (tmp == 'jpeg') { tmp = 'jpg' }
      var ext = "." + tmp;
      var keyword = "Moca_Photo_Portfolio_";
      var newname = keyword + Date.now().toString() + ext; // 일단은 이렇게 하고 동일 시간에 올라가면서 중복되면 uuid로 보완
      callback(null, newname);
    }
  })
});

// 3.9. 포트폴리오 업로드하기(uploading portfolio) - 최대 10개
router.post('/:user_id/portfolio', uploadPort.array('img', 10), function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var url_user_id = req.params.user_id;

  // 업로드 된 포트폴리오의 인덱스
  var index = JSON.parse(req.body.index); // 이미지들의 순서(index)를 array로 받고
  var img_array = req.files; // 이미지파일을 배열로 받아서
  if (token_user_id == url_user_id) {
    UserModel.findOne({user_id: token_user_id}, function(err, docs) {
      if (err) { return next(err); }
      if (docs.user_type == "M" || docs.user_type == "P") {
        var i = -1;
        var portfolio;
	var new_index;
        async.each(img_array, function(item, cb) {
	  i = i + 1; // 0부터 인덱스 
	  new_index = index[i]; // 해당 이미지의 순서
          portfolio = {
              id : new_index, // 해당 인덱스
              img_url : item.location // 이미지 url
          }; // 조건을 만들고

          if (docs.portfolio.length <= index[i]) { // 기존에 올라간 이미지가 있는지 확인하고 없으면 push(추가), 있으면 set(생성)
            UserModel.findOneAndUpdate({user_id: token_user_id}, {$push: {"portfolio": portfolio}}, function(err, doc) {
              if (err) { return next(err); }
              cb();
            });
          } else {
            UserModel.findOneAndUpdate({user_id: token_user_id, 'portfolio.id': index[i]}, {$set: {"portfolio.$.img_url": portfolio.img_url }}, function(err, doc) {
              if (err) { return next(err); }
              cb();
            })
          }
        }, function() {
	  res.json({ success: 1, message: "포트폴리오를 업로드했습니다." });
        });
      } else {
        res.json({ success: 0, message: "권한이 없음(요청자가 모델/작가가 아님)" });
      }
    });
  } else {
    res.json({ success: 0, message: "권한이 없습니다.(토큰의 user_id와 URL의 user_id의 불일치)" });
  }
});

/*
var uploadPort = multer({
  storage: multerS3({
    s3 : s3,
    bucket : 'mocatest',
    acl : 'public-read',
    key : function(req, file, callback) {
      var tmp = file.mimetype.split('/')[1]; // file.mimetype을 뽑아낸 뒤 확장자를 추출
      if (tmp == 'jpeg') { tmp = 'jpg' }
      var ext = "." + tmp;
      var keyword = "Moca_Photo_Portfolio_";
      var newname = keyword + Date.now().toString() + ext; // 일단은 이렇게 하고 동일 시간에 올라가면서 중복되면 uuid로 보완
      callback(null, newname);
    }
  })
});

// 3.9. 포트폴리오 업로드하기(uploading portfolio)
router.post('/:user_id/portfolio', uploadPort.single('img'), function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var url_user_id = req.params.user_id;
  var portfolio = req.file.location;

  if (token_user_id == url_user_id) {
    UserModel.findOne({user_id: token_user_id}, function(err, docs) {
      if (err) { return next(err); }
      // 유저가 모델/작가이면서 포트폴리오의 개수가 10개 미만일 때
      if ((docs.user_type == "M" || docs.user_type == "P") && docs.portfolio.length < 10) {
        UserModel.findOneAndUpdate({user_id: token_user_id}, {$push: {"portfolio": portfolio}}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message: "포트폴리오를 업로드했습니다."})
        });
      } else {
        res.json({ success: 0, message: "권한이 없거나(요청자가 모델/작가가 아님) 이미 포트폴리오를 10개 올렸습니다." });
      }
    });
  } else {
    res.json({ success: 0, message: "권한이 없습니다.(토큰의 user_id와 URL의 user_id의 불일치)" });
  }
});

// 4.4. 포트폴리오 보기
router.get('/:user_id/portfolio', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var target_user_id = req.params.user_id;

  UserModel.findOne({user_id: token_user_id}, function(err, docs) {
    if (err) { return next(err); }
    UserModel.findOne({user_id: target_user_id}, function(err, docs2) {
      if (err) { return next(err);}
      if ((docs.user_type == "V" && docs2.user_type == "P") || (docs.user_type == "M" || docs.user_type == "P")) {
        res.json({
          success : 1,
          message : "포트폴리오입니다.",
          data    : docs2.portfolio
        });
      } else {
        res.json({ success: 0, message: "권한이 없습니다." });
      }
    });
  });
});
*/

// 3-5, 3-7. Model modify(모델/작가 정보수정하기)
router.post('/:user_id', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var target_user_id = req.params.user_id;
  var data;

  if (token_user_id == target_user_id) {
    UserModel.findOne({user_id: token_user_id}, function(err, docs) {
      if (docs.user_type == "M") {
        data = {
          wanted_addr : JSON.parse(req.body.wanted_addr),
          pay_type : req.body.pay_type,
          concept_price : JSON.parse(req.body.concept_price),
          introduction : req.body.introduction,
          height : req.body.height,
          weight : req.body.weight,
          bust : req.body.bust,
          waist : req.body.waist,
          hip : req.body.hip,
          // 여기서부터 선택 정보 - 값이 입력되지 않을 수도(undefined) 있기 때문에 그것에 대한 에러 처리를 진행해줘야 함.
          bra : req.body.bra,
          foot : req.body.foot,
          top_size : req.body.top_size,
          job : req.body.job,
          career : req.body.career,
          prize : req.body.prize
        };
console.log(data);
        if (data.bra == undefined) { delete data.bra; }
        if (data.foot == undefined) { delete data.foot; }
        if (data.top_size == undefined) { delete data.top_size; }
        if (data.job == undefined) { delete data.job; }
        if (data.career == undefined) { delete data.career; }
        if (data.prize == undefined) { delete data.prize; }

        UserModel.findOneAndUpdate({user_id: token_user_id}, {$set:data}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message : "모델 정보 수정완료했습니다." });
        });
      } else if (docs.user_type == "P") {
        data = {
          wanted_addr : JSON.parse(req.body.wanted_addr),
          pay_type : req.body.pay_type,
          concept_price : JSON.parse(req.body.concept_price),
          introduction : req.body.introduction,
          // 여기서부터 선택 정보 - 값이 입력되지 않을 수도(undefined) 있기 때문에 그것에 대한 에러 처리를 진행해줘야 함.
          job : req.body.job,
          career : req.body.career,
          prize : req.body.prize,
          camera : req.body.camera
        };

        if (data.job == undefined) { delete data.job; }
        if (data.career == undefined) { delete data.career; }
        if (data.prize == undefined) { delete data.prize; }
        if (data.camera == undefined) { delete data.camera; }

        UserModel.findOneAndUpdate({user_id: token_user_id}, {$set:data}, function(err, doc) {
          if (err) { return next(err); }
          res.json({ success: 1, message : "작가 정보 수정완료했습니다." });
        });

      } else {
        res.json({ success: 0, message: "모델/작가만 개인정보 수정이 가능합니다." });
      }
    });
  } else {
    res.json({ success: 0, message: "권한이 없습니다.(토큰의 user_id와 URL의 user_id의 불일치)" });
  }
});

module.exports = router;

var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment-timezone');

var db = require('../models/db');
require('../models/bookmodel');
require('../models/usermodel');
var BookModel = db.model('Book');
var UserModel = db.model('User');

// 이미지 업로드 셋팅
var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';
var s3 = new AWS.S3();

var upload = multer({
  storage: multerS3({
    s3 : s3,
    bucket : 'mocatest',
    acl : 'public-read',
    key : function(req, file, callback) {
      var tmp = file.mimetype.split('/')[1]; // file.mimetype을 뽑아낸 뒤 확장자를 추출
      if (tmp == 'jpeg') { tmp = 'jpg' }
      var ext = "." + tmp;
      var keyword = "Moca_Photo_Book_";
      var newname = keyword + Date.now().toString() + ext; // 일단은 이렇게 하고 동일 시간에 올라가면서 중복되면 uuid로 보완
      callback(null, newname);
    }
  })
});

// 3-11. Uploading a book(사진 업로드하기)
// 이미지 말고 이상한 거 올라올 때 처리
router.post('/', upload.single('img'), function(req, res, next) {
  var token_user_id = req.decoded.user_id;

console.log(req.file);
  // imgSave function start
  var imgSave = function() {
    var book_img = req.file.location;
    var book_desc = req.body.book_desc;

    var data = new BookModel({
      user_id   : token_user_id,
      book_img  : book_img,
      book_desc : book_desc
    });

    data.save(function(err, docs) {
      if (err) { return next(err); }
      res.json({ success: 1, message: "사진이 업로드되었습니다." });
    });
  };
  // imgSave function end

  UserModel.findOne({ user_id: token_user_id }, function(err, docs) {
    if (err) { return next(err); }
    if (docs.user_type == "M" || docs.user_type == "P") {
      imgSave();
    } else {
      res.json({ success: 0, message: "사진을 업로드하기 위해서는 모델/작가 등록을 해야합니다." });
    }
  });
});

// 1.1. 뉴스피드 조회(newsfeed)
router.get('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var prev_id = req.query.prev_id;
  var per_page = 5;

  // 자연수 정규식
  function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  };

  if (prev_id == undefined) { // 최초 뉴스피드 요청(prev_id의 값이 들어오지 않았을 때)
    // async 시작
    async.waterfall([
      // 1단계: 먼저 뉴스피드 최상단 5개의 이미지 정보들을 불러옴
      function(callback) {
        BookModel.find().limit(per_page).sort('-book_id').exec(function(err, docs) {
          if (err) { return next(err); }
          callback(null, docs);
        });
      },
      // 2단계: 각 이미지를 업로드한 유저의 id(user_id)로 user_id를 찾아서 1단계에서 불러온 이미지정보에 하나씩 맵핑
      function(data1, callback) {
        var data2 = [];
        async.each(data1, function(item, cb) {
          UserModel.findOne({user_id: item.user_id}, function(err, docs2) {
            if (err) { return next(err); }

            // item.like_user 배열에 token_user_id가 포함되어 있으면(좋아요를 눌렀으면) true, 없으면 false
            var liked = true;
            if (item.like_user.indexOf(token_user_id) == -1) { liked = false; }

	    var seoul_time = moment.tz(item.upload_time, "Asia/Seoul").format();

            data2.push({
              book_id       : item.book_id,
              book_img      : item.book_img,
              upload_time   : seoul_time,
              book_desc     : item.book_desc,
              like_count    : item.like_user.length, // like_user 배열의 숫자(like를 누른 사람의 숫자)
              liked         : liked, // 위에서 검증한 내역
              user_id       : item.user_id,
              username      : docs2.username,
              user_type     : docs2.user_type,
              thumbnail_img : docs2.thumbnail_img
            });
            cb();
          });
        }, function(err) {
          if (err) { return next(err); }
          callback(null, data2);
        });
      }
      // 3단계: 1, 2단계에서 만든 결과물을 json 형태로 쏘기
    ], function(err, result) {
      if (err) { return next(err); }
      var books = {
        success  : 1,
        message  : "뉴스피드 최신조회에 대한 응답입니다.",
        after_id : result[0].book_id,
        prev_id  : result[result.length-1].book_id,
        data     : result
      };
      res.json(books);
    });
  } else if (isNaturalNumber(prev_id) && prev_id > 13) { // prev_id가 자연수이면서 1보다 클 때
    async.waterfall([
      function(callback) {
        BookModel.find({book_id: {$lte: prev_id - 1}}).limit(per_page).sort('-book_id').exec(function (err, docs) {
          if (err) { return next(err); }
          callback(null, docs);
        });
      },
      function(data1, callback) {
        var data2 = [];
        async.each(data1, function(item, cb) {
          UserModel.findOne({user_id: item.user_id}, function (err, docs2) {
            if (err) { return next(err); }

            // item.like_user 배열에 token_user_id가 포함되어 있으면(좋아요를 눌렀으면) true, 없으면 false
            var liked = true;
            if (item.like_user.indexOf(token_user_id) == -1) { liked = false; }
	    
            var seoul_time = moment.tz(item.upload_time, "Asia/Seoul").format();

            data2.push({
              book_id       : item.book_id,
              book_img      : item.book_img,
              upload_time   : seoul_time,
              book_desc     : item.book_desc,
              like_count    : item.like_user.length, // like_user 배열의 숫자(like를 누른 사람의 숫자)
              liked         : liked, // 위에서 검증한 내역
              user_id       : item.user_id,
              username      : docs2.username,
              user_type     : docs2.user_type,
              thumbnail_img : docs2.thumbnail_img
            });
            cb();
          });
        }, function(err) {
          if (err) { return next(err); }
          callback(null, data2);
        });
      }
    ], function(err, result) {
      if (err) { return next(err); }
      var books = {
        success  : 1,
        message  : "뉴스피드 더보기에 대한 응답입니다.",
        after_id : result[0].book_id,
        prev_id  : result[result.length - 1].book_id,
        data     : result
      };
      res.json(books);
    });
  } else if (isNaturalNumber(prev_id) && prev_id == 13 || prev_id == 0) {
    res.json({ success: 1, message: "더 가져올 사진이 없습니다." });
  } else { // prev_id 값이 있는데 값이 이상할 때
    res.json({ success: 0, message: "옳지 않은 요청입니다." });
  }
});


// 1.4. like(특정사진 좋아요)
router.post('/:book_id/like', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var book_id = req.params.book_id;

  BookModel.findOne({ book_id : book_id }, function(err, docs){
    if (err) { return next(err); }
    
    var liked = false;
    // if (docs.like_user.indexOf(token_user_id) == -1) { liked = false; }

    for (var i = 0; i < docs.like_user.length; i++) {
      if (docs.like_user[i] == token_user_id) { liked = true; } // 확인하면 빠져나갈 수 있도록 return을 넣어야 하나?
    }
    // 있으면 true
    if (liked == true) {
      res.json({ success: 0, message: "이미 좋아요를 눌렀습니다." });
    } else {
      BookModel.findOneAndUpdate({ book_id: book_id }, {$push: {"like_user": token_user_id}}, function(err, doc) {
        res.json({ success: 1, message: "좋아요를 눌렀습니다." });
      });
    }
  });
});

// 1.5. unlike(특정사진 좋아요 취소)
router.post('/:book_id/unlike', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var book_id = req.params.book_id;

  BookModel.findOne({ book_id : book_id }, function(err, docs){
    if (err) { return next(err); }

    // liked 좋아요를 눌렀는지 확인하는 변수
    var liked = true;
    if (docs.like_user.indexOf(token_user_id) == -1) { liked = false; }
    // for (var i = 0; i < docs.like_user.length; i++) {
      // if (docs.like_user[i] == token_user_id) { liked = true; }
    // }
    // 있으면 true(좋아요를 과거에 누름)
    if (liked == true) {
      BookModel.findOneAndUpdate({ book_id: book_id }, {$pull: {"like_user": token_user_id}}, function(err, doc) {
        if (err) { return next(err); }
        res.json({ success: 1, message: "좋아요를 취소했습니다." });
      });
    } else {
      res.json({ success: 0, message: "좋아요를 취소할 수 없습니다." });
    }
  });
});

module.exports = router;

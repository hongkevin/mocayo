var express = require('express');
var router = express.Router();
var app = express();

// jwt 설정
var jwt = require('jsonwebtoken');
var config = require('../config/app');
app.set('tokenSecret', config.secret);

// MongoDB
var db = require('../models/db');
require('../models/usermodel');
var UserModel = db.model('User');

// email signup(이메일 회원가입)
router.post('/signup', function(req, res, next) {
  var req_username = req.body.username;
  var req_email = req.body.email; // 이후에 정규식을 활용한 이메일 검증 필요("올바른 이메일 형식이 아닙니다")
  var req_password = req.body.password; // 이후에 암호화(hash) 필요.

  var req_gcm_token = req.body.gcm_token;
  var data;

  if (req_gcm_token) {
    data = new UserModel({
      username  : req_username,
      email     : req_email,
      password  : req_password,
      gcm_token : req_gcm_token
    });
  } else {
    data = new UserModel({
      username  : req_username,
      email     : req_email,
      password  : req_password
    });
  }  

  UserModel.findOne({email: req_email}, function(err, docs1) {
    if (err) { return next(err); }
    // docs1으로 이메일 가입여부(true, false)를 확인
    if (docs1) {
      res.json({success: 0, message: "이미 가입된 이메일입니다."});
    } else {
      UserModel.findOne({username: req_username}, function (err, docs2) {
        if (err) { return next(err); }
        //docs2로 유저네임 가입여부(true, false)를 확인
        if (docs2) {
          res.json({success: 0, message: "이미 사용중인 유저네임입니다."})
        } else {
          // UserModel에 입력받은 유저네임, 이메일, 패스워드 저장
          data.save(function (err, docs) {
            if (err) {
              res.json({success: 0, message: "회원가입에 실패했습니다."});
            } else {
              var token = jwt.sign({user_id: docs.user_id}, app.get('tokenSecret'), {expiresIn: 600000}); // 3600초 = 60분
              res.json({
	        success: 1, 
                message: "회원가입이 완료되었습니다.", 
     	        token: token,
		username : docs.username,
	        user_type : docs.user_type,
	        thumbnail_img : ""
	      });
            }  
          });
        }
      });
    }
  });
});

// email login(이메일 로그인)
router.post('/emlogin', function(req, res, next) {
  var req_email = req.body.email;
  var req_password = req.body.password; // 이후에 암호화(hash) 필요.

  var req_gcm_token = req.body.gcm_token;

console.log(req.body.gcm_token);

  UserModel.findOne({ email: req_email }, function(err, docs) {
    if (err) { return next(err); } 
    // 유저 가입여부 및 password 일치여부 확인, 이후에 hash화된 비밀번호와 비교하는 작업 필요
    if (docs && docs.password == req_password) {
      var data = { gcm_token : req_gcm_token };
      if (data.gcm_token) {
        UserModel.findOneAndUpdate({email: req_email}, {$set: data}, function(err, docs2) {
          if (err) { return next(err); }
          // jwt 발행코드 - app.use를 활용한 token 디코드/검증과 tokenSecret 설정(app.set)이 필요.
          var token = jwt.sign({ user_id: docs.user_id }, app.get('tokenSecret'), { expiresIn: 600000 }); // 3600초 = 60분
	  console.log('gcm 받았음');
          res.json({
	    success       : 1, 
	    message       : '로그인 성공', 
	    token         : token,
	    username      : docs.username,
	    user_type     : docs.user_type,
	    thumbnail_img : docs.thumbnail_img
	  });
        });
      } else {
	// jwt 발행코드 - app.use를 활용한 token 디코드/검증과 tokenSecret 설정(app.set)이 필요.
	var token = jwt.sign({ user_id: docs.user_id }, app.get('tokenSecret'), { expiresIn: 600000 }); // 3600초 = 60분
	console.log('gcm 못받았음');
        res.json({ 
	  success: 1, 
	  message: '로그인 성공', 
	  token: token,
	  username : docs.username,
	  user_type : docs.user_type,
	  thumbnail_img : docs.thumnail_img
	});
      }
    } else {
      res.json({ success: 0, message: '이메일/비밀번호를 다시 한 번 확인해주세요.' });
    }
  });
});

module.exports = router;

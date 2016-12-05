var express = require('express');
var router = express.Router();
var app = express();

// JWT 설정
var jwt = require('jsonwebtoken');
var config = require('../config/app');
app.set('tokenSecret', config.secret);

var db = require('../models/db');
require('../models/usermodel');
var UserModel = db.model('User');

router.post('/', function(req, res, next) {
  var token_user_id = req.decoded.user_id;
  var gcm_token = req.body.gcm_token;

console.log("토큰체크1", req.body.gcm_token);

  if (token_user_id == undefined) {
    res.json({ success: 0, message: "옳지 않은 요청입니다"});
  } else {
    var data = { gcm_token : gcm_token };
    UserModel.findOneAndUpdate({user_id: token_user_id}, {$set: data}, function(err, doc) {
      if (err) { return next(err); }
      var token = jwt.sign({user_id: token_user_id}, app.get('tokenSecret'), {expiresIn: 600000});
console.log("새로발급받은 제이슨웹토큰", token);
      res.json({ success: 1, message: "유효한 토큰입니다. 새로운 토큰을 발행합니다.", token: token });
    });    

//    var token = jwt.sign({user_id: token_user_id}, app.get('tokenSecret'), {expiresIn: 600000}); // 3600초 = 60분 24 7
//    res.json({ success: 1, message: "유효한 토큰입니다. 새로운 토큰을 발행합니다.", token: token });
  }
});

module.exports = router;

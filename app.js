var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var auth = require('./routes/auth');
var routes = require('./routes/index');
var users = require('./routes/users');
var books = require('./routes/books');
var proposals = require('./routes/proposals');
var tokencheck = require('./routes/tokencheck');
var mypage = require('./routes/mypage');
var chat = require('./routes/chat');
var noti = require('./routes/noti');

var app = express();

// jwt 설정
var jwt = require('jsonwebtoken');
var config = require('./config/app');
app.set('tokenSecret', config.secret);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
// jwt
app.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, app.get('tokenSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: 0, message: "권한이 없습니다.(토큰 불일치)" }); // 영문메시지: 'Failed to authenticate token.'
      } else {
        req.decoded = decoded;
        next();
      }
    })
  } else {
    return res.json({ success: 0, message: "권한이 없습니다.(토큰 없음)" }); // 영문메시지: 'No token provided.'
  }
});
app.use('/tokencheck', tokencheck);
app.use('/api/1/users', users);
app.use('/api/1/books', books);
app.use('/api/1/proposals', proposals);
app.use('/api/1/mypage', mypage);
app.use('/api/1/chat', chat);
app.use('/api/1/noti', noti);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

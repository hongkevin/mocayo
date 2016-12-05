var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var mongoosePaginate = require('mongoose-paginate');

var uri = 'mongodb://localhost/mocatest';
var options = { server: { poolSize: 100 } };
var db = mongoose.createConnection(uri, options);

autoIncrement.initialize(db);

var ChatScheme = new mongoose.Schema({
  chat_id     : Number, // auto_increment 1부터
  chat_stat   : { type: Boolean, default: true}, // 생성될 때부터 true, 평가완료(E)되면 비활성화(false)
  proposal_id : Number,
  message     : Array, // 배열 안에 object들 - message_id, user_id, content, time으로 구성
  last_time   : Date, // 최신 순을 만들기 위해 필요하겠는데?!!!
  req_user_id : Number,
  res_user_id : Number
});

ChatScheme.plugin(autoIncrement.plugin, {
  model: 'Chat',
  field: 'chat_id',
  startAt: 1,
  incrementBy: 1
});

ChatScheme.plugin(mongoosePaginate);

mongoose.model('Chat', ChatScheme);

var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var mongoosePaginate = require('mongoose-paginate');

var uri = 'mongodb://localhost/mocatest';
var options = { server: { poolSize: 100 } };
var db = mongoose.createConnection(uri, options);

autoIncrement.initialize(db);

var NotiScheme = new mongoose.Schema({
  noti_id      : Number, // auto_increment 1부터
  noti_check   : { type: Boolean, default: false },
  noti_type    : String, // P(요청서 관련), C(채팅 관련)
  noti_message : String, // 1. 요청서가 도착했습니다, 2. 상대방이 요청서를 승인했습니다, 3. 상대방이 요청서를 거절했습니다, 4. 작업상대방을 평가해주세요, 5. 상대방의 평가를 확인해주세요, 6. 채팅메시지가 도착했습니다
  noti_time    : { type: Date, default: Date.now }, // 최신 순을 만들기 위해 필요하겠는데?!!!
  proposal_id  : Number,
  chat_id      : Number,
  req_user_id  : Number, // 노티를 보낸사람(요청서, 채팅)
  res_user_id  : Number // 주인. 받은 사람
});

NotiScheme.plugin(autoIncrement.plugin, {
  model: 'Noti',
  field: 'noti_id',
  startAt: 1,
  incrementBy: 1
});

NotiScheme.plugin(mongoosePaginate);

mongoose.model('Noti', NotiScheme);

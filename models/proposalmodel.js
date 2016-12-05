var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var mongoosePaginate = require('mongoose-paginate');

var uri = 'mongodb://localhost/mocatest';
var options = { server: { poolSize: 100 } };
var db = mongoose.createConnection(uri, options);

autoIncrement.initialize(db);

var ProposalScheme = new mongoose.Schema({
  proposal_id       : Number, // auto_increment 1부터
  proposal_stat     : { type: String, default: "P" }, // 총 5가지 - YNPDE, Y: Yes, N: No, P: Pending(승인대기중), D: Done(작업종료), R: Evaluation Done(평가종료)
  work_day          : Date,
  work_hour         : Number,
  end_time          : Date,
  work_concept      : String,     // 1)컨셉과 2)가격 같이 입력 1개는 필수, 234는 선택. 모델은 컨셉 10개, 작가는 컨셉 6개.
  work_price        : Number, // Hour * price
  work_addr         : Array,     // 시/도 + 시/군/구 1개는 필수, 2, 3은 선택.
  work_desc         : String,
  in_or_out         : String, // I: in(실내), O: out(실외)
  req_time          : { type: Date, default: Date.now },
  req_user_id       : Number,
  res_user_id       : Number,
  no_reason         : String, // 총 4가지 - PDAE, P: Price, D: Date, A: Address, E: etc
  rank              : Array, // 배열 하나마다 평가점수, 평가내용, 평가아이디, 평가시간이 저장됨. - score, comment, user_id, time
  chat_id           : Number
});

ProposalScheme.plugin(autoIncrement.plugin, {
  model: 'Proposal',
  field: 'proposal_id',
  startAt: 1,
  incrementBy: 1
});

ProposalScheme.plugin(mongoosePaginate);

mongoose.model('Proposal', ProposalScheme);

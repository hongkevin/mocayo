var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var mongoosePaginate = require('mongoose-paginate');

var uri = 'mongodb://localhost/mocatest';
var options = { server: { poolSize: 100 } };
var db = mongoose.createConnection(uri, options);

autoIncrement.initialize(db);

var UserScheme = new mongoose.Schema({
  user_id   : Number,
  username  : String,
  email     : String,
  password  : String,
  login_type : String,     // F: facebook, L: local
  user_type  : { type: String, default: "I" },     // I: Invalid(미인증), V: Valid(인증), M: Model, P: Photographer -> 기본가입하면 I, 본인인증하면 V, V중에서 모델/작가 등록하면 각각 M과 P
  thumbnail_img : String,
  realname  : String,    // !!!추가했어요!!!
  ssn     : Number,     // 900714를 입력받아서 age를 산출
  age       : Number,     // age는 2017 - 1990 = 26 더하기 1해서 한국 나이
  gender    : String,     // M: Male, F: Female
  wanted_addr : Array,        // 시/도 + 시/군/구 1개는 필수, 23은 선택.
  concept_price : Array,        // 1)컨셉과 2)가격 같이 입력 1개는 필수, 234는 선택. 모델은 컨셉 10개, 작가는 컨셉 6개.
  pay_type : String,       // P: Pay, F: Free
  portfolio : Array,         // 이미지 최대 10개 업로드 가능(text, 좋아요 없고 사진만).
  introduction : String,          // 최대 50자
  height : { type: Number },
  weight : Number,
  bust : Number,
  waist : Number,
  hip : Number,
  bra : String, // 80A(여기서부터 쭉 필수가 아닌 선택)
  foot : Number, // 260
  top_size : Number,
  job : String,
  career : String,
  prize : String,
  camera : String,
  average_rank : { type: Number, default: 0 },
  rank : Array,               // 점수, 입력자, 텍스트 점수 입력받을 때 둘 다 받음.
  gcm_token : String
});

UserScheme.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'user_id',
  startAt: 1,
  incrementBy: 1
});

UserScheme.plugin(mongoosePaginate);

mongoose.model('User', UserScheme);

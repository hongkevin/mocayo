var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*
router.get('/api/1/books', function(req, res, next) {
  var prev_id = req.query.prev_id
  if (prev_id) {
    res.json({
	"success" : 1,  // number
	"message" : "OK", // string
	"prev_id" : 2,  // number
	"data" : [{
		"book_id" : 7, // number
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg", // string
		"upload_time" : "2016-05-12 23-24-22", // date
		"book_desc" : "어제 사진가님이 찍어주심!", // string
		"like_count" : 2, // number
		"liked" : false, // boolean
		"user_id" : 29188390, // number
		"username" : "kevinHong", // string
		"user_type" : "M", // string(M/P)
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg" // string
	}, {
		"book_id" : 6,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "모델님이 너무 협조를 잘 해주셨음",
		"like_count" : 3,
		"liked" : true,
		"user_id" : 29182338,
		"username" : "tttyyy",
		"user_type" : "P",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg"
	}, {
		"book_id" : 4,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "사랑스러워~",
		"like_count" : 3,
		"liked" : false,
		"user_id" : 29182338,
		"username" : "sexyboy",
		"user_type" : "P",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 3,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "역시 한복이 짱이야!",
		"like_count" : 3,
		"liked" : true,
		"user_id" : 29182338,
		"username" : "otacuotacu",
		"user_type" : "P",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg"
	}, {
		"book_id" : 2,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "비싸보이죠? 모델이?!!!",
		"like_count" : 3,
		"liked" : false,
		"user_id" : 29182338,
		"username" : "superboy",
		"user_type" : "P",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}]
  });
  } else {
   res.json(
{
	"success" : 1,  // number
	"message" : "OK", // string
	"prev_id" : 8,  // number
	"data" : [{
		"book_id" : 13, // number
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg", // string
		"upload_time" : "2016-05-12 23-24-22", // date
		"book_desc" : "어제 사진가님이 찍어주심!", // string
		"like_count" : 2, // number
		"liked" : true, // boolean
		"user_id" : 29188390, // number
		"username" : "kevinHong", // string
		"user_type" : "M", // string(M/P)
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg" // string
	}, {
		"book_id" : 12,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "모델님이 너무 협조를 잘 해주셨음",
		"like_count" : 3,
		"liked" : true,
		"user_id" : 29182338,
		"username" : "TaehoonKim",
		"user_type" : "P",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 11,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "모델 녀석 제법이던데~",
		"like_count" : 3,
		"liked" : false,
		"user_id" : 29182338,
		"username" : "Ensilkangkang",
		"user_type" : "M",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg"
	}, {
		"book_id" : 10,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "이런 느낌의 사진 좋아요!",
		"like_count" : 3,
		"liked" : true,
		"user_id" : 29182338,
		"username" : "sktelecom",
		"user_type" : "P",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg"
	}, {
		"book_id" : 8,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "아~ 자연스러운 버스사진~",
		"like_count" : 3,
		"liked" : false,
		"user_id" : 29182338,
		"username" : "hoony",
		"user_type" : "M",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg"
	}]
    });
  }
});
*/
/*
router.get('/api/1/books/:book_id', function(req, res, next) {
  var book_id = req.params.book_id;
  res.json({
	"success" : 1,  // number
	"message" : "OK", // string
	"data" : {
		"book_id" : 7, // number
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg", // string
		"upload_time" : "2016-05-12 23-24-22", // date
		"book_desc" : "어제 사진가님이 찍어주심!", // string
		"like_count" : 2, // number
		"user_id" : 29188390, // number
		"username" : "kevinHong", // string
		"user_type" : "M", // string(M/P)
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	}
  });
});
*/
/*
router.get('/api/1/users/models', function(req, res, next) {
  var prev_id = req.query.prev_id;
  if (prev_id) { 
    res.json({
	"success" : 1,  // number
	"message" : "OK", // string
	"prev_id" : 2,  // number
	"data" : [{
		"user_id" : 7, // number
		"username" : "KevinHong", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg", // string
		"age" : 27, // number
		"concept" : "스냅", // string
		"wanted_addr" : "서울시 강남구", // string
		"average_rank" : 4 // number
	}, {
		"user_id" : 6,
		"username" : "KimTony",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"age" : 17, 
		"concept" : "단체출사",
		"wanted_addr" : "서울시 강동구",
		"average_rank" : 2.5
	}, {
		"user_id" : 5,
		"username" : "WebStorm",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg",
		"age" : 38,
		"concept" : "개인출사",
		"wanted_addr" : "서울시 은평구",
		"average_rank" : 0
	}, {
		"user_id" : 4,
		"username" : "Tacademy",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"age" : 47,
		"concept" : "누드",
		"wanted_addr" : "경기도 고양시",
		"average_rank" : 1.5
	}, {
		"user_id" : 2,
		"username" : "MocaZzang",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg",
		"age" : 57,
		"concept" : "헤어",
		"wanted_addr" : "인천시 연수구",
		"average_rank" : 0
	}]
  });
  } else {
  res.json({
	"success" : 1,  // number
	"message" : "OK", // string
	"prev_id" : 8,  // number
	"data" : [{
		"user_id" : 13, // number
		"username" : "KevinHong", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg", // string
		"age" : 25, // number
		"concept" : "스냅", // string
		"wanted_addr" : "서울시 강동구", // string
		"average_rank" : 4.5 // number
	}, {
		"user_id" : 12,
		"username" : "HelloBoy",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg",
		"age" : 21, 
		"concept" : "드레스",
		"wanted_addr" : "경기도 수원시",
		"average_rank" : 0
	}, {
		"user_id" : 11,
		"username" : "AndroidKiller",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg",
		"age" : 27,
		"concept" : "한복",
		"wanted_addr" : "경기도 고양시",
		"average_rank" : 3
	}, {
		"user_id" : 10,
		"username" : "Ironman",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"age" : 37,
		"concept" : "성인코스프레",
		"wanted_addr" : "서울시 노원구",
		"average_rank" : 3.5
	}, {
		"user_id" : 8,
		"username" : "CaptinKorea",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"age" : 32,
		"concept" : "피팅",
		"wanted_addr" : "인천시 연수구",
		"average_rank" : 0
	}]
    });
  }  
});
*/

/*
router.get('/api/1/users/photographers', function(req, res, next) {
  var prev_id = req.query.prev_id;
  if (prev_id) {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 14, // number
	"data" : [{
		"user_id" : 18, // number
		"username" : "powersy", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg", // string
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg"
			], // array
		"average_rank" : 4.5 // number
	}, {
		"user_id" : 17,
		"username" : "deskandchair",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg"
			], 
		"average_rank" : 0
	}, {
		"user_id" : 16,
		"username" : "coffeeanddoughnut",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg"
			], 
		"average_rank" : 5
	}, {
		"user_id" : 15,
		"username" : "superpower",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg"
			], 
		"average_rank" : 1.5
	}, {
		"user_id" : 14,
		"username" : "sktktlg",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg"
			], 
		"average_rank" : 3
	}]
    });
  } else {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 19,  // number
	"data" : [{
		"user_id" : 24, // number
		"username" : "superbatman", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg", // string
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg"
			], // array
		"average_rank" : 3 // number
	}, {
		"user_id" : 23,
		"username" : "nicetomeetyou",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg"
			], 
		"average_rank" : 1.5
	}, {
		"user_id" : 22,
		"username" : "pleasehireme",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg"
			], 
		"average_rank" : 0
	}, {
		"user_id" : 21,
		"username" : "ilovekorea",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg"
			], 
		"average_rank" : 5
	}, {
		"user_id" : 19,
		"username" : "hoohoo",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"portfolio" : [
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
			"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg"
			], 
		"average_rank" : 0
	}]
    });
  }
});
*/

/*
router.get('/api/1/mypage', function(req, res, next) {
  var prev_id = req.query.prev_id;
  if (prev_id) {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 3, // number
	"data" : [{
		"book_id" : 7, // number
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg", // string
		"upload_time" : "2016-05-12 23-24-22", // date
		"book_desc" : "어제 사진가님이 찍어주심!", // string
		"like_count" : 22, // number
		"user_id" : 1234, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	}, {
		"book_id" : 6,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
		"upload_time" : "2016-05-11, 10-08-22",
		"book_desc" : "모델님이 너무 협조를 잘 해주셨음",
		"like_count" : 2,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 5,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
		"upload_time" : "2016-05-11, 10-05-22",
		"book_desc" : "누가 보면 전주 한옥마을인줄 알겠음ㅋㅋㅋ",
		"like_count" : 32,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 4,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
		"upload_time" : "2016-05-11, 10-04-22",
		"book_desc" : "날씨 좋은 날에는 역시 길거리로 나가야죠!",
		"like_count" : 3,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 3,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
		"upload_time" : "2016-05-11, 10-03-22",
		"book_desc" : "나름 괜찮았던 듯 해요~",
		"like_count" : 13,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}]
    });
  } else {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : {
		"myself" : true, // Boolean - True: 내 자신의 마이페이지, False: 다른 사람의 마이페이지
		"user_id" : 1234, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"age" : 29, // number
		"average_rank" : 4.5, // number
		"wanted_addr" : "경기도 고양시", // array
		"concept_price" : [
			{
				"concept" : "스냅", // string 
				"price" : 30000 // number
			}, {
				"concept" : "웨딩", 
				"price" : 50000
			}, {
				"concept" : "일반코스프레", 
				"price" : 80000
			}, {
				"concept" : "성인코스프레", 
				"price" : 100000
			}	
		], // array
		"portfolio" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg", //string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	},
	"prev_id" : 8, // number
	"data2" : [{
		"book_id" : 13, // number
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg", // string
		"upload_time" : "2016-05-12 23-24-22", // date
		"book_desc" : "어제 사진가님이 찍어주심!", // string
		"like_count" : 2, // number
		"user_id" : 1234, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	}, {
		"book_id" : 12,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "모델님이 너무 협조를 잘 해주셨음",
		"like_count" : 4,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 11,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
		"upload_time" : "2016-05-11, 09-11-22",
		"book_desc" : "짱짱맨짱짱맨!!!",
		"like_count" : 13,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 10,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
		"upload_time" : "2016-05-11, 08-11-22",
		"book_desc" : "진짜 대박 멋지다ㅎㅎㅎ",
		"like_count" : 31,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 8,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
		"upload_time" : "2016-05-11, 07-11-22",
		"book_desc" : "이런 느낌 너무 좋아요~",
		"like_count" : 322,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}]
    });
  }
});
*/


router.get('/api/1/mypage/detail/md', function(req, res, next) {
  res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : {
		"myself" : true, // Boolean - True: 내 자신의 마이페이지, False: 다른 사람의 마이페이지
		"user_id" : 1234, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"average_rank" : 4.5, // number
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg", // string
		"age" : 29, // number
		"gender" : "F", // string
		"wanted_addr" : [
			"경기도 고양시", // string
			"서울시 강서구",
			"서울시 은평구"
		], // array
		"pay_type" : "P", // string(P:payed, F:free)
		"concept_price" : [
			{
				"concept" : "스냅", // string 
				"price" : 30000 // number
			}, {
				"concept" : "웨딩", 
				"price" : 50000
			}, {
				"concept" : "일반코스프레", 
				"price" : 80000
			}, {
				"concept" : "성인코스프레", 
				"price" : 100000
			}	
		], // array
		"height" : 170, // number
		"weight" : 52, // number
		"bust" : 33, // number
		"waist" : 26, // number
		"hip" : 32, // number
		"introduction" : "안녕하세요. 성실하고 실력있는 모델입니다.", // string
		"job" : "카레이서", // string
		"career" : "2016 패션위크 참가", // string
		"prize" : "2016 패션모델 선발대회 입선", // string
		"foot" : 250, // number
		"top" : 90, // number
		"bra" : "80A" // string
	}
  });
});



router.get('/api/1/mypage/detail/pg', function(req, res, next) {
  res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : {
		"myself" : true, // Boolean - True: 내 자신의 마이페이지, False: 다른 사람의 마이페이지
		"user_id" : 125, // number
		"user_type" : "P", // string
		"username" : "KevinHong", // string
		"average_rank" : 2, // number
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg", // string
		"age" : 32, // number
		"gender" : "M", // string
		"wanted_addr" : [
			"경기도 고양시", // string
			"서울시 강서구",
			"서울시 은평구"
		], // array
		"pay_type" : "F", // string(P:payed, F:free)
		"concept_price" : [
			{
				"concept" : "스냅" // string
			}, {
				"concept" : "피팅" 
			}	
		], // array
		"introduction" : "전문사진가는 아니지만 느낌있게 잘 찍어요.", // string
		"camera" : "니콘 N400", // string
		"job" : "선생님", // string
		"career" : "인사동 사진전 활동", // string
		"prize" : "한국 사진 공모전", // string
	}
  });
});


/*
router.get('/api/1/users/:user_id', function(req, res, next) {
  var prev_id = req.query.prev_id;
  if (prev_id) {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 3, // number
	"data" : [{
		"book_id" : 7, // number
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg", // string
		"upload_time" : "2016-05-12 23-24-22", // date
		"book_desc" : "어제 사진가님이 찍어주심!", // string
		"like_count" : 12, // number
		"user_id" : 1234, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	}, {
		"book_id" : 6,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "모델님이 너무 협조를 잘 해주셨음",
		"like_count" : 0,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 5,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
		"upload_time" : "2016-05-09, 10-11-22",
		"book_desc" : "누가 보면 전주 한옥마을인줄 알겠음ㅋㅋㅋ",
		"like_count" : 23,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 4,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
		"upload_time" : "2016-05-07, 10-11-22",
		"book_desc" : "날씨 좋은 날에는 역시 길거리로 나가야죠!",
		"like_count" : 3,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 3,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
		"upload_time" : "2016-04-11, 10-11-22",
		"book_desc" : "나름 괜찮았던 듯 해요~",
		"like_count" : 9,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}]
    });
  } else {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : {
		"myself" : false, // Boolean - True: 내 자신의 마이페이지, False: 다른 사람의 마이페이지
		"user_id" : 32, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"age" : 29, // number
		"average_rank" : 4.5, // number
		"wanted_addr" : "경기도 고양시", // string
		"concept_price" : [
			{
				"concept" : "스냅", // string 
				"price" : 30000 // number
			}, {
				"concept" : "웨딩", 
				"price" : 50000
			}, {
				"concept" : "일반코스프레", 
				"price" : 80000
			}, {
				"concept" : "성인코스프레", 
				"price" : 100000
			}	
		], // array
		"portfolio" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg", //string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	},
	"prev_id" : 8, // number
	"data2" : [{
		"book_id" : 13, // number
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg", // string
		"upload_time" : "2016-05-12 23-24-22", // date
		"book_desc" : "어제 사진가님이 찍어주심!", // string
		"like_count" : 0, // number
		"user_id" : 1234, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	}, {
		"book_id" : 12,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl.jpg",
		"upload_time" : "2016-05-11, 10-11-22",
		"book_desc" : "제가 볼 때는 이분, 포즈가 죽여요. 아주, 그냥 죽여~줘요~",
		"like_count" : 3,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 11,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
		"upload_time" : "2016-05-10, 10-11-22",
		"book_desc" : "슈퍼맨이 되겠다는 꼬마아이는",
		"like_count" : 13,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 10,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
		"upload_time" : "2016-05-07, 10-11-22",
		"book_desc" : "모델님이 능숙하게 잘 해주심",
		"like_count" : 32,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"book_id" : 8,
		"book_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
		"upload_time" : "2016-05-01, 10-11-22",
		"book_desc" : "뒷모습이 아름다우셨음",
		"like_count" : 311,
		"user_id" : 1234,
		"user_type" : "M",
		"username" : "TaehoonKim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}]
    });
  }    
});
*/

/*
router.get('/api/1/users/:user_id/detail/md', function(req, res, next) {
  res.json({
	"success" : 1,  // number
	"message" : "OK", // string
	"data" : {
		"myself" : false, // Boolean - True: 내 자신의 마이페이지, False: 다른 사람의 마이페이지
		"user_id" : 1234, // number
		"user_type" : "M", // string
		"username" : "TaehoonKim", // string
		"average_rank" : 4.5, // number
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg", // string
		"age" : 29, // number
		"gender" : "F", // string
		"wanted_addr" : [
			"경기도 고양시", // string
			"서울시 강서구",
			"서울시 은평구"
		], // array
		"pay_type" : "P", // string(P:payed, F:free)
		"concept_price" : [
			{
				"concept" : "스냅", // string 
				"price" : 30000 // number
			}, {
				"concept" : "웨딩", 
				"price" : 50000
			}, {
				"concept" : "일반코스프레", 
				"price" : 80000
			}, {
				"concept" : "성인코스프레", 
				"price" : 100000
			}	
		], // array
		"height" : 170, // number
		"weight" : 52, // number
		"bust" : 33, // number
		"waist" : 26, // number
		"hip" : 32, // number
		"introduction" : "안녕하세요. 성실하고 실력있는 모델입니다.", // string
		"job" : "카레이서", // string
		"career" : "2016 패션위크 참가", // string
		"prize" : "2016 패션모델 선발대회 입선", // string
		"foot" : 250, // number
		"top" : 90, // number
		"bra" : "80A" // string
	}
  });
});
*/

/*
router.get('/api/1/users/:user_id/detail/pg', function(req, res, next) {
  res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : {
		"myself" : false, // Boolean - True: 내 자신의 마이페이지, False: 다른 사람의 마이페이지
		"user_id" : 125, // number
		"user_type" : "P", // string
		"username" : "KevinHong", // string
		"average_rank" : 2, // number
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg", // string
		"age" : 32, // number
		"gender" : "M", // string
		"wanted_addr" : [
			"경기도 고양시", // string
			"서울시 강서구",
			"서울시 은평구"
		], // array
		"pay_type" : "F", // string(P:payed, F:free)
		"concept_price" : [
			{
				"concept" : "스냅" // string
			}, {
				"concept" : "피팅" 
			}	
		], // array
		"introduction" : "전문사진가는 아니지만 느낌있게 잘 찍어요.", // string
		"camera" : "니콘 N400", // string
		"job" : "선생님", // string
		"career" : "인사동 사진전 활동", // string
		"prize" : "한국 사진 공모전", // string
	}
  });
});
*/

/*
router.get('/api/1/users/:user_id/portfolio', function(req, res, next) {
  res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : [
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg", // string
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/watch.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/street.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/hanbok.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/back.jpg",
		"https://s3-ap-northeast-1.amazonaws.com/mocatest/bus.jpg"
	] // array
  });
});
*/

/*
router.get('/api/1/proposals', function(req, res, next) {
  var prev_id = req.query.prev_id;
  if (prev_id) {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 27, // number
	"data" : [{
		"requsted": true, // Boolean - true: 내가 요청한 것, false: 내가 요청받은 것
		"proposal_id" : 92, // number
		"proposal_stat" : "Y", // string(P:pending, Y: yes, N: no, D: done, E: evaluation done)
		"work_day" : "2016-05-12 10-52-00", // date
		"work_hour" : 3, // number
		"work_concept" : "데이트", // string
		"work_price" : 30000, // number
		"work_addr" : "서울시 양천구", // string
		"user_id" : 134, // number
		"user_type" : "P", // string
		"username" : "Chikichaka", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg" // string
	}, {
		"requsted": false,
		"proposal_id" : 87,
		"proposal_stat" : "D",
		"work_day" : "2016-05-12 10-43-00",
		"work_hour" : 3,
		"work_concept" : "한복",
		"work_price" : 30000,
		"work_addr" : "서울시 강남구",
		"user_id" : 341,
		"user_type" : "M",
		"username" : "givemeonedollar",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg"
	}, {
		"requsted": true,
		"proposal_id" : 56,
		"proposal_stat" : "N", 
		"work_day" : "2016-05-12 10-36-00",
		"work_hour" : 3,
		"work_concept" : "개인출사",
		"work_price" : 30000,
		"work_addr" : "인천시 연수구",
		"user_id" : 22,
		"user_type" : "P",
		"username" : "rushhour",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}, {
		"requsted": false,
		"proposal_id" : 33,
		"proposal_stat" : "E", 
		"work_day" : "2016-05-12 10-24-00",
		"work_hour" : 2,
		"work_concept" : "피팅",
		"work_price" : 60000,
		"work_addr" : "서울시 관악구",
		"user_id" : 4,
		"user_type" : "P",
		"username" : "pleasehireme",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg"
	}, {
		"requsted": false,
		"proposal_id" : 27,
		"proposal_stat" : "E", 
		"work_day" : "2016-05-12 10-21-00",
		"work_hour" : 3,
		"work_concept" : "데이트",
		"work_price" : 90000,
		"work_addr" : "경기도 용인시",
		"user_id" : 3,
		"user_type" : "P",
		"username" : "syhong0714",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg"
	}]
    });
  } else {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 93, // number 
	"data" : [{
		"requsted": true, // Boolean - true: 내가 요청한 것, false: 내가 요청받은 것
		"proposal_id" : 123, // number
		"proposal_stat" : "P", // string(P:pending, Y: yes, N: no, D: done, E: evaluation done)
		"work_day" : "2016-05-12 10-45-00", // date
		"work_hour" : 3, // number
		"work_concept" : "개인출사", // string
		"work_price" : 30000, // number
		"work_addr" : "서울시 강남구", // string
		"user_id" : 4, // number
		"user_type" : "P", // string
		"username" : "Chikichaka", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg" // string
	}, {
		"requsted": false,
		"proposal_id" : 121,
		"proposal_stat" : "D", 
		"work_day" : "2016-05-12 10-43-00",
		"work_hour" : 2,
		"work_concept" : "드레스",
		"work_price" : 60000,
		"work_addr" : "서울시 양천구",
		"user_id" : 3,
		"user_type" : "M",
		"username" : "showmethemoney",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg"
	}, {
		"requsted": true,
		"proposal_id" : 101,
		"proposal_stat" : "N", 
		"work_day" : "2016-05-12 10-22-00",
		"work_hour" : 5,
		"work_concept" : "성인코스프레",
		"work_price" : 500000,
		"work_addr" : "서울시 노원구",
		"user_id" : 22,
		"user_type" : "P",
		"username" : "nodejsandmongodb",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg"
	}, {
		"requsted": false,
		"proposal_id" : 97,
		"proposal_stat" : "Y", 
		"work_day" : "2016-05-12 10-20-00",
		"work_hour" : 2,
		"work_concept" : "한복",
		"work_price" : 40000,
		"work_addr" : "서울시 은평구",
		"user_id" : 34,
		"user_type" : "P",
		"username" : "poweroverwhelming",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg"
	}, {
		"requsted": false,
		"proposal_id" : 93,
		"proposal_stat" : "E", 
		"work_day" : "2016-05-12 10-09-00",
		"work_hour" : 4,
		"work_concept" : "피팅",
		"work_price" : 40000,
		"work_addr" : "경기도 고양시",
		"user_id" : 31,
		"user_type" : "P",
		"username" : "SuperHero",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg"
	}]
    });
  }
});
*/
/*
router.get('/api/1/proposals/:proposal_id', function(req, res, next) {
  res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : {
		"requested" : true, // true: 내가 요청한 요청서, false: 내가 요청"받은" 요청서
		"proposal_id" : 123, // number
		"proposal_stat" : "P", // string(P:pending, Y: yes, N: no, D: done, E: evaluation done)
		"work_day" : "2016-05-18T00:48:27.790Z", // date - 사진작업하는 시간(날짜)
		"work_hour" : 3, // number
		"work_concept" : "스냅", 
		"work_price" : 30000,
		"work_addr" : [
			"서울시 양천구",
			"서울시 강서구",
			"서울시 은평구"
		], // array(값은 string)
		"work_desc" : "양천구 근처 목동공원에서 3시간 찍고 싶습니다.", // string
		"in_or_out" : "O", // string(I:in, O:out)
		"req_time" : "2016-05-04 13-22-34", // date - 요청서를 보낸 시각
		"user_id" : 34, // number
		"user_type" : "M", // string
		"username" : "Chikichaka", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg", // string
		"no_reason" : "P", // string(P:price, D:date, A:address, E:etc) - "proposal_stat" 이 "N"일 경우에만 있음!
		"rank" : [{ 
			"score_by_me" : 3, 
			"comment_by_me" : "생각보다 별로였어요.", 
			"rank_time": "2016-06-02 10-23-48"
			}, {
			"score_by_him" : 4, 
			"comment_by_him" : "괜찮았음!!!", 
			"rank_time": "2016-06-03 12-21-44"
			}
		], 
		"chat_id" : 23
	}
  });
});
*/
router.get('/api/1/noti', function(req, res, next) {
  var prev_id = req.query.prev_id;
  if (!prev_id) {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 83, // number
	"data" : [{
		"noti_id" : 123, // number
		"noti_type" : "Y", // string (P:요청서도착, Y:승인, N:거절, C:채팅)
		"noti_message" : "요청서를 승인했습니다.", // string
		"noti_check" : false, // Boolean (true:내가 확인함, false: 내가 미확인)
		"noti_time" : "2016-05-12 10-11-02", // date
		"user_id" : 22, // number
		"username" : "TonyKim", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg", // string
		"proposal_id" : 34, // number
		"chat_id" : 32 // number - null 값일 수 있음. 다시 말해, 요청서는 보냈지만/받았지만 채팅이 진행되지 않을 수도 있음.
	}, {
		"noti_id" : 111,
		"noti_type" : "N",
		"noti_message" : "요청서를 거절했습니다.",
		"noti_check" : false,
		"noti_time" : "2016-05-12 09-11-02",
		"user_id" : 222, 
		"username" : "googleplus",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg",
		"proposal_id" : 34,
		"chat_id" : 32
	}, {
		"noti_id" : 102,
		"noti_type" : "C",
		"noti_message" : "채팅메시지가 도착했습니다.",
		"noti_check" : true,
		"noti_time" : "2016-05-12 08-11-02",
		"user_id" : 221, 
		"username" : "naverline",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"proposal_id" : 34,
		"chat_id" : 32
	}, {
		"noti_id" : 96,
		"noti_type" : "C",
		"noti_message" : "채팅메시지가 도착했습니다.",
		"noti_check" : true,
		"noti_time" : "2016-05-12 07-11-02",
		"user_id" : 122, 
		"username" : "daumkakao",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"proposal_id" : 34,
		"chat_id" : 32
	}, {
		"noti_id" : 83,
		"noti_type" : "P",
		"noti_message" : "요청서가 도착했습니다.",
		"noti_check" : true,
		"noti_time" : "2016-05-12 04-11-02",
		"user_id" : 2, 
		"username" : "powersw",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg",
		"proposal_id" : 34,
		"chat_id" : 32
		}
	]
    });
  } else {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 33, // number
	"data" : [{
		"noti_id" : 82, // number
		"noti_type" : "Y", // string(P:요청서도착, Y:승인, N:거절, C:채팅)
		"noti_message" : "요청서를 승인했습니다.", // string
		"noti_check" : false, // Boolean(true:확인함, false: 미확인)
		"noti_time" : "2016-05-12 10-11-02", // date
		"user_id" : 22, // number
		"username" : "passmetheball", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg", // string
		"proposal_id" : 31, // number
		"chat_id" : 31 // number
	}, {
		"noti_id" : 66,
		"noti_type" : "N",
		"noti_message" : "요청서를 거절했습니다.",
		"noti_check" : false,
		"noti_time" : "2016-05-11 09-11-02",
		"user_id" : 222, 
		"username" : "pingpongking",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"proposal_id" : 37,
		"chat_id" : 37
	}, {
		"noti_id" : 55,
		"noti_type" : "C",
		"noti_message" : "채팅메시지가 도착했습니다.",
		"noti_check" : true,
		"noti_time" : "2016-05-10 08-11-02",
		"user_id" : 221, 
		"username" : "financeking",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"proposal_id" : 4,
		"chat_id" : 2
	}, {
		"noti_id" : 44,
		"noti_type" : "C",
		"noti_message" : "채팅메시지가 도착했습니다.",
		"noti_check" : true,
		"noti_time" : "2016-04-12 07-11-02",
		"user_id" : 122, 
		"username" : "flittovsgoogle",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg",
		"proposal_id" : 134,
		"chat_id" : 312
	}, {
		"noti_id" : 38,
		"noti_type" : "P",
		"noti_message" : "요청서가 도착했습니다.",
		"noti_check" : true,
		"noti_time" : "2016-03-12 04-11-02",
		"user_id" : 2, 
		"username" : "chattingcat",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg",
		"proposal_id" : 134,
		"chat_id" : 132
		}
	]
    });
  }
});

router.get('/api/1/chat', function(req, res, next) {
  var prev_id = req.query.prev_id;
  if (prev_id) {
    res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 66, // number
	"data" : [{
		"chat_id" : 92, // number
		"chat_stat" : true, // Boolean - true: 활성화(아직 채팅 진행중), false: 채팅 종료(이미 작업 종료되어 채팅이 필요 없음)
		"proposal_id" : 342, // number
		"user_id" : 392, // number
		"user_type" : "P", // string
		"username" : "helltokyo", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg", // string
		"message_content" : "hello~ my friend!!!", // string
		"message_time" : "2016-05-07 10-11-02" // date
	}, {
		"chat_id" : 88,
		"chat_stat" : false,
		"proposal_id" : 347,
		"user_id" : 39,
		"user_type" : "M",
		"username" : "vimvimvim",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"message_content" : "교복 촬영 가능한가요?",
		"message_time" : "2016-05-06 10-10-02"
	}, {
		"chat_id" : 79,
		"chat_stat" : true,
		"proposal_id" : 314,
		"user_id" : 29,
		"user_type" : "M",
		"username" : "bigsmall",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
		"message_content" : "10시면 아침 10시 말하시는거죠?",
		"message_time" : "2016-05-05 10-01-02"
	}, {
		"chat_id" : 71,
		"chat_stat" : false,
		"proposal_id" : 134,
		"user_id" : 391,
		"user_type" : "P",
		"username" : "middleschool",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg",
		"message_content" : "가격이 너무 싼데 조금만 더 주세요ㅠ",
		"message_time" : "2016-04-09 09-11-02"
	}, {
		"chat_id" : 66,
		"chat_stat" : true,
		"proposal_id" : 234,
		"user_id" : 192,
		"user_type" : "M",
		"username" : "preharvard",
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
		"message_content" : "어제 잘 들어가셨어요?",
		"message_time" : "2016-04-08 08-11-02"
		}
	]
    });
  } else {
  res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"prev_id" : 93, // number
	"data" : [{
	    "chat_id" : 123, // number
	    "chat_stat" : true, // Boolean - true: 활성화(아직 이야기 진행중), false: 채팅 종료(이미 작업 종료)
	    "proposal_id" : 342, // number	
	    "user_id" : 32, // number
	    "user_type" : "M", // string
	    "username" : "Welcometohell", // string
	    "thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg", // string
	    "message_content" : "안녕하세요~ 많이 놀랬죠?", // string
	    "message_time" : "2016-05-12 10-11-02" // date
	}, {
   	    "chat_id" : 122,
	    "chat_stat" : false,
	    "proposal_id" : 347,
	    "user_id" : 3,
	    "user_type" : "M",
	    "username" : "EgyptInAfrica",
	    "thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
 	    "message_content" : "작업 마무리 하고 들어가셨나요?",
	    "message_time" : "2016-05-11 10-10-02"
	}, {
	    "chat_id" : 113,
	    "chat_stat" : true,
	    "proposal_id" : 314,
	    "user_id" : 2,
	    "user_type" : "M",
	    "username" : "BigBrother",
	    "thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl3.jpeg",
	    "message_content" : "내일 9시에 뵙기로 한 거, 10시로 바꾸면 어떨까요?",
	    "message_time" : "2016-05-10 10-01-02"
	}, {
	    "chat_id" : 133,
	    "chat_stat" : false,
	    "proposal_id" : 134,
	    "user_id" : 321,
	    "user_type" : "P",
	    "username" : "Avatar",
	    "thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl1.jpeg",
	    "message_content" : "가격이 너무 싼 거 같은데...",
	    "message_time" : "2016-05-09 09-11-02"
	}, {
	    "chat_id" : 213,
	    "chat_stat" : true,
	    "proposal_id" : 234,
	    "user_id" : 132,
	    "user_type" : "M",
	    "username" : "ManInBlack",
	    "thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/boy1.jpeg",
	    "message_content" : "혹시 전화번호 좀 알려주실래요?",
	    "message_time" : "2016-05-08 08-11-02"
	    }
	]
    });
  }
});

router.get('/api/1/chat/:chat_id', function(req, res, next) {
  res.json({
	"success" : 1, // number
	"message" : "OK", // string
	"data" : {
		"chat_id" : 123, // number
		"chat_stat" : true, // boolean - true:활성화, false:비활성화
		"proposal_id" : 34, // number
		"message" : [{
			"message_id" : 12, // number
			"user_id" : 13, // number - user_id로 전달하며, client가 user_id를 기준으로 내가 보낸 메시지인지, 받은 메시지인지 구분
			"content" : "안녕하세요~", // string
			"time" : "2016-05-12 10-11-02" // date
		}, {
			"message_id" : 13,
			"user_id" : 32,
			"content" : "안녕하세요~",
			"time" : "2016-05-12 10-13-02"
		}, {
			"message_id" : 14,
			"user_id" : 32,
			"content" : "이번 주 일요일에 시간되세요?",
			"time" : "2016-05-12 10-14-02"
		}], // array
		"user_id" : 32, // number
		"username" : "KevinHong", // string
		"user_type" : "M", // string
		"thumbnail_img" : "https://s3-ap-northeast-1.amazonaws.com/mocatest/girl2.jpg", // string
		"age" : 28, // number
		"concept" : "스냅", // string
		"address" : "서울시 강남구", // string
		"average_rank" : 4.5 // number
	}
  });
});

module.exports = router;

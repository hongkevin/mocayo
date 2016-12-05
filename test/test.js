var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');

describe('Routing', function(){
  var url = 'http://ordernow.co.kr:8080';
 
/* 
  before(function(done) {
    mongoose
  });
*/

  describe('emlogin', function() {
    it('should return error to type wrong password', function(done) {
      var profile = {
	email : 'ucccuccc_@naver.com',
	password : 1233 
      };

      request(url)
      .post('/auth/emlogin')
      .send(profile)
      .expect('content-type', /json/)
      .expect(200)
      .end(function(err, res) {
        // if (err) { return next(err); }
 	res.status.should.equal(200);
	res.body.success.should.equal(0);
	done();
      });
    });
    
    it('should return success to be logined', function(done) {
      var profile = {
        email : 'ucccuccc_@naver.com',
        password : 1234
      };

      request(url)
      .post('/auth/emlogin')
      .send(profile)
      .expect('content-type', /json/)
      .expect(200)
      .end(function(err, res) {
        // if (err) { return next(err); }
        res.status.should.equal(200);
        res.body.success.should.equal(1);
        res.body.user_type.should.equal('I');
        res.body.username.should.equal('jjo');
        done();
/*
       var token = res.body.token;

        it('should return newsfeed from book collection', function(done) {
	  request(url)
	  .get('/api/1/books')
	  .send
	  
	});
*/
      });
    });




  });
});












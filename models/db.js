var mongoose = require('mongoose');

var uri = 'mongodb://localhost/mocatest';
var options = {
  server: { poolSize: 100 }
};

var db = mongoose.createConnection(uri, options);

db.on('error', function(err) {
  if (err) { console.error('db err: ', err); }
});

db.once('open', function callback() {
  console.info('MongoDB connected successfully');
});

module.exports = db;

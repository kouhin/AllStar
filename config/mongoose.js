var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');

module.exports = function (app, config) {

  // Connect to mongodb
  var connect = function () {
    mongoose.connect(config.mongo.uri, config.mongo.options);
  };
  connect();

  mongoose.connection.on('error', console.log);
  mongoose.connection.on('disconnected', connect);

  // Bootstrap models
  fs.readdirSync(path.join(__dirname, '/..', '/models')).forEach(function (file) {
    if (~file.indexOf('.js')) require(path.join(__dirname + '/..', '/models', file));
  });

  return mongoose;
};
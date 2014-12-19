var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var crypto = require('crypto');
var AllStar = require('../lib/AllStar.js');

router.get('/', function (req, res) {
    return res.render("master");
});

router.get('/clear', function(req, res) {
    return res.render("clear");
});

router.post('/clear', function(req, res) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(req.body.password);
    if('96fa7b5e08020a60c9d524ef0aaf3e91' !== md5sum.digest('hex')) {
        return res.send('Error');
    }
    User.remove({}, function(err) {
      if(err) {
          return res.send(err);
      }
      AllStar.state.init();
      return res.send("Clear Success"); 
    });
});

module.exports = exports = router;

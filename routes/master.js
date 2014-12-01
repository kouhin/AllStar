var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    //return res.render('index');
    return res.send("hello");
});

module.exports = exports = router;
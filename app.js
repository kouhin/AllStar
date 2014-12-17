/**
 * express server setting
 **/
var express = require('express');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
// var session = require('express-session');
var session = require('cookie-session');
var path = require('path');
var config = require('./config/config');
var basicAuth = require('basic-auth-connect');

var app = express();

require('./config/mongoose')(app, config);

// all environments
app.all('/master', basicAuth(function(user, password) {
    return user === 'master' && password === 'amebapass';
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(favicon());
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride(function (req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		var method = req.body['_method'];
		delete req.body['_method'];
		return method;
	}
}));

app.use(cookieParser());
app.use(session({
  keys:['iYrGXU6oHwLPYry764c9eIsBg0lbozgv']
}));
app.use(express.static(path.join(__dirname, 'public')));

var index = require('./routes/index');
var master = require('./routes/master');

app.use('/', index);
app.use('/master', master);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;

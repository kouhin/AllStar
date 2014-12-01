/**
 * express server setting
 **/
var express = require('express'),
	// favicon = require('serve-favicon'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	path = require('path'),
	config = require('./config/config');

var app = express();

require('./config/mongoose')(app, config);

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(favicon());
app.use(morgan('dev'));
app.use(bodyParser.json);
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
	secret: 'iYrGXU6oHwLPYry764c9eIsBg0lbozgv',
	resave: true,
	saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/master', require('./routes/master'));

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

module.exports = exports = app;
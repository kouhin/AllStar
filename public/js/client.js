require.config({
	baseUrl: '',
	paths: {
		lodash: 'js/lib/lodash',
		chikuwa: 'js/lib/chikuwa',
		tofu: 'js/lib/tofu',
		view: 'js/client/view'
	},
	urlArgs: 'bust=' + (new Date()).getTime()
});

define(['lodash', 'chikuwa', 'view'], function (_, $, view) {

	var socket = io.connect(location.origin),
		_id = $.storage('_ASD_ID');

	// check registered
	if (_id) {
		socket.emit('register', {_id: _id});
	} else {
		var top = view.top();
		top.on('submit', function(name) {
			socket.emit('register', {name: name});
		});
	}

	socket.on('invalid_id', function() {
		_id = null;
		$.storage('_ASD_ID', _id);
		var top = view.top();
		top.on('submit', function(name) {
			socket.emit('register', {name: name});
		});
	});

	socket.on('registered', function (user) {
		user = user || {};
		view.resistered();

		_id = user._id;
		$.storage('_ASD_ID', user._id);
	});

	socket.on('entry:start', function (data) {
		console.log('entry:exit');
	});

	socket.on('entry:exit', function (data) {
		console.log('entry:exit');
		view.entry('exit', data);
	});

	socket.on('q:show', function (data) {
		view.quiz('show', data);
	});

	socket.on('q:start', function (data) {
		var content = view.quiz('start', data);
		content.once('answer', function(num) {
			socket.emit('q:answer', {_id: _id, answer: num});
		});
	});

	socket.on('q:timeup', function (data) {
		view.quiz('timeup', data);
	});

	socket.on('q:check', function (data) {
		view.quiz('check', data);
	});

	socket.on('q:answer', function (data) {
		view.quiz('answer', data);
	});

	socket.on('q:ranking', function (data) {
		view.quiz('ranking', data);
	});

	socket.on('all:ranking', function (data) {
		view.all('ranking', data);
	});

	socket.on('all:ending', function (data) {
		view.all('ending', data);
	});

});

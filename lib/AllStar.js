'use strict';
var _ = require('lodash');
var question = require('./test').data;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var async = require('async');

/**
 * @class
 */
var AllStar = {};

/**
 * register
 *
 * @param {string} clientId
 * @param {object} data
 * @param {function} callback
 */
AllStar.register = function (clientId, data, callback) {
    // get user from list
    async.waterfall([function (next) {
        if(data._id) {
            return User.findById(data._id, function(err, user) {
                if(err) return next(err);
                if(!user) {
                    return next('invalid_id');
                } else {
                    return next(null, user);
                }
            });
        } else {
            return next(null, null);
        }
    }, function (user, next) {
        if (user) {
            // update
            user.clientId = clientId;
        } else {
            // insert
            user = new User({
                clientId: clientId,
                name: data.name
            });
        }
        user.save(next);
    }], function (err, user) {
        callback(err, user);
    });
};

/**
 * get registered number
 * @param callback (err, count)
 */
AllStar.getRegistered = function (callback) {
    User.count(function(err, count) {
        callback(err, count);
    });
};


AllStar.getData = function (state, callback) {
    var states = state.split(':');
    switch (states[0]) {
        case 'entry':
            return User.count({}, function(err, result) {
                callback(err, result);
            });
            break;
        case 'q':
            return getQData(state, callback);
            break;
        case 'all':
            return getAllData(state, callback);
            break;
    }
};

function getQData(state, callback) {
    var data,
        states = state.split(':'),
        id = parseInt(states[2], 10),
        q = _.find(question, {id: id});

    switch (states[1]) {
        case 'show':
            return callback(null, {
                id: id,
                question: q.question
            });
        case 'start':
            return callback(null, {
                id: id,
                question: q.question,
                type: q.type,
                answerList: q.answerList
            });
        case 'timeup':
            return callback(null, {});
        case 'check':
            //answerCounter.id = id;
            //return callback(null, answerCounter);
            return getAnsweredCount(id, callback);
        case 'answer':
            return callback(null, {
                id: id,
                answer: q.answer
            });
        case 'ranking':
            return getCorrectAnswerList(id, function (err, correctAnswerList) {
                if (err) {
                    return callback(err, null);
                }
                data = {
                    id: id,
                    ranking: rankingSort(correctAnswerList)
                };
                return callback(null, data);
            });
    }
}

function getAnsweredCount(questionId, callback) {
    return async.waterfall([function(next) {
        User.find({
            answerList: {
                $elemMatch: {
                    id: questionId
                }
            }
        }, next)
    }, function(userList, next) {
        var answerCounter = {
            1: 0,
            2: 0,
            3: 0,
            4: 0
        };

        _.each(userList, function (user, index) {
            var answer = _.find(user.answerList, function(answer) {
                return answer.id == questionId;
            });
            answerCounter[answer.answer]++;
        });
        next(null, answerCounter);
    }], function(err, result) {
        return callback(err, result);
    });
}

function getCorrectAnswerList(questionId, callback) {
    return async.waterfall([function(next) {
        User.find({
            answerList: {
                $elemMatch: {
                    id: questionId,
                    flg: true
                }
            }
        }, next);
    }, function(userList, next) {
        var list = _.map(userList, function(user) {
            var data = {}; // name, id, time
            data.name = user.name;
            data.id = questionId;
            var answer = _.findLast(user.answerList, function(e) {
                return e.id == questionId;
            });
            data.time = answer.time;
            return data;
        });
        next(null, list);
    }],function(err, result) {
        callback(err, result);
    });
}

/**
 * ranking sort
 * @param {Array} list Answers List
 */
function rankingSort(list) {
    var result = _.sortBy(list, function (user) {
        return ~~user.time;
    });

    _.each(result, function (user, index) {
        user.rank = index + 1;
    });

    return result;
}

/**
 * all ranking sort
 */
function allRankingSort(cluster, callback) {
    var result = [];

    // cluster width correct answer
    var _cluster = {};
    _.each(cluster, function (v, k) {
        _cluster[k] = _.sortBy(v, function (user) {
            return ~~user.time;
        });
    });

    var __cluster = _.sortBy(_cluster, function (v, k) {
        return ~~k;
    });

    for (var i = 0, l = __cluster.length; i < l; i++) {
        var t = l - i - 1;
        result = result.concat(__cluster[t]);
    }

    _.each(result, function (user, index) {
        user.rank = index + 1;
    });

    return callback(null, result);
}

/**
 * get All Ranking
 *
 * @param callback
 * @returns {*}
 */
function getAllRanking(callback) {
    async.waterfall([function(next) {
        return User.find({}, next);
    }, function (userList, next) {
        var cluster = {};
        _.each(userList, function (user) {
            var answer = user.answerList;
            var count = 0;
            var timeCount = 0;
            _.each(answer, function (ans) {
                if (ans.flg) {
                    count++;
                    timeCount += ans.time;
                }
            });
            if (!cluster[count]) {
                cluster[count] = [];
            }
            cluster[count].push({
                id: user.id,
                name: user.name,
                time: timeCount,
                count: count
            });
        });
        return next(null, cluster);
    }, function(cluster, next) {
        return allRankingSort(cluster, next);
    }], function(err, result) {
        return callback(err, result);
    });
}

/**
 * get all data
 */
function getAllData(state, callback) {
    var states = state.split(':');
    switch (states[1]) {
        case 'ranking':
            return getAllRanking(function(err, ranking) {
                return callback(err, {
                    ranking: ranking,
                    border: states[2]
                });
            });
            break;
        case 'end':
            return callback();
            break;
        case 'ending':
            return getAllRanking(function(err, ranking) {
                return callback(err, {
                    ranking: ranking,
                    border: states[2]
                });
            });
            break;
    }
}

/**
 * answer
 */
AllStar.answer = function (data, callback) {
    /*
     data: {
        _id: data._id,
        answer: data.answer,
        time: AllStar.timer.get()
    }
    */

    var self = this;
    var state = self.state.get();
    var states = state.split(':');
    var questionId = parseInt(states[2]);

    var q = _.find(question, {id: questionId});
    var ans = q.answer;

    async.waterfall([function(next){
        return User.findById(data._id, next);
    }, function(user, next) {
        if (!user) {
            return callback('user_not_exist', {_id: data._id});
        }
        var already = _.find(user.answerList, {id: questionId});
        if (already) {
            return callback('already_answered', {
                _id: data._id,
                questionId: questionId
            });
        }

        user.answerList.push({
            id: questionId,
            flg: data.answer == ans,
            time: data.time,
            answer: data.answer
        });
        user.save(next);
    }], function(err, user) {
        callback(err, user);
    });
};

AllStar.state = {
    state: 0,
    stateList: [],
    init: function () {
        var self = this;
        self.state = 0;
        self.stateList = [];
        self.stateList.push('entry:start');
        self.stateList.push('entry:exit');

        _.each(question, function (q) {
            var id = q.id;
            self.stateList.push('q:show:' + q.id);
            self.stateList.push('q:start:' + q.id);
            self.stateList.push('q:timeup:' + q.id);
            self.stateList.push('q:check:' + q.id);
            self.stateList.push('q:answer:' + q.id);
            self.stateList.push('q:ranking:' + q.id);
        });

        self.stateList.push('all:end');
        /*		self.stateList.push('all:ranking:50');
         self.stateList.push('all:ranking:20');*/
        self.stateList.push('all:ranking:5');
        self.stateList.push('all:ranking:4');
        self.stateList.push('all:ranking:3');
        self.stateList.push('all:ranking:2');
        self.stateList.push('all:ranking:1');
        self.stateList.push('all:ending');
        return self.stateList[0];
    },

    get: function () {
        var self = this;
        return self.stateList[self.state];
    },

    next: function () {
        var self = this;
        if ((self.state + 1) < _.size(self.stateList)) {
            self.state++;
        }
        return self.stateList[self.state];
    }
};


AllStar.timer = {
    state: null,
    time: null,
    start: function () {
        var self = this;
        self.set(new Date());
        self.state = 'start';
    },
    stop: function () {
        self.state = 'stop';
    },
    set: function (time) {
        this.time = time;
    },
    get: function () {
        var self = this;
        var now = new Date();
        return (now - self.time) / 1000;
    }
};

module.exports = exports = AllStar;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    clientId: {type: String, default: '', required: true},
    name: {type: String, default: '', required: true},
    answerList: []
});

mongoose.model('User', UserSchema);
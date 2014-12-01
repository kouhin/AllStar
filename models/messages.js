var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var MessageSchema = new Schema({
    room: {type: ObjectId, ref: 'Room', required: true},
    user: {type: ObjectId, ref: 'User', required: true},
    message: {type: String, default: '', required: true},
    created_at: {type: Date, default: Date.now(), required: true}
});

MessageSchema.post('save', function(message) {
});

mongoose.model('Message', MessageSchema);
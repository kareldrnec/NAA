// schema of User in NAA
// username (String), email(String), password(String)

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    userSurname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },  
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('User', userSchema);
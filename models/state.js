const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var stateSchema = new Schema({
    stateName: {
        type: String,
        required: true
    },
    projectID: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    }
});

stateSchema.index({ "stateName": 1, "projectID": 1}, {unique: true});

module.exports = mongoose.model('State', stateSchema);
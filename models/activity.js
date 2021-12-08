const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    activityName: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        required: true
    },
    fromState: {
        type: String,
        required: true
    },
    toState: {
        type: String,
        required: true
    },
    values: {
        type: Array,
        default: []
    },
    description: {
        type: String
    },
    projectID: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('Activity', activitySchema);
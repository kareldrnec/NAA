const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var activitySchema = new Schema({
    activityName: {
        type: String,
        trim: true,
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
    timeUnit: {
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

activitySchema.index({ "activityName": 1, "projectID": 1 }, { unique: true });

module.exports = mongoose.model('Activity', activitySchema);
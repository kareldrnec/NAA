const ActivityModel = require('../models/activity');

var app = require('../app');


exports.addActivity = async(activityName, activityType, fromState, toState, valuesArr, description, projectID) => {
    try {
        var activity = new ActivityModel({
            activityName: activityName,
            activityType: activityType,
            fromState: fromState,
            toState: toState,
            values: valuesArr,
            description: description,
            projectID: projectID
        })

        // ukladam aktivitu
        await activity.save();

        app.io.emit('new activity', activity);
    } catch (err) {
        app.io.emit('error activity');
    }
}

// TODO
exports.editActivity = async(activityID, activityName, activityType, activityDescription, activityValues) => {
    try {
        await ActivityModel.findByIdAndUpdate(activityID, {
            activityName: activityName,
            activityType: activityType,
            description: activityDescription,
            values: activityValues
        });
        app.io.emit('edit activity', activityID, activityName, activityType, activityDescription, activityValues);
    } catch (err) {
        app.io.emit('error activity');
    }
}

// TODO 
exports.deleteActivity = async(activityID) => {
    try {
        await ActivityModel.findByIdAndDelete(activityID);
        app.io.emit('delete activity', activityID);
    } catch (err) {
        app.io.emit('error activity');
    }
}
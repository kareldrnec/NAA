const ActivityModel = require('../models/activity');

var app = require('../app');


exports.addActivity = async(activityName, activityType, fromState, toState, valuesArr, description, projectID) => {
    try {
        let activity = new ActivityModel({
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
exports.editActivity = async() => {
    try {

    } catch (err) {
        app.io.emit('error activity');
    }
}

// TODO 
exports.deleteActivity = async(activityID) => {
    try {
        console.log("Jsem tu a budu mazat")
        await ActivityModel.findByIdAndDelete(activityID);
        app.io.emit('delete activity', activityID);
    } catch (err) {
        app.io.emit('error activity');
    }
}
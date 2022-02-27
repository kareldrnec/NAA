const ActivityModel = require('../models/activity');

var app = require('../app');

// TODO po vypoctu a simulaci, osetrit vstupni cisla
exports.addActivity = async(activityName, activityType, fromState, toState, timeUnit, valuesArr, description, projectID) => {
    try {
        var activity = new ActivityModel({
            activityName: activityName,
            activityType: activityType,
            fromState: fromState,
            toState: toState,
            timeUnit: timeUnit,
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
exports.editActivity = async(activityID, activityName, activityType, activityDescription, editedTimeUnit, activityValues) => {
    try {
        console.log("Edituju")

        console.log(editedTimeUnit)

        console.log("/////")
        await ActivityModel.findByIdAndUpdate(activityID, {
            activityName: activityName,
            activityType: activityType,
            description: activityDescription,
            timeUnit: editedTimeUnit,
            values: activityValues
        });
        console.log("Editovano")
        app.io.emit('edit activity', activityID, activityName, activityType, activityDescription, editedTimeUnit, activityValues);
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
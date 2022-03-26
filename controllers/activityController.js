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
        await activity.save();
        app.io.emit('new activity', activity);
    } catch (err) {
        if (err.code == 11000) {
            app.io.emit('error activity', 1, 'add');
        } else {
            app.io.emit('error activity', 0, 'add');
        }
    }
}

// TODO
// ceknout zda mohu zmenit aktivitu na dummy nebo ne, pripadne vyvolat error!!!
exports.editActivity = async(activityID, activityName, activityType, activityDescription, editedTimeUnit, activityValues) => {
    try {
        await ActivityModel.findByIdAndUpdate(activityID, {
            activityName: activityName,
            activityType: activityType,
            description: activityDescription,
            timeUnit: editedTimeUnit,
            values: activityValues
        });
        app.io.emit('edit activity', activityID, activityName, activityType, activityDescription, editedTimeUnit, activityValues);
    } catch (err) {
        if(err.code == 11000) {
            app.io.emit('error activity', 1, 'edit');
        } else {
            app.io.emit('error activity', 0, 'edit');
        }
    }
}

// TODO 
exports.deleteActivity = async(activityID) => {
    try {
        await ActivityModel.findByIdAndDelete(activityID);
        app.io.emit('delete activity', activityID);
    } catch (err) {
        app.io.emit('error activity', 0, 'delete');
    }
}
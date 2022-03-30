const ActivityModel = require('../models/activity');
const ProjectModel = require('../models/project');
const StateModel = require('../models/state');

var app = require('../app');

// TODO po vypoctu a simulaci, osetrit vstupni cisla
exports.addActivity = async (activityName, activityType, fromStateID, toStateID, timeUnit, valuesArr, description, projectID) => {
    try {
        var fromState, toState, dummyActivity;
        if (activityType == "dummy") {
            fromState = await StateModel.findById(fromStateID);
            toState = await StateModel.findById(toStateID);
            dummyActivity = await ActivityModel.findOne({
                $and: [
                    { fromState: fromStateID },
                    { toState: toStateID },
                    { activityType: "dummy"}
                ]
            });
            if (fromState.stateName == "Start" || toState.stateName == "Finish") throw new Error("dummyErr1");
            if (dummyActivity) throw new Error("dummyErr2");
        }
        var activity = new ActivityModel({
            activityName: activityName,
            activityType: activityType,
            fromState: fromStateID,
            toState: toStateID,
            timeUnit: timeUnit,
            values: valuesArr,
            description: description,
            projectID: projectID
        })
        await activity.save();
        await ProjectModel.findByIdAndUpdate(projectID, {
            lastModified: Date.now()
        });
        app.io.emit('new activity', activity);
    } catch (err) {
        if (err.code == 11000) {
            app.io.emit('error activity', 1, 'add');
        } else {
            if (err.message == "dummyErr1") {
                app.io.emit('error activity', 2, 'add');
            } else if (err.message == "dummyErr2") {
                app.io.emit('error activity', 3, 'add');
            } else {
                app.io.emit('error activity', 0, 'add');
            }
        }
    }
}

// TODO
// ceknout zda mohu zmenit aktivitu na dummy nebo ne, pripadne vyvolat error!!!
exports.editActivity = async (activityID, activityName, activityType, activityDescription, editedTimeUnit, activityValues) => {
    try {
        var activity = await ActivityModel.findById(activityID);
        var state = await StateModel.findById(activity.fromState);
        if (state.stateName == "Start" && activityType == "dummy") {
            throw new Error("dummyErr1");
        }
        await ActivityModel.findByIdAndUpdate(activityID, {
            activityName: activityName,
            activityType: activityType,
            description: activityDescription,
            timeUnit: editedTimeUnit,
            values: activityValues
        });
        await ProjectModel.findByIdAndUpdate(activity.projectID, {
            lastModified: Date.now()
        });
        app.io.emit('edit activity', activityID, activityName, activityType, activityDescription, editedTimeUnit, activityValues);
    } catch (err) {
        if (err.code == 11000) {
            app.io.emit('error activity', 1, 'edit');
        } else {
            if (err.message == "dummyErr1") {
                app.io.emit('error activity', 2, 'edit');
            } else {
                app.io.emit('error activity', 0, 'edit');
            }
        }
    }
}

// TODO 
exports.deleteActivity = async (activityID, projectID) => {
    try {
        await ActivityModel.findByIdAndDelete(activityID);
        await ProjectModel.findByIdAndUpdate(projectID, {
            lastModified: Date.now()
        })
        app.io.emit('delete activity', activityID);
    } catch (err) {
        app.io.emit('error activity', 0, 'delete');
    }
}
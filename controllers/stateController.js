const StateModel = require('../models/state');
const ActivityModel = require('../models/activity');
//const ProjectModel = require('../models/project');

var app = require('../app');

//socket.io
exports.addState = async(stateName, projectID, stateInfo) => {
    try {
        let state = new StateModel({
            stateName: stateName,
            projectID: projectID,
            description: stateInfo
        });
        await state.save();
        app.io.emit('new state', state);
    } catch (err) {
        app.io.emit('error state');
    }
}

//edit
exports.editState = async(stateID, stateName, stateInfo, projectID) => {
    console.log(projectID)
    try {
        await StateModel.findByIdAndUpdate(stateID, {
            stateName: stateName,
            description: stateInfo
        })
        app.io.emit('edit state', stateID, stateName, stateInfo, projectID);
    } catch (err) {
        app.io.emit('error state');
    }
    // socket.emit("edit state", stateID, stateName.value, stateInfo.value);
}


exports.deleteState = async(stateID) => {
    // mazani podle id
    try {
        await StateModel.findByIdAndDelete(stateID)
        app.io.emit('delete state', stateID);
    } catch (err) {
        app.io.emit("error state");
    }
    // dodelat mazani aktivit
}
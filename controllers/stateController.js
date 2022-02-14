const StateModel = require('../models/state'),
    ActivityModel = require('../models/activity');

var app = require('../app');

//socket.io
exports.addState = async(stateName, projectID, stateInfo) => {
    try {
        var state = new StateModel({
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



// TODO -- zkontrolovat, zda funguje spravne i pro vice aktivit
exports.deleteState = async(stateID) => {
    // mazani podle id
    //
    try {
        // mazani aktivit
        await ActivityModel.deleteMany({
            $or: [
                {fromState: stateID},
                {toState: stateID}
            ]
        })
        // mazani stavu
        await StateModel.findByIdAndDelete(stateID)
        app.io.emit('delete state', stateID);
    } catch (err) {
        app.io.emit("error state");
    }
}
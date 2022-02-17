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
        if(err.name == 'MongoError' && err.code == 11000) {
            app.io.emit('error state', 11000);
        } else {
            app.io.emit('error state', 0);
        }
    }
}

//edit
exports.editState = async(stateID, stateName, stateInfo, projectID) => {
    try {
        await StateModel.findByIdAndUpdate(stateID, {
            stateName: stateName,
            description: stateInfo
        })
        app.io.emit('edit state', stateID, stateName, stateInfo, projectID);
    } catch (err) {
        if(err.name == 'MongoError' && err.code == 11000) {
            app.io.emit('error state', 11000);
        } else {
            app.io.emit('error state', 0);
        }
    }
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
        });
        // mazani stavu
        await StateModel.findByIdAndDelete(stateID)
        app.io.emit('delete state', stateID);
    } catch (err) {
        app.io.emit("error state", 0);
    }
}
const ActivityModel = require('../models/activity');
const ProjectModel = require('../models/project');
const StateModel = require('../models/state');
const helmet = require('helmet');   

var app = require('../app');

//socket.io
exports.addState = async (stateName, projectID, stateInfo) => {
    try {

        console.log("STATE NAME")
        console.log(stateName)
        console.log("ENDE")

        var state = new StateModel({
            stateName: stateName,
            projectID: projectID,
            description: stateInfo
        });
        await state.save();
        await ProjectModel.findByIdAndUpdate(projectID, {
            lastModified: Date.now()
        });
        app.io.emit('new state', state);
    } catch (err) {
        if (err.code == 11000) {
            app.io.emit('error state', 1, 'add');
        } else {
            app.io.emit('error state', 0, 'add');
        }
    }
}

//edit
exports.editState = async (stateID, stateName, stateInfo, projectID) => {
    try {
        await StateModel.findByIdAndUpdate(stateID, {
            stateName: stateName,
            description: stateInfo
        });
        await ProjectModel.findByIdAndUpdate(projectID, {
            lastModified: Date.now()
        });
        app.io.emit('edit state', stateID, stateName, stateInfo, projectID);
    } catch (err) {
        if (err.code == 11000) {
            app.io.emit('error state', 1, 'edit');
        } else {
            app.io.emit('error state', 0, 'edit');
        }
    }
}

// TODO -- zkontrolovat, zda funguje spravne i pro vice aktivit
exports.deleteState = async (stateID, projectID) => {
    // mazani podle id
    //
    try {
        // mazani aktivit
        await ActivityModel.deleteMany({
            $or: [
                { fromState: stateID },
                { toState: stateID }
            ]
        })
        await StateModel.findByIdAndDelete(stateID)
        await ProjectModel.findByIdAndUpdate(projectID, {
            lastModified: Date.now()
        });
        app.io.emit('delete state', stateID);
    } catch (err) {
        app.io.emit("error state", 0, 'delete');
    }
}
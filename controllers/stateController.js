const StateModel = require('../models/state');
//const ProjectModel = require('../models/project');

exports.addState = function (req, res) {
    res.render('addState', {
        title: req.__('add state'),
        fromStateID: req.params.id
    });
};

exports.postNewState = async (req, res) => {
    const name = req.body.stateNameInput;
    const info = req.body.stateInfo;
    const fromStateID = req.params.id;
    const addActivityCheck = req.body.addActivityCheck;
    let fromState = await StateModel.findById(fromStateID);

    let state = new StateModel({
        stateName: name,
        projectID: fromState.projectID,
        description: info
    });
    await state.save();
    req.session.flash = { type: "success", text: req.__("state created") };
    if (addActivityCheck) {
        let toState = await StateModel.findOne({ stateName: name });
        return res.redirect('/activities/add' + "?from=" + encodeURIComponent(fromStateID) + "&to=" + encodeURIComponent(toState._id));
    } else {
        return res.redirect('/projects/' + fromState.projectID);
    }

};

exports.getStateForEdit = async (req, res) => {
    let state = await StateModel.findById(req.params.id);
    return res.render("editState", {
        title: req.__('edit state'),
        stateID: state._id,
        stateName: state.stateName,
        stateInfo: state.description
    })
}

exports.updateState = async (req, res) => {
    const info = req.body.stateInfo;
    const projectID = req.cookies.activeProject;
    await StateModel.findByIdAndUpdate(req.params.id, {
        description: info
    })
    req.session.flash = { type: "success", text: req.__('state updated') };
    return res.redirect("/projects/" + projectID);
}

exports.deleteSelectedState = async (req, res) => {
    const state = await StateModel.findById(req.params.id);
    if (state.stateName == "Start" || state.stateName == "Finish") {
        req.session.flash = { type: "danger", text: req.__("state") + " " + state.stateName + req.__("state cannot be deleted") };
    } else {
        await StateModel.findByIdAndDelete(req.params.id);
        req.session.flash = { type: "success", text: req.__("state") + " " + state.stateName + req.__("state deleted") };
    }
    return res.redirect('/projects/' + req.cookies.activeProject);
}
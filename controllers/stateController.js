const StateModel = require('../models/state');
//const ProjectModel = require('../models/project');

exports.addState = function(req, res) {
    res.render('addState', {
        title: "Add State",
        fromStateID: req.params.id
    });
};

exports.postNewState = async(req, res) => {
    const name = req.body.stateNameInput;
    const info = req.body.stateInfo;
    const fromStateID = req.params.id;

    let fromState = await StateModel.findById(fromStateID);

    let state = new StateModel({
        stateName: name,
        projectID: fromState.projectID,
        description: info
    });

    await state.save();

    res.redirect('/projects/' + fromState.projectID);

};
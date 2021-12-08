const ActivityModel = require('../models/activity');


exports.getNewActivity = function(req, res) {
    res.render("addActivity", {
        title: req.__("add activity"),
        from: req.query.from,
        to: req.query.to,
        projectType: req.cookies.projectType
    })
}

exports.postNewActivity = async(req, res) => {

    let activity = new ActivityModel({
        activityName: req.body.activityNameInput,
        activityType: "normal",
        fromState: req.query.from,
        toState: req.query.to,
        values: [req.body.optimisticValue, req.body.mostExpectedValue, req.body.pessimisticValue],
        description: req.body.activityInfo,
        projectID: req.cookies.activeProject
    });
    await activity.save();
    req.session.flash = { type: 'success', text: req.__("activity added") };
    res.redirect('/projects/' + req.cookies.activeProject);
}

exports.getEditActivity = async(req, res) => {


}

exports.updateActivity = async(req, res) => {

}

exports.deleteActivity = async(req, res) => {


}
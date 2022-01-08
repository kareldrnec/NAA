const ActivityModel = require('../models/activity');


<<<<<<< HEAD
exports.addActivity = async() => {

}

exports.editActivity = async() => {

}

exports.deleteActivity = async() => {
    
=======
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
    let activity = await ActivityModel.findById(req.params.id);
    return res.render("editActivity", {
        title: req.__("edit activity"),
        activityID: activity._id,
        activityName: activity.activityName,
        activityInfo: activity.description,
        values: activity.values,
        projectType: req.cookies.projectType
    })
}

exports.updateActivity = async(req, res) => {
    let activityName = req.body.activityNameInput,
        activityDescription = req.body.activityInfo,
        values = [req.body.optimisticValue, req.body.mostExpectedValue, req.body.pessimisticValue];
    await ActivityModel.findByIdAndUpdate(req.params.id, {
        activityName: activityName,
        description: activityDescription,
        values: values
    })
    req.session.flash = { type: 'success', text: req.__("activity updated") };
    res.redirect("/projects/" + req.cookies.activeProject);
}

exports.deleteActivity = async(req, res) => {
    await ActivityModel.findByIdAndDelete(req.params.id);
    req.session.flash = { type: 'success', text: req.__("activity deleted") };
    res.redirect("/projects/" + req.cookies.activeProject);
>>>>>>> 497c2153673148ce275e4e6c570b5b0ba35bcd9e
}
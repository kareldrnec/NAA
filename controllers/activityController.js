const ActivityModel = require('../models/activity');


exports.getNewActivity = function(req, res) {
    res.render("addActivity", {
        title: req.__("add activity"),
        projectType: req.cookies.projectType
    })
}

exports.postNewActivity = async(req, res) => {


}

exports.getEditActivity = async(req, res) => {


}

exports.updateActivity = async(req, res) => {

}

exports.deleteActivity = async(req, res) => {


}
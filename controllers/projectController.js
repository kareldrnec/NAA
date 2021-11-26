
const UserModel = require('../models/user');

exports.getProjectsDirectory = async(req, res) => {
    let user = await UserModel.findById(req.session.userId);
    res.render('projectsDirectory', {
        title: "Directory",
        username: user.userName
    })
};

exports.newProject = async(req, res) => {
    let user = await UserModel.findById(req.session.userId);
    res.render('newProject', {
        title: "New Project",
        username: user.userName
    })
}

exports.editProject = async(req, res) => {
    let user = await UserModel.findById(req.session.userId);
    res.render('editProject', {
        title: "Edit Project",
        username: user.userName
    })
}

exports.deleteProject = async(req, res) => {
    
}
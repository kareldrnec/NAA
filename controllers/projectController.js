
const UserModel = require('../models/user');
const ProjectModel = require('../models/project');

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

exports.addProject = async(req, res) => {
    const { projectName, types, projectInfo } = req.body;
    let project = new ProjectModel({
        projectName: projectName,
        projectType: types,
        projectInfo: projectInfo,
        userId: req.session.userId
    });
    await project.save();
    req.session.flash = { type: 'success', text: 'Project was successfully added!' };
    return res.redirect('/');
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
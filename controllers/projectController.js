// Project Controller
const UserModel = require('../models/user');
const ProjectModel = require('../models/project');
const StateModel = require('../models/state');


//gets project directory
exports.getProjectsDirectory = async(req, res) => {
    let user = await UserModel.findById(req.session.userId);
    let projects = await ProjectModel.find({ userId: req.session.userId });
    let projectsToSend = {};
    var projectsPrep = [];
    for (var i in projects) {
        var item = projects[i];
        projectsPrep.push({
            "projectName": item.projectName,
            "projectType": item.projectType,
            "ID": item._id
        });
    }
    projectsToSend.projects = projectsPrep;
    res.render('projectsDirectory', {
        title: "Directory",
        projects: projectsToSend,
        username: user.userName
    })
};

//redirects to new project page
exports.newProject = async(req, res) => {
    let user = await UserModel.findById(req.session.userId);
    res.render('newProject', {
        title: "New Project",
        username: user.userName
    })
}

//add new project
exports.addProject = async(req, res) => {
    const { projectName, types, projectInfo } = req.body;
    let project = new ProjectModel({
        projectName: projectName,
        projectType: types,
        projectInfo: projectInfo,
        userId: req.session.userId
    });
    await project.save();

    let startState = new StateModel({
        stateName: "Start",
        projectID: project._id
    });

    await startState.save();

    let finishState = new StateModel({
        stateName: "Finish",
        projectID: project._id
    });

    await finishState.save();

    req.session.flash = { type: 'success', text: 'Project was successfully added!' };
    return res.redirect('/projects/projectsDirectory');
}

//update of project
exports.editProject = async(req, res) => {
    const projectName = req.body.projectName;
    const projectInfo = req.body.projectInfo;
    await ProjectModel.findByIdAndUpdate(req.params.id, {
        projectName: projectName,
        projectInfo: projectInfo
    });
    req.session.flash = { type: 'success', text: 'Project was successfully updated!' };
    return res.redirect("/projects/edit/" + req.params.id);
}

//select project for edit and redirection
exports.getProjectForEdit = async(req, res) => {
    let project = await ProjectModel.findById(req.params.id);
    let date = project.createdAt;
    let stringDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    res.render('editProject', {
        title: "Edit Project",
        projectID: project._id,
        projectName: project.projectName,
        projectType: project.projectType,
        projectInfo: project.projectInfo,
        createdAt: stringDate
    })
}

//project selection
exports.selectProject = async(req, res) => {
    res.redirect("/projects/" + encodeURIComponent(req.params.id));
}

//load project after selection
exports.loadProject = async(req, res) => {
    let project = await ProjectModel.findById(req.params.id);
    let states = await StateModel.find({ projectID: project._id });
    let statesToSend = {};
    let statesPrep = [];
    for (var i in states) {
        var item = states[i];
        statesPrep.push({
            "stateName": item.stateName,
            "projectID": item.projectID,
            "ID": item._id
        });
    }
    statesToSend.states = statesPrep;
    res.render("project", {
        title: project.projectName,
        projectID: project._id,
        projectType: project.projectType,
        states: JSON.stringify(statesToSend)
    })
}

//delete project
exports.deleteProject = async(req, res) => {
    await ProjectModel.findByIdAndDelete(req.params.id);
    req.session.flash = { type: 'success', text: 'Selected Project was successfully deleted!' };
    return res.redirect("/projects/projectsDirectory");
}
// Project Controller
const UserModel = require('../models/user');
const ProjectModel = require('../models/project');
const StateModel = require('../models/state');
const ActivityModel = require('../models/activity');


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
        title: req.__('directory'),
        projects: projectsToSend,
        username: user.userName
    })
};

//redirects to new project page
exports.newProject = async(req, res) => {
    let user = await UserModel.findById(req.session.userId);
    res.render('addProject', {
        title: req.__('new project'),
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

    req.session.flash = { type: 'success', text: req.__("project added") };
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
    // 'Project was successfully updated!'
    req.session.flash = { type: 'success', text: req.__('project updated') };
    return res.redirect("/projects/projectsDirectory");
}

//select project for edit and redirection
exports.getProjectForEdit = async(req, res) => {
    let project = await ProjectModel.findById(req.params.id);
    let date = project.createdAt;
    let stringDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    res.render('editProject', {
        title: req.__('edit project'),
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
    if (project) {
        let states = await StateModel.find({ projectID: project._id });
        let statesToSend = {},
            activitiesToSend = {};
        let statesPrep = [],
            activitiesPrep = [];
        for (var i in states) {
            var item = states[i];
            statesPrep.push({
                "ID": item._id,
                "stateName": item.stateName,
                "projectID": item.projectID
            });
        }
        let activities = await ActivityModel.find({ projectID: project._id });
        for (var i in activities) {
            var item = activities[i];
            activitiesPrep.push({
                "ID": item._id,
                "stateName": item.activityName,
                "activityType": item.activityType,
                "fromState": item.fromState,
                "toState": item.toState,
                "values": item.values,
                "description": item.description
            })
        }
        statesToSend.states = statesPrep;
        activitiesToSend.activities = activitiesPrep;
        res.cookie("activeProject", project._id);
        res.cookie("projectType", project.projectType);
        res.render("project", {
            title: project.projectName,
            projectID: project._id,
            projectType: project.projectType,
            states: JSON.stringify(statesToSend),
            activities: JSON.stringify(activitiesToSend),
            username: req.cookies.username
        })
    } else {
        // vyresit
        console.log("Neni project")
    }
}

//delete project
exports.deleteProject = async(req, res) => {
    await ProjectModel.findByIdAndDelete(req.params.id);
    req.session.flash = { type: 'success', text: req.__("project deleted") };
    return res.redirect("/projects/projectsDirectory");
}

//generate project
exports.generate = async(req, res) => {
    //TODO
    console.log("generating...")

}
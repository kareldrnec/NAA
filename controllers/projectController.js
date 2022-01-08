// Project Controller
const UserModel = require('../models/user');
const ProjectModel = require('../models/project');
const StateModel = require('../models/state');


//gets project directory
exports.getProjectsDirectory = async (req, res, next) => {
    try {
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
        return res.render('projectsDirectory', {
            title: req.__('directory'),
            projects: projectsToSend,
            username: user.userName + " " + user.userSurname
        })
    } catch (err) {
        return next(err);
    }
};

//redirects to new project page
exports.newProject = async (req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        return res.render('newProject', {
            title: req.__('new project'),
            username: user.userName
        })
    } catch (err) {
        return next(err);
    }
}

//add new project
exports.addProject = async (req, res, next) => {
    const { projectName, types, projectInfo } = req.body;
    try {
        let project = new ProjectModel({
            projectName: projectName,
            projectType: types,
            projectInfo: projectInfo,
            userId: req.session.userId
        });
        await project.save();
    
        let startState = new StateModel({
            stateName: "Start",
            stateType: "start",
            projectID: project._id
        });
    
        await startState.save();
    
        let finishState = new StateModel({
            stateName: "Finish",
            stateType: "finish",
            projectID: project._id
        });
    
        await finishState.save();
    
        req.session.flash = { type: 'success', text: req.__("project added") };
        return res.redirect('/projects/projectsDirectory');
    } catch (err) {
        return next(err);
    }
}

//update of project
exports.editProject = async (req, res, next) => {
    const projectName = req.body.projectName;
    const projectInfo = req.body.projectInfo;
    try {
        await ProjectModel.findByIdAndUpdate(req.params.id, {
            projectName: projectName,
            projectInfo: projectInfo
        });
        req.session.flash = { type: 'success', text:  req.__('project updated')};
        return res.redirect("/projects/projectsDirectory");
    } catch (err) {
        return next(err);
    }
}

//select project for edit and redirection
exports.getProjectForEdit = async (req, res, next) => {
    try {
        let project = await ProjectModel.findById(req.params.id);
        let date = project.createdAt;
        let stringDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        return res.render('editProject', {
            title: req.__('edit project'),
            projectID: project._id,
            projectName: project.projectName,
            projectType: project.projectType,
            projectInfo: project.projectInfo,
            createdAt: stringDate
        })
    } catch (err) {
        return next(err);
    }
}

//project selection
exports.selectProject = async (req, res) => {
    res.redirect("/projects/" + encodeURIComponent(req.params.id));
}

//load project after selection
exports.loadProject = async (req, res) => {
    try {
        let project = await ProjectModel.findById(req.params.id);
        if (project) {
            let states = await StateModel.find({ projectID: project._id });
            let statesToSend = {};
            let statesPrep = [];
            for (var i in states) {
                var item = states[i];
                statesPrep.push({
                    "stateName": item.stateName,
                    "projectID": item.projectID,
                    "ID": item._id,
                    "description": item.description
                });
            }
            statesToSend.states = statesPrep;
            res.cookie("activeProject", project._id);
            res.cookie("projectType", project.projectType);
            res.render("project", {
                title: project.projectName,
                projectID: project._id,
                projectType: project.projectType,
                states: JSON.stringify(statesToSend),
                // mozna predelat ?
                username: req.cookies.username
            })
        } else {
            // vyresit
            console.log("Neni project")
        }
    } catch (err) {
        return next(err);
    }
}

// delete project
// dodelat smazani stavu a udalosti, ktere dany projekt obsahuje
exports.deleteProject = async (req, res, next) => {
    try {
        // smazani vsech stavu
        await StateModel.deleteMany({
            projectID: req.params.id
        });
        // smazani vsech aktivit
        // TODO
        //
        //

        //smazani projektu
        await ProjectModel.findByIdAndDelete(req.params.id);
        req.session.flash = { type: 'success', text: req.__("project deleted") };
        return res.redirect("/projects/projectsDirectory");
    } catch (err) {
        return next(err);
    }
}
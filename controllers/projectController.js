// Project Controller
const ActivityModel = require('../models/activity');
const ProjectModel = require('../models/project');
const StateModel = require('../models/state');
const UserModel = require('../models/user');
//gets project directory
exports.getProjectsDirectory = async (req, res, next) => {
    try {
        var user = await UserModel.findById(req.session.userId);
        var projects = await ProjectModel.find({ userId: req.session.userId });
        var projectsToSend = {},
            projectsPrep = [];

        for (var i in projects) {
            var project = projects[i],
                date = project.createdAt,
                modified = project.lastModified;
            projectsPrep.push({
                "projectName": project.projectName,
                "projectType": project.projectType,
                "ID": project._id,
                "created": date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(),
                "modified": modified.getDate() + "/" + (modified.getMonth() + 1) + "/" + modified.getFullYear()
            });
        }

        projectsToSend.projects = projectsPrep;

        return res.render('projectsDirectory', {
            title: req.__('directory'),
            projects: projectsToSend,
            username: user.userName + " " + user.userSurname,
            navColor: req.cookies.navColor
        })
    } catch (err) {
        return next(err);
    }
};

//redirects to new project page
/**
 * newProject
 * GET
 * Async function that redirects to form for a new project
 * if error appears, it is automatically redirected to error handler
 */
exports.newProject = async (req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        return res.render('addProject', {
            title: req.__('new project'),
            username: user.userName + " " + user.userSurname,
            navColor: req.cookies.navColor
        })
    } catch (err) {
        return next(err);
    }
}

/**
 * addProject
 * POST
 * Async function that adds a new project with Start state and Finish state
 * if error appears, it is automatically redirected to error handler
 */
exports.addProject = async (req, res, next) => {
    const { projectName, type, projectInfo } = req.body;
    var statesArr = [];
    try {
        // create a Project (ProjectModel - Schema)
        const project = new ProjectModel({
            projectName: projectName,
            projectType: type,
            projectInfo: projectInfo,
            userId: req.session.userId
        });
        // save Project to MongoDB...
        await project.save();
        // create 2 States (Start, Finish)
        statesArr.push(new StateModel({
            stateName: "Start",
            projectID: project._id
        }));
        statesArr.push(new StateModel({
            stateName: "Finish",
            projectID: project._id
        }));
        // save States to MongoDB...
        await StateModel.insertMany(statesArr);
        // define message (success) and redirect to projectsDirectory
        req.session.flash = { type: 'success', text: req.__("project added") };
        return res.redirect('/projects/projectsDirectory');
    } catch (err) {
        if (err.code == 11000) {
            req.session.flash = { type: 'danger', text: req.__("project exists with this name") };
        }
        return next(err);
    }
}

/**
 * editProject
 * PUT
 * Async function that updates selected project
 * if error appears, it is automatically redirected to error handler
 * if error has code 11000 (Duplicate Key), the error message is added to flash message
 */
exports.editProject = async (req, res, next) => {
    const projectName = req.body.projectName;
    const projectInfo = req.body.projectInfo;
    try {
        await ProjectModel.findByIdAndUpdate(req.params.id, {
            projectName: projectName,
            projectInfo: projectInfo
        });
        req.session.flash = { type: 'success', text: req.__('project updated') };
        return res.redirect("/projects/projectsDirectory");
    } catch (err) {
        if (err.code == 11000) {
            req.session.flash = { type: 'danger', text: req.__('project exists with this name') };
        } else {
            req.session.flash = { type: 'danger', text: req.__('error') };
        }
        return next(err);
    }
}

/**
 * getProjectForEdit
 * GET
 * Async function that displays selected project for edit
 * if error appears, it is automatically redirected to error handler
 */
exports.getProjectForEdit = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.session.userId);
        const project = await ProjectModel.findById(req.params.id);
        const date = project.createdAt;
        const stringDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        // render page editProject with selected Project
        return res.render('editProject', {
            title: req.__('edit project'),
            projectID: project._id,
            projectName: project.projectName,
            projectType: project.projectType,
            projectInfo: project.projectInfo,
            createdAt: stringDate,
            username: user.userName + " " + user.userSurname,
            navColor: req.cookies.navColor
        })
    } catch (err) {
        req.session.flash = { type: 'danger', text: req.__('error') };
        return next(err);
    }
}

//project selection
exports.selectProject = async (req, res) => {
    res.redirect("/projects/" + encodeURIComponent(req.params.id));
}

exports.results = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.session.userId);
        const project = await ProjectModel.findById(req.params.id);
        const states = await StateModel.find({ projectID: project._id });
        const activities = await ActivityModel.find({ projectID: project._id });
        var activitiesData = [];

        for (var i in activities) {
            activitiesData.push({
                "ID": activities[i]._id,
                "name": activities[i].activityName,
                "type": activities[i].activityType,
                "values": activities[i].values,
                "timeUnit": activities[i].timeUnit,
                "description": activities[i].description
            });
        }

        res.render('results', {
            title: req.__('results'),
            projectID: project._id,
            projectName: project.projectName,
            projectType: project.projectType,
            projectInfo: project.projectInfo,
            activitiesData: JSON.stringify(activitiesData),
            username: user.userName + " " + user.userSurname
        });
    } catch (err) {
        req.session.flash = { type: 'danger', text: req.__('error') };
        return next(err);
    }
}

//load project after selection
exports.loadProject = async (req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId),
            project = await ProjectModel.findById(req.params.id);
        if (project) {
            let states = await StateModel.find({ projectID: project._id }),
                statesToSend = {},
                statesPrep = [],
                activities = await ActivityModel.find({ projectID: project._id }),
                activitiesToSend = {},
                activitiesPrep = [],
                translations = [req.__('add activity'), req.__('add state'), req.__('edit'), req.__('delete'),
                req.__('slack'), req.__('state name'), req.__('earliest start time'), req.__('latest start time'),
                req.__('help'), req.__('name'), req.__('type'), req.__('normal'), req.__('dummy'), req.__('values'),
                req.__('length'), req.__('time unit'), req.__('seconds'), req.__('minutes'), req.__('hours'),
                req.__('days'), req.__('weeks'), req.__('months')
                ];
            // pridat do prekladu
            // name, type, values, time unit

            for (var i in states) {
                var item = states[i];
                statesPrep.push({
                    "ID": item._id,
                    "stateName": item.stateName,
                    "projectID": item.projectID,
                    "description": item.description
                });
            }
            statesToSend.states = statesPrep;

            for (var i in activities) {
                var item = activities[i];
                activitiesPrep.push({
                    "ID": item._id,
                    "activityName": item.activityName,
                    "activityType": item.activityType,
                    "fromState": item.fromState,
                    "toState": item.toState,
                    "critical": false,
                    "values": item.values,
                    "timeUnit": item.timeUnit,
                    "description": item.description,
                    "projectID": item.projectID
                });
            }
            activitiesToSend.activities = activitiesPrep;

            // ??
            res.cookie("activeProject", project._id);
            res.cookie("projectType", project.projectType);
            res.render("project", {
                title: project.projectName,
                project: JSON.stringify(project),
                projectID: project._id,
                projectType: project.projectType,
                states: JSON.stringify(statesToSend),
                activities: JSON.stringify(activitiesToSend),
                username: user.userName + " " + user.userSurname,
                translations: JSON.stringify(translations),
                navColor: req.cookies.navColor,
                graphSettings: req.cookies.graphSettings
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
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await ProjectModel.findById(req.params.id);
        await StateModel.deleteMany({
            projectID: req.params.id
        });
        await ActivityModel.deleteMany({
            projectID: req.params.id
        });
        await ProjectModel.findByIdAndDelete(req.params.id);
        req.session.flash = { type: 'success', text: req.__("project") + " " + project.projectName + req.__("project deleted") };
        return res.redirect("/projects/projectsDirectory");
    } catch (err) {
        req.session.flash = { type: 'danger', text: req.__('error') };
        return next(err);
    }
}

/**
 * loadProjectFromFile
 * POST
 * Async function that loads project from selected file (JSON)
 * if error appears, it is automatically redirected to error handler
 */
exports.loadProjectFromFile = async (req, res, next) => {
    const projectName = req.body.projectName;
    const filename = req.body.myFile;
    const dataJSON = JSON.parse(req.body.loadedFileInput);
    const projectData = dataJSON.project;
    const statesData = dataJSON.states;
    const activitiesData = dataJSON.activities;
    var states = [];
    var activities = [];
    var fromState, toState;
    try {
        // create a Project (ProjectModel - Schema)
        let project = new ProjectModel({
            projectName: projectName,
            projectType: projectData.type,
            projectInfo: projectData.description,
            createdAt: projectData.created,
            userId: req.session.userId
        });
        // create States of Project (StateModel - Schema)
        for (var i = 0; i < statesData.length; i++) {
            states.push(new StateModel({
                stateName: statesData[i].name,
                projectID: project._id,
                description: statesData[i].description
            }));
        }
        // create Activities of Project (ActivityModel - Schema)
        for (var i = 0; i < activitiesData.length; i++) {
            fromState = states.find(element => element.stateName == activitiesData[i].fromState);
            toState = states.find(element => element.stateName == activitiesData[i].toState);
            activities.push(new ActivityModel({
                activityName: activitiesData[i].name,
                activityType: activitiesData[i].type,
                fromState: fromState._id,
                toState: toState._id,
                timeUnit: activitiesData[i].timeUnit,
                values: activitiesData[i].values,
                description: activitiesData[i].description,
                projectID: project._id
            }));
        }
        // save Project, States and Activities to MongoDB...
        await project.save();
        await StateModel.insertMany(states);
        await ActivityModel.insertMany(activities);
        // define message (success) and redirect to projectsDirectory
        req.session.flash = { type: 'success', text: req.__("file") + " " + filename + req.__("was successfully loaded") };
        return res.redirect("/projects/projectsDirectory");
    } catch (err) {
        // TODO - dodelat chybova hlaseni + presmerovani
        if (err.code == 11000) {
            req.session.flash = { type: 'danger', text: req.__("error") + "! " + req.__("project exists with this name") };
        } else {
            req.session.flash = { type: 'danger', text: req.__("error") + "!" };
        }
        return next(err);
    }
}

// generator 
// TODO
exports.generateProject = async (req, res, next) => {
    try {
        const projectName = req.body.projectName,
            projectType = req.body.type,
            projectDescription = req.body.projectInfo,
            generatedProject = JSON.parse(req.body.generatedProjectJSON),
            generatedStates = generatedProject.states,
            generatedActivities = generatedProject.activities;

        var states = [];
        var activities = [];
        var fromState, toState;

        // Project
        let project = new ProjectModel({
            projectName: projectName,
            projectType: projectType,
            projectInfo: projectDescription,
            userId: req.session.userId
        });
        // States
        for (var i = 0; i < generatedStates.length; i++) {
            states.push(new StateModel({
                stateName: generatedStates[i].name,
                projectID: project._id
            }))
        }
        // Activities
        for (var i = 0; i < generatedActivities.length; i++) {
            fromState = states.find(element => element.stateName == generatedActivities[i].fromState);
            toState = states.find(element => element.stateName == generatedActivities[i].toState);
            activities.push(new ActivityModel({
                activityName: generatedActivities[i].name,
                activityType: generatedActivities[i].type,
                fromState: fromState._id,
                toState: toState._id,
                timeUnit: generatedActivities[i].timeUnit,
                values: generatedActivities[i].values,
                projectID: project._id
            }));
        }
        // Save to MongoDB...
        await project.save();
        await StateModel.insertMany(states);
        await ActivityModel.insertMany(activities);
       
        req.session.flash = { type: 'success', text: req.__("project") + " " + project.projectName + req.__("project generated") };
        return res.redirect('/projects/projectsDirectory');
    } catch (err) {
        //TODO
        if (err.code == 11000) {
            req.session.flash = { type: 'danger', text: req.__("error") + "! " + req.__("project exists with this name") };
        } else {
            req.session.flash = { type: 'danger', text: req.__("error") + "!" };
        }
        return next(err);
    }
}
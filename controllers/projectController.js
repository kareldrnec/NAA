// Project Controller
const UserModel = require('../models/user');
const ProjectModel = require('../models/project');
const StateModel = require('../models/state');
const ActivityModel = require('../models/activity');

//gets project directory
exports.getProjectsDirectory = async (req, res, next) => {
    try {
        var user = await UserModel.findById(req.session.userId);
            projects = await ProjectModel.find({ userId: req.session.userId }),
            projectsToSend = {},
            projectsPrep = [];

        for (var i in projects) {
            var item = projects[i],
                date = item.createdAt;
            projectsPrep.push({
                "projectName": item.projectName,
                "projectType": item.projectType,
                "ID": item._id,
                "created": date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
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
        return res.render('addProject', {
            title: req.__('new project'),
            username: user.userName + " " + user.userSurname
        })
    } catch (err) {
        return next(err);
    }
}

//add new project
exports.addProject = async (req, res, next) => {
    const { projectName, types, projectInfo } = req.body;
    var statesArr = [];
    try {
        let project = await ProjectModel.findOne({
            projectName: projectName,
            userId: req.session.userId
        });

        if(project) {
            req.session.flash = { type: 'danger', text: req.__("project exists with this name") };
            return res.redirect('/projects/new');
        }

        project = new ProjectModel({
            projectName: projectName,
            projectType: types,
            projectInfo: projectInfo,
            userId: req.session.userId
        });

        await project.save();

        statesArr.push(createState("Start", project._id));
        statesArr.push(createState("Finish", project._id));


        await StateModel.insertMany(statesArr);

        req.session.flash = { type: 'success', text: req.__("project added") };
        
        return res.redirect('/projects/projectsDirectory');
    } catch (err) {
        console.log(err)
        return next(err);
    }
}

//update of project
exports.editProject = async (req, res, next) => {
    const projectName = req.body.projectName;
    const projectInfo = req.body.projectInfo;
    try {
        let project = await ProjectModel.findOne({
            projectName: projectName,
            userId: req.session.userId
        });
        
        if(project) {
            req.session.flash = { type: 'danger', text: req.__("project exists with this name")};
            return res.redirect('/projects/edit/' + req.params.id);
        }
        
        await ProjectModel.findByIdAndUpdate(req.params.id, {
            projectName: projectName,
            projectInfo: projectInfo
        });
        
        req.session.flash = { type: 'success', text: req.__('project updated') };
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
                    req.__('slack'), req.__('state name'), req.__('earliest start time'), req.__('latest start time')];
            
            
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
                projectID: project._id,
                projectType: project.projectType,
                states: JSON.stringify(statesToSend),
                activities: JSON.stringify(activitiesToSend),
                username: user.userName + " " + user.userSurname,
                translations: JSON.stringify(translations)
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
        await StateModel.deleteMany({
            projectID: req.params.id
        });

        await ActivityModel.deleteMany({
            projectID: req.params.id
        });

        await ProjectModel.findByIdAndDelete(req.params.id);
        
        req.session.flash = { type: 'success', text: req.__("project deleted") };
        
        return res.redirect("/projects/projectsDirectory");
    } catch (err) {
        return next(err);
    }
}

// generator 
// TODO
exports.generateProject = async (req, res, next) => {
    const projectName = req.body.projectName;
        projectType = req.body.types,
        projectInfo = req.body.projectInfo,
        maxLengthOfActivity = req.body.maxLengthOfActivity;
   
    var numberOfStates = req.body.numberOfStates,
        fromState, toState,
        statesArr = [],
        activitiesArr = [],
        previousStates = [], 
        nextStates = [];


    try {
        let project = ProjectModel({
            projectName: projectName,
            projectType: projectType,
            projectInfo: projectInfo,
            userId: req.session.userId
        });

        fromState = createState("Start", project._id);
        toState = createState("Finish", project._id);

        statesArr.push(fromState);
        statesArr.push(toState);

        numberOfStates -= 2;

        if (numberOfStates == 0) {
            activitiesArr.push(createActivity("A1", "normal", projectType, project._id, fromState._id, toState._id, maxLengthOfActivity));
        } else {

        }

        console.log("Project")
        console.log(project)
        console.log("Stavy")
        console.log(statesArr)
        console.log("Aktivity")
        console.log(activitiesArr)

        console.log("Max Length of Activity")
        console.log(maxLengthOfActivity)
        console.log("ende")

        // ulozeni do databaze
        // await project.save();
        // await StateModel.insertMany(statesArr)
        // await ActivityModel.insertMany(activitiesArr);

        return res.redirect("/")
    } catch (err) {
        return next(err);
    }
}

function createState(name, projectID) {
    return StateModel({
        stateName: name,
        projectID: projectID
    });
}

function createActivity(name, activityType, projectType, projectID, fromState, toState, maxLength) {
    // TODO
    return ActivityModel({
        activityName: name,
        activityType: activityType,
        fromState: fromState,
        toState: toState,
        values: generateValuesForActivity(projectType, maxLength),
        projectID: projectID

    });
}

function generateValuesForActivity(projectType, maxLength) {
    // TODO generate pert or cpm length
    let valArr = [];
    if(projectType == "cpm") {
        valArr.push(getRandomInt(maxLength));
    } else if(projectType == "pert") {

    }
    return valArr;
}

// mozna zmenit
function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}



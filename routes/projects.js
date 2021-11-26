const express = require('express');
const router = express.Router();
const auth = require('../auth');
const project_controller = require('../controllers/projectController');

// GET - router Projects Directory
router.get("/projectsDirectory", auth.requiresLogin, project_controller.getProjectsDirectory);

// GET - router New Project
router.get("/newProject", auth.requiresLogin, project_controller.newProject);

// GET - router Edit Project
router.get("/editProject", auth.requiresLogin, project_controller.editProject);

// GET - router Delete Project
router.get("/deleteProject", auth.requiresLogin, project_controller.deleteProject);


module.exports = router;

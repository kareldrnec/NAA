const express = require('express');
const router = express.Router();
const auth = require('../auth');
const project_controller = require('../controllers/projectController');

// GET - router Projects Directory
router.get("/projectsDirectory", auth.requiresLogin, project_controller.getProjectsDirectory);

// GET - router New Project
router.get("/newProject", auth.requiresLogin, project_controller.newProject);

// POST - router Post Project
router.post("/addProject", auth.requiresLogin, project_controller.addProject);

// GET - router Edit Project
router.get("/edit/:id", auth.requiresLogin, project_controller.getProjectForEdit);

// POST - router Edit Project
router.post("/edit/:id", auth.requiresLogin, project_controller.editProject);


// DELETE
router.get("/delete/:id", auth.requiresLogin, project_controller.deleteProject);

module.exports = router;

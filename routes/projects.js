const express = require('express');
const router = express.Router();
const auth = require('../auth');
const project_controller = require('../controllers/projectController');

// GET - router Projects Directory
router.get("/projectsDirectory", auth.requiresLogin, project_controller.getProjectsDirectory);

// GET - router New Project
router.get("/new", auth.requiresLogin, project_controller.newProject);

// POST - router Post Project
router.post("/add", auth.requiresLogin, project_controller.addProject);

// GET - router Edit Project
router.get("/edit/:id", auth.requiresLogin, project_controller.getProjectForEdit);

// POST - router Edit Project
router.post("/edit/:id", auth.requiresLogin, project_controller.editProject);

// DELETE
router.get("/delete/:id", auth.requiresLogin, project_controller.deleteProject);
router.post("/delete/:id", auth.requiresLogin, project_controller.deleteProject);


// GET - choose project
router.get("/select/:id", auth.requiresLogin, project_controller.selectProject);


router.get("/:id", auth.requiresLogin, project_controller.loadProject);


//router.post("/generate", auth.requiresLogin, project_controller.generate);


module.exports = router;
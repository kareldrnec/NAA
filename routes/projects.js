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

// POST - router Load project
router.post("/loadFile", auth.requiresLogin, project_controller.loadProjectFromFile);

// GET - router Edit Project
router.get("/edit/:id", auth.requiresLogin, project_controller.getProjectForEdit);

// PUT - router Edit Project
router.put("/edit/:id", auth.requiresLogin, project_controller.editProject);

// DELETE - router Delete Project
router.delete("/delete/:id", auth.requiresLogin, project_controller.deleteProject);

// GET - choose project
router.get("/select/:id", auth.requiresLogin, project_controller.selectProject);

// GET - load project
router.get("/:id", auth.requiresLogin, project_controller.loadProject);

// POST - generate project
router.post("/generate", auth.requiresLogin, project_controller.generateProject);

// GET - project results
router.get("/:id/results", auth.requiresLogin, project_controller.results);

// GET - Monte Carlo analysis
router.get("/:id/monteCarlo", auth.requiresLogin, project_controller.monteCarlo);

module.exports = router;
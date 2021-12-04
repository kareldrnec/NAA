const express = require('express');
const router = express.Router();
const auth = require('../auth');
const activity_controller = require('../controllers/activityController');

// GET - add Activity
router.get("/add", auth.requiresLogin, activity_controller.getNewActivity);

// POST - add Activity
router.post("/add", auth.requiresLogin, activity_controller.postNewActivity);

// GET - edit Activity
router.get("/edit/:id", auth.requiresLogin, activity_controller.getEditActivity);

// POST - edit Activity
router.post("/edit/:id", auth.requiresLogin, activity_controller.updateActivity);

// GET - delete Activity
router.get("/delete/:id", auth.requiresLogin, activity_controller.deleteActivity);

module.exports = router;
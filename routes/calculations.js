// Calculation Router
const express = require('express');
const router = express.Router();
const auth = require('../auth');
const view_controller = require('../controllers/viewController');

// GET - router Monte Carlo
router.get("/monteCarlo", auth.requiresLogin, view_controller.monteCarlo);

// GET - router Results
// router.get("/results", auth.requiresLogin, view_controller.results);


module.exports = router;
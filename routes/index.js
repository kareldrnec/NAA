// routing of index pages

var express = require("express");
var router = express.Router();
var auth = require('../auth');
const view_controller = require('../controllers/viewController');

// GET - main page
router.get('/', auth.requiresLogin, function(req, res) {
    return res.redirect('/projects/projectsDirectory')
});

// GET - about app
router.get('/about', auth.requiresLogin, view_controller.aboutApp);

// GET - settings
router.get('/settings', auth.requiresLogin, view_controller.renderSettings);

// POST - settings
router.post('/applySettings', auth.requiresLogin, view_controller.applySettings);

module.exports = router;
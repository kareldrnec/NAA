// routing of index pages

var express = require("express");
var router = express.Router();
var auth = require('../auth');
const view_controller = require('../controllers/viewController');


router.get('/', auth.requiresLogin, view_controller.getIndexPage);

router.get('/about', auth.requiresLogin, view_controller.aboutApp);

router.get('/help', auth.requiresLogin, view_controller.helpPage);

router.get('/settings', auth.requiresLogin, function(req, res) {
    res.render("settings", {
        title: "Settings"
    })
})

module.exports = router;
// routing of index pages

var express = require("express");
var router = express.Router();
var auth = require('../auth');

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/about', function(req, res) {
    res.render('about', {
        title: "About app"
    });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../auth');

// GET - router Projects Directory
router.get("/projectsDirectory", function(req, res) {
    res.render("projectsDirectory", {
        title: "Directory"
    });
});






module.exports = router;

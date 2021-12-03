const express = require('express');
const router = express.Router();
const auth = require('../auth');

router.get("/addNewActivity", auth.requiresLogin, function(req, res) {
    res.render("addActivity", {
        title: "Add Activity"
    })
})

module.exports = router;
var express = require('express');
var router = express.Router();
const auth = require('../auth');
const user_controller = require('../controllers/userController');


// GET - router Login
router.get("/login", function(req, res) {
    res.render("login", {
        title: "Login"
    });
});

// GET - router Register
router.get("/register", function(req, res){
    res.render("register", {
        title: "Register"
    });
});

// GET - router MyProfile
router.get("/myProfile", auth.requiresLogin, user_controller.myProfile);

// POST - router Login
router.post("/login", user_controller.loginUser);

// POST - router Register
router.post("/register", user_controller.registerNewUser);

// GET - router Logout
router.get("/logout", user_controller.logout);

module.exports = router;
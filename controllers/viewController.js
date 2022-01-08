const UserModel = require('../models/user');

<<<<<<< HEAD
exports.aboutApp = async(req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        return res.render("about", {
            title: req.__("about app"),
            username: user.userName
        })
    } catch (err) {
        return next(err);
    }
=======

exports.getIndexPage = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);
    res.cookie("username", user.userName)
    res.redirect("/projects/projectsDirectory")
>>>>>>> 497c2153673148ce275e4e6c570b5b0ba35bcd9e
}

exports.helpPage = async(req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        return res.render("help", {
            title: req.__("help"),
            username: user.userName
        })
    } catch (err) {
        return next(err);
    }
}

exports.results = async(req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        return res.render("results", {
            title: req.__("results"),
            username: user.userName
        })
    } catch (err) {
        return next(err);
    }
}

exports.monteCarlo = async(req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        return res.render("monteCarloAnalysis", {
            title: req.__("monte carlo analysis"),
            username: user.userName + " " + user.userSurname
        })
    } catch (err) {
        return next(err);
    }
}

exports.renderSettings = async(req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        res.render("settings", {
            title: req.__("settings"),
            username: user.userName + " " + user.userSurname,
            language_value: req.cookies.locale
        });
    } catch (err) {
        return next(err);
    }
}

exports.applySettings = function(req, res) {
    // DODELAT, mozna zmena barvy
    res.cookie("locale", req.body.languages);
    res.redirect("/settings")
};
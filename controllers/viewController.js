const UserModel = require('../models/user');

exports.aboutApp = async(req, res, next) => {
    try {
        var user = await UserModel.findById(req.session.userId);
        return res.render("about", {
            title: req.__("about app"),
            username: user.userName + " " + user.userSurname,
            navColor: req.cookies.navColor
        })
    } catch (err) {
        return next(err);
    }
}

exports.helpPage = async(req, res, next) => {
    try {
        var user = await UserModel.findById(req.session.userId);
        return res.render("help", {
            title: req.__("help"),
            username: user.userName + " " + user.userSurname,
            navColor: req.cookies.navColor
        })
    } catch (err) {
        return next(err);
    }
}

/*
exports.results = async(req, res, next) => {
    try {
        var user = await UserModel.findById(req.session.userId);
        return res.render("results", {
            title: req.__("results"),
            username: user.userName + " " + user.userSurname,
            navColor: req.cookies.navColor
        })
    } catch (err) {
        return next(err);
    }
}
*/

exports.renderSettings = async(req, res, next) => {
    try {
        var user = await UserModel.findById(req.session.userId);
        res.render("settings", {
            title: req.__("settings"),
            username: user.userName + " " + user.userSurname,
            language_value: req.cookies.locale,
            navColor: req.cookies.navColor,
            graphSettings: req.cookies.graphSettings
        });
    } catch (err) {
        return next(err);
    }
}

exports.applySettings = function(req, res, next) {
    // DODELAT, mozna zmena barvy, osetreni chyb
    try {
        res.cookie("locale", req.body.languages);
        res.cookie("navColor", req.body.navColor);
        res.cookie("graphSettings", JSON.stringify([req.body.statesColor, req.body.activitiesColor]))
        req.session.flash = { type: 'success', text: req.__("settings changed") }
        return res.redirect("/settings")
    } catch (err) {
        return next(err);
    }
};
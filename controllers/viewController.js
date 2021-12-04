const UserModel = require('../models/user');


exports.getIndexPage = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render('index', {
        title: req.__("home"),
        username: user.userName
    });
}

exports.aboutApp = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("about", {
        title: req.__("about app"),
        username: user.userName
    })
}

exports.helpPage = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("help", {
        title: req.__("help"),
        username: user.userName
    })
}

exports.results = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("results", {
        title: req.__("results"),
        username: user.userName
    })
}

exports.monteCarlo = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("monteCarloAnalysis", {
        title: req.__("monte carlo analysis"),
        username: user.userName
    })

}

exports.renderSettings = function(req, res) {
    res.render("settings", {
        title: req.__("settings"),
        language_value: req.cookies.locale
    });
}

exports.applySettings = function(req, res) {
    // DODELAT, mozna zmena barvy
    res.cookie("locale", req.body.languages);
    res.redirect("/settings")
};
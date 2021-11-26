const UserModel = require('../models/user');


exports.getIndexPage = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render('index', {
        title: 'Home',
        username: user.userName
    });
}

exports.aboutApp = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("about", {
        title: "About App",
        username: user.userName
    })
}

exports.helpPage = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("help", {
        title: "Help",
        username: user.userName
    })
}

exports.results = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("results", {
        title: "Results",
        username: user.userName
    })
}

exports.monteCarlo = async(req, res) => {

    let user = await UserModel.findById(req.session.userId);

    res.render("monteCarloAnalysis", {
        title: "Monte Carlo Analysis",
        username: user.userName
    })

}
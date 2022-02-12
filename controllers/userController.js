// user controller

const UserModel = require('../models/user');
const ActivityModel = require('../models/activity');
const StateModel = require('../models/state');
const ProjectModel = require('../models/project');


const bcrypt = require('bcrypt');

exports.registerNewUser = async (req, res, next) => {
    //generating salt
    const { userName, userSurname, email, password, confirmPassword } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        if (password != confirmPassword) {
            return res.status(400).json({
                msg: req.__("passwords not same")
            });
        }
        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({
                msg: req.__("user exists")
            });
        }
        const hashedPsw = await bcrypt.hash(password, salt);
        user = UserModel({
            userName,
            userSurname,
            email,
            password: hashedPsw
        })
        await user.save();
        req.session.flash = { type: 'success', text: req.__("account created") };
        res.redirect("/users/login");
    } catch (err) {
        return next(err);
    }
};

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.render('login', {
                errMsg: req.__("user not found")
            });
        }
    
        const isPasswordMatch = await bcrypt.compare(password, user.password);
    
        if (!isPasswordMatch) {
            return res.render('login', {
                errMsg: req.__("wrong password")
            })
        }
        
        req.session.userId = user._id;
        req.session.flash = { type: 'success', text: req.__("logged in") + " " + user.userName + '! :)' };
        return res.redirect("/")

    } catch (err) {
        return next(err);
    }
};

exports.logout = function (req, res, next) {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        })
    }
};

exports.myProfile = async (req, res, next) => {
    try {
        let user = await UserModel.findById(req.session.userId);
        let date = user.createdAt;
        let stringDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        return res.render("myProfile", {
            title: req.__("my profile"),
            username: user.userName + " " + user.userSurname,
            name: user.userName,
            surname: user.userSurname,
            email: user.email,
            created: stringDate
        });
    } catch (err) {
        return next(err);
    }
};

exports.deleteAccount = async (req, res, next) => {
    try {
        let projects = await ProjectModel.find({ userId: req.session.userId });

        for(var i = 0; i < projects.length; i++) {
            await StateModel.deleteMany({ projectID: projects[i]._id });
            await ActivityModel.deleteMany({ projectID: projects[i]._id });
        }

        await ProjectModel.deleteMany({ userId: req.session.userId });
        await UserModel.findByIdAndDelete(req.session.userId);
        
        req.session.destroy();

        return res.redirect("/");
    } catch (err) {
        return next(err);
    }
}

exports.updateAccount = async (req, res, next) => {
    const { username, surname } = req.body;
    try {
        await UserModel.findByIdAndUpdate(req.session.userId, {
            userName: username,
            userSurname: surname
        });
        req.session.flash = { type: 'success', text: req.__("account updated") };
        return res.redirect("/users/myProfile");
    } catch (err) {
        return next(err);
    }
}
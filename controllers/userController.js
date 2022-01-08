// user controller

const UserModel = require('../models/user');
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

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            msg: req.__("user not found")
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
            username: user.userName,
            surname: user.userSurname,
            email: user.email,
            created: stringDate
        });
    } catch (err) {
        return next(err);
    }
};

exports.deleteAccount = async (req, res, next) => {
    //Dodelat
    let userId = req.session.userId;
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        }
    })
    await UserModel.findByIdAndRemove(userId);
    return res.redirect("/");
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
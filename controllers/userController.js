// user controller

const UserModel = require('../models/user');
const bcrypt = require('bcrypt');

exports.registerNewUser = async (req, res) => {
    //generating salt
    const salt = await bcrypt.genSalt(10);
    console.log(req.body.userName)
    const { userName, userSurname, email, password, confirmPassword } = req.body;

    try {
        if (password != confirmPassword) {
            return res.status(400).json({
                msg: "Passwords are not equal!"
            });
        }
        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({
                msg: "User already exists!"
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
        req.session.flash = { type: 'success', text: 'Your account was successfully created! You can log in now! :)' };
        res.redirect("/users/login");
    } catch (err) {
        console.log(err.message);
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            msg: "User was not found!"
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            msg: "Wrong password!"
        });
    }

    req.session.userId = user._id;
    req.session.flash = { type: 'success', text: 'You successfully logged in! Welcome ' + user.userName + '! :)' };
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

exports.myProfile = async (req, res) => {
    let user = await UserModel.findById(req.session.userId);
    let date = user.createdAt;
    let stringDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    res.render("myProfile", {
        title: "My Profile",
        username: user.userName,
        surname: user.userSurname,
        email: user.email,
        created: stringDate
    });

};

exports.deleteAccount = async (req, res) => {
    let userId = req.session.userId;
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        }
    })
    await UserModel.findByIdAndRemove(userId);
    return res.redirect("/");
}
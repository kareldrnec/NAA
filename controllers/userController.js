// user controller

const UserModel = require('../models/user');
const bcrypt = require('bcrypt');

exports.registerNewUser = async (req, res) => {
    //generating salt
    const salt = await bcrypt.genSalt(10);

    const { userName, userSurname, email, password, confirmPassword} = req.body;

    try {

    } catch (err) {
        console.log(err.message);
    }

};

exports.loginUser = async (req, res) => {

};

exports.logout = function (req, res, next) {

};

exports.myProfile = async (req, res) => {

};
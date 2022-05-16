var passwordValidator = require('password-validator');

var schema = new passwordValidator();

// PASSWORD SCHEMA
schema
    .is().min(8)
    .is().max(30)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces();

exports.validate = function(password) {
    return schema.validate(password);
};
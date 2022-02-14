// Schema of project
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
    projectName: {
        type: String,
        required: true,
        unique: true
    },
    projectType: {
        type: String,
        required: true
    }, 
    projectInfo: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }, 
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Project', projectSchema);

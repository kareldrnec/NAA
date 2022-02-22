//FILENAME : db.js

const mongoose = require('mongoose');

//mongoURI
const mongoURI = process.env.MONGO_URI;

const InitiateMongoServer = async() => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true
        });
    } catch (e) {
        throw e;
    }
}

module.exports = InitiateMongoServer;
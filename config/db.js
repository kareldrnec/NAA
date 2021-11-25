//FILENAME : db.js

const mongoose = require('mongoose');

//mongoURI
const mongoURI = "";

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true 
        });
    } catch(e) {
        console.log(e);
        throw e;
    }
}

module.exports = InitiateMongoServer;
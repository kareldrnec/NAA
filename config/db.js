//FILENAME : db.js

const mongoose = require('mongoose');

//mongoURI
const mongoURI = "mongodb+srv://admin:admin@cluster0.gr9ky.mongodb.net/NAA?retryWrites=true&w=majority";

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
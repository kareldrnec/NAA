// express
const express = require('express');
const app = express();

// handlebars
const { engine } = require('express-handlebars');
console.log(typeof(engine));
// setting port
const port = process.env.PORT || 3000;



// path
const path = require('path');

// session
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

//setting handlebars engine

app.engine('handlebars', engine({
    defaultLayout: 'main',
    extname: '.handlebars'
}));
app.set('view engine', 'handlebars');



// express - serving static files
app.use(express.static(path.join(__dirname, '/public')));

//mongo
//
//




// routing 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));


// app listen
app.listen(port, () => {
    console.log("NAA listening...");
})

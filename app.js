// express
const express = require('express');
const app = express();

// handlebars
const { engine } = require('express-handlebars');

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

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// express - serving static files
app.use(express.static(path.join(__dirname, '/public')));

//mongo
//
//
const InitiateMongoServer = require('./config/db');
InitiateMongoServer();

// session store
const store = new MongoStore({
    uri: "mongodb+srv://admin:admin@cluster0.gr9ky.mongodb.net/NAA?retryWrites=true&w=majority",
    collection: "mySession"
});

app.use(session({
    secret: 'SECRET KEY',
    resave: false,
    saveUninitialized: false,
    store: store
}));


// TODO express flash messages
//express-flash-message
app.use((req, res, next) => {
    if(req.session.flash){
        res.locals.flash = req.session.flash;
        delete req.session.flash;
    }
    next();
});


// routing 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));
app.use('/calculations', require('./routes/calculations'));

// app listen
app.listen(port, () => {
    console.log("NAA listening...");
})

// express
const express = require('express');
const app = express();

// handlebars
const { engine } = require('express-handlebars');

// setting port
const port = process.env.PORT || 3000;
const http = require('http');
const dotenv = require('dotenv').config();
// const morgan = require('morgan');

// i18n - languages
const i18n = require('i18n');
// body parser ?? 
var bodyParser = require('body-parser');

// path
const path = require('path');

const state_controller = require('./controllers/stateController');
const activity_controller = require('./controllers/activityController');

const server = http.createServer(app);
const { Server } = require('socket.io');
const methodOverride = require('method-override');

// app listen
server.listen(port, () => {
    console.log("NAA listening...");
})

var io = new Server(server);
exports.io = io;

io.on("connection", (socket) => {
    //states
    socket.on('new state', state_controller.addState);
    socket.on('edit state', state_controller.editState);
    socket.on('delete state', state_controller.deleteState);

    //activities
    socket.on('new activity', activity_controller.addActivity);
    socket.on('edit activity', activity_controller.editActivity);
    socket.on('delete activity', activity_controller.deleteActivity);
});

// cookieParser
const cookieParser = require('cookie-parser');


// session
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);


i18n.configure({
    locales: ['en', 'cz'],
    cookie: 'locale',
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'en'
});

app.set('view engine', 'handlebars');

// cookie parser
app.use(cookieParser());

//i18n init
app.use(i18n.init);

//setting handlebars engine
app.engine('handlebars', engine({
    defaultLayout: 'main',
    extname: '.handlebars',
    helpers: {
        json: function(value) {
            return JSON.stringify(value);
        },
        inc: function(value, options) {
            return parseInt(value) + 1;
        },
        upper: function(value, options) {
            return value.toUpperCase();
        },
        ifEquals: function(value1, value2, options) {
            return (value1 == value2) ? options.fn(this) : options.inverse(this);
        },
        __: function() {
            return i18n.__.apply(this, arguments);
        }
    }
}));

// 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// method override
app.use(methodOverride('_method'));

// express - serving static files
app.use(express.static(path.join(__dirname, '/public')));


// app.use(morgan('tiny'));

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
// schovat promenny do env

// TODO express flash messages
//express-flash-message
app.use((req, res, next) => {
    if (req.session.flash) {
        res.locals.flash = req.session.flash;
        delete req.session.flash;
    }
    next();
});


// routing 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));
//app.use('/activities', require('./routes/activities'));
// idk jeste
app.use('/calculations', require('./routes/calculations'));



// Dodelat !! :)
app.use((err, req, res, next) => {
    console.log("Chyba")
    console.log(err)
    console.log("/////")
    if (err.code == 11000) {
        return res.redirect('back');
    }
    return res.status(500).render('error', {
        title: req.__("error"),
        code: "500",
        text: req.__("500 response")
    })
})



// handle error pages 400, 500
// 404
app.use(function(req, res) {
    res.status(404).render("error", {
        code: "404"
    });
});
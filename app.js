// app server
const express = require('express');                                         // express
const { engine } = require('express-handlebars');                           // express-handlebars
const port = process.env.PORT || 3000;                                      // port settings
const http = require('http');                                               // http
const dotenv = require('dotenv').config();                                  // dotenv
// const morgan = require('morgan'); IDK TODO
const i18n = require('i18n');                                               // i18n - translations
var bodyParser = require('body-parser');                                    // body-parser
const mongoSanitize = require('express-mongo-sanitize');                    // express-mongo-sanitize against NoSQL
const helmet = require('helmet');                                           // helmet - HTTP header secure, ...
const path = require('path');                                               // path - for static files
const state_controller = require('./controllers/stateController');          // stateController
const activity_controller = require('./controllers/activityController');    // activityController
const app = express();                                                      // express app
const server = http.createServer(app);                                      // server
const { Server } = require('socket.io');                                    // socket.io
const methodOverride = require('method-override');                          // method-override - setting methods PUT/DELETE correctly
const cookieParser = require('cookie-parser');                              // cookie-parser
const session = require('express-session');                                 // express-session
const MongoStore = require('connect-mongodb-session')(session);             // connect-mongodb-session
const InitiateMongoServer = require('./config/db');                         // InitiateMongoServer

// session store
// expires - 1800000 ms = 30 minutes 
const store = new MongoStore({
    uri: process.env.MONGO_URI,
    collection: "mySession",
    //expires: 1800000
    // podivat se na expiraci session
});

// scriptSources for helmet
const scriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'code.jquery.com', 'stackpath.bootstrapcdn.com',
    'cdnjs.cloudflare.com', 'kit.fontawesome.com'];
// styleSources for helmet
const styleSources = ["'self'", "'unsafe-inline'", 'stackpath.bootstrapcdn.com', 'cdnjs.cloudflare.com']

// app listen
server.listen(port, () => {
    console.log("NAA listening...");
})

var io = new Server(server);
exports.io = io;

io.on("connection", (socket) => {
    //states
    socket.on('new state', state_controller.addState);                  // create new state
    socket.on('edit state', state_controller.editState);                // edit state
    socket.on('delete state', state_controller.deleteState);            // delete state
    //activities
    socket.on('new activity', activity_controller.addActivity);         // create new activity
    socket.on('edit activity', activity_controller.editActivity);       // edit activity
    socket.on('delete activity', activity_controller.deleteActivity);   // delete activity
});

// i18n configuration
i18n.configure({
    locales: ['en', 'cz'],                        // language option
    cookie: 'locale',                             // cookie name
    directory: path.join(__dirname, '/locales'),  // path to translation files
    defaultLocale: 'en'                           // default language option
});

app.set('view engine', 'handlebars');             // use express-handlebars
app.use(cookieParser());                          // use cookie-parser
app.use(i18n.init);                               // i18n init

// express-handlebars configuration
app.engine('handlebars', engine({
    defaultLayout: 'main',
    extname: '.handlebars',
    helpers: {
        json: function (value) {
            return JSON.stringify(value);
        },
        inc: function (value, options) {
            return parseInt(value) + 1;
        },
        upper: function (value, options) {
            return value.toUpperCase();
        },
        ifEquals: function (value1, value2, options) {
            return (value1 == value2) ? options.fn(this) : options.inverse(this);
        },
        __: function () {
            return i18n.__.apply(this, arguments);
        }
    }
}));

app.use(bodyParser.urlencoded({ extended: false }));        // use body-parser
app.use(bodyParser.json());                                 // use body-parser
app.use(methodOverride('_method'));                         // use method-override
app.use(express.static(path.join(__dirname, '/public')));   // serve static files

// idk
// app.use(morgan('tiny'));

InitiateMongoServer();          // init mongo server

app.use(session({
    secret: 'SECRET KEY',
    resave: false,
    saveUninitialized: false,
    store: store
}));

// use flash messages
app.use((req, res, next) => {
    if (req.session.flash) {
        res.locals.flash = req.session.flash;
        delete req.session.flash;
    }
    next();
});

// use express-mongo-sanitize


// use ? for xss

// use helmet

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: scriptSources,
            styleSrc: styleSources,
            fontSrc: ["'self'", 'https://ka-f.fontawesome.com'],
            connectSrc: ["'self'", 'https://ka-f.fontawesome.com'],
            imgSrc: ["'self'", 'data:'],
            scriptSrcAttr: ["'self'"]
        }
    }
}));

app.use(
    mongoSanitize({
        replaceWith: '_'
    })
);

// routing
app.use('/', require('./routes/index'));                // index routing
app.use('/users', require('./routes/users'));           // users routing
app.use('/projects', require('./routes/projects'));     // projects routing

//
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
app.use(function (req, res) {
    res.status(404).render("error", {
        code: "404"
    });
});
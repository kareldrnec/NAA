// express
const express = require('express');
const app = express();

// handlebars
const { engine } = require('express-handlebars');

// setting port
const port = process.env.PORT || 3000;

// const morgan = require('morgan');

// i18n - languages
const i18n = require('i18n');
// body parser ?? 
var bodyParser = require('body-parser');
// path
const path = require('path');

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
        inc: function(value, options) {
            return parseInt(value) + 1;
        },
        upper: function(value, options) {
            return value.toUpperCase();
        },
        ifEquals: function(value1, value2, options) {
            return (value1 == value2) ? options.fn(this) : options.inverse(this);
        },
        __: function(){
            return i18n.__.apply(this, arguments);
        }
    }
}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
app.use('/states', require('./routes/states'));
app.use('/activities', require('./routes/activities'));
// idk jeste
app.use('/calculations', require('./routes/calculations'));


// handle error pages 400, 500
// 404
app.use(function(req, res) {
    res.status(404).render("error", {
        code: "404"
    });
});



// app listen
app.listen(port, () => {
    console.log("NAA listening...");
})
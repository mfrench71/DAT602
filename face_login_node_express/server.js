// require modules
var express         = require('express');
var app             = express();
var port            = process.env.PORT || 8080;
var mongoose        = require('mongoose');
var passport        = require('passport');
var flash           = require('connect-flash');
var twitter         = require('twit');
var hbs             = require('hbs');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');

// load config variables
var configDB        = require('./config/database');
var config          = require('./config/auth');
var twitter         = new twitter(config);

// connect to database
// mongoose.connect(configDB.url); (deprecated)
var promise = mongoose.connect(configDB.url, {
  useMongoClient: true,
});

require('./config/passport')(passport); // pass passport for configuration

// set up express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // serve static files

// handlebars helper (columns)
hbs.registerHelper('grouped_each', function(every, context, options) {
    var out = "", subcontext = [], i;
    if (context && context.length > 0) {
        for (i = 0; i < context.length; i++) {
            if (i > 0 && i % every === 0) {
                out += options.fn(subcontext);
                subcontext = [];
            }
            subcontext.push(context[i]);
        }
        out += options.fn(subcontext);
    }
    return out;
});

// handlebars helper (conditional)
hbs.registerHelper('ifEquals', function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});

// handlebars helper (lower case)
hbs.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

// Use handlebars view engine
app.set('view engine', 'hbs');
// Use EJS view engine
app.set('view engine', 'ejs');

// required for passport
app.use(session({
    secret: 'dat602-secret', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use flash messaging

// routes
require('./app/routes.js')(app, passport, twitter, config); // load our routes and pass in our app and fully configured passport

// start app
app.listen(port);
console.log('Connected on port ' + port);

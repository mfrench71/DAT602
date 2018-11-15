// require modules
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var Twitter  = require('twitter');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// load config variables
var configDB = require('./config/database');
var configAuth = require('./config/auth');

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
app.use(express.static('public')) // serve static files

// Use Handlebars view engine
app.set('view engine', 'hbs');

// required for passport
app.use(session({
    secret: 'dat602-secret', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var client = new Twitter ({
  consumer_key: configAuth.twitterAuth.consumerKey,
  consumer_secret: configAuth.twitterAuth.consumerSecret,
  access_token_key: configAuth.twitterAuth.accessTokenKey,
  access_token_secret: configAuth.twitterAuth.accessTokenSecret
});

// get tweets from friends' screen_names
app.get('/twitter', function(req, res, next) {
	client.get('statuses/user_timeline', { screen_name: 'matthewfrench71', count: 20 }, function(error, tweets, response) {
	    if (!error) {
	      res.status(200).render('twitter', { tweets: tweets });
	    }
	    else {
	      res.status(500).json({ error: error });
	    }
  	});
});

// routes
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// start app
app.listen(port);
console.log('Connected on port ' + port);

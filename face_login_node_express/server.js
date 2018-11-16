// require modules
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var Twitter  = require('twit');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// load config variables
var configDB = require('./config/database');
var config = require('./config/auth');

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
app.set('view engine', 'ejs');

// required for passport
app.use(session({
    secret: 'dat602-secret', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var twitter = new Twitter(config);

// Get the user IDs of 100 friends
function getFriends(next) {
  twitter.get('friends/ids', { screen_name: config.screen_name, count: 100 }, function(err, data) {
    // If we have the IDs, we can look up user information
    if (!err && data) {
      lookupUsers(data.ids, next);
    }

    // Otherwise, return with error
    else {
      next(err);
    }
  });
}

// Get user information for the array of user IDs provided
function lookupUsers(user_ids, next) {
  twitter.get('users/lookup', { user_id: user_ids.join() }, function(err, data) {

    // If we have user information, we can pass it along to render
    if (!err && data) {

      // We'll fill this array with the friend data you need
      var friends_array = new Array();

      for (index in data) {

        // Get your friend's join date and do some leading zero magic
        var date = new Date(data[index].created_at);
        var date_str = date.getFullYear() + '-'
               + ('0' + (date.getMonth()+1)).slice(-2) + '-'
               + ('0' + date.getDate()).slice(-2);

        // Push the info to an array
        friends_array.push({
          'name'          : data[index].name,
          'screen_name'   : data[index].screen_name,
          'created_at'    : date_str,
          'profile_image' : data[index].profile_image_url,
          'link_color'  : data[index].profile_link_color
        });
      }

      // The callback function defined in the getFriends call
      next(err, friends_array);
    }

    // Otherwise, return with error
    else {
      next(err);
    }
  });
}

// This is the route for our index page
app.get('/twitter', function(req, res){

  // Calling the function defined above to get friend information
  getFriends(function(err, data) {

    // Render the page with our Twitter data
    if (!err && data) {
      res.render('twitter.ejs', { friends: data });
    }

    // Otherwise, render an error page
    else {
      res.send('Something went wrong :(\n'+err.message);
    }
  });
});

// routes
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// start app
app.listen(port);
console.log('Connected on port ' + port);

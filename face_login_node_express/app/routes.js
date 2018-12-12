module.exports = function(app, passport, twitter, config) {

    // Get the user IDs of 100 friends
    function getFriends(screen_name, next) {
      twitter.get('friends/ids', { screen_name: screen_name, count: 100 }, function(err, data) {
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
            // Get your friend's join date and add leading zeroes
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

    // twitter friends
    app.get('/twitter', isLoggedIn, function(req, res){
      // get twitter screen name of currently logged-in user
      var user = req.user;
      var screen_name = user.local.twitter;
      // get user's friend information
      getFriends(screen_name, function(err, data) {
        // Render the page with our Twitter data
        if (!err && data) {
          res.render('twitter.hbs', {
               user: req.user, 
               friends: data 
           });
        }
        // Otherwise, render an error page
        else {
          res.send(err.message);
        }
      });
    });

    // tweets
    app.get('/twitter/:screen_name', isLoggedIn, function(req, res) {
        // get friend's tweets
      twitter.get('statuses/user_timeline', { screen_name: req.params.screen_name, count: 10 }, function(err, data) {
        // Render the page with our Twitter data
        if (!err && data) {
            console.log(data);
          res.render('tweets.hbs', {
               user: req.user,
               screen_name: req.params.screen_name,
               profile_link_color: data[0].user.profile_link_color,
               profile_image_url: data[0].user.profile_image_url,
               profile_banner_url: data[0].user.profile_banner_url,
               tweets: data
           });
        }
        // Otherwise, render an error page
        else {
          res.send(err.message);
        }
      });
    });

    // twitter visualisation test
    app.get('/twitter-vis', isLoggedIn, function(req, res){
      // get twitter screen name of currently logged-in user
      var user = req.user;
      var screen_name = user.local.twitter;
      // get user's friend information
      getFriends(screen_name, function(err, data) {
        // Render the page with our Twitter data
        if (!err && data) {
          res.render('twitter.ejs', {
               user: req.user, 
               friends: data 
           });
        }
        // Otherwise, render an error page
        else {
          res.send(err.message);
        }
      });
    });

    // home
    app.get('/', function(req, res) {
        res.render('index.hbs', {
            user: req.user,
            title: 'home'
        });
    });

    // profile
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.hbs', {
            user : req.user
        });
    });

    // logout
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // show the login form
    app.get('/login', function(req, res) {
        res.render('login.hbs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // show the signup form
    app.get('/signup', function(req, res) {
        res.render('signup.hbs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
// TODO maybe playlists/song by same artist at end?


/*
 * Requires:
 *   express
 *   mongodb
 *   passport
 *   passport-facebook
 *   querystring
 */
var express = require('express'),
    http = require('http'),
    DbManager = require("./db.js").DbManager,
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

function log(s) { console.log(s); }

var db = new DbManager(),
    app = express();

app.configure(function() {
  app.use(express.static('static'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'soundbarrel is the best evar' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

// this has to come before the static content serving line
app.get("/", function(req, res) {
  res.redirect("/login");
});

var servePlay = function(req, res) {
  res.sendfile(__dirname + '/static/index.html');
}

app.get("/ambient", servePlay);
app.get("/classical", servePlay);
app.get("/country", servePlay);
app.get("/electronic", servePlay);
app.get("/folk", servePlay);
app.get("/jazz", servePlay);
app.get("/metal", servePlay);
app.get("/pop", servePlay);
app.get("/rock", servePlay);

app.get("/fetchGenre", function(req, res) {
  if(req.user == undefined) {
    res.json({
      "error" : true
    });
    return;
  }
  db.fetchGenre(res, req.user.userId, req.query.genre);
});

app.post("/updateGenre", function(req, res) {
  if(req.user == undefined) {
    res.json({
      "error" : true
    });
    return;
  }
  // make sure to use the request session user id
  db.updateGenre(res, req.user.userId, req.body.genre, req.body.percent, req.body.order);
});


// login stuff
passport.use(new FacebookStrategy({
    clientID: "381836551956985",
    clientSecret: "9956d512114e8731bda70f0dd6144839",
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	db.getUser(profile.id, function(doc) {
  		if(doc !== null) {
  			return done(null, {
					"userId" : profile.id,
					"name" : profile.displayName
				});
  		} else {
  			db.createNewUser({
					"userId" : profile.id,
					"name" : profile.displayName
				},
  			function(user) {
  			  return done(null, {
					  "userId" : profile.id,
					  "name" : profile.displayName
				  });
        });
  		}
  	});
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){
});

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
	passport.authenticate('facebook', {
		failureRedirect: '/login'
	}),
  function(req, res){
    res.redirect("/electronic");
  });


app.get("/login", function(req, res) {
	res.sendfile( __dirname + '/static/login.html');
});




	

app.get("/:genre/done", function(req, res) {
  if(req.user == undefined) {
    res.json({
      "error" : true
    });
    return;
  }
	db.done(res, req.param("genre"), req.user.userId);
});

app.get("/complete", function(req, res) {
	res.sendfile( __dirname + '/static/complete.html');
});

app.get("/done", function(req, res) {
	db.done(res, req.query.genre);
});


app.listen(8080);
log("Server listening on port 8080");

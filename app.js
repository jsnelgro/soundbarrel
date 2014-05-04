/*
 * Requires:
 *   express
 *   mongoose
 *   mongodb
 */
var express = require('express'),
    http = require('http'),
    DbManager = require("./db.js").DbManager,
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

function log(s) { console.log(s); }

var db = new DbManager(),
    app = express();

app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());


app.post("/createUser", function(req, res) {
  db.createNewUser(req.body.userid, req.body.username);
  res.end();
});

var servePlay = function(req, res) {
  res.sendfile(__dirname + '/static/index.html');
}

app.get("/alternative", servePlay);
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
  db.fetchGenre(res, "1", req.query.genre);
});

// OK NEED TO MAKE REQ.BODY CUZ POST TY BASED NODE
app.post("/updateGenre", function(req, res) {
  db.updateGenre(res, "1", req.body.genre, req.body.percent, req.body.order);
});


// login stuff

passport.use(new FacebookStrategy({
    clientID: "230563833809448",
    clientSecret: "50ac9f9ab651a34ff2f78f0667757232",
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
  	db.getUser(profile.id, function(doc) {
  		if(doc !== null) {
  			console.log("soundbarrel info", doc, "facebook id", profile.id);
  		} else {
  			db.createNewUserFromID(
  				{
  					"userID":profile.id,
  					"name":profile.displayName,
  					"emails":profile.emails
  				}
  			,function(data){console.log("user added ", data);});
  		}
  	});
  }
));

app.get("/login", function(req, res) {
	res.sendfile( __dirname + '/static/login.html');
});
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
	passport.authenticate('facebook', 
		{ 
			successRedirect: '/',
			failureRedirect: '/login' 
		}
	)
);



app.listen(8080);
log("Server listening on port 8080");


// soundcloud explore api to get initial song list by genre no documented, use below (go to explore page and look at network tab) (can change the limit parameter if want more songs)

// https://api-v2.soundcloud.com/explore/electro?tag=uniform-time-decay-experiment%3A1%3A1395188535&limit=10&offset=0&linked_partitioning=1

// then get the "uri" field of each item in list that get in json from above and do an oembed with that

// curl "http://soundcloud.com/oembed" -d 'format=json' -d 'url=https://api.soundcloud.com/tracks/143879497'

// ^ just a POST request with the -d parameters as data
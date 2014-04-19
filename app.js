/*
 * Requires:
 *   express
 *   mongoose
 *   mongodb
 */
var express = require('express'),
    http = require('http'),
    DbManager = require("./db.js").DbManager;

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
  db.updateGenre(res, "1", req.body.genre, req.body.percent, []);
});

app.listen(8080);
log("Server listening on port 8080");


// use passport facebook for fb auth? https://github.com/jaredhanson/passport-facebook http://passportjs.org/



// soundcloud explore api to get initial song list by genre no documented, use below (go to explore page and look at network tab) (can change the limit parameter if want more songs)

// https://api-v2.soundcloud.com/explore/electro?tag=uniform-time-decay-experiment%3A1%3A1395188535&limit=10&offset=0&linked_partitioning=1

// then get the "uri" field of each item in list that get in json from above and do an oembed with that

// curl "http://soundcloud.com/oembed" -d 'format=json' -d 'url=https://api.soundcloud.com/tracks/143879497'

// ^ just a POST request with the -d parameters as data
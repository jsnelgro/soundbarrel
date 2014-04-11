/*
 * Requires:
 *   express
 *   mongoose
 */
var express = require('express'),
  DbManager = require("./db.js").DbManager;


var db = new DbManager(),
    app = express();
app.use("/", express.static(__dirname + '/static'));



app.listen(8080);


// use passport facebook for fb auth? https://github.com/jaredhanson/passport-facebook http://passportjs.org/
// don't think we need to use passport. We can probably just use the login authentication provided by soundcloud. I posted a link in the readme


// soundcloud explore api to get initial song list by genre no documented, use below (go to explore page and look at network tab) (can change the limit parameter if want more songs)

// https://api-v2.soundcloud.com/explore/electro?tag=uniform-time-decay-experiment%3A1%3A1395188535&limit=10&offset=0&linked_partitioning=1

// then get the "uri" field of each item in list that get in json from above and do an oembed with that

// curl "http://soundcloud.com/oembed" -d 'format=json' -d 'url=https://api.soundcloud.com/tracks/143879497'

// ^ just a POST request with the -d parameters as data
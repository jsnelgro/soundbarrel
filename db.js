var MongoClient = require('mongodb').MongoClient,
    BSON = require('mongodb').BSON,
    ObjectID = require('mongodb').ObjectID,
    http = require('http'),
    https = require('https'),
    querystring = require('querystring');

function log(msg) {
  console.log(msg);
}

var songCount = 30;

DbManager = function() {
  this.db = {};
  this.users = {};
  var self = this;
  this.client = MongoClient.connect("mongodb://soundbarrel:soundbarrel@oceanic.mongohq.com:10064/soundbarrel", {},
      function (err, db) {
        if (err) {
          log(err);
        } else {
          log("=== Successfully connected to MongoDB on soundbarrel:soundbarrel@oceanic.mongohq.com ===");
          self.db = db;
          db.createCollection("users", function(err, collection){
	          if(err) {
	            throw err;
            }
	         	self.users = db.collection("users");
	        });
        }
      });
      /*
      // Facebook ID or ID from cookie if they didn't login (STRING!)
      userId : String,
      // the name that we got from the Facebook login
      name : String,
      // an object whose keys are the genres as strings and
      // the values are the percent complete in sorting the songs
      percentagesComplete : mongoose.Schema.Types.Mixed,
      // an object where the keys are the genres and each value is
      // an array of objects each with two fields, one called start and
      // the other called end, which are each an ordered array of song ids
      // at the beginning and end of a sorting set 
      orders : mongoose.Schema.Types.Mixed,
      // an array of objects that have a song id and player url
      players : mongoose.Schema.Types.Mixed
      */
}



DbManager.prototype.startGenre = function(response, doc, genre) {
  var getOptions = {
    host: 'api-v2.soundcloud.com',
    port: '443',
    path: '/explore/' + genre + "?limit=" + songCount + "&offset=0",
    method: 'GET',
  };
  var self = this;
  this.makeExternalHttpReq(true, {}, getOptions, function(soundcloudRes) {
    // an array of objects from which we can get the players
    var genreTracks = JSON.parse(soundcloudRes).tracks,
        numberTracksDone = 0;
    //genreTracks =  genreTracks.splice(0, songCount);
    var genrePlayers = genreTracks.map(function(track) {
      return track.uri;
    });
    var players = [];
    for(p in genrePlayers) {
      var player = genrePlayers[p],
          id = new ObjectID().toString();
      players.push({
        "id" : id,
        "player" : player,
      });
    }
    doc.players[genre] = players;
    doc.orders[genre] = [];
    doc.percentagesComplete[genre] = 0;
    log("start DOC:");
log(JSON.stringify(doc));
    self.saveUser(doc, function() {
      response.json({
        "userData" : doc,
        "percent" : 0
      });
    });
  });
}

DbManager.prototype.makeExternalHttpReq = function(secure, data, options, callback) {
  var h = secure ? https : http;
  var req = h.request(options, function(response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function () {
      callback(str);
    });
  });
  //This is the data we are posting, it needs to be a string or a buffer
  req.write(querystring.stringify(data));
  req.end();
}

DbManager.prototype.done = function(response, genre, userId) {
  // give the user the top 10 songs we have ranked
  this.getUser(userId, function(doc) {
    var songs = doc.players[genre];
    if(songs == undefined || songs.length == 0) {
      response.json({
        "error" : true
      });
      return;
    }
    songs = songs.sort(function(a, b) {
      if (a.value < b.value)
         return 1;
      if (a.value > b.value)
         return -1;
      return 0;
    });
    if(songs == undefined || songs.length == 0) {
      response.json({
        "error" : true
      });
      return;
    }
    log(songs);
    songs = songs.slice(0, 10);
    log(songs);
    songs = songs.map(function(song) {
      return song.player;
    });
    response.json(songs);
  });
}


DbManager.prototype.updateGenre = function(response, userId, genre, percent, order) {
  var self = this;
  this.getUser(userId, function(doc) {
    var pushOperator = {"$push" : {}};
    pushOperator["$push"]["orders." + genre] = order;
    self.users.update({"userId" : userId}, pushOperator, function(err, updateDoc) {
      if(err) {
        log(err);
        return;
      }
      var setOperator = {$set : {}};
      setOperator["$set"]["percentagesComplete." + genre] = percent;
      self.users.update({"userId" : userId}, setOperator, function(err, updateDoc) {
        // set the values of the songs
        // after reconsidering our implementation of the ranking algorithm, we settled on this one
        // even though it is simpler so that we more closely followed the principles/idea of the research paper
        // the project is based on
        var asong = {id:0, originalOrder:1-3, newOrder:1-3};
        function updateSongValue(currentSong) {
          var songPlayer = doc.players[genre].filter(function(player) {
            return player.id == currentSong;
          })[0];
	        var oldValue = songPlayer.hasOwnProperty("value") ? songPlayer.value : 0;
	        var originalOrder = order.start.indexOf(currentSong),
	            newOrder = order.end.indexOf(currentSong);
	        if(originalOrder == newOrder)
		        oldValue += 1/3 * (2 - originalOrder);
	        else
		        oldValue += ((4 - originalOrder)/3)*(originalOrder - newOrder);
	        var newSongPlayer = songPlayer;
	        newSongPlayer.value = oldValue;
	        var songSetOperator = {$set : {}};
	        songSetOperator["$set"]["players." + genre + "." + doc.players[genre].indexOf(songPlayer)] = newSongPlayer;
	        self.users.update({"userId" : userId}, songSetOperator, function(err, updateDoc) {
	          if(err) {
              log(err);
              return;
            }
	        });
        }
        if(order == undefined || order.start == undefined || order.end == undefined) {
          response.json({
            "error" : true
          });
          return;
        }
        order.start.forEach(updateSongValue);
        response.end();
      });
    });
  });
}

DbManager.prototype.fetchGenre = function(response, userId, genre) {
  var self = this;
  this.getUser(userId, function(doc) {
  log("FETCH DOC");
  log(doc);
    if(doc.percentagesComplete.hasOwnProperty(genre)) {
      response.json({
        "userData" : doc,
        "percent" : doc.percentagesComplete[genre]
      });
      return;
    } else {
      // need to get the genre from soundcloud
      self.startGenre(response, doc, genre);
    }
  });
}


DbManager.prototype.createNewUserFromId = function(response, userId, username) {
  this.saveUser(new this.User({
    "userId" : userId,
    "name" : username,
    "percentagesComplete" : {},
    "orders" : {},
    "players" : {}
  }), function() {
    response.json({
      "error" : false
    });
  });
}

DbManager.prototype.createNewUser = function(userData, callback) {
  userData.percentagesComplete = {};
  userData.orders = {};
  userData.players = {};
  this.users.insert(userData, function(err, doc) {
    if(err) {
      log(err);
      return;
    }
    callback(userData);
  });
}











DbManager.prototype.getUser = function(userId, callback) {
  this.users.findOne({"userId" : userId}, function(err, doc) {
    if(err) {
      error(response, {
        "message" : "Error when updating user song list",
        "mongoError" : err
      });
      log(err);
      return;
    }
    callback(doc);
  });
}

DbManager.prototype.saveUser = function(user, callback, operator) {
  this.users.update({"userId" : user.userId}, operator == undefined ? user: operator, function(err, doc) {
    if(err) {
      log(err);
      return;
    }
    callback();
  });
}















function error(response, errorObj) {
  response.json({
    "error" : true,
    "details" : errorObj
  });
}

exports.DbManager = DbManager;

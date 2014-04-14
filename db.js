var mongoose = require('mongoose'),
    http = require('http'),
    https = require('https'),
    querystring = require('querystring'),
    ObjectID = require('mongodb').ObjectID;

function log(msg) {
  console.log(msg);
}

var songCount = 30;

DbManager = function() {
  mongoose.connect('mongodb://localhost/soundbarrel');
  mongoose.connection.on('error', function () {
    throw new Error('unable to connect to database at mongodb://localhost/soundbarrel');
  });
  var self = this;
  mongoose.connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
    self.User = mongoose.model('User', mongoose.Schema({
      // Facebook ID or ID from cookie if they didn't login
      // THIS IS A STRING YOU MUST QUERY WITH A STRING NOT A NUMBER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      userId : String,
      // the name that we got from the Facebook login
      name : String,
      // an object whose keys are the genres as strings and
      // the values are the percent complete in sorting the songs
      percentagesComplete : mongoose.Schema.Types.Mixed,
      // an object where the keys are the genres and each value is
      // an ordered array of the player object ids
      orders : mongoose.Schema.Types.Mixed,
      // an object whose keys are genres and whose values are
      // objects where the keys are the serialized mongo ids
      // and the values are soundcloud JSON player objects
      players : mongoose.Schema.Types.Mixed
    }), "User");

    self.getUser = function(userId, callback) {
      self.User.findOne({"userId" : userId}, function(err, doc) {
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


    self.saveUser = function(user, callback) {
      user.save(function(err, doc) {
        if(err) {
          error(response, {
            "message" : "Error when saving user song list",
            "mongoError" : err
          });
          return;
        }
        callback();
      });
    }



    self.startGenre = function(response, doc, genre) {
      log("did not save genre now starting "+genre);
      var getOptions = {
        host: 'api-v2.soundcloud.com',
        port: '443',
        path: '/explore/' + genre + "?limit=" + songCount + "&offset=0",
        method: 'GET',
      };
      self.makeExternalHttpReq(true, {}, getOptions, function(soundcloudRes) {
        // an array of objects from which we can get the players
        var genreTracks = JSON.parse(soundcloudRes).tracks,
            numberTracksDone = 0;
            log(genreTracks.length);
        var randomIndexes = [];
        while(randomIndexes.length < 3) {
          var ran = Math.ceil(Math.random()*(songCount - 1))
          var found = false;
          for(var i=0; i<randomIndexes.length; i++) {
            if(randomIndexes[i] == ran) {
              found = true;
              break;
            }
          }
          if(!found) {
            randomIndexes.push(ran);
          }
        }
        var selectedTracks = new Array(3);
        log(randomIndexes);
        selectedTracks[0] = genreTracks[randomIndexes[0]];
        selectedTracks[1] = genreTracks[randomIndexes[1]];
        selectedTracks[2] = genreTracks[randomIndexes[2]];
        //genreTracks =  genreTracks.splice(0, songCount);
        var genrePlayers = selectedTracks.map(function(track) {
          return track.uri;
        });
        var playersObject = {},
              playerOrder = [];
        for(p in genrePlayers) {
          var player = genrePlayers[p],
              id = new ObjectID().toString();
          playersObject[id] = player;
          playerOrder.push(id);
        }
        doc.players[genre] = playersObject;
        doc.orders[genre] = playerOrder;
        doc.percentagesComplete[genre] = 0;
        self.saveUser(doc, function() {});
        response.json({
          "players" : genrePlayers,
          "percent" : 0
        });
      });
    }

    self.makeExternalHttpReq = function(secure, data, options, callback) {
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
  });
}

// newList is a list of object ids that are in the order of the
// new list
DbManager.prototype.updateGenre = function(response, userId, genre, percent, newList) {
  var self = this;
  this.getUser(userId, function(doc) {
    doc.orders[genre] = newList;
    doc.percentagesComplete[genre] = percent;
    self.saveUser(doc, function() {
      /*response.json({
        "error" : false 
      });*/
      // DO NOT DO THIS IN PRODUCTION ONLY FOR DEMO
      log(genre);
      self.startGenre(response, doc, genre);
    });
  });
}

DbManager.prototype.createNewUser = function(response, userId, username) {
  this.saveUser(new this.User(userId, username, {}, {}, {}), function() {
    response.json({
      "error" : false 
    });
  });
}

DbManager.prototype.fetchGenre = function(response, userId, genre) {
  var self = this;
  this.getUser(userId, function(doc) {
    if(doc.percentagesComplete.hasOwnProperty(genre)) {
      // return the players in order and the percent
      // complete for this genre
      var orderedPlayers = [],
          players = doc.players[genre],
          order = doc.orders[genre];
      for(i=0; i<order.length; i++) {
        orderedPlayers.push(players[order[i]]);
      }
      res.json({
        "players" : orderedPlayes,
        "percent" : doc.percentagesComplete[genre]
      });
      return;
    } else {
      // need to get the genre from soundcloud
      self.startGenre(response, doc, genre);
    }
  });
}





function error(response, errorObj) {
  response.json({
    "error" : true,
    "details" : errorObj
  });
}

exports.DbManager = DbManager;
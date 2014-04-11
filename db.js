var mongoose = require('mongoose');


function log(msg) {
  console.log(msg);
}

DbManager = function() {
  this.db = mongoose.connection;
  mongoose.connect('mongodb://localhost/soundbarrel');
  this.db.on('error', function () {
    throw new Error('unable to connect to database at mongodb://localhost/soundbarrel');
  });
  this.callback = function(response, doc) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write(JSON.stringify(doc));
    response.end();
  };
  
  this.User = mongoose.model('User', {
    // Facebook ID or ID from cookie if they didn't login
    fbId : String,
    // the name that we got from the Facebook login
    name : String,
    // the percent complete in sorting the songs
    percentageComplete : Number,
    // the ordered array of the songs, which are each entry is the
    // mongo id of the song object
    order : [mongoose.Schema.Types.ObjectId],
    // an object whose keys are the serialized mongo ids and the
    // values are the soundcloud JSON objects
    songs : mongoose.Schema.Types.Mixed
  });
}

// newList is a list of object ids that are in the order of the
// new list
DbManager.prototype.updateSongList = function(response, userId, newList) {
  User.findOne({"fbId" : userId}, function(err, doc) {
    if(err) {
      error(response, {
        "message" : "Error when updating user song list",
        "mongoError" : err
      });
      return;
    }
    doc.order = newList;
    doc.save(function(err, doc) {
      if(err) {
        error(response, {
          "message" : "Error when saving user song list",
          "mongoError" : err
        });
        return;
      }
      this.callback({
        "error" : false 
      });
    });
  });
}


function error(response, errorObj) {
  this.callback(response, {
    "error" : true,
    "details" : errorObj
  });
}

exports.DbManager = DbManager;
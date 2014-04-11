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
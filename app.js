var Client = require('node-rest-client').Client;

var config = require('./config');

// Dependencies
// ===========================================================
var express = require("express");
var bodyParser = require("body-parser");

// Configure the Express application
// ===========================================================
var app = express();
var PORT = config.PORT;

// Set up the Express application to handle data parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post("/testexecutor", function(req, res) {
  
    console.log("___ENTER POST EXECUTOR___" + JSON.stringify(req.body));
  
    res.send("OK");
});
  

app.post("/event", function(req, res) {

  console.log("___ENTER POST EVENT___" + JSON.stringify(req.body));

  var client = new Client();

  var args = { data: req.body, headers: { "Content-Type": "application/json" } };

  client.post(config.executorUrl, args, function (data, response) {
    console.log("EROROR");
  });

  res.send("OK");
});


// Listener
// ===========================================================
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
//modules
var path = require('path');
var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');

//routes
var ParseData = require('./routes/parseData.js');
var BikeSession = require('./routes/bikeSession.js');
var User = require('./routes/user.js');


//port configuration for heroku
var PORT = process.env.PORT || 3000;

//mongoURI config for mongolabs
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
mongoose.connect(mongoURI);

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

//User facing web app pages
app.get('/dashboard', function(req, res){
  res.sendFile(path.join(__dirname,'public','dashboard.html'));
});

//API routes
app.get('/userStats', ParseData.getUserStats);
app.get('/bikeSession', BikeSession.getSessions);
app.post('/bikeSession', BikeSession.postSession);

app.get('/user', User.getSessions);
app.post('/user', User.postSession);
app.put('/user', User.putSession);
app.patch('/user', User.patchSession);

app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});

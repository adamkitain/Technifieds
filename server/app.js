// dependencies
var express = require('express')
  , http = require('http')
  , mongoose = require('mongoose')
  , q = require('q')
  , controllers = require('./controllers/');

var app = express();

// all modes
app.configure(function(){
  app.set('env', 'dev-auth');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

// dev and dev-auth modes
app.configure('dev', 'dev-auth', function() {
    mongoose.set('debug', true);
    app.set('reqRoot', 'http://app-dev.rescour.com');
    app.set('port', process.env.PORT || 8000);
    app.set('requestRoot', 'http://app-dev.rescour.com');
    app.use(controllers.xDomain.allow);
    app.use(function(req, res, next) {
        console.log('recieved request: ', req.method, req.url);   
        console.log('body: ', req.body);

        next();
    });
    app.use(function(err, req, res, next) {
        console.log('error detected: ', req.method, req.url);
    });
    app.use(express.logger('dev'));
});

// dev mode
app.configure('dev', function() {
    console.log('running in dev mode');
    app.use(controllers.mockAuth.allow);
    app.use(app.router);
});

// dev-auth mode and prod
app.configure('dev-auth', 'prod', function() {
    app.use(controllers.auth.checkEach);
    app.use(app.router);
});

// prod mode
app.configure('prod', function() {
    app.set('reqRoot', 'https://app.rescour.com');
    app.set('port', process.env.PORT || 3000);
});

// connect to db
mongoose.connect('mongodb://localhost:27017/rescour_scraper');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('connected to database');
});

// configure controllers
controllers.crud.configure(app);
controllers.auth.configure(app);

// routes
app.post('/api/auth/login/', controllers.auth.login);
app.get('/api/auth/logout', controllers.auth.logout);
app.get('/api/auth/check', controllers.auth.checkPing);
app.get('/api/properties/', controllers.crud.read); 
app.post('/api/properties/', controllers.crud.create);
app.put('/api/properties/:id', controllers.crud.update);
app.delete('/api/properties/:id', controllers.crud.remove);
app.post('/api/deploy', controllers.crud.deploy);
app.post('/api/undeploy/:checksum', controllers.crud.undeploy);

//start server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

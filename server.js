#!/bin/env node
//OpenShift sample Node application

var express = require('express');
var fs      = require('fs');
var passport = require('passport')
var util = require('util')
var FacebookStrategy = require('passport-facebook').Strategy;
var request = require("request");
var Q = require("q");

//user

var photo = require("passport-photo");
var fb = require("passport-photo-facebook");

photo.use(fb.id());

//facebook var

var FACEBOOK_APP_ID = "335218589902190"
var FACEBOOK_APP_SECRET = "9932f0b0104f3b31e615f2ecdbca1f40";

//Database

var mongoose = require('mongoose');

var tocon = "mongodb://" + process.env.OPENSHIFT_NOSQL_DB_USERNAME + ":" + process.env.OPENSHIFT_NOSQL_DB_PASSWORD + "@" + process.env.OPENSHIFT_NOSQL_DB_HOST + ":" + process.env.OPENSHIFT_NOSQL_DB_PORT + "/" + process.env.OPENSHIFT_GEAR_NAME;

console.log(tocon);

var conn = mongoose.createConnection(tocon);

var markerSchema = new mongoose.Schema({
    className: { type: String },
    lat: { type: String },
    lng: { type: String },
    date:  { type: Number, default: Date.now() },
    ip: { type: String },
    op: { type: Number, default: 1.0 },
    owner: { type: String, default: 0 }
});

var MarkerModel = conn.model('markers', markerSchema);

//Database user

var userSchema = new mongoose.Schema({
  id: { type:String },
  username: { type:String },
  displayname: { type:String },
  profileUrl: { type: String },
  date: { type: Number, default: Date.now() }
});

var UserModel = conn.model('fc.users',userSchema);


//Cron
var cronJob = require('cron').CronJob;

var job = new cronJob({
  cronTime: '*/5 * * * *',
  onTick: function() {
    MarkerModel.find({}, function (err, docs) {
      if (err) { console.log("Error");}
      for (one in docs){
        docs[one].op = docs[one].op - 0.01;
        if (( Date.now() - docs[one].date ) > 7200000){
          docs[one].remove();
        }else{
           docs[one].save();
        }
      }
    });
  },
  start: true
}); 

//  Local cache for static content [fixed and loaded at startup]
var zcache = { 'index.html': ''};
//zcache['index.html'] = fs.readFileSync('./index.html'); //  Cache index.html



//functions

function expandUrl(shortUrl) {
    return Q.ncall(request, null, {
        method: "HEAD",
        url: shortUrl,
        followAllRedirects: true
    // If a callback receives more than one (non-error) argument
    // then the promised value is an array. We want element 0.
    }).get('0').get('request').get('href');
}

//example expandUrl(avatarURL).then(function (longUrl) {bla-bla-bla use longUrl});


function cache_(folder){
  var path = './' + folder
  var tmp = fs.readdirSync(path)

  for (d in tmp){
    if (!fs.statSync(path + '/'+ tmp[d]).isDirectory()){
      zcache[tmp[d]] = fs.readFileSync(path + '/'+ tmp[d]);
    }
    //console.log(tmp[d] + ' cached');
  }
}

function getClientIp(req) {
  var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // If request was not forwarded
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};


//cache

cache_('js');
cache_('img');
cache_('css');
cache_('css/images');
cache_('css/skeleton');
cache_('css/images/weather');

// Create "express" server.
var app  = express.createServer();

app.use(express.bodyParser());

//facebook login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  UserModel.findOne({id: id}, function (err, user) {
    done(err, user);
  });

  /*var user = users[id];
  done(null, user);*/
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://wm-aaa.rhcloud.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
       UserModel.findOne({id: profile.id}, function(err, user) {
        if(user) {
          done(null, user);
        } else {
          var user = new UserModel();
          user.id = profile.id;
          user.username = profile.username;
          user.displayname = profile.displayName;
          user.profileUrl = profile.profileUrl;
          user.save(function(err) {
            if(err) { throw err; }
            done(null, user);
          });
        }
      })
    });
  }
));

app.configure(function() {
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'qwerty lol test 123 $%^'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.set('views', __dirname + '/views');
  app.set("view options", {layout: false});
  app.register('html', require('ejs'));
});


app.get('/account', ensureAuthenticated, function(req, res){
  photo({facebookid:req.user.id}, function(err, avatarURL){
    if(!err){
        res.render('account.html', { user: req.user, ava: avatarURL });
    }else{
      res.render('account.html', { user: req.user, ava: null });
    }
  });
});

app.get('/login', function(req, res){
  res.render('login.html', { user: req.user });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


/*  =====================================================================  */
/*  Setup route handlers.  */
/*  =====================================================================  */

// Handler for GET /health
app.get('/health', function(req, res){
    res.send('1');
});

// Handle for GET images for Leaflet
app.get("/css/images/:filename", function(req, res){
    //console.log("GET file '" + req.params.filename +"'. Read from ." + req.url);
    res.send(zcache[req.params.filename],{'Content-Type': 'image/png'});
});

// Handle for GET images for micons
app.get("/css/images/weather/:filename", function(req, res){
    //console.log("GET file '" + req.params.filename +"'. Read from ." + req.url);
    res.send(zcache[req.params.filename],{'Content-Type': 'image/png'});
});


// Handle for GET css
app.get("/css/:filename", function(req, res){
    //console.log("GET file '" + req.params.filename +"'. Read from ." + req.url);
    res.send(zcache[req.params.filename],{'Content-Type': 'text/css'});
});

// Handle for GET css/skeleton
app.get("/css/skeleton/:filename", function(req, res){
    //console.log("GET file '" + req.params.filename +"'. Read from ." + req.url);
    res.send(zcache[req.params.filename],{'Content-Type': 'text/css'});
});

// Handle for GET js
app.get("/js/:filename", function(req, res){
    //console.log("GET file '" + req.params.filename +"'. Read from ." + req.url);
    res.send(zcache[req.params.filename],{'Content-Type': 'text/javascript'});
});

// Handle for GET img
app.get("/img/:filename.:format", function(req, res){
    //console.log("GET file '" + req.params.filename + "." + req.params.format +"'. Read from ." + req.url);
    res.send(zcache[req.params.filename + '.' + req.params.format],{'Content-Type': req.params.format == 'png' ? 'image/png' : (req.params.format == 'gif' ? 'image/gif' : (req.params.format == 'jpeg' ? 'image/jpeg' : false) ) });
});


// Handler for GET /
app.get('/', function(req, res){
    var now = new Date();
    console.log(now.toTimeString() + ": GET '/' from " + getClientIp(req))
    if (req.isAuthenticated()) {
      photo({facebookid:req.user.id}, function(err, avatarURL){
        res.render('index.html', { auth: true, ava: avatarURL, name: req.user.name});
      });
    }
    else{
      res.render('index.html', { auth: false, ava: null, name:null});
    }
    
});

//Handler for POST /new_marker
app.post('/new_marker', function(req, res){

  var m = new MarkerModel;

  if (req.isAuthenticated()) {
    m.owner = req.user.id;
  }

  m.className = req.body.className;
  m.lat = req.body.lat;
  m.lng = req.body.lng;
  m.ip = getClientIp(req);

  m.save();

  res.send(JSON.stringify(m));
    
});

//Handler for POST /all_marker
app.post('/all_marker', function(req, res){
  MarkerModel.find({}, function (err, docs) {
    if (err) { console.log("Error");}
    res.send(JSON.stringify(docs));
  });    
});

//Handler for POST /id
app.post('/id', function(req, res){
  var s = {"id": 0};
  if (req.isAuthenticated()) {
    s = {"id": req.user.id}
    res.send(JSON.stringify(s));
  }else{
    res.send(JSON.stringify(s));
  }
});


//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP;
var port    = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

//  And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});
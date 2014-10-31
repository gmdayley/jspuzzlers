var express   = require('express');
var fs        = require('fs');
var io        = require('socket.io');
var _         = require('underscore');
var Mustache  = require('mustache');

var app       = express.createServer();
var staticDir = express.static;

io            = io.listen(app);

var opts = {
  port :      1948,
  baseDir :   __dirname + '/../../'
};


io.sockets.on('connection', function(socket) {
  console.log('incoming connection');

  socket.on('openpoll', function(polldata) {
    console.log('Open Poll');
    socket.broadcast.emit('openpolldata', polldata);
  });

  socket.on('vote', function(vote) {
    socket.broadcast.emit('vote', vote);
  });

//  socket.on('fragmentchanged', function(fragmentData) {
//    socket.broadcast.emit('fragmentdata', fragmentData);
//  });



});

app.configure(function() {
  [ 'css', 'js', 'img', 'plugin', 'lib' ].forEach(function(dir) {
    app.use('/' + dir, staticDir(opts.baseDir + dir));
  });
});

app.get("/", function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.createReadStream(opts.baseDir + '/index.html').pipe(res);
});


app.get("/vote/:socketId", function(req, res) {

  fs.readFile(opts.baseDir + 'plugin/vote-server/vote.html', function(err, data) {
    res.send(Mustache.to_html(data.toString(), {
      socketId : req.params.socketId
    }));
  });

});

// Actually listen
app.listen(opts.port || null);

var brown = '\033[33m',
  green = '\033[32m',
  reset = '\033[0m';

var slidesLocation = "http://localhost" + ( opts.port ? ( ':' + opts.port ) : '' );

console.log( brown + "reveal.js - Voter" + reset );
console.log( "1. Open the slides at " + green + slidesLocation + reset );
console.log( "2. Click on the link your JS console to go to the notes page" );
console.log( "3. Advance through your slides and your notes will advance automatically" );

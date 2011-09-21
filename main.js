var io = require('socket.io'),
	express = require('express');

var app = express.createServer(), 
	io = io.listen(app);

app.listen(3000);

io.sockets.on('connection', function (socket) {
	socket.emit('ack', { message: 'You are connected.' });
	socket.on('vote', function (data) {
    	console.log(data);
		socket.emit('ack', { message: 'Thank-you for your vote.' });
  	});
});
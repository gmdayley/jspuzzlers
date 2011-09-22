var io = require('socket.io'),
	express = require('express');

var app = express.createServer(), 
	io = io.listen(app);

app.listen(3000);

io.sockets.on('connection', function (socket) {
//    console.log(socket);
    var clientId = socket.id;

	socket.emit('ack', { message: 'You are connected.' });
//    socket.emit('setenabled', true);

	socket.on('vote', function (data) {
        console.log(data);
		socket.broadcast.emit('vote', data, clientId);
//		socket.emit('ack', { message: 'Thank-you for your vote.' });
        socket.emit('setenabled', false);
  	});

    socket.on('openpoll', function(open){
        socket.broadcast.emit('setenabled', open);
    });

    socket.on('right', function(client){
//        io.sockets.sockets[client].send('right');
        io.sockets.sockets[client].emit('right', {});
    });

    socket.on('wrong', function(client){
        io.sockets.sockets[client].send('wrong', {});
    });
});
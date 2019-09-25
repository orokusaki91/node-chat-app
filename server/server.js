var path = require('path');
var http = require('http');
var express = require('express');
var socketIO = require('socket.io');

var {generateMessage, generateLocationMessage} = require('./utils/message');
var {validation} = require('./utils/validation');

var publicPath = path.join(__dirname, '../public');
var port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket) => {
	console.log('New user connected');

	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			callback('Name and room are required.');
		}

		socket.join(params.room);

		socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined te room`));

		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		io.emit('newMessage', generateMessage(message.from, message.text));
		callback();
	});

	socket.on('sendLocation', (coords) => {
		io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
	});

	socket.on('disconnect', () => {
		console.log('User was disconnected');
	});
});

app.use(express.static(publicPath));

server.listen(port, () => {
	console.log('Server is up on port', port);
})


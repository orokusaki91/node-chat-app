var socket = io();

function scrollToBottom() {
	var messages = $('#messages');
	var newMessage = messages.children('li:last-child');

	var clientHeight = messages.prop('clientHeight');
	var scrollTop = messages.prop('scrollTop');
	var scrollHeight = messages.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight();

	if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight>= scrollHeight) {
		messages.scrollTop(scrollHeight);
	}
}

socket.on('connect', function () {
	var params = $.deparam(window.location.search);

	socket.emit('join', params, function (err) {
		if (err) {
			alert(err);
			window.location.href = '/';
		} else {
			console.log('No error');
		}
	});
});

socket.on('disconnect', function () {
	console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
	var formattedTime = moment(message.createdAt).format('HH:mm');
	var template = $('#message-template').html();
	var html = Mustache.render(template, {
		from: message.from,
		text: message.text,
		createdAt: formattedTime
	});

	$('#messages').append(html);

	scrollToBottom();
})

socket.on('newLocationMessage', function (message) {
	var formattedTime = moment(message.createdAt).format('HH:mm');
	var template = $('#location-message-template').html();
	var html = Mustache.render(template, {
		from: message.from,
		url: message.url,
		createdAt: formattedTime
	});

	$('#messages').append(html);

	scrollToBottom();	
})

// send message
$('#message-form').submit(function (e) {
	e.preventDefault();

	var messageInput = $('[name="message"]');

	socket.emit('sendMessage', {
		from: 'User',
		text: messageInput.val()
	}, function () {
		messageInput.val('');
	});
});

// send location
var locationButton = $('#send-location');

locationButton.click(function () {
	var that = $(this);

	if (!navigator.geolocation) {
		return alert('Geolocation not supported by your browser.');
	}

	that.prop('disabled', true).text('Sending Location...');

	navigator.geolocation.getCurrentPosition(function (position) {
		that.prop('disabled', false).text('Send Location');

		socket.emit('sendLocation', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		});
	}, function () {
		that.prop('disabled', false).text('Send Location');
		alert('Location is not turned on. Please allow it to continue.');
	});
});
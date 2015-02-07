
var user

var ractive = new Ractive({
	el: '#chatEntries',
	template: '#message-template',
	data: { 
		messages: []
	}
})

// Socket.io
var socket = io.connect();

socket.on('connect', function() {
    console.log('connected')
})

socket.on('nbUsers', function(count) {
    $('#nbUsers').html(count)
})

socket.on('all-messages', function(messages) {
	console.log('Received message update: ' + messages.length)
    messages.forEach(function(msg) {
        if (msg.pseudo == user) {
        	msg.self = true
        }
    })
    ractive.set("messages", messages)
    scrollToBottom()
})

socket.on('pseudoStatus', function(data){
    if (data.error) {
        console.log('server error getting username')
    }
    else {
        user = data.pseudo;
        $('#userName').html(user)
        console.log('Received user name ' + user)
    }
})

function addMessage(msg) {
	var messages = ractive.get('messages')
    messages.push({
        number: messages.length + 1,
        date: new Date().toISOString(),
        pseudo: user,
        message: msg,
        self: true
    })
	socket.emit('message', msg)
 
    scrollToBottom()
}

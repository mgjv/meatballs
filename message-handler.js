
var user

var ractive = new Ractive({
	el: '#chatEntries',
	template: '#message-template',
	data: { 
		messages: []
	}
})

ractive.on ('vote', function(event, messageNum) {
	// console.log("Received a vote for message " + messageNum)
	var index = messageNum - 1
	ractive.get('messages')[index].votes++
	ractive.update('messages')
	socket.emit('vote', messageNum)
})

// Socket.io
var socket = io.connect();

socket.on('connect', function() {
    // console.log('connected to chat server')
    // request a user name
    // Todo: There's a slight race condition when reloading the page. 
    // Cleanup server side is slower than reconnection, with the result 
    // that the server believes that the name is already taken.
    // How to fix...
    // This is probably only a real problem on localhost tests
    var oldPseudo = $.cookie('pseudo')
    if (oldPseudo) {
    	socket.emit('wantPseudo', oldPseudo)
    }
})

socket.on('nbUsers', function(count) {
    $('#nbUsers').html(count)
})

socket.on('all-messages', function(messages) {
	// console.log('Received message update: ' + messages.length)
    messages.forEach(fixMessageOwner)
    ractive.set("messages", messages)
    scrollToBottom()
})

socket.on('pseudoStatus', function(data){
    if (data.pseudo) {
        // console.log('Received user name ' + data.pseudo)
        user = data.pseudo;
        $('#userName').html(user)
        if (!$.cookie('pseudo')) {
    	    $.cookie('pseudo', user);
    	}
        ractive.get('messages').forEach(fixMessageOwner)
        ractive.update('messages')
    }
    else {
        console.log('server error getting username')
    }
})

function fixMessageOwner(msg) {
    if (msg.pseudo == user) {
    	msg.self = true
    }
}

function addMessage(msg) {
	var messages = ractive.get('messages')
    messages.push({
        number: messages.length + 1,
        date: new Date().toISOString(),
        pseudo: user,
        message: msg,
        votes: 0,
        self: true
    })
	socket.emit('message', msg)
 
    scrollToBottom(true)
}

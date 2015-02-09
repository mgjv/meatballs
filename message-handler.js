
var pseudo

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

// On connection, the server will assign a pseudonym, or user name.
// If we already have a cookie, we will request that name. We will 
// try this three times, before giving up and accepting the name given 
// to us.
// TODO: this is more complex than it should be
var pseudoTries = 3
socket.on('pseudoStatus', function(data){

    var oldPseudo = $.cookie('pseudo')

    if (data.pseudo) {
        console.log('Received pseudo name ' + data.pseudo)
        pseudo = data.pseudo;
        $('#userName').html(pseudo)
        ractive.get('messages').forEach(fixMessageOwner)
        ractive.update('messages')

        if (!oldPseudo) {
            $.cookie('pseudo', pseudo)
        }
        else if (pseudo != oldPseudo) {
            // This can only happen the first time around
            console.log("Retry user name, got " + pseudo + ", want " + oldPseudo + ", try " + pseudoTries)
            // We didn't get the name we want to have, let's ask for it again.
            socket.emit('wantPseudo', oldPseudo)
        }
    }
    else {
        console.log('server error getting pseudo')
        if (pseudoTries-- > 0) {
            console.log("Retry user name, have " + pseudo + ", want " + oldPseudo + ", try " + pseudoTries)
            // We didn't get the name we want to have, let's ask for it again.
            socket.emit('wantPseudo', oldPseudo)         
        }
    }
})

function fixMessageOwner(msg) {
    if (msg.pseudo == pseudo) {
    	msg.self = true
    }
}

function addMessage(msg) {
	var messages = ractive.get('messages')
    messages.push({
        number: messages.length + 1,
        date: new Date().toISOString(),
        pseudo: pseudo,
        message: msg,
        votes: 0,
        self: true
    })
	socket.emit('message', msg)
 
    scrollToBottom(true)
}

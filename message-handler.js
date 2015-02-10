
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

socket.on('user-num', function(count) {
    $('#user-num').html(count)
})

// This is an in-place message update, because of votes, for example
socket.on('update-message', function(message) {
    // console.log("received update for message " + message.number)
    ractive.get('messages')[message.number - 1] = fixMessageOwner(message)
    ractive.update('messages')
})

// This ia always someone else's message being added to our queue
socket.on('append-message', function(message) {
    // console.log("Received message " + message.number)
    ractive.get('messages').push(message)
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
socket.on('pseudo-status', function(data){

    var oldPseudo = $.cookie('pseudo')

    if (data.pseudo) {
        //console.log('Received pseudo name ' + data.pseudo)
        pseudo = data.pseudo;
        $('#userName').html(pseudo)
        ractive.get('messages').forEach(fixMessageOwner)
        ractive.update('messages')

        if (!oldPseudo) {
            $.cookie('pseudo', pseudo)
        }
        else if (pseudo != oldPseudo) {
            // This can only happen the first time around
            socket.emit('request-pseudo', oldPseudo)
        }
    }
    else {
        console.log('server error getting pseudo')
        if (oldPseudo && pseudoTries-- > 0) {
            // We didn't get the name we want to have, let's ask for it again.
            socket.emit('request-pseudo', oldPseudo)         
        }
    }
})

function fixMessageOwner(msg) {
    if (msg.pseudo == pseudo) {
    	msg.self = true
    }
    return msg;
}

function addMessage(msg) {
	var messages = ractive.get('messages')
    messages.push({
        number: messages.length + 1, // This may be overridden by the server
        date: new Date().toISOString(),
        pseudo: pseudo,
        message: msg,
        votes: 0,
        self: self
    })
	socket.emit('message', msg)
 
    scrollToBottom(true)
}

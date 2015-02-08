// Customization
var defaultPort = 8080;

// Libraries
var express = require('express'), 
    app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var jade = require('jade');
var pseudoArray = ['admin']; //block the admin username (you can disable it)

// Views Options
app.set('view engine', 'jade');
app.set("view options", { layout: false })

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || defaultPort);

io.set('log level', 1);
server.listen(app.get('port'), function () {
    console.log("Server listening on port %d", app.get('port'));
});

// Render and send the main page
app.get('/', function(req, res){
    res.render('home.jade');
});

// Handle the socket.io connections

var users = 0;          // count the users
var userno = 0;         // for generating usernames
var messages = [];      // holds all messages
var messageVoters = []; // keep track of who voted. This is outside of messages, to avoid overhead when comminucating with clients

io.sockets.on('connection', function (socket) { // First connection
    users += 1;
    userno += 1;
    sendUserCount();

    // Test that socket can send message to itself
    socket.on('echo', function(msg) {
        socket.emit('echo', msg);
    });

    // Automatically assign a name to the user
    assignPseudo(socket, 'User #' + userno);
    console.log("user " + socket.pseudo + " connected");

    // Send the current set of messages to the client
    sendMessages(socket)

    // Allow client to request a user name
    socket.on('wantPseudo', function(newPseudo) {
        assignPseudo(socket, newPseudo);
    });

    // Receive a message and update all clients
    socket.on('message', function (data) {
        var name = socket.pseudo;
        if (name) {
            var message = {
                number: messages.length + 1,
                date: new Date().toISOString(), 
                pseudo: name, 
                message: data, 
                votes: 0
            };
            messages.push(message);
            messageVoters.push([]);
            sendMessages();
            console.log("user " + message['pseudo'] + " said \"" + data + "\"");
        }
    });

    socket.on('vote', function(messageNum) {
        var index = messageNum - 1;
        if (messageVoters[index].indexOf(socket.pseudo) == -1) {
            console.log("user " + socket.pseudo + " voted on " + messageNum);
            messages[index].votes++;
            messageVoters[index].push(socket.pseudo);
            sendMessages();
        }
        else {
            console.log("user " + socket.pseudo + " tried to vote again on message " + messageNum); 
            sendMessages(socket);
        }
    });

    socket.on('disconnect', function () {
        users -= 1;
        sendUserCount();
        var pseudo = socket.pseudo;
        if (pseudo) {
            var index = pseudoArray.indexOf(pseudo);
            pseudoArray.splice(index, 1);
            console.log("user " + pseudo + " disconnected");
        }
    });
});

// Assign a pseudo name, and inform the client
function assignPseudo(socket, pseudo) {
     // Test if the name is already taken
    if (pseudoArray.indexOf(pseudo) == -1) {
        if (socket.pseudo) {
            console.log("user " + socket.pseudo + " renamed to " + pseudo)
        } 
        socket.pseudo = pseudo;
        pseudoArray.push(pseudo);
        socket.emit('pseudoStatus', {'status': 'ok', 'pseudo': pseudo});
    } 
    else {
        console.log("user name " + pseudo + " is already taken");
        socket.emit('pseudoStatus', {'status': 'error'}) // Send the error
    }   
}

// TODO This needs to be more efficient
// Also requires client side changes
function sendMessages(socket) {
    if (socket) {
        socket.emit('all-messages', messages);
    } 
    else {
        io.emit('all-messages', messages);
    }
}

// Send the count of the users to all clients
function sendUserCount() {
    io.emit('nbUsers', users);
}

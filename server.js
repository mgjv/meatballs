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

var users = 0; //count the users
var userno = 0; //for generating usernames
var msgcount = 0; //count of all messages
var messages = [];

io.sockets.on('connection', function (socket) { // First connection
    users += 1;
    userno += 1;
    reloadUserCount();

    // Test that socket can send message to itself
    socket.on('echo', function(msg) {
        socket.emit('echo', msg);
    });

    // Automatically assign a name to the user
    assignPseudo(socket, 'User #' + userno);
    console.log("user " + socket.pseudo + " connected");

    // Send the current set of messages to the client
    socket.emit('all-messages', messages);

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
                msgcount: ++msgcount
            };
            messages.push(message);
            io.emit('all-messages', messages);
            console.log("user " + message['pseudo'] + " said \"" + data + "\"");
        }
    });

    socket.on('disconnect', function () {
        users -= 1;
        reloadUserCount();
        var pseudo = socket.pseudo;
        if (pseudo) {
            var index = pseudoArray.indexOf(pseudo);
            pseudoArray.splice(index, 1);
            //pseudoArray = pseudoArray.slice(index, index + 1);
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

// Send the count of the users to all clients
function reloadUserCount() {
    io.emit('nbUsers', users);
}

//exports.server = server;
//exports.app = app;

// Customization
var defaultPort = 8080;

// Libraries
var express = require('express'), app = express();
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

io.sockets.on('connection', function (socket) { // First connection
    users += 1;
    reloadUsers(); // Send the count to all the users

    // Test that socket can send message to itself
    socket.on('echo', function(msg) {
        socket.emit('echo', msg);
    });

    // Broadcast message to all
    socket.on('message', function (data) {
        var name = returnPseudo(socket);
        if (name) {
            var transmit = {date : new Date().toISOString(), pseudo : name, message : data};
            socket.broadcast.emit('message', transmit);
            console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");
        }
    });

    socket.on('setPseudo', function (data) { // Assign a name to the user
        if (pseudoArray.indexOf(data) == -1) { // Test if the name is already taken
            socket.pseudo = data;
            pseudoArray.push(data);
            socket.emit('pseudoStatus', 'ok');
            console.log("user " + data + " connected");
        } else {
            socket.emit('pseudoStatus', 'error') // Send the error
        }
    });

    socket.on('disconnect', function () { // Disconnection of the client
        users -= 1;
        reloadUsers();
        var pseudo = returnPseudo(socket);
        if (pseudo) {
            var index = pseudoArray.indexOf(pseudo);
            pseudoArray = pseudoArray.slice(index, index+1);
            console.log("user " + pseudo + " disconnected");
        }
    });
});

function reloadUsers() { // Send the count of the users to all
    if (users == 1) {
        io.sockets.emit('nbUsers', {"nb": "is " + users, count: users});
    } else {
        io.sockets.emit('nbUsers', {"nb": "are " + users, count: users});
    }
}
function returnPseudo(socket) { // Return the name of the user
    return socket.pseudo;
}
exports.server = server;
exports.app = app;

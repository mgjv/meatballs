/* jshint node:true */

// Customization
var defaultPort = 8080;

// Libraries
var express = require("express"), 
    app = express();
var http = require("http");
var server = http.createServer(app);
var io = require("socket.io").listen(server);

var fs = require("fs")
var fileName = "server.json"

//var jade = require("jade");
var pseudoArray = ["admin"]; //block the admin username (you can disable it)

// Views Options
app.set("view engine", "jade");
app.set("view options", { layout: false });

app.use(express.static(__dirname + "/public"));

app.set("port", process.env.PORT || defaultPort);

server.listen(app.get("port"), function () {
    console.log("Server listening on port %d", app.get("port"));
});

// Render and send the main page
app.get("/", function(req, res){
    res.render("home.jade");
});

// Handle the socket.io connections

var users = 0;          // count the users
var userno = 0;         // for generating usernames
var messages = [];      // holds all messages
var messageVoters = []; // keep track of who voted. This is outside of messages, to avoid overhead when comminucating with clients

readData()

io.sockets.on("connection", function (socket) { // First connection
    users += 1;
    userno += 1;
    sendUserCount();

    // Test that socket can send message to itself
    socket.on("echo", function(msg) {
        socket.emit("echo", msg);
    });

    // Automatically assign a name to the user
    assignPseudo(socket, "User #" + userno);
    console.log("connect: " + socket.pseudo + " (" + users + ")");

    // Send the current set of messages to the client
    socket.emit("all-messages", messages);

    // Allow client to request a user name
    socket.on("request-pseudo", function(newPseudo) {
        assignPseudo(socket, newPseudo);
    });

    // Receive a message and update all clients
    socket.on("message", function (data) {
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

            // Send message to everyone else, and send a full update back to originator, 
            // to ensure that any race conditions that they potentially ran into are resolved
            socket.broadcast.emit("append-message", message);
            socket.emit("all-messages", messages);

            console.log("message: " + socket.pseudo + " said \"" + data + "\"");
            saveData();
        }
    });

    socket.on("vote", function(messageNum) {
        var index = messageNum - 1;
        if (messageVoters[index].indexOf(socket.pseudo) == -1) {
            console.log("vote: " + socket.pseudo + " for message " + messageNum);
            messages[index].votes++;
            messageVoters[index].push(socket.pseudo);
            updateMessage(messages[index]);
            saveData();
        }
        else {
            console.log("user " + socket.pseudo + " tried to vote again on message " + messageNum); 
            socket.emit("all-messages", messages);
        }
    });

    socket.on("disconnect", function () {
        users -= 1;
        sendUserCount();
        var pseudo = socket.pseudo;
        if (pseudo) {
            var index = pseudoArray.indexOf(pseudo);
            pseudoArray.splice(index, 1);
            console.log("disconnect: " + pseudo + " (" + users + ")");
        }
    });
});

// Assign a pseudo name, and inform the client
function assignPseudo(socket, pseudo) {
     // Test if the name is already taken
    if (pseudoArray.indexOf(pseudo) == -1) {
        if (socket.pseudo) {
            console.log("rename: " + socket.pseudo + " to " + pseudo);
        } 
        socket.pseudo = pseudo;
        pseudoArray.push(pseudo);
        socket.emit("pseudo-status", {"status": "ok", "pseudo": pseudo});
    } 
    else {
        console.log("rename refused:" + socket.pseudo + " to " + pseudo);
        socket.emit("pseudo-status", {"status": "error"}); // Send the error
    }   
}

// Used to update a message in place on all clients
function updateMessage(message) {
    // console.log("update message: " + message.number)
    io.emit("update-message", message);
}

// Send the count of the users to all clients
function sendUserCount() {
    io.emit("user-num", users);
}

// Simplistic Persistence
// This probably needs more sophistication and/or robustness
function saveData() {
    var data = JSON.stringify({
        messages: messages,
        voters: messageVoters
    });
    fs.writeFile(fileName, data, function(err) {
        if (err) {
            console.log("save: Error trying to persist")
        }
        console.log("save: done")
    })
}

function readData() {
    try {
        var data = JSON.parse(fs.readFileSync(fileName))
        console.log("read: got data")
        messages = data.messages
        messageVoters = data.voters
    }
    catch (e) {
        console.log("read: Nothing there")
        messages = []
    }
}

// This is here for the mocha tests
exports.server = server;
exports.app = app;
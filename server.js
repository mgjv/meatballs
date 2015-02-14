/* jshint node:true */

// Customization
var defaultPort = 8080

// Libraries
var express = require("express"), 
    app = express()
var http = require("http")
var server = http.createServer(app)
var io = require("socket.io").listen(server)

var DB = require("./message-db").DBfs

// Set log transports globally in application
// TODO: work on making this better. Maybe use a Container?
var logger = require("winston")
logger.remove(logger.transports.Console)
logger.add(logger.transports.File, { filename: "message-server.log" })

// The database with our messages
var pseudos = ["admin"] // block the admin username

// Configure the application
app.set("view engine", "jade")
app.set("view options", { layout: false })
app.use(express.static(__dirname + "/public"))
app.set("port", process.env.PORT || defaultPort)

server.listen(app.get("port"), function () {
    logger.info("Server listening on port %d", app.get("port"))
})

// Render and send the main page
app.get("/", function(req, res){
    res.render("home.jade")
})

// Handle the socket.io connections

var users = 0          // count the users
var userno = 0         // for generating usernames

// This should not be hardcoded. Makes testing hard
var db = new DB()

io.sockets.on("connection", function (socket) { // First connection
    users += 1
    userno += 1
    io.emit("user-num", users)

    // Test that socket can send message to itself
    socket.on("echo", function(msg) {
        socket.emit("echo", msg)
    })

    // Automatically assign a name to the user
    assignPseudo(socket, "User #" + userno)
    logger.info("connect: %s (%s)", socket.pseudo, users)

    // Send the current set of messages to the client
    socket.emit("all-messages", db.getMessages())

    // Allow client to request a user name
    socket.on("request-pseudo", function(newPseudo) {
        assignPseudo(socket, newPseudo)
    })

    // Receive a message and update all clients
    socket.on("message", function (data) {
        var message = db.addMessage(socket.pseudo, data)

        // Send message to everyone else, and send a full update back to originator, 
        // to ensure that any race conditions that they potentially ran into are resolved
        socket.broadcast.emit("append-message", message);
        socket.emit("all-messages", db.getMessages());

        logger.info("message: %s said '%s'", socket.pseudo, data);
    })

    socket.on("vote", function(messageNum) {
        db.vote(socket.pseudo, messageNum, function (success, msg) {
            if (success) {
                logger.info("vote: %s for message %d", socket.pseudo, messageNum)
                // send everyone else an updated version of the message
                socket.broadcast.emit("update-message", msg)
            }
            else {
                logger.info("vote: %s tried to vote again for", socket.pseudo, messageNum)
                // send the voter a corrected version of the message
                socket.emit("update-message", msg)
            }
        })
    })

    socket.on("disconnect", function () {
        users -= 1
        io.emit("user-num", users)

        var pseudo = socket.pseudo
        if (pseudo) {
            var index = pseudos.indexOf(pseudo)
            pseudos.splice(index, 1)
            logger.info("disconnect:", pseudo, "(" + users + ")")
        }
    })
})

// Assign a pseudo name, and inform the client
function assignPseudo(socket, pseudo) {
     // Test if the name is already taken
    if (pseudos.indexOf(pseudo) == -1) {
        if (socket.pseudo) {
            logger.info("rename:", socket.pseudo, "to", pseudo)
        } 
        socket.pseudo = pseudo
        pseudos.push(pseudo)
        socket.emit("pseudo-status", {"status": "ok", "pseudo": pseudo})
    } 
    else {
        logger.info("rename refused:", socket.pseudo, "to", pseudo)
        socket.emit("pseudo-status", {"status": "error"}) // Send the error
    }   
}

// This is here for the mocha tests
exports.server = server
exports.app = app
/* jshint jquery: true, browser: true, asi: true */
/* global Ractive: false, io: false */

var messageContainer, 
    submitButton;

// Init
$(function() {
    messageContainer = $("#messageInput");
    submitButton = $("#submit");

    // Schedule time formatter
    window.setInterval(formatTime, 1000);

    // Calculate size of chat entry window (removing top and bottom bars)
    resizeList()
    $(window).resize(resizeList);

    // Deal with the input stuff at the bottom of the screen
    bindButton();
    submitButton.click(function() {
        sendMessage()
    })

    $("input").bind("keydown", function(event) {
        // track enter key
        var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
        if (keycode == 13) { // keycode for enter key
            // force the "Enter Key" to implicitly click the Send button
            document.getElementById("submit").click();
            return false;
        } else  {
            return true;
        }
    }); // end of function

    messageContainer.focus();
});

// Help functions
function sendMessage() {
    if (messageContainer.val() !== "") {
        addMessage(messageContainer.val())
        messageContainer.val("")
        submitButton.button("loading")
    }
}

// Calculate bew height for the chatEntries div
function resizeList() {
    $("#chatEntries").height(
        $(window).height() - $(".navbar-fixed-top").height() - $("#entries").height()
    )
}

// Scroll to the bottom of the page
// On responsive font size, this can still break
function scrollToBottom(force) {
    var wst = $(window).scrollTop(),
        wh  = $(window).height(),
        dh = $(document).height()

    // if the user is close to the bottom, scroll ahead
    // console.log("dh - wst - wh = ", dh, " - ", wst, " - ", wh, " = ", dh - wst - wh)
    if (force || dh - wst - wh < 100) {
        var body = $("body")[0]
        body.scrollTop = body.scrollHeight
    }
}
   
function bindButton() {
    submitButton.button("loading");
    messageContainer.on("input", function() {
        if (messageContainer.val() === "") {
            submitButton.button("loading")
        }
        else {
            submitButton.button("reset")
        }
    })
}

// function to format the date in the "time" elements. 
// Scheduled on an interval
function formatTime(context) {
    $("time", context).each(function() {
        $(this).text($.timeago($(this).attr("title")))
    })
}

// From here it"s data model maintenance and ractive
var pseudo

var ractive = new Ractive({
    el: "#chatEntries",
    template: "#message-template",
    data: { 
        messages: []
    }
})

ractive.on ("vote", function(event, messageNum) {
    // console.log("Received a vote for message " + messageNum)
    var index = messageNum - 1
    ractive.get("messages")[index].votes++
    ractive.update("messages")
    socket.emit("vote", messageNum)
})

// Socket.io
var socket = io.connect()

socket.on("connect", function() {
    // console.log("connected to chat server")
 })

socket.on("user-num", function(count) {
    $("#user-num").html(count)
})

// An in-place message update, because of votes, for example
socket.on("update-message", function(message) {
    // console.log("received update for message " + message.number)
    ractive.get("messages")[message.number - 1] = fixMessageOwner(message)
    ractive.update("messages")
})

// Someone else"s message coming in
socket.on("append-message", function(message) {
    // console.log("Received message " + message.number)
    ractive.get("messages").push(message)
    scrollToBottom()
})

socket.on("all-messages", function(messages) {
    // console.log("Received message update: " + messages.length)
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
socket.on("pseudo-status", function(data){

    var oldPseudo = $.cookie("pseudo")

    if (data.pseudo) {
        //console.log("Received pseudo name " + data.pseudo)
        pseudo = data.pseudo;
        $("#userName").html(pseudo)
        ractive.get("messages").forEach(fixMessageOwner)
        ractive.update("messages")

        if (!oldPseudo) {
            $.cookie("pseudo", pseudo)
        }
        else if (pseudo != oldPseudo) {
            // This can only happen the first time around
            socket.emit("request-pseudo", oldPseudo)
        }
    }
    else {
        // console.log("server error getting pseudo")
        if (oldPseudo && pseudoTries-- > 0) {
            // We didn"t get the name we want to have, let"s ask for it again.
            socket.emit("request-pseudo", oldPseudo)         
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
    var messages = ractive.get("messages")
    messages.push({
        number: messages.length + 1, // This may be overridden by the server
        date: new Date().toISOString(),
        pseudo: pseudo,
        message: msg,
        votes: 0,
        self: true
    })
    socket.emit("message", msg)
 
    scrollToBottom(true)
}


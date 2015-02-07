var messageContainer, submitButton;
var pseudo = "";
var msgcount = 0; // TODO: replace with messages.length

// See addMessage for format
var messages = [];


// Help functions
function sendMessage() {
    if (messageContainer.val() != "") 
    {
        socket.emit('message', messageContainer.val());
        addMessage(messageContainer.val(), "Me", new Date().toISOString(), true, msgcount+1);
        messageContainer.val('');
        submitButton.button('loading');
    }
}

// Init
$(function() {
    messageContainer = $('#messageInput');
    submitButton = $("#submit");
    bindButton();
    window.setInterval(time, 1000*10);

    // Calculate size of chat entry window (removing top and bottom bars)
    $("#chatEntries").height($(window).height() - 80);

    submitButton.click(function() {sendMessage();});

    $("input").bind("keydown", function(event) {
        // track enter key
        var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
        if (keycode == 13) { // keycode for enter key
            // force the 'Enter Key' to implicitly click the Send button
            document.getElementById('submit').click();
            return false;
        } else  {
            return true;
        }
    }); // end of function

    messageContainer.focus();
});

// Socket.io
var socket = io.connect();
socket.on('connect', function() {
    console.log('connected');
});
socket.on('nbUsers', function(msg) {
    $("#nbUsers").html(msg.count);
});
socket.on('message', function(data) {
    addMessage(data['message'], data['pseudo'], data['date'], false, data['msgcount']);
    console.log(data);
});
socket.on('pseudoStatus', function(data){
    if (data.error) {
        console.log('server error getting username');
    }
    else {
        pseudo = data.pseudo;
    }
});

// Scroll to the bottom of the page
function scrollToBottom() {
    var body = $("body")[0];
    body.scrollTop = body.scrollHeight;
}

function addMessage(msg, pseudo, date, self, count) {
    msgcount = count;

    messages.push({
        text: msg,
        pseudo: pseudo,
        date: date,
        self: self,
        number: messages.length + 1
    });

    scrollToBottom();
}

function bindButton() {
    submitButton.button('loading');
    messageContainer.on('input', function() {
        if (messageContainer.val() == "") {
            submitButton.button('loading');
        }
        else {
            submitButton.button('reset');
        }
    });
}

function time(context) {
    $("time", context).each(function(){
        $(this).text($.timeago($(this).attr('title')));
    });
}



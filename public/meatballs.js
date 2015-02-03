var messageContainer, submitButton;
var pseudo = "";

// document.ontouchmove = function(event){
//     event.preventDefault();
// }

//Help functions
function sendMessage() {
    if (messageContainer.val() != "") 
    {
        socket.emit('message', messageContainer.val());
        addMessage(messageContainer.val(), "Me", new Date().toISOString(), true);
        messageContainer.val('');
        submitButton.button('loading');
        messageContainer.focus();
    }
}

// Init
$(function() {
    messageContainer = $('#messageInput');
    submitButton = $("#submit");
    bindButton();
    window.setInterval(time, 1000*10);

    // Calculate size of chat entry window (removing top and bottom bars)
    var chatEntriesHeight = $(window).height() - 80;

    submitButton.click(function() {sendMessage();});
    $("#chatEntries").slimScroll({height: chatEntriesHeight});
    setHeight(chatEntriesHeight);

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

//Socket.io
var socket = io.connect();
socket.on('connect', function() {
    console.log('connected');
});
socket.on('nbUsers', function(msg) {
    $("#nbUsers").html(msg.count);
});
socket.on('message', function(data) {
    addMessage(data['message'], data['pseudo'], new Date().toISOString(), false);
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


function addMessage(msg, pseudo, date, self) {
    if(self) var classDiv = "row message self";
    else var classDiv = "row message";
    $("#chatEntries").append('<div class="'+classDiv+'"><p class="infos"><span class="pseudo">'+pseudo+'</span>, <time class="date" title="'+date+'">'+date+'</time></p><p>' + msg + '</p></div>');
    var elem = document.getElementById('chatEntries');
    elem.scrollTop = elem.scrollHeight;
    time();
}

function bindButton() {
    submitButton.button('loading');
    messageContainer.on('input', function() {
        if (messageContainer.val() == "") submitButton.button('loading');
        else submitButton.button('reset');
    });
}
function time() {
    $("time").each(function(){
        $(this).text($.timeago($(this).attr('title')));
    });
}
function setHeight(chatEntriesHeight) {
    $(".slimScrollDiv").height(chatEntriesHeight);
}

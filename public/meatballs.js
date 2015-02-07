var messageContainer, submitButton;

// Help functions
function sendMessage() {
    if (messageContainer.val() != "") {
        addMessage(messageContainer.val());
        messageContainer.val('');
        submitButton.button('loading');
    }
}

// Init
$(function() {
    messageContainer = $('#messageInput');
    submitButton = $("#submit");
    bindButton();
    window.setInterval(formatTime, 1000);

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

// Scroll to the bottom of the page
function scrollToBottom() {
    var body = $("body")[0];
    body.scrollTop = body.scrollHeight;
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

// function to format the date in the "time" elements. 
// Scheduled on an interval
function formatTime(context) {
    $("time", context).each(function() {
        $(this).text($.timeago($(this).attr('title')));
    });
}

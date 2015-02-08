var messageContainer, 
    submitButton;

// Init
$(function() {
    messageContainer = $('#messageInput');
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
            // force the 'Enter Key' to implicitly click the Send button
            document.getElementById('submit').click();
            return false;
        } else  {
            return true;
        }
    }); // end of function

    messageContainer.focus();
});

// Help functions
function sendMessage() {
    if (messageContainer.val() != "") {
        addMessage(messageContainer.val())
        messageContainer.val('')
        submitButton.button('loading')
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
    if (force || dh - wst - wh < 75) {
        var body = $("body")[0]
        body.scrollTop = body.scrollHeight
    }
}
   
function bindButton() {
    submitButton.button('loading');
    messageContainer.on('input', function() {
        if (messageContainer.val() == "") {
            submitButton.button('loading')
        }
        else {
            submitButton.button('reset')
        }
    })
}

// function to format the date in the "time" elements. 
// Scheduled on an interval
function formatTime(context) {
    $("time", context).each(function() {
        $(this).text($.timeago($(this).attr('title')))
    })
}

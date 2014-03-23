var messageContainer, submitButton;
var pseudo = "";

// Init
$(function() {
	messageContainer = $('#messageInput');
	submitButton = $("#submit");
	bindButton();
	window.setInterval(time, 1000*10);
	$("#alertPseudo").hide();
	$('#modalPseudo').modal('show');
	$("#pseudoSubmit").click(function() {setPseudo()});
	$("#chatEntries").slimScroll({height: '600px'});
	submitButton.click(function() {sentMessage();});
	setHeight();
});

//Socket.io
var socket = io.connect();
socket.on('connect', function() {
	console.log('connected');
});
socket.on('nbUsers', function(msg) {
	$("#nbUsers").html(msg.nb);
});
socket.on('message', function(data) {
	addMessage(data['message'], data['pseudo'], new Date().toISOString(), false);
	console.log(data);
});

//Help functions
function sentMessage() {
	if (messageContainer.val() != "") 
	{
		if (pseudo == "") 
		{
			$('#modalPseudo').modal('show');
		}
		else 
		{
			socket.emit('message', messageContainer.val());
			addMessage(messageContainer.val(), "Me", new Date().toISOString(), true);
			messageContainer.val('');
			submitButton.button('loading');
		}
	}
}
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
function setPseudo() {
	if ($("#pseudoInput").val() != "")
	{
		socket.emit('setPseudo', $("#pseudoInput").val());
		socket.on('pseudoStatus', function(data){
			if(data == "ok")
			{
				$('#modalPseudo').modal('hide');
				$("#alertPseudo").hide();
				pseudo = $("#pseudoInput").val();
			}
			else
			{
				$("#alertPseudo").slideDown();
			}
		})
	}
}
function time() {
	$("time").each(function(){
		$(this).text($.timeago($(this).attr('title')));
	});
}
function setHeight() {
	$(".slimScrollDiv").height('603');
	$(".slimScrollDiv").css('overflow', 'visible')
}

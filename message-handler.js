var ractive = new Ractive({
	el: '#output',
	template: '#message-template',
	data: { 
		// messages is defined and maintained in meatballs.js
		messages: messages
	}
});
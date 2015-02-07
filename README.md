Node.js Chat
===

This application is made with Node.js, Express, Socket.io and Jade.
It use Bootstrap from Twitter and the javascript librairie SlimScroll.
Thanks to Node.js, the chat can handle a lot of simultaneous connections without lag.
To use it, you need Node.js and those 3 modules.

## Install the three modules :

- Go to the chat directory and use this command
- npm install

## Customize the installation :

- You can change the app port from the server.js third line.

## How to use :

- node server.js
- Go to IP:port from any (recent) navigator to start chatting !

### Credits

Creator : [Geekuillaume] (http://geekuillau.me/)
Enhancements: Paul Bennett, Kim Jackson, Guillaume Poulet, Martien Verbruggen

### TODO

- Make awareness of "self" stickier, maybe with a cookie or other in-page variable. 
  currently a websocket reset loses awareness
- Support multiple chats at once
- Allow voting on messages
- provide "most popular" list, based on votes\
- provide a 'shared token' type of access limitation
- server-side persistence of chat
- Flux-type communication (local update, server notification, full update on turnaround)
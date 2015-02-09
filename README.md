Node.js Chat
===

This application is made with Node.js, Express, Socket.io, Jade, Ractive and others.
It use Bootstrap from Twitter and the javascript library SlimScroll.
Thanks to Node.js, the chat can handle a lot of simultaneous connections without lag.

This chat application has been seriously reworked to be a commenting tool for 
presentations. It allows anonymous users to comment or askquestions, and to vote on each others comments and questions. The presentor can use that feedback to adjust the presentation, or to use it for a Q&A session at the end.

The design goals were to encourage anonymous feedback, which meant we did not want a log in or user name procedure. This application tries to deal with the challenges of making that anonymity "sticky", i.e. keep the same user name associated with the same client. It does not attempt to be completely secure, as that is pretty much stupid.

## Install modules :

- Go to the chat directory and use this command
- npm install

## Customize the installation :

- You can change the app port from the server.js third line.
- More to follow

## How to use :

- npm start
- Go to IP:port from any (recent) navigator to start chatting !

### Credits

Based on creation by: [Geekuillaume] (http://geekuillau.me/)
Many changes: Paul Bennett, Kim Jackson, Guillaume Poulet, Martien Verbruggen

### To do

In rough order of priority:

- provide "most popular" list, based on votes
- provide a 'shared token' type of access limitation
- server-side persistence of chat
- compression of socket messages, when sending the whole list
- Support multiple chats at once

### Changes

2014-02-07 - mgjv

- Refactored to use ractive
- Added voting
- Added persistence of pseudonym
- Stop auto-scrolling when not at bottom

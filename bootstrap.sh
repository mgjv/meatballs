#!/bin/bash
curl https://raw.github.com/creationix/nvm/master/install.sh | sh

# Load nvm and install latest production node
source $HOME/.nvm/nvm.sh
nvm install v0.10.17
nvm use v0.10.17

npm install -g forever --loglevel error
npm install -g mocha --loglevel error
npm install -g istanbul --loglevel error
npm install --loglevel error

# Up to here we are on common ground but the next line is for running the app (non-dev)
#PORT=8080 forever start server.js

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

# Install Heroku toolbelt
# https://toolbelt.heroku.com/debian
wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh

# git pull and install dotfiles as well
cd $HOME
if [ -d ./dotfiles/ ]; then
    mv dotfiles dotfiles.old
fi
git clone https://github.com/paulb67/dotfiles.git
ln -sb dotfiles/.screenrc .
ln -sb dotfiles/.bash_profile .
ln -sb dotfiles/.bashrc .
ln -sb dotfiles/.bashrc_custom .
ln -sb dotfiles/.bashrc_aliases .
ln -sb dotfiles/.vim .
ln -sb dotfiles/.vimrc .
ln -sb dotfiles/.gitconfig .

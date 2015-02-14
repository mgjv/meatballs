/*
 * Message DB. A message database for the chat server
 *
 * DB: No persistence, in memory
 * DBfs: persists to file system
 * 
 * Todo: other persistence mechanisms, for shared servers
 */

/* jshint node:true */

var fs = require("fs")
var logger = require("winston") // For now we just use the default logger

// var Promise = require("promise")

// No persistence version
// TODO This should create and use promises
var DB = exports.DB = function(name) {
    this.name = name || "message-db"
    this.__init_store()
 
}
DB.prototype.__init_store = function() {
   this._store = {
        messages: [],
        voters: []
    }
}
DB.prototype.addMessage = function(who, msg) {
     var message = {
            number: this._store.messages.length + 1,
            date: new Date(), //.toISOString(), 
            pseudo: who, 
            message: msg, 
            votes: 0
        };
        this._store.messages.push(message)
        this._store.voters.push([])
        this._save()
        return message
}
DB.prototype.vote = function(voter, msgNum, callback) {
    var index = msgNum - 1;
    var messages = this._store.messages
    var voters = this._store.voters
    if (voters[index].indexOf(voter) == -1) {
        messages[index].votes++
        voters[index].push(voter)
        this._save()
        callback(true, messages[index])
    }
    else {
        callback(false, messages[index])
    }
}
DB.prototype.getMessages = function() {
    return this._store.messages
}
DB.prototype.messageCount = function() {
    return this._store.messages.length
}
DB.prototype._save   = function() { /* Do nothing */ }
DB.prototype._read   = function() { /* Do nothing */ }
// This deletes the current database. USE WITH CARE
DB.prototype._delete = function () { 
    this.__init_store()
}


// File system backed message store
// TODO This probably needs more sophistication and/or robustness
var DBfs = exports.DBfs = function(name) {
    DB.call(this, name)
    this.fileName = this.name +  ".json"
    this._read()
}
DBfs.prototype = Object.create(DB.prototype)
DBfs.prototype.constructor = DBfs
DBfs.prototype._save = function() {
    var data = JSON.stringify(this._store)
    // Can't refer to 'this' in the callback for writeFile
    var name = this.name
    fs.writeFile(this.fileName, data, function(err) {
        if (err) {
            // TODO What is the right thing to do here,
            // if this is an internal function? Should we
            // throw an error?
            logger.error("DB(%s) _save: Error trying to persist: %s", name, err)
        }
        logger.debug("DB(%s) _save: done", name)
    })
}
DBfs.prototype._read = function() {
    try {
        var data = JSON.parse(fs.readFileSync(this.fileName))
        this._store.messages = data.messages
        this._store.voters = data.voters
        logger.info("DB(%s) read: %d messages", this.name, data.messages.length)
    }
    catch (e) {
        logger.info("DB(%s) read: No database", this.name)
    }
}
DBfs.prototype._delete = function() {
    DB.prototype._delete.call(this)
    var name = this.name
    fs.unlink(this.fileName, function(err) {
        if (err) {
            // While this is weird, we should just ignore it
            logger.info("DB(%s) delete: Database file deleted", name)
        }
    })
}

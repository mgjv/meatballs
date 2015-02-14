/* jshint mocha:true, node:true, expr:true */

require("mocha")
var chai = require("chai")
// var expect = chai.expect
chai.should()

var DB = require("../message-db").DB
var DBfs = require("../message-db").DBfs

var testStores = [
	{ name: "In memory store",   db: new DB("tempStore") },
	{ name: "File system store", db: new DBfs("tempStore") },
]


// TODO tests for 
// 	setting logger
//  error when saving? needs mock?
//  reading from an existing store
testStores.forEach(function(store) {
	describe(store.name, function () {
		var db = store.db
		var name = "someone"

		after(function() {
			db._delete()
		})

		describe("messages", function() {
			it("should accept a message", function() {
				var text = "This is a message"
				var msg = db.addMessage(name, text)
				msg.message.should.equal(text)
				msg.votes.should.equal(0)
				msg.pseudo.should.equal(name)
				db.messageCount().should.equal(1)
			})
			it("should increment the message count", function() {
				var text = "This is the second message"
				var msg = db.addMessage(name, text)
				msg.message.should.equal(text)
				msg.votes.should.equal(0)
				msg.pseudo.should.equal(name)			
				db.messageCount().should.equal(2)
			})
			it("should return the list of messages", function() {
				var messages = db.getMessages()
				messages.length.should.equal(2)
			})
		})
		describe("votes", function() {
			it("should accept a vote", function() {
				db.vote("john", 1, function(success, msg) {
					success.should.be.true // jshint ignore:line
					msg.votes.should.equal(1)
				})
				db.vote("harry", 1, function(success, msg) {
					success.should.be.true // jshint ignore:line
					msg.votes.should.equal(2)
				})
			})
			it("should only accept one vote per user", function() {
				db.vote("john", 2, function(success, msg) {
					success.should.be.true
					msg.votes.should.equal(1)
				})
				db.vote("john", 2, function(success, msg) {
					success.should.be.false
					msg.votes.should.equal(1)
				})
			})
		})
		// TODO: We really shouldn't be testing these internals. What 
		// do we do instead?
		describe("persistence", function() {
			it("should read the same data as before", function() {
				db._read()
				var messages = db.getMessages()
				// A bit fragile. And doesn't actually prove a database 
				// was reread from storage
				messages.length.should.equal(2)
				messages[0].votes.should.equal(2)
				messages[1].votes.should.equal(1)
			})
			it("should reset the data store", function() {
				db._delete()
				var messages = db.getMessages()
				messages.length.should.equal(0)
			})
		})
	})
})
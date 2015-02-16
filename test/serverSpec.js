/* jshint mocha:true, node:true */

// TODO:
//  The test should not use the standard database, 
//  but one for the test specifically

require("mocha")
var chai = require("chai")
var expect = chai.expect
chai.should()

var io = require("socket.io-client")

describe("server/client", function() {

    var server
    // Randomly pick a port. Theoretically this could conflict, but unlikely
    process.env.PORT = Math.floor(Math.random() * 100 + 31000)
    var app = require("../server.js").app
    var url = "http://localhost:" + app.get("port")
    // console.log("Using URL: " + url)
    var options ={
            transports: ["websocket"],
            "force new connection": true
        }

    before(function (done) {
        server = require("../server.js").server
        done()
    })

    describe("connection", function() {
        it("can echo message", function (done) {
            var client = io.connect(url, options)
    
            client.once("connect", function () {
                client.once("echo", function (message) {
                    expect(message).to.equal("Hello World")
                    client.disconnect()
                    done()
                })
    
                client.emit("echo", "Hello World")
            })
        })
    })

    describe("user number", function() {
        it("for 1 user", function(done) {
            var client1 = io.connect(url, options)
            client1.once("connect", function() {
                client1.once("user-num", function(users) {
                    expect(users).to.equal(1)
                    client1.disconnect()
                    done()
                })
            })
        })


        it("for 2 users", function(done) {
            var client1 = io.connect(url, options)
            var client2 = io.connect(url, options)

            client1.once("connect", function() {
               client2.once("connect", function() {
                    /* TODO cannot seem to make this work.
                        If client 1 user-num handler is onside client 2 connect handler, 
                        it never gets called. If it's insied client 1 handler, it gets called 
                        2 times.
                        Apart from that, I cannot owrk out how to wait for both events before 
                        before calling done().
                    client1.on("user-num", function(users) {
                        console.log("-> user-num 1  " + users)
                        expect(users).to.equal(2)
                        client1.disconnect()
                        done()
                    })
                    */
 
                    client2.once("user-num", function(users) {
                        expect(users).to.equal(2)
                        client2.disconnect()
                        client1.disconnect()
                        done()    
                    })
                })
            })
        })
    })

    /* TODO Don't really know how to test. 
       callback gets called twice in client 2, once on rego, and once after the request for
       a new pseudo. Would have to use '.on' and a counter. Too ugly for words.
       Probably need to rethink the way the server works.
    describe("prevent duplicate name", function() {
        it("for 2 freds", function(done) {
            var client1 = io.connect(url, options)
            var client2 = io.connect(url, options)
            client1.once("connect", function() {
                client1.emit("request-pseudo", "fred")
                client2.once("connect", function() {
                    client2.emit("request-pseudo", "fred")
                    client2.once("pseudo-status", function(status) {
                        status.status.should.equal("error")
                        client1.disconnect()
                        client2.disconnect()
                        done()
                    })
                })
            })
        })
    })
    */

    describe("pseudonym", function() {
        it("can set a pseudonym", function(done) {
            var client1 = io.connect(url, options)
            client1.once("connect", function() {
                client1.once("pseudo-status", function(status) {
                    status.status.should.equal("ok")
                    status.pseudo.should.contain("User")
                    client1.emit("request-pseudo", "john")
                    client1.once("pseudo-status", function(status) {
                        status.status.should.equal("ok")
                        status.pseudo.should.equal("john")
                        client1.disconnect()
                        done()
                    })
                })
            })
        })
    })

    describe("messages", function() {
        it("can send a message", function(done) {
            var client1 = io.connect(url, options)
            var client2 = io.connect(url, options)
            client1.once("connect", function() {
                client1.emit("request-pseudo", "john")
                client2.once("connect", function() {
                    client2.emit("request-pseudo", "gary")
                    client2.once("append-message", function(message) {
                        expect(message.message).to.equal("hello")
                        client1.disconnect()
                        client2.disconnect()
                        done()
                    })
                    client1.emit("message", "hello")
                })
            })
        })

        it("can vote on a message", function(done) {
            var client1 = io.connect(url, options)
            var client2 = io.connect(url, options)
            client1.once("connect", function() {
                client2.once("connect", function() {
                    client2.once("append-message", function(message) {
                        // Client2 receives no notification when things go right
                        client1.once("update-message", function(message) {
                            message.number.should.equal(msgNum)
                            message.votes.should.equal(1)
                            client1.disconnect()
                            client2.disconnect()
                            done()
                        })
                        var msgNum = message.number
                        message.votes.should.equal(0)
                        client2.emit("vote", msgNum)
                    })
                    client1.emit("message", "hello")
                })
            })
        })
        it("cannot vote twice on a message", function(done) {
            var client1 = io.connect(url, options)
            var client2 = io.connect(url, options)
            client1.once("connect", function() {
                client2.once("connect", function() {
                    client2.once("append-message", function(message) {
                        // This should come back for the first vote
                        // This theoretically has a race condition, as this 
                        // could happen after the client2 notification.
                        client1.once("update-message", function(message) {
                            message.number.should.equal(msgNum)
                            message.votes.should.equal(1)
                        })
                        // This should come back for the second vote
                        client2.once("update-message", function(message) {
                            message.number.should.equal(msgNum)
                            message.votes.should.equal(1)
                            client1.disconnect()
                            client2.disconnect()
                            done()
                        })
                        var msgNum = message.number
                        message.votes.should.equal(0)
                        client2.emit("vote", msgNum)
                        client2.emit("vote", msgNum)
                    })
                    client1.emit("message", "hello")
                })
            })
        })
    })
})

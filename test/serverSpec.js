var mocha = require('mocha');
var chai = require("chai");
var expect = chai.expect;
var should = chai.should;
var io = require("socket.io-client");
var request = require("supertest");
 
describe("server", function() {

    var server, client;
    var app = require("../server.js").app;
    var url = "http://localhost:" + app.get('port');
    var options ={
            transports: ['websocket'],
            'force new connection': true
        };

    before(function (done) {
        server = require("../server.js").server;
        done();
    });

    /* TODO: Keep a list of connected clients to disconnect at end rather than disconnecting clients in each test
    afterEach(function (done) {
        var clients = io_server.sockets.clients();
        console.log("connected clients: " + clients.length);
        for (var client in clients) {
        //if (client.socket) {
            //if (client.socket.connected) {
                console.log("disconnecting...");
                client.disconnect();
            //}
        //}
        }
        done();
    });
    */

    describe("socket connection sanity", function() {
        it("echoes message", function (done) {
            var client = io.connect(url, options);
    
            client.once("connect", function () {
                client.once("echo", function (message) {
                    expect(message).to.equal("Hello World");

                    client.disconnect();
                    done();
                });
    
                client.emit("echo", "Hello World");
            });
        });
    });

    describe("counts connected users", function() {
        it("for 1 user", function(done) {
            var client1 = io.connect(url, options);
            client1.once("connect", function() {
                client1.once("nbUsers", function(nbUsers) {
                    expect(nbUsers).to.equal(1);

                    client1.disconnect();
                    done();
                });
            });
        });

        it("for 2 users", function(done) {
            var client1 = io.connect(url, options);
            var client2 = io.connect(url, options);
            client1.once("connect", function() {
                client2.once("connect", function() {
                    client1.once("nbUsers", function(nbUsers) {
                        expect(nbUsers).to.equal(2);
                    });
                    client2.once("nbUsers", function(nbUsers) {
                        expect(nbUsers).to.equal(2);
                    });

                    client1.disconnect();
                    client2.disconnect();
                    done();
                });
            });
        });
    });

    // TODO This test does not seem to be able to fail
    describe("prevent duplicate name", function() {
        it("for 2 freds", function(done) {
            var client1 = io.connect(url, options);
            var client2 = io.connect(url, options);
            client1.once("connect", function() {
                client1.emit("setPseudo", "fred");
                client2.once("connect", function() {
                    client2.emit("wantPseudo", "fred");
                    client2.once("wantPseudo", function() {
                        setPseudo.pseudoStatus.should.equal("error");
                    });

                    client1.disconnect();
                    client2.disconnect();
                    done();
                });
            });
        });
    });

    describe("message sending", function() {
        it("sends message", function(done) {
            var client1 = io.connect(url, options);
            var client2 = io.connect(url, options);
            client1.once("connect", function() {
                client1.emit("wantPseudo", "john");
                client2.once("connect", function() {
                    client2.emit("wantPseudo", "gary");
                    client2.once("append-message", function(message) {
                        expect(message.message).to.equal("hello");
 
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    });
                    client1.emit("message", "hello");
                });
            });
        });

        // TODO This test probably shouldn't exist anymore
        it("does not send message when no name set", function(done) {
            // client1 (sender) will have no name in this test
            this.timeout(5000);
            var client1 = io.connect(url, options);
            var client2 = io.connect(url, options);
            client1.once("connect", function() {
                client2.emit("setPseudo", "will");
                client2.once("append-essage", function(message) {
                        true.should.equal(false);

                        client1.disconnect();
                        done();
                });
                client1.emit("message", "hello");
                // we are firing the done callback having given the app 2.5s to return a value
                setTimeout(done, 2500);
            });
        });
    });

 });

var mocha = require('mocha');
var chai = require("chai");
var expect = require("chai").expect;
var should = chai.should();
var io = require("socket.io-client");
 
describe("server", function() {

    var server;
    var client;
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
        if (client.socket) {
            if (client.socket.connected) {
                console.log("disconnecting...");
                client.disconnect();
            }
        }
        done();
    });
    */

    it("echoes message", function (done) {
        client = io.connect(url, options);
 
        client.once("connect", function () {
            client.once("echo", function (message) {
                message.should.equal("Hello World");

                client.disconnect();
                done();
            });
 
            client.emit("echo", "Hello World");
        });
    });

    describe("counts connected users", function() {
        it("for 1 user", function(done) {
            client1 = io.connect(url, options);
            client1.once("connect", function() {
                client1.once("nbUsers", function(nbUsers) {
                    nbUsers.nb.should.equal("is 1");

                    client1.disconnect();
                    done();
                });
            });
        });

        it("for 2 users", function(done) {
            client1 = io.connect(url, options);
            client2 = io.connect(url, options);
            client1.once("connect", function() {
                client2.once("connect", function() {
                    client1.once("nbUsers", function(nbUsers) {
                        nbUsers.nb.should.equal("are 2");
                    });
                    client2.once("nbUsers", function(nbUsers) {
                        nbUsers.nb.should.equal("are 2");
                    });

                    client1.disconnect();
                    client2.disconnect();
                    done();
                });
            });
        });
    });

    it("sends message", function(done) {
        client1 = io.connect(url, options);
        client2 = io.connect(url, options);
        client1.once("connect", function() {
            client1.emit("setPseudo", "fred");
            client2.once("connect", function() {
                client2.emit("setPseudo", "bill");
                client2.once("message", function(message) {
                    message.message.should.equal("hello");

                    client1.disconnect();
                    client2.disconnect();
                    done();
                });
                client1.emit("message", "hello");
            });
        });
    });
});

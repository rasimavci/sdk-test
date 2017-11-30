'use strict';

//const createKandy = require('kandy-js/dist/kandy/kandy.link')   // to import the kandy next Link build
//const kandy = createKandy();

const fcs = require('kandy-js/dist/fcs/js/fcs')
//const fcs = createKandy();

var jet = require('node-jet')

var username,
    password,
    notificationType,
    restUrl,
    restPort,
    websocketIP,
    websocketPort,
    protocol,
    websocketProtocol,
    earlyMediaSupport,
    dtlsEnabled = true,
    dscpEnabled = false,
    isVideoEnabled = true,
    isAudioEnabled = true,
    sendInitialVideo = false;

const states = {
7:'ANSWERING',
12:'CALL_IN_PROGRESS',
13:'EARLY_MEDIA',
3:'ENDED',
6:'INCOMING',
0:'IN_CALL',
8:'JOINED',
1:'ON_HOLD',
11:'ON_REMOTE_HOLD',
5:'OUTGOING',
4:'REJECTED',
9:'RENEGOTIATION',
15:'REPLACING',
2:'RINGING',
10:'TRANSFERRED',
14:'TRANSFER_FAILURE'
}

const mediaStates = {
    1: 'CHECKING',
    6: 'CLOSED',
    3: 'COMPLETED',
    2: 'CONNECTED',
    5: 'DISCONNECTED',
    4: 'FAILED',
    0: 'NEW'
}

const presences = {

0: 'SERVICE_FAILURE',
8: 'ACTIVE',
2: 'AWAY',
6: 'BE_RIGHT_BACK',
4: 'BUSY',
0:'CONNECTED',
12:'CONNECTEDNOTE',
9:'INACTIVE',
11:'OFFLINE',
7:'ON_THE_PHONE',
5:'ON_VACATION',
3:'OUT_TO_LUNCH',
10:'PENDING',
1:'UNAVAILABLE',
13:'UNAVAILABLENOTE',
}

class Peer_fcs2 {
    constructor() {

        this.peer = new jet.Peer({
            // url: 'wss://47.168.247.41:8090'
            url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
        });

        var self = this;

        this.loginMethod = new jet.Method('todo/login2');
        this.loginMethod.on('call', function (args) {
            console.log('Peer: login method called..');
            self.login(args[0]);
        });



        this.logoutMethod = new jet.Method('todo/logout2');
        this.logoutMethod.on('call', function (args) {
            console.log('Peer: logout method called..');
            self.logout()
        });

        this.callMethod = new jet.Method('todo/makeCall2');
        this.callMethod.on('call', function (args) {
            console.log('Peer: makeCall method started..');
            self.makeCall(args[0], null, false, false)
            // self.makeCall(to, contact, isVideoEnabled, sendInitialVideo)
        });

        this.answerMethod = new jet.Method('todo/answerCall2');
        this.answerMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: answerCall method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.answer(function () {
                self.showSuccessMessage("You are on call",self);
            },

                function () {
                    self.showErrorMessage("Call answer is failed!",self);
                 },

                sendInitialVideo, undefined, { isAudioEnabled: isAudioEnabled });
        });


        this.holdMethod = new jet.Method('todo/hold2');
        this.holdMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: hold method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.hold(function () {
                self.showSuccessMessage("Call is held!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be held!",self);
                });
        });

        this.unholdMethod = new jet.Method('todo/unhold2');
        this.unholdMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: unhold method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.unhold(function () {
                self.showSuccessMessage("Call is unheld!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be unheld!",self);
                });
        });

        this.endMethod = new jet.Method('todo/end2');
        this.endMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: unhold method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.end(function () {
                self.showSuccessMessage("Call is ended!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be ended!",self);
                });
        });        

        this.rejectMethod = new jet.Method('todo/reject2');
        this.rejectMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: reject method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.reject(function () {
                self.showSelfMessage("Call is reject!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be rejected!",self);
                });
        });  

        this.ignoreMethod = new jet.Method('todo/ignore2');
        this.ignoreMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: ignore method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.ignore(function () {
                self.showInfoMessage("Call is ignored!");
            },

                function () {
                    self.showErrorMessage("Call couldn't be ignored!");
                });
        });  

        this.videoStartMethod = new jet.Method('todo/videoStart2');
        this.videoStartMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: videoStart method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.videoStart(function () {
                self.showSuccessMessage("Call is videoStart!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!",self);
                });
        });  

        this.videoStopMethod = new jet.Method('todo/videoStop2');
        this.videoStopMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: videoStop method stop..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.videoStop(function () {
                self.showSuccessMessage("Call is videoStop!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!",self);
                });
        });  

        this.setPresenceMethod = new jet.Method('todo/setPresence2');
        this.setPresenceMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: presence state..');

                  self.updatePresenceState(args[0],
                    //Success callback
                    function() {
                        self.showSuccessMessage("Presence state is set to " + args[0],self);
                    },
                    //Failure callback
                    function() {
                        self.showErrorMessage("Presence state couldn't be changed!",self);
                    }
                );
        });  


        this.peer.connect().then(function () {
            console.log('Peer: connection to Daemon established');
            //console.log('Peer Daemon Info: ', this.peer.daemonInfo);
        });


        this.peer.add(this.loginMethod).then(function () {
            console.log('Peer: login method added')
        })


        this.peer.add(this.logoutMethod).then(function () {
            console.log('Peer: logout method added')
        })

        this.peer.add(this.callMethod).then(function () {
            console.log('Peer: makeCall method added')
        })

        this.peer.add(this.answerMethod).then(function () {
            console.log('Peer: answerCall method added')
        })

        this.peer.add(this.holdMethod).then(function () {
            console.log('Peer: hold method added')
        })

        this.peer.add(this.unholdMethod).then(function () {
            console.log('Peer: hold method added')
        })

        this.peer.add(this.endMethod).then(function () {
            console.log('Peer: end method added')
        })        

        this.peer.add(this.rejectMethod).then(function () {
            console.log('Peer: end method added')
        })    

                this.peer.add(this.ignoreMethod).then(function () {
            console.log('Peer: end method added')
        })            

        this.peer.add(this.videoStartMethod).then(function () {
            console.log('Peer: videoStart method added')
        })    

                this.peer.add(this.videoStopMethod).then(function () {
            console.log('Peer: videoStop method added')
        })    

                this.peer.add(this.setPresenceMethod).then(function () {
            console.log('Peer: videoStop method added')
        })    

    }


            updatePresenceState(state, onSuccess, onFailure) {
                // Checking if the user has presence service assigned on the server
                if (fcs.getServices().presence === true) {
                    // Updating presence state of the user on the application server
                    fcs.presence.update(state, onSuccess, onFailure);
                }
var self = this;
            let id = 0;
  self.peer.set('todo/#' + id, {
    presence_term: presences[state]
  })

            }   


    login(id) {

        var self = this;

        console.log('Login process started for user:' + id)
        // clear the device list
        //$("#deviceListID").empty();

        // start logging
        //              fcs.logManager.initLogging(jslLogHandler, true);

        // Getting configuration paramaters from configuration form
        // No field validation is performed in this demo, but
        // highly recommended in real life applications
        username = id //$("#confUsername").val();
        password = 'Genband.1234' //$("#confPassword").val();
        notificationType = 'Web Socket' //$("#confNotificationType option:selected").val();
        restUrl = 'spidr-ucc.genband.com' //$("#confRestURL").val();
        restPort = '443' //$("#confRestPort").val();
        websocketIP = 'spidr-ucc.genband.com' //$("#confWebsocketIP").val();
        websocketPort = '443' //$("#confWebsocketPort").val();
        protocol = 'HTTPS' //$("#confProtocol option:selected").val();
        websocketProtocol = 'WSS' //$("#confWebsocketProtocol option:selected").val();

        // Username and Password of the user are being set up in JSL API level
        // So that JSL API can subscribe to SPiDR server with those credentials
        // This function must be setup and called before fcs.notification.start function
        fcs.setUserAuth(username, password);


        // JSL API paramaters are being set up. Please see JSL API Doc to find out the definitions
        // of all paramaters
        // This function must be setup and called before fcs.notification.start function
        fcs.setup({
            notificationType: notificationType,
            restUrl: restUrl,
            restPort: restPort,
            websocketIP: websocketIP,
            websocketPort: websocketPort,
            protocol: protocol,
            websocketProtocol: websocketProtocol
        });

        var onCallReceived = function (call) {
            self.showWarningMessage("There is an incoming call...");

            // Assigning call to currentCall variable to be used by buttons (End, Hold, StartVideo etc.)
            self.currentCall = call;

            //This function listens call state changes in JSL API level
            call.onStateChange = function (state, statusCode, reasonText, data) {
                call.statusCode = statusCode;
                call.reasonText = reasonText;
                call.localStatusCode = data.localStatusCode;
                call.localReasonText = data.localReasonText;
                self.onStateChange(call, state, self);
            };

            call.onMediaStateChange = function (mediaState) {
                self.onMediaStateChange(mediaState,self);
            };

            //This function listens media streams in JSL API level
            call.onStreamAdded = function (streamURL) {
                // Remote Video is turned on by the other end of the call
                console.log("Remote stream added...");
            };

            //This function listens local media streams in JSL API level
            call.onLocalStreamAdded = function () {
                console.log("Local stream added...");
            };

            // Show modal box
            // $('#modal').modal('show');

            let id = 0;
        self.peer.set('todo/#' + id, {
            result2: 'incomingCall'
        })

        self.peer.set('todo/#' + id, {
            state_term: 'INCOMING'
        })

        };

                var onPresenceReceived = function (presence) {
            //var self = this;
            var id = '0'
            self.peer.set('todo/#' + id, {
                presence_orig: presences[presence]
            })

            /*var presenceState = null;
            for (var index in listOfPresenceStates) {
                if (listOfPresenceStates[index] === presence.state) {
                    presenceState = index;
                    break;
                }
            }
*/
   //         self.showInfoMessage("A new presence status for " + presence.name + " Status= " + presenceState);

            // Updating presence status of the contact in "My Friends" table
            // $("#addressbook").find("tr[id='" + presence.name + "'] td:last-child").text(presenceState);
        };

var onIMReceived = function(msg){
                self.showInfoMessage("IM Received from: " + msg.primaryContact + ' - message: ' + msg.msgText);
};
        fcs.logManager.initLogging(self.jslLogHandler, true);

        fcs.notification.start(
            //Success callback
            function () {
                self.showSuccessMessage("You are logged in successfully!",self);
                console.log("Notification connection is established successfully!");
                // This example registers itself to Call notifications.
                // fcs.call.onReceived listens incoming calls in JSL API level
                fcs.call.onReceived = onCallReceived;
                fcs.im.onReceived = onIMReceived;
                fcs.presence.onReceived = onPresenceReceived;
            },
            // Failure callbackf
            function () {
                self.showErrorMessage("Notification error occurred! Notification subsystem couldn't be started!"),self;
                // Logout user
                logout();
            }
        );
/*
  self.peer.set('todo/#' + id, {
    state_term: 'LOGIN'
  })
*/
    }

    jslLogHandler(loggerName, level, logObject) {
        var LOG_LEVEL = fcs.logManager.Level,
            msg = logObject.timestamp + " - " + loggerName + " - " + level + " - " + logObject.message;

        switch (level) {
            case LOG_LEVEL.DEBUG:
                window.console.debug(msg, logObject.args);
                break;
            case LOG_LEVEL.INFO:
                window.console.info(msg, logObject.args);
                break;
            case LOG_LEVEL.ERROR:
                window.console.error(msg, logObject.args);
                break;
            default:
                window.console.log(msg, logObject.args);
        }
    }


    // Logout function
    logout() {
        var self = this;
        // It removes user's subscription from SPiDR Server
        fcs.notification.stop(
            // Success callback
            function () {
                   console.log("You unsubscribed successfully!");
                //self.showInfoMessage("You unsubscribed successfully!",self);
            },
            // Failure callback
            function () {
                self.showErrorMessage("An error occurred during un-subscription!",self);
            },
            true
        );
    }

    // This function listens received calls
    /* onCallReceived(call) {
       //  var self = this;
        // this.showWarningMessage("There is an incoming call...");
 
         // Assigning call to currentCall variable to be used by buttons (End, Hold, StartVideo etc.)
         currentCall = call;
 
         //This function listens call state changes in JSL API level
         call.onStateChange = function (state, statusCode, reasonText, data) {
             call.statusCode = statusCode;
             call.reasonText = reasonText;
             call.localStatusCode = data.localStatusCode;
             call.localReasonText = data.localReasonText;
             onStateChange(call, state);
         };
 
         call.onMediaStateChange = function (mediaState) {
             onMediaStateChange(mediaState);
         };
 
         //This function listens media streams in JSL API level
         call.onStreamAdded = function (streamURL) {
             // Remote Video is turned on by the other end of the call
             console.log("Remote stream added...");
         };
 
         //This function listens local media streams in JSL API level
         call.onLocalStreamAdded = function () {
             console.log("Local stream added...");
         };
 
         // Show modal box
         // $('#modal').modal('show');
     } */

    // This function listens call state changes
    onStateChange(call, state, self) {
        
                 var id = '0'
                self.peer.set('todo/#' + id, {
                state_term: states[state]
        })

/*
              self.peer.get({ path: { equals: 'todo/#0' } }).then(function (results) {
          
        console.log('sonuc3:' + results[0].value.directTransfer)
        var directTransfer1 = results[0].value.directTransfer

        if (directTransfer1 === true) {
var id = 0;
        self.peer.set('todo/#' + id, {
            state_orig2: states[state]
        })
        }

        else {
var id = 0;
        self.peer.set('todo/#' + id, {
            state_term: states[state]
        })
        }
      });
*/

        switch (state) {
            case fcs.call.States.IN_CALL:
                self.showSuccessMessage("You are in call",self);
                break;
            case fcs.call.States.ON_HOLD:
                self.showInfoMessage("The call is held");
                break;
            case fcs.call.States.RINGING:
                self.showInfoMessage("It is ringing...");
                break;
            case fcs.call.States.ENDED:
                //Hide modal box
              //  $("#modal").modal('hide');

                var statusCode = call.localStatusCode ? call.localStatusCode : call.statusCode;
                var reasonText = call.localReasonText ? call.localReasonText : call.reasonText;

                self.showInfoMessage("The call is ended. Status Code: " + statusCode +
                    " Reason: " + reasonText);

                switch (statusCode) {
                    case "404":
                        self.showInfoMessage("Callee does not exist");
                        break;
                    case "480":
                        self.showInfoMessage("Callee is offline");
                        break;
                    case "603":
                        self.showInfoMessage("Callee rejected us");
                        break;
                    case "487":
                        self.showInfoMessage("Callee did not answer");
                        break;
                    case "9900":
                        self.showInfoMessage("Call end reason is not provided");
                        break;
                    case "9901":
                        self.showInfoMessage("Call is ended locally");
                        break;
                    case "9902":
                        self.showInfoMessage("Call is rejected locally");
                        break;
                    case "9903":
                        self.showInfoMessage("Call is ignored locally");
                        break;
                    case "9904":
                        self.showInfoMessage("Call is responded from another device");
                        break;
                    case "9905":
                        self.showInfoMessage("Call is transfered");
                        break;
                    default:
                        break;
                }
                // Setting incoming call as null since call is ended
                self.currentCall = null;
                break;
            case fcs.call.States.REJECTED:
                self.showInfoMessage("The call is rejected");
                break;
            case fcs.call.States.OUTGOING:
                self.showInfoMessage("There is an outgoing call");
                break;
            case fcs.call.States.INCOMING:
                self.showInfoMessage("There is an incoming call");
                break;
            case fcs.call.States.ANSWERING:
                self.showInfoMessage("The call is being answered");
                break;
            case fcs.call.States.JOINED:
                self.showInfoMessage("An another call is joined");
                break;
            case fcs.call.States.RENEGOTIATION:
                self.showInfoMessage("Renegotiation state");
                break;
            case fcs.call.States.TRANSFERRED:
                self.showInfoMessage("Transfered state");
                break;
            case fcs.call.States.EARLY_MEDIA:
                self.showInfoMessage("Early media.");
                break;
        }
    }

    onMediaStateChange(mediaState, self) {

                 var id = '0'
                self.peer.set('todo/#' + id, {
                mediaState_term: mediaStates[mediaState]
        })

        switch (mediaState) {
            case fcs.call.MediaStates.NEW:
                self.showInfoMessage("Media State New");
                break;
            case fcs.call.MediaStates.CHECKING:
                self.showInfoMessage("Media Checking");
                break;
            case fcs.call.MediaStates.CONNECTED:
                self.showSuccessMessage("Media Connected",self);
                break;
            case fcs.call.MediaStates.COMPLETED:
                self.showInfoMessage("Media completed");
                break;
            case fcs.call.MediaStates.FAILED:
                self.showErrorMessage("Media Failed",self);
                break;
            case fcs.call.MediaStates.DISCONNECTED:
                self.showInfoMessage("Media Disconnected");
                break;
            case fcs.call.MediaStates.CLOSED:
                self.showInfoMessage("Media Closed");
                break;
        }
    }

            onPresenceReceived(presence,self) {

                 var id = '0'
                self.peer.set('todo/#' + id, {
                presence_orig: presences[presence]
        })

                var presenceState = null;
                for (var index in listOfPresenceStates) {
                    if (listOfPresenceStates[index] === presence.state) {
                        presenceState = index;
                        break;
                    }
                }

                self.showInfoMessage("A new presence status for " + presence.name + " Status= " + presenceState);

                // Updating presence status of the contact in "My Friends" table
               // $("#addressbook").find("tr[id='" + presence.name + "'] td:last-child").text(presenceState);
            }

    showInfoMessage(message) {
        console.log(message)
    }

    showErrorMessage(message,self) {
        console.log(message)
    }
    showSuccessMessage(message,self) {
        console.log(message)
                        var id = '0'
        self.peer.set('todo/#' + id, {
            result: 'error'
        })
    }

    showErrorMessage(message) {
        console.log(message)
    }

    showWarningMessage(message) {
        console.log(message)
    }

    makeCall1(id, to) {
        self.peer.call('todo/add', [to])

        makeCall(to, contact, isVideoEnabled, sendInitialVideo)


        //    this.setTodoCompleted(todo.value.id, !todo.value.completed)
        // Just 
        //kandy.
        self.peer.set('todo/#' + 0, {
            state_orig: 'OUTGOING'
        })

        console.log('Make call to ' + to)
    }

    makeCall(to, contact, isVideoEnabled, sendInitialVideo) {
        var self = this;
        fcs.call.startCall(username, contact, to,
            //onSuccess callback
            function (outgoingCall) {
                self.showInfoMessage("A new call is successful!");
                // Assigning call object to currentCall variable to use in the application
                self.currentCall = outgoingCall;

                //This function listens call state changes in JSL API level
                outgoingCall.onStateChange = function (state, statusCode, reasonText, data) {
                    outgoingCall.statusCode = statusCode;
                    outgoingCall.reasonText = reasonText;
                    outgoingCall.localStatusCode = data.localStatusCode;
                    outgoingCall.localReasonText = data.localReasonText;
                    self.onStateChange(outgoingCall, state, self);
                };

                outgoingCall.onMediaStateChange = function (mediaState) {
                    self.onMediaStateChange(mediaState, self);
                };

                //This function listens media streams in JSL API level
                outgoingCall.onStreamAdded = function (streamURL) {
                    // Remote Video is turned on by the other end of the call
                    self.showInfoMessage("Remote stream added...");
                };

                //This function listens local media streams in JSL API level
                outgoingCall.onLocalStreamAdded = function () {
                    self.showInfoMessage("Local stream added...");
                };
            },
            //onFailure callback
            function () {
                self.showErrorMessage("Call is failed!");
            },
            isVideoEnabled /*isVideoEnabled*/,
            sendInitialVideo /*sendInitialVideo*/,
            null,
            { isAudioEnabled: true }
        );
    }

    //deneme(){
    callAnswer(call, onAnswer, onFailure, sendInitialVideo) {
        self.showInfoMessage("You are in callAnswer");
        // var self = this;
        call.answer(onAnswer, onFailure, sendInitialVideo, undefined, { isAudioEnabled: isAudioEnabled });
    };

    //}
    answerCall2(id) {
        //    this.setTodoCompleted(todo.value.id, !todo.value.completed)
        // Just answer the call.
        //kandy.answerCall(callId, options);
        this.peer.set('todo/#' + id, {
            state_term: 'IN_CALL'
        })

        console.log('answer incoming call')
    }

    setTodoCompleted(id, completed) {
        this.peer.set('todo/#' + id, {
            completed: completed
        });
    }

    Merge(id) {
        //    this.setTodoCompleted(todo.value.id, !todo.value.completed)
        // Just answer the call.
        //kandy.
        this.peer.set('todo/#' + id, {
            state_term: 'JOIN'
        })

        console.log('Merge call to: ' + id)
    }


    Transfer(id) {
        //    this.setTodoCompleted(todo.value.id, !todo.value.completed)
        // Just answer the call.
        //kandy.
        this.peer.set('todo/#' + id, {
            state_term: 'TRANSFER'
        })

        console.log('Transfer call to: ' + id)
    }

    deneme() {

        this.call.peer.set('todo/#' + 1, {
            completed: true
        })

    }
}


module.exports = Peer_fcs2;
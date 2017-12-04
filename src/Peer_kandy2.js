'use strict';

//Kandy onprem peer

const createKandy = require('kandy-js/dist/kandy/kandy.onprem')   // to import the kandy next Link build
var kandy = createKandy({
    authentication: {
        subscription: {
            expires: 3600,
            service: ['IM', 'Presence', 'call'],
            protocol: 'https',
            server: 'spidr-ucc.genband.com',
            version: '1',
            port: '443'
        },
        websocket: {
            protocol: 'wss',
            server: 'spidr-ucc.genband.com',
            port: '443'
        }
    },
    logs: {
        logLevel: 'debug',
        enableFcsLogs: true
    },
    call: {
        chromeExtensionId: 'put real extension ID here',
        serverProvidedTurnCredentials: true,
        iceserver: [
            {
                url: "stun:turn-ucc-1.genband.com:3478?transport=udp"
            },
            {
                url: "stun:turn-ucc-2.genband.com:3478?transport=udp"
            },
            {
                url: "turns:turn-ucc-1.genband.com:443?transport=tcp",
                credential: ''
            },
            {
                url: "turns:turn-ucc-2.genband.com:443?transport=tcp",
                credential: ''
            }
        ]
    }
});

const states = {
    7: 'ANSWERING',
    12: 'CALL_IN_PROGRESS',
    13: 'EARLY_MEDIA',
    3: 'ENDED',
    6: 'INCOMING',
    0: 'IN_CALL',
    8: 'JOINED',
    1: 'ON_HOLD',
    11: 'ON_REMOTE_HOLD',
    5: 'OUTGOING',
    4: 'REJECTED',
    9: 'RENEGOTIATION',
    15: 'REPLACING',
    2: 'RINGING',
    10: 'TRANSFERRED',
    14: 'TRANSFER_FAILURE'
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
    0: 'CONNECTED',
    12: 'CONNECTEDNOTE',
    9: 'INACTIVE',
    11: 'OFFLINE',
    7: 'ON_THE_PHONE',
    5: 'ON_VACATION',
    3: 'OUT_TO_LUNCH',
    10: 'PENDING',
    1: 'UNAVAILABLE',
    13: 'UNAVAILABLENOTE',
}


//const createKandy = require('kandy-js/dist/kandy/kandy.onprem')   
//const kandy = createKandy();

var jet = require('node-jet')

var firstCallId;
var deviceListId = 'devices';
var callOne;
var transferCallOne;
var transferSuccess;
var currentConvo;

class Peer_kandy2 {
    constructor() {
        this.peer = new jet.Peer({
            url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
        });

        var self = this;


        this.loginMethod = new jet.Method('call/login2');
        this.loginMethod.on('call', function (args) {
            console.log('Peer: login method called...');
            console.log('Login credentials..', args);

            self.login(args)

        });

        this.logoutMethod = new jet.Method('call/logout2');
        this.logoutMethod.on('call', function (args) {
            console.log('Peer: logout method called..');
            self.logout()
        });

        this.callMethod = new jet.Method('call/makeCall2');
        this.callMethod.on('call', function (args) {
            console.log('Peer: makeCall method started..');
            var options = {

                isAudioEnabled: document.getElementById('isAudioEnabled').checked,
                isVideoEnabled: document.getElementById('isVideoEnabled').checked,
                sendInitialVideo: document.getElementById('sendInitialVideo').checked,
                sendScreenShare: document.getElementById('sendScreenShare').checked,
                localVideoContainer: document.getElementById('local-container'),
                remoteVideoContainer: document.getElementById('remote-container')
            };
            self.makeCall(args[0], options)
        });

        this.answerMethod = new jet.Method('call/answerCall2');
        this.answerMethod.on('call', function (args) {
            console.log('Peer: answerCall method started..');
            self.answerCall()
        });
        this.answerVideoMethod = new jet.Method('call/answerVideo2');
        this.answerVideoMethod.on('call', function (args) {
            console.log('Peer: answerCall method started..');
            self.answerVideoCall()
        });
        this.endMethod = new jet.Method('call/end2');
        this.endMethod.on('call', function (args) {
            self.endCall()
            console.log("Call is ended!");
        });

        this.holdMethod = new jet.Method('call/hold2');
        this.holdMethod.on('call', function (args) {
            console.log('Peer: hold method started..');
            self.holdCall()
        });

        this.unholdMethod = new jet.Method('call/unhold2');
        this.unholdMethod.on('call', function (args) {
            console.log('Peer: unhold method started..');
            self.unholdCall(self)
        });

        this.muteMethod = new jet.Method('call/mute2');
        this.muteMethod.on('call', function (args) {
            self.muteCall()
            console.log('Peer1: mute method called..');
        });

        this.unmuteMethod = new jet.Method('call/unmute2');
        this.unmuteMethod.on('call', function (args) {
            console.log('Peer1: unmute method called..');
            self.unmuteCall()
        });

        this.videoStartMethod = new jet.Method('call/videoStart2');
        this.videoStartMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: videoStart method started..');

            //todo: normaly this was in another function called callAnswer
            self.startVideo(function () {
                self.showSuccessMessage("Call is videoStart!", self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!", self);
                });
        });

        this.videoStopMethod = new jet.Method('call/videoStop2');
        this.videoStopMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer1: videoStop method called..');

            //todo: normaly this was in another function called callAnswer
            self.stopVideo(function () {
                self.showSuccessMessage("Call is videoStop!", self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!", self);
                });
        });

        ///////////////Transfer & Merge
        ////////////////////////////////////////////////////
        this.directTransferMethod = new jet.Method('call/directTransfer2');
        this.directTransferMethod.on('call', function (args) {

            console.log('Peer1: getUserProfileData method called..');
            self.directTransfer(args[0])
        });

        this.consultativeTransferMethod = new jet.Method('call/consultativeTransfer2');
        this.consultativeTransferMethod.on('call', function (args) {

            console.log('Peer1: consultativeTransfer method called..');

            self.currentCall.consultativeTransfer(self.currentCall2.getId(), function () {
                self.showSuccessMessage("consultative Transfered is successful", self);
            },
                function () {
                    self.showErrorMessage("consultative Transfer is failed!", self);
                });
        });

        this.conferenceCallMethod = new jet.Method('call/conferenceCall1');
        this.conferenceCallMethod.on('call', function (args) {

            console.log('Peer1: conference Call method called..');

            self.currentCall2.join(self.currentCall, function () {
                self.showSuccessMessage("conference call is successful", self);
            },
                function () {
                    self.showErrorMessage("conference Call is failed!", self);
                });
        });

        // MESSAGING
        this.fetchConversationMethod = new jet.Method('msg/fetchConversation2');
        this.fetchConversationMethod.on('call', function (args) {
            console.log('Peer2: fetchConversationMethod method called..');
            self.fetchConversations()
        });

        this.createGroupConversationMethod = new jet.Method('msg/createGroupConversation2');
        this.createGroupConversationMethod.on('call', function (args) {
            console.log('Peer2: createGroupConversationMethod method called..');
            self.createGroupConversation(args[0]) //name(string), options(object)
        });



        this.createConversationMethod = new jet.Method('msg/createConversation2');
        this.createConversationMethod.on('call', function (args) {
            console.log('Peer2: create/getConversation(currentConvo) method called..');
            currentConvo = self.getConversation(args[0])

            self.peer.call('msg/add', ['msg1'])
            self.peer.set('msg/#0', {
                conversation_term: true
            })
        });


        this.imSendMethod = new jet.Method('msg/imSend2');
        this.imSendMethod.on('call', function (args) {

            console.log('Peer2: imSendMethod method called..');
            //construct an im object with values of to, type, msgText, charset,
            //then calling fcs.im.send function to send the IM
            //text = 'deneme'
            // Create the message object, passing in the text for the message.
            var message = currentConvo.createMessage(args[0]);

            // Send the message!
            message.sendMessage();

        });

        this.clearConversationMethod = new jet.Method('msg/clearMessage2');
        this.clearConversationMethod.on('call', function (args) {
            console.log('Peer2: clearConversationMethod method called..');
            currentConvo.clear();
            let msgArray = currentConvo.getMessages()
            let id = '0'

            self.peer.set('msg/#' + id, {
                messages_term: msgArray
            })
        });

        this.getMessagesMethod = new jet.Method('msg/getMessages2');
        this.getMessagesMethod.on('call', function (args) {
            console.log('Peer2: getMessagesMethod method called..');

            return currentConvo.getMessages();
            /* var msgArray = currentConvo.getMessages();
                 let id = '0'
                 self.peer.set('msg/#' + id, {
                     messages_term: msgArray
                 }) 
     */
        });

        this.subscribeMethod = new jet.Method('msg/subscribe2');
        this.subscribeMethod.on('call', function (args) {
            console.log('Peer2: subscribeMethod method called..');

            currentConvo.subscribe(function (messageObj) {

                //console.log('Subscribe callback: ' + messageObj[0])
                //  messageObj['oztemur@genband.com'].messages.forEach(function (message) {
                //console.log(message.sender + ', ' + message.parts[0].text)
                //})
                console.log('Updated: ' + JSON.stringify(messageObj))
            });

        });

        this.unsubscribeMethod = new jet.Method('msg/unsubscribe2');
        this.unsubscribeMethod.on('call', function (args) {
            console.log('Peer2: unsubscribeMethod method called..');
            currentConvo.unsubscribe();
        });

        this.fetchMessagesMethod = new jet.Method('msg/fetchMessages2');
        this.fetchMessagesMethod.on('call', function (args) {
            console.log('Peer2: fetchMessagesMethod method called..');
            //self.fetchMessages(args[0]);

            /*
            console.log('Directory: ' + JSON.stringify(kandy.state.get().messaging.conversations));
            var convoObj = kandy.state.get().messaging.conversations['oztemur@genband.com'].messages
            convoObj.forEach(function (message) {
                console.log(message.sender + ', ' + message.parts[0].text)
            })
            */
        });

        this.updateMessagesMethod = new jet.Method('msg/updateMessages2');
        this.updateMessagesMethod.on('call', function (args) {

            console.log('Peer2: updateMessagesMethod method called..');

            var messageObj = kandy.state.get().messaging.conversations['bkocak@genband.com'].messages[0]
            messageObj[args[0]] = args[1]
        });

        this.fileSendMethod = new jet.Method('call/fileSend2');
        this.fileSendMethod.on('call', function (args) {

            console.log('Peer2: fileSendMethod method called..');
            //construct an im object with values of to, type, msgText, charset,
            //then calling fcs.im.send function to send the IM
            //text = 'deneme'
            // Create the message object, passing in the text for the message.
            var file = document.getElementById("file-input").files[0];
            var message = currentConvo.createMessage({ type: 'file', file: file });

            // Send the message!
            message.sendMessage();
        });

        ///////////////////////////////////////////////////////////////////////////////////////
        /////////Add methods to peer
        ///////////////////////////////////////////////////////////////////////////////////////s
        this.peer.connect().then(function () {
            console.log('Peer1: connection to Daemon established');
            //console.log('Peer Daemon Info: ', this.peer.daemonInfo);
        });

        this.peer.add(this.loginMethod).then(function () {
            console.log('Peer: login method added')
        }).catch(function (err) {
            console.log('Peer: add login method failed', err);
        });

        this.peer.add(this.logoutMethod).then(function () {
            console.log('Peer: logout method added')
        }).catch(function (err) {
            console.log('Peer: add logout method failed', err);
        });

        this.peer.add(this.callMethod).then(function () {
            console.log('Peer: makeCall method added')
        }).catch(function (err) {
            console.log('Peer: add callmethod failed', err);
        });

        this.peer.add(this.answerMethod).then(function () {
            console.log('Peer: answerCall method added')
        }).catch(function (err) {
            console.log('Peer: add answerMethod failed', err);
        });

        this.peer.add(this.answerVideoMethod).then(function () {
            console.log('Peer: answerVideoMethod method added')
        }).catch(function (err) {
            console.log('Peer: add answerVideoMethod failed', err);
        });


        this.peer.add(this.endMethod).then(function () {
            console.log('Peer: end method added')
        }).catch(function (err) {
            console.log('Peer: add endMethod failed', err);
        });

        this.peer.add(this.holdMethod).then(function () {
            console.log('Peer: hold method added')
        }).catch(function (err) {
            console.log('Peer: add holdMethod failed', err);
        });

        this.peer.add(this.unholdMethod).then(function () {
            console.log('Peer: unhold method added')
        }).catch(function (err) {
            console.log('Peer: add unholdMethod failed', err);
        });

        this.peer.add(this.muteMethod).then(function () {
            console.log('Peer: mute method added')
        }).catch(function (err) {
            console.log('Peer: add muteMethod failed', err);
        });

        this.peer.add(this.unmuteMethod).then(function () {
            console.log('Peer: unmute method added')
        }).catch(function (err) {
            console.log('Peer: add unmuteMethod failed', err);
        });

        this.peer.add(this.videoStartMethod).then(function () {
            console.log('Peer: mute method added')
        }).catch(function (err) {
            console.log('Peer: add videoStartMethod failed', err);
        });

        this.peer.add(this.videoStopMethod).then(function () {
            console.log('Peer: unmute method added')
        }).catch(function (err) {
            console.log('Peer: add videoStopMethod failed', err);
        });

        this.peer.add(this.directTransferMethod).then(function () {
            console.log('Peer: mute method added')
        }).catch(function (err) {
            console.log('Peer: add directTransferMethod failed', err);
        });

        this.peer.add(this.consultativeTransferMethod).then(function () {
            console.log('Peer: unmute method added')
        }).catch(function (err) {
            console.log('Peer: add consultativeTransferMethod failed', err);
        });

        this.peer.add(this.imSendMethod).then(function () {
            console.log('Peer: imSendMethod method added')
        }).catch(function (err) {
            console.log('Peer: imSendMethod failed', err);
        });
        this.peer.add(this.fileSendMethod).then(function () {
            console.log('Peer: fileSendMethod method added')
        }).catch(function (err) {
            console.log('Peer: fileSendMethod failed', err);
        });


        this.peer.add(this.fetchConversationMethod).then(function () {
            console.log('Peer: fetchConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer: fetchConversationMethod failed', err);
        });

        this.peer.add(this.createGroupConversationMethod).then(function () {
            console.log('Peer: createGroupConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer: createGroupConversationMethod failed', err);
        });



        this.peer.add(this.createConversationMethod).then(function () {
            console.log('Peer: createConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer: createConversationMethod failed', err);
        });



        this.peer.add(this.clearConversationMethod).then(function () {
            console.log('Peer: clearConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer: clearConversationMethod failed', err);
        });

        this.peer.add(this.getMessagesMethod).then(function () {
            console.log('Peer: getMessagesMethod method added')
        }).catch(function (err) {
            console.log('Peer: getMessagesMethod failed', err);
        });

        this.peer.add(this.subscribeMethod).then(function () {
            console.log('Peer: subscribeMethod method added')
        }).catch(function (err) {
            console.log('Peer: subscribeMethod failed', err);
        });

        this.peer.add(this.unsubscribeMethod).then(function () {
            console.log('Peer: unsubscribeMethod method added')
        }).catch(function (err) {
            console.log('Peer: unsubscribeMethod failed', err);
        });

        this.peer.add(this.fetchMessagesMethod).then(function () {
            console.log('Peer: fetchMessagesMethod method added')
        }).catch(function (err) {
            console.log('Peer: fetchMessagesMethod failed', err);
        });

        this.peer.add(this.updateMessagesMethod).then(function () {
            console.log('Peer: updateMessagesMethod method added')
        }).catch(function (err) {
            console.log('Peer: updateMessagesMethod failed', err);
        });

    }

    login(args) {
        var self = this;
        kandy.connect({
            domainApiKey: '',
            username: args[0],
            password: args[1]
        });



        var updateCallList = function () {
            var currentUser = kandy.getUserInfo().username;
            //var selectList = document.getElementById(callListId);
            console.log('User: ' + currentUser)

            self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
                // console.log('peer1 sonuc:' + results[0].value.secondCall)
                // secondCall = results[0].value.secondCall
                transferSuccess = results[0].value.transferSuccess
                //  callId1 = results[0].value.callId
            });


            // Get active calls.
            var calls = kandy.getCalls().filter(function (call) {

                var id = '0'
                self.peer.set('call/#' + id, {
                    state_term: call.state
                })

                return call.state !== 'ENDED';
            });

            calls.forEach(function (call) {
                firstCallId = call.id;

                var id = '0'
                self.peer.set('call/#' + id, {
                    state_term: call.state
                })


            });

            /*
            if(transferSuccess){
                        self.peer.get({ path: { equals: 'call/#1' } }).then(function (results) {
                            firstCallId = results[0].value.callId
                        });
            }
            
            */

            /*
            if (call.to === 'ravci@genband.com' ) {
            firstCallId = call.id
            }
            
            else if (call.to === 'hguner@genband.com' ) {
            firstCallId = call.id
            }
            */
            /*
          // Empty the select list.
          for (var i = selectList.options.length; i >= 0; i--) {
              selectList.remove(i);
          }
          // Add active calls to the select list.
          calls.forEach(function (call) {
              var option = document.createElement('option');
              var participant = (call.to !== currentUser) ? call.to : call.from;
              option.text = participant + ' - ' + call.state;
              option.value = call.id;
              selectList.options.add(option);
          });
          */
        }
        kandy.on('call:started', updateCallList);
        kandy.on('call:incoming', updateCallList);
        kandy.on('call:joined', updateCallList);
        kandy.on('call:stateChange', updateCallList);
        kandy.on('call:error', this.onError);
        kandy.on('media:error', this.onMediaError);
        kandy.on('devices:retrieved', this.onDevices);

        kandy.on('auth:changed', function () {
            document.getElementById('auth-status').innerHTML = 'isConnected: ' + kandy.getConnection().isConnected;
            self.peer.set('login/#' + 0, {
                isConnected2: kandy.getConnection().isConnected
            })
        });
        kandy.on('auth:changed', function () {
            document.getElementById('auth-status').innerHTML = 'isConnected: ' + kandy.getConnection().isConnected;
            var id = '0'
            self.peer.set('login/#' + id, {
                isConnected2: kandy.getConnection().isConnected
            })
        });

        kandy.on('auth:error', function() {
            var id = '0'
            self.peer.set('login/#' + id, {
                isConnected1: kandy.getConnection().isConnected
            })
        });

        kandy.on('contacts:changed', function (data) {
            data.forEach(function (element) {
                console.log('addressbook data' + JSON.stringify(element))
                //console.log('work phone' + element.workPhone)
            });

        });

        kandy.on('contacts:error', function (data) {
            console.log('addressbook data' + data)
        });

        kandy.on('call:muted', function (data) {
            self.peer.set('login/#' + 0, {
                mute_term: 'muted'
            })
        });

        kandy.on('call:unmuted', function (data) {
            self.peer.set('login/#' + 0, {
                mute_term: 'unmuted'
            })
        });

        kandy.on('call:mediaChange', function (callId, mediaState) {
            console.log('media Changed')
            console.log('callId: ' + callId)
            console.log('mediaState: ' + mediaState)
            self.peer.set('call/#' + 0, {
                mediaState_term: mediaState
            })

        });

        kandy.on('call:incoming', function (callId) {
            console.log('incoming call with id' + callId)
            firstCallId = callId;
            self.peer.set('call/#' + 0, {
                call_term: 'incoming'
            })
        });

        kandy.on('messages:new', function () {
            console.log('Message received.')
            //            var currentUser = kandy.getUserInfo().username;
            var msgArray = currentConvo.getMessages()
            console.log('Full message array: ' + msgArray)

            // TODO mroe simple
            let id = '0'
            self.peer.set('msg/#' + id, {
                messages_term: msgArray
            })


        });

        kandy.on('conversations:new', function () {
            self.peer.set('msg/#' + 0, {
                conversation_term: true
            })

            console.log('Peer2: new conversation received.')
        });

    }

    logout() {
        kandy.disconnect();
    }

    makeCall(callee, options) {
        kandy.makeCall(callee, options);
    }

    answerCall() {

        var callId = firstCallId //self.getSelectedCall();
        var options = {
            isAudioEnabled: document.getElementById('isAudioEnabled').checked,
            isVideoEnabled: document.getElementById('isVideoEnabled').checked,
            sendInitialVideo: document.getElementById('sendInitialVideo').checked,
            sendScreenShare: document.getElementById('sendScreenShare').checked,
            localVideoContainer: document.getElementById('local-container'),
            remoteVideoContainer: document.getElementById('remote-container')
        };

        kandy.answerCall(callId, options);
        self.peer.set('call/#' + 0, {
            callId: callId
        })
    }

    answerVideoCall() {

        var callId = firstCallId //self.getSelectedCall();
        var options = {
            isAudioEnabled: document.getElementById('isAudioEnabled').checked,
            isVideoEnabled: document.getElementById('isVideoEnabled').checked,
            sendInitialVideo: true,
            sendScreenShare: document.getElementById('sendScreenShare').checked,
            localVideoContainer: document.getElementById('local-container'),
            remoteVideoContainer: document.getElementById('remote-container')
        };

        kandy.answerCall(callId, options);
        self.peer.set('call/#' + 0, {
            callId: callId
        })
    }

    getSelectedCall() {
        /*
        if(transferSuccess){
                    self.peer.get({ path: { equals: 'call/#1' } }).then(function (results) {
                        firstCallId = results[0].value.callId
                    });
        }
                    else {
                    self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
                        firstCallId = results[0].value.callId
        
                    });
                    }
        */

        return firstCallId;

        //var selectList = document.getElementById(callListId);
        //return selectList.options[selectList.selectedIndex].value;
    }

    // Advanced screenshare - Get media stream from extension (for Chrome).
    getMediaStreamId() {
        return new Promise(function (resolve, reject) {
            var extId = document.getElementById('extension-id').value;
            // Send our extension a message, asking for the media source id.
            window.chrome.runtime.sendMessage(extId, {
                message: 'chooseDesktopMedia'
            },
                function (response) {
                    if (response && response.mediaSourceId) {
                        resolve(response.mediaSourceId);
                    } else {
                        console.error('Could not get mediaSourceId.');
                        reject();
                    }
                });
        });
    }

    onError(callId, error) {
        var call = kandy.getCallById(callId);
        var currentUser = kandy.getUserInfo().username;
        var participant = (call.to !== currentUser) ? call.to : call.from;
        console.error('Error for call with ' + participant, error);
    }

    onMediaError(result) {
        // Magically know that 8 is FCS's screenshare warning.
        if (result.code === 8) {
            console.warn('Media initialized.' + result.message);
        } else {
            console.error('Media not initialized.' + result.message);
        }
    }

    // Assumed the UI has a <select> element of current devices.

    onDevices(devices) {

        function addDevice(device) {
            var deviceType = (device.kind === 'videoinput') ? 'camera' :
                (device.kind === 'audioinput') ? 'microphone' :
                    (device.kind === 'audiooutput') ? 'speaker' : 'unknown';

            var option = document.createElement('option');
            option.text = deviceType + ': ' + device.label;
            option.value = device.id;
            selectList.options.add(option);
        }

        var selectList = document.getElementById(deviceListId);
        // Empty the select list.
        for (var i = selectList.options.length; i >= 0; i--) {
            selectList.remove(i);
        }

        // Add all of the devices to the select list.
        var safeDevices = {
            camera: devices.camera || [],
            microphone: devices.microphone || [],
            speaker: devices.speaker || []
        };
        var deviceList = safeDevices.camera.concat(safeDevices.microphone).concat(safeDevices.speaker);
        deviceList.forEach(addDevice);
    }
    getSelectedDevice() {
        var selectList = document.getElementById(deviceListId);
        var option = selectList.options[selectList.selectedIndex];
        var type = option.text.split(':')[0];
        return {
            type: type,
            id: option.value
        };
    }

    /**
     * Call functions.
     */

    // Call Operations.

    ignoreCall() {
        var callId = firstCallId; //getSelectedCall();
        kandy.ignoreCall(callId);
    }

    rejectCall() {
        var callId = firstCallId; //getSelectedCall();
        kandy.rejectCall(callId);
    }

    endCall() {
        var callId = firstCallId //getSelectedCall();
        kandy.endCall(callId);
    }

    // Mid-Call Operations.

    muteCall() {
        var callId = firstCallId; //getSelectedCall();
        kandy.muteCall(callId);
    }

    unmuteCall() {
        var callId = firstCallId; //getSelectedCall();
        kandy.unMuteCall(callId);
    }

    holdCall() {
        var callId = firstCallId // this.getSelectedCall();
        kandy.holdCall(callId);
    }

    unholdCall(self) {
        var callId = firstCallId //this.getSelectedCall(self);
        //var callId2 = this.getSelectedCall(self);
        kandy.unHoldCall(callId);
    }

    startVideo() {
        var callId = firstCallId; //getSelectedCall();
        // TODO: Add resolution.
        kandy.startVideo(callId);
    }

    stopVideo() {
        var callId = this.firstCallId; //getSelectedCall();
        kandy.stopVideo(callId);
    }

    startScreenshare() {
        var callId = firstCallId; //getSelectedCall();
        getMediaStreamId()
            .then(function (mediaSourceId) {
                kandy.startScreenshare(callId, {
                    mediaSourceId: mediaSourceId
                });
            })
            .catch();
    }

    stopScreenshare() {
        var callId = firstCallId; //getSelectedCall();
        kandy.stopScreenshare(callId);
    }

    /*
        Join Call functionality. Intended UI usage:
            1. Select first call using 'Active Calls' select list.
            2. Click 'Select First Call' (step === 'select').
            3. Select second call using 'Active Calls' select list.
            4. Click 'Join Second Call' (step === 'join').
     */

    joinCall(step) {
        if (step === 'select') {
            callOne = firstCallId; //getSelectedCall();
        } else if (step === 'join') {
            var callTwo = firstCallId; //getSelectedCall();
            console.log('Joining callOne (' + callOne + ') to callTwo (' + callTwo + ').');
            kandy.joinCall(callOne, callTwo);
            callOne = undefined;
        }
    }

    sendDtmf() {
        var callId = firstCallId; //getSelectedCall();
        var tone = document.getElementById('dtmf-tone').value;

        if (tone !== '#') {
            tone = parseInt(tone);
            if (tone < 0 || tone > 9 || isNaN(tone)) {
                console.error('Invalid DTMF tone.');
                return;
            }
        }
        kandy.sendDTMF(callId, tone);
    }

    // Devices.

    getDevices() {
        kandy.getDevices();
    }

    selectDevice() {
        var device = getSelectedDevice();
        var defaultDevice = {};
        defaultDevice[device.type] = device.id;
        kandy.setDefaultDevices(defaultDevice);
    }

    changeSpeaker() {
        // No guarentee that the selected device is a speaker.
        var device = getSelectedDevice();
        kandy.changeSpeaker(device.id);
    }

    changeInputDevices() {
        var callId = firstCallId; //getSelectedCall();
        kandy.changeInputDevices(callId);
    }

    directTransfer(destination) {
        var callId = firstCallId; //getSelectedCall();
        // var destination = document.getElementById('transfer-to').value;
        kandy.directTransfer(callId, destination);
    }

    /**
     * Do consultative transfer as a two-step process, just like
     *      the join operation.
     */

    doConsultativeTransfer(step) {
        if (step === 'select') {
            transferCallOne = firstCallId; //getSelectedCall();
        } else if (step === 'transfer') {
            var destination = firstCallId; //getSelectedCall();
            console.log('Consul. transfering call (' + transferCallOne + ') to call (' + destination + '.');
            kandy.consultativeTransfer(transferCallOne, destination);
            transferCallOne = undefined;
        }
    }

    getConversation(userId, options = {}) {
        return kandy.getConversation(userId, options);
    }

    fetchConversations() {
        kandy.fetchConversations()
    }

}

module.exports = Peer_kandy2;
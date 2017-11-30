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
var secondCallId;
var deviceListId = 'devices';
var callOne;
var transferCallOne;
var currentConvo;

class Peer_kandy3 {
    constructor() {
        this.peer = new jet.Peer({
            url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
        });

        var self = this;


        this.loginMethod = new jet.Method('call/login3');
        this.loginMethod.on('call', function (args) {
            console.log('Peer3: login method called...');
            console.log('Login credentials..', args);

            self.login(args)

        });

        this.logoutMethod = new jet.Method('call/logout3');
        this.logoutMethod.on('call', function (args) {
            console.log('Peer3: logout method called..');
            self.logout()
        });

        this.callMethod = new jet.Method('call/makeCall3');
        this.callMethod.on('call', function (args) {
            console.log('Peer3: makeCall method started..');
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

        this.answerMethod = new jet.Method('call/answerCall3');
        this.answerMethod.on('call', function (args) {
            console.log('Peer3: answerCall method started..');
            self.answerCall(self)
        });

        this.endMethod = new jet.Method('call/end3');
        this.endMethod.on('call', function (args) {
            self.endCall()
            console.log("Peer3: call is ended!");
        });

        this.holdMethod = new jet.Method('call/hold3');
        this.holdMethod.on('call', function (args) {
            console.log('Peer3: hold method started..');
            self.holdCall()
        });

        this.unholdMethod = new jet.Method('call/unhold3');
        this.unholdMethod.on('call', function (args) {
            console.log('Peer3: unhold method started..');
            self.unholdCall()
        });

        this.muteMethod = new jet.Method('call/mute3');
        this.muteMethod.on('call', function (args) {
            self.muteCall()
            console.log('Peer3: mute method called..');
        });

        this.unmuteMethod = new jet.Method('call/unmute3');
        this.unmuteMethod.on('call', function (args) {
            console.log('Peer3: unmute method called..');
            self.unmuteCall()
        });

        this.videoStartMethod = new jet.Method('call/videoStart3');
        this.videoStartMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer3: videoStart method started..');

            //todo: normaly this was in another function called callAnswer
            self.startVideo(function () {
                self.showSuccessMessage("Call is videoStart!", self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!", self);
                });
        });

        this.videoStopMethod = new jet.Method('call/videoStop3');
        this.videoStopMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer3: videoStop method called..');

            //todo: normaly this was in another function called callAnswer
            self.stopVideo(function () {
                self.showSuccessMessage("Call is videoStop!", self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!", self);
                });
        });


        // MESSAGING
        this.fetchConversationMethod = new jet.Method('msg/fetchConversation3');
        this.fetchConversationMethod.on('call', function (args) {
            console.log('Peer3: fetchConversationMethod method called..');
            self.fetchConversations()
        });

        this.createGroupConversationMethod = new jet.Method('msg/createGroupConversation3');
        this.createGroupConversationMethod.on('call', function (args) {
            console.log('Peer3: createGroupConversationMethod method called..');
            self.createGroupConversation(args[0]) //name(string), options(object)
        });



        this.createConversationMethod = new jet.Method('msg/createConversation3');
        this.createConversationMethod.on('call', function (args) {
            console.log('Peer3: create/getConversation(currentConvo) method called..');
            currentConvo = self.getConversation(args[0])

            self.peer.call('msg/add', ['msg1'])
            self.peer.set('msg/#0', {
                conversation_term: true
            })
        });


        this.imSendMethod = new jet.Method('msg/imSend3');
        this.imSendMethod.on('call', function (args) {

            console.log('Peer3: imSendMethod method called..');
            var message = currentConvo.createMessage(args[0]);

            message.sendMessage();

        });

        this.clearConversationMethod = new jet.Method('msg/clearMessage3');
        this.clearConversationMethod.on('call', function (args) {
            console.log('Peer3: clearConversationMethod method called..');
            currentConvo.clear();

            let msgArray = currentConvo.getMessages()
            let id = '1'

            self.peer.set('msg/#' + id, {
                messages_term: msgArray
            })
        });

        this.getMessagesMethod = new jet.Method('msg/getMessages3');
        this.getMessagesMethod.on('call', function (args) {
            console.log('Peer3: getMessagesMethod method called..');
            var msgArray = currentConvo.getMessages();
            let id = '1'

            self.peer.set('msg/#' + id, {
                messages_term: msgArray
            })

            return msgArray
        });

        this.subscribeMethod = new jet.Method('msg/subscribe3');
        this.subscribeMethod.on('call', function (args) {
            console.log('Peer3: subscribeMethod method called..');

            currentConvo.subscribe(function (messageObj) {

                console.log('Updated: ' + JSON.stringify(messageObj))
            });

        });

        this.unsubscribeMethod = new jet.Method('msg/unsubscribe3');
        this.unsubscribeMethod.on('call', function (args) {
            console.log('Peer3: unsubscribeMethod method called..');
            currentConvo.unsubscribe();
        });

        this.fetchMessagesMethod = new jet.Method('msg/fetchMessages3');
        this.fetchMessagesMethod.on('call', function (args) {
            console.log('Peer3: fetchMessagesMethod method called..');
        });

        this.updateMessagesMethod = new jet.Method('msg/updateMessages3');
        this.updateMessagesMethod.on('call', function (args) {

            console.log('Peer3: updateMessagesMethod method called..');

            var messageObj = kandy.state.get().messaging.conversations['bkocak@genband.com'].messages[0]
            messageObj[args[0]] = args[1]
        });

        this.fileSendMethod = new jet.Method('call/fileSend3');
        this.fileSendMethod.on('call', function (args) {

            console.log('Peer3: fileSendMethod method called..');

            var file = document.getElementById("file-input").files[0];
            var message = currentConvo.createMessage({ type: 'file', file: file });

            message.sendMessage();
        });
        // MESSAGING!


        ///////////////////////////////////////////////////////////////////////////////////////
        /////////Add methods to peer
        ///////////////////////////////////////////////////////////////////////////////////////s
        this.peer.connect().then(function () {
            console.log('Peer3: connection to Daemon established');
        });

        this.peer.add(this.loginMethod).then(function () {
            console.log('Peer3: login method added')
        }).catch(function (err) {
            console.log('Peer3: add login method failed', err);
        });

        this.peer.add(this.logoutMethod).then(function () {
            console.log('Peer3: logout method added')
        }).catch(function (err) {
            console.log('Peer3: add logout method failed', err);
        });

        this.peer.add(this.callMethod).then(function () {
            console.log('Peer3: makeCall method added')
        }).catch(function (err) {
            console.log('Peer3: add callmethod failed', err);
        });

        this.peer.add(this.answerMethod).then(function () {
            console.log('Peer3: answerCall method added')
        }).catch(function (err) {
            console.log('Peer3: add answerMethod failed', err);
        });

        this.peer.add(this.endMethod).then(function () {
            console.log('Peer3: end method added')
        }).catch(function (err) {
            console.log('Peer3: add endMethod failed', err);
        });

        this.peer.add(this.holdMethod).then(function () {
            console.log('Peer3: hold method added')
        }).catch(function (err) {
            console.log('Peer3: add holdMethod failed', err);
        });

        this.peer.add(this.unholdMethod).then(function () {
            console.log('Peer3: unhold method added')
        }).catch(function (err) {
            console.log('Peer3: add unholdMethod failed', err);
        });

        this.peer.add(this.muteMethod).then(function () {
            console.log('Peer3: mute method added')
        }).catch(function (err) {
            console.log('Peer3: add muteMethod failed', err);
        });

        this.peer.add(this.unmuteMethod).then(function () {
            console.log('Peer3: unmute method added')
        }).catch(function (err) {
            console.log('Peer3: add unmuteMethod failed', err);
        });

        this.peer.add(this.videoStartMethod).then(function () {
            console.log('Peer3: mute method added')
        }).catch(function (err) {
            console.log('Peer3: add videoStartMethod failed', err);
        });

        this.peer.add(this.videoStopMethod).then(function () {
            console.log('Peer3: unmute method added')
        }).catch(function (err) {
            console.log('Peer3: add videoStopMethod failed', err);
        });


        // MESSAGING
        this.peer.add(this.imSendMethod).then(function () {
            console.log('Peer3: imSendMethod method added')
        }).catch(function (err) {
            console.log('Peer3: imSendMethod failed', err);
        });
        this.peer.add(this.fileSendMethod).then(function () {
            console.log('Peer3: fileSendMethod method added')
        }).catch(function (err) {
            console.log('Peer3: fileSendMethod failed', err);
        });


        this.peer.add(this.fetchConversationMethod).then(function () {
            console.log('Peer3: fetchConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer3: fetchConversationMethod failed', err);
        });

        this.peer.add(this.createGroupConversationMethod).then(function () {
            console.log('Peer3: createGroupConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer3: createGroupConversationMethod failed', err);
        });



        this.peer.add(this.createConversationMethod).then(function () {
            console.log('Peer3: createConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer3: createConversationMethod failed', err);
        });



        this.peer.add(this.clearConversationMethod).then(function () {
            console.log('Peer3: clearConversationMethod method added')
        }).catch(function (err) {
            console.log('Peer3: clearConversationMethod failed', err);
        });

        this.peer.add(this.getMessagesMethod).then(function () {
            console.log('Peer3: getMessagesMethod method added')
        }).catch(function (err) {
            console.log('Peer3: getMessagesMethod failed', err);
        });

        this.peer.add(this.subscribeMethod).then(function () {
            console.log('Peer3: subscribeMethod method added')
        }).catch(function (err) {
            console.log('Peer3: subscribeMethod failed', err);
        });

        this.peer.add(this.unsubscribeMethod).then(function () {
            console.log('Peer3: unsubscribeMethod method added')
        }).catch(function (err) {
            console.log('Peer3: unsubscribeMethod failed', err);
        });

        this.peer.add(this.fetchMessagesMethod).then(function () {
            console.log('Peer3: fetchMessagesMethod method added')
        }).catch(function (err) {
            console.log('Peer3: fetchMessagesMethod failed', err);
        });

        this.peer.add(this.updateMessagesMethod).then(function () {
            console.log('Peer3: updateMessagesMethod method added')
        }).catch(function (err) {
            console.log('Peer3: updateMessagesMethod failed', err);
        });
        // MESSAGING!
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
            console.log('User: ' + currentUser)

            var calls = kandy.getCalls().filter(function (call) {
                return call.state !== 'ENDED';
            });

            calls.forEach(function (call) {
                console.log(call.to)
                console.log(call.id)
                console.log(call.state)
            });

            calls.forEach(function (call) {
                firstCallId = call.id;

                var id = '1'
                self.peer.set('call/#' + id, {
                    state_term: call.state
                })
            });
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
                isConnected3: kandy.getConnection().isConnected
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
                mute_orig: 'muted'
            })
        });

        kandy.on('call:unmuted', function (data) {
            self.peer.set('login/#' + 0, {
                mute_orig: 'unmuted'
            })
        });


        kandy.on('call:mediaChange', function (callId, mediaState) {
            console.log('media Changed')
            console.log('callId: ' + callId)
            console.log('mediaState: ' + mediaState)
            self.peer.set('call/#' + 1, {
                mediaState_orig: mediaState
            })

        });


        kandy.on('addressbook:changed', function (data) {

            console.log('addressbook data' + data)
        });

        // MESSAGING
        kandy.on('messages:new', function () {
            console.log('Message received.')
            var msgArray = currentConvo.getMessages()
            console.log('Full message array: ' + msgArray)

            // TODO more simple
            self.peer.set('msg/#' + 1, {
                messages_term: msgArray
            })
        });

        kandy.on('conversations:new', function () {
            self.peer.set('msg/#' + 1, {
                conversation_term: true
            })

            console.log('Peer3: new conversation received.')
        });
        // MESSAGING!

    }

    logout() {
        kandy.disconnect();
    }

    makeCall(callee, options) {
        kandy.makeCall(callee, options);
    }

    answerCall(self) {
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

        var id = '1'
        self.peer.set('call/#' + id, {
            callId: callId
        })

    }


    getSelectedCall() {
        var selectList = document.getElementById(callListId);
        return selectList.options[selectList.selectedIndex].value;
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
        var callId = firstCallId; //getSelectedCall();
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
        var callId = firstCallId; //getSelectedCall();
        kandy.holdCall(callId);
    }

    unholdCall() {
        var callId = firstCallId; //getSelectedCall();
        kandy.unHoldCall(callId);
    }

    startVideo() {
        var callId = firstCallId; //getSelectedCall();
        // TODO: Add resolution.
        kandy.startVideo(callId);
    }

    stopVideo() {
        var callId = firstCallId; //getSelectedCall();
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

    doDirectTransfer() {
        var callId = firstCallId; //getSelectedCall();
        var destination = document.getElementById('transfer-to').value;
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

    // MESSAGING
    getConversation(userId, options = {}) {
        return kandy.getConversation(userId, options);
    }

    fetchConversations() {
        kandy.fetchConversations()
    }
    // MESSAGING!

}

module.exports = Peer_kandy3;
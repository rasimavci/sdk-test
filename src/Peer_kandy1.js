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



//const createKandy = require('kandy-js/dist/kandy/kandy.onprem')   
//const kandy = createKandy();

var jet = require('node-jet')

var firstCallId;
var secondCallId;
var deviceListId = 'devices';
var callOne;
var transferCallOne;
var currentConvo1;
var currentConvo1Exist = false;
var currentConvo2;
var currentConvo2Exist = false;
var participant1;
var participant2;

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



class Peer_kandy1 {
    constructor() {
        this.peer = new jet.Peer({
            url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
        });

        var self = this;



        this.loginMethod = new jet.Method('call/login1');
        this.loginMethod.on('call', function (args) {
            console.log('Peer: login method called...');
            console.log('Login credentials..', args);

            self.login(args)

        });

        this.logoutMethod = new jet.Method('call/logout1');
        this.logoutMethod.on('call', function (args) {
            console.log('Peer: logout method called..');

            self.logout()
        });

        this.callMethod = new jet.Method('call/makeCall1');
        this.callMethod.on('call', function (args) {

            var options = {

                isAudioEnabled: document.getElementById('isAudioEnabled').checked,
                isVideoEnabled: document.getElementById('isVideoEnabled').checked,
                sendInitialVideo: document.getElementById('sendInitialVideo').checked,
                sendScreenShare: document.getElementById('sendScreenShare').checked,
                localVideoContainer: document.getElementById('local-container'),
                remoteVideoContainer: document.getElementById('remote-container')
            };

            console.log('Peer: makeCall method started..');
            self.makeCall(args[0], options)
        });

        this.callMethod1a = new jet.Method('call/makeCall1a');
        this.callMethod1a.on('call', function (args) {
            var options = {

                isAudioEnabled: document.getElementById('isAudioEnabled').checked,
                isVideoEnabled: document.getElementById('isVideoEnabled').checked,
                sendInitialVideo: document.getElementById('sendInitialVideo').checked,
                sendScreenShare: document.getElementById('sendScreenShare').checked,
                localVideoContainer: document.getElementById('local-container'),
                remoteVideoContainer: document.getElementById('remote-container')
            };

            console.log('Peer: makeCall1a method started..');
            self.makeCall(args[0], options)
        });


        this.answerMethod = new jet.Method('call/answerCall1');
        this.answerMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: answerCall method started..');
            self.answerCall()
        });


        this.holdMethod = new jet.Method('call/hold1');
        this.holdMethod.on('call', function (args) {
            console.log('Peer: hold method started..');
            self.holdCall(1)
        });

        this.holdMethod1a = new jet.Method('call/hold1a');
        this.holdMethod1a.on('call', function (args) {
            //var self = this;
            console.log('Peer: hold1a method started..');
            self.holdCall(2)

        });

        this.unholdMethod = new jet.Method('call/unhold1');
        this.unholdMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: unhold method started..');
            self.unholdCall(1)
        });

        this.holdAfterTransferMethod = new jet.Method('call/holdAfterTransfer');
        this.holdAfterTransferMethod.on('call', function (args) {
            console.log('Peer: hold method started..');
            self.holdCallAfterTransfer(self)
        });

        this.unholdAfterTransferMethod = new jet.Method('call/unholdAfterTransfer');
        this.unholdAfterTransferMethod.on('call', function (args) {
            console.log('Peer: hold method started..');
            self.unholdCallAfterTransfer(self)
        });

        this.unholdMethod1a = new jet.Method('call/unhold1a');
        this.unholdMethod1a.on('call', function (args) {
            //var self = this;
            console.log('Peer: unhold method started..');

            self.unholdCall(2)
        });

        this.endMethod = new jet.Method('call/end1');
        this.endMethod.on('call', function (args) {
            self.endCall(1)
            console.log("Call is ended!");
        });

        this.endMethod1a = new jet.Method('call/end1a');
        this.endMethod1a.on('call', function (args) {
            self.endCall(2)
            console.log("Call is ended!");
        });

        this.rejectMethod = new jet.Method('call/reject1');
        this.rejectMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: reject method started..');

            //todo: normaly this was in another function called callAnswer
            self.rejectCall(function () {
                self.showSuccessMessage("Call is reject!", self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be rejected!", self);
                });
        });

        this.ignoreMethod = new jet.Method('call/ignore1');
        this.ignoreMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: ignore method started..');

            //todo: normaly this was in another function called callAnswer
            self.ignoreCall(function () {
                self.showSuccessMessage("Call is ignored!", self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be ignored!", self);
                });
        });

        this.videoStartMethod = new jet.Method('call/videoStart1');
        this.videoStartMethod.on('call', function (args) {
            console.log('Peer: videoStart method started..');
            self.startVideo(1)
        });

        this.videoStartMethod1a = new jet.Method('call/videoStart1a');
        this.videoStartMethod1a.on('call', function (args) {
            console.log('Peer: videoStart method started..');
            self.startVideo(2)
        });

        this.videoStopMethod = new jet.Method('call/videoStop1');
        this.videoStopMethod.on('call', function (args) {
            console.log('Peer1: videoStop method called..');
            self.stopVideo(1)
        });

        this.videoStopMethod1a = new jet.Method('call/videoStop1a');
        this.videoStopMethod1a.on('call', function (args) {
            console.log('Peer1: videoStop method called..');
            self.stopVideo(2)
        });

        this.setPresenceMethod = new jet.Method('call/setPresence1');
        this.setPresenceMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: presence state..');

            self.updatePresenceState(args[0],
                //Success callback
                function () {
                    self.showSuccessMessage("Presence state is set to " + args[0], self);
                },
                //Failure callback
                function () {
                    self.showErrorMessage("Presence state couldn't be changed!", self);
                }
            );
        });

        this.getAddrBookMethod = new jet.Method('call/getAddrBook1');
        this.getAddrBookMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: getAddrBook method called..');

            //self.refreshContacts()
            kandy.refreshContacts();
            //kandy.searchDirectory('rasim', 'FIRSTNAME')
            //var directoryObj = kandy.state.get().users.directory;

            //console.log(directoryObj)

        });

        this.addContactMethod = new jet.Method('call/addContact1');
        this.addContactMethod.on('call', function (args) {

            console.log('Peer1: getAddrBook method called..');
            self.addContact(args[0]);

        });
        this.deleteContactMethod = new jet.Method('call/deleteContact1');
        this.deleteContactMethod.on('call', function (args) {
            console.log('Peer1: getAddrBook method called..');
            self.removeContact(args[0]);

        });

        this.modifyContactMethod = new jet.Method('call/modifyContact1');
        this.modifyContactMethod.on('call', function (args) {
            console.log('Peer1: getAddrBook method called..');
            contactid = args[0]
            var entry = self.retrieveContactFormData(contactid);

            fcs.addressbook.modifyContact(entry['nickname'], entry,
                function () {
                    self.showSuccessMessage("Contact modify success", self);
                    //document.getElementById("btnGetAddressBook").click();
                },
                function () {
                    self.showErrorMessage("Contact modify Error", self);
                });

        });

        this.getVoiceMailsMethod = new jet.Method('call/getVoiceMails1');
        this.getVoiceMailsMethod.on('call', function (args) {

            console.log('Peer1: getVoiceMailsMethod method called..');
            self.fetchMwi()
            var voiceMails = kandy.getMwi();
            console.log('voicemails: ' + voiceMails[0])

        });

        this.getWebCollaborationHostUrlMethod = new jet.Method('call/getWebCollaborationHostUrl1');
        this.getWebCollaborationHostUrlMethod.on('call', function (args) {

            console.log('Peer1: getAddrBook method called..');
            self.getWebCollaborationHostUrl(function (result) {
                self.showSuccessMessage("getWebCollaborationHostUrl success.", self);
            }, function (e) {
                self.showErrorMessage("getWebCollaborationHostUrl failure: " + JSON.stringify(e), self);
            });
        });

        this.getVideoCollaborationHostUrlMethod = new jet.Method('call/getVideoCollaborationHostUrl1');
        this.getVideoCollaborationHostUrlMethod.on('call', function (args) {

            console.log('Peer1: getAddrBook method called..');
            self.getVideoCollaborationHostUrl(function (result) {
                self.showSuccessMessage("getVideoCollaborationHostUrl success.", self);
            }, function (e) {
                self.showErrorMessage("getVideoCollaborationHostUrl failure: " + JSON.stringify(e), self);
            });
        });

        ///////////////////////PWA/////////////////////////

        this.getAllowedListMethod = new jet.Method('call/getAllowedList1');
        this.getAllowedListMethod.on('call', function (args) {

            console.log('Peer1: getAllowedList method called..');
            fcs.presence.getAllowedList(function (list) {
                self.showSuccessMessage('getAllowedList success', self);
                // self.showInfoMessage(list);
            }, function () {
                console.error('Get allowed list error', self);
            });
        });

        this.getBannedListMethod = new jet.Method('call/getBannedList1');
        this.getBannedListMethod.on('call', function (args) {

            console.log('Peer1: getBannedList method called..');
            fcs.presence.getBannedList(function (list) {
                self.showSuccessMessage('getBannedListMethod success', self);
                //  self.showInfoMessage(list);
            }, function () {
                console.error('Get allowed list error', self);
            });
        });

        this.getShowOfflineListMethod = new jet.Method('call/getShowOfflineList1');
        this.getShowOfflineListMethod.on('call', function (args) {

            console.log('Peer1: getAllowedList method called..');
            fcs.presence.getShowOfflineList(function (list) {
                self.showSuccessMessage('getShowOfflineList success', self);
                //  self.showInfoMessage(list);
            }, function () {
                console.error('Get getShowOfflineList error', self);
            });
        });

        this.getPendingListMethod = new jet.Method('call/getPendingList1');
        this.getPendingListMethod.on('call', function (args) {

            console.log('Peer1: getPendingList method called..');
            fcs.presence.getPendingList(function (list) {
                self.showSuccessMessage('getPendingList success', self);
                //write list on console
                for (var i in list) {
                    if (list.hasOwnProperty(i)) {
                        var userName = list[i].email ? list[i].email : list[i].watcherAddress;
                        self.showInfoMessage(userName);
                    }
                }


            }, function () {
                console.error('getPendingList list error');
            });
        });
        ////////////////////////////
        this.getUserProfileDataMethod = new jet.Method('call/getUserProfileData1');
        this.getUserProfileDataMethod.on('call', function (args) {

            console.log('Peer1: getUserProfileData method called..');
            self.getUserProfileData(function (userProfileData) {
                self.showSuccessMessage('getUserProfileData', self);
                self.showInfoMessage(userProfileData);
                self.showInfoMessage(userProfileData.firstname);
                self.showInfoMessage(userProfileData.lastname);
                self.showInfoMessage(userProfileData.workPhone);
                self.showInfoMessage(userProfileData.emailAddress);
                self.showInfoMessage(userProfileData.assignedService);
            }, function (e) {
                self.showErrorMessage("getUserProfileData failure: " + JSON.stringify(e), self);
            });
        });

        ///////////////Transfer & Merge
        ////////////////////////////////////////////////////
        this.directTransferMethod = new jet.Method('call/directTransfer1');
        this.directTransferMethod.on('call', function (args) {
            console.log('Peer1: getUserProfileData method called..');
            self.directTransfer(args[0])
        });

        this.consultativeTransferMethod = new jet.Method('call/consultativeTransfer1');
        this.consultativeTransferMethod.on('call', function (args) {
            /*
                        self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
                            firstCallId = results[0].value.callId
                        });
            
                      self.peer.get({ path: { equals: 'call/#1' } }).then(function (results) {
                            secondCallId = results[0].value.callId
                        });
            */
            console.log('Peer1: consultativeTransfer method called..');
            self.consultativeTransfer(firstCallId, secondCallId)



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

        this.fetchConversationMethod = new jet.Method('msg/fetchConversation1');
        this.fetchConversationMethod.on('call', function (args) {
            console.log('Peer1: fetchConversationMethod method called..');
            self.fetchConversations()
        });

        this.createGroupConversationMethod = new jet.Method('msg/createGroupConversation1');
        this.createGroupConversationMethod.on('call', function (args) {
            console.log('Peer1: createGroupConversationMethod method called..');
            self.createGroupConversation(args[0]) //name(string), options(object)
        });

        this.createConversationMethod = new jet.Method('msg/createConversation1');
        this.createConversationMethod.on('call', function (args) {
            console.log('Peer1: create/getConversation(currentConvo1) method called..');
            if (args[1] === 1) {
                participant1 = args[0];
                currentConvo1 = self.getConversation(args[0])
                currentConvo1Exist = true
                var id = 0
            }
            else if (args[1] === 2) {
                participant2 = args[0];
                currentConvo2 = self.getConversation(args[0])
                var id = 1
                currentConvo2Exist = true
            }

            self.peer.call('msg/add', ['msg1'])
            self.peer.set('msg/#' + id, {
                conversation_orig: true
            })

        });

        this.imSendMethod = new jet.Method('msg/imSend1');
        this.imSendMethod.on('call', function (args) {

            console.log('Peer1: imSendMethod method called..');
            //construct an im object with values of to, type, msgText, charset,
            //then calling fcs.im.send function to send the IM
            //text = 'deneme'
            // Create the message object, passing in the text for the message.
            if (args[1] === 1) {
                var message = currentConvo1.createMessage(args[0])
            }

            else if (args[1] === 2) {
                var message = currentConvo2.createMessage(args[0])
            }
            // Send the message!
            message.sendMessage();

        });

        this.clearConversationMethod = new jet.Method('msg/clearMessage1');
        this.clearConversationMethod.on('call', function (args) {
            console.log('Peer1: clearConversationMethod method called..');
            var msgArray;
            var id;
            if (args[0] === 1) {
                currentConvo1.clear();
                msgArray = currentConvo1.getMessages()
                id = '0'
            }
            if (args[0] === 2) {
                currentConvo2.clear();
                msgArray = currentConvo2.getMessages()
                id = '1'
            }

            self.peer.set('msg/#' + id, {
                messages_orig: msgArray
            })
        });

        this.getMessagesMethod = new jet.Method('msg/getMessages1');
        this.getMessagesMethod.on('call', function (args) {
            console.log('Peer1: getMessagesMethod method called..');
            if (args[0] === 1) {
                return currentConvo1.getMessages(args[0]);
            }

            if (args[0] === 2) {
                return currentConvo2.getMessages(args[0]);
            }

        });

        this.subscribeMethod = new jet.Method('msg/subscribe1');
        this.subscribeMethod.on('call', function (args) {
            console.log('Peer1: subscribeMethod method called..');
            if (args[0] === 1) {
                currentConvo1.subscribe(function (messageObj) {
                    //console.log('Subscribe callback: ' + messageObj[0])
                    //  messageObj['oztemur@genband.com'].messages.forEach(function (message) {
                    //console.log(message.sender + ', ' + message.parts[0].text)
                    //})
                    console.log('Updated: ' + JSON.stringify(messageObj))
                });
            }

        });

        this.unsubscribeMethod = new jet.Method('msg/unsubscribe1');
        this.unsubscribeMethod.on('call', function (args) {
            console.log('Peer1: unsubscribeMethod method called..');
            currentConvo1.unsubscribe();
        });

        this.fetchMessagesMethod = new jet.Method('msg/fetchMessages1');
        this.fetchMessagesMethod.on('call', function (args) {
            console.log('Peer1: fetchMessagesMethod method called..');
            //self.fetchMessages(args[0]);

            /*
            console.log('Directory: ' + JSON.stringify(kandy.state.get().messaging.conversations));
            var convoObj = kandy.state.get().messaging.conversations['oztemur@genband.com'].messages
            convoObj.forEach(function (message) {
                console.log(message.sender + ', ' + message.parts[0].text)
            })
            */
        });

        this.updateMessagesMethod = new jet.Method('msg/updateMessages1');
        this.updateMessagesMethod.on('call', function (args) {

            console.log('Peer1: updateMessagesMethod method called..');

            var messageObj = kandy.state.get().messaging.conversations['oztemur@genband.com'].messages[0]
            messageObj[args[0]] = args[1]
        });

        this.fileSendMethod = new jet.Method('call/fileSend1');
        this.fileSendMethod.on('call', function (args) {

            console.log('Peer1: fileSendMethod method called..');
            //construct an im object with values of to, type, msgText, charset,
            //then calling fcs.im.send function to send the IM
            //text = 'deneme'
            // Create the message object, passing in the text for the message.
            var file = document.getElementById("file-input").files[0];
            var message = currentConvo1.createMessage({ type: 'file', file: file });

            // Send the message!
            message.sendMessage();
        });

        this.searchDirectoryMethod = new jet.Method('call/searchDirectory1');
        this.searchDirectoryMethod.on('call', function (args) {

            console.log('Peer1: searchDirectory method called..');
            let searchType = args[0];
            let criteria = args[1];

            kandy.searchDirectory(criteria, searchType)


        });

        this.sendDTMFMethod = new jet.Method('call/sendDTMF1');
        this.sendDTMFMethod.on('call', function (args) {

            console.log('Peer1: sendDTMF method called..');
            self.sendDtmf(args[0])
        });

        this.sendPWArequestMethod = new jet.Method('call/sendPWArequest1');
        this.sendPWArequestMethod.on('call', function (args) {
            console.log('Peer1: senPWArequest1 method called..');
            fcs.presence.watch(args[0], function () {
                self.showSuccessMessage("send PWA request1 is success!", self);
            },

                function () {
                    self.showErrorMessage("send PWA request1 is failed!", self);
                });
        });

        this.calllogRetrieveMethod = new jet.Method('call/calllogRetrieve1');
        this.calllogRetrieveMethod.on('call', function (args) {
            let startIndex = args[0];
            let count = args[1];
            var index, entry, id, address, duration, name, startTime, type;
            console.log('Peer1: calllogRetrieveMethod method called..');

            // call log retrieve of JSL API
            fcs.calllog.retrieve(function (entries) {
                self.showSuccessMessage("Calllog Retrieve is successful", self);

                for (index in entries) {
                    entry = entries[index];
                    // Getting values of a contact
                    id = entry.id;
                    address = entry.address;
                    duration = entry.duration;
                    name = entry.name;
                    startTime = entry.startTime;
                    type = entry.type;
                    self.showInfoMessage(index + ": " + id + ", " + address + ", " + duration + ", " + name + ", " + startTime + ", " + type);
                }
            },
                function () {
                    self.showErrorMessage("Calllog Retrieve is failed!", self);
                }, startIndex, count);

        });

        this.startScreenshareMethod = new jet.Method('call/startScreenshare1');
        this.startScreenshareMethod.on('call', function (args) {

            console.log('Peer1: startScreenshare method called..');
            self.startScreenshare()

        });

        this.stopScreenshareMethod = new jet.Method('call/stopScreenshare1');
        this.stopScreenshareMethod.on('call', function (args) {
            console.log('Peer1: stopScreenshare method called..');
            // call screenSharingStart of JSL API
            self.currentCall.screenSharingStart(
                function () { self.showSuccessMessage('Screensharing stop success', self); },
                function () { self.showErrorMessage('Failed to stop screenshare', self); }
            )
        });

        this.muteMethod = new jet.Method('call/mute1');
        this.muteMethod.on('call', function (args) {
            self.muteCall()
            console.log('Peer1: mute method called..');
        });

        this.unmuteMethod = new jet.Method('call/unmute1');
        this.unmuteMethod.on('call', function (args) {
            self.unmuteCall()
            console.log('Peer1: unmute method called..');
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

        this.peer.add(this.callMethod1a).then(function () {
            console.log('Peer: makeCall method added')
        }).catch(function (err) {
            console.log('Peer: add calmethod2a failed', err);
        });

        this.peer.add(this.answerMethod).then(function () {
            console.log('Peer: answerCall method added')
        }).catch(function (err) {
            console.log('Peer: add answerMethod failed', err);
        });

        this.peer.add(this.holdMethod).then(function () {
            console.log('Peer: hold method added')
        }).catch(function (err) {
            console.log('Peer: add holdMethod failed', err);
        });

        this.peer.add(this.holdMethod1a).then(function () {
            console.log('Peer: hold2a method added')
        }).catch(function (err) {
            console.log('Peer: add holdMethod1a failed', err);
        });

        this.peer.add(this.unholdMethod).then(function () {
            console.log('Peer: unhold method added')
        }).catch(function (err) {
            console.log('Peer: add unholdMethod failed', err);
        });

        this.peer.add(this.unholdMethod1a).then(function () {
            console.log('Peer: unhold method added')
        }).catch(function (err) {
            console.log('Peer: add holdMethod1a failed', err);
        });

        this.peer.add(this.holdAfterTransferMethod).then(function () {
            console.log('Peer: holdAfterTransferMethod method added')
        }).catch(function (err) {
            console.log('Peer: add holdAfterTransferMethod failed', err);
        });

        this.peer.add(this.unholdAfterTransferMethod).then(function () {
            console.log('Peer: unholdAfterTransferMethod method added')
        }).catch(function (err) {
            console.log('Peer: add unholdAfterTransferMethod failed', err);
        });


        this.peer.add(this.endMethod).then(function () {
            console.log('Peer: end method added')
        }).catch(function (err) {
            console.log('Peer: add end method failed', err);
        });

        this.peer.add(this.endMethod1a).then(function () {
            console.log('Peer: end method added')
        }).catch(function (err) {
            console.log('Peer: add end method1a failed', err);
        });

        this.peer.add(this.rejectMethod).then(function () {
            console.log('Peer: reject method added')
        }).catch(function (err) {
            console.log('Peer: reject method failed', err);
        });

        this.peer.add(this.ignoreMethod).then(function () {
            console.log('Peer: ignore method added')
        }).catch(function (err) {
            console.log('Peer: add ignoreMethod failed', err);
        });

        this.peer.add(this.videoStartMethod).then(function () {
            console.log('Peer: videoStart method added')
        }).catch(function (err) {
            console.log('Peer: add videoStartMethod method failed', err);
        });

        this.peer.add(this.videoStopMethod).then(function () {
            console.log('Peer: videoStop method added')
        }).catch(function (err) {
            console.log('Peer: add videostop method failed', err);
        });

        this.peer.add(this.setPresenceMethod).then(function () {
            console.log('Peer: setPresence method added')
        }).catch(function (err) {
            console.log('Peer: add set Presence method failed', err);
        });

        this.peer.add(this.getAddrBookMethod).then(function () {
            console.log('Peer: getAddrBook method added')
        }).catch(function (err) {
            console.log('Peer: add getAddrBook failed', err);
        });

        this.peer.add(this.addContactMethod).then(function () {
            console.log('Peer: addContact method added')
        }).catch(function (err) {
            console.log('Peer: add addContactMethod failed', err);
        });
        this.peer.add(this.deleteContactMethod).then(function () {
            console.log('Peer: deleteContact method added')
        }).catch(function (err) {
            console.log('Peer: add deleteContactMethod failed', err);
        });
        this.peer.add(this.modifyContactMethod).then(function () {
            console.log('Peer: modifyContact method added')
        }).catch(function (err) {
            console.log('Peer: add modifyContactMethod failed', err);
        });
        this.peer.add(this.getVoiceMailsMethod).then(function () {
            console.log('Peer: getVoiceMails method added')
        }).catch(function (err) {
            console.log('Peer: add getVoiceMailsMethod failed', err);
        });

        this.peer.add(this.getWebCollaborationHostUrlMethod).then(function () {
            console.log('Peer: GetWebCollaborationHostUrl method added')
        }).catch(function (err) {
            console.log('Peer: add getWebCollaborationHostUrlMethod failed', err);
        });
        this.peer.add(this.getVideoCollaborationHostUrlMethod).then(function () {
            console.log('Peer: GetVideoCollaborationHostUrl method added')
        }).catch(function (err) {
            console.log('Peer: add getVideoCollaborationHostUrlMethod failed', err);
        });

        this.peer.add(this.getAllowedListMethod).then(function () {
            console.log('Peer: getAllowedList method added')
        }).catch(function (err) {
            console.log('Peer: add getAllowedListMethod failed', err);
        });

        this.peer.add(this.getBannedListMethod).then(function () {
            console.log('Peer: getBannedList method added')
        }).catch(function (err) {
            console.log('Peer: add getBannedListMethod failed', err);
        });

        this.peer.add(this.getShowOfflineListMethod).then(function () {
            console.log('Peer: getShowOfflineList method added')
        }).catch(function (err) {
            console.log('Peer: add getShowOfflineListMethod failed', err);
        });
        this.peer.add(this.getPendingListMethod).then(function () {
            console.log('Peer: getPendingList method added')
        }).catch(function (err) {
            console.log('Peer: add getPendingListMethod failed', err);
        });

        this.peer.add(this.getUserProfileDataMethod).then(function () {
            console.log('Peer: getUserProfileData method added')
        }).catch(function (err) {
            console.log('Peer: add getUserProfileDataMethod failed', err);
        });

        this.peer.add(this.directTransferMethod).then(function () {
            console.log('Peer: directTransfer method added')
        }).catch(function (err) {
            console.log('Peer: add directTransferMethod failed', err);
        });

        this.peer.add(this.consultativeTransferMethod).then(function () {
            console.log('Peer: consultativeTransfer method added')
        }).catch(function (err) {
            console.log('Peer: add consultativeTransfer failed', err);
        });

        this.peer.add(this.conferenceCallMethod).then(function () {
            console.log('Peer: conferenceCallMethod method added')
        }).catch(function (err) {
            console.log('Peer: add conferenceCallMethod failed', err);
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



        this.peer.add(this.searchDirectoryMethod).then(function () {
            console.log('Peer: searchDirectoryMethod method added')
        }).catch(function (err) {
            console.log('Peer: add searchDirectoryMethod failed', err);
        });

        this.peer.add(this.sendDTMFMethod).then(function () {
            console.log('Peer: sendDTMFMethod method added')
        }).catch(function (err) {
            console.log('Peer: add sendDTMFMethod failed', err);
        });
        this.peer.add(this.sendPWArequestMethod).then(function () {
            console.log('Peer: sendPWArequest method added')
        }).catch(function (err) {
            console.log('Peer: add sendPWArequestMethod failed', err);
        });
        this.peer.add(this.calllogRetrieveMethod).then(function () {
            console.log('Peer: calllogRetrieveMethod method added')
        }).catch(function (err) {
            console.log('Peer: add calllogRetrieveMethod failed', err);
        });
        this.peer.add(this.startScreenshareMethod).then(function () {
            console.log('Peer: startScreenshare method added')
        }).catch(function (err) {
            console.log('Peer: add startScreenshareMethod failed', err);
        });
        this.peer.add(this.stopScreenshareMethod).then(function () {
            console.log('Peer: stopScreenshare method added')
        }).catch(function (err) {
            console.log('Peer: add stopScreenshareMethod failed', err);
        });
        this.peer.add(this.muteMethod).then(function () {
            console.log('Peer: mute method added')
        }).catch(function (err) {
            console.log('Peer: add mute method failed', err);
        });
        this.peer.add(this.unmuteMethod).then(function () {
            console.log('Peer: unmute method added')
        }).catch(function (err) {
            console.log('Peer: add unmute method failed', err);
        });

    }

    login(args) {
        var self = this;
        kandy.connect({
            domainApiKey: '',
            username: args[0],
            password: args[1]
        });

        var authenticationChanged = function () {
            console.log(kandy.getConnection().isConnected)

        }

        var id;
        var callId1;
        var callId2;
        var secondCall;
        var transferSuccess;


        var updateCallList = function () {

            //updateCallListself() {
            var currentUser = kandy.getUserInfo().username;
            //var selectList = document.getElementById(callListId);
            console.log('User: ' + currentUser)

            // Get active calls.
            var calls = kandy.getCalls().filter(function (call) {
                console.log('caller Name: ' + call.callerName)
                console.log('call id: ' + call.id)

                if (call.to === 'hguner@genband.com') {
                    firstCallId = call.id;
                    self.peer.set('call/#' + 0, {
                        state_orig: call.state
                    })
                }


                return call.state !== 'ENDED'; //'ON_HOLD'; 

            });


            /*
                        if (secondCall) {
                            self.peer.get({ path: { equals: 'call/#1' } }).then(function (results) {
                                callId2 = results[0].value.callId
                                secondCallId = results[0].value.callId
                            });
            
                        }
            */
            calls.forEach(function (call) {
                self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
                    // console.log('peer1 sonuc:' + results[0].value.secondCall)
                    secondCall = results[0].value.secondCall
                    transferSuccess = results[0].value.transferSuccess
                    // callId1 = results[0].value.callId
                });

                console.log(call.to)
                console.log(call.id)
                console.log(call.state)
            });


            calls.forEach(function (call) {


                if (call.to === 'hguner@genband.com') {
                    // if (secondCall && call.id === callId2) {

                    firstCallId = call.id;
                    self.peer.set('call/#' + 0, {
                        callId: call.id
                    })

                    self.peer.set('call/#' + 0, {
                        state_orig: call.state
                    })

                }
                /*
                                  if (transferSuccess) {
                                    self.peer.set('call/#' + 1, {
                                        state_orig: call.state
                                    })
                                }
                */
                //else { 
                //  if (call.id === secondCallId) {
                if (call.to === 'oztemur@genband.com') { //secondCall || 
                    self.peer.set('call/#' + 1, {
                        state_orig: call.state
                    })

                    secondCallId = call.id;
                    /*   
                       self.peer.set('call/#' + 1, {
                           callId: call.id
                       })
   */

                }


                /*
                if(call.to === 'hguner@genband.com'){
                secondCallId = call.id;
                console.log('new callercall id: ' + call.id)}
                */
                /*
                            self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
                                console.log('peer1 sonuc:' + results[0].value.secondCall)
                                var secondCall = results[0].value.secondCall
                
                                if (secondCall) {
                                    self.peer.get({ path: { equals: 'call/#1' } }).then(function (results) {
                                        callId2 = results[0].value.callId
                                    })                    
                
                                    if (callId2 === call.id) {
                                        id = '1'
                                    }       
                
                                }
                                else {
                                    id = '0'
                                }
                
                            });
                
                        self.peer.set('call/#' + id, {
                            state_orig: call.state
                        })
                
                            self.peer.set('call/#' + id, {
                            callId: call.id
                        })
                
                */
            });



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
        };

        //kandy.on('call:started', updateCallList);
        //kandy.on('call:incoming', updateCallList);
        kandy.on('call:joined', updateCallList);
        kandy.on('call:stateChange', updateCallList);
        kandy.on('call:error', this.onError);
        kandy.on('media:error', this.onMediaError);
        kandy.on('devices:retrieved', this.onDevices);
        //kandy.on('auth:changed',authenticationChanged)

        kandy.on('auth:changed', function () {
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

        kandy.on('directory:changed', function (data) {
            console.log('directory data' + data)
        });

        kandy.on('directory:error', function (data) {
            console.log('directory data' + data)
        });

        kandy.on('mwi:new', function (data) {
            console.log('directory data' + data)
        });

        kandy.on('call:muted', function (data) {
            self.peer.set('login/#' + 0, {
                mute_orig: 'muted'
            })
        });

        kandy.on('call:unmuted', function (data) {
            self.peer.set('call/#' + 0, {
                mute_orig: 'unmuted'
            })
        });

        var callId1;
        var secondCall;

        kandy.on('call:mediaChange', function (callId, mediaState) {
            console.log('media Changed')
            console.log('callId: ' + callId)
            console.log('mediaState: ' + mediaState)
            if (mediaState) {
                self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
                    //   console.log('peer1 sonuc:' + results[0].value.secondCall)
                    callId1 = results[0].value.callId
                    secondCall = results[0].value.secondCall
                });

                if (callId1 === callId) {
                    self.peer.set('call/#' + 0, {
                        mediaState_orig: mediaState
                    })
                }

                else if (secondCall === true) {
                    self.peer.set('call/#' + 1, {
                        mediaState_orig: mediaState
                    })
                }
            }
        });
        kandy.on('localVideo:change', function (displaying) {
            self.peer.set('call/#' + id, {
                localVideo_orig: displaying
            })
        });

        kandy.on('localVideo:error', function (kandyError) {
            console.log(kandyError)
            self.peer.set('call/#' + id, {
                localVideo_orig: kandyError

            })
        });

        kandy.on('call:incoming', function (callId) {
            console.log('incoming call with id' + callId)
            self.peer.set('call/#' + id, {
                call_orig: 'incoming'
            })
        });

        kandy.on('call:started', function (callId) {
            console.log('started call with id' + callId)
            self.peer.set('call/#' + id, {
                call_orig: 'started'
            })
        });

        kandy.on('messages:new', function () {
            console.log('Message received.')

            //var currentUser = kandy.getUserInfo().username;
            if (currentConvo1Exist) {
                let id = '0'
                // TODO make it more simple
                let msgArray = currentConvo1.getMessages()
                self.peer.set('msg/#' + id, {
                    messages_orig: msgArray
                })
            }

            if (currentConvo2Exist) {
                id = '1'
                // TODO make it more simple
                let msgArray2 = currentConvo2.getMessages()
                self.peer.set('msg/#' + id, {
                    messages_orig: msgArray2
                })
            }

        });
        kandy.on('conversations:new', function () {
            // let msgArray = currentConvo1.getMessages()
            if (currentConvo1Exist === false) {
                self.peer.set('msg/#0', {
                    conversation_orig: true
                })
                //currentConvo1Exist = true
            }
            else if (currentConvo2Exist === false) {
                self.peer.set('msg/#1', {
                    conversation_orig: true
                })
                //  currentConvo2Exist = true
            }

            console.log('Peer1: new conversation received.')
        });
        kandy.on('messages:cleared', function () {
            console.log('message cleared')
        });
        kandy.on('messages:error', function () {
            console.log('message error')
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
        /*
                if (document.getElementById('mediaSourceId').checked) {
                    // Answer call with screenshare, and provide the source id.
                    getMediaStreamId()
                        .then(function (sourceId) {
                            options.mediaSourceId = sourceId;
                            kandy.answerCall(callId, options);
                        })
                        .catch();
                } else {
                    // Just answer the call.
                    */
        kandy.answerCall(callId, options);

        //   }
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
        console.error('Error for call .. ' + error);
        var call = kandy.getCallById(callId);
        var currentUser = kandy.getUserInfo().username;
        var participant = 'call.to gives error !'
        //var participant = (call.to !== currentUser) ? call.to : call.from;
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

    endCall(callNo) {
        if (callNo === 1) {
            var callId = firstCallId; //getSelectedCall();
        }
        else {
            var callId = secondCallId; //getSelectedCall();
        }
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

    holdCall(callNo) {
        if (callNo === 1) {
            kandy.holdCall(firstCallId);
            //  var callId = firstCallId; //getSelectedCall();
        }
        else {
            kandy.holdCall(secondCallId);
            //  var callId = secondCallId; //getSelectedCall();
        }

    }


    unholdCall(callNo) {
        if (callNo === 1) {
            var callId = firstCallId; //getSelectedCall();
        }
        else {
            var callId = secondCallId; //getSelectedCall();
        }
        kandy.unHoldCall(callId);
    }


    holdCallAfterTransfer(self) {

        self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
            console.log('peer1 sonuc:' + results[0].value.callId)
            var callId = results[0].value.callId
            kandy.holdCall(callId);
        });


        //   var callId = self.secondCallId; //getSelectedCall();
        //kandy.holdCall(callId);
    }


    unholdCallAfterTransfer(self) {
        self.peer.get({ path: { equals: 'call/#0' } }).then(function (results) {
            console.log('sonuc:' + results[0].callId)
            var callId = results[0].callId
            kandy.unHoldCall(callId);
        });

        // var callId = secondCallId; //getSelectedCall();

    }

    startVideo(callNo) {
        if (callNo === 1) {
            var callId = firstCallId; //getSelectedCall();
        }
        else {
            var callId = secondCallId; //getSelectedCall();
        }
        // TODO: Add resolution.
        kandy.startVideo(callId);
    }

    stopVideo(callNo) {
        if (callNo === 1) {
            var callId = firstCallId; //getSelectedCall();
        }
        else {
            var callId = secondCallId; //getSelectedCall();
        }
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

    sendDtmf(tone) {
        var callId = firstCallId; //getSelectedCall();
        //var tone = document.getElementById('dtmf-tone').value;

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
        //var destination = document.getElementById('transfer-to').value;
        kandy.directTransfer(callId, destination);
    }

    /**
     * Do consultative transfer as a two-step process, just like
     *      the join operation.
     */

    consultativeTransfer(firstCallId, destination) {
        /*
        if (step === 'select') {
            transferCallOne = firstCallId; //getSelectedCall();
        } else if (step === 'transfer') {
            */
        var destination = firstCallId; //getSelectedCall();
        console.log('Consul. transfering call (' + transferCallOne + ') to call (' + destination + '.');
        kandy.consultativeTransfer(transferCallOne, destination);
        //  transferCallOne = undefined;
        // }
    }




    updatePresence(status, activity, note) {
        kandy.updatePresence(status, activity, note);
    }

    /**
     * Get (from state) the presence for the given user(s)
     *
     * @public
     * @memberof Presence
     * @requires presence
     * @method getPresence
     * @param  {string} users  A user id or an array of user ids.
     * @return An array of presence objects containing:
     *                  userId,
     *                  loading,
     *                  status,
     *                  activity,
     *                  and note.
     *        Or, if a userId was provided instead of an array, returns
     *        the corresponding presence object or `undefined`.
     */
    getPresence(users) {
        kandy.getPresence(users);
    }

    /**
     * Fetch (from the server) the presence for the given users.
     * This will update the store with the retrieved values, which can then
     * be accessed using `getPresence`.
     *
     * @public
     * @memberof Presence
     * @requires presence
     * @method fetchPresence
     * @param  {string} users  A user id or an array of user ids.
     */
    fetchPresence(users) {
        kandy.fetchPresence(users);
    }

    /**
     * Subscribe to the presence of the given user(s).
     *
     * @public
     * @memberof Presence
     * @requires presence
     * @method subscribePresence
     * @param  {string} users  A user id or an array of user ids.
     */
    subscribePresence(users) {
        kand.subscribePresence(users);
    }

    /**
     * Unsubscribe from the presence of the given user(s).
     *
     * @public
     * @memberof Presence
     * @requires presence
     * @method unsubscribePresence
     * @param  {string} users  A user id or an array of user ids.
     */
    unsubscribePresence(users) {
        kandy.unsubscribePresence(users);
    }

    /**
* Attempts to retrieve a list of conversations that the current user is a part of.
* These conversations can then be retrieved from the store using getConversations.
*
* @public
* @memberof Messaging
* @requires fetchConversations
* @method fetchConversations
*/
    fetchConversations() {
        kandy.fetchConversations();
    }

    /**
     * Create and return a conversation object. If successfull, the event 'conversations:new' will be emitted.
     * If a conversation with the given user already exists in the store, then no new one will be created.
     * If no conversation exists, then a new conversation will be created in the store.
     *
     * @public
     * @name getConversation
     * @memberof Messaging
     * @requires onlyInternalMessaging
     * @method getConversation
     * @param {string} userId The Id of user for whom to create the conversation.
     * @returns {Conversation} A Conversation object.
     */
    /**
     * Create and return a conversation object. If successfull, the event 'conversations:new' will be emitted.
     * If a conversation with the given user already exists in the store, then no new one will be created.
     * If no conversation exists, then a new conversation will be created in the store.
     *
     * @public
     * @name getConversation
     * @memberof Messaging
     * @requires internalAndSmsMessaging
     * @method getConversation
     * @param {string} userId The Id of user for whom to create the conversation.
     * @param {Object} [options] An options object for the conversation.
     * @param {string} [options.type = im] The type of conversation. Can be 'im' or 'sms'.
     * @returns {Conversation} A Conversation object.
     */
    getConversation(userId, options = {}) {

        return kandy.getConversation(userId, options);
    }
    /**
     * Returns a promise that resolves when the serverside group conversation
     * has been successfully created.
     * @public
     * @memberof Messaging
     * @requires groupMessaging
     * @method createGroupConversation
     * @param {string} name - A name for the group conversation.
     * @param {Object} [options] - Optional object
     * @param {Object} [options.image] - An image to represent the group.
     * @param {Array} [options.members] - An array containing a list of full user names as strings.
     * @returns {Promise} A promise object.
     */
    createGroupConversation(name, options) {
        // Dispatch an action for the saga to attempt to create a groupConversation server side.
        kandy.createGroupConversation(name, options, internalResolve)
    }

    /////////////////////////////////////////////////////////

    refreshContacts() {
        kandy.refreshContacts();
    }

    /**
     * Add a contact to a user's personal address book.
     *
     * @method addContact
     * @param {Object} contact The contact object.
     */
    addContact(contact) {
        kandy.addContact(contact);
    }
    /**
     * Remove a contact from a personal address book.
     *
     * @method removeContact
     * @param  {string} id The Id of the contact that will be removed.
     */
    removeContact(id) {
        kandy.removeContact(id);
    }

    /**
     * Update a contact from the user's personal address book.
     *
     * @method updateContact
     * @param  {string} id The id of the contact that will be updated.
     * @param  {Object} contact The contact object.
     */
    updateContact(id, contact) {
        kandy.updateContact(id, contact);
    }

    /**
     * Search the users in the directory.
     *
     * @method searchDirectory
     * @param  {string} criteria Search criteria.
     * @param  {string} type The type of criteria. Can be `FIRSTNAME`, `LASTNAME`, `NAME`, `PHONENUMBER` or `USERNAME`.
     */
    searchDirectory(criteria, type) {
        kandy.searchDirectory(criteria, type);
    }

    /**
     * Get user details from the server.
     *
     * @method fetchUser
     * @param  {string} userId The Id of the user to fetch.
     */
    fetchUser(userId) {
        kandy.cacheUser(userId);
    }

    /**
     * Get user from local state.
     *
     * @method getUser
     * @param  {string} userId The Id of the user to get.
     * @return {User} A User object for the requested user.
     */
    getUser(userId) {
        kandy.getUser({ userId });
    }

    /**
     * Get currently logged in user data from the local state.
     *
     * @method getSelf
     * @return {User} A User object for the currently logged in user.
     */
    getSelf() {
        kandy.getState();
    }



    /**
     * Fetches the list of call logs and stores them locally. The API
     * `getCallLogs` can then be used to get the logs from local state after
     * it has been updated.
     * @public
     * @memberof CallHistory
     * @requires callHistory
     * @method retrieveCallLogs
     * @param  {number} [amount=50] The number of records to retrieve.
     * @param  {number} [offset=0] Starting offset for records to retrieve.
     */
    retrieveCallLogs(amount = 50, offset = 0) {
        kandy.retrieveCallLogs(amount, offset);
    }

    /**
     * Deletes the specified call log.
     * @public
     * @memberof CallHistory
     * @requires callHistory
     * @method removeCallLog
     * @param  {number} recordId The ID of the call log to be removed.
     */
    removeCallLog(recordId) {
        kandy.removeCallLogs(recordId);
    }

    /**
     * Deletes all call logs.
     * @public
     * @memberof CallHistory
     * @requires callHistory
     * @method removeCallHistory
     */
    removeCallHistory() {
        kandy.removeCallLogs('all');
    }

    /**
     * Gets the list of call logs cached locally. The event
     * `callHistory:changed` is used to indicate the local state of logs
     * has been updated.
     * @public
     * @memberof CallHistory
     * @requires callHistory
     * @method getCallLogs
     * @example
     * kandy.on('callHistory:changed', function() {
     *     // Get all call logs when they've been updated.
     *     let callLogs = kandy.call.history.getCallLogs();
     * });
     * @returns {Array} A list of call log records, ordered by latest first.
     */

    getCallLogs() {
        kandy.getCallLogs();
    }
    /////////////////////////////////////////////////7
    /**
* Attempts to retrieve message waiting indicator information from the server.
* An `mwi:new` event is emitted upon completion.
*
* @public
* @requires mwi
* @memberof mwi
* @method fetchMwi
*/
    fetchMwi() {
        kandy.fetchMwi();
    }

    /**
     * Returns messages waiting indicator data from the store.
     *
     * @public
     * @requires mwi
     * @memberof mwi
     * @method getMwi
     */
    getMwi() {
        kandy.Mwi();
    }

    ////////////////////////////////////
    /**
     * Subscribe for a custom event.
     * @public
     * @requires customEvents
     * @memberof customEvents
     * @param  {string} eventType The custom event type to subscribe for.
     * @param  {Array}  subscribeUserList The list of users to subcribe to.
     * @param  {string} clientCorrelator
     * @param  {Array} [customParameters] List of custom options provided as part of the subscription.
     */
    subscribe(eventType, subscribeUserList, clientCorrelator, customParameters = []) {
        kandy.subscribe(eventType, subscribeUserList, clientCorrelator, customParameters);
    }

    /**
     * Update a subscription for a custom event.
     * @public
     * @requires customEvents
     * @memberof customEvents
     * @param  {string} eventType The custom event subscription to update.
     * @param  {Object} userLists
     * @param  {Array}  userLists.subscribeUserList The list of users to subcribe to.
     * @param  {Array}  userLists.unsubscribeUserList The list of users to unsubscribe from. If all users are unsubscribed from, the event subscription is removed completly.
     * @param  {Array} [customParameters] List of custom options provided as part of the subscription.
     */
    update(eventType, userLists, customParameters = []) {
        kandy.pdate(eventType, userLists, customParameters);
    }

    /**
     * Unsubscribe from a custom event.
     * @public
     * @requires customEvents
     * @memberof customEvents
     * @param  {string} eventType The custom event to unsubscribe from.
     */
    unsubscribe(eventType) {
        kandy.unsubscribe(eventType);
    }

    /**
     * Retrieve information about a specified custom event.
     * @public
     * @requires customEvents
     * @memberof customEvents
     * @param  {string} [eventType] Type of custom event to retrieve.
     * @return {Object} Returns all information related to the chosen eventType that is contained in the store. If no eventType is specified, it will return information for all eventTypes.
     */
    getInfo(eventType) {
        kandy.getInfo(geventType);
    }
    ///////////////////////////////////////////notifications///////////////////////////
    /**
         * Provides an external notification to Kandy for processing.
         *
         * @public
         * @requires externalNotifications
         * @memberof Notification
         * @method processNotification
         * @param {Object} notification
         * @param {string} [channel] - The channel that the notification came from.
         */
    processNotification(notification, channel) {
        kandy.processNotification(notification, channel);
    }

    /**
     * Registers a device token for push notifications.
     *
     * @public
     * @requires push
     * @memberof Notification
     * @method registerPushNotifications
     * @param {Object} params
     * @param {string} params.deviceToken - The device token to be registered.
     * @param {string} params.pushService - Push service to register for.
     * @param {string} [params.clientCorrelator] - Unique identifier for a client device.
     */
    registerPushNotifications(params) {
        kandy.registerPushNotifications(params)
    }

    /**
     * Deregisters for push notifications.
     *
     * @public
     * @requires push
     * @memberof Notification
     * @method deregisterPushNotifications
     */
    deregisterPushNotifications() {
        kandy.deregisterPushNotifications()
    }

    /**
     * Enables, or disables, the processing of websocket notifications.
     *
     * @public
     * @requires push
     * @memberof Notification
     * @method enableWebsocketNotifications
     * @param {boolean} enable - Whether the websocket channel should be enabled.
     */
    enableWebsocketNotifications(enable) {
        kandy.enableWebsocketNotifications(enable)
    }

}

module.exports = Peer_kandy1;
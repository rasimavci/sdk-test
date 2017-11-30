'use strict';



const fcs = require('kandy-js/dist/fcs/js/fcs')


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
    //currentCall = '',
    //currentCall2 = '';

var listOfPresenceStates = fcs.presence.State;

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


class Peer_fcs1 {
    constructor() {

        this.peer = new jet.Peer({
            // url: 'wss://217.78.109.178:8090'
            url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
        });

        var self = this;

        this.loginMethod = new jet.Method('todo/login1');
        this.loginMethod.on('call', function (args) {
            self.peer.set('todo/#0', {from: args[0]})
            console.log('Peer: login method called..');
            console.log('gelen bilgi..',args);
            self.login(args);
        });


        this.logoutMethod = new jet.Method('todo/logout1');
        this.logoutMethod.on('call', function (args) {
            console.log('Peer: logout method called..');
            self.logout()
        });

        this.callMethod = new jet.Method('todo/makeCall1');
        this.callMethod.on('call', function (args) {
            self.peer.set('todo/#0', {to: args[0]})
            console.log('Peer: makeCall method started..');
            self.makeCall(args[0], null, args[1], args[2])
            // self.makeCall(to, contact, isVideoEnabled, sendInitialVideo)
        });

        this.callMethod1a = new jet.Method('todo/makeCall1a');
        this.callMethod1a.on('call', function (args) {
            console.log('Peer: makeCall method started..');
            self.makeCall2(args[0], null, false, false)
            // self.makeCall(to, contact, isVideoEnabled, sendInitialVideo)
        });


        this.answerMethod = new jet.Method('todo/answerCall1');
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


        this.holdMethod = new jet.Method('todo/hold1');
        this.holdMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: hold method started..');
/*
callHold(self.currentCall, function () {
                self.showInfoMessage("Call is held!");
            },

                function () {
                    self.showErrorMessage("Call couldn't be held!");
                })
*/
            //todo: normaly this was in another function called callAnswer
            self.currentCall.hold(function () {
                self.showSuccessMessage("Call is held!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be held!",self);
                });
        });

        this.holdMethod1a = new jet.Method('todo/hold1a');
        this.holdMethod1a.on('call', function (args) {
            //var self = this;
            console.log('Peer: hold method started..');
            self.currentCall2.hold(function () {
                self.showSuccessMessage("Second Call is held!",self);
            },
                function () {
                    self.showErrorMessage("second Call couldn't be held!",self);
                });

        });

        this.unholdMethod = new jet.Method('todo/unhold1');
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

        this.unholdMethod1a = new jet.Method('todo/unhold1a');
        this.unholdMethod1a.on('call', function (args) {
            //var self = this;
            console.log('Peer: unhold method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall2.unhold(function () {
                self.showSuccessMessage("Call is unheld!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be unheld!",self);
                });
        });

        this.endMethod = new jet.Method('todo/end1');
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

        this.rejectMethod = new jet.Method('todo/reject1');
        this.rejectMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: reject method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.reject(function () {
                self.showSuccessMessage("Call is reject!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be rejected!",self);
                });
        });

        this.ignoreMethod = new jet.Method('todo/ignore1');
        this.ignoreMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: ignore method started..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.ignore(function () {
                self.showSuccessMessage("Call is ignored!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be ignored!",self);
                });
        });

        this.videoStartMethod = new jet.Method('todo/videoStart1');
        this.videoStartMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: videoStart method started..');
                var id = '0'
            self.peer.set('todo/#' + id, {
            localvideo_orig: true
        })

            //todo: normaly this was in another function called callAnswer
            self.currentCall.videoStart(function () {
                self.showSuccessMessage("Call is videoStart!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!",self);
                });
        });

        this.videoStopMethod = new jet.Method('todo/videoStop1');
        this.videoStopMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer1: videoStop method called..');

            //todo: normaly this was in another function called callAnswer
            self.currentCall.videoStop(function () {
                self.showSuccessMessage("Call is videoStop!",self);
            },

                function () {
                    self.showErrorMessage("Call couldn't be videoStart!",self);
                });
        });

////////////////////////////OUT OF CALL METHODS
///////////////////////////////////////////////////////////////////////////////
        this.setPresenceMethod = new jet.Method('todo/setPresence1');
        this.setPresenceMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: presence state..');

            self.updatePresenceState(args[0],
                //Success callback
                function () {
                    self.showSuccessMessage("Presence state is set to " + args[0],self);
                },
                //Failure callback
                function () {
                    self.showErrorMessage("Presence state couldn't be changed!",self);
                }
            );
        });

        this.getAddrBookMethod = new jet.Method('todo/getAddrBook1');
        this.getAddrBookMethod.on('call', function (args) {
            //var self = this;
            console.log('Peer: getAddrBook method called..');

            self.getAddressBook(function (addressBookList) {
                self.showSuccessMessage("Get device list success.",self);
                for (var i = 0; i < addressBookList.length; i++) {
                    self.showInfoMessage("Contact id: " + addressBookList[i].id + " ,Contact name: " + addressBookList[i].primaryContact);
                }

            }, function (e) {
                self.showErrorMessage("Get device list failure.",self);
            });

        });

        this.addContactMethod = new jet.Method('todo/addContact1');
        this.addContactMethod.on('call', function (args) {

            console.log('Peer1: getAddrBook method called..');
            self.addContact(args[0]);

        });
        this.deleteContactMethod = new jet.Method('todo/deleteContact1');
        this.deleteContactMethod.on('call', function (args) {
            console.log('Peer1: getAddrBook method called..');
            let contactid = args[0]
            var entry = self.retrieveContactFormData(contactid);

            fcs.addressbook.deleteContact(entry['nickname'],
                function () {
                    self.showSuccessMessage("Contact delete success",self);
                    //document.getElementById("btnGetAddressBook").click();
                },
                function () {
                    self.showErrorMessage("Contact delete Error",self);
                });

        });        

        this.modifyContactMethod = new jet.Method('todo/modifyContact1');
        this.modifyContactMethod.on('call', function (args) {
            console.log('Peer1: getAddrBook method called..');
            contactid = args[0]
            var entry = self.retrieveContactFormData(contactid);

            fcs.addressbook.modifyContact(entry['nickname'],entry,
                function () {
                    self.showSuccessMessage("Contact modify success",self);
                    //document.getElementById("btnGetAddressBook").click();
                },
                function () {
                    self.showErrorMessage("Contact modify Error",self);
                });

        }); 

        this.getVoiceMailsMethod = new jet.Method('todo/getVoiceMails1');
        this.getVoiceMailsMethod.on('call', function (args) {

            console.log('Peer1: getAddrBook method called..');

                    self.getVoiceMails(function(result) {
                        self.showSuccessMessage("getVoiceMails success.",self);
                self.showInfoMessage(JSON.stringify(result));
                        
                    }, function(e) {
                        self.showErrorMessage("getVoiceMails failure: " + JSON.stringify(e),self);
                    });


        });

        this.getWebCollaborationHostUrlMethod = new jet.Method('todo/getWebCollaborationHostUrl1');
        this.getWebCollaborationHostUrlMethod.on('call', function (args) {

            console.log('Peer1: getAddrBook method called..');
            self.getWebCollaborationHostUrl(function (result) {
                self.showSuccessMessage("getWebCollaborationHostUrl success.",self);
            }, function (e) {
                self.showErrorMessage("getWebCollaborationHostUrl failure: " + JSON.stringify(e),self);
            });
        });

        this.getVideoCollaborationHostUrlMethod = new jet.Method('todo/getVideoCollaborationHostUrl1');
        this.getVideoCollaborationHostUrlMethod.on('call', function (args) {

            console.log('Peer1: getAddrBook method called..');
            self.getVideoCollaborationHostUrl(function (result) {
                self.showSuccessMessage("getVideoCollaborationHostUrl success.",self);
            }, function (e) {
                self.showErrorMessage("getVideoCollaborationHostUrl failure: " + JSON.stringify(e),self);
            });
        });

///////////////////////PWA/////////////////////////

        this.getAllowedListMethod = new jet.Method('todo/getAllowedList1');
        this.getAllowedListMethod.on('call', function (args) {

            console.log('Peer1: getAllowedList method called..');
                fcs.presence.getAllowedList(function(list) {
                    self.showSuccessMessage('getAllowedList success',self);
                   // self.showInfoMessage(list);
                }, function() {
                    console.error('Get allowed list error',self);
                });
        });

        this.getBannedListMethod = new jet.Method('todo/getBannedList1');
        this.getBannedListMethod.on('call', function (args) {

            console.log('Peer1: getBannedList method called..');
                fcs.presence.getBannedList(function(list) {
                    self.showSuıccessMessage('getBannedListMethod success',self);
                  //  self.showInfoMessage(list);
                }, function() {
                    console.error('Get allowed list error',self);
                });
        });

        this.getShowOfflineListMethod = new jet.Method('todo/getShowOfflineList1');
        this.getShowOfflineListMethod.on('call', function (args) {

            console.log('Peer1: getAllowedList method called..');
                fcs.presence.getShowOfflineList(function(list) {
                    self.showSuccessMessage('getShowOfflineList success',self);
                  //  self.showInfoMessage(list);
                }, function() {
                    console.error('Get getShowOfflineList error',self);
                });
        });

        this.getPendingListMethod = new jet.Method('todo/getPendingList1');
        this.getPendingListMethod.on('call', function (args) {

            console.log('Peer1: getPendingList method called..');
                fcs.presence.getPendingList(function(list) {
                    self.showSuccessMessage('getPendingList success',self);
                    //write list on console
                for (var i in list) {
                    if (list.hasOwnProperty(i)) {
                        var userName = list[i].email ? list[i].email : list[i].watcherAddress;
                        self.showInfoMessage(userName);
                    }
                }


                }, function() {
                    console.error('getPendingList list error');
                });
        });
////////////////////////////
        this.getUserProfileDataMethod = new jet.Method('todo/getUserProfileData1');
        this.getUserProfileDataMethod.on('call', function (args) {

            console.log('Peer1: getUserProfileData method called..');
            self.getUserProfileData(function (userProfileData) {
                self.showSuccessMessage('getUserProfileData',self);
                self.showInfoMessage(userProfileData);
                self.showInfoMessage(userProfileData.firstname);
                self.showInfoMessage(userProfileData.lastname);
                self.showInfoMessage(userProfileData.workPhone);
                self.showInfoMessage(userProfileData.emailAddress);
                self.showInfoMessage(userProfileData.assignedService);
            }, function (e) {
                self.showErrorMessage("getUserProfileData failure: " + JSON.stringify(e),self);
            });
        });

///////////////Transfer & Merge
////////////////////////////////////////////////////
        this.directTransferMethod = new jet.Method('todo/directTransfer1');
        this.directTransferMethod.on('call', function (args) {

            console.log('Peer1: getUserProfileData method called..');
            self.currentCall.directTransfer(args[0],function () {
                self.showSuccessMessage("Blind transfer is success!",self);
            },

                function () {
                    self.showErrorMessage("Blind transfer is failed!",self);
                });
        });

        this.consultativeTransferMethod = new jet.Method('todo/consultativeTransfer1');
        this.consultativeTransferMethod.on('call', function (args) {

            console.log('Peer1: consultativeTransfer method called..');

                self.currentCall.consultativeTransfer(self.currentCall2.getId(), function() {
                        self.showSuccessMessage("consultative Transfered is successful",self);
                    },
                    function() {
                        self.showErrorMessage("consultative Transfer is failed!",self);
                    });
        });
 
        this.conferenceCallMethod = new jet.Method('todo/conferenceCall1');
        this.conferenceCallMethod.on('call', function (args) {

            console.log('Peer1: conference Call method called..');

            self.currentCall2.join(self.currentCall, function () {
                self.showSuccessMessage("conference call is successful",self);
            },
                function () {
                    self.showErrorMessage("conference Call is failed!",self);
                });
        });

        this.imSendMethod = new jet.Method('todo/imSend1');
        this.imSendMethod.on('call', function (args) {

            console.log('Peer1: imSendMethod method called..');
                //construct an im object with values of to, type, msgText, charset,
                //then calling fcs.im.send function to send the IM
                var im = new fcs.im.Message();
                im.primaryContact = args[0];
                im.msgText = args[1];
                im.charset = "UTF-8";
                im.type = "A2";

                // IM send function of JSL API
                fcs.im.send(im, function () {
                self.showSuccessMessage("send message is successful",self);
            },
                function () {
                    self.showErrorMessage("send message is failed!",self);
                });

        });

        this.searchDirectoryMethod = new jet.Method('todo/searchDirectory1');
        this.searchDirectoryMethod.on('call', function (args) {

            console.log('Peer1: imSendMethod method called..');
                // IM send function of JSL API
                let criteria = args[0];
                let searchType = args[1];
                fcs.addressbook.searchDirectory(criteria, searchType, function (entries) {
                self.showSuccessMessage("search directory is successful",self);
                                
                    for (index in entries) {
                    entry = entries[index];
                    // Getting values of a contact
                    primaryContact = entry.primaryContact;
                    firstName = entry.firstName;
                    lastName = entry.lastName;
                    emailAddress = entry.email;
                    workPhone = entry.workPhone;
      
      self.showInfoMessage(index + ": "  + primaryContact +", " + firstName +", " + lastName +", " + emailAddress +", " + workPhone);
                }

            },
                function () {
                    self.showErrorMessage("search directory is failed!",self);
                });

        });

        this.sendDTMFMethod = new jet.Method('todo/sendDTMF1');
        this.sendDTMFMethod.on('call', function (args) {

            console.log('Peer1: sendDTMF method called..');
            self.currentCall.sendDTMF(args[0],function () {
                self.showSuccessMessage("sendDTMF is success!",self);
            },

                function () {
                    self.showErrorMessage("sendDTMF is failed!",self);
                });
        });

        this.sendPWArequestMethod = new jet.Method('todo/sendPWArequest1');
        this.sendPWArequestMethod.on('call', function (args) {
            console.log('Peer1: senPWArequest1 method called..');
            fcs.presence.watch(args[0],function () {
                self.showSuccessMessage("send PWA request1 is success!",self);
            },

                function () {
                    self.showErrorMessage("send PWA request1 is failed!",self);
                });
        });

        this.calllogRetrieveMethod = new jet.Method('todo/calllogRetrieve1');
        this.calllogRetrieveMethod.on('call', function (args) {
                let startIndex = args[0];
                let count = args[1];
                var index, entry, id, address, duration, name, startTime, type;
            console.log('Peer1: calllogRetrieveMethod method called..');

                // call log retrieve of JSL API
                fcs.calllog.retrieve(function (entries) {
                self.showSuccessMessage("Calllog Retrieve is successful",self);

                                for (index in entries) {
                    entry = entries[index];
                    // Getting values of a contact
                    id = entry.id;
                    address = entry.address;
                    duration = entry.duration;
                    name = entry.name;
                    startTime = entry.startTime;
                    type = entry.type;
 self.showInfoMessage(index + ": "  + id +", " + address +", " + duration +", " + name +", " + startTime+", " + type);
                                }
            },
                function () {
                    self.showErrorMessage("Calllog Retrieve is failed!",self);
                },startIndex,count);

        });

        this.startScreenshareMethod = new jet.Method('todo/startScreenshare1');
        this.startScreenshareMethod.on('call', function (args) {

            console.log('Peer1: startScreenshare method called..');

            // call screenSharingStart of JSL API
            self.currentCall.screenSharingStart(
                function () { self.showSucessMessage('Screensharing started.',self); },
                function () { self.showErrorMessage('Failed to start screenshare',self); },
                function () { self.showInfoMessage('Screensharing stopped via browser UI.'); },
                null
            )
        });

        this.stopScreenshareMethod = new jet.Method('todo/stopScreenshare1');
        this.stopScreenshareMethod.on('call', function (args) {
            console.log('Peer1: stopScreenshare method called..');
            // call screenSharingStart of JSL API
            self.currentCall.screenSharingStart(
                function () { self.showSuccessMessage('Screensharing stop success',self); },
                function () { self.showErrorMessage('Failed to stop screenshare',self); }
            )
        });

        this.muteMethod = new jet.Method('todo/mute1');
        this.muteMethod.on('call', function (args) {
            console.log('Peer1: mute method called..');
            // call screenSharingStart of JSL API
            self.currentCall.mute(
                function () { self.showSuccessMessage('Call is muted!',self); },
                function () { self.showErrorMessage('Call Failed to mute!',self); }
            )
        });

        this.unmuteMethod = new jet.Method('todo/unmute1');
        this.unmuteMethod.on('call', function (args) {
            console.log('Peer1: unmute method called..');
            // call screenSharingStart of JSL API
            self.currentCall.unmute(
                function () { self.showSuccessMessage('Call is unmuted!',self); },
                function () { self.showErrorMessage('Call Failed to unmute!',self); }
            )
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
            console.log('Peer: makeCall1a method added')
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
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.holdMethod1a).then(function () {
            console.log('Peer: hold2a method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.unholdMethod).then(function () {
            console.log('Peer: unhold method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.unholdMethod1a).then(function () {
            console.log('Peer: unhold method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });


        this.peer.add(this.endMethod).then(function () {
            console.log('Peer: end method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.rejectMethod).then(function () {
            console.log('Peer: end method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.ignoreMethod).then(function () {
            console.log('Peer: end method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.videoStartMethod).then(function () {
            console.log('Peer: videoStart method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.videoStopMethod).then(function () {
            console.log('Peer: videoStop method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.setPresenceMethod).then(function () {
            console.log('Peer: setPresence method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.getAddrBookMethod).then(function () {
            console.log('Peer: getAddrBook method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.addContactMethod).then(function () {
            console.log('Peer: addContact method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });
        this.peer.add(this.deleteContactMethod).then(function () {
            console.log('Peer: deleteContact method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });
        this.peer.add(this.modifyContactMethod).then(function () {
            console.log('Peer: modifyContact method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });
        this.peer.add(this.getVoiceMailsMethod).then(function () {
            console.log('Peer: getVoiceMails method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.getWebCollaborationHostUrlMethod).then(function () {
            console.log('Peer: GetWebCollaborationHostUrl method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });
        this.peer.add(this.getVideoCollaborationHostUrlMethod).then(function () {
            console.log('Peer: GetVideoCollaborationHostUrl method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });       
        
        this.peer.add(this.getAllowedListMethod).then(function () {
            console.log('Peer: getAllowedList method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.getBannedListMethod).then(function () {
            console.log('Peer: getBannedList method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });

        this.peer.add(this.getShowOfflineListMethod).then(function () {
            console.log('Peer: getShowOfflineList method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });
        this.peer.add(this.getPendingListMethod).then(function () {
            console.log('Peer: getPendingList method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 

        this.peer.add(this.getUserProfileDataMethod).then(function () {
            console.log('Peer: getUserProfileData method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 

        this.peer.add(this.directTransferMethod).then(function () {
            console.log('Peer: directTransfer method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 

        this.peer.add(this.consultativeTransferMethod).then(function () {
            console.log('Peer: consultativeTransfer method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 

        this.peer.add(this.conferenceCallMethod).then(function () {
            console.log('Peer: conferenceCallMethod method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 
        this.peer.add(this.imSendMethod).then(function () {
            console.log('Peer: imSendMethod method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 

        this.peer.add(this.searchDirectoryMethod).then(function () {
            console.log('Peer: searchDirectoryMethod method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 

        this.peer.add(this.sendDTMFMethod).then(function () {
            console.log('Peer: sendDTMFMethod method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  }); 
        this.peer.add(this.sendPWArequestMethod).then(function () {
            console.log('Peer: sendPWArequest method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });         
        this.peer.add(this.calllogRetrieveMethod).then(function () {
            console.log('Peer: calllogRetrieveMethod method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });     
        this.peer.add(this.startScreenshareMethod).then(function () {
            console.log('Peer: startScreenshare method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });         
        this.peer.add(this.stopScreenshareMethod).then(function () {
            console.log('Peer: stopScreenshare method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });    
        this.peer.add(this.muteMethod).then(function () {
            console.log('Peer: mute method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });         
        this.peer.add(this.unmuteMethod).then(function () {
            console.log('Peer: unmute method added')
        }).catch(function (err) {
    console.log('Peer: add todo failed', err);
  });          

    }

//Functions inside class
    getUserProfileData(onSuccess, onFailure) {
                fcs.userprofile.retrieve(onSuccess, onFailure);
            }

    getWebCollaborationHostUrl(onSuccess, onFailure) {
        fcs.collaboration.retrieveWebCollaborationHostUrl(onSuccess, onFailure);
    }

    getVideoCollaborationHostUrl(onSuccess, onFailure) {
        fcs.collaboration.retrieveVideoCollaborationHostUrl(onSuccess, onFailure);
    }


    getVoiceMails(onSuccess, onFailure) {
        fcs.mwi.retrieveVoiceMails(onSuccess, onFailure);
    }



    getAddressBook(onSuccess, onFailure) {
        fcs.addressbook.retrieve(onSuccess, onFailure);
    }


            retrieveContactFormData(contactid) {
                var entry = {};
                entry['entryId'] = 1;
                entry['nickname'] = 'mahmut' //contactid //document.getElementById('get-contactid').value
                entry['primaryContact'] = contactid //document.getElementById('get-contactid').value //$("get-contactid").val();
                entry['firstName'] = contactid.split("@") //$("get-contactid").val();
                entry['lastName'] = 'mahmut' //$("get-contactid").val();
                entry['photoUrl'] = '' //$("#photoUrl").val();
                entry['emailAddress'] = contactid //$("#emailAddress").val();
                entry['homePhone'] = '' //$("#homePhone").val();
                entry['mobilePhone'] = '' //$("#mobilePhone").val();
                entry['workPhone'] = '11111' //$("#workPhone").val();
                entry['friendStatus'] = false //document.getElementById("friendStatus").checked;
                entry['conferenceURL'] = '' //$("#conferenceURL").val();
                entry['fax'] = '' //$("#fax").val();
                entry['groupList'] = '' //[{
                    //"groupName": $("#groupList").val()
                //}];
                entry['pager'] = '' //$("#pager").val();


                return entry;
            }  

    addContact(contactid) {
        var self = this;
        var entry = self.retrieveContactFormData(contactid);

        fcs.addressbook.addContact(entry,
            function () {
                self.showSuccessMessage("Contact added",self);
                //document.getElementById("btnGetAddressBook").click();
            },
            function () {
                self.showErrorMessage("Contact add Error",self);
            });
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
            presence_orig: presences[state]
        })
        /*
        self.peer.set('todo/#' + 1, {
            presence_orig: presences[state]
        })
        */
    }


    login(id) {

        var self = this;

        console.log('Login process started for user:')
        // clear the device list
        //$("#deviceListID").empty();

        // start logging
        //              fcs.logManager.initLogging(jslLogHandler, true);

        // Getting configuration paramaters from configuration form
        // No field validation is performed in this demo, but
        // highly recommended in real life applications
        username = id[0]//'ravci@genband.com' //id //$("#confUsername").val();
        password = id[1]//'yjke9884' //$("#confPassword").val();
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
            websocketProtocol: websocketProtocols
           // videoContainer: document.getElementsByClassName('defaultVideoContainer')
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
                self.onMediaStateChange(mediaState, self);
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
        };

var onIMReceived = function(msg){
                self.showInfoMessage("IM Received from: " + msg.primaryContact + ' - message: ' + msg.msgText);
};

        var onPresenceReceived = function (presence) {

            
            var self = this;
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
        };

        var callHold = function (call, onHold, onFailure){
    Call.hold(onHold, onFailure);
};     

var onMWIReceived = function(data) {
                self.showInfoMessage("MWI notification has come: " + JSON.stringify(data));
            ;}


        fcs.logManager.initLogging(self.jslLogHandler, true);

        fcs.notification.start(
            //Success callback
            function () {
                self.showSuccessMessage("You are logged in successfully!",self)
                console.log("Notification connection is established successfully!");
                // This example registers itself to Call notifications.
                // fcs.call.onReceived listens incoming calls in JSL API level
                fcs.call.onReceived = onCallReceived;
                fcs.im.onReceived = onIMReceived;
                fcs.presence.onReceived = onPresenceReceived;
                fcs.mwi.onReceived = onMWIReceived;
            },
            // Failure callbackf
            function () {
                self.showErrorMessage("Notification error occurred! Notification subsystem couldn't be started!",self);
                // Logout user
                logout();
            }
        );
console.log('Login process finished for user:' + id)
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
                //self.showSuccessMessage("You unsubscribed successfully!",self);
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
            state_orig: states[state]
        })
/*
        self.peer.set('todo/#' + 1, {
            state_orig: states[state]
        })
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

onStateChange2(call, state, self) {

        self.peer.set('todo/#' + '1', {
            state_orig: states[state]
        })

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
            mediaState_orig: mediaStates[mediaState]
        })
/*
        self.peer.set('todo/#' + 1, {
            mediaState_orig: mediaStates[mediaState]
        })
*/
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

    onMediaStateChange2(mediaState, self) {

        var id = '1'
        self.peer.set('todo/#' + id, {
            mediaState_orig: mediaStates[mediaState]
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

    showInfoMessage(message) {
        console.log(message)
    }

    showErrorMessage(message,self) {
        console.log(message)
                var id = '0'
        self.peer.set('todo/#' + id, {
            result: 'error'
        })
    }

    showSuccessMessage(message,self) {
        console.log(message)
                var id = '0'
        self.peer.set('todo/#' + id, {
            result: 'sucess'
        })
    }


    showWarningMessage(message) {
        console.log(message)
    }

    makeCall1(id, to) {
        self.peer.call('todo/add', [to])

        makeCall(to, contact, isVideoEnabled, sendInitialVideo)



        //    this.setTodoCompleted(todo.value.id, !todo.value.completed)
        // Just 
        /*
        self.peer.set('todo/#' + 0, {
            state_orig: 'OUTGOING'
        })
*/
        console.log('Make call to ' + to)
    
    }

    makeCall(to, contact, isVideoEnabled, sendInitialVideo) {
        var self = this;
        self.peer.set('todo/#0', {
            state_orig: 'OUTGOING'
        })




        fcs.call.startCall(username, contact, to,
            //onSuccess callback
            function (outgoingCall) {
                self.showSuccessMessage("A new call is successful!",self);
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
let id = 0;
        self.peer.set('todo/#' + id, {
            result2: 'successCall'
        })
                        
            },
            //onFailure callback
            function () {
                self.showErrorMessage("Call is failed!",self);
            },
            isVideoEnabled /*isVideoEnabled*/,
            sendInitialVideo /*sendInitialVideo*/,
            null,
            { isAudioEnabled: true }
        );
    }

//second call on same client
    makeCall2(to, contact, isVideoEnabled, sendInitialVideo) {

var self = this;
        fcs.call.startCall(username, contact, to,
            //onSuccess callback
            function (outgoingCall) {
                self.showSuccessMessage("A new call is successful!",self);
                // Assigning call object to currentCall variable to use in the application
                self.currentCall2 = outgoingCall;

                //This function listens call state changes in JSL API level
                outgoingCall.onStateChange = function (state, statusCode, reasonText, data) {
                    outgoingCall.statusCode = statusCode;
                    outgoingCall.reasonText = reasonText;
                    outgoingCall.localStatusCode = data.localStatusCode;
                    outgoingCall.localReasonText = data.localReasonText;
                    self.onStateChange2(outgoingCall, state, self);
                };

                outgoingCall.onMediaStateChange = function (mediaState) {
                    self.onMediaStateChange2(mediaState, self);
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
                self.showErrorMessage("Call is failed!",self);
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

        /*
        this.peer.set('todo/#' + id, {
            state_term: 'IN_CALL'
        })
*/
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


module.exports = Peer_fcs1;
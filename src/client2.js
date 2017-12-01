//import test from 'ava';

const Call = require('./Peer_kandy2');
var peer1 = new Call();

var view;
var loginId;

//peer2 = new Call2();
//var call, term;
//call = new Call();

//var term = new Call();

//call.test();
//call.makeCall(0,'call1');
//term.answerCall(0);

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

var jet = require('node-jet')
var peerClient2 = new jet.Peer({
  ///url: 'wss://47.168.247.41:8090'
  url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
})

//peer.connect()
/*
peerClient2.call('call/add', ['call1']).then(function(result) {
    console.log('Instructor: call add method success', result);
}).catch(function(err) {
    console.log('Instructor: could not call add method', err);
});
*/

var setState = function (id, state) {
  peerClient2.set('call/#' + id, {
    state_term: state
  })

}

var setCallCompleted = function (id, completed) {
  peerClient2.set('call/#' + id, {
    completed: completed
  })
}

var chatObj = document.getElementsByClassName('chatField')[0];
//############ MESSAGE ############//
var msgObj = new jet.Fetcher()
  .path('startsWith', 'msg/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', function (msgObj) {

    //renderMessages(msgObj)

    var msgArray = msgObj[0].value.messages_term;
    var l = msgArray.length
    //msg.innerHTML = 'sender' + ': <br><i>' + msgObj[0].value.messages[msgArray.length - 1] + '</i>';
    if (msgArray) {
      chatObj.innerHTML = ''
      msgArray.forEach(function (msg) {

      var url = msg.parts[0].url;
        var msgLabel = document.createElement('label');
        msgLabel.className = 'chatMessage' + (loginId == msg.sender ? '1' : '2');

      if(url){
      accessToken = kandy.getUserInfo().token;

      // Append the access token to the end of the url.
      // This ensures our request for the file is authenticated.
      url = url + accessToken;
      msgLabel.innerHTML = '<i>' + msg.sender + '</i><br>' + url
    }  
else {
        msgLabel.innerHTML = '<i>' + msg.sender + '</i><br>' + msg.parts[0].text
}
        chatObj.appendChild(msgLabel);
      })
    }

  })

peerClient2.fetch(msgObj)


var callObj = new jet.Fetcher()
  .path('startsWith', 'call/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', function (callObj) {
    //var id = callObj[0].value.state_orig;
    var id = 0

    renderCalls(callObj)

    console.log('New Value: ' + callObj[0].value.presence_orig)

  })
peerClient2.fetch(callObj)

var renderCall = function (call) {
  var container = document.createElement('li')
  if (call.value.completed) {
    container.className = 'completed'
  }

  // ----------------- PEER#1 ----------------------
  view = document.createElement('div')
  view.className = 'peer-first'
  var toggleCompleted = document.createElement('input')
  toggleCompleted.type = 'checkbox'
  toggleCompleted.className = 'toggle'
  toggleCompleted.checked = call.value.completed
  toggleCompleted.addEventListener('change', function () {
    self.setCallCompleted(call.value.id, !call.value.completed)
  })

  var call_orig = document.createElement('label')
  var toggleState1 = document.createElement('label')
  var toggleState2 = document.createElement('label')
  var localvideo = document.createElement('label')
  var remotevideo = document.createElement('label')
  var mediaState_orig = document.createElement('label')
  var presence_orig = document.createElement('label')
  var result = document.createElement('label')


  call_orig.innerHTML = 'Call: ' + call.value.call_orig
  toggleState1.innerHTML = 'Call State: ' + call.value.state_orig
  localvideo.innerHTML = 'Local Video: ' + call.value.localvideo_orig
  remotevideo.innerHTML = 'Remote Video: ' + call.value.remotevideo_orig
  mediaState_orig.innerHTML = 'Media State: ' + call.value.mediaState_orig
  presence_orig.innerHTML = 'Presence: ' + call.value.presence_orig
  result.innerHTML = 'result: ' + call.value.result
  //toggleState2.innerHTML = 'term:' + call.value.state_term
  var to = document.createElement('label')
  to.innerHTML = call.value.to

  var title = document.createElement('label')
  title.innerHTML = 'orig'

  view.appendChild(title)
  view.appendChild(to)
  view.appendChild(call_orig)
  view.appendChild(toggleCompleted)
  view.appendChild(toggleState1)
  view.appendChild(mediaState_orig)
  view.appendChild(localvideo)
  view.appendChild(remotevideo)
  view.appendChild(presence_orig)
    view.appendChild(result)
  // ----------------- PEER#1! ----------------------


  // ----------------- PEER#2 ----------------------
  var view2 = document.createElement('div')
  view2.className = 'peer-second'
  var toggleCompleted = document.createElement('input')
  toggleCompleted.type = 'checkbox'
  toggleCompleted.className = 'toggle'
  toggleCompleted.checked = call.value.completed
  toggleCompleted.addEventListener('change', function () {
    self.setCallCompleted(call.value.id, !call.value.completed)
  })

var call_term = document.createElement('label')
  var toggleState1 = document.createElement('label')
  var toggleState2 = document.createElement('label')
  var localvideo = document.createElement('label')
  var remotevideo = document.createElement('label')
  var mediaState_term = document.createElement('label')
  var presence_term = document.createElement('label')


call_term.innerHTML = 'Call: ' + call.value.call_term
  toggleState1.innerHTML = 'Call State: ' + call.value.state_term
  mediaState_term.innerHTML = 'Media State: ' + call.value.mediaState_term
  localvideo.innerHTML = 'Local Video: ' + call.value.localvideo_term
  remotevideo.innerHTML = 'Remote Video: ' + call.value.remotevideo_term
  presence_term.innerHTML = 'Presence : ' + call.value.presence_term


  //toggleState2.innerHTML = 'term:' + call.value.state_term
  var from = document.createElement('label')
  from.innerHTML = call.value.from

  var title1 = document.createElement('label')
  title1.innerHTML = 'term'

  view2.appendChild(title1)
  view2.appendChild(from)
  view2.appendChild(call_term)
  view2.appendChild(toggleCompleted)
  view2.appendChild(toggleState1)
  view2.appendChild(mediaState_term)
  view2.appendChild(localvideo)
  view2.appendChild(remotevideo)
  view2.appendChild(presence_term)
  // ----------------- PEER#2! ----------------------


  var removeButton = document.createElement('button')
  removeButton.className = 'destroy'
  removeButton.addEventListener('click', function () {
    removeCall(call.value.id)
  })

  var clearDiv = document.createElement('div')
  clearDiv.className = 'clear-both'

  view2.appendChild(removeButton)

  container.appendChild(view)
  container.appendChild(view2)
  container.appendChild(clearDiv)

  return container
}

/////////////////////////////////////////////////////////////////////////////////////////
var renderCall2 = function (call) {
  var container = document.createElement('li')
  if (call.value.completed) {
    container.className = 'completed'
  }

  // ----------------- PEER#1 ----------------------
  //var view5 = view;
  var view3 = document.createElement('div')
  view3.className = 'peer-first'
  var toggleCompleted = document.createElement('input')
  toggleCompleted.type = 'checkbox'
  toggleCompleted.className = 'toggle'
  toggleCompleted.checked = call.value.completed
  toggleCompleted.addEventListener('change', function () {
    self.setCallCompleted(call.value.id, !call.value.completed)
  })

  var toggleState_orig2 = document.createElement('label')
  var localvideo_orig2 = document.createElement('label')
  var remotevideo_orig2 = document.createElement('label')
  var mediaState_orig2 = document.createElement('label')
  var presence_orig2 = document.createElement('label')
  var result = document.createElement('label')


  toggleState_orig2.innerHTML = 'Call State: ' + call.value.state_orig
  localvideo_orig2.innerHTML = 'Local Video: ' + call.value.localvideo_orig
  remotevideo_orig2.innerHTML = 'Remote Video: ' + call.value.remotevideo_orig
  mediaState_orig2.innerHTML = 'Media State: ' + call.value.mediaState_orig
  presence_orig2.innerHTML = 'Presence: ' + call.value.presence_orig
  result.innerHTML = 'result: ' + call.value.result
  //toggleState2.innerHTML = 'term:' + call.value.state_term
  var to = document.createElement('label')
  to.innerHTML = call.value.to

  var title = document.createElement('label')
  title.innerHTML = 'orig'

  view3.appendChild(title)
  view3.appendChild(result)
  view3.appendChild(to)
  view3.appendChild(toggleCompleted)
  view3.appendChild(toggleState_orig2)
  view3.appendChild(mediaState_orig2)
  view3.appendChild(localvideo_orig2)
  view3.appendChild(remotevideo_orig2)
  view3.appendChild(presence_orig2)
  // ----------------- PEER#1! ----------------------


  // ----------------- PEER#2 ----------------------
  var view4 = document.createElement('div')
  view4.className = 'peer-second'
  var toggleCompleted = document.createElement('input')
  toggleCompleted.type = 'checkbox'
  toggleCompleted.className = 'toggle'
  toggleCompleted.checked = call.value.completed
  toggleCompleted.addEventListener('change', function () {
    self.setCallCompleted(call.value.id, !call.value.completed)
  })

  var toggleState_term2 = document.createElement('label')
  var toggleState2 = document.createElement('label')
  var localvideo_term2 = document.createElement('label')
  var remotevideo_term2 = document.createElement('label')
  var mediaState_term2 = document.createElement('label')
  var presence_term2 = document.createElement('label')



  toggleState_term2.innerHTML = 'Call State2: ' + call.value.state_term
  mediaState_term2.innerHTML = 'Media State2: ' + call.value.mediaState_term
  localvideo_term2.innerHTML = 'Local Video2: ' + call.value.localvideo_term
  remotevideo_term2.innerHTML = 'Remote Video2: ' + call.value.remotevideo_term
  presence_term2.innerHTML = 'Presence2 : ' + call.value.presence_term



  //toggleState2.innerHTML = 'term:' + call.value.state_term
  var to2 = document.createElement('label')
  to2.innerHTML = call.value.to2

  var title1 = document.createElement('label')
  title1.innerHTML = 'term'

  view4.appendChild(title1)
  view4.appendChild(to2)
  view4.appendChild(toggleCompleted)
  view4.appendChild(toggleState_term2)
  view4.appendChild(mediaState_term2)
  view4.appendChild(localvideo_term2)
  view4.appendChild(remotevideo_term2)
  view4.appendChild(presence_term2)
  // ----------------- PEER#2! ----------------------


  var removeButton = document.createElement('button')
  removeButton.className = 'destroy'
  removeButton.addEventListener('click', function () {
    removeCall(call.value.id)
  })

  var clearDiv = document.createElement('div')
  clearDiv.className = 'clear-both'

  view4.appendChild(removeButton)

  container.appendChild(view3)
  container.appendChild(view4)
  container.appendChild(clearDiv)

  return container
}
var getCompleted
var getUncompleted

var renderCalls = function (callObj) {
  var root = document.getElementById('call-list')
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }

  console.log(Object.keys(callObj))

  callObj.forEach(function (call) {
    if (call.value.id === 0) {
      root.appendChild(renderCall(call))
    }
    else {
      root.appendChild(renderCall2(call))
    }
  })

  //root.appendChild(renderCall(call['call1']))
  getCompleted = function () {
    return callObj.filter(function (call) {
      return call.value.completed === true
    })
  }

  getUncompleted = function () {
    return callObj.filter(function (call) {
      return call.value.completed === false
    })
  }

  var itemsLeft = document.getElementById('call-count')
  itemsLeft.innerHTML = '' + getUncompleted().length + ' call'

}

function waitResult(){
                 var id = setInterval(function () {

                 peerClient2.get({path: {equals: 'call/#0'}}).then(function (results) {
                   console.log('sonuc:' + results[0].value.result2)
                   let condition = results[0].value.result2

                   if (condition === 'incomingCall') {
                     // stop interval clearInteva
                     //resolve();
                   //  peerClient2.call('call/answerCall2', ['empty']);
                     (clearInterval(id))
                   }
                 });

               }, 1000);
}

function clickToggleAll() {
  var self = this;
  //document.getElementById('toggle-all').addEventListener('click', function () {
  var uncompleted = getUncompleted()
  if (uncompleted.length > 0) {
    uncompleted.forEach(function (call) {
      self.setCallCompleted(call.value.id, true)

    })
  } else {
    getCompleted().forEach(function (call) {
      self.setCallCompleted(call.value.id, false)
    })
  }
}//)

function callForm(titleInput) {
  //document.getElementById('call-form').addEventListener('submit', function (event) {
  //  var titleInput = document.getElementById('new-call')
  //var term = new Call();
  //term.login(titleInput);

  //call.makeCall(0,'call1');
  //term.answerCall(0);

  //  addCall(titleInput.value)
  titleInput.value = ''
  event.preventDefault()
}//)







//function loginBtn(loginId) {
document.getElementById('login-btn').addEventListener('click', function () {
  loginId = document.getElementById('username').value
  var loginPWD = document.getElementById('password').value

  console.log('login ID: ', loginId);
  console.log('login password: ', loginPWD);

  peerClient2.call('call/login2', [loginId, loginPWD]).then(function (result) {
    console.log('Instructor: started login on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start login on peer1 failed', err);
  });

})

//function loginBtn(loginId) {
document.getElementById('login-btn2').addEventListener('click', function () {
loginId = document.getElementById('username2').value
  var loginPWD = document.getElementById('password2').value

  console.log('login ID: ', loginId);
  console.log('login password: ', loginPWD);

  peerClient2.call('call/login2', [loginId, loginPWD]).then(function (result) {
    console.log('Instructor: started login on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start login on peer1 failed', err);
  });


})

document.getElementById('logout-btn').addEventListener('click', function () {
  //    var loginId = document.getElementById('get-loginid')
  //call = new Call();
  //call.login(loginId);



  peerClient2.call('call/logout2', ['call1']).then(function (result) {
    console.log('Instructor: started logout on peer2', result);
  }).catch(function (err) {
    console.log('Instructor: start logout on peer2 failed', err);
  });

})

//function loginBtn(loginId) {
document.getElementById('call-btn').addEventListener('click', function () {
  var caller = document.getElementById('username').value
    var callee = document.getElementById('callee').value
    var options = {
        
        isAudioEnabled: document.getElementById('isAudioEnabled').checked,
        isVideoEnabled: document.getElementById('isVideoEnabled').checked,
        sendInitialVideo: document.getElementById('sendInitialVideo').checked,
        sendScreenShare: document.getElementById('sendScreenShare').checked,
        localVideoContainer: document.getElementById('local-container'),
        remoteVideoContainer: document.getElementById('remote-container')
    };

    peerClient2.call('call/makeCall2', [callee, options]).then(function (result) {
    console.log('Instructor: started call to : ' + callee, result);
  }).catch(function (err) {
    console.log('Instructor: start call on peer1 failed', err);
  });

  peerClient2.call('call/add', ['call1']).then(function (result) {
    console.log('Instructor: call add method success', result);
  }).catch(function (err) {
    console.log('Instructor: could not call add method', err);
  });

    peerClient2.set('call/#' + id, {
      from: caller
    })

  let id = 0;
  peerClient2.set('call/#' + id, {
    to: callee
  })

})

//function for orig-first callholdBtn1() {
document.getElementById('hold-btn').addEventListener('click', function () {

  peerClient2.call('call/hold2', ['call1']).then(function (result) {
    console.log('Instructor: started hold on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start hold on peer1 failed', err);
  });

})

//function unholdBtn() {
document.getElementById('unhold-btn').addEventListener('click', function () {

  peerClient2.call('call/unhold2', ['call1']).then(function (result) {
    console.log('Instructor: started unhold on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start unhold on peer1 failed', err);
  });

})

/*

//function for first muteBtn1() {
document.getElementById('mute-btn').addEventListener('click', function () {
  peerClient2.call('call/mute2', ['call1']).then(function (result) {
    console.log('Instructor: started mute on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start mute on peer1 failed', err);
  });
})

//function for first unmuteBtn1() {
document.getElementById('unmute-btn').addEventListener('click', function () {
  peerClient2.call('call/unmute2', ['call1']).then(function (result) {
    console.log('Instructor: started unmute on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start unmute on peer1 failed', err);
  });
})

*/

//function endBtn() {
document.getElementById('answer-btn').addEventListener('click', function () {

  peerClient2.call('call/answerCall2', ['empty']).then(function (result) {
    console.log('Instructor: started answer on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start answer on peer1 failed', err);
  });

})


//function endBtn() {
document.getElementById('end-btn').addEventListener('click', function () {

  peerClient2.call('call/end2', ['call1']).then(function (result) {
    console.log('Instructor: started end on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start end on peer1 failed', err);
  });

})

//function rejectBtn() {
document.getElementById('reject-btn').addEventListener('click', function () {

  peerClient2.call('call/reject2', ['call1']).then(function (result) {
    console.log('Instructor: started reject on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start reject on peer1 failed', err);
  });

})

//function ignoreBtn(loginId) {
document.getElementById('ignore-btn').addEventListener('click', function () {

  peerClient2.call('call/ignore2', ['call1']).then(function (result) {
    console.log('Instructor: started ignore on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start ignore on peer1 failed', err);
  });

})

//function videostartBtn(loginId) {
document.getElementById('videostart-btn').addEventListener('click', function () {

  peerClient2.call('call/videoStart2', ['call1']).then(function (result) {
    console.log('Instructor: started videostart on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostart on peer1 failed', err);
  });

})

//function videostopBtn(loginId) {
document.getElementById('videostop-btn').addEventListener('click', function () {

  peerClient2.call('call/videoStop2', ['call1']).then(function (result) {
    console.log('Instructor: started videostop on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostop on peer1 failed', err);
  });

})



document.getElementById('setstate-btn').addEventListener('click', function (event) {
  var e = document.getElementById('call-states');
  var statetitle = e.options[e.selectedIndex].text

  setState(document.getElementById('get-id').value, statetitle)

  event.preventDefault()
})

document.getElementById('setpresence-btn').addEventListener('click', function (event) {
  var e = document.getElementById('presence-states');
  var state = e.options[e.selectedIndex].value

  peerClient2.call('call/setPresence1', [state]).then(function (result) {
    console.log('Instructor: set presence success', result);
  }).catch(function (err) {
    console.log('Instructor: set presence failed', err);
  });

})
/*
document.getElementById('getaddressbook-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getAddrBook2', ['empty']).then(function (result) {
    console.log('Instructor: getAddrBook success', result);
  }).catch(function (err) {
    console.log('Instructor: getAddrBook failed', err);
  });


})

document.getElementById('addcontact-btn').addEventListener('click', function (event) {
  var contactid = document.getElementById('get-contactid').value
  peerClient2.call('call/addContact2', [contactid]).then(function (result) {
    console.log('Instructor: Add contact success', result);
  }).catch(function (err) {
    console.log('Instructor: Add contact failed', err);
  });

})

document.getElementById('deletecontact-btn').addEventListener('click', function (event) {
  let contactid1 = document.getElementById('get-contactid').value
  peerClient2.call('call/deleteContact2', [contactid1]).then(function (result) {
    console.log('Instructor: Delete contact success', result);
  }).catch(function (err) {
    console.log('Instructor: Delete contact failed', err);
  });

})

document.getElementById('modifycontact-btn').addEventListener('click', function (event) {
  var contactid = document.getElementById('get-contactid').value
  peerClient2.call('call/addContact2', [contactid]).then(function (result) {
    console.log('Instructor: Modify contact success', result);
  }).catch(function (err) {
    console.log('Instructor: Modify contact failed', err);
  });

})

document.getElementById('getVoiceMails-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getVoiceMails2', ['empty']).then(function (result) {
    console.log('Instructor: Get Voice Mails success', result);
  }).catch(function (err) {
    console.log('Instructor: Get Voice Mails failed', err);
  });

})

document.getElementById('getWebCollaborationHostUrl-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getWebCollaborationHostUrl2', ['empty']).then(function (result) {
    console.log('Instructor: Get WebCollaborationHostUrl success', result);
  }).catch(function (err) {
    console.log('Instructor: Get WebCollaborationHostUrl failed', err);
  });

})

document.getElementById('getVideoCollaborationHostUrl-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getVideoCollaborationHostUrl2', ['empty']).then(function (result) {
    console.log('Instructor: Get VideoCollaborationHostUrl success', result);
  }).catch(function (err) {
    console.log('Instructor: Get VideoCollaborationHostUrl failed', err);
  });

})

document.getElementById('getAllowedList-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getAllowedList2', ['empty']).then(function (result) {
    console.log('Instructor: getAllowedList success', result);
  }).catch(function (err) {
    console.log('Instructor: getAllowedList failed', err);
  });
})

document.getElementById('getBannedList-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getBannedList2', ['empty']).then(function (result) {
    console.log('Instructor: getBannedList success', result);
  }).catch(function (err) {
    console.log('Instructor: getBannedList failed', err);
  });
})

document.getElementById('getShowOfflineList-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getOfflineList2', ['empty']).then(function (result) {
    console.log('Instructor: getOfflineList success', result);
  }).catch(function (err) {
    console.log('Instructor: getOfflineList failed', err);
  });
})

document.getElementById('getPending-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getPendingList2', ['empty']).then(function (result) {
    console.log('Instructor: getPendingList success', result);
  }).catch(function (err) {
    console.log('Instructor: getPendingList failed', err);
  });
})
document.getElementById('getUserProfileData-btn').addEventListener('click', function (event) {
  peerClient2.call('call/getUserProfileData2', ['empty']).then(function (result) {
    console.log('Instructor: getUserProfileData success', result);
  }).catch(function (err) {
    console.log('Instructor: getUserProfileData failed', err);
  });

})

*/

document.getElementById('createConversation').addEventListener('click', function () {
  var participant = document.getElementById('participant').value
  peerClient2.call('msg/createConversation2', [participant]).then(function (result) {
    console.log('Instructor: Create Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: Create Conversation failed', err);
  });

})

document.getElementById('fetchConversation').addEventListener('click', function () {
  peerClient2.call('msg/fetchConversation2', ['empty']).then(function (result) {
    console.log('Instructor: Fetch Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: Fetch Conversation failed', err);
  });

})

document.getElementById('createGroupConversation').addEventListener('click', function () {
  peerClient2.call('msg/createGroupConversation2', ['convoTitle']).then(function (result) {
    console.log('Instructor: createGroup Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: createGroup Conversation failed', err);
  });

})




document.getElementById('send-btn').addEventListener('click', function () {
  var message1 = document.getElementById('get-messageid').value
  peerClient2.call('msg/imSend2', [message1]).then(function (result) {
    console.log('Instructor: send message success', result);
  }).catch(function (err) {
    console.log('Instructor: send message failed', err);
  });
})


document.getElementById('clearmessage-btn').addEventListener('click', function () {
  peerClient2.call('msg/clearMessage2', ['empty']).then(function (result) {
    console.log('Instructor: clear message success', result);
  }).catch(function (err) {
    console.log('Instructor: clear message failed', err);
  });

})

document.getElementById('updatemessage-btn').addEventListener('click', function () {
  var e = document.getElementById('messageProp');
  var state = e.options[e.selectedIndex].value
  var val = document.getElementById('messageProp-text').value;

  peerClient2.call('msg/updateMessages2', [state, val]).then(function (result) {
    console.log('Instructor: update message success', result);
  }).catch(function (err) {
    console.log('Instructor: update message failed', err);
  });

})


document.getElementById('getmessages-btn').addEventListener('click', function () {
  peerClient2.call('msg/getMessages2', ['empty']).then(function (result) {
    console.log('Instructor: get messages success', result);
  }).catch(function (err) {
    console.log('Instructor: get messages failed', err);
  });

})

document.getElementById('subscribe-btn').addEventListener('click', function () {
  peerClient2.call('msg/subscribe2', ['empty']).then(function (result) {
    console.log('Instructor:subscribe success', result);
  }).catch(function (err) {
    console.log('Instructor: subscribe failed', err);
  });

})

document.getElementById('unsubscribe-btn').addEventListener('click', function () {
  peerClient2.call('msg/unsubscribe2', ['empty']).then(function (result) {
    console.log('Instructor: unsubscribe success', result);
  }).catch(function (err) {
    console.log('Instructor: unsubscribe failed', err);
  });

})

document.getElementById('fetchmessages-btn').addEventListener('click', function () {
  var amount = document.getElementById('fetchAmount').value;
  peerClient2.call('msg/fetchMessages2', [amount]).then(function (result) {
    console.log('Instructor: fetch messages success', result);
  }).catch(function (err) {
    console.log('Instructor: fetch messages failed', err);
  });

})

document.getElementById('sendfile-btn').addEventListener('click', function () {
  //var participant = document.getElementById('get-imcontactid').value
  //var message1 = document.getElementById('file-input').value
  peerClient2.call('todo/fileSend2', ['empty']).then(function (result) {
    console.log('Instructor: send message success', result);
  }).catch(function (err) {
    console.log('Instructor: send message failed', err);
  });

})

/*
//function calllog retrieveBtn(loginId) {
document.getElementById('retrieve-btn').addEventListener('click', function () {
  var startIndex = document.getElementById('get-startindexid').value
  var count = document.getElementById('get-countid').value
  peerClient2.call('call/calllogRetrieve2', [startIndex, count]).then(function (result) {
    console.log('Instructor: Call log retrieve success', result);
  }).catch(function (err) {
    console.log('Instructor: Call log retrieve failed', err);
  });

})

//function searchDirectoryBtn(loginId) {
document.getElementById('search-btn').addEventListener('click', function () {
  let e = document.getElementById('searchType');
  let searchType = e.options[e.selectedIndex].text
  let keyword = document.getElementById('get-keywordid').value
  peerClient2.call('call/searchDirectory2', [searchType, keyword]).then(function (result) {
    console.log('Instructor: search directory success', result);
  }).catch(function (err) {
    console.log('Instructor: search directory failed', err);
  });

})

*/

//function transferBtn(loginId) {
document.getElementById('transfer-btn').addEventListener('click', function () {
  var targetId = document.getElementById('get-targetid').value
  peerClient2.call('call/directTransfer2', [targetId]).then(function (result) {
    console.log('Instructor: started direct transfer success', result);
  }).catch(function (err) {
    console.log('Instructor: start dırect transfer failed', err);
  });

})

/*
document.getElementById('consultativeTransfer-btn').addEventListener('click', function () {
  peerClient2.call('call/consultativeTransfer2', ['empty']).then(function (result) {
    console.log('Instructor: started consultativeTransfer success', result);
  }).catch(function (err) {
    console.log('Instructor: start consultativeTransfer failed', err);
  });

})

//function mergeBtn() {
document.getElementById('merge-btn').addEventListener('click', function () {
  peerClient2.call('call/conferenceCall2', ['empty']).then(function (result) {
    console.log('Instructor: started conference Call success', result);
  }).catch(function (err) {
    console.log('Instructor: start conference Call failed', err);
  });
})

//function sendPWA-btn() {
document.getElementById('sendPWA-btn').addEventListener('click', function () {
  let pwarequestid = document.getElementById('get-pwarequestid').value
  peerClient2.call('call/sendPWArequest2', [pwarequestid]).then(function (result) {
    console.log('Instructor: started send PWA request success', result);
  }).catch(function (err) {
    console.log('Instructor: start send PWA request failed', err);
  });
})



function callForm(titleInput) {
}

//////////////////////////DTMF Buttons
document.getElementById('DTMF-btn1').addEventListener('click', function () {
  peerClient2.call('call/sendDTMF1', ['1']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });

})
document.getElementById('DTMF-btn2').addEventListener('click', function () {
  peerClient2.call('call/sendDTMF1', ['2']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });
})
document.getElementById('DTMF-btn3').addEventListener('click', function () {
  peerClient2.call('call/sendDTMF1', ['3']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });

})
document.getElementById('DTMF-btn3').addEventListener('click', function () {
  peerClient2.call('call/sendDTMF1', ['3']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });

})

*/

//add de 
//event.preventDefault()


//  addCall(titleInput.value)
//titleInput.value = ''

//)

//call = new Call();
//term = new Call();
//call.login('user1@test1.netas.com.tr');
//orig.login('user2@test1.netas.com.tr');


//loginBtn('user1@test1.netas.com.tr')
//loginBtn('user2@test1.netas.com.tr')

//call.makeCall(0,'call1','user2@test1.netas.com.tr');

/*
test(async function (t) {
	const value = await peerClient2.call('call/login', ['u1038@spidr.com']);
	t.true(value);
});
*/
//call: how to send it
//peerClient2.call('call/login', [loginId])


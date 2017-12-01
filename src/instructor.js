//import test from 'ava';

const Call = require('./Peer_kandy1');
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
var peer3 = new jet.Peer({
  ///url: 'wss://47.168.247.41:8090'
  url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
})



var setState = function (id, state) {
  peer3.set('call/#' + id, {
    state_term: state
  })

}

var setCallCompleted = function (id, completed) {
  peer3.set('call/#' + id, {
    completed: completed
  })
}

peer3.call('login/add', ['login1'])

var loginObj = new jet.Fetcher()
  .path('startsWith', 'login/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', function (loginObj) {
    document.getElementById('auth-status1').innerHTML = loginObj[0].value.isConnected1;
    document.getElementById('auth-status2').innerHTML = loginObj[0].value.isConnected2;
    document.getElementById('auth-status3').innerHTML = loginObj[0].value.isConnected3;
  })

peer3.fetch(loginObj)

var chatObj = document.getElementsByClassName('chatField')[0];
var chatObj2 = document.getElementsByClassName('chatField2')[0];
//############ MESSAGE ############//
var msgObj = new jet.Fetcher()
  .path('startsWith', 'msg/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', function (msgObj) {

    //renderMessages(msgObj)

    var msgArray = msgObj[0].value.messages_orig;
    if (msgArray) { //[l - 1].timestamp
      chatObj.innerHTML = ''
      msgArray.forEach(function (msg) {
        var msgLabel = document.createElement('label');
        msgLabel.className = 'chatMessage' + (loginId == msg.sender ? '1' : '2');
        msgLabel.innerHTML = '<i>' + msg.sender + '</i><br>' + msg.parts[0].text
        chatObj.appendChild(msgLabel);
      })
    }

    var msgArray2 = msgObj[1].value.messages_orig;
    if (msgArray2) { //[l - 1].timestamp
      chatObj2.innerHTML = ''
      msgArray2.forEach(function (msg) {
        var msgLabel2 = document.createElement('label');
        msgLabel2.className = 'chatMessage' + (loginId == msg.sender ? '1' : '2');
        msgLabel2.innerHTML = '<i>' + msg.sender + '</i><br>' + msg.parts[0].text
        chatObj2.appendChild(msgLabel2);
      })
    }

  })

peer3.fetch(msgObj)


var callObj = new jet.Fetcher()
  .path('startsWith', 'call/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', function (callObj) {
    //var id = callObj[0].value.state_orig;
    var id = 0

    renderCallss(callObj)

    console.log('New Value: ' + callObj[0].value.presence_orig)
  })
peer3.fetch(callObj)
//peer3.get(callObj)



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


  var callId1 = document.createElement('label')
  callId1.className = 'callId'
  var from = document.createElement('label')
  var call_orig = document.createElement('label')
  var toggleState1 = document.createElement('label')
  var toggleState2 = document.createElement('label')
  var localvideo = document.createElement('label')
  var remotevideo = document.createElement('label')
  var mediaState_orig = document.createElement('label')
  var presence_orig = document.createElement('label')
  var result = document.createElement('label')

  callId1.innerHTML = 'Call Id: ' + call.value.callId
  call_orig.innerHTML = 'Call: ' + call.value.call_orig
  from.innerHTML = 'Sipuri: ' + call.value.from
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
  view.appendChild(from)
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

  var to = document.createElement('label')
  var call_term = document.createElement('label')
  var toggleState1 = document.createElement('label')
  var toggleState2 = document.createElement('label')
  var localvideo = document.createElement('label')
  var remotevideo = document.createElement('label')
  var mediaState_term = document.createElement('label')
  var presence_term = document.createElement('label')


  call_term.innerHTML = 'Call: ' + call.value.call_term
  to.innerHTML = 'Sipuri: ' + call.value.to
  toggleState1.innerHTML = 'Call State: ' + call.value.state_term
  mediaState_term.innerHTML = 'Media State: ' + call.value.mediaState_term
  localvideo.innerHTML = 'Local Video: ' + call.value.localvideo_term
  remotevideo.innerHTML = 'Remote Video: ' + call.value.remotevideo_term
  presence_term.innerHTML = 'Presence : ' + call.value.presence_term


  var title1 = document.createElement('label')
  title1.innerHTML = 'term'

  view2.appendChild(title1)
  view2.appendChild(to)
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


  container.appendChild(callId1)
  container.appendChild(view)
  container.appendChild(view2)
  container.appendChild(clearDiv)

  return container
}

/////////////////////////////////////////////////////////////////////////////////////////
//Second Call
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

  var callId2 = document.createElement('label')
  callId2.className = 'callId'
  var from2 = document.createElement('label')
  var toggleState_orig2 = document.createElement('label')
  var localvideo_orig2 = document.createElement('label')
  var remotevideo_orig2 = document.createElement('label')
  var mediaState_orig2 = document.createElement('label')
  var presence_orig2 = document.createElement('label')
  var result = document.createElement('label')

  callId2.innerHTML = 'Call Id: ' + call.value.callId
  from2.innerHTML = 'Sipuri: ' + call.value.from
  toggleState_orig2.innerHTML = 'Call State: ' + call.value.state_orig
  localvideo_orig2.innerHTML = 'Local Video: ' + call.value.localvideo_orig
  remotevideo_orig2.innerHTML = 'Remote Video: ' + call.value.remotevideo_orig
  mediaState_orig2.innerHTML = 'Media State: ' + call.value.mediaState_orig
  presence_orig2.innerHTML = 'Presence: ' + call.value.presence_orig
  result.innerHTML = 'result: ' + call.value.result
  //toggleState2.innerHTML = 'term:' + call.value.state_term



  var title = document.createElement('label')
  title.innerHTML = 'orig'

  view3.appendChild(title)
  view3.appendChild(from2)
  //view3.appendChild(toggleCompleted)
  view3.appendChild(toggleState_orig2)
  view3.appendChild(mediaState_orig2)
  view3.appendChild(localvideo_orig2)
  view3.appendChild(remotevideo_orig2)
  view3.appendChild(presence_orig2)
  view3.appendChild(result)
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


  var to2 = document.createElement('label')
  var toggleState_term2 = document.createElement('label')
  var toggleState2 = document.createElement('label')
  var localvideo_term2 = document.createElement('label')
  var remotevideo_term2 = document.createElement('label')
  var mediaState_term2 = document.createElement('label')
  var presence_term2 = document.createElement('label')


  to2.innerHTML = 'Sipuri: ' + call.value.to
  toggleState_term2.innerHTML = 'Call State: ' + call.value.state_term
  mediaState_term2.innerHTML = 'Media State: ' + call.value.mediaState_term
  localvideo_term2.innerHTML = 'Local Video: ' + call.value.localvideo_term
  remotevideo_term2.innerHTML = 'Remote Video: ' + call.value.remotevideo_term
  presence_term2.innerHTML = 'Presence : ' + call.value.presence_term



  //toggleState2.innerHTML = 'term:' + call.value.state_term



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

  container.appendChild(callId2)
  container.appendChild(view3)
  container.appendChild(view4)
  container.appendChild(clearDiv)

  return container
}
var getCompleted
var getUncompleted

var renderCallss = function (callObj) {
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

function checkResult(stateParamName, stateParamValue) {
  return new Promise(function (resolve) {

    var id = setInterval(function () {
      peer3.get({ path: { equals: 'call/#0' } }).then(function (results) {
        console.log(stateParamName + ': ' + results[0].value[stateParamName])
        let condition = results[0].value[stateParamName]

        if (condition === stateParamValue) {
          // stop interval clearInteva
          resolve(id);
        }
      });

    }, 1000);

  });
}

function checkResult2(stateParamName, stateParamValue) {
  return new Promise(function (resolve) {

    var id2 = setInterval(function () {
      peer3.get({ path: { equals: 'call/#1' } }).then(function (results) {
        console.log('sonuc2:' + results[0].value[stateParamName])
        let condition = results[0].value[stateParamName]

        if (condition === stateParamValue) {
          // stop interval clearInteva
          resolve(id2);

        }
      });

    }, 1000);

  });
}

function checkLogin(stateParamName, stateParamValue) {
  return new Promise(function (resolve) {

    var id = setInterval(function () {
      peer3.get({ path: { equals: 'login/#0' } }).then(function (results) {
        console.log(stateParamName + ': ' + results[0].value[stateParamName])
        let condition = results[0].value[stateParamName]

        if (condition === stateParamValue) {
          // stop interval clearInteva
          resolve(id);
        }
      });

    }, 1000);

  });
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

  //peer1.login(loginId)


  peer3.call('call/login1', [loginId, loginPWD]).then(function (result) {
    console.log('Instructor: started login on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start login on peer1 failed', err);
  });


})



document.getElementById('logout-btn').addEventListener('click', function () {
  //    var loginId = document.getElementById('get-loginid')
  //call = new Call();
  //call.login(loginId);



  peer3.call('call/logout1', ['call1']).then(function (result) {
    console.log('Instructor: started logout on peer2', result);
  }).catch(function (err) {
    console.log('Instructor: start logout on peer2 failed', err);
  });

})

//function loginBtn(loginId) {
document.getElementById('call-btn').addEventListener('click', function () {
  var caller = document.getElementById('username').value
  var callee = document.getElementById('callee').value
  /*  var options = {
        
        isAudioEnabled: document.getElementById('isAudioEnabled').checked,
        isVideoEnabled: document.getElementById('isVideoEnabled').checked,
        sendInitialVideo: document.getElementById('sendInitialVideo').checked,
        sendScreenShare: document.getElementById('sendScreenShare').checked,
        localVideoContainer: document.getElementById('local-container'),
        remoteVideoContainer: document.getElementById('remote-container')
    };
*/

  peer3.call('call/add', ['call1']).then(function (result) {
    console.log('Instructor: call add method success', result);
  }).catch(function (err) {
    console.log('Instructor: could not call add method', err);
  });

  let id = 0;
  peer3.set('call/#' + id, {
    from: caller
  })

  peer3.set('call/#' + id, {
    to: callee
  })

  peer3.call('call/makeCall1', [callee]).then(function (result) {
    console.log('Instructor: started call on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start call on peer1 failed', err);
  });

})

//function loginBtn(loginId) {
document.getElementById('call-btn2a').addEventListener('click', function () {
  var caller = document.getElementById('username').value
  var callee = document.getElementById('callee-id2a').value
  //call = new Call();

  peer3.call('call/add', ['call1']).then(function (result) {
    console.log('Instructor: call add method success', result);
  }).catch(function (err) {
    console.log('Instructor: could not call add method', err);
  });

  let id = 1;
  peer3.set('call/#' + id, {
    from: caller
  })

  peer3.set('call/#' + id, {
    to: callee
  })

  peer3.set('call/#' + 0, {
    secondCall: true
  })

  peer3.call('call/makeCall1', [callee]).then(function (result) {
    console.log('Instructor: started call on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start call on peer1 failed', err);
  });

})

//function for orig-first callholdBtn1() {
document.getElementById('hold-btn').addEventListener('click', function () {

  peer3.call('call/hold1', ['call1']).then(function (result) {
    console.log('Instructor: started hold on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start hold on peer1 failed', err);
  });

})

//function for orig-second call holdBtn2a() {
document.getElementById('hold-btn2a').addEventListener('click', function () {

  peer3.call('call/hold1a', ['call2']).then(function (result) {
    console.log('Instructor: started hold for second call on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start hold for second call on peer1 failed', err);
  });

})


//function unholdBtn() {
document.getElementById('unhold-btn').addEventListener('click', function () {

  peer3.call('call/unhold1', ['call1']).then(function (result) {
    console.log('Instructor: started unhold on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start unhold on peer1 failed', err);
  });

})

//function unholdBtn() {
document.getElementById('unhold-btn2a').addEventListener('click', function () {

  peer3.call('call/unhold1a', ['call1']).then(function (result) {
    console.log('Instructor: started unhold on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start unhold on peer1 failed', err);
  });

})

//function for first muteBtn1() {
document.getElementById('mute-btn').addEventListener('click', function () {
  peer3.call('call/mute1', ['call1']).then(function (result) {
    console.log('Instructor: started mute on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start mute on peer1 failed', err);
  });
})

//function for first unmuteBtn1() {
document.getElementById('unmute-btn').addEventListener('click', function () {
  peer3.call('call/unmute1', ['call1']).then(function (result) {
    console.log('Instructor: started unmute on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start unmute on peer1 failed', err);
  });
})

//function endBtn() {
document.getElementById('end-btn').addEventListener('click', function () {

  peer3.call('call/end1', ['call1']).then(function (result) {
    console.log('Instructor: started end on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start end on peer1 failed', err);
  });

})

//function endBtn1a() {
document.getElementById('end-btn').addEventListener('click', function () {

  peer3.call('call/end1a', ['call1']).then(function (result) {
    console.log('Instructor: started end on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start end on peer1 failed', err);
  });

})

//function rejectBtn() {
document.getElementById('reject-btn').addEventListener('click', function () {

  peer3.call('call/reject1', ['call1']).then(function (result) {
    console.log('Instructor: started reject on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start reject on peer1 failed', err);
  });

})

//function ignoreBtn(loginId) {
document.getElementById('ignore-btn').addEventListener('click', function () {

  peer3.call('call/ignore1', ['call1']).then(function (result) {
    console.log('Instructor: started ignore on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start ignore on peer1 failed', err);
  });

})

//function videostartBtn(loginId) {
document.getElementById('videostart-btn').addEventListener('click', function () {

  peer3.call('call/videoStart1', ['call1']).then(function (result) {
    console.log('Instructor: started videostart on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostart on peer1 failed', err);
  });

})

//function videostopBtn(loginId) {
document.getElementById('videostop-btn').addEventListener('click', function () {

  peer3.call('call/videoStop1', ['call1']).then(function (result) {
    console.log('Instructor: started videostop on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostop on peer1 failed', err);
  });

})

//function videostartBtn(loginId) {
document.getElementById('startScreenshare-btn').addEventListener('click', function () {

  peer3.call('call/videoStart1', ['call1']).then(function (result) {
    console.log('Instructor: started videostart on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostart on peer1 failed', err);
  });

})

//function videostopBtn(loginId) {
document.getElementById('stopScreenshare-btn').addEventListener('click', function () {

  peer3.call('call/videoStop1', ['call1']).then(function (result) {
    console.log('Instructor: started videostop on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostop on peer1 failed', err);
  });

})



document.getElementById('answer-btn').addEventListener('click', function () {
  //call = new Call();

  peer3.call('call/answerCall1', ['call1']).then(function (result) {
    console.log('Instructor: answer incomimg call on peer 1', result);
  }).catch(function (err) {
    console.log('Instructor: answer call on peer1 failed', err);
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

  peer3.call('call/setPresence1', [state]).then(function (result) {
    console.log('Instructor: set presence success', result);
  }).catch(function (err) {
    console.log('Instructor: set presence failed', err);
  });

})

document.getElementById('getaddressbook-btn').addEventListener('click', function (event) {
  peer3.call('call/getAddrBook1', ['empty']).then(function (result) {
    console.log('Instructor: getAddrBook success', result);
  }).catch(function (err) {
    console.log('Instructor: getAddrBook failed', err);
  });


})

document.getElementById('addcontact-btn').addEventListener('click', function (event) {
  var contactid = document.getElementById('get-contactid').value
  peer3.call('call/addContact1', [contactid]).then(function (result) {
    console.log('Instructor: Add contact success', result);
  }).catch(function (err) {
    console.log('Instructor: Add contact failed', err);
  });

})

document.getElementById('deletecontact-btn').addEventListener('click', function (event) {
  let contactid1 = document.getElementById('get-contactid').value
  peer3.call('call/deleteContact1', [contactid1]).then(function (result) {
    console.log('Instructor: Delete contact success', result);
  }).catch(function (err) {
    console.log('Instructor: Delete contact failed', err);
  });

})

document.getElementById('modifycontact-btn').addEventListener('click', function (event) {
  var contactid = document.getElementById('get-contactid').value
  peer3.call('call/addContact1', [contactid]).then(function (result) {
    console.log('Instructor: Modify contact success', result);
  }).catch(function (err) {
    console.log('Instructor: Modify contact failed', err);
  });

})

document.getElementById('getVoiceMailsFromServer-btn').addEventListener('click', function (event) {
  peer3.call('call/getVoiceMails1', ['empty']).then(function (result) {
    console.log('Instructor: Get Voice Mails success', result);
  }).catch(function (err) {
    console.log('Instructor: Get Voice Mails failed', err);
  });

})

document.getElementById('getVoiceMails-btn').addEventListener('click', function (event) {
  peer3.call('call/getVoiceMails1', ['empty']).then(function (result) {
    console.log('Instructor: Get Voice Mails success', result);
  }).catch(function (err) {
    console.log('Instructor: Get Voice Mails failed', err);
  });

})

document.getElementById('getWebCollaborationHostUrl-btn').addEventListener('click', function (event) {
  peer3.call('call/getWebCollaborationHostUrl1', ['empty']).then(function (result) {
    console.log('Instructor: Get WebCollaborationHostUrl success', result);
  }).catch(function (err) {
    console.log('Instructor: Get WebCollaborationHostUrl failed', err);
  });

})

document.getElementById('getVideoCollaborationHostUrl-btn').addEventListener('click', function (event) {
  peer3.call('call/getVideoCollaborationHostUrl1', ['empty']).then(function (result) {
    console.log('Instructor: Get VideoCollaborationHostUrl success', result);
  }).catch(function (err) {
    console.log('Instructor: Get VideoCollaborationHostUrl failed', err);
  });

})

document.getElementById('getAllowedList-btn').addEventListener('click', function (event) {
  peer3.call('call/getAllowedList1', ['empty']).then(function (result) {
    console.log('Instructor: getAllowedList success', result);
  }).catch(function (err) {
    console.log('Instructor: getAllowedList failed', err);
  });
})

document.getElementById('getBannedList-btn').addEventListener('click', function (event) {
  peer3.call('call/getBannedList1', ['empty']).then(function (result) {
    console.log('Instructor: getBannedList success', result);
  }).catch(function (err) {
    console.log('Instructor: getBannedList failed', err);
  });
})

document.getElementById('getShowOfflineList-btn').addEventListener('click', function (event) {
  peer3.call('call/getOfflineList1', ['empty']).then(function (result) {
    console.log('Instructor: getOfflineList success', result);
  }).catch(function (err) {
    console.log('Instructor: getOfflineList failed', err);
  });
})

document.getElementById('getPending-btn').addEventListener('click', function (event) {
  peer3.call('call/getPendingList1', ['empty']).then(function (result) {
    console.log('Instructor: getPendingList success', result);
  }).catch(function (err) {
    console.log('Instructor: getPendingList failed', err);
  });
})
document.getElementById('getUserProfileData-btn').addEventListener('click', function (event) {
  peer3.call('call/getUserProfileData1', ['empty']).then(function (result) {
    console.log('Instructor: getUserProfileData success', result);
  }).catch(function (err) {
    console.log('Instructor: getUserProfileData failed', err);
  });

})

/*
    let id = 0;
  peer3.set('call/#' + id, {
    presence_orig: presences[state]
  })
*/
///////////////////////////////////////////MESSAGING 1 /////////////////////////////////
//function imSendBtn(loginId) {
//function imSendBtn(loginId) {
document.getElementById('createConversation').addEventListener('click', function () {
  var participant = document.getElementById('participant').value
  peer3.call('msg/createConversation1', [participant,1]).then(function (result) {
    console.log('Instructor: Create Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: Create Conversation failed', err);
  });

})

document.getElementById('fetchConversation').addEventListener('click', function () {
  peer3.call('msg/fetchConversation1', [1]).then(function (result) {
    console.log('Instructor: Fetch Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: Fetch Conversation failed', err);
  });

})

document.getElementById('createGroupConversation').addEventListener('click', function () {
  peer3.call('msg/createGroupConversation1', ['convoTitle',1]).then(function (result) {
    console.log('Instructor: createGroup Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: createGroup Conversation failed', err);
  });

})

document.getElementById('send-btn').addEventListener('click', function () {
  var message1 = document.getElementById('get-messageid').value
  peer3.call('msg/imSend1', [message1,1]).then(function (result) {
    console.log('Instructor: send message success', result);
  }).catch(function (err) {
    console.log('Instructor: send message failed', err);
  });
})

document.getElementById('clearmessage-btn').addEventListener('click', function () {
  peer3.call('msg/clearMessage1', [1]).then(function (result) {
    console.log('Instructor: clear message success', result);
  }).catch(function (err) {
    console.log('Instructor: clear message failed', err);
  });
})

document.getElementById('updatemessage-btn').addEventListener('click', function () {
  var e = document.getElementById('messageProp');
  var state = e.options[e.selectedIndex].value
  var val = document.getElementById('messageProp-text').value;

  peer3.call('msg/updateMessages1', [state, val,1]).then(function (result) {
    console.log('Instructor: update message success', result);
  }).catch(function (err) {
    console.log('Instructor: update message failed', err);
  });
})

document.getElementById('getmessages-btn').addEventListener('click', function () {
  peer3.call('msg/getMessages1', [1]).then(function (result) {
    console.log('Instructor: get messages success', result);
  }).catch(function (err) {
    console.log('Instructor: get messages failed', err);
  });

})

document.getElementById('subscribe-btn').addEventListener('click', function () {
  peer3.call('msg/subscribe1', [1]).then(function (result) {
    console.log('Instructor:subscribe success', result);
  }).catch(function (err) {
    console.log('Instructor: subscribe failed', err);
  });
})

document.getElementById('unsubscribe-btn').addEventListener('click', function () {
  peer3.call('msg/unsubscribe1', [1]).then(function (result) {
    console.log('Instructor: unsubscribe success', result);
  }).catch(function (err) {
    console.log('Instructor: unsubscribe failed', err);
  });
})

document.getElementById('fetchmessages-btn').addEventListener('click', function () {
  var amount = document.getElementById('fetchAmount').value;
  peer3.call('msg/fetchMessages1', [amount,1]).then(function (result) {
    console.log('Instructor: fetch messages success', result);
  }).catch(function (err) {
    console.log('Instructor: fetch messages failed', err);
  });
})

document.getElementById('sendfile-btn').addEventListener('click', function () {
  //var participant = document.getElementById('get-imcontactid').value
  //var message1 = document.getElementById('file-input').value
  peer3.call('msg/fileSend1', [1]).then(function (result) {
    console.log('Instructor: send message success', result);
  }).catch(function (err) {
    console.log('Instructor: send message failed', err);
  });
})

///////////////////////////////////////////MESSAGING 2/////////////////////////////////
//function imSendBtn(loginId) {
//function imSendBtn(loginId) {
document.getElementById('createConversation2').addEventListener('click', function () {
  var participant = document.getElementById('participant2').value
  peer3.call('msg/createConversation1', [participant,2]).then(function (result) {
    console.log('Instructor: Create Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: Create Conversation failed', err);
  });

})

document.getElementById('fetchConversation2').addEventListener('click', function () {
  peer3.call('msg/fetchConversation1', [2]).then(function (result) {
    console.log('Instructor: Fetch Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: Fetch Conversation failed', err);
  });

})

document.getElementById('createGroupConversation2').addEventListener('click', function () {
  peer3.call('msg/createGroupConversation1', ['convoTitle',2]).then(function (result) {
    console.log('Instructor: createGroup Conversation success', result);
  }).catch(function (err) {
    console.log('Instructor: createGroup Conversation failed', err);
  });

})

document.getElementById('send-btn2').addEventListener('click', function () {
  var message1 = document.getElementById('get-messageid').value
  peer3.call('msg/imSend1', [message1,2]).then(function (result) {
    console.log('Instructor: send message success', result);
  }).catch(function (err) {
    console.log('Instructor: send message failed', err);
  });
})

document.getElementById('clearmessage-btn2').addEventListener('click', function () {
  peer3.call('msg/clearMessage1', [2]).then(function (result) {
    console.log('Instructor: clear message success', result);
  }).catch(function (err) {
    console.log('Instructor: clear message failed', err);
  });
})

document.getElementById('updatemessage-btn2').addEventListener('click', function () {
  var e = document.getElementById('messageProp');
  var state = e.options[e.selectedIndex].value
  var val = document.getElementById('messageProp-text').value;

  peer3.call('msg/updateMessages1', [state, val,2]).then(function (result) {
    console.log('Instructor: update message success', result);
  }).catch(function (err) {
    console.log('Instructor: update message failed', err);
  });
})

document.getElementById('getmessages-btn2').addEventListener('click', function () {
  peer3.call('msg/getMessages1', [2]).then(function (result) {
    console.log('Instructor: get messages success', result);
  }).catch(function (err) {
    console.log('Instructor: get messages failed', err);
  });

})

document.getElementById('subscribe-btn2').addEventListener('click', function () {
  peer3.call('msg/subscribe1', [2]).then(function (result) {
    console.log('Instructor:subscribe success', result);
  }).catch(function (err) {
    console.log('Instructor: subscribe failed', err);
  });
})

document.getElementById('unsubscribe-btn2').addEventListener('click', function () {
  peer3.call('msg/unsubscribe1', [2]).then(function (result) {
    console.log('Instructor: unsubscribe success', result);
  }).catch(function (err) {
    console.log('Instructor: unsubscribe failed', err);
  });
})

document.getElementById('fetchmessages-btn2').addEventListener('click', function () {
  var amount = document.getElementById('fetchAmount').value;
  peer3.call('msg/fetchMessages1', [amount,2]).then(function (result) {
    console.log('Instructor: fetch messages success', result);
  }).catch(function (err) {
    console.log('Instructor: fetch messages failed', err);
  });
})

document.getElementById('sendfile-btn2').addEventListener('click', function () {
  //var participant = document.getElementById('get-imcontactid').value
  //var message1 = document.getElementById('file-input').value
  peer3.call('msg/fileSend1', [2]).then(function (result) {
    console.log('Instructor: send message success', result);
  }).catch(function (err) {
    console.log('Instructor: send message failed', err);
  });
})
//////////////////////////////////////////////////////
//function calllog retrieveBtn(loginId) {
document.getElementById('retrieve-btn').addEventListener('click', function () {
  var startIndex = document.getElementById('get-startindexid').value
  var count = document.getElementById('get-countid').value
  peer3.call('call/calllogRetrieve1', [startIndex, count]).then(function (result) {
    console.log('Instructor: Call log retrieve success', result);
  }).catch(function (err) {
    console.log('Instructor: Call log retrieve failed', err);
  });

})

//function searchDirectoryBtn(loginId) {
document.getElementById('search-btn').addEventListener('click', function () {
  let e = document.getElementById('searchType');
  let searchType = e.options[e.selectedIndex].text
  let criteria = document.getElementById('get-keywordid').value
  peer3.call('call/searchDirectory1', [searchType, criteria]).then(function (result) {
    console.log('Instructor: search directory success', result);
  }).catch(function (err) {
    console.log('Instructor: search directory failed', err);
  });

})

//function transferBtn(loginId) {
document.getElementById('transfer-btn').addEventListener('click', function () {
  var targetId = document.getElementById('get-targetid').value
  peer3.call('call/directTransfer1', [targetId])
  .then(() => peer3.call('call/add', ['call1']))
  .then(() => peer3.set('call/#' + 0, { transferSuccess: true }))
  /*
  then(function (result) {
    console.log('Instructor: started direct transfer success', result);
  }).catch(function (err) {
    console.log('Instructor: start direct transfer failed', err);
  });
*/
})

document.getElementById('consultativeTransfer-btn').addEventListener('click', function () {
  peer3.call('call/consultativeTransfer1', ['empty']).then(function (result) {
    console.log('Instructor: started consultativeTransfer success', result);
  }).catch(function (err) {
    console.log('Instructor: start consultativeTransfer failed', err);
  });

})

//function mergeBtn() {
document.getElementById('merge-btn').addEventListener('click', function () {
  peer3.call('call/conferenceCall1', ['empty']).then(function (result) {
    console.log('Instructor: started conference Call success', result);
  }).catch(function (err) {
    console.log('Instructor: start conference Call failed', err);
  });
})

//function sendPWA-btn() {
document.getElementById('sendPWA-btn').addEventListener('click', function () {
  let pwarequestid = document.getElementById('get-pwarequestid').value
  peer3.call('call/sendPWArequest1', [pwarequestid]).then(function (result) {
    console.log('Instructor: started send PWA request success', result);
  }).catch(function (err) {
    console.log('Instructor: start send PWA request failed', err);
  });
})



function callForm(titleInput) {
}
//document.getElementById('call-form').addEventListener('submit', function (event) {
//  var titleInput = document.getElementById('new-call')
//  var term = new Call();

/////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// Peer 2 Buttons ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

//function loginBtn2(loginId) {
document.getElementById('login-btn2').addEventListener('click', function () {
  var loginId2 = document.getElementById('get-loginid2').value
  //call = new Call();
  //call.login(loginId);

  peer3.call('call/login2', [loginId2]).then(function (result) {
    console.log('Instructor: started login on peer2', result);
  }).catch(function (err) {
    console.log('Instructor: start login on peer2 failed', err);
  });

})

document.getElementById('logout-btn2').addEventListener('click', function () {
  //    var loginId = document.getElementById('get-loginid')
  //call = new Call();
  //call.login(loginId);

  peer3.call('call/logout2', ['call1']).then(function (result) {
    console.log('Instructor: started logout on peer2', result);
  }).catch(function (err) {
    console.log('Instructor: start logout on peer2 failed', err);
  });

})

//function loginBtn(loginId) {
document.getElementById('call-btn2').addEventListener('click', function () {
  var callee = document.getElementById('callee-id2').value
  //call = new Call();


  peer3.call('call/makeCall2', [callee]).then(function (result) {
    console.log('Instructor: started call on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start call on peer1 failed', err);
  });

})

//function holdBtn(loginId) {
document.getElementById('hold-btn2').addEventListener('click', function () {
  peer3.call('call/hold2', ['call1']).then(function (result) {
    console.log('Instructor: started hold on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start hold on peer1 failed', err);
  });

})

//function unholdBtn(loginId) {
document.getElementById('unhold-btn2').addEventListener('click', function () {
  peer3.call('call/unhold2', ['call1']).then(function (result) {
    console.log('Instructor: started unhold on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start unhold on peer1 failed', err);
  });

})

//function rejectBtn(loginId) {
document.getElementById('end-btn2').addEventListener('click', function () {

  peer3.call('call/end2', ['call1']).then(function (result) {
    console.log('Instructor: started end on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start end on peer1 failed', err);
  });

})

//function rejectBtn(loginId) {
document.getElementById('reject-btn2').addEventListener('click', function () {

  peer3.call('call/reject2', ['call1']).then(function (result) {
    console.log('Instructor: started reject on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start reject on peer1 failed', err);
  });

})

//function ignoreBtn(loginId) {
document.getElementById('ignore-btn2').addEventListener('click', function () {

  peer3.call('call/ignore2', ['call1']).then(function (result) {
    console.log('Instructor: started ignore on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start ignore on peer1 failed', err);
  });

})

//function videostartBtn(loginId) {
document.getElementById('videostart-btn2').addEventListener('click', function () {

  peer3.call('call/videoStart2', ['call1']).then(function (result) {
    console.log('Instructor: started videostart on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostart on peer1 failed', err);
  });

})

//function videostopBtn(loginId) {
document.getElementById('videostop-btn2').addEventListener('click', function () {

  peer3.call('call/videoStop2', ['call1']).then(function (result) {
    console.log('Instructor: started videostop on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start videostop on peer1 failed', err);
  });

})

document.getElementById('answer-btn2').addEventListener('click', function () {
  //call = new Call();

  peer3.call('call/answerCall2', ['call1']).then(function (result) {
    console.log('Instructor: answer incomimg call on peer 1', result);
  }).catch(function (err) {
    console.log('Instructor: answer call on peer1 failed', err);
  });

})

document.getElementById('setpresence-btn2').addEventListener('click', function (event) {
  var e = document.getElementById('presence-states2');
  var state = e.options[e.selectedIndex].value

  peer3.call('call/setPresence2', [state]).then(function (result) {
    console.log('Instructor: set presence success', result);
  }).catch(function (err) {
    console.log('Instructor: set presence failed', err);
  });

  /*
      let id = 0;
    peer3.set('call/#' + id, {
      presence_orig: presences[state]
    })
  */

})

document.getElementById('login-btn2').addEventListener('click', function () {
  var loginId2 = document.getElementById('get-loginid2').value
  //call = new Call();
  //call.login(loginId);

  peer3.call('call/login2', [loginId2]).then(function (result) {
    console.log('Instructor: started login on peer2', result);
  }).catch(function (err) {
    console.log('Instructor: start login on peer2 failed', err);
  });

})

////////////////////////////////////////////////Peer3///////////////////////////////

//call = new Call();
//call.login(loginId);
document.getElementById('login-btn3').addEventListener('click', function () {
  var loginId3 = document.getElementById('get-loginid3').value
  peer3.call('call/login3', [loginId3]).then(function (result) {
    console.log('Instructor: started login on peer3', result);
  }).catch(function (err) {
    console.log('Instructor: start login on peer3 failed', err);
  });

})

//answer for Orig3
document.getElementById('answer-btn3').addEventListener('click', function () {
  //call = new Call();

  peer3.call('call/answerCall3', ['call1']).then(function (result) {
    console.log('Instructor: answer incomimg call on peer3', result);
  }).catch(function (err) {
    console.log('Instructor: answer call on peer3 failed', err);
  });

})

//////////////////////////DTMF Buttons
document.getElementById('DTMF-btn1').addEventListener('click', function () {
  peer3.call('call/sendDTMF1', ['1']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });

})
document.getElementById('DTMF-btn2').addEventListener('click', function () {
  peer3.call('call/sendDTMF1', ['2']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });
})
document.getElementById('DTMF-btn3').addEventListener('click', function () {
  peer3.call('call/sendDTMF1', ['3']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });

})
document.getElementById('DTMF-btn3').addEventListener('click', function () {
  peer3.call('call/sendDTMF1', ['3']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });

})


document.getElementById('DTMF-btn3').addEventListener('click', function () {
  peer3.call('call/sendDTMF1', ['3']).then(function (result) {
    console.log('Instructor: sendDTMF success', result);
  }).catch(function (err) {
    console.log('Instructor: sendDTMF failed', err);
  });

})

document.getElementById('loginall-btn').addEventListener('click', function () {

  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
  peer3.call('call/login2', ['oztemur@genband.com', 'Genband.1234'])
  peer3.call('call/login3', ['hguner@genband.com', 'ltve0168'])
});

document.getElementById('basicCallTest-btn').addEventListener('click', function () {
  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['hguner@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call1']))
    .then(() => peer3.call('call/makeCall1', ['hguner@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
});

document.getElementById('basicCallTest2-btn').addEventListener('click', function () {
  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'Genband.1234']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login3', ['hguner@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected3', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call1']))
    .then(() => peer3.call('call/makeCall1', ['hguner@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('mediaState_term', 'CONNECTED'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold1', ['empty']) })
    .then(() => peer3.set('call/#' + 0, { secondCall: true }))
    .then(() => checkResult('state_orig', 'ON_HOLD'))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call2']))
    .then(() => peer3.call('call/makeCall1', ['hguner@genband.com']))
    .then(() => checkResult2('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall3', ['empty']) })
    .then(() => checkResult2('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
});

document.getElementById('testMuteUnmute-btn').addEventListener('click', function () {
  peer3.call('call/add', ['call1'])
    .then(() => peer3.call('call/login1', ['ravci@genband.com', 'yjke9884']))
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/mute1', ['empty']) })
    .then((interval) => { clearInterval(interval); peer3.call('call/unmute1', ['empty']) })
    .then((interval) => clearInterval(interval))
});

document.getElementById('testHoldUnhold-btn').addEventListener('click', function () {
  peer3.call('call/add', ['call1'])
    .then(() => peer3.call('call/login1', ['ravci@genband.com', 'yjke9884']))
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['hguner@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/makeCall1', ['hguner@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold1', ['empty']) })
    .then(() => checkResult('state_orig', 'ON_HOLD'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_term', 'ON_REMOTE_HOLD'))
    .then((interval) => { clearInterval(interval); peer3.call('call/unhold1', ['empty']) })
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/end1', ['empty']) })
    .then((interval) => clearInterval(interval))
});

document.getElementById('testdualHold-btn').addEventListener('click', function () {
  peer3.call('call/add', ['call1'])
    .then(() => peer3.call('call/login1', ['ravci@genband.com', 'yjke9884']))
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold1', ['empty']) })
    .then(() => checkResult('state_orig', 'ON_HOLD'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_term', 'ON_REMOTE_HOLD'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold2', ['empty']) })
    .then(() => checkResult('state_term', 'ON_HOLD'))
    .then((interval) => { clearInterval(interval); peer3.call('call/unhold2', ['empty']) })
    .then(() => checkResult('state_term', 'ON_REMOTE_HOLD'))
    .then((interval) => { clearInterval(interval); peer3.call('call/unhold1', ['empty']) })
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/end1', ['empty']) })
    .then((interval) => clearInterval(interval))
});

//start video on orig side after establish an audio call
document.getElementById('testVideoEscalation-btn').addEventListener('click', function () {
  peer3.call('call/add', ['call1'])
    .then(() => peer3.call('call/login1', ['ravci@genband.com', 'yjke9884']))
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('mediaState_term', 'CONNECTED'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('mediaState_orig', 'COMPLETED'))
    .then((interval) => { clearInterval(interval); peer3.call('call/videoStart1', ['empty']) })
    .then(() => checkResult('mediaState_term', 'DISCONNECTED'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('mediaState_term', 'CHECKING'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('mediaState_term', 'CONNECTED'))
    .then((interval) => clearInterval(interval))
});

//start video call on orig side and answer audio on term side
document.getElementById('testVideoCall-btn').addEventListener('click', function () {
  document.getElementById('isVideoEnabled').checked = true
  document.getElementById('sendInitialVideo').checked = true

  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call1']))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
});

//start video call on orig side and answer video on term side
document.getElementById('test2WVideoCall-btn').addEventListener('click', function () {
  document.getElementById('isVideoEnabled').checked = true
  document.getElementById('sendInitialVideo').checked = true

  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'Genband.1234']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call1']))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerVideo2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
});

//stop start video on orig side after establish an video call
document.getElementById('testVideoStopStart-btn').addEventListener('click', function () {
  document.getElementById('isVideoEnabled').checked = true
  document.getElementById('sendInitialVideo').checked = true
  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'Genband.1234']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call1']))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/videoStop1', ['empty']) })
    .then(() => checkResult('mediaState_term', 'CONNECTED'))
    .then((interval) => { clearInterval(interval); peer3.call('call/videoStart1', ['empty']) })
});

/* bundan nedense ilk baskata 2 call cıkarıyor nedenine bakılacak
document.getElementById('testDirectTransfer-btn').addEventListener('click', function () {
  peer3.call('call/add', ['call1'])
    .then(() => peer3.call('call/login1', ['ravci@genband.com', 'yjke9884']))
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'Genband.1234']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login3', ['hguner@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected3', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold1', ['empty']) })
    .then(() => checkResult('state_orig', 'ON_HOLD'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_term', 'ON_REMOTE_HOLD'))
    .then((interval) => { clearInterval(interval); peer3.call('call/directTransfer1', ['hguner@genband.com']) })
    .then(peer3.call('call/add', ['call2']))
    .then(() => checkResult2('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall3', ['empty']) })
    .then(() => checkResult2('state_orig', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult2('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.set('call/#' + 0, { transferSuccess: true }))
    //.then((interval) => { clearInterval(interval); peer3.call('call/end1', ['empty']) })
});
*/

document.getElementById('testDirectTransfer-btn').addEventListener('click', function () {
  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'Genband.1234']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login3', ['hguner@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected3', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call1']))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('mediaState_term', 'CONNECTED'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold1', ['empty']) })
    .then(() => peer3.set('call/#' + 0, { secondCall: true }))
    .then(() => checkResult('state_orig', 'ON_HOLD'))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call2']))
    .then(() => peer3.call('call/directTransfer1', ['hguner@genband.com']))
    .then(() => checkResult2('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall3', ['empty']) })
    .then(() => checkResult2('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.set('call/#' + 0, { transferSuccess: true }))
});

document.getElementById('testConsTransfer-btn').addEventListener('click', function () {
  peer3.call('call/login1', ['ravci@genband.com', 'yjke9884'])
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', ['oztemur@genband.com', 'Genband.1234']))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login3', ['hguner@genband.com', 'ltve0168']))
    .then(() => checkLogin('isConnected3', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call1']))
    .then(() => peer3.call('call/makeCall1', ['oztemur@genband.com']))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_term', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => clearInterval(interval))
    .then(() => checkResult('mediaState_term', 'CONNECTED'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold1', ['empty']) })
    .then(() => peer3.set('call/#' + 0, { secondCall: true }))
    .then(() => checkResult('state_orig', 'ON_HOLD'))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/add', ['call2']))
    .then(() => peer3.call('call/makeCall1', ['hguner@genband.com']))
    .then(() => checkResult2('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall3', ['empty']) })
    .then(() => checkResult2('state_term', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/consultativeTransfer1', ['empty']) })
    .then((interval) => clearInterval(interval))
});

document.getElementById('getresult-btn').addEventListener('click', function () {
        peer3.get({ path: { equals: 'call/#0' } }).then(function (results) {
            console.log('Call id 1:' + results[0].value.callId)
        });
        peer3.get({ path: { equals: 'call/#1' } }).then(function (results) {
            console.log('Call id 2:' + results[0].value.callId)
        });
      });  
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
	const value = await peer3.call('call/login', ['u1038@spidr.com']);
	t.true(value);
});
*/
//todo: how to send it
//peer3.call('call/login', [loginId])


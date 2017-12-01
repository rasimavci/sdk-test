#!/usr/bin/env node

var jet = require('node-jet')
var finalhandler = require('finalhandler')
var https = require('https')
var serveStatic = require('serve-static')

var port = parseInt(process.argv[2]) || 80
var internalPort = 11128

var fs = require('fs');


// Serve this dir as static content
var serve = serveStatic('./')

//create options
var ssl = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem'),
  passphrase: '12345'
};

var options = {
  port: 80
};


// Create Webserver
var httpServer = https.createServer(ssl, function (req, res) {
  var done = finalhandler(req, res)
  serve(req, res, done)
})

httpServer.listen(port)

// Create Jet Daemon
var daemon = new jet.Daemon()
daemon.listen({
  server: httpServer, // embed jet websocket upgrade handler
  tcpPort: internalPort // nodejitsu prevents internal websocket connections
})

// Declare Message Class
var messageId = 0
var Message = function (title) {
  this.id = messageId++
  if (typeof title !== 'string') {
    throw new Error('title must be a string')
  }

  this.title = title
  this.sender = ''
  this.id_orig = ''
  this.id_term = ''
  this.conversation_orig = false
  this.conversation_term = false
  this.messages_orig = []
  this.messages_term = []
  this.message = ''
  this.participants = []
  this.participant = ''
  this.subscribe_orig = false
  this.subscribe_term = false
}

Message.prototype.merge = function (other) {
  if (other.conversation_orig !== undefined) {
    this.conversation_orig = other.conversation_orig
  }

  if (other.conversation_term !== undefined) {
    this.conversation_term = other.conversation_term
  }
  if (other.message_orig !== undefined) {
    this.message_orig = other.message_orig
  }

  if (other.message_term !== undefined) {
    this.message_term = other.message_term
  }

  if (other.message !== undefined) {
    this.messages.push(other.message)
  }

  if (other.messages_orig !== undefined) {
    this.messages_orig = other.messages_orig
  }

  if (other.messages_term !== undefined) {
    this.messages_term = other.messages_term
  }

  if (other.participant !== undefined) {
    this.participants.push(other.participant)
  }

  if (other.sender !== undefined) {
    this.sender = other.sender
  }

  if (other.subscribe_orig !== undefined) {
    this.subscribe_orig = other.subscribe_orig
  }

  if (other.subscribe_term !== undefined) {
    this.subscribe_term = other.subscribe_term
  }

}


// Declare Login Class
var loginId = 0
var Login = function (title) {
  this.id = loginId++
  if (typeof title !== 'string') {
    throw new Error('title must be a string')
  }

  this.title = title
  this.isConnected1 = false
  this.isConnected2 = false
  this.isConnected3 = false
}

Login.prototype.merge = function (other) {
  if (other.isConnected1 !== undefined) {
    this.isConnected1 = other.isConnected1
  }

  if (other.isConnected2 !== undefined) {
    this.isConnected2 = other.isConnected2
  }

  if (other.isConnected3 !== undefined) {
    this.isConnected3 = other.isConnected3
  }
}

// Declare Call Class
var callId = 0

var Call = function (title) {
  this.id = callId++
  if (typeof title !== 'string') {
    throw new Error('title must be a string')
  }
  this.title = title
  this.completed = false
  this.state_orig = ''
  this.state_orig2 = ''
  this.state_term = ''
  this.localvideo_orig = false
  this.remotevideo_orig = false
  this.localvideo_term = false
  this.remotevideo_term = false
  this.job = ''
  this.statusCode = ''
  this.reasonText = ''
  this.statusCode = ''
  this.to = ''
  this.from = ''
  this.mediaState_orig = ''
  this.mediaState_term = ''
  this.presence_orig = ''
  this.presence_term = ''
  this.message_orig = ''
  this.message_term = ''
  this.mute_orig = ''
  this.mute_term = ''
  this.screenshare_orig = ''
  this.screenshare_term = ''
  this.call_orig = ''
  this.call_term = ''
  this.result = ''
  this.result2 = ''
  this.result3 = ''
  this.transfer = false
  this.callId = ''
  this.secondCall = false
  this.directTransfer = false
  this.transferSuccess = false
}

Call.prototype.merge = function (other) {
  if (other.completed !== undefined) {
    this.completed = other.completed
  }

  if (other.title !== undefined) {
    this.title = other.title
  }


  if (other.state_orig !== undefined) {
    this.state_orig = other.state_orig
  }

  if (other.state_orig2 !== undefined) {
    this.state_orig2 = other.state_orig
  }

  if (other.state_term !== undefined) {
    this.state_term = other.state_term
  }

  if (other.localvideo_orig !== undefined) {
    this.localvideo_orig = other.localvideo_orig
  }

  if (other.remotevideo_orig !== undefined) {
    this.remotevideo_orig = other.remotevideo_orig
  }
  if (other.localvideo_term !== undefined) {
    this.localvideo_term = other.localvideo_term
  }

  if (other.remotevideo_term !== undefined) {
    this.remotevideo_term = other.remotevideo_term
  }


  if (other.job !== undefined) {
    this.job = other.job
  }

  if (other.to !== undefined) {
    this.to = other.to
  }

  if (other.from !== undefined) {
    this.from = other.from
  }

  if (other.mediaState_orig !== undefined) {
    this.mediaState_orig = other.mediaState_orig
  }

  if (other.mediaState_term !== undefined) {
    this.mediaState_term = other.mediaState_term
  }

  if (other.presence_orig !== undefined) {
    this.presence_orig = other.presence_orig
  }

  if (other.presence_term !== undefined) {
    this.presence_term = other.presence_term
  }

  if (other.message_orig !== undefined) {
    this.message_orig = other.message_orig
  }

  if (other.message_term !== undefined) {
    this.message_term = other.message_term
  }
  if (other.mute_orig !== undefined) {
    this.mute_orig = other.presence_orig
  }

  if (other.mute_term !== undefined) {
    this.mute_term = other.presence_term
  }
  if (other.screenshare_orig !== undefined) {
    this.screenshare_orig = other.screenshare_orig
  }
  if (other.screenshare_term !== undefined) {
    this.screenshare_term = other.screenshare_term
  }
  if (other.call_orig !== undefined) {
    this.call_orig = other.call_orig
  }
  if (other.call_term !== undefined) {
    this.call_term = other.call_term
  }
  if (other.result !== undefined) {
    this.result = other.result
  }

  if (other.result2 !== undefined) {
    this.result2 = other.result2
  }
  if (other.result3 !== undefined) {
    this.result3 = other.result3
  }
  if (other.transfer !== undefined) {
    this.transfer = other.transfer
  }
  if (other.callId !== undefined) {
    this.callId = other.callId
  }

  if (other.secondCall !== undefined) {
    this.secondCall = other.secondCall
  }

  if (other.directTransfer !== undefined) {
    this.directTransfer = other.directTransfer
  }
  if (other.transferSuccess !== undefined) {
    this.transferSuccess = other.transferSuccess
  }


}

// Create Jet Peer
var peer = new jet.Peer({
  port: internalPort
})

var messageStates = {}

// Provide a "login/add" method to create new logins
var addMessage = new jet.Method('msg/add')
addMessage.on('call', function (args) {
  var title = args[0]
  var message = new Message(title)

  // create a new login state and store ref.
  var messageState = new jet.State('msg/#' + message.id, message)
  messageState.on('set', function (requestedMessage) {
    message.merge(requestedMessage)
    return {
      value: message
    }
  })
  messageStates[message.id] = messageState
  peer.add(messageState)
})

var loginStates = {}

// Provide a "login/add" method to create new logins
var addLogin = new jet.Method('login/add')
addLogin.on('call', function (args) {
  var title = args[0]
  var login = new Login(title)

  // create a new login state and store ref.
  var loginState = new jet.State('login/#' + login.id, login)
  loginState.on('set', function (requestedLogin) {
    login.merge(requestedLogin)
    return {
      value: login
    }
  })
  loginStates[login.id] = loginState
  peer.add(loginState)
})


var callStates = {}

// Provide a "call/add" method to create new calls
var addCall = new jet.Method('call/add')
addCall.on('call', function (args) {
  var title = args[0]
  var call = new Call(title)

  // create a new call state and store ref.
  var callState = new jet.State('call/#' + call.id, call)
  callState.on('set', function (requestedCall) {
    call.merge(requestedCall)
    return {
      value: call
    }
  })
  callStates[call.id] = callState
  peer.add(callState)
})

// Provide a "call/remove" method to delete a certain call
var removeCall = new jet.Method('call/remove')
removeCall.on('call', function (ids) {
  ids.forEach(function (id) {
    if (callStates[id]) {
      callStates[id].remove()
      delete callStates[id]
      callId = 0;
    }
  })
})

// Provide a "call/remove" method to delete a certain call
var clearCompletedCalls = new jet.Method('call/clearCompleted')
clearCompletedCalls.on('call', function () {
  Object.keys(callStates).forEach(function (id) {
    //    if (callStates[id].value().completed) {
    callStates[id].remove()
    delete callStates[id]
    callId = 0;
    //  }
  })
})

// Provide a "call/remove" method to delete a certain call
var setCompleted = new jet.Method('call/setCompleted')
setCompleted.on('call', function (args) {
  Object.keys(callStates).forEach(function (id) {
    var call = callStates[id]
    var current = call.value()
    if (current.completed !== args[0]) {
      current.completed = args[0]
      call.value(current)
    }
  })
})

// connect peer and register methods
jet.Promise.all([
  peer.connect(),
  peer.add(addMessage),
  peer.add(addLogin),
  peer.add(addCall),
  peer.add(removeCall),
  peer.add(setCompleted),
  peer.add(clearCompletedCalls)
]).then(function () {
  console.log('sdktest-server ready')
  console.log('listening on port', port)
})

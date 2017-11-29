# Kandy Automation Test Framework

This repository is for Frameork of realtime testing of Kandy.js code with node-jet api and mocha. The Framework will be able to:

   - Create calls and share information between peers
   - Create conversation share messages between peers
   - Edit Call State
   - Work simultaneously with multiple call peers
	
Multiple clients can edit the call state at the same time and ever client sees each other client state changes instantly.


To build and run this project run:

```sh
git clone git@github.com:rasimavci/sdk-test.git
cd sdk-test
npm install
npm run build
npm start 8090
```

Open some browser tab on your localhost and start a call and realtime state changes.

## What is KATE ?
 
KATE as its name implies is an framework for test automation. Can be used as core for REST API Apps.

However KATE is more than that:

   - Self-hostable
   - Fully moduler approach, UAT (Unit Under Test) is customizable
   - Flexible realtime APIs
   - Distributed Services with Node-Jet
   - Flexible third party test/assertion library


Self-hosted means that running **Jet does not involve any 3rd party servers** where your data passes through.
In standard way  Node-Jet Daemon runs on pc but can be easily embedded into any Node.js based webserver. 

## What is Real Benefit ?
Realtime colloboration between test clients can save you a lot of time. Imagine you have hundreds of tests, and each of them needs to be verified in real environment. Standard time for a test to be run on UI takes 3-4 minutes each. 
KATE helps you run your API tests without mocking anything. Since inline used node-jet library updates states in realtime, reamining is up to your API call functions.
You don't have to check all UI message and filter them at the client level ! API testing was never been easy.

KATE uses Node-Jet , a Javascript framework for realtime communication. It is an open protocol with compatible implementation.

   - [Node.js + Browser](http://github.com/lipp/node-jet)
   - [Lua](http://github.com/lipp/lua-jet)
   - [Arduino](https://github.com/lipp/Arduino-Jet)
   - C (work in progress)


Both Node-Jet, Mocha and Ava are free and open source libraries.



## How to use KATE

For this project all you need:

   - A browser
   - Node-Jet webserver
   - An API to test


A webserver is required for serving clients. Node.js https server handles this.
-Creating node.je https server explainedd below. For Kandy.js testing, secure webserver is used.

-If you have licensing issues for a secure server on your pc, please creat ssl license with cygwin or some other tools.

İn src folder, you will see these files:

   - [sdktest-server.js](./sdktest-server.js) (Node.js Webserver + Node-Jet Daemon + Node-Jet Peer as Kandy Client.)
   - [sdktest-client.js](./sdk-client.js) (Kandy client which uses Jet Peer)
   - [instructor.html](./instructor.html) (Instructor peer to control overall test running and clients.)

## The call and message server

The sdktest-server.js will provide a webserver for serving call and conversation objects besides providing Jet Daemon as communication center. 

A Jet Peer will finally add the Call Server-App logic be providing means for:

   - create Calls & Conversations
   - delete Calls & Conversations
   - update Call state
   - send message
   - send API request (addressbook, contacts, voicemail etc.)
   - update information by listening events


### Call Server and Jet Daemon
 
First I will setup the webserver for call objects and create a Jet Daemon:

```javascript
var jet = require('node-jet');
...

// Serve this dir as static content 
var serve = serveStatic('./');

var httpServer = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  serve(req, res, done)
})
 
httpServer.listen(port);

// Create jet daemon and embed into httpServer
var daemon = new jet.Daemon();
daemon.listen({
  server: httpServer
});
```

The Daemon uses Websocket for communication and is hooked up to the webserver so that both listen on the same port. 
Daemon may run on any pc. Currently first client peer also run on server pc. If required, the Daemon may run on a totally different pc or different port. 

Next comes  the Call-App service, by creating a [Peer] and connecting it to the Daemon you are ready for it.
But first it is necessary to understand the basics of KATE's core components inside Node-Jet: **States** and **Methods**.


### Node-Jet Methods

For defining actions Node-Jet library provides **Methods**. They are defined by a unique **path** and a **function**, 
which gets invoked when the Method is called by another Peer. This snippet adds a Method which prints
two arguments to the console:

```javascript
var log = new jet.Method('log');
log.on('call', function(a, b) {
  console.log(a, b);
});

peer.add(log);
```

Another Client Peer may now consume the "log" service like this:

```javascript
otherPeer.call('log', ['Call', 'Started']);
```

Methods may have **any JSON-compatible argument** type and may **return any JSON-compatible** value.


### Jet States (Aka KATE Partners)

A Jet State is similar to a database document. It has a unique **path** and an associated value, which can
be of any JSON-compatible type. A **set callback** can be specified, which allows the State to react on change requests.
If the set function does not throw, **a State-Change is posted automatically**.

```javascript

var francis = new jet.State('persons/#12342',{name: 'Francis', age: 33});

francis.on('set', function(requestedValue) {
  if (requestedValue.age < this.value().age) {
    throw new Error('Sorry, this is not possible');
  }
});

peer.add(francis);
```

Another Peer may try to modify States:

```javascript
peer.set('persons/#52A92d', {name: 'Francis U.', age: 34});

peer.set('persons/#52A92d', {name: 'Francis U.', age: 20})
  .then(function() {
    console.log('Francis just unaged');
  }).catch(function(err) {
    console.log('Damn', err);
  });
```

This is just a simple uncomplete example to show custom validation for change requests. Jet allows you to do anything
appropriate inside the set callback, like:

   - interpolating the requested value (partial changes)
   - custom validation
   - adapting the requested value

No matter what you do, all Peers will have the actual value of the State and **stay in sync**. 
 
### Implement the Call-Server Peer

The following implementation also goes to the sdktest-server.js file. To group the Call-App functionality
in a "namespace" , all State and Method related to call has paths start with "call/". 

Create a Peer which connects to the local Daemon, an Object to store all Call States and a simple Call class.

```javascript
var peer = new jet.Peer({
  url: 'ws://localhost:' + port
});

var callStates = {};

var callId = 0;

var Call = function(title) {
  if (typeof title !== 'string') {
    throw new Error('title must be a string');
  }
  this.id = callId++;
  this.title = title;
  this.completed = false;
};

Call.prototype.merge = function(other) {
  if (other.completed !== undefined) {
    this.completed = other.completed;
  }

  if (other.title !== undefined) {
    this.title = other.title;
  }
};

Call.prototype.id = function() {
  return this.id;
};
```

Provided **call/add** Method, which will create a new Call Object in state when called.

```javascript
var addCall = new jet.Method('call/add');

addCall.on('call', function (args) {
	var title = args[0];
	var call = new Call(title);

	// create a new call state and store ref.
	var callState = new jet.State('call/#' + call.id, call);
	callState.on('set', function (requestedCall) {
		call.merge(requestedCall);
		return {
			value: call
		};

	});
	callStates[call.id] = callState;
	peer.add(callState);
});
```

The **call/remove** Method will remove the Call with specified id.

```javascript
var removeCall = new jet.Method('call/remove');

removeCall.on('call', function (args) {
	var callId = args[0];
	if (callStates[callId]) {
		callStates[callId].remove();
		delete callStates[callId];
	}
});
```

## The Test Client (Aka KATE Partners)

The Peer running in the Browser will act as a "consumer" of the Methods and States the Call-Server Peer provides.
It will:

   - **fetch** the Call States to display them in browser. This allow testers to easy follow the tests during test running.
   - call the **call/add** Method to create Calls
   - call the **call/remove** Method to delete Calls
   - edit States by calling **set**

### Jet Fetch Primer

Fetching is like having a realtime query. It provides you with initial values of States and keeps track of events.
These events include:

    - a new Call Object has been added
    - a Call Object has been removed
    - a Call State's value has changed

The Jet Daemon is able to filter and sort your fetch query based on **paths** and/or **values**. A callback must be provided
that will be invoked everytime something relevant happens. A fetch for getting the **active calls** could look like this:

```javascript
var activeCalls = new jet.Fetcher()
  .path('startsWith', 'call/')
  .key('state', 'equals', 'IN_CALL')
  .sortByKey('id', 'number')
  .range(1, 10)
  .descending()
  .on('data', function(topFemalePlayersArray) {});

peer.fetch(activeCalls);
```

Fetch is very powerful and is used during tests.
There is also **get** method which being called for check result during tests. 


### Implement Call-Client

The Call-Client implementation is straight forward:

```javascript
var peer = new jet.Peer({url: 'ws://' + window.location.host});

var addCall = function(title) {
  peer.call('call/add', [title]);
};

var removeCall = function(id) {
  peer.call('call/remove', [id]);
};

var removeAllCallss = function() {
  peer.call('call/remove', []);
};

var setCallTitle = function(id, title) {
  peer.set('call/#' + id, {title: title});
};

var setCallCompleted = function(id, completed) {
  peer.set('call/#' + id, {completed: completed});
};

var renderCalls = function(calls) {
  ...
};

var Callss = new jet.Fetcher()
  .path('startsWith', 'call/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', renderCalls);

peer.fetch(calls);
```

# Conclusion

In this article I showed you how to create a simple **realtime collaborative Call-App**
with Node.js and Jet. The call list can be edited by multiple clients simultaneously and always stays in sync.
The KATE node-jet embedded webserver performs server-side custom validation, which enables you to
keep your Tested Application integre and flexible at the same time.

You **don't need any third party server and **you always keep complete control** over your servers and your data.

At [HBM](http://www.hbm.com) the Jet protocol is used in production code of medium- and embedded-class devices 
and we are constantly working to improve it.

If you want to read more, checkout the [Kandy.js Homepage](http://jetbus.io) or its github repository:

   - [for Kandy.js + Browser](https://github.com/Fring/Kandy.js)
   - [for KATE](https://github.com/rasimavci/sdk-test)
   

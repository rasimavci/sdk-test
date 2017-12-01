var expect = chai.expect;

const Call = require('./Peer_kandy1');

var peer1 = new Call();

var jet = require('node-jet')
var peer3 = new jet.Peer({
  ///url: 'wss://47.168.247.41:8090'
  url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
})

var participant1 = ['bkocak@genband.com', 'pneg4200']
var participant2 = ['oztemur@genband.com', 'Genband.1234']
var participant3 = ['hguner@genband.com', 'ltve0168']


function checkResultMsg(stateParamName, stateParamValue, convoId) {
  return new Promise(function (resolve) {

    var id = setInterval(function () {
      peer3.get({ path: { equals: 'msg/#' + convoId } }).then(function (results) {
        var condition = results[0].value[stateParamName]
        console.log(stateParamName + ' - expected: ' + stateParamValue + ', actual: ' + results[0].value[stateParamName])


        /*
        let element = document.createElement('div');
        element.innerHTML = val
        document.getElementById('results').appendChild(element)
        */


        if (condition === stateParamValue) {
          // stop interval clearInteva
          resolve(id);
        }
        // setTimeout(function(){ resolve(id) }, 5000);
      });

    }, 1000);
  });
}

function checkResultArrayLastElement(stateParamName, stateParamValue, convoId) {
  return new Promise(function (resolve, reject) {

    var id = setInterval(function () {
      peer3.get({ path: { equals: 'msg/#' + convoId } }).then(function (results) {
        var myArray = results[0].value[stateParamName]
        console.log(stateParamName + ' - expected: ' + stateParamValue + ', actual: ' + myArray[myArray.length - 1].parts[0].text)

        if (myArray[myArray.length - 1].parts[0].text === stateParamValue) {
          // stop interval clearInteva
          resolve(id);
        }
        setTimeout(function () { reject(id) }, 5000);
      });

    }, 1000);
  });
}

function checkResultArrayLength(stateParamName, stateParamValue, convoId) {
  return new Promise(function (resolve, reject) {

    var id = setInterval(function () {
      peer3.get({ path: { equals: 'msg/#' + convoId } }).then(function (results) {
        var myArray = results[0].value[stateParamName]
        console.log(stateParamName + ' - expected: ' + stateParamValue + ', actual: ' + myArray.length)

        if (myArray.length === stateParamValue) {
          // stop interval clearInteva
          resolve(id);
        }
        setTimeout(function () { reject(id) }, 5000);
      });

    }, 1000);
  });
}

function checkLogin(stateParamName, stateParamValue) {
  return new Promise(function (resolve) {

    var id = setInterval(function () {
      peer3.get({ path: { equals: 'login/#0' } }).then(function (results) {
        console.log(stateParamName + ': ' + results[0].value[stateParamName])
        document.getElementById(stateParamName).innerHTML = results[0].value[stateParamName]
        let condition = results[0].value[stateParamName]

        if (condition === stateParamValue) {
          // stop interval clearInteva
          resolve(id);
        }
      });

    }, 1000);

  });
}

describe("Messaging Test Suite with second participant", function () {
  describe("Create conversation test", function () {
    this.timeout(15000);

    it("Should login on both participants", function (done) {
      peer3.call('login/add', ['login1'])
        .then(() => peer3.call('call/login1', [participant1[0], participant1[1]]))
        .then(() => checkLogin('isConnected1', true))
        .then((interval) => clearInterval(interval))
        .then(() => peer3.call('call/login2', [participant2[0], participant2[1]]))
        .then(() => checkLogin('isConnected2', true))
        .then((interval) => clearInterval(interval))
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Should create conversation object for first participant", function (done) {
      peer3.call('msg/add', ['msg1'])
        .then(() => peer3.call('msg/createConversation1', [participant2[0], 1]))
        .then(() => checkResultMsg('conversation_orig', true, 0))
        .then((interval) => clearInterval(interval))
        //  .then(() => checkResultMsg('conversation_started', true))
        //  .then((interval) => clearInterval(interval))          
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Should create conversation object for second participant", function (done) {
      peer3.call('msg/createConversation2', [participant1[0]])
        .then(() => checkResultMsg('conversation_term', true, 0))
        .then((interval) => clearInterval(interval))
        //  .then(() => checkResultMsg('conversation_started', true))
        //  .then((interval) => clearInterval(interval))          
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

  });


  describe("Basic message test", function () {
    this.timeout(15000);

    it("First participant should send message to other participant", function (done) {
      peer3.call('msg/imSend1', ['Hello Participant #2', 1])
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Second participant should receive message", function (done) {
      checkResultArrayLastElement('messages_term', 'Hello Participant #2', 0)
        .then((interval) => clearInterval(interval))
        .then(() => {
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Second participant should send message to other participant", function (done) {
      peer3.call('msg/imSend2', ['Hello Participant #1'])
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("First participant should receive message", function (done) {
      checkResultArrayLastElement('messages_orig', 'Hello Participant #1', 0)
        .then((interval) => clearInterval(interval))
        .then(() => {
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

  });

  describe("Clear message test", function () {
    this.timeout(15000);

    it("Second participant should clear message", function (done) {
      peer3.call('msg/clearMessage2', [''])
        .then((interval) => clearInterval(interval))
        .then(() => {
          done();
        })
        .catch(err => {
          console.log(err);
          done(err);
        })
    });

    it("Second participant should validate the message is cleared", function (done) {
      checkResultArrayLength('messages_term', 0, 0)
        .then((interval) => clearInterval(interval))
        .then(() => {
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("First participant should clear message", function (done) {
      peer3.call('msg/clearMessage1', [1])
        .then((interval) => clearInterval(interval))
        .then(() => {
          done();
        })
        .catch(err => {
          console.log(err);
          done(err);
        })
    });

    it("First participant should validate the message is cleared", function (done) {
      checkResultArrayLength('messages_orig', 0, 0)
        .then((interval) => clearInterval(interval))
        .then(() => {
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    /*
    it("Should logout on both participants", function (done) {
      peer3.call('login/add', ['login1'])
        .then(() => peer3.call('call/logout1', ['']))
        .then(() => checkLogin('isConnected1', false))
        .then((interval) => clearInterval(interval))
        .then(() => peer3.call('call/logout2', ['']))
        .then(() => checkLogin('isConnected2', false))
        .then((interval) => clearInterval(interval))
        .then(() => {
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });
    */

  });

});



describe("Messaging Test Suite with third participant", function () {
  describe("Create conversation test", function () {
    this.timeout(15000);

    it("Should login on third participant", function (done) {
      peer3.call('call/login3', [participant3[0], participant3[1]])
        .then(() => checkLogin('isConnected3', true))
        .then((interval) => clearInterval(interval))
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Should create conversation object for first participant", function (done) {
      peer3.call('msg/createConversation1', [participant3[0], 2])
        .then(() => checkResultMsg('conversation_orig', true, 1))
        .then((interval) => clearInterval(interval))
        //  .then(() => checkResultMsg('conversation_started', true))
        //  .then((interval) => clearInterval(interval))          
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Should create conversation object for third participant", function (done) {
      peer3.call('msg/createConversation3', [participant1[0]])
        .then(() => checkResultMsg('conversation_term', true, 0))
        .then((interval) => clearInterval(interval))
        //  .then(() => checkResultMsg('conversation_started', true))
        //  .then((interval) => clearInterval(interval))          
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

  });


  describe("Basic message test", function () {
    this.timeout(15000);

    it("Third participant should send message to other participant", function (done) {
      peer3.call('msg/imSend1', ['Hello Participant #3', 2])
        .then(() => {
          //returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Third participant should receive message", function (done) {
      checkResultArrayLastElement('messages_term', 'Hello Participant #3', 1)
        .then((interval) => clearInterval(interval))
        .then(() => {
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

  });

  describe("Clear message test", function () {
    this.timeout(15000);

    it("Third participant should clear message", function (done) {
      peer3.call('msg/clearMessage3', [''])
        .then((interval) => clearInterval(interval))
        .then(() => {
          done();
        })
        .catch(err => {
          console.log(err);
          done(err);
        })
    });

    it("Third participant Should validate the message is cleared", function (done) {
      checkResultArrayLength('messages_term', 0, 1)
        .then((interval) => clearInterval(interval))
        .then(() => {
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

  });

  /*
  describe("Subscribe to conversation test", function () {
    this.timeout(15000);
    it("Subscribe callback should fired for participants", function (done) {
    });
  });
  describe("Unsubscribe to conversation test", function () {
    this.timeout(15000);
    it("Unsubscribe callback should fired for participants", function (done) {
    });
  });
  */

}); 
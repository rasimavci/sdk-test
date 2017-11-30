var expect = chai.expect;

const Call = require('./Peer_kandy1');
var peer1 = new Call();

var jet = require('node-jet')
var peer3 = new jet.Peer({
  ///url: 'wss://47.168.247.41:8090'
  url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
})
/*
var returnResult = function (stateParamName, stateParamValue) {

  return new Promise((resolve) => {
    peer3.get({ path: { equals: 'call/#0' } }).then(function (results) {
      console.log(stateParamName + ': ' + results[0].value[stateParamName])
      resolve(results[0].value[stateParamName]);
    });
  });

}
*/

var user1 = ['ravci@genband.com', 'yjke9884']
var user2 = ['hguner@genband.com', 'ltve0168']
var user3 = ['oztemur@genband.com', 'Genband.1234']
var user4 = ['bkocak@genband.com', 'pneg4200']

  var promiseArrayLogin = [
    peer3.call('login/add', ['login1']),
    peer3.call('call/login1', ['ravci@genband.com', 'yjke9884']),
    peer3.call('call/login2', ['hguner@genband.com', 'ltve0168']),
  ];

var returnResult = function (stateParamName, stateParamValue) {
    return peer3.get({ path: { equals: 'call/#0' } }).then(function (results) {
        console.log(stateParamName + ': ' + results[0].value[stateParamName]);
        return(results[0].value([stateParamName]));
    });
}

function checkResult(stateParamName, stateParamValue) {
  return new Promise(function (resolve) {
    var id = setInterval(function () {
      peer3.get({ path: { equals: 'call/#0' } }).then(function (results) {
        console.log(stateParamName + ' - expected: ' + stateParamValue + ', actual: ' +results[0].value[stateParamName])
        let condition = results[0].value[stateParamName]
        if (condition === stateParamValue) {
          resolve(id);
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
/*
document.getElementById('login-btn').addEventListener('click', function () {
  var loginId = document.getElementById('username').value
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

document.getElementById('end-btn').addEventListener('click', function () {
  peer3.call('call/login1', ['empty']).then(function (result) {
    console.log('Instructor: started login on peer1', result);
  }).catch(function (err) {
    console.log('Instructor: start login on peer1 failed', err);
  });

})
*/

describe("On Prem Test Suite", function () {
  describe("Basic Call Test", function () {
    this.timeout(1500000);
    it("Orig side Call Status should be IN_CALL", function (done) {
      peer3.call('login/add', ['login1'])
        .then(() => peer3.call('call/login1', [user1[0], user1[1]]))
        .then(() => checkLogin('isConnected1', true))
        .then((interval) => clearInterval(interval))
        .then(() => peer3.call('call/login2', [user2[0], user2[1]]))
        .then(() => checkLogin('isConnected2', true))
        .then((interval) => clearInterval(interval))
        .then(() => peer3.call('call/add', ['call1']))
        .then(() => peer3.call('call/makeCall1', [user2[0]]))
        .then(() => checkResult('call_term', 'incoming'))
        .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
        .then(() => checkResult('state_orig', 'IN_CALL'))
        .then((interval) => clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })

    });


  it("Term side Call Status should be IN_CALL", function (done) {
        checkResult('state_term', 'IN_CALL')
        .then((interval) => clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })

    });

  it("Call Should end properly", function (done) {
        peer3.call('call/end1', [''])
        .then(() => checkResult('state_term', 'ENDED'))
        .then((interval) =>  clearInterval(interval)) 
        .then(() => checkResult('state_orig', 'ENDED'))
        .then((interval) =>  clearInterval(interval))                    
        .then(() => checkResult('mediaState_orig', 'CLOSED'))
        .then((interval) =>  clearInterval(interval))    
        .then(() => peer3.call('call/clearCompleted', [0]))   
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })

    });    

  });

  describe("Hold Unhold Test", function () {
          this.timeout(1500000);
    it("Call status should be ON_HOLD after unhold", function (done) {
  peer3.call('call/add', ['call1'])
    .then(() => peer3.call('call/login1', [user1[0], user1[1]]))
    .then(() => checkLogin('isConnected1', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/login2', [user2[0], user2[1]]))
    .then(() => checkLogin('isConnected2', true))
    .then((interval) => clearInterval(interval))
    .then(() => peer3.call('call/makeCall1', [user2[0]]))
    .then(() => checkResult('state_term', 'RINGING'))
    .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) => { clearInterval(interval); peer3.call('call/hold1', ['empty']) })
    .then(() => checkResult('state_orig', 'ON_HOLD'))
    .then((interval) => clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Term Call status should be ON_REMOTE_HOLD", function (done) {
    checkResult('state_term', 'ON_REMOTE_HOLD')
    .then((interval) =>  clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Orig Call status should be IN_CALL after unhold", function (done) {
    peer3.call('call/unhold1', ['empty']) 
    .then(() => checkResult('state_orig', 'IN_CALL'))
    .then((interval) =>  clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

    it("Term Call status should be IN_CALL after unhold", function (done) {
    checkResult('state_term', 'IN_CALL')
    .then((interval) =>  clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

  it("Call Should end properly", function (done) {
        peer3.call('call/end1', [''])
        .then(() => checkResult('state_term', 'ENDED'))
        .then((interval) =>  clearInterval(interval)) 
        .then(() => checkResult('state_orig', 'ENDED'))
        .then((interval) =>  clearInterval(interval))         
        .then(() => checkResult('mediaState_orig', 'CLOSED'))
        .then((interval) =>  clearInterval(interval))
        .then(() => peer3.call('call/clearCompleted', [0]))       
        .then(() => {
          done();
        })
        .catch(err => {
          console.log(err);
          done(err);
        })

    });    

  });

describe("Video Call Test", function () {
    this.timeout(1500000);
    it("Video Call status should be established", function (done) {
      document.getElementById('sendInitialVideo').checked = true
           peer3.call('call/add', ['call1'])
    //  Promise.all(promiseArrayLogin)
//peer3.call('login/add', ['login1'])
.then(peer3.call('call/login1', [user1[0], user1[1]]))
.then(() => checkLogin('isConnected1', true))
.then((interval) => clearInterval(interval))
.then(peer3.call('call/login2', [user2[0], user2[1]]))
        .then(() => checkLogin('isConnected2', true))
        .then((interval) => clearInterval(interval))
        .then(() => peer3.call('call/add', ['call1']))
        .then(() => peer3.call('call/makeCall1', [user2[0]]))
        .then(() => checkResult('state_term', 'RINGING'))
        .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
        .then(() => checkResult('state_term', 'IN_CALL'))
        .then((interval) => clearInterval(interval))
        .then(() => checkResult('state_orig', 'IN_CALL'))
        .then((interval) => clearInterval(interval))
        .then(() => {
          //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

  it("Call Should end properly", function (done) {
        peer3.call('call/end1', [''])
        .then(() => checkResult('state_term', 'ENDED'))
        .then((interval) =>  clearInterval(interval)) 
        .then(() => checkResult('state_orig', 'ENDED'))
        .then((interval) =>  clearInterval(interval))         
        .then(() => checkResult('mediaState_orig', 'CLOSED'))
        .then((interval) =>  clearInterval(interval))
        .then(() => peer3.call('call/clearCompleted', [0]))       
        .then(() => {
          done();
        })
        .catch(err => {
          console.log(err);
          done(err);
        })
    });      
  });

  describe("Video Stop Start Test", function () {
    this.timeout(1500000);
    it("Video Call status should be established", function (done) {
      document.getElementById('sendInitialVideo').checked = true
           peer3.call('call/add', ['call1'])
    //  Promise.all(promiseArrayLogin)
//peer3.call('login/add', ['login1'])
.then(peer3.call('call/login1', [user1[0], user1[1]]))
.then(() => checkLogin('isConnected1', true))
.then((interval) => clearInterval(interval))
.then(peer3.call('call/login2', [user2[0], user2[1]]))
        .then(() => checkLogin('isConnected2', true))
        .then((interval) => clearInterval(interval))
        .then(() => peer3.call('call/add', ['call1']))
        .then(() => peer3.call('call/makeCall1', [user2[0]]))
        .then(() => checkResult('state_term', 'RINGING'))
        .then((interval) => { clearInterval(interval); peer3.call('call/answerCall2', ['empty']) })
        .then(() => checkResult('state_term', 'IN_CALL'))
        .then((interval) => clearInterval(interval))
        .then(() => checkResult('state_orig', 'IN_CALL'))
        .then((interval) => clearInterval(interval))
        .then(() => {
          //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });

//DISCONNECTED
//CHECKING
//CONNECTED

  it("Video Stop Should be successfull", function (done) {
    peer3.call('call/videoStop1', ['empty'])
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });


  it("Media State Should DISCONNECTED", function (done) {
checkResult('mediaState_term', 'DISCONNECTED')    
    .then((interval) => clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });  

  it("Media State Should CHECKING", function (done) {
checkResult('mediaState_term', 'CHECKING')   
    .then((interval) => clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });  

  it("Media State Should CONNECTED", function (done) {
checkResult('mediaState_term', 'CONNECTED')    
    .then((interval) => clearInterval(interval))
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    });      


  it("Video Start should be function properly", function (done) {
    peer3.call('call/videoStart1', ['empty'])
    .then(() => checkResult('mediaState_term', 'CONNECTED'))     
        .then(() => {
     //     returnResult('state_term', 'IN_CALL').then((result) => expect(result).to.equal("IN_CALL"))
          done(); //dont use .then(done) or things may break due to extra 
        })
        .catch(err => {
          console.log(err);
          done(err); //passing a parameter to done makes the test fail.
        })
    }); 

  it("Call Should end properly", function (done) {
        peer3.call('call/end1', [''])
        .then(() => checkResult('state_term', 'ENDED'))
        .then((interval) =>  clearInterval(interval)) 
        .then(() => checkResult('state_orig', 'ENDED'))
        .then((interval) =>  clearInterval(interval))         
        .then(() => checkResult('mediaState_orig', 'CLOSED'))
        .then((interval) =>  clearInterval(interval))
        .then(() => peer3.call('call/clearCompleted', [0]))       
        .then(() => {
          done();
        })
        .catch(err => {
          console.log(err);
          done(err);
        })

    });      

  });

/*
  describe("Video Escalation Test", function () {
    it("Call status should be IN CALL after unhold", function () {
      expect(5).to.equal(5)
    });

  });

  describe("Blind Transfer Test", function () {
    it("Call status should be IN CALL after unhold", function () {
      expect(5).to.equal(5)
    });

  });
*/
});




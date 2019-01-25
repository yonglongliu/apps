/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: key.js
// * Description: mmitest -> test item: key test.
// * Note:
// ************************************************************************

/* global TestItem */
'use strict';

var KeyPadTest = new TestItem();

function TestItem() {
  dump('TestItem');
};
TestItem.prototype.handleKeydown = function(evt) {
  evt.preventDefault();
  var event;
  var ret = this.onHandleEvent(evt);
  if (ret) {
    return;
  }
};

KeyPadTest.result = {
  one: false,
  two: false,
  three: false,
  four: false,
  five: false,
  six: false,
  seven: false,
  eight: false,
  nine: false,
  star: false,
  zero: false,
  fourone: false,
  softleft: false,
  softright: false,
  arrowup: false,
  arrowdown: false,
  arrowleft: false,
  arrowright: false,
  backspace: false,
  enter: false,
  acacall: false
};

KeyPadTest.onHandleEvent = function (evt) {
  evt.preventDefault();

  var rskResult = KeyPadTest.result['softright'];
  if (keyId) {
    KeyPadTest.result[keyId] = true;
  }

  // _pcTestCommander.sendCmd(evt.key);

  var event = new CustomEvent('enterKey', {
    detail: {
      current: evt.key
    }
  });
  window.dispatchEvent(event);

  return !((evt.key === 'SoftRight' || evt.key === 'SoftLeft') && rskResult);
};


// KeyPadTest.onkeyevent = function(evt) {
//   if (evt.type == 'sleep-button-press'){
//     document.getElementById('power').style.color = 'blue';
//     KeyPadTest.result['power'] = true;
//     KeyPadTest.checkIfAllDone();
//   }
// };

// KeyPadTest.showClam = function() {
//   navigator.getFlipManager && navigator.getFlipManager().then((fm) => {
//     this._flipManager = fm;
//     this._flipManager.addEventListener('flipchange', function(){
//       document.getElementById('clam').style.color = 'blue';
//       KeyPadTest.result['clam'] = true;
//       KeyPadTest.checkIfAllDone();
//     });
//   });
// };

//the following are inherit functions
KeyPadTest.onInit = function() {
  // this.passButton.disabled = 'disabled';
  // this.failButton.disabled = 'disabled';
  // this.showClam();
};

KeyPadTest.onDeinit = function() {
};

// window.addEventListener('load', KeyPadTest.init.bind(KeyPadTest));
// window.addEventListener('beforeunload', KeyPadTest.uninit.bind(KeyPadTest));
window.addEventListener('keydown', KeyPadTest.handleKeydown.bind(KeyPadTest));

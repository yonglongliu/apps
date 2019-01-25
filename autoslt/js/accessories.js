/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: accessories.js
// * Description: mmitest -> test item: accessories(headset).
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

const STEP_HEADSET_DETECT = 0;
const STEP_HEADSET_EAR = 1;
const STEP_HEADSET_MIC = 2;
const STEP_HEADSET_KEY = 3;
const STEP_HEADSET_REMOVE = 4;

const HEADSET_MIC_CMD = 'AT+SPVLOOP=1,2,8,2,3,0';
const HEADSET_RESET_CMD = 'AT+SPVLOOP=0,2,8,2,3,0';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [accessories.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

function click(event) {
  //click fail to close test item, need time to stop headset...
  setTimeout(function() {
    if (parent.ManuTest !== undefined) {
      parent.ManuTest.handleEvent.call(parent.ManuTest, event);
    } else {
      parent.AutoTest.handleEvent.call(parent.AutoTest, event);
    }
  }, 800);
}

var AccessoriesTest = new TestItem();

AccessoriesTest.onInit = function() {
  this.step = 0;
  this.plugFlag = false;
  this.audio = $('audio-element-id');

  this.acm = navigator.mozAudioChannelManager;

  if (this.acm) {
    this.acm.addEventListener('headphoneschange',
        this.onHeadsetStatusChanged.bind(this));
    // Check if the headset plug in before enter test
    this.onHeadsetStatusChanged();
  } else {
    $('centertext').innerHTML = 'mozAudioChannelManager not supported';
  }
};

AccessoriesTest.onHeadsetStatusChanged = function() {
  debug('onHeadsetStatusChanged');
  if (this.acm.headphones) {
    $('centertext').innerHTML = 'Headset detected';
    this.plugFlag = true;
    this.step = 0;
    this.passButton.disabled = '';
    this.failButton.disabled = '';
  } else {
    if (this.step !== STEP_HEADSET_REMOVE) {
      this.plugFlag = false;
      $('centertext').innerHTML = 'Please plug in headset';
      this.passButton.disabled = 'disabled';
      this.failButton.disabled = '';
    } else {
      this.plugFlag = false;
      $('centertext').innerHTML = 'Accessories all pass';
      this.passButton.disabled = '';
      this.failButton.disabled = '';
      this.autoPass(1000);
    }
  }
};

AccessoriesTest.earTest = function() {
  $('centertext').innerHTML = 'headset test';
  this.audio.play();

  setTimeout(this.timeoutCallback.bind(this), 1500);
  AccessoriesTest.step++;
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = 'disabled';
  this.passButton.style.visibility = 'visible';
  this.failButton.style.visibility = 'visible';
};

AccessoriesTest.closeEarTest = function() {
  if (this.audio) {
    this.audio.pause();
    document.body.removeChild(this.audio);
  }
};

AccessoriesTest.earMicTest = function() {
  $('centertext').innerHTML = 'preparing ...';

  this.passButton.disabled = 'disabled';
  this.failButton.disabled = 'disabled';
  this.passButton.style.visibility = 'visible';
  this.failButton.style.visibility = 'visible';
  AccessoriesTest.step++;
  setTimeout(() => {
    $('centertext').innerHTML = 'headset mic test';
    RemoteHelper.sendATCommand(HEADSET_MIC_CMD);
    setTimeout(this.timeoutCallback.bind(this), 1500);
  }, 500);
};

AccessoriesTest.earKeyTest = function() {
  $('centertext').innerHTML = 'Please press headset answer key';
  AccessoriesTest.step++;
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = '';
  this.passButton.style.visibility = 'visible';
  this.failButton.style.visibility = 'visible';
};

AccessoriesTest.closeKeyTest = function() {
  $('centertext').innerHTML = 'Answer key pressed';
  this.passButton.disabled = '';
};

AccessoriesTest.removeHeadsetTest = function() {
  $('centertext').innerHTML = 'Please remove headset';
  AccessoriesTest.step++;
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = '';
  this.passButton.style.visibility = 'visible';
  this.failButton.style.visibility = 'visible';
};

AccessoriesTest.timeoutCallback = function() {
  if (this.plugFlag) {
    this.passButton.disabled = '';
    this.failButton.disabled = '';
    this.passButton.style.visibility = 'visible';
    this.failButton.style.visibility = 'visible';
  } else {
    this.passButton.disabled = 'disabled';
    this.failButton.disabled = '';
    this.passButton.style.visibility = 'invisible';
    this.failButton.style.visibility = 'visible';
  }
};

AccessoriesTest.rollBackAudio = function() {
  RemoteHelper.sendATCommand(HEADSET_RESET_CMD);
};

AccessoriesTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  if (evt.type === 'keydown') {
    dump('<mmitest> ------ onHandleEvent evt.key='+evt.key);
    switch (evt.key) {
      case 'SoftLeft':
        if (this.passButton.disabled) {
          return false;
        }

        if (this.step === STEP_HEADSET_DETECT) {
          this.earTest();
        } else if (this.step === STEP_HEADSET_EAR) {
          this.closeEarTest();
          this.earMicTest();
        } else if (this.step === STEP_HEADSET_MIC) {
          this.rollBackAudio();
          this.earKeyTest();
        } else if (this.step === STEP_HEADSET_KEY) {
          this.removeHeadsetTest();
        } else if (this.step > STEP_HEADSET_KEY) {
          click({type: 'click', name: 'pass'});
          return true;
        } else {
          return false;
        }
        return true;
      case 'SoftRight':
        if (this.failButton.disabled) {
          return false;
        }
        this.rollBackAudio();
        if (this.step <= STEP_HEADSET_MIC) {
          click({type: 'click', name: 'fail'});
          return true;
        }
        break;

      case 'VolumeUp':
      case 'VolumeDown':
        if (this.step === STEP_HEADSET_KEY) {
          this.closeKeyTest();
        }
        break;

      default:
        break;
    }
  }
  return false;
};

AccessoriesTest.onDeinit = function() {
  this.rollBackAudio();
  this.closeEarTest();
};

AccessoriesTest.visibilityChange = function() {
  if (document.mozHidden) {
    this.onDeinit();
  }
};

window.addEventListener('load', AccessoriesTest.init.bind(AccessoriesTest));
window.addEventListener('keydown', AccessoriesTest.handleKeydown.bind(AccessoriesTest));
window.addEventListener('beforeunload', AccessoriesTest.uninit.bind(AccessoriesTest));
window.addEventListener('mozvisibilitychange', AccessoriesTest.visibilityChange.bind(AccessoriesTest));

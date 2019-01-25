/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: audio.js
// * Description: mmitest -> test item: audio test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [audio.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

const MIC_CMD = 'AT+SPVLOOP=1,1,8,2,3,0';
const RESET_CMD = 'AT+SPVLOOP=0,1,8,2,3,0';

var AudioTest = new TestItem();

AudioTest.audio = $('audio-element-id');

AudioTest.isAudioPlaying = false;
AudioTest.isAudioLoopProcessing = false;

AudioTest.testIndex = 0;
AudioTest.testItems = [
  'receiver',
  'speaker',
  'mic',
  //'sub-mic'  // no sub mic
];

AudioTest.setDefaultVolume = function() {
  // set to default volume to make sure we can test
  var settings = window.navigator.mozSettings;
  if (settings) {
    settings.createLock().set({'audio.volume.telephony': 5});
    settings.createLock().set({'audio.volume.content': 15});
  }
};

AudioTest.resumeVolume = function() {
  var settings = window.navigator.mozSettings;
  if (settings) {
    settings.createLock().set({'audio.volume.content': 8});
  }
};

AudioTest.checkStartAudio = function(speakerEnabled) {
  debug('AudioTest.checkStartAudio');
  this.checkStopAudioLoop();
  navigator.mozTelephony.speakerEnabled = speakerEnabled;

  if (!this.isAudioPlaying) {
    if (navigator.jrdExtension) {
      navigator.jrdExtension.startForceInCall();
    }
    debug('AudioTest: startForceInCall');
    try {
      this.audio.play();
      this.isAudioPlaying = true;
    } catch (e) {
      debug(e);
    }
  }
};

AudioTest.checkStopAudio = function() {
  debug('AudioTest.checkStopAudio');
  if (this.isAudioPlaying) {
    this.audio.pause();
    this.audio.removeAttribute('src');
    if (navigator.jrdExtension) {
      navigator.jrdExtension.stopForceInCall();
    }
    debug('AudioTest: stopForceInCall');
    this.isAudioPlaying = false;
  }
};

AudioTest.checkStartAudioLoop = function(type) {
  debug('AudioTest.checkStartAudioLoop');
  this.checkStopAudio();
  this.checkStopAudioLoop();
  this.isAudioLoopProcessing = true;
  window.setTimeout(function() {
    debug('AudioTest.checkStartAudioLoop.setTimeout');
    if (navigator.jrdExtension) {
      navigator.jrdExtension.startAudioLoopTest(type);
    }
  }, 3000);
};

AudioTest.checkStopAudioLoop = function() {
  debug('AudioTest.checkStopAudioLoop');
  if (this.isAudioLoopProcessing) {
    if (navigator.jrdExtension) {
      navigator.jrdExtension.startAudioLoopTest('stop-mic');
      navigator.jrdExtension.startAudioLoopTest('stop-sub-mic');
      navigator.jrdExtension.stopAudioLoopTest();
    }
    this.isAudioLoopProcessing = false;
  }
};

AudioTest.micLoop = function() {
  RemoteHelper.sendATCommand(MIC_CMD);
};

AudioTest.resetLoop = function() {
  RemoteHelper.sendATCommand(RESET_CMD);
}

AudioTest.doTest = function() {
  debug('AudioTest.doTest');
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = 'disabled';
  switch (this.testItems[this.testIndex]) {
    case 'receiver':
      debug('AudioTest.doTest = receiver');
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), 4000);
      $('centertext').innerHTML = 'receiver test';
      this.checkStartAudio(false); //speakerEnabled false.
      break;

    case 'speaker':
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), 4000);
      debug('AudioTest.doTest = speaker');
      $('centertext').innerHTML = 'speaker test';
      this.checkStartAudio(true); //speakerEnabled true.
      break;

    case 'mic':
      debug('AudioTest.doTest = mic');
      $('centertext').innerHTML = 'loop from MIC test';
      clearTimeout(this._timer);
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), 5500);
      this.micLoop();
      break;

    case 'sub-mic':
      debug('AudioTest.doTest = sub-mic');
      $('centertext').innerHTML = 'loop from Sub MIC test';
      clearTimeout(this._timer);
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), 5500);
      this.checkStartAudioLoop('sub-mic');
      break;

    default:
      break;
  }
};

AudioTest.timeoutCallback = function() {
  this.passButton.disabled = '';
  this.failButton.disabled = '';
  this.passButton.style.visibility = 'visible';
  this.failButton.style.visibility = 'visible';
};

AudioTest.visibilityChange = function() {
  debug('AudioTest.visibilityChange');
  if (document.mozHidden) {
    debug('AudioTest: visibilityChange-hide');
    this.checkStopAudio();
    this.checkStopAudioLoop();
    this.resetLoop();
  } else {
    debug('AudioTest: visibilityChange-visible');
    this.doTest();
  }
};

//the following are inherit functions
AudioTest.onInit = function() {
  debug('AudioTest.onInit');
  if (!navigator.jrdExtension) {
    $('centertext').innerHTML = 'not support jrdExtension';
    return;
  }

  this.setDefaultVolume();
  this.doTest();
};

AudioTest.onDeinit = function() {
  debug('AudioTest.onDeinit');
  this.resetLoop();
  this.checkStopAudio();
  this.checkStopAudioLoop();
  this.resumeVolume();
};

AudioTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  debug('AudioTest.onHandleEvent');
  switch (evt.type) {
    case 'keydown':
      switch (evt.key) {
        case 'SoftLeft':
          if (this.passButton.disabled) {
            return;
          }
          this.handleMicOrSubMic();
          this.testIndex++;
          if (this.testIndex < this.testItems.length) {
            this.doTest();
            return true;
          }
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
  return false;
};

AudioTest.handleMicOrSubMic = function() {
  var currentTestItem = this.testItems[this.testIndex];
  if (currentTestItem === 'mic' || currentTestItem === 'sub-mic') {
    this.resetLoop();
    this.checkStopAudio();
    this.checkStopAudioLoop();
  }
};

window.addEventListener('load', AudioTest.init.bind(AudioTest));
window.addEventListener('beforeunload', AudioTest.uninit.bind(AudioTest));
window.addEventListener('mozvisibilitychange', AudioTest.visibilityChange.bind(AudioTest));
window.addEventListener('keydown', AudioTest.handleKeydown.bind(AudioTest));

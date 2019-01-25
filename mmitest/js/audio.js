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

const ENABLE_CMD = 'AT+SPVLOOP=1,1,8,2,3,0';
const RESET_CMD = 'AT+SPVLOOP=0,1,8,2,3,0';
const MIC_CMD = 'AT+SPVLOOP=4,,,,,,2,1';
const ASSIS_MIC_CMD = 'AT+SPVLOOP=4,,,,,,2,2';

var AudioTest = new TestItem();

//var cmdCount = 0;
var nxpSuccess = false;
var Calibration_Min = 6.4;
var Calibration_Max = 10;

AudioTest.audio = $('audio-element-id');

AudioTest.isAudioPlaying = false;
AudioTest.isAudioLoopProcessing = false;

AudioTest.testIndex = 0;
AudioTest.testItems = [
  'receiver',
  'speaker',
  'mic',
  'sub-mic'  // no sub mic
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

  if(this.isAudioPlaying){
    this.audio.pause();
    this.isAudioPlaying = false;
  }

  if (this.nxpaudio) {
     this.nxpaudio.pause();
     this.nxpaudio.removeAttribute('src');
  }

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
    this.checkStopNXPAudio();
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

AudioTest.EnableLoop = function() {
  debug('AudioTest.EnableLoop');
  var self = this;
  RemoteHelper.sendATCommand(ENABLE_CMD,() => {
    debug('AudioTest.EnableLoop success testIndex=' + self.testIndex);
    if(self.testIndex === 3) {
      window.setTimeout(function() {
        debug('AudioTest assest sub mic test');
        self.assisMicLoop();
        }, 100);
     } else if (self.testIndex === 2) {
      window.setTimeout(function() {
        debug('AudioTest  sub mic test');
        self.micLoop();
      }, 100);
    }
  });
};

AudioTest.resetLoop = function() {
  debug('AudioTest.resetLoop');
  var self = this;
  RemoteHelper.sendATCommand(RESET_CMD,() => {
   debug('AudioTest.resetLoop success testIndex=' + self.testIndex);
   if(self.testIndex === 3) {
     window.setTimeout(function() {
       debug('AudioTest next sub mic test');
       self.EnableLoop();
         }, 100);
      }
   });
};
AudioTest.micLoop = function() {
  debug('AudioTest.micLoop');
  RemoteHelper.sendATCommand(MIC_CMD,() => {
    debug('AudioTest micLoop success');
});
};

AudioTest.assisMicLoop = function() {
  debug('AudioTest.assisMicLoop');
  RemoteHelper.sendATCommand(ASSIS_MIC_CMD,() => {
   debug('AudioTest assisMicLoop success');
  });
};

AudioTest.hasNXP = function() {
  var isNXP = window.localStorage.getItem('hasNXP');
  debug(' hasNXP ' + isNXP);
  if (isNXP && 'true' === isNXP){
    return true;
  }
  return false;
};

AudioTest.checkStopNXPAudio = function() {
   if (this.nxpaudio) {
     this.nxpaudio.pause();
     this.nxpaudio.removeAttribute('src');
   }
};

AudioTest.startSpeaker = function() {
  this._timer = window.setTimeout(this.timeoutCallback.bind(this), 4000);
  debug('AudioTest.doTest = speaker');
  this.checkStartAudio(true); //speakerEnabled true.
};

AudioTest.checkCalibrationInfo = function() {
  debug('checkCalibrationInfo');
  //debug('checkCalibrationInfo cmdCount=' + cmdCount);
  
  var cmdNXPCalshow = "climax -dsysfs -l /vendor/firmware/tfa9897.cnt --calshow | grep 'calibration impedance' | tr -cd '[0-9].'";
  setTimeout(() =>{
       RemoteHelper.sendCommand([{cmd: cmdNXPCalshow,type: 'nxp'}],AudioTest.getCalshowSuccesss,AudioTest.getCalshowError);
  },200);
};

var oldValue = 0.0;
AudioTest.getCalshowSuccesss = function (queue, response) {
    debug('getSuccess response='+response);
    oldValue = response;
    $('nxptext').innerHTML = 'Calibration value is: '+ response + ' ohm';
    var cmdNXPReset = "climax -dsysfs -l /vendor/firmware/tfa9897.cnt --resetMtpEx";
    setTimeout(() =>{
        RemoteHelper.sendCommand([{cmd: cmdNXPReset,type: 'nxp'}],AudioTest.getResetOnSuccess,AudioTest.getOnError);
    },300);

};

 // var cmdNXPReset = "climax -dsysfs -l /vendor/firmware/tfa9897.cnt --resetMtpEx";
 // RemoteHelper.sendCommand([{cmd: cmdNXPReset,type: 'nxp'}],AudioTest.getResetOnSuccess,AudioTest.getOnError);
AudioTest.getCalshowError = function (queue, response) {
    debug('calshow getOnError response='+response);
};

AudioTest.getOnError = function (queue, response) {
  debug('getOnError response='+response);
  if (!nxpSuccess ) {
    debug('!nxpSuccess');
    AudioTest.failButton.disabled = '';
  }
};

AudioTest.getResetOnSuccess = function (queue, response) {
  debug('getResetOnSuccess response='+response);
  var cmdNXPCalibrate = "climax -dsysfs -l /vendor/firmware/tfa9897.cnt --calibrate=once | grep 'Calibration value' | tr -cd '[0-9]\.'";
  setTimeout(() =>{
      RemoteHelper.sendCommand([{cmd: cmdNXPCalibrate,type: 'nxp'}], AudioTest.getResultOnSuccess, AudioTest.getOnError);
  },500);
};

AudioTest.getResultOnSuccess = function (queue, response) {
  debug('getResultOnSuccess response='+response);
  var result = response;
  if (result && (result >= Calibration_Min && result <= Calibration_Max)) {
    debug('Calibration value is:'+result);
    nxpSuccess = true;
    $('nxptext').innerHTML = 'Calibration Old value: ' + oldValue + ' New value: ' + result;
    $('test_result').innerHTML = '<p class="' + 'result-pass' + '">'+ 'Result Pass' +'</p>' ;
    AudioTest.checkStopNXPAudio();
    setTimeout(() => {
     // $('nxptext').innerHTML='';
     // $('nxptext').style.visibility = 'none';
     // $('test_result').innerHTML='';
     // $('test_result').style.visibility = 'none';
      AudioTest.startSpeaker();
    },300);

  } else {
   // if (cmdCount > 2) {
      debug('NXPTest failed');
      AudioTest.failButton.disabled ='';
      $('nxptext').innerHTML = 'Calibration value is: '+ result + ' ohm';
      $('test_result').innerHTML = '<p class="' + 'result-fail' + '">'+ 'Result Fail' +'</p>' ;
  //  }
  }
};

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
      if (AudioTest.hasNXP()) {
        this.checkStopAudio();
        debug('AudioTest.doTest = nxp');
        if (!this.nxpaudio) {
          this.nxpaudio = $('audio-nxp-id');
        }
        this.nxpaudio.play();
        $('centertext').innerHTML = 'nxp speaker test';
        $('nxptext').innerHTML = 'Waiting for calibrate...'
        setTimeout(()=>{
          this.checkCalibrationInfo();
        },500);
      } else {
        $('centertext').innerHTML = 'speaker test';
        this.startSpeaker();
      }
      break;

    case 'mic':
      debug('AudioTest.doTest = mic');
      $('nxptext').innerHTML='';
      $('nxptext').style.visibility = 'none';
      $('test_result').innerHTML='';
      $('test_result').style.visibility = 'none';
      $('centertext').innerHTML = 'loop from MIC test';
      clearTimeout(this._timer);
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), 5500);
      this.EnableLoop();
      break;

    case 'sub-mic':
      debug('AudioTest.doTest = sub-mic');
      $('centertext').innerHTML = 'loop from Sub MIC test';
      clearTimeout(this._timer);
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), 5500);
      // this.checkStartAudioLoop('sub-mic');
      //this.assisMicLoop();
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
  this.checkStopNXPAudio();
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

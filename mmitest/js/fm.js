/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: fm.js
// * Description: mmitest -> test item: fm radio test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [fm.js] = ' + s + '\n');
  }
}

var mozFMRadio = navigator.mozFMRadio;

var specialfreq_1 = 99.1;
var specialfreq_2 = 103.9;
var specialfreq_3 = 107;

var FMTest = new TestItem();

var HeadphoneState = {
  _audioChannelManager: null, pluggedIn: false, init: function () {
    this._audioChannelManager = navigator.mozAudioChannelManager;
    this._audioChannelManager.onheadphoneschange = this._onHeadphoneStateChanged.bind(this);
    this.pluggedIn = this._audioChannelManager.headphones;
  }, _onHeadphoneStateChanged: function () {
    this.pluggedIn = this._audioChannelManager.headphones;
    if (this.pluggedIn) {
      FMTest.turnOn();
    } else {
      FMTest.passButton.disabled = 'disabled';
      FMTest.turnOff('antenna-unavailable');
    }
  }
};

FMTest.frequency = 103.7;
FMTest.freqMIN = 87.5;
FMTest.freqMAX = 108;
FMTest.specialfrequency = 99.1;

FMTest.updateUI = function() {
  debug('FMTest.updateUI');
  var freq = this.frequency;
  freq = parseFloat(freq.toFixed(1));
  document.getElementById('centertext').innerHTML =
      freq + 'MHz.' +
      '<br>' +
      'Press Left/Right to next channel,Key 1/2/3 to select Channel';

  this.freqP.style.visibility = 'visible';
  this.freqM.style.visibility = 'visible';
};

FMTest.onAntennaChange = function() {
  debug('FMTest.onAntennaChange');
  if (mozFMRadio.antennaAvailable) {
    this.turnOn();
  } else {
    this.passButton.disabled = 'disabled';
    this.turnOff('antenna-unavailable');
  }
};

FMTest.freqPlus = function() {
  debug('FMTest.freqPlus');
  if (mozFMRadio.enabled) {
    this.frequency += 0.1;
    if (this.frequency > this.freqMAX) {
      this.frequency = this.freqMAX;
    }
    this.updateUI();
    mozFMRadio.setFrequency(this.frequency);
  }
};

FMTest.freqMinus = function() {
  debug('FMTest.freqMinus');
  if (mozFMRadio.enabled) {
    this.frequency -= 0.1;
    if (this.frequency < this.freqMIN) {
      this.frequency = this.freqMIN;
    }
    this.updateUI();
    mozFMRadio.setFrequency(this.frequency);
  }
};

FMTest.scanResult = function() {
  debug('FMTest.scanResult');
  if (mozFMRadio.frequency) {
    this.frequency = mozFMRadio.frequency;
  }
  this.updateUI();
};

FMTest.preChannel = function() {
  debug('FMTest.preChannel');
  if (mozFMRadio.enabled) {
    setTimeout(function() { mozFMRadio.seekDown(); }, 100);
  }
};

FMTest.nextChannel = function() {
  debug('FMTest.nextChannel');
  if (mozFMRadio.enabled) {
    setTimeout(function() { mozFMRadio.seekUp(); }, 100);
  }
};

FMTest.setSpecialFrequency = function() {
  debug('FMTest.setSpecialFrequency');
  if (mozFMRadio.enabled) {
      this.frequency = this.specialfrequency;
      debug('FMTest.setSpecialFrequency is:' + this.specialfrequency);
      mozFMRadio.setFrequency(this.specialfrequency);
  }
};

FMTest.turnOn = function() {
  if (!mozFMRadio.enabled) {
    document.getElementById('centertext').innerHTML = 'FM init...';
   // mozFMRadio.enable(this.frequency);
    var request =  mozFMRadio.enable(this.frequency);
    request.onsuccess = function enable_onsuccess() {
      debug('FMTest.enable onsuccess');
      if (mozFMRadio.enabled) {
        setTimeout(function() { mozFMRadio.seekDown(); }, 100);
      }
    };
    request.onerror = function enable_onerror() {
      debug('FMTest.enable onerror');
    };
     setTimeout(() => {
      this.passButton.disabled = '';
    }, 3000);
  }
};

FMTest.turnOff = function(because) {
  if (mozFMRadio.enabled) {
    mozFMRadio.disable();
  }

  if (because === 'antenna-unavailable') {
    document.getElementById('centertext').innerHTML = 'Please insert headset';
  }

  this.freqP.style.visibility = 'hidden';
  this.freqM.style.visibility = 'hidden';
};

// the following are inherit functions
FMTest.onInit = function() {
  debug('FMTest.onInit');
  this.freqP = document.getElementById('freq+');
  this.freqM = document.getElementById('freq-');
  this.freqP.style.visibility = 'hidden';
  this.freqM.style.visibility = 'hidden';
  this.freqP.addEventListener('click', this);
  this.freqM.addEventListener('click', this);

  this.passButton.disabled = 'disabled';
  this.failButton.disabled = 'disabled';
  // XXX: leave 3s FM init OK and tester really test, prevent press pass too fast.
  setTimeout(() => {
    this.failButton.disabled = '';
  }, 3000);

  HeadphoneState.init();

  mozFMRadio.onenabled = this.updateUI.bind(this);
  //mozFMRadio.onantennaavailablechange = this.onAntennaChange.bind(this);
  
  mozFMRadio.onfrequencychange = this.scanResult.bind(this);

  if (mozFMRadio.antennaAvailable || HeadphoneState.pluggedIn) {
    this.turnOn();
  } else {
    this.turnOff('antenna-unavailable');
  }
};

FMTest.onDeinit = function() {
  if (mozFMRadio.enabled) {
    mozFMRadio.disable();
  }
};

FMTest.step = 0;
FMTest.removeHeadsetTest = function() {
  if (mozFMRadio.enabled) {
    mozFMRadio.disable();
  }
  document.getElementById('centertext').innerHTML = 'Please remove headset';
  FMTest.step++;
  this.freqP.style.visibility = 'hidden';
  this.freqM.style.visibility = 'hidden';
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = '';
  this.passButton.style.visibility = 'visible';
  this.failButton.style.visibility = 'visible';
};

FMTest.onHandleEvent = function(evt) {
  switch (evt.key) {
    case 'ArrowLeft':
      //this.freqMinus();
      this.preChannel();
      break;
    case 'ArrowRight':
      //this.freqPlus();
      this.nextChannel();
      break;
    case '1':
      this.specialfrequency = specialfreq_1;
      this.setSpecialFrequency();
      return true;
    case '2':
      this.specialfrequency = specialfreq_2;
      this.setSpecialFrequency();
      return true;
    case '3':
      this.specialfrequency = specialfreq_3;
      this.setSpecialFrequency();
      return true;
    case 'SoftLeft':
      if (this.passButton.disabled) {
        return true;
      }
      break;
    case 'SoftRight':
      if (this.failButton.disabled) {
        return true;
      }
      var event = {
        type: 'click',
        name: 'fail'
      };
      setTimeout(function() {
        if (parent.ManuTest !== undefined) {
          parent.ManuTest.handleEvent.call(parent.ManuTest, event);
        } else {
          parent.AutoTest.handleEvent.call(parent.AutoTest, event);
        }
      }, 800);
      return true;
  }
  return false;
};

window.addEventListener('load', FMTest.init.bind(FMTest));
window.addEventListener('beforeunload', FMTest.uninit.bind(FMTest));
window.addEventListener('keydown', FMTest.handleKeydown.bind(FMTest));

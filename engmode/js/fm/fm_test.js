/* global Item, NavigationMap */

/**
 *  FM test
 */
'use strict';
const FMDEBUG = true;

(function (aGlobal) {
  aGlobal.SpeakerManager = aGlobal.SpeakerManager || aGlobal.MozSpeakerManager;

  if (aGlobal.SpeakerManager)
    return;

  function SpeakerManager() {
    this.speakerforced = false;
  }

  SpeakerManager.prototype = {
    set forcespeaker(enable) {
      if (this.speakerforced != enable) {
        this.speakerforced = enable;
        if (this.onspeakerforcedchange) {
          this.onspeakerforcedchange();
        }
      }
    }
  };

  aGlobal.SpeakerManager = SpeakerManager;
})(window);

function fmPrintLog(msg) {
  FMDEBUG && console.log("fm_test - " + msg);
}
var mozFMRadio = navigator.mozFMRadio;

var speakerManager = new SpeakerManager();

var FMTest = new Item();

FMTest.frequency = 103.7;
FMTest.freqMIN = 87.5;
FMTest.freqMAX = 108;

FMTest.toggleSpeaker = function (isSpeaker) {
  speakerManager.forcespeaker = isSpeaker;
};


FMTest.update = function() {
  this.content = document.getElementById('fm-test-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();
  this.showView('fm-test-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'fm-test-menu', false, this.content);

};

FMTest.setFreq = function() {
  fmPrintLog("freqvalue entry");
  if (mozFMRadio.enabled) {
    var frequency = document.getElementById('fm-channel-input').value;
    fmPrintLog("set freq=" + frequency);
    this.frequency = frequency;
    if (!this.frequency) {
      alert("the frequency wronged");
    }
    if (frequency < this.freqMIN) {
      this.frequency = this.freqMIN;
    }
    if (frequency > this.freqMAX) {
      this.frequency = this.freqMAX;
    }
    mozFMRadio.setFrequency(this.frequency);
  }
};

FMTest.turnOn = function() {
  if (!mozFMRadio.enabled) {
    fmPrintLog("open FM");
    mozFMRadio.enable(this.frequency);
  }
};

FMTest.turnOff = function() {
  if (mozFMRadio.enabled) {
    mozFMRadio.disable();
  }
};

FMTest.play = function(isSpeaker) {
  this.turnOn();
  this.toggleSpeaker(isSpeaker);

};

FMTest.fmSwitch = function() {
  this.count = document.getElementById('fm-test-num-input').value;
  this.timer = null;
  var self = this;
  if (!this.count) {
    alert("the number wronged");
  }
  for (let i = 0; i < this.count; i++) {
    self.timer = setTimeout(function () {
      if (i % 2 === 0) {
        self.play(false);
      } else {
        self.play(true);
      }
    }, 2000 * i);
  }
  clearTimeout(this.timer);
};

FMTest.showView = function(name) {
  for (var i = 0, len = this.views.length; i < len; i++) {
    var view = this.views[i];
    if (name === view.id) {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }
  }

  NavigationMap.initPanelNavigation('.focusable', 0, name, false, this.content);
};

FMTest.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'fm-test-num':
      case 'fm-channel':
        document.getElementById(name + '-input').focus();
        break;
      case 'fm-test-earphone-play':
        this.play(false);
        break;
      case 'fm-test-extroverted-play':
        this.play(true);
        break;
      case 'fm-test-switch':
        this.fmSwitch();
        //TODO
        break;
      case 'fm-channel-set':
        //TODO
        this.setFreq();
        break;
      default:
        break;
    }
    return true;
  }
  if (event.key === 'Endcall' || event.key === 'Backspace') {
    if (App.currentPanel === '#fm-test') {
      FMTest.turnOff();
    }
    return true;
  }
  return true;
};

// Turn off radio immediately when window is unloaded.
window.addEventListener('unload', function(e) {
  FMTest.turnOff();
}, false);
window.addEventListener('keydown', FMTest.handleKeydown.bind(FMTest));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#fm-test') {
    FMTest.update();
  }
});
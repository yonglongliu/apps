/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: vibrate.js
// * Description: mmitest -> test item: vibrate test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [vibrate.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

var Vibrate = new TestItem();

Vibrate._vibrateInterval = null;

Vibrate.centertext = ['Is vibrator on?', 'Test finished.'];

Vibrate.timeOutCallback = function() {
  $('centertext').textContent = this.centertext[1];
  $('retestButton').style.visibility = 'visible';
  this.passButton.disabled = '';
  this.failButton.disabled = '';
};

Vibrate.startTest = function() {
  debug('Vibrate.startTest');
  $('centertext').textContent = this.centertext[0];
  $('retestButton').style.visibility = 'hidden';
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = 'disabled';

  this._vibrateInterval = setInterval(() => {
    navigator.vibrate(VIBRATE_DURATION);
    this.times += 1;

    if (this.times >= VIBRATE_TIMES && VIBRATE_TIMES !== 0) {
      clearInterval(this._vibrateInterval);
      this._vibrateInterval = null;
    }
  }, VIBRATE_DURATION + VIBRATE_REST);

  if ('vibrate' in navigator) {
    navigator.vibrate(VIBRATE_DURATION);
    this.times = 1;
  }

  setTimeout(this.timeOutCallback.bind(this), 2000);
};

//the following are inherit functions
Vibrate.onInit = function() {
  debug('Vibrate.onInit');
  $('retestButton').addEventListener('click', this);

  this.startTest();
};


Vibrate.onDeinit = function(){
  if (this._vibrateInterval) {
    clearInterval(this._vibrateInterval);
    this._vibrateInterval = null;
  }
};

Vibrate.onHandleEvent = function(evt) {
  evt.preventDefault();
  switch (evt.type) {
    case 'click':
      switch (evt.target) {
        case $('retestButton'):
          this.startTest();
          break;
      }
      break;
  }
  return false;
};

window.addEventListener('load', Vibrate.init.bind(Vibrate));
window.addEventListener('beforeunload', Vibrate.uninit.bind(Vibrate));
window.addEventListener('keydown', Vibrate.handleKeydown.bind(Vibrate));

/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: backlight.js
// * Description: mmitest -> test item: backlight test.
// * Note:
// ************************************************************************

/* global TestItem */
'use strict';

function $(id) {
  return document.getElementById(id);
}

// ------------------------------------------------------------------------

const ON = 500;
const OFF = 500;
const REPEAT = 10;

const LOW_BRIGHTNESS = 0;
const HIGH_BRIGHTNESS = 1;

var power;

var BacklightTest = new TestItem();

BacklightTest.orignScreenBrightness = HIGH_BRIGHTNESS;

BacklightTest.currentScreen = 'on';

BacklightTest.count = 0;

BacklightTest.toggleBacklight = function() {
  switch (this.currentScreen) {
    case 'off':
      // Set keypad Led blacklight together
      navigator.jrdExtension.setKeypadLED(255);

      power.screenBrightness = this.orignScreenBrightness;
      this.currentScreen = 'on';
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), ON);
      break;

    case 'on':
      navigator.jrdExtension.setKeypadLED(0);

      // don't turn off the backlight totally.
      power.screenBrightness = LOW_BRIGHTNESS;
      this.currentScreen = 'off';
      this._timer = window.setTimeout(this.timeoutCallback.bind(this), OFF);
      break;
  }

  if (this.currentScreen === 'on') {
    this.count += 1;
  }

  // Show fail/pass button after three time flash
  if (this.count === 3) {
    $('retestButton').style.visibility = 'visible';
    this.passButton.disabled = '';
    this.failButton.disabled = '';
  }
};

BacklightTest.timeoutCallback = function() {
  if (this.count < REPEAT) {
    this.toggleBacklight();
  }
};

BacklightTest.startTest = function() {
  $('retestButton').style.visibility = 'hidden';
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = 'disabled';
  this.count = 0;
  this.currentScreen = 'on';
  this._timer = window.setTimeout(this.timeoutCallback.bind(this), 500);
};

//the following are inherit functions
BacklightTest.onInit = function() {
  $('retestButton').addEventListener('click', this);

  if (navigator.mozPower === null) {
    power = {screenBrightness: 1};
  } else {
    power = navigator.mozPower;
  }

  this.orignScreenBrightness = power.screenBrightness;
  this.startTest();
};

BacklightTest.onDeinit = function() {
  clearTimeout(this._timer);
  // set back the brightness when exit.
  power.screenBrightness = this.orignScreenBrightness;
};

BacklightTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  switch (evt.type) {
    case 'keydown':
      // do nothing
      break;
  }
  return false;
};

window.addEventListener('load', BacklightTest.init.bind(BacklightTest));
window.addEventListener('beforeunload', BacklightTest.uninit.bind(BacklightTest));
window.addEventListener('keydown', BacklightTest.handleKeydown.bind(BacklightTest));

/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: fm.js
// * Description: autoslt -> test item: fm radio test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug_fm(s) {
  dump('<autoslt> ------: [fm.js] = ' + s + '\n');
}


function FMTest() {
  this.mozFMRadio = navigator.mozFMRadio;
}

FMTest.prototype.turnOn = function(frequency) {

  return new Promise(function(resolve) {

    if (!this.mozFMRadio.enabled) {
      var req = this.mozFMRadio.enable(frequency);
      req.onsuccess = function () {
        debug_fm('turnOn FMRadio onsuccess');
        resolve('ok');

      };
      req.onerror = function () {
        debug_fm('turnOn FMRadio onerror');
        resolve('fail');
      };

    }else {
      this.mozFMRadio.setFrequency(frequency);
    }
  }.bind(this));

};

FMTest.prototype.turnOff = function() {
  return new Promise(function(resolve) {

    if (this.mozFMRadio.enabled) {
      var req = this.mozFMRadio.disable();
      req.onsuccess = function () {
        debug_fm('turnOff FMRadio onsuccess');
        resolve('ok');
      };
      req.onerror = function () {
        debug_fm('turnOff FMRadio onerror');
        resolve('fail');
      };
    }else {
      resolve('ok');
    }
  }.bind(this));
};


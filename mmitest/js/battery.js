/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: battery.js
// * Description: mmitest -> test item: battery temperature test.
// * Note:
// ************************************************************************

/* global TestItem */
'use strict';

function $(id) {
  return document.getElementById(id);
}

var BatteryTest = new TestItem();

//the following are inherit functions
BatteryTest.onInit = function() {
  this.passButton.disabled = 'disabled';

  this.getTempInfo();
  this.getContentInfo();
  this.getVoltageInfo();
  this.getPresentInfo();
};

BatteryTest.showFailedInfo = function(id) {
  $(id).textContent = 'fail to get' + id;
};

BatteryTest.getTempInfo = function() {
  RemoteHelper.readFile('/sys/class/power_supply/battery/temp', (response) => {
    var value = (parseInt(response) / 10);
    if (value) {
      $('temp_current').textContent ='Now: ' + value + '°C';
    } else {
      this.showFailedInfo('temp_current');
    }
  });
};

BatteryTest.getContentInfo = function() {
  RemoteHelper.readFile('/sys/class/power_supply/battery/capacity', (response) => {
    var value = parseInt(response);
    if (value) {
      $('content_current').textContent = 'Now: ' + value + '%';
    } else {
      this.showFailedInfo('content_current');
    }
  });
};

BatteryTest.getVoltageInfo = function() {
  RemoteHelper.readFile('/sys/class/power_supply/battery/voltage_now', (response) => {
    var value = (parseInt(response) / 1000000).toFixed(2);
    if (value) {
      $('battery_voltage').textContent = 'Voltage now: ' + value + 'V';
    } else {
      this.showFailedInfo('battery_voltage');
    }
  });
};

BatteryTest.getPresentInfo = function() {
  RemoteHelper.readFile('/sys/class/power_supply/battery/present', (response) => {
    var value = parseInt(response);
    if (value) {
      $('battery_present').textContent = 'Battery Present is ' + value;
      if (value === 1) {
        this.passButton.disabled = '';
        this.autoPass(1000);
      } else {
        this.passButton.disabled = 'disabled';
      }
    } else {
      this.showFailedInfo('battery_present');
    }
  });
};

BatteryTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  return false;
};

window.addEventListener('load', BatteryTest.init.bind(BatteryTest));
window.addEventListener('beforeunload', BatteryTest.uninit.bind(BatteryTest));
window.addEventListener('keydown', BatteryTest.handleKeydown.bind(BatteryTest));

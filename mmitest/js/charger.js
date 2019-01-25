/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: usb.js
// * Description: mmitest -> test item: charger test.
// * Note: check charger
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [charger.js] = ' + s + '\n');
  }
}

const CHARGER_INTERVAL = 1000;

function $(id) {
  return document.getElementById(id);
}

var chargering = false;

var ChargerTest = new TestItem();
ChargerTest.result = {charger: false, usb: false};

ChargerTest.check = function() {
  var allDone = true;
  for (var i in this.result) {
    if (!this.result[i]) {
      allDone = false;
      break;
    }
  }

  if (allDone) {
    this.failButton.disabled = '';
    this.passButton.disabled = '';
  }
};

ChargerTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  this.displayChangerInfo();
  switch (evt.key){
    case 'SoftLeft':
    case 'SoftRight':
      break;
  }
  return false;
};

ChargerTest.showDetailChargerInfo = function(){
  this.getContentInfo();
  this.getPresentInfo();
  this.getTempInfo();
  if (navigator.jrdExtension) {
    var request = navigator.jrdExtension.getSysInfo('BATTERY_TEMP');
    request.onsuccess = function() {
      debug('get battery info success.');
      $('battery_voltage').innerHTML = 'Battery Voltage: ' +
         (navigator.jrdExtension.fileReadLE('batteryvoltage_now') / 1000000).toFixed(2) + 'V';
      // we should find a general solution to read battery current
      // jrdExtentsion to read curretn node of QC
      var current = (navigator.jrdExtension.fileReadLE('batterycurrent_now') / 1000).toFixed(0);
      if (current === '0') {
        // remoteHelper to read current node of SPRD
        RemoteHelper.readFile('/sys/class/power_supply/sprdfgu/fgu_current', (current) => {
          $('battery_current').innerHTML = 'Battery Current: ' + current + 'mA';
        })
      } else {
        $('battery_current').innerHTML = 'Battery Current: ' + current + 'mA';
      }
      $('cable').style.display = 'none';
      $('remove').style.display = 'block';
      $('charger').style.display =  chargering? 'block' : 'none';
    };

    request.onerror = function() {
      debug('get battery info failed-');
    };
  }
};

ChargerTest.getContentInfo = function() {
  $('battery_content').innerHTML = 'Battery content need 30~80%';
  RemoteHelper.readFile('/sys/class/power_supply/battery/capacity', (response) => {
    var value = parseInt(response);
    if (value) {
      $('content_current').textContent = 'Now: ' + value + '%';
    } else {
      debug('get battery capacity failed');
    }
  });
};

ChargerTest.getPresentInfo = function() {
  RemoteHelper.readFile('/sys/class/power_supply/battery/present', (response) => {
    var value = parseInt(response);
    if (value) {
      $('battery_present').textContent = 'Battery Present is ' + value;
      if (value === 1) {
        this.passButton.disabled = '';
      } else {
        this.passButton.disabled = 'disabled';
      }
    } else {
      debug('get battery present failed.');
    }
  });
};

ChargerTest.getTempInfo = function() {
  RemoteHelper.readFile('/sys/class/power_supply/battery/temp', (response) => {
    var value = (parseInt(response) / 10);
    if (value) {
      $('temp_current').textContent ='Now: ' + value + '°C';
    } else {
      this.showFailedInfo('temp_current');
    }
  });
};

ChargerTest.showFailedInfo = function(id) {
  $(id).textContent = 'fail to get' + id;
};

/*--the following are inherit functions--*/
ChargerTest.onInit = function() {
  var battery = window.navigator.battery;
  battery.addEventListener('chargingchange', this);

  this.passButton.disabled = 'disabled';
  this.failButton.disabled = '';
  this.displayChangerInfo();
};


ChargerTest.displayChangerInfo = function() {
  var battery = window.navigator.battery;
  if (battery.charging) {
    chargering = true;
    document.getElementById('cable').innerHTML = 'Please check.';
    document.getElementById('charger').innerHTML = 'Charger: OK';
    document.getElementById('remove').innerHTML = 'Please Remove Cable';
    this.result.charger = true;
    this.failButton.disabled = '';
    this.passButton.disabled = '';
    $('remove').style.display = 'none';
    $('charger').style.display = 'block';
    this._timer = setInterval(this.showDetailChargerInfo.bind(this), CHARGER_INTERVAL);
  } else {
    chargering = false;
    document.getElementById('cable').innerHTML = 'Please insert cable.';
    document.getElementById('remove').innerHTML = 'Remove Cable Success';
    $('charger').style.display = 'none';
  }
};

ChargerTest.onDeinit = function() {
  var battery = window.navigator.battery;
  battery.removeEventListener('chargingchange', this);
  clearInterval(this._timer);
};

ChargerTest.pad = function(num, size) {
  var number = Math.abs(num);
  var sLen = ('' + number).length;
  if (sLen >= size) {
    return '' + number;
  }
  var preZero = (new Array(size)).join('0');

  return preZero.substring(0, size - sLen) + number;
};

window.addEventListener('load', ChargerTest.init.bind(ChargerTest));
window.addEventListener('beforeunload', ChargerTest.uninit.bind(ChargerTest));
window.addEventListener('keydown', ChargerTest.handleKeydown.bind(ChargerTest));

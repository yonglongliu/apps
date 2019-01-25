/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: traceability.js
// * Description: mmitest -> test item: traceability test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

const BTADDRESSPATH = '/data/misc/bluedroid/btmac.txt';
const WIFIADDRESSPATH = '/data/misc/wifi/wifimac.txt';
const CALIBRATEINFO_GSMCMD = 'AT+SGMR=0,0,3,0';
const CALIBRATEINFO_LTECMD = 'AT+SGMR=0,0,3,3';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [traceability.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

var isLTEOnly = true;
var TraceTest = new TestItem();

//the following are inherit functions
TraceTest.onInit = function() {
  this.getIMEIs();
  this.getBtWifiAddress();
  this.getPhaseCheckInfo();
  this.getCalibrateMode();

  $('trace-info').focus();
};

TraceTest.getCalibrateMode = function() {
  RemoteHelper.getproperty('persist.radio.ssda.testmode', (value) => {
    debug('persist.radio.ssda.testmode='+value);
    isLTEOnly = (value === '6');
    this.getCalibrateInfo();
  });
};

TraceTest.getCalibrateInfo = function() {
  if (!isLTEOnly) {
    RemoteHelper.sendATCommand(CALIBRATEINFO_GSMCMD, (info) => {
      $('trace-rf-gsm').innerHTML = '<br/>' + '======== RF GSM ========' + '<br/>' +
      this.formatInfo(info);
    });
  }

  RemoteHelper.sendATCommand(CALIBRATEINFO_LTECMD, (info) => {
    $('trace-rf-lte').innerHTML = '======== RF LTE ========' + '<br/>' +
        this.formatInfo(info);
  });
};

TraceTest.getPhaseCheckInfo = function() {
  RemoteHelper.showbinfile((info) => {
    $('trace-data').innerHTML = this.formatInfo(info);
  }, () => {
    $('trace-data').innerHTML = 'Can\'t get Treaceability info.';
  });
};

TraceTest.getBtWifiAddress = function() {
  RemoteHelper.readFile(BTADDRESSPATH, (address) => {
    $('trace-bt').innerHTML = 'BT ADD: ' + this.formatInfo(address);
  });

  RemoteHelper.readFile(WIFIADDRESSPATH, (address) => {
    $('trace-wifi').innerHTML = 'WIFI ADD: ' + this.formatInfo(address);
  });
};

TraceTest.getIMEIs = function() {
  var promises = [];
  for (var i = 0; i < navigator.mozMobileConnections.length; i++) {
    promises.push(navigator.mozMobileConnections[i].getDeviceIdentities());
  }

  Promise.all(promises).then((imeis) => {
    if (imeis.length === 2) {
      $('trace-imei').innerHTML =
          'IMEI1: ' + imeis[0].imei + '<br/>' +
          'IMEI2: ' + imeis[1].imei + '<br/>';
    } else {
      $('trace-imei').innerHTML =
          'IMEI: ' + imeis[0].imei + '<br/>';
    }
  }, () => {});
};

TraceTest.formatInfo = function(response) {
  response = response.replace(/OK/g, '');
  var array = response.split('\n');
  var s = '';
  array.forEach(function(str) {
    var colorClass;
    if (str.indexOf('Not Pass') != -1) {
      colorClass = 'result-fail';
    } else if (str.indexOf('Pass') != -1) {
      colorClass = 'result-pass';
    } else {
      colorClass = 'result-notest';
    }
    s += '<p class="' + colorClass + '">' + str + '</p>' ;
  });
  return s;
};

TraceTest.onDeinit = function() {
};

TraceTest.onHandleEvent = function(evt) {
  switch (evt.key) {
    case 'Up':
    case 'ArrowUp':
      evt.stopPropagation();
      $('content').scrollTop = $('content').scrollTop - 15;
      return true;
    case 'Down':
    case 'ArrowDown':
      evt.stopPropagation();
      $('content').scrollTop = $('content').scrollTop + 15;
      return true;
  }
  return false;
};

window.addEventListener('load', TraceTest.init.bind(TraceTest));
window.addEventListener('beforeunload', TraceTest.uninit.bind(TraceTest));
window.addEventListener('keydown', TraceTest.handleKeydown.bind(TraceTest));

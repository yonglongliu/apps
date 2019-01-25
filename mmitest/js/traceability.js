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
var camera = navigator.mozCameras.getListOfCameras();
TraceTest._getCameras = null;
TraceTest._try = 0;

//the following are inherit functions
TraceTest.onInit = function() {
  this.getLCDId();
  this.getCameraId();
  this.getBoardId();
  this.getEmmcId();
  this.getAudioId();
  this.getDdrId();
  this.getIMEIs();
  this.getBtWifiAddress();
  this.getPhaseCheckInfo();
  this.getCalibrateMode();

  //$('trace-info').focus();
};

TraceTest.getCalibrateMode = function() {
  RemoteHelper.getproperty('persist.radio.ssda.testmode', (value) => {
    debug('persist.radio.ssda.testmode='+value);
    isLTEOnly = (value === '3');
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

TraceTest.getLCDIdOnSuccess = function (queue, response) {
    $('lcd-id').innerHTML = 'Display_ID: '  + response + '<p/>';
};

TraceTest.getLCDIdOnError = function (queue, response) {
};

TraceTest.getLCDId = function () {
  var cmdQueue = 'cat /sys/class/display/panel0/name';
    RemoteHelper.sendCommand([{cmd: cmdQueue, type: 'mmitest'}], TraceTest.getLCDIdOnSuccess, TraceTest.getLCDIdOnError);

};

TraceTest.gotCamera =function () {
    TraceTest.getCameraId();
};

TraceTest.gotCameraError = function () {

};

TraceTest.getCameraIdOnSuccess = function (queue, response) {
    debug('getCameraIdOnSuccess response = '+ response);
    window.sessionStorage.setItem('cameraID',response);
    var cameraIds = response.split('  ');
    $('camera-id').innerHTML = 'CAMERA ID: ' + '<br/>' + 'Rear Camera: ' + cameraIds[0] + '<br/>' + 'Front Camera: ' + cameraIds[1] + '<p/>' ;
};

TraceTest.getCameraIdOnError = function (queue, response) {

};

TraceTest.getCameraId = function () {
   debug('tracebility getCameraID');
    var cameraId = window.sessionStorage.getItem('cameraID');
   debug('cameraID = ' + cameraId);
   if(cameraId === null || cameraId === '') {
       var cmdQueueCamera = 'cat /sys/devices/virtual/misc/sprd_sensor/camera_sensor_name';
       RemoteHelper.sendCommand([{cmd: cmdQueueCamera,type: 'mmitest'}],TraceTest.getCameraIdOnSuccess,TraceTest.getCameraIdOnError);
   }else {
       var cameraIds = cameraId.split('  ');
       $('camera-id').innerHTML = 'CAMERA ID: ' + '<br/>' + 'Rear Camera: ' + cameraIds[0] + '<br/>' + 'Front Camera: ' + cameraIds[1] + '<p/>' ;
   }
};

TraceTest.getBoardId = function () {
    RemoteHelper.getproperty('ro.boot.hardware.revision',value =>{
    $('board-id').innerHTML = 'HW_Version: ' + value  + '<p/>' ;
    });
};



TraceTest.getEmmcId = function () {
  var cmdEmmcID = 'cat /proc/cmdline';
  RemoteHelper.sendCommand([{cmd:cmdEmmcID,type:'mmitest'}],TraceTest.getEmmcIdOnSuccess,TraceTest.getEmmcIdOnError);

};

TraceTest.getEmmcIdOnSuccess = function (queue, response) {
    debug('getEmmcIdOnSuccess' + response);
    var char1 = response.indexOf('emmc.cid');
    var attr = response.substring(char1);
    var char2 = attr.indexOf('=');
    var char3 = attr.indexOf(' ');
    var flash = attr.substring(char2 + 1,char3);
    var char4 = response.indexOf('emmc.cid2');
    var attr1 = response.substring(char4);
    var char5 = attr1.indexOf('=');
    var char6 = attr1.indexOf(' ');
    var flash1 = attr1.substring(char5 + 1,char6);
    $('emmc-id').innerHTML = 'EMMC ID: ' + flash + '\/' + flash1 + '<p/>';
};

TraceTest.getEmmcIdOnError = function (queue, response) {
    debug('getEmmcIdOnError');
};



TraceTest.getAudioId = function () {
  var cmdEmmcID = 'cat /proc/cmdline';
  RemoteHelper.sendCommand([{cmd:cmdEmmcID,type:'mmitest'}],TraceTest.getAudioIdOnSuccess,TraceTest.getAudioIdOnError);

};

TraceTest.getAudioIdOnSuccess = function (queue, response) {
    debug('getAudioIdOnSuccess' + response);
    var char1 = response.indexOf('audio.id');
    var attr = response.substring(char1);
    var char2 = attr.indexOf('=');
    var char3 = attr.indexOf(' ');
    var flash = attr.substring(char2 + 1,char3);
    $('audio-id').innerHTML = 'ADUIOPA ID: ' + flash + '<p/>';
};

TraceTest.getAudioIdOnError = function (queue, response) {
    debug('getAudioIdOnError');
};

TraceTest.getDdrId = function () {
  var cmdDdrID = 'cat /proc/cmdline';
  RemoteHelper.sendCommand([{cmd:cmdDdrID,type:'mmitest'}],TraceTest.getDdrIdOnSuccess,TraceTest.getDdrIdOnError);

};

TraceTest.getDdrIdOnSuccess = function (queue, response) {
    debug('getDdrIdOnSuccess' + response);
    var char1 = response.indexOf('ddr.id');
    var attr = response.substring(char1);
    var char2 = attr.indexOf('=');
    var char3 = attr.indexOf(' ');
    var flash = attr.substring(char2 + 1,char3);
    $('ddr-id').innerHTML = 'DDR ID: ' + flash + '<p/>';
};

TraceTest.getDdrIdOnError = function (queue, response) {
    debug('getDdrIdOnError');
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
  for(let i =0;i < array.length;i ++){
      if(array[i].indexOf('TDD LTE AFC Not Pass') > -1 ){
          array.splice(i,1);
      }
  }
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
    TraceTest._try = 0;
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

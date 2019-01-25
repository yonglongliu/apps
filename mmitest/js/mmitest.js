/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: mmitest.js
// * Description: mmitest -> main page.
// * Note: has auto and manu parts.
// ************************************************************************

/* exported DEBUG */
'use strict';

const DEBUG = true;

var camera = navigator.mozCameras.getListOfCameras();

var _cameraObj = null;

var nxp_path = navigator.jrdExtension.getPropertyValue('persist.sys.nxp.path');

var MMITest = {
  isMMIPass : false,

  enterAutoTest: function MMITest_enterAutoTest() {
    window.location = './tests/auto.html';
  },

  enterManuTest: function MMITest_enterManuTest() {
    window.location = './tests/manu.html';
  },

  enterConfirmDialog: function MMITest_enterAutoTest() {
    window.location = './tests/confirm.html';
  },

  get autoButton() {
    return document.getElementById('autoButton');
  },

  get manuButton() {
    return document.getElementById('manuButton');
  },

  get midButton() {
    return document.getElementById('midButton');
  },
  
  hasNXP: function has_NXP() {
    dump('mmitest----hasNXP nxp_path='+nxp_path );
    if (nxp_path ) {
      return true;
    }
    return false;
  },

  init: function MMITest_init() {
    this.initCamera();

    setTimeout(() => {
      this.checkNXP();

      this.autoButton.disabled = '';
      this.manuButton.disabled = '';
      this.autoButton.addEventListener('click', this);
      this.manuButton.addEventListener('click', this);
      this.midButton.addEventListener('click', this);
    }, 4000);
    setTimeout(() => {
      this.getPhaseCheckInfo();
    }, 2000);


    // Dont let the phone go to sleep while in mmitest.
    // user must manually close it
    if (navigator.requestWakeLock) {
      navigator.requestWakeLock('screen');
    }

    // We will enable the NFC in the testing script file,
    // so we need to disable the NFC first.
    if (navigator.mozNfc && navigator.mozNfc.enabled) {
      navigator.mozSettings.createLock().set({'nfc.enabled': false});
    }

    // Disable airplaneMode in mmitest to avoid fm test init fail
    navigator.mozSettings.createLock().set({'airplaneMode.enabled': false});

    window.addEventListener('keydown', MMITest.handleKeydown.bind(MMITest));
  },

  initCamera:function _initCamera() {
     dump('mmitest initCamera');
     var cameraId = window.sessionStorage.getItem('cameraID');
     if(cameraId === null || cameraId === ''){
         var cmdQueueCamera = 'cat /sys/devices/virtual/misc/sprd_sensor/camera_sensor_name';
         RemoteHelper.sendCommand([{cmd: cmdQueueCamera,type: 'mmitest'}],this.getCameraIdOnSuccess,this.getCameraIdOnError);
         if (camera.length > 0) {
             var sensorID = navigator.jrdExtension.getPropertyValue('persist.sys.sensor.id');
             dump('sensorId ' + sensorID);
             if ('trigger_srid' !== sensorID){
                 navigator.jrdExtension.setPropertyValue('persist.sys.sensor.id','trigger_srid');
             };
             setTimeout(function () {
                 navigator.mozCameras.getCamera(camera[0])
                     .then(MMITest.gotCamera.bind(MMITest.this), MMITest.gotCameraError.bind(MMITest.this));
             },500);
         }
     }
     dump('mmitest cameraId ' + cameraId);
  },

  gotCamera:function (params) {
    _cameraObj = params.camera;
    dump('mmitest gotCamera');
  },

  gotCameraError:function () {
    dump('mmitest gotCameraError');
  },

  getCameraIdOnSuccess: function (queue, response) {
      window.sessionStorage.setItem('cameraID',response);
     // window.localStorage.setItem('cameraID',response);
      dump('mmitest getCameraIdOnSuccess' + response);
  },

  getCameraIdOnError: function (queue, response) {
      dump('mmitest getCameraIdOnError');
  },

  visibilityChange:function () {
      dump('visibilityChange');
      if (_cameraObj) {
        dump('visibilityChange release _cameraObj');
        _cameraObj.release().then(function() {
          _cameraObj = null;
          }, function() {
            dump('fail to release camera');
        });
      }
  },

    getPhaseCheckInfo: function() {
    RemoteHelper.showbinfile((info) => {
      document.getElementById('station-data').innerHTML = this.formatInfo(info);
    }, () => {
        setTimeout(() => {
	       RemoteHelper.showbinfile((info) => {
          document.getElementById('station-data').innerHTML = this.formatInfo(info);
        }, () => {
          document.getElementById('station-data').innerHTML = 'Can\'t get Station info.';
        });
      }, 2000);
    });
  },

  formatInfo: function(response) {
    response = response.replace(/OK/g, '');
    var array = response.split('\n');
    var s = '<div>Station Info:</div>';
    array.forEach(function(str) {
      if ((str.indexOf('SN1') == -1 && str.indexOf('SN2') == -1))
      {
        var isMMI = false;
        if (str.indexOf('MMI') != -1 && str.indexOf('MMI2') == -1) {
          isMMI = true;
          MMITest.isMMIPass = false;
        }
        var colorClass;
        if (str.indexOf('Not Pass') != -1) {
          colorClass = 'result-fail';
        } else if (str.indexOf('Pass') != -1) {
          colorClass = 'result-pass';
          if (isMMI == true) {
            MMITest.isMMIPass = true;
            MMITest.midButton.disabled = '';
          }
        } else {
          colorClass = 'result-notest';
        }
        s += '<div class="' + colorClass + '">' + str + '</div>';
      }
    });
    return s;
  },

  checkNXP: function check_NXP(){
    dump('mmitest checkNXP');
    var isNXP = window.localStorage.getItem('hasNXP');
    dump('mmitest checkNXP  isNXP='+isNXP);
    if(this.hasNXP()) {
      var cmdQueueNXP = 'ls ' + nxp_path;
      dump('mmitest checkNXP  cmdQueueNXP=' + cmdQueueNXP);
      RemoteHelper.sendCommand([{cmd: cmdQueueNXP, type: 'mmitest'}], this.getNXPOnSuccess);
    } else {
      window.localStorage.setItem('hasNXP','false');
    }
  },

  getNXPOnSuccess: function (queue, response) {
    dump('mmitest getNXPOnSuccess  response:' + response);
    var result = response;
    if(result && nxp_path === result){
      dump('mmitest NXP support');
      window.localStorage.setItem('hasNXP','true');
    } else {
      dump('mmitest NXP not support');
      window.localStorage.setItem('hasNXP','false');
    }
  },

  handleEvent: function MMITest_handleEvent(evt) {
    switch (evt.type) {
      case 'click':
        switch (evt.target) {
          case this.autoButton:
            window.sessionStorage.removeItem('AUTOFLAG');
            window.sessionStorage.setItem('AUTOFLAG', 'MMITEST');
            this.enterConfirmDialog();
            break;

          case this.manuButton:
            this.enterManuTest();
            break;

          case this.midButton:
            window.sessionStorage.removeItem('AUTOFLAG');
            window.sessionStorage.setItem('AUTOFLAG', 'MMITEST2');
            this.enterConfirmDialog();
            break;
        }
        break;
    }
  },

  handleKeydown: function MMITEST_handleKeyDown(event) {
    event.preventDefault();
    switch (event.key){
      case 'Up':
      case 'ArrowUp':
        document.getElementById('station-data').scrollTop = document.getElementById('station-data').scrollTop - 15;
        break;
      case 'Down':
      case 'ArrowDown':
        document.getElementById('station-data').scrollTop = document.getElementById('station-data').scrollTop + 15;
        break;
      case 'SoftLeft':
        this.autoButton.click();
        break;
      case 'SoftRight':
        this.manuButton.click();
        break;
      case 'Enter':
        this.midButton.click();
        break;
      case 'Backspace':
      case 'EndCall':
        var req = window.navigator.jrdExtension.setPropertyLE('engmoded', 'disable');
        req.onsuccess = () => {
          window.close();
        };

        break;
    }
  }
};

window.addEventListener('load', () => {
  var req = window.navigator.jrdExtension.setPropertyLE('engmoded', 'enable');
  req.onsuccess = () => {
    MMITest.init();
  };
});

window.addEventListener('mozvisibilitychange', MMITest.visibilityChange.bind(MMITest));

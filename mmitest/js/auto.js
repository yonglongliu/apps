/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: auto.js
// * Description: mmitest -> auto test part.
// * Note: When you want to add a new test item, just add the html file
// *       name in array testList
// ************************************************************************

/* global dump, asyncStorage */
'use strict';

const RESULT_LIST = 'result_list';

const DEBUG = true;

const MMITEST_RESULT = 'mmitest_result';

const RESULT_STATE = {
  NOT_TEST: 0,
  ALL_TEST: 1,
  ALL_PASS: 2
};

const AUTO_TEST_RESULT_TEMPLATE = 'false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false';

const TEST_RESULT_TEMPLATE = {
  'items': {
    'version': 'notTest',
    'traceability': 'notTest',
    'lcd': 'notTest',
    'keypad': 'notTest',
    'backlight': 'notTest',
    'camera': 'notTest',
    'camera_front': 'notTest',
    'flashlight': 'notTest',
    'rtc': 'notTest',
    'audio': 'notTest',
    'vibrate': 'notTest',
    'accessories': 'notTest',
    'fm': 'notTest',
    'charger': 'notTest',
    'sim': 'notTest',
    'sdcard': 'notTest',
    'bluetooth': 'notTest',
    'wifi': 'notTest',
    'gps': 'notTest',
    'nfc': 'notTest'
  },

  'alltest': false
};

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [auto.js] = ' + s + '\n');
  }
}

var geolocation = navigator.geolocation;

var camera = navigator.mozCameras.getListOfCameras();
var _cameraObj = null;
var geolocationSettingEnabled;

navigator.mozSettings.createLock().get('geolocation.enabled').then((result) => {
  geolocationSettingEnabled = result['geolocation.enabled'];
});

var AutoTest = {
  isMMI2Test : false,

  state : 'unlocked',

  testList: [],
  resultList: [],
  index: 0,
  // 'start', 'next', the start button will be used in two cases.
  autoStartButtonStatus: 'start',

  get mainPanel () {
    return document.getElementById('main-panel');
  },

  get testPanel () {
    return document.getElementById('test-panel');
  },

  get resultPanel () {
    return document.getElementById('result-screen');
  },

  get autoStartButton() {
    return document.getElementById('autoStartButton');
  },

  get autoEndButton() {
    return document.getElementById('autoEndButton');
  },

  get retestButton() {
    return document.getElementById('retestButton');
  },

  get resultText() {
    return document.getElementById('result-text');
  },

  get centerContext() {
    return document.getElementById('centertext');
  },

  get iframe() {
    return document.getElementById('test-iframe');
  },

  get restartYes() {
    return document.getElementById('restartYes');
  },

  get restartNo() {
    return document.getElementById('restartNo');
  },

  hasFront: function has_frontcamera() {
    if (camera && camera.length > 1) {
      return true;
    }
    return false;
  },

  startGps: function _startGps() {
    enableGeolocationSatellite(true);
    deleteGpsInfo();
    navigator.mozSettings.createLock().get('geolocation.enabled').then((result) => {
      var options = {
        enableHighAccuracy: true,
        timeout: 3600000,
        maximumAge: 0
      };
      this.geolocationEnabled = result['geolocation.enabled'];
      if (!this.geolocationEnabled) {
        this.enableGeolocation(true).then(() => {
          this.geolocationEnabled = true;
          geolocationSettingEnabled = true;
          if (geolocation){
            setTimeout(() => {
              geolocation.getCurrentPosition(success, error, options);
            }, 1000);
          }
        });
        return;
      }
      if (geolocation){
        geolocation.getCurrentPosition(success, error, options);
      }
    });
  },

  stopGps: function _stopGps() {
    if (geolocationSettingEnabled === false) {
      navigator.mozSettings.createLock().set({'geolocation.enabled' : false});
    } else {
      navigator.mozSettings.createLock().set({'geolocation.enabled' : true});
    }
    enableGeolocationSatellite(false);
  },

  enableGeolocation: function(enable) {
    return new Promise(function(resolve) {
      var req = navigator.mozSettings.createLock().set({'geolocation.enabled': enable});
      req.onsuccess = function() {
        resolve();
      };
    }.bind(this));
  },

  stopNfc: function() {
    if (navigator.jrdExtension) {
      navigator.jrdExtension.execCmdLE(['nfc_stop'], 1);
    }
  },

  showPanel: function AutoTest_showpanel(panelName) {
    if (!panelName) {
      return
    }

    this.mainPanel.classList.add('hidden');
    this.testPanel.classList.add('hidden');
    this.resultPanel.classList.add('hidden');
    document.getElementById(panelName).classList.remove('hidden');
  },

  getResultList: function AutoTest_geResultList(callback) {
    asyncStorage.getItem(RESULT_LIST, (value) => {
      debug('get test result list:' + value);
      value && callback(value);
    });
  },

  setResultList: function AutoTest_setResult() {
    var resultList = this.resultList.toString();
    asyncStorage.setItem(RESULT_LIST, resultList);
    debug('setResult, result list:' + resultList);
  },

  getCameraIdOnSuccess: function (queue, response) {
      window.sessionStorage.setItem('cameraID',response);
     // window.localStorage.setItem('cameraID',response);
      debug('auto getCameraIdOnSuccess' + response);
  },

  getCameraIdOnError: function (queue, response) {
      debug('auto getCameraIdOnError');
  },

  initCamera: function _initCamera() {
    debug('auto initCamera');
    var cameraId = window.sessionStorage.getItem('cameraID');
    if(cameraId === null || cameraId === ''){
        var cmdQueueCamera = 'cat /sys/devices/virtual/misc/sprd_sensor/camera_sensor_name';
        RemoteHelper.sendCommand([{cmd: cmdQueueCamera,type: 'mmitest'}],this.getCameraIdOnSuccess,this.getCameraIdOnError);
        if (camera.length > 0 ) {
            var sensorID = navigator.jrdExtension.getPropertyValue('persist.sys.sensor.id');
            debug('sensorId ' + sensorID);
            if('trigger_srid' !== sensorID){
                navigator.jrdExtension.setPropertyValue('persist.sys.sensor.id','trigger_srid');
            }
            setTimeout(function () {
                navigator.mozCameras.getCamera(camera[0])
                    .then(AutoTest.gotCamera.bind(AutoTest.this), AutoTest.gotCameraError.bind(AutoTest.this));

            },100);
        }
    }
   debug('auto cameraId ' + cameraId);
  },

  gotCamera: function _gotCamera(params) {
     _cameraObj = params.camera;
     debug('auto gotCamera');
  },

  gotCameraError:  function _gotCameraError() {
     debug('gotCameraError');
  },
 
  checkCamera:function check_Camera() {
    debug('checkCamera');
    if (_cameraObj) {
      debug('checkCamera release _cameraObj');
        _cameraObj.release().then(function() {
           _cameraObj = null;
           }, function() {
           debug('fail to release camera');
         });
      }
  },
  restart: function AutoTest_restartAutoTest() {
    this.index = 0;
    this.resultList = [];
    this.start();
  },

  start: function AutoTest_startAutoTest() {
    //if end , show end play
    if (this.index >= this.testList.length) {
      this.autoStartButtonStatus = 'end';
      this.displayResultList();
      return;
    }
    this.showPanel('test-panel');
    this.autoStartButton.innerHTML = 'Start';
    this.autoStartButtonStatus = 'start';
    this.retestButton.style.visibility = 'hidden';
    this.iframe.src = this.testList[this.index] + '.html';
    this.iframe.focus();
  },

  end: function AutoTest_endAutoTest() {
    this.stopGps();
    this.stopNfc();
    this.setResultList();
    window.location = '../index.html';
  },

  goToNext: function AutoTest_goToNextTest() {
    this.index += 1;
    if (this.index < this.testList.length) {
      this.iframe.src = this.testList[this.index] + '.html';
       if(this.iframe.src == 'app://mmitest.gaiamobile.org/tests/camera.html' || this.iframe.src == 'app://mmitest.gaiamobile.org/tests/camera_front.html'){
        this.checkCamera();
      }
    } else {
      this.displayResultList();
      this.autoStartButtonStatus = 'end';
      this.restartYes.disabled = true;
    }
  },

  onFailed: function AutoTest_failAutoTest() {
    debug('failAutoTest ==================== ');
    this.setResultList();

    this.autoStartButton.innerHTML = 'Next';
    this.autoStartButtonStatus = 'next';
    this.retestButton.style.visibility = 'visible';

    this.centerContext.innerHTML =
        this.getItemName(this.testList[this.index]) +
        ' test failed <br > Press Next or Retest';

    this.showPanel('main-panel');
    this.iframe.blur();
  },

  displayResultList: function AutoTest_displayResultList(list) {
    debug('displayResultList');
    this.showPanel('result-screen');
    this.iframe.blur();

    if (list) {
      this.resultList = list.split(',');
    }

    debug(this.resultList);
    var result = '';
    for (var i = 0; i < this.testList.length; i++) {
      result += '<p class=' + this.resultList[i] + '>' + this.testList[i] + ': ' +
       (this.resultList[i] === undefined || this.resultList[i] === '' ?
        'not test' : (this.resultList[i] === 'true' ? 'pass': 'fail')) + '</p>' ;
    }
    this.resultText.innerHTML = result;
  },

  // according to file name, get the item name.
  getItemName: function AutoTest_getItemName(fileName) {
    var itemInfo = fileName;
    var items = this.config.testItems;

    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].htmlName === fileName) {
        itemInfo = items[i].itemInfo;
        return itemInfo;
      }
    }

    return itemInfo;
  },

  loadConfig: function ut_loadConfig() {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', '../resource/config.json', true);
    xhr.send(null);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status === 0 || xhr.status === 200) {
        var obj = JSON.parse(xhr.responseText);
        // SPRD ? Qcom? Or define by ODM self, XXX, default set true load sprd config
        if (true) {
          this.config = obj.sprd;

          this.testList = [];
          var testItems = this.config.testItems;
          for (var i = 0, len = testItems.length; i < len; i++) {
            if ('true' === testItems[i].autoTest[0].testFlag) {
              if ('camera_front' === testItems[i].htmlName && !this.hasFront()) {
                debug('No front camera, ignore!');
                continue;
              }
              this.testList.push(testItems[i].htmlName);
            }
          }
        }
      }
    };
  },

  init: function AutoTest_init() {
    var flag = window.sessionStorage.getItem('AUTOFLAG');
    if (flag == 'MMITEST2') {
      this.isMMI2Test = true;
    } else {
      this.isMMI2Test = false;
    }
    this.loadConfig();
    this.initCamera();
    // start gps_test module when enter test.
    this.startGps();
    this.iframe.addEventListener('load', this);
    this.iframe.addEventListener('unload', this);
    this.retestButton.addEventListener('click', this);
    this.retestButton.style.visibility = 'hidden';
    this.restartYes.addEventListener('click', this);
    this.restartNo.addEventListener('click', this);

//    this.getResultList((list) => {
//      this.displayResultList(list);
//    });
    this.resetResultList();
    this.resetManuResultList();
    this.resetStationFlag();
  },
  
  uninit:function () {
      if (_cameraObj) {
          this.checkCamera();
      }
  },

  handleEvent: function AutoTest_handleEvent(evt) {
    switch (evt.type) {
      case 'click':
        if (evt.name === 'pass') {
          this.resultList[this.index] = 'true';
          this.saveManuResult(this.testList[this.index], evt.name);
          if (this.testList[this.index] === 'audio') {
            this.iframe.blur();
            window.focus();
            var self = this;
            setTimeout(function() {
              self.index += 1;
              self.start();
            }, 500);
            return;
          }
          this.goToNext();
        } else if (evt.name === 'fail') {
          this.resultList[this.index] = false;
          this.saveManuResult(this.testList[this.index], evt.name);
          this.onFailed();
        }
        break;
      case 'retestButton':
        if (this.retestButton.style.visibility !== 'hidden') {
          this.start();
        }
        break;
      default:
        break;
    }
  },

  handleKeydown: function AutoTest_handleKeydown(evt){
    evt.preventDefault();
    switch(evt.key){
      case 'SoftRight':
        this.end();
        break;

      case 'SoftLeft':
        if (!this.resultPanel.classList.contains('hidden') &&
            this.autoStartButtonStatus === 'end') {
      //    this.restart();
          return;
        }
        if (this.autoStartButtonStatus === 'next') {
          this.index += 1;
        }
        this.start();
        break;

      case 'ArrowUp':
        if (!this.resultPanel.classList.contains('hidden')) {
          this.resultText.scrollTop -= 60;
        } else {
          this.start();
        }
        break;

      case 'ArrowDown':
        if (!this.resultPanel.classList.contains('hidden')) {
          this.resultText.scrollTop += 60;
        }
        break;

      default:
        break;
    }
  },

  resetResultList: function AutoTest_resetResult() {
    asyncStorage.setItem(RESULT_LIST, '');//AUTO_TEST_RESULT_TEMPLATE
    this.getResultList((list) => {
      this.displayResultList(list);
    });
  },

  resetManuResultList: function AutoTest_resetManuResult() {
    asyncStorage.setItem(MMITEST_RESULT, JSON.stringify(TEST_RESULT_TEMPLATE));
    this.getManuResultList();
  },

  resetStationFlag: function AutoTest_resetStation() {
    debug('writeAllNotTest');
    if (AutoTest.isMMI2Test) {
      RemoteHelper.writeMMI2AllNotTest(() => {
        debug('auto write mmi2 all not test success');
        this.state = 'unlocked';
      }, () => {});
    } else {
      RemoteHelper.writeAllNotTest(() => {
        debug('auto write mmi all not test success');
        this.state = 'unlocked';
      }, () => {});
      RemoteHelper.writeMMI2AllNotTest(() => {
        debug('auto write mmi2 all not test success');
        this.state = 'unlocked';
      }, () => {});
    }
  },

  setManuResultList: function AutoTest_setResult() {
    asyncStorage.setItem(MMITEST_RESULT, JSON.stringify(this.resultManuList));
    debug('set asycstorage result:' + JSON.stringify(this.resultManuList));
  },

  getManuResultList: function AutoTest_geManuResultList(callback) {
    asyncStorage.getItem(MMITEST_RESULT, (value) => {
      if (!value) {
        value = JSON.stringify(TEST_RESULT_TEMPLATE);
      }
      this.resultManuList = JSON.parse(value);
    });
  },

  /*
   * return value: 0, 1, 2
   *    0: have not test
   *    1: all items test but have failed item
   *    2: all items test and all items
   */
  getAllTestResult: function rm_getAllTestResult() {
    var mmi_result = RESULT_STATE.ALL_PASS;
    for (var i = 0; i < this.testList.length; i++) {
      var ret = this.resultList[i] === undefined || this.resultList[i] === '' ?
        'not test' : (this.resultList[i] === 'true' ? 'pass': 'fail');
      if (mmi_result === RESULT_STATE.ALL_PASS) {
        if (ret === 'notTest') {
          mmi_result = RESULT_STATE.NOT_TEST;
        } else if (ret === 'fail') {
          mmi_result = RESULT_STATE.ALL_TEST;
        }
      }
    }
    return mmi_result;
  },

  /*
   * return value: 0, 1, 2
   *    0: have not test
   *    1: all items test but have failed item
   *    2: all items test and all items
   */
  getAllManuTestResult: function rm_getAllManuTestResult() {
    var result = RESULT_STATE.ALL_PASS;
    for (var key in this.resultManuList.items) {
      if (key == 'camera_front' && !this.hasFront()) {
        continue;
      }
      var value = this.resultManuList.items[key];
      if (value === 'notTest') {
        result = RESULT_STATE.NOT_TEST;
        break;
      } else if (value === 'fail') {
        // XXX, if fail at this item, set flag to all test unless
        // we get a 'notTest' later in this loop
        result = RESULT_STATE.ALL_TEST;
      }
    }
    return result;
  },

  setPhaseCheck: function rm_setPhaseCheck() {
    debug('auto setPhaseCheck this.state = ' + this.state);
    if (this.state === 'locked') {
      return;
    }
    var result = this.getAllManuTestResult();
    debug('auto setPhaseCheck result = ' + result);
    debug('auto setPhaseCheck this.result.alltest = ' + this.resultManuList.alltest);
    if (!this.resultManuList.alltest) {
      if (result !== RESULT_STATE.NOT_TEST) {
        if (AutoTest.isMMI2Test) {
          RemoteHelper.writeMMI2AllTest(() => {
            debug('auto write mmi2 all test success');
            if (result === RESULT_STATE.ALL_TEST) {
              RemoteHelper.writeMMI2AllTestButFail(() => {
                debug('write all mmi2 test but failed success');
                showToaster('Auto test failed');
              }, () => {});
            } else if (result === RESULT_STATE.ALL_PASS) {
              RemoteHelper.writeMMI2AllPass(() => {
                debug('auto write mmi2 all pass success (first all test)');
                this.state = 'locked';
                showToaster('Auto test success');
              }, () => {});
            }
          }, () => {});
        } else {
        RemoteHelper.writeAllTest(() => {
          debug('auto write all test success');
        if (result === RESULT_STATE.ALL_TEST) {
          RemoteHelper.writeAllTestButFail(() => {
            debug('write all test but failed success');
          showToaster('Auto test failed');
        }, () => {});
        } else if (result === RESULT_STATE.ALL_PASS) {
          RemoteHelper.writeAllPass(() => {
            debug('auto write all pass success (first all test)');
          this.state = 'locked';
          showToaster('Auto test success');
        }, () => {});
        }
      }, () => {});
        }
        this.resultManuList.alltest = true;
      }
    } else {
      if (result === RESULT_STATE.ALL_PASS) {
        if (AutoTest.isMMI2Test) {
          RemoteHelper.writeMMI2AllPass(() => {
            debug('auto write mmi2 all pass success (update test result)');
            this.state = 'locked';
          }, () => {});
        } else {
          RemoteHelper.writeAllPass(() => {
            debug('auto write mmi all pass success (update test result)');
            this.state = 'locked';
          }, () => {});
        }
      }
    }
  },

  saveManuResult: function ut_changeResult(name, value) {
    if (this.resultManuList.items[name]) {
      this.resultManuList.items[name] = value;
    }

    this.setPhaseCheck();
    this.setManuResultList(this.resultManuList);
  }
};

function showToaster(msg) {
  Toaster.showToast({message: msg, latency: 2000});
};

function success() {
  dump('<mmitest> ------  Search satellite success ! ');
}

function error() {
  dump('<mmitest> ------   Search satellite failed !  ');
   setTimeout(() => {
    AutoTest.startGps();
  }, 5000);
}

function enableGeolocationSatellite(enable) {
  var satelliteEnabled = enable.toString();
  navigator.jrdExtension.setPropertyValue("mmitestgps.satellite.enabled", satelliteEnabled);
}

function deleteGpsInfo() {
    var aParamAarry = ['rmgps'];
    var req = navigator.jrdExtension.execCmdLE(aParamAarry, 1);
    req.onsuccess = function() {
      debug('Delete gps_info file successfull!');
    };
    req.onerror = function() {
      debug('Delete gps_info.file failed!');
    };
 }

window.onload = AutoTest.init.bind(AutoTest);
window.addEventListener('beforeunload',AutoTest.uninit.bind(AutoTest));
window.addEventListener('keydown', AutoTest.handleKeydown.bind(AutoTest));

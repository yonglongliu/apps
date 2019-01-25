/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: manu.js
// * Description: mmitest -> manual test part.
// * Note: When you want to add a new test item, just add the html file
// *       name in manu.html
// ************************************************************************

/* global dump SimpleNavigationHelper*/
'use strict';

const DEBUG = true;
function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [manu.js] = ' + s + '\n');
  }
}

var geolocation = navigator.geolocation;

var camera = navigator.mozCameras.getListOfCameras();

var geolocationSettingEnabled;

navigator.mozSettings.createLock().get('geolocation.enabled').then((result) => {
  geolocationSettingEnabled = result['geolocation.enabled'];
});

var ManuTest = {
  config: {},

  get iframe() {
    return document.getElementById('test-iframe');
  },

  get manuList() {
    return document.getElementById('manuList');
  },

  get manuPanel() {
    return document.getElementById('manu-panel');
  },

  get testPanel() {
    return document.getElementById('test-panel');
  },

  hasFront: function has_frontcamera() {
    if (camera && camera.length > 1) {
      return true;
    }
    return false;
  },

  createList: function(config) {
    var container = document.getElementById('manuList');
    var ul = document.createElement('ul');

    var createListItem = function (name, info) {
      var li = document.createElement('li');
      var p = document.createElement('p');
      p.textContent = info;
      li.setAttribute('data-name', name);
      li.appendChild(p);
      li.classList.add('focusable');
      li.tabIndex = 0;
      li.onfocus = function () {
        ManuTest.updateListItemColor(p, name);
      };
      ul.appendChild(li);
    };

    if (config) {
      for (var i = 0, len = config.testItems.length; i < len; i++) {
        if ('true' === config.testItems[i].manuTest[0].testFlag) {
          if ('camera_front' === config.testItems[i].htmlName && !this.hasFront()) {
            debug('No front camera, ignore!');
            continue;
          }
          createListItem(config.testItems[i].htmlName, config.testItems[i].itemInfo);
        }
      }
      container.appendChild(ul);

      this.navigator = new SimpleNavigationHelper('.focusable', container);
      container.focus();
    } else {
      //xxx: Show error info
    }
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
        // SPRD ? Qcom? Or define by ODM self
        if (true) {
          this.config = obj.sprd;
          this.createList(this.config);
          debug('createList success');
        }
      }
    };
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

  phasecheckLockInfo: function(info) {
    var isAllPass = false;
    var array = info.split('\n');

    function nameisMMI(str) {
      return str.indexOf('MMI') !== -1;
    }

    function valueisPass(str) {
      return str.indexOf('Pass') !== -1;
    }

    isAllPass = array.some(function(str) {
      var sub = str.split(' ');
      return (nameisMMI(sub[0]) && valueisPass(sub[1]));
    });

    return isAllPass;
  },

  openTest: function ut_openTest(name) {
    this.testPanel.classList.remove('hidden');
    this.manuPanel.classList.add('hidden');
    this.iframe.src = name + '.html';
    this.iframe.focus();

    this.currentTest = name;
  },

  closeTest: function ut_closeTest() {
    this.testPanel.classList.add('hidden');
    this.manuPanel.classList.remove('hidden');
    this.iframe.src = '';
    this.manuList.focus();
  },

  init: function ut_init() {
    this.loadConfig();
    // start gps  to speed up test result.
    this.startGps();
    // Dont let the phone go to sleep while in mmitest.
    // user must manually close it
    if (navigator.requestWakeLock) {
      navigator.requestWakeLock('screen');
    }

    // Make sure if we need modify phasecheck MMItest station
    RemoteHelper.showbinfile((info) => {
      ResultManager.state = this.phasecheckLockInfo(info) ? 'locked' : 'unlocked';
      debug('RM.state: ' + ResultManager.state);
    }, () => {});

    // Init test result list in asycstorage
    ResultManager.getResultList(function () {
      debug('getResultList success');
      var li = document.getElementsByTagName("li");
      for (var i=0; i< li.length; i++) {
        var dataname = li[i].getAttribute('data-name');
        ManuTest.updateListItemColor(li[i].firstElementChild, dataname);
      }
    });
  },

  updateListItemColor: function ut_updateitemdisplay(p, key) {
    var result = ResultManager.getItemTestResult(key);
    if (result == 'pass') {
      p.classList = 0;
      p.classList.add('result-pass');
    } else if (result == 'fail') {
      p.classList = 0;
      p.classList.add('result-fail');
    }
  },

  handleEvent: function ut_handleEvent(ev) {
    switch (ev.type) {
      case 'click':
        if (ev.name === 'pass') {
          if (this.currentTest === 'test_result') {
            var result = ResultManager.getAllTestResult();
            if (result != RESULT_STATE.ALL_PASS) {
              alert('Some item not pass');
              break;
            }
          }
          ResultManager.saveResult(this.currentTest, 'pass');
        } else if (ev.name == 'fail') {
          ResultManager.saveResult(this.currentTest, 'fail');
        }

        this.closeTest();
        break;
      default:
        break;
    }
  },

  handleKeydown: function ut_handleKeydown(evt) {
    evt.preventDefault();
    var target = evt.target;
    switch (evt.key) {
      case 'Backspace':
        this.stopGps();
        window.location = '../index.html';
        break;
      case 'Enter':
        if (target.dataset.name) {
          this.openTest(target.dataset.name);
        }
        break;
      default:
        break;
    }
  }
};

function success(position) {
  debug('<mmitest> ------  Search satellite success ! ');
  window.sessionStorage.removeItem('latitude');
  window.sessionStorage.setItem('latitude', position.coords.latitude);
  window.sessionStorage.removeItem('longitude');
  window.sessionStorage.setItem('longitude', position.coords.longitude);
}

function error() {
  debug('<mmitest> ------   Search satellite failed !  ');
  setTimeout(() => {
    ManuTest.startGps();
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

window.onload = ManuTest.init.bind(ManuTest);
window.addEventListener('keydown', ManuTest.handleKeydown.bind(ManuTest));

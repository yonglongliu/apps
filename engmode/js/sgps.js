/* global Item, RemoteHelper */

'use strict';

function debugsgps(s) {
    dump('<SGPS>' + s + '\n');
}

function $(id) {
  return document.getElementById(id);
}

const GPS_INTERVAL = 3000; //1s

const GSP_NMEA_LOG_PATH = '/data/sgps_log/Nmealog.txt';

const GPS_EXTRA_GPSONLY = "$PSPRD,00,3,1";    //GPS only
const GPS_EXTRA_GLONASS = "$PSPRD,00,3,4";     //GLONASS only
const GPS_EXTRA_BDSONLY = "$PSPRD,00,3,2";     //BDSonly
const GPS_EXTRA_GLONASSGPS = "$PSPRD,00,3,5";   //GLONASS+GPS
const GPS_EXTRA_GPSBDS = "$PSPRD,00,3,3";   //GPS+BDS

var SGPS_Position = {
  createNew: function(ind, lat, lon, dis, tf){
    var cat = {};
    cat.index = ind;
    cat.latitude = lat;
    cat.longtitude = lon;
    cat.distance = dis;
    cat.ttff = tf;
    return cat;
  }
};

var SGPS = new Item();

SGPS.satellit_number = 0;

SGPS.stateinUsedArr = [];
SGPS.stateinTrackingArr = [];

SGPS.gpstest_result = [];

SGPS.statellisky_width = 0;
SGPS.statellisky_height = 0;
SGPS.statellisky_radius = 0;
SGPS.statelli_radius = 0;

SGPS.signal_width = 0;
SGPS.signal_height = 0;
SGPS.signal_rectW = 0;
SGPS.signal_index = 0;
SGPS.signal_gap = 2;
SGPS.signal_divide = 0;

SGPS.configPath = '/data/gnss/config/config.xml';

SGPS.satelli_timer = null;
SGPS.satelli_timeout = null;

SGPS.autoTestCount = 0;
SGPS.autoTestInterval = 0;
SGPS.autoTestTimeout = 0;

SGPS.autoTest = false;
SGPS.tab = null;
SGPS.tabIndex = 0;
SGPS.tabPages = null;
SGPS.TAB_NUMBER = 6;
SGPS.watchId = null;
SGPS.timer = null;
SGPS.tabsId = ['sgps-satelli', 'debugsgps-log', 'sgps-information', 'nmea-log', 'sgps-circ', 'sgps-test'];

SGPS.Infos = ['sgps-info-date', 'sgps-info-time', 'sgps-info-ttff', 'sgps-info-first-latitude',
  'sgps-info-first-longitude', 'sgps-info-latitude', 'sgps-info-longitude',
  'sgps-info-altitude', 'sgps-info-accuracy'];

SGPS.STATE = {
  STOP: 0,
  START: 1,
  WATCH: 2
};

SGPS.state = SGPS.STATE.STOP;

SGPS.start_mode = 'hot';
SGPS.start_modeValue = 0;

SGPS.location_mode = '0';

SGPS.mode = 'hot';
SGPS.modeValue = 0;
SGPS.result = [];

SGPS.autoTestTimes = 0;

SGPS.geolocationEnabled = false;

SGPS.gpstest_latitude = 0;
SGPS.gpstest_longtitude = 0;

SGPS.autotest_ave_ttff = 0;

SGPS.log = '';

SGPS.DEBUG = {
  get log() {
    return SGPS.log;
  },

  set log(content) {
    SGPS.log = `${content}<br />${SGPS.log}`;
    SGPS.debugContent.innerHTML = SGPS.log;
  },

  clear: function() {
    SGPS.log = '';
    SGPS.debugContent.innerHTML = SGPS.log;
  }
};

SGPS.update = function() {
  debugsgps('update');
  this.tab = document.getElementById('sgps-tab');
  // this.tab.select(0);
  this.tabPages = document.querySelectorAll('.sgps-tabpage');
  this.element = document.getElementById('sgps');

  this.debugContent = document.getElementById('debuglog-content');

  NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);

  // enable geolocation in SGPS silently
  navigator.mozSettings.createLock().get('geolocation.enabled').then((result) => {
    SGPS.geolocationEnabled = result['geolocation.enabled'];
    if (!SGPS.geolocationEnabled) {
      SGPS.enableGeolocation(true).then(() => {
        SGPS.geolocationEnabled = true;
    });
    }
  });

  $('sgps-info-stop').disabled = true;
  $('nmea-log-stop').disabled = true;
  // $('sgps-info-watch').disabled = true;

  this.initINFORMAParams();
  this.initStartMode();
  this.initLocationMode();
  this.initGpsMode();
  this.initInput();
  this.initSatelli();

  // debugsgps('inputCursorInit');
  // this.inputCursorInit($('newgeoloc-times'));
  // this.inputCursorInit($('newgeoloc-interval'));
  // this.inputCursorInit($('newgeoloc-transfer-interval'));
  // this.inputCursorInit($('newgeoloc-timeout'));
  // this.inputCursorInit($('gps-test-latitude-input'));
  // this.inputCursorInit($('gps-test-longtitude-input'));
};

SGPS.initINFORMAParams = function () {
  RemoteHelper.getgnssproperty('GE2-VERSION',
    (value) => {
    $('sgps-info-gps-version').textContent = 'GPS version: ' + value;
});

  RemoteHelper.getgnssproperty('SPREADORBIT-ENABLE',
    (value) => {
    debugsgps('SPREADORBIT-ENABLE = ' + value);
  if (value === 'TRUE') {
    $('spreadorbit-switch').checked = true;
  }
});

  RemoteHelper.getgnssproperty('REALEPH-ENABLE',
    (value) => {
    debugsgps('REALEPH-ENABLE = ' + value);
  if (value === 'TRUE') {
    $('realeph-switch').checked = true;
  }
});

  RemoteHelper.getgnssproperty('LOG-ENABLE',
    (value) => {
    debugsgps('LOG-ENABLE = ' + value);
  if (value === 'TRUE') {
    $('gnsslog-switch').checked = true;
  }
});
};

SGPS.initInput = function () {
  debugsgps('initInput');
  var content = $('newparameters');
  var allLi = content.querySelectorAll('li');
  for (let liItem of allLi) {
    liItem.onfocus = function (e) {
      let liInput = e.target.querySelector('input');
      if (liInput) {
        var spos = liInput.value.length;
        if (liInput.setSelectionRange) {
          setTimeout(function () {
            liInput.setSelectionRange(spos, spos);
            liInput.focus();
          }, 0);
        }
      }
    }
  }

  var content = $('newparameters_extra');
  var allLi_extra = content.querySelectorAll('li');
  for (let liItem of allLi_extra) {
    liItem.onfocus = function (e) {
      let liInput = e.target.querySelector('input');
      if (liInput) {
        var spos = liInput.value.length;
        if (liInput.setSelectionRange) {
          setTimeout(function () {
            liInput.setSelectionRange(spos, spos);
            liInput.focus();
          }, 0);
        }
      }
    }
  }
};

SGPS.initStartMode = function () {
  var selectLi = $('start-mode-select');
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
    evt.stopPropagation();
    evt.preventDefault();
    select.focus();
  }
});

  select.addEventListener('change', (evt) => {
    let values = select.selectedOptions;
  let len = values.length;
  for (let i = 0; i < len; i++) {
    SGPS.start_mode = values[i].value;
  }
  this.updateStartModeData();
});

  select.addEventListener('blur', (evt) => {
    window.dispatchEvent(new CustomEvent('update-focus'));
});
};

SGPS.initLocationMode = function () {
  var selectLi = $('location-mode-select');
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
    evt.stopPropagation();
    evt.preventDefault();
    select.focus();
  }
});

  select.addEventListener('change', (evt) => {
    let values = select.selectedOptions;
    let len = values.length;
    for (let i = 0; i < len; i++) {
      SGPS.location_mode = values[i].value;
    }

    var command;
    switch (SGPS.location_mode) {
      case '001':
        command = GPS_EXTRA_GPSONLY;
        break;
      case '100':
        command = GPS_EXTRA_GLONASS;
        break;
      case '010':
        command = GPS_EXTRA_BDSONLY;
        break;
      case '101':
        command = GPS_EXTRA_GLONASSGPS;
        break;
      case '011':
        command = GPS_EXTRA_GPSBDS;
        break;
    }
    debugsgps('send location mode cmd:' + command);
    RemoteHelper.sendATCommand(command, function () {
      debugsgps('send location mode cmd success');
    });
  });

  select.addEventListener('blur', (evt) => {
    window.dispatchEvent(new CustomEvent('update-focus'));
});
};

SGPS.initGpsMode = function () {
  var selectLi = $('gps-mode-select');
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
    evt.stopPropagation();
    evt.preventDefault();
    select.focus();
  }
});

  select.addEventListener('change', (evt) => {
    let values = select.selectedOptions;
  let len = values.length;
  for (let i = 0; i < len; i++) {
    SGPS.mode = values[i].value;
    this.deleteData();
  }
});

  select.addEventListener('blur', (evt) => {
    window.dispatchEvent(new CustomEvent('update-focus'));
});
};

SGPS.inputCursorInit = function (tobj) {
  tobj.addEventListener('keydown', function (evt) {
    if (evt.key === 'ArrowLeft') {
      evt.stopPropagation();
      evt.preventDefault();
    } else if (evt.key === 'ArrowRight') {
      evt.stopPropagation();
      evt.preventDefault();
    }
  });
};

SGPS.searchCallback = function() {
  debugsgps('searchCallback');
  var svString = null;
  if (navigator.jrdExtension) {
    svString = navigator.jrdExtension.fileReadLE('GPSif');
  } else {
    svString = '';
  }
  if (!svString || svString === '') {
    return;
  }
  var svInfo = JSON.parse(svString);
  SGPS.DEBUG.log = `Satelli Count: ${svInfo.num}`;
  debugsgps('sv num:' + svInfo.num);
  SGPS.drawBackground();
  if (svInfo.num > 0) {
    SGPS.signal_rectW = (SGPS.signal_width-SGPS.signal_gap*2)/svInfo.num;
    SGPS.signal_index = 0;
    var prnArr = [];
    for (var i in svInfo.gps) {
      var prn = svInfo.gps[i].prn;
      var snr = svInfo.gps[i].snr;
      var elevation = svInfo.gps[i].elevation;
      var azimuth = svInfo.gps[i].azimuth;
      if (!isNaN(prn) && !isNaN(snr)) {
        prnArr.push(parseInt(prn));
        // debugsgps("satellite(" + i + "): elevation=" + elevation + " azimuth=" + azimuth);
        SGPS.drawSatelliByAzimuth(elevation, azimuth, prn, snr);
      }
    }
    if (SGPS.autoTest) {
      SGPS.updateSatelliteState(prnArr);
    } else {
      SGPS.satellit_number = prnArr.length;
    }
  }

  //update nmea log
  debugsgps('GPSNmea:start');
  RemoteHelper.readconf(GSP_NMEA_LOG_PATH, (response)=>{
    debugsgps('GPSNmea:'+response);
    $('nmea-log-content').textContent = response;
  });
};

SGPS.updateSatelliteState = function (prnArr) {
  debugsgps('updateSatelliteState:'+prnArr);
  var gpsInUsedNum=0,glonassInUsedNum=0,beidouInUsedNum=0,trackingNum=0;
  for (var i in prnArr) {
    let prn = prnArr[i];
    if (prn >= 1 && prn <= 32) {
      gpsInUsedNum++;
    } else if (prn >= 65 && prn <= 92) {
      glonassInUsedNum++;
    } else if (prn >= 151 && prn <= 187) {
      beidouInUsedNum++;
    } else {
      trackingNum++;
    }
  }
  SGPS.stateinUsedArr.push(gpsInUsedNum);
  SGPS.stateinTrackingArr.push(trackingNum);
  let stateInusedTotal = 0;
  for (var j in SGPS.stateinUsedArr) {
    stateInusedTotal += SGPS.stateinUsedArr[j];
  }
  let stateInusedAve = stateInusedTotal/SGPS.stateinUsedArr.length;

  let stateIntrackingTotal = 0;
  for (var k in SGPS.stateinTrackingArr) {
    stateIntrackingTotal += SGPS.stateinTrackingArr[k];
  }
  let stateIntrackingAve = stateIntrackingTotal/SGPS.stateinTrackingArr.length;

  $('sgps-info-inusedave').textContent = `stateInusedAve is: ${stateInusedAve.toFixed(1)}`;
  $('sgps-info-trackingave').textContent = `stateTrackingAve is: ${stateIntrackingAve.toFixed(1)}`;
};

SGPS.reopenGps = function(_callback) {
  SGPS.enableGeolocation(false).then(() => {
    setTimeout(() => {
    SGPS.enableGeolocation(true).then(() => {
      //SGPS.deleteData();
      setTimeout(() => {
      _callback();
    },3000);
  });
  },3000);
})
};

SGPS.enableGeolocation = function(enable) {
  return new Promise(function(resolve) {
    var req = navigator.mozSettings.createLock().set({'geolocation.enabled': enable});
    req.onsuccess = function() {
      resolve();
    };
  }.bind(this));
};

SGPS.onHandleKeydown = function(e) {
  //debugsgps('onHandleKeydown key:' + e.key);
  switch (e.key) {
    case 'ArrowLeft':
      this.previousTab();
      break;

    case 'ArrowRight':
      this.nextTab();
      break;

    case '*':
      if (this.state === this.STATE.STOP) {
        this.startAutoTest();
      }
      break;

    case '#':
      this.state = this.STATE.STOP;
      this.stopGeoloc();
      break;

    case '9':
      // if (this.state === this.STATE.STOP) {
      //   this.startGeoloc.call(SGPS);
      // }
      break;

    case 'Enter': {
      var name = e.target.getAttribute('name');
      debugsgps('onHandleKeydown Enter:' + name);

      switch (name) {
        //INFORMATION
        case 'spgs-restart': {
          this.stopGeoloc();
          $('sgps-switch').checked = false;
          setTimeout(()=> {
            this.startGeoloc();
          $('sgps-switch').checked = true;
        }, 5000);
          break;
        }
        case 'sgps-switch-item': {
          var checked = $('sgps-switch').checked;
          if (checked === true) {
            //this.deleteData();
            debugsgps('startGeoloc');
            SGPS.stateinUsedArr = [];
            SGPS.stateinTrackingArr = [];
            this.startGeoloc();
          } else {
            debugsgps('stopGeoloc');
            this.stopGeoloc();
          }
          break;
        }
        case 'spreadorbit-switch-item': {
          var checked = $('spreadorbit-switch').checked;
          RemoteHelper.setgnssproperty('SPREADORBIT-ENABLE', checked == true ? 'TRUE' : 'FALSE',
            () => {
          });
          break;
        }
        case 'realeph-switch-item': {
          var checked = $('realeph-switch').checked;
          RemoteHelper.setgnssproperty('REALEPH-ENABLE', checked == true ? 'TRUE' : 'FALSE',
            () => {
          });
          break;
        }
        case 'gnsslog-switch-item': {
          var checked = $('gnsslog-switch').checked;
          RemoteHelper.setgnssproperty('LOG-ENABLE', checked == true ? 'TRUE' : 'FALSE',
            () => {
          });
          break;
        }

        //NMEA
        case 'nmea-save-switch-item': {
          var checked = $('nmea-save-switch').checked;
          //do nothing
          break;
        }
        case 'nmea-log-start': {
          if ($('nmea-log-start').disabled === false) {
            $('nmea-log-start').disabled = true;
            $('nmea-log-stop').disabled = false;
            $('nmea-log-clear').disabled = true;
            SGPS.enableNMEALog(true);
          }
          break;
        }
        case 'nmea-log-stop': {
          if ($('nmea-log-stop').disabled === false) {
            $('nmea-log-start').disabled = false;
            $('nmea-log-stop').disabled = true;
            $('nmea-log-clear').disabled = false;
            SGPS.enableNMEALog(false);
          }
          break;
        }
        case 'nmea-log-clear': {
          if ($('nmea-log-clear').disabled === false) {
            //delete "/data/sgps_log/Nmealog.txt"
            RemoteHelper.clearNmealog(() => {
              debugsgps('clearNmealog success');
          });
          }
          break;
        }

        //GPSCIRC
        case 'sgps-info-start': {
          if (this.state === this.STATE.STOP) {
            SGPS.stateinUsedArr = [];
            SGPS.stateinTrackingArr = [];
            this.resetGpsTestResult();
            this.startAutoTest();
          }
          break;
        }
        case 'sgps-info-stop': {
          this.state = this.STATE.STOP;
          this.stopAutoTest();
          break;
        }
        case 'sgps-info-watch': {
          var dis = computeDistance(31.29654, 128.2351254, 0, 0);
          debugsgps('sgps-info-watch dis = ' + dis);
          break;
        }

        //GPSTEST
        case 'gps-test-save': {
          SGPS.gpstest_latitude = $('gps-test-latitude-input').value;
          SGPS.gpstest_longtitude = $('gps-test-longtitude-input').value;
          debugsgps('SGPS.gpstest_latitude = ' + SGPS.gpstest_latitude);
          debugsgps('SGPS.gpstest_longtitude = ' + SGPS.gpstest_longtitude);
          alert('Save the latitude and longtitude successful!');
          // var p = SGPS_Position.createNew(1,
          //   31.29654, 128.2351254,
          //   0,33);
          // SGPS.gpstest_result.push(p);
          // SGPS.updateGpsTestResult(p);
          break;
        }
      }
      break;
    }
  }

  return false;
};

SGPS.previousTab = function() {
  if (this.tabPages !== null) {
    this.tabPages[this.tabIndex].hidden = true;
    this.tabIndex = (this.tabIndex - 1 + this.TAB_NUMBER) % this.TAB_NUMBER;
    this.tab.select(this.tabIndex);
    this.tabPages[this.tabIndex].hidden = false;

    NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  }
};

SGPS.nextTab = function() {
  if (this.tabPages !== null) {
    this.tabPages[this.tabIndex].hidden = true;
    this.tabIndex = (this.tabIndex + 1) % this.TAB_NUMBER;
    this.tab.select(this.tabIndex);
    this.tabPages[this.tabIndex].hidden = false;

    NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  }
};

SGPS.startGeoloc = function() {
  SGPS.startUpdateStateli();

  if (!this.autoTest) {
    SGPS.DEBUG.clear();
  }
  this.startTime = new Date();
  if (navigator.geolocation) {
    var options = {
      enableHighAccuracy: true,
      timeout: 120000,
      maximumAge: 0,
      gpsMode: SGPS.modeValue
    };

    if (this.autoTest) {
      options.timeout = SGPS.autoTestTimeout;
      debugsgps('getCurrentPosition');
      debugsgps('gpsMode = ' + options.gpsMode);
      this.DEBUG.log = 'Start get current position..';
      navigator.geolocation.getCurrentPosition(success, error, options);
    } else {
      options.gpsMode = SGPS.start_modeValue;
      debugsgps('watchPosition');
      debugsgps('gpsMode = ' + options.gpsMode);
      SGPS.watchId = navigator.geolocation.watchPosition(success, error, options);
      this.DEBUG.log = 'Start watch position..';
      this.state = SGPS.STATE.WATCH;
      $('sgps-info-stop').disabled = false;
      // $('sgps-info-watch').disabled = true;
      $('sgps-info-start').disabled = true;

      SGPS.firstFix = true;
    }
  }
};

SGPS.startUpdateStateli = function () {
  SGPS.enableGeolocationSatellite(true);
  SGPS.searchCallback();
  if (SGPS.satelli_timer === null) {
    debugsgps('startUpdateStateli');
    SGPS.DEBUG.log = `startUpdateStateli`;
    SGPS.satelli_timer = setInterval(SGPS.searchCallback.bind(SGPS), GPS_INTERVAL);
  }
};

SGPS.stopUpdateStateli = function () {
  SGPS.enableGeolocationSatellite(false);
  if (SGPS.satelli_timer) {
    debugsgps('stopUpdateStateli');
    SGPS.DEBUG.log = `stopUpdateStateli`;
    clearInterval(SGPS.satelli_timer);
    SGPS.satelli_timer = null;
  }
};

SGPS.updateStartModeData = function() {
  let type = SGPS.start_mode;
  switch (type) {
    case 'cold':
      SGPS.start_modeValue = 65535;
      break;

    case 'warm':
      SGPS.start_modeValue = 1;
      break;

    case 'factory':
      SGPS.start_modeValue = 84315;
      break;

    default:
      SGPS.start_modeValue = 0;
      break;
  }
};

SGPS.deleteData = function() {
  let type = SGPS.mode;
  switch (type) {
    case 'cold':
      SGPS.modeValue = 65535;
      break;

    case 'warm':
      SGPS.modeValue = 1;
      break;

    case 'factory':
      SGPS.modeValue = 84315;
      break;

    default:
      SGPS.modeValue = 0;
      break;
  }
};

SGPS.stopGeoloc = function() {
  SGPS.stopUpdateStateli();

  if (SGPS.watchId !== null) {
    navigator.geolocation.clearWatch(SGPS.watchId);
    SGPS.watchId = null;
  }

  if (this.autoTest) {
    this.autoTest = false;
    SGPS.saveToFile();
    window.clearTimeout(SGPS.timer);
    SGPS.timer = null;
  } else {
    SGPS.DEBUG.log = 'Stop geolocation';
  }

  this.state = SGPS.STATE.STOP;

  $('sgps-info-stop').disabled = true;
  // $('sgps-info-watch').disabled = false;
  $('sgps-info-start').disabled = false;
};

SGPS.clearInfo = function() {
  this.Infos.forEach((info) => {
    var e = $(info);
  e.textContent = (e.textContent.split(':'))[0] + ': ';
});

};

SGPS.startAutoTest = function() {
  SGPS.autoTestCount = $('newgeoloc-times').value;
  SGPS.autoTestInterval = $('newgeoloc-interval').value;
  SGPS.autoTestTimeout = $('newgeoloc-timeout').value*1000;

  if (!SGPS.autoTestCount || SGPS.autoTestInterval < 7) {
    SGPS.DEBUG.log = 'Please set auto test count, and make sure interval at least 7s';
    return;
  }

  if (SGPS.autoTestTimeout < 60000) {
    SGPS.DEBUG.log = 'Please make sure newgeoloc timeout at least 120s';
    return;
  }

  this.state = this.STATE.START;

  debugsgps('startAutoTest');

  SGPS.DEBUG.clear();

  this.autoTest = true;
  SGPS.result = [];
  SGPS.gpstest_result = [];
  $('sgps-info-stop').disabled = false;
  // $('sgps-info-watch').disabled = true;
  $('sgps-info-start').disabled = true;

  //this.deleteData();
  this.startGeoloc();
};

SGPS.stopAutoTest = function() {
  SGPS.DEBUG.log = 'stop auto test';

  debugsgps('stopAutoTest');

  let count = 0;
  let total = 0;
  for (let i = 0, len = this.result.length; i < len; i++) {
    if (!isNaN(this.result[i])) {
      count++;
      total += this.result[i];
    }
  }
  $('sgps-info-avarage-ttff').textContent = `Avarage TTFF: ${count > 0 ? total/count + 's' : 'N/A' }`;
  SGPS.DEBUG.log = `${count} times success, ttff is: ${count > 0 ? total/count + 's' : 'N/A' }`;
  this.result = [];
  this.autoTestTimes = 0;
  this.stopGeoloc();
};

SGPS.isNMEALogEnable = function () {
  return navigator.jrdExtension.getPropertyValue("sgps.nmea.enabled");
};

SGPS.enableNMEALog = function(enable) {
  var nmeaEnabled = enable.toString();
  navigator.jrdExtension.setPropertyValue("sgps.nmea.enabled", nmeaEnabled);
};

SGPS.enableGeolocationSatellite = function(enable) {
  var satelliteEnabled = enable.toString();
  navigator.jrdExtension.setPropertyValue("mmitestgps.satellite.enabled", satelliteEnabled);
};

SGPS.enableGeolocation = function(enable) {
  return new Promise(function(resolve) {
    var req = navigator.mozSettings.createLock().set({'geolocation.enabled': enable});
    req.onsuccess = function() {
      resolve();
    };
  }.bind(this));
};

SGPS.saveToFile = function() {
  if (SGPS.DEBUG.log !== '') {
    let path = `/sdcard/ylog/sgps_test_${(new Date()).getTime()}_${SGPS.mode}.log`;
    RemoteHelper.saveFile(path, SGPS.DEBUG.log, () => {
      Toaster.showToast({message: `result saved to ${path}`, latency: 2000});
  });
  }
};

SGPS.initSatelli =  function () {
  debugsgps('initSatelli');
  var c = $("satelli");
  SGPS.statellisky_width = c.width;
  SGPS.statellisky_height = c.height;
  SGPS.statellisky_radius = Math.min(SGPS.statellisky_width, SGPS.statellisky_height)/2;
  SGPS.statelli_radius = SGPS.statellisky_radius/12;
  SGPS.drawBackground();

  var s = $("signal");
  SGPS.signal_width = s.width;
  SGPS.signal_height = s.height;
  SGPS.signal_divide = s.height/5;
  SGPS.drawSignalBackground();
};

SGPS.drawBackground = function () {
  var c = $("satelli");
  var context = c.getContext("2d");
  var radius = SGPS.statellisky_radius;
  var center_x = SGPS.statellisky_width/2;
  var center_y = SGPS.statellisky_height/2;

  context.clearRect(0, 0, SGPS.statellisky_width, SGPS.statellisky_height);
//draw background
  context.fillStyle = "#455CDC";
  context.fillRect(0,0,SGPS.statellisky_width,SGPS.statellisky_height);

//draw circle pane
  context.beginPath();
  context.arc(center_x,center_y,radius/4,0,2*Math.PI);
  context.strokeStyle = "#CCC";
  context.stroke();

  context.beginPath();
  context.arc(center_x,center_y,radius/2,0,2*Math.PI);
  context.stroke();

  context.beginPath();
  context.arc(center_x,center_y,radius*3/4,0,2*Math.PI);
  context.stroke();

  context.beginPath();
  context.arc(center_x,center_y,radius,0,2*Math.PI);
  context.stroke();

//draw line
  context.beginPath();
  context.moveTo(center_x-radius,radius);
  context.lineTo(center_x-radius/4,radius);
  context.stroke();

  context.beginPath();
  context.moveTo(center_x,center_y-radius);
  context.lineTo(center_x,center_y-radius/4);
  context.stroke();

  context.beginPath();
  context.moveTo(center_x+radius,radius);
  context.lineTo(center_x+radius/4,radius);
  context.stroke();

  context.beginPath();
  context.moveTo(center_x,center_y+radius);
  context.lineTo(center_x,center_y+radius/4);
  context.stroke();

  SGPS.drawSignalBackground();
};

SGPS.drawSatelli = function (x, y, prn) {
  var c = $("satelli");
  var context = c.getContext("2d");
  context.beginPath();
  context.fillStyle = "#009999";
  x = SGPS.statellisky_width/2 + x;
  y = SGPS.statellisky_height/2 + y;
  context.arc(x,y,SGPS.statelli_radius,0,2*Math.PI);
  context.fill();
  context.stroke();

  context.font="12px Arial";
  context.fillStyle = "#222222";
  context.textAlign="center";
  context.textBaseline="middle";
  context.fillText(prn,x,y);
};

SGPS.drawSatelliByAzimuth = function (elevation, azimuth, prn, snr) {
  if (elevation >= 90 || azimuth <= 0 || prn <= 0 || snr <= 0) {
    return;
  }
  if (!isNaN(elevation) && !isNaN(azimuth)) {
    var x, y;
    var theta = -(azimuth - 90);
    var rad = theta * Math.PI / 180;
    x = Math.cos(rad);
    y = -Math.sin(rad);

    //I don't know why do this.
    elevation = 90 - elevation;

    var radius = SGPS.statellisky_radius;
    var a = elevation * radius / 90;
    x = Math.round(x * a);
    y = Math.round(y * a);
    SGPS.drawSatelli(x, y, prn);
  }
  SGPS.drawSignal(prn, snr);
};

SGPS.drawSignalBackground = function () {
  var c = $("signal");
  var context = c.getContext("2d");

  context.clearRect(0, 0, SGPS.signal_width, SGPS.signal_height);
//draw background
  context.fillStyle = "#222222";
  context.fillRect(0,0,SGPS.signal_width,SGPS.signal_height);

  context.strokeStyle = "#aaaaaa";
  context.beginPath();
  context.moveTo(0, SGPS.signal_divide);
  context.lineTo(SGPS.signal_width, SGPS.signal_divide);
  context.stroke();

  context.beginPath();
  context.moveTo(0, SGPS.signal_divide*2);
  context.lineTo(SGPS.signal_width, SGPS.signal_divide*2);
  context.stroke();

  context.beginPath();
  context.moveTo(0, SGPS.signal_divide*3);
  context.lineTo(SGPS.signal_width, SGPS.signal_divide*3);
  context.stroke();

  context.beginPath();
  context.moveTo(0, SGPS.signal_divide*4);
  context.lineTo(SGPS.signal_width, SGPS.signal_divide*4);
  context.stroke();
};

SGPS.drawSignal = function (prn, snr) {
  var rectH = (SGPS.signal_divide*4) * snr / 100;
  var c = $("signal");
  var context = c.getContext("2d");
  var startX = SGPS.signal_gap + SGPS.signal_index * (SGPS.signal_gap + SGPS.signal_rectW);

  context.fillStyle = "#009900";
  context.fillRect(startX,
    (SGPS.signal_height - SGPS.signal_divide) - rectH,
    SGPS.signal_rectW,
    rectH);

  context.font="8px Arial";
  context.fillStyle = "#dddddd";
  context.textAlign="center";
  context.textBaseline="middle";
  context.fillText(prn,startX+SGPS.signal_rectW/2,
    SGPS.signal_height-SGPS.signal_divide + 10);

  context.fillText(snr,startX+SGPS.signal_rectW/2,
    (SGPS.signal_height-SGPS.signal_divide)-rectH - 10);

  SGPS.signal_index++;
};

SGPS.updateGpsTestResult = function (p) {
  var list = $('gps_result_list');
  // let latitude = p.latitude;
  // if (!isNaN(SGPS.gpstest_latitude)) {
  //   latitude = latitude - SGPS.gpstest_latitude;
  // }
  // let longtitude = p.longtitude;
  // if (!isNaN(SGPS.gpstest_longtitude)) {
  //   longtitude = longtitude - SGPS.gpstest_longtitude;
  // }
  if (list.length > 9) {
    list.removeChild(list.firstChild);
  }
  list.innerHTML+="<li class=\"focusable select-li\">"
    +"<div class=\"sgps-result-small\">"+p.index+"<\/div>"
    +"<div class=\"sgps-result\">"+p.latitude+"<\/div>"
    +"<div class=\"sgps-result\">"+p.longtitude+"<\/div>"
    +"<div class=\"sgps-result\">"+p.distance+"<\/div>"
    +"<div class=\"sgps-result\">"+p.ttff+"<\/div>"
    +"<\/li>";

  let count = 0;
  let total = 0;
  for (let i = 0, len = this.gpstest_result.length; i < len; i++) {
    if (!isNaN(this.gpstest_result[i].ttff)) {
      count++;
      total += Number(this.gpstest_result[i].ttff);
    }
  }
  SGPS.autotest_ave_ttff = count > 0 ? (total/count).toFixed(2) : 0;
  $('result_average_ttff').textContent = `Avarage TTFF: ${SGPS.autotest_ave_ttff}s`;
  if (this.tabsId[this.tabIndex] == 'sgps-test') {
    NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  }
};

SGPS.resetGpsTestResult = function () {
  var ul = $('gps_result_list');
  while(ul.hasChildNodes()){
    ul.removeChild(ul.firstChild);
  }
  SGPS.gpstest_result = [];
  SGPS.autotest_ave_ttff = 0;
};

SGPS.updateAutoTestResult = function () {
  let result_success = this.gpstest_result.length;
  let result_fail = this.result.length - this.gpstest_result.length;
  let reslut_total = this.result.length;
  let success_rate = (result_success/reslut_total).toFixed(2);
  $('sgps-info-timeout-times').textContent = `TTFF timeoutTimes: ${result_fail}`;
  $('sgps-info-total-times').textContent = `Totle Times: ${reslut_total}`;
  $('sgps-info-success-rate').textContent = `Success Rate: ${success_rate}`;
  $('sgps-info-avarage-ttff-s').textContent = `Avarage TTFF(s): ${SGPS.autotest_ave_ttff}s`;

  var arr = [];
  for (let i = 0, len = this.result.length; i < len; i++) {
    if (!isNaN(this.result[i])) {
      arr.push(this.result[i]);
    }
  }
  arr.sort(function(a,b){
    if(a<b){
      return -1;
    }
    if(a>b){
      return 1;
    }
    return 0;
  });
  let m68 = parseInt(arr.length*0.68);
  let m95 = parseInt(arr.length*0.95);
  let max = arr.length - 1;
  m68 = m68 > max ? max : m68;
  m95 = m95 > max ? max : m95;
  debugsgps('m68='+m68+' m95='+m95+' max='+max);
  $('sgps-info-m68ttff').textContent = `m68Ttff is: ${arr[m68]}s`;
  $('sgps-info-m95ttff').textContent = `m95Ttff is: ${arr[m95]}s`;
  $('sgps-info-maxttff').textContent = `maxTtff is: ${arr[max]}s`;

  var arr_dis = [];
  var total_dis = 0;
  for (let i = 0, len = this.gpstest_result.length; i < len; i++) {
    arr_dis.push(this.gpstest_result[i].distance);
    total_dis += Number(this.gpstest_result[i].distance);
  }
  arr_dis.sort(function(a,b){
    if(a<b){
      return -1;
    }
    if(a>b){
      return 1;
    }
    return 0;
  });
  let m68_dis = parseInt(arr_dis.length*0.68);
  let m95_dis = parseInt(arr_dis.length*0.95);
  let max_dis = arr_dis.length - 1;
  m68_dis = m68_dis > max_dis ? max_dis : m68_dis;
  m95_dis = m95_dis > max_dis ? max_dis : m95_dis;
  let ave_dis = total_dis/this.gpstest_result.length;
  ave_dis = ave_dis.toFixed(2);
  debugsgps('total_dis='+total_dis+' gpstest_result.length='+this.gpstest_result.length);
  debugsgps('m68_dis='+m68_dis+' m95_dis='+m95_dis+' max_dis='+max_dis);
  $('sgps-info-avedistance').textContent = `Avarage distance(m): ${ave_dis}`;
  $('sgps-info-m68distance').textContent = `m68FirstDistance is: ${arr_dis[m68_dis]}`;
  $('sgps-info-m95distance').textContent = `m95FirstDistance is: ${arr_dis[m95_dis]}`;
  $('sgps-info-maxdistance').textContent = `maxFirstDistance is: ${arr_dis[max_dis]}`;
  $('result_average_dis').textContent = `Average distance(m): ${ave_dis}`;
};

function success(position) {
  debugsgps('Get position successfully.');
  var date = new Date();
  if (SGPS.autoTest) {
    SGPS.autoTestTimes++;
    var interval = (date.getTime() - SGPS.startTime.getTime()) / 1000;
    interval = interval.toFixed(2);
    $('sgps-info-current-times').textContent = `Current Times: ${SGPS.autoTestTimes}`;
    $('sgps-info-last-ttff').textContent = `Last TTFF: ${interval}s`;
    $('sgps-info-count-down').textContent = `Count Down: ${SGPS.autoTestCount}`;
    $('sgps-info-restart-mode').textContent = `Restart Mode: ${SGPS.mode}`;
    var p = SGPS_Position.createNew(
      SGPS.autoTestTimes,
      position.coords.latitude.toFixed(2),
      position.coords.longitude.toFixed(2),
      computeDistance(position.coords.latitude,
                      position.coords.longitude,
                      SGPS.gpstest_latitude,
                      SGPS.gpstest_longtitude),
      interval);
    SGPS.gpstest_result.push(p);
    SGPS.updateGpsTestResult(p);
    $('sgps-info-avarage-ttff').textContent = `Avarage TTFF: ${SGPS.autotest_ave_ttff}s`;
  } else {
    $('sgps-info-date').textContent = `Date: ${date.toDateString()}`;
    $('sgps-info-time').textContent = `Time: ${date.toTimeString()}`;
    $('sgps-info-latitude').textContent = `Latitude: ${position.coords.latitude}`;
    $('sgps-info-longitude').textContent = `Longitude: ${position.coords.longitude}`;
    $('sgps-info-altitude').textContent = `Altitude: ${position.coords.altitude}`;
    $('sgps-info-accuracy').textContent = `Accuracy: ${position.coords.accuracy.toFixed(2)}`;
    $('sgps-info-heading').textContent = `Heading: ${position.coords.heading.toFixed(2)}`;
    $('sgps-info-speed').textContent = `Speed: ${position.coords.speed.toFixed(2)}`;
    $('sgps-info-averagecn').textContent = `AverageCN: ${SGPS.satellit_number}`;

    var interval = (date.getTime() - SGPS.startTime.getTime()) / 1000;
    var ttff = `TTFF: ${interval}s`;
    if (SGPS.firstFix) {
      $('sgps-info-first-latitude').textContent = `First Latitude: ${position.coords.latitude}`;
      $('sgps-info-first-longitude').textContent = `First Longitude: ${position.coords.longitude}`;
      $('sgps-info-ttff').textContent = ttff;
      SGPS.firstFix = false;
    }
  }

  if (SGPS.autoTest) {
    SGPS.DEBUG.log = `Count: ${SGPS.autoTestCount}, ${ttff}, ${position.coords.latitude}, ${position.coords.longitude}`;
  } else {
    SGPS.DEBUG.log = 'Get position successfully.';
  }

  SGPS.result.push(interval);

  if (SGPS.autoTest) {
    SGPS.updateAutoTestResult();
  }

  if (SGPS.autoTest) {
    if (--SGPS.autoTestCount === 0) {
      SGPS.stopAutoTest();
      return;
    }
    debugsgps('success autoTestCount' + SGPS.autoTestCount);
    debugsgps('success autoTestInterval' + SGPS.autoTestInterval);

    SGPS.timer = setTimeout(()=> {
        SGPS.reopenGps(SGPS.startGeoloc.bind(SGPS));
    }, SGPS.autoTestInterval);
  }
}

function error(msg) {
  debugsgps('Get position error:' + msg.message);

  if (SGPS.autoTest) {
    SGPS.autoTestTimes++;
    $('sgps-info-current-times').textContent = `Current Times: ${SGPS.autoTestTimes}`;
    $('sgps-info-count-down').textContent = `Count Down: ${SGPS.autoTestCount}`;
    $('sgps-info-restart-mode').textContent = `Restart Mode: ${SGPS.mode}`;
  }

  if (SGPS.autoTest) {
    SGPS.DEBUG.log = `Count: ${SGPS.autoTestCount}, N/A`;
  } else {
    SGPS.DEBUG.log = `Get position error: ${msg.message}.`;
  }

  SGPS.result.push(NaN);

  if (SGPS.autoTest) {
    SGPS.updateAutoTestResult();
  }

  if (SGPS.autoTest) {
    if (--SGPS.autoTestCount === 0) {
      SGPS.stopAutoTest();
      return;
    }
    SGPS.timer = setTimeout(()=> {
        SGPS.reopenGps(SGPS.startGeoloc.bind(SGPS))
  }, 5000);
  }
}

//calc distance between two location point
function computeDistance(lat1, lon1, lat2, lon2) {
  var MAXITERS = 20;
  // Convert lat/long to radians
  lat1 *= Math.PI / 180.0;
  lat2 *= Math.PI / 180.0;
  lon1 *= Math.PI / 180.0;
  lon2 *= Math.PI / 180.0;

  var a = 6378137.0; // WGS84 major axis
  var b = 6356752.3142; // WGS84 semi-major axis
  var f = (a - b) / a;
  var aSqMinusBSqOverBSq = (a * a - b * b) / (b * b);

  var L = lon2 - lon1;
  var A = 0.0;
  var U1 = Math.atan((1.0 - f) * Math.tan(lat1));
  var U2 = Math.atan((1.0 - f) * Math.tan(lat2));

  var cosU1 = Math.cos(U1);
  var cosU2 = Math.cos(U2);
  var sinU1 = Math.sin(U1);
  var sinU2 = Math.sin(U2);
  var cosU1cosU2 = cosU1 * cosU2;
  var sinU1sinU2 = sinU1 * sinU2;

  var sigma = 0.0;
  var deltaSigma = 0.0;
  var cosSqAlpha = 0.0;
  var cos2SM = 0.0;
  var cosSigma = 0.0;
  var sinSigma = 0.0;
  var cosLambda = 0.0;
  var sinLambda = 0.0;

  var lambda = L; // initial guess
  for (var iter = 0; iter < MAXITERS; iter++) {
    var lambdaOrig = lambda;
    cosLambda = Math.cos(lambda);
    sinLambda = Math.sin(lambda);
    var t1 = cosU2 * sinLambda;
    var t2 = cosU1 * sinU2 - sinU1 * cosU2 * cosLambda;
    var sinSqSigma = t1 * t1 + t2 * t2; // (14)
    sinSigma = Math.sqrt(sinSqSigma);
    cosSigma = sinU1sinU2 + cosU1cosU2 * cosLambda; // (15)
    sigma = Math.atan2(sinSigma, cosSigma); // (16)
    var sinAlpha = (sinSigma == 0) ? 0.0 :
    cosU1cosU2 * sinLambda / sinSigma; // (17)
    cosSqAlpha = 1.0 - sinAlpha * sinAlpha;
    cos2SM = (cosSqAlpha == 0) ? 0.0 :
    cosSigma - 2.0 * sinU1sinU2 / cosSqAlpha; // (18)

    var uSquared = cosSqAlpha * aSqMinusBSqOverBSq; // defn
    A = 1 + (uSquared / 16384.0) * // (3)
      (4096.0 + uSquared *
      (-768 + uSquared * (320.0 - 175.0 * uSquared)));
    var B = (uSquared / 1024.0) * // (4)
      (256.0 + uSquared *
      (-128.0 + uSquared * (74.0 - 47.0 * uSquared)));
    var C = (f / 16.0) *
      cosSqAlpha *
      (4.0 + f * (4.0 - 3.0 * cosSqAlpha)); // (10)
    var cos2SMSq = cos2SM * cos2SM;
    deltaSigma = B * sinSigma * // (6)
      (cos2SM + (B / 4.0) *
      (cosSigma * (-1.0 + 2.0 * cos2SMSq) -
      (B / 6.0) * cos2SM *
      (-3.0 + 4.0 * sinSigma * sinSigma) *
      (-3.0 + 4.0 * cos2SMSq)));

    lambda = L +
      (1.0 - C) * f * sinAlpha *
      (sigma + C * sinSigma *
      (cos2SM + C * cosSigma *
      (-1.0 + 2.0 * cos2SM * cos2SM))); // (11)

    var delta = (lambda - lambdaOrig) / lambda;
    if (Math.abs(delta) < 1.0e-12) {
      break;
    }
  }

  var distance = (b * A * (sigma - deltaSigma));
  return parseFloat(distance).toFixed(2);
}

window.addEventListener('keydown', SGPS.handleKeydown.bind(SGPS));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#sgps') {
    navigator.requestWakeLock('screen');
    SGPS.update();
  }
});
/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: gps.js
// * Description: autoslt -> test item: gps test.
// * Note:
// ************************************************************************

/* global debug_gps, dump, TestItem */
'use strict';

function debug_gps(s) {
  console.log('daihai <autoslt> ------: [gps.js] = ' + s + '\n');
}

// ------------------------------------------------------------------------
const GPS_INTERVAL = 1000; //1s
const GPS_TEST_TIMEOUT = 40000; //40s

var geolocationSettingEnabled;
var geolocation = navigator.geolocation;

var gpsInfoResult = '';

var startTime;
var endTime;
var latitudeValue;
var longitudeValue;

var deleteGpsInfomation = true;

function GPSTest() {

  navigator.mozSettings.createLock().get('geolocation.enabled').then((result) => {
    geolocationSettingEnabled = result['geolocation.enabled'];
  debug_gps('current gps tatus is '+geolocationSettingEnabled);

});
}

GPSTest.prototype._timer = null;
GPSTest.prototype._timeout = null;

// GPSTest.prototype.searchCallback = function() {
//
// };

GPSTest.prototype.enableGeolocationSatellite = function(enable) {
  var satelliteEnabled = enable.toString();
  navigator.jrdExtension.setPropertyValue("mmitestgps.satellite.enabled", satelliteEnabled);
};

GPSTest.prototype.deleteGpsInfo = function() {
  deleteGpsInfomation = true;
  return new Promise(function(resolve) {
    var aParamAarry = ['rmgps'];
    var req = navigator.jrdExtension.execCmdLE(aParamAarry, 1);
    req.onsuccess = function () {
      debug_gps('Delete gps_info file successfull!');
      resolve('ok');
    };
    req.onerror = function () {
      debug_gps('Delete gps_info.file failed!');
      resolve('error');
    };
  });
};

GPSTest.prototype.startGps = function() {
  debug_gps('startGps');
  startTime = new Date();
  //
  debug_gps('startGps: startTime '+startTime);
  this.enableGeolocationSatellite(true);

  var gpsModeValue = 65535;
  if (!deleteGpsInfomation) {
    gpsModeValue = 1;
  }
  var options = {
    enableHighAccuracy: true,
    timeout: 120000,
    maximumAge: 0,
    gpsMode:gpsModeValue   //cold:65535   warm:1
  };
  if (geolocation){
    geolocation.getCurrentPosition(success, error, options);
  }else {
    debug_gps('startGps: geolocation is null');
  }

  deleteGpsInfomation = false;

};

GPSTest.prototype.openGps = function() {
  var self = this;
  gpsInfoResult = '';
  startTime = null;
  endTime = null;
  return new Promise(function(resolve) {
    var req = navigator.mozSettings.createLock().set({'geolocation.enabled': true});
    req.onsuccess = function() {
      debug_gps('openGps success');
      self.startGps();
      self.startTest();
      geolocationSettingEnabled = true;
      resolve('ok');
    };
    req.onerror = function() {
      debug_gps('openGps fail');
      resolve('error');
    };
  }.bind(this));
};

GPSTest.prototype.closeGps = function() {
  this.stopTest();

  return new Promise(function(resolve) {
    var req = navigator.mozSettings.createLock().set({'geolocation.enabled': false});
    req.onsuccess = function() {
      debug_gps('closeGps success');
      geolocationSettingEnabled = false;
      resolve('ok');
    };
    req.onerror = function() {
      debug_gps('closeGps success');
      resolve('error');
    };
  }.bind(this));
};

GPSTest.prototype.getSatelliteInfo = function() {
  return gpsInfoResult;
};

GPSTest.prototype.getLocationInfo = function() {
  if (startTime && endTime) {
    var ttff = endTime.getTime() - startTime.getTime();
    var result = ttff+'^'+latitudeValue+'^'+longitudeValue+'^';
    return result;
  }
  return 'fail';
};

GPSTest.prototype.searchCallback = function() {
  debug_gps('GPSTest.searchCallback');
  var result = '';
  var svString = null;
  if (navigator.jrdExtension) {
    svString = navigator.jrdExtension.fileReadLE('GPSif');
  } else {
    svString = '';
  }
  if (!svString || svString === '') {
    debug_gps('GPSTest.searchCallback svString is null');

    result = 'error';
    return;
  }
  var svInfo = JSON.parse(svString);

  debug_gps('GPSTest.searchCallback sv num:' + svInfo.num);

  if (svInfo.num === 0) {
    result = '0';
  }
  else if (svInfo.num > 0) {

    for (var i in svInfo.gps) {
      var prn = svInfo.gps[i].prn;
      var snr = svInfo.gps[i].snr;
      if (!isNaN(prn) && !isNaN(snr)) {
        result = result+prn+'^'+snr+'^';
      }
    }
  }
  gpsInfoResult = result;
  debug_gps('GPSTest.searchCallback result:' + result);
};

GPSTest.prototype.startTest = function() {
  debug_gps('GPSTest.startTest');

  this.searchCallback();
  this._timer = setInterval(this.searchCallback.bind(this), GPS_INTERVAL);
};

GPSTest.prototype.stopTest = function() {
  debug_gps('GPSTest.stopTest');
  if (this._timer) {
    clearInterval(this._timer);
    this._timer = null;
  }

  if (this._timeout) {
    clearTimeout(this._timeout);
    this._timeout = null;
  }
};

function success(position) {

  endTime = new Date();

  debug_gps('Search satellite success ! endTime:'+endTime);

  debug_gps('latitude '+position.coords.latitude);
  debug_gps('longitude '+position.coords.longitude);

  latitudeValue = position.coords.latitude;
  longitudeValue = position.coords.longitude;
  latitudeValue = latitudeValue.toFixed(6);
  longitudeValue = longitudeValue.toFixed(6);
}

function error() {
  debug_gps('Search satellite failed ! ');
}


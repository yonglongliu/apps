/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: version.js
// * Description: mmitest -> test item: version test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [version.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

var VersionTest = new TestItem();

//the following are inherit functions
VersionTest.onInit = function() {
  this.getDeviceInfo();
};

VersionTest.getDeviceInfo = function() {
  let formatTime = function (buildId) {
    let dateTimeStr = '';
    let dateStr = buildId.substring(0, 8);
    dateTimeStr = dateStr.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');

    let timeStr = buildId.substring(8);
    dateTimeStr =
      dateTimeStr + ' ' + timeStr.replace(/^(\d{2})(\d{2})(\d{2})$/, '$1:$2:$3');

    return dateTimeStr;
  };

  let _lock = navigator.mozSettings.createLock();
  const VERSION_KEY = 'deviceinfo.build_number';
  const BUILD_TIME_KEY = 'deviceinfo.platform_build_id';

  Promise.all([
    _lock.get(VERSION_KEY),
    _lock.get(BUILD_TIME_KEY)
  ]).then((results) => {
    document.getElementById('version').textContent =
    results[0][VERSION_KEY];
    document.getElementById('build-time').textContent =
      formatTime(results[1][BUILD_TIME_KEY]);
  }).catch((error) => {
      console.log('Failed to get device info error: ' + error.name);
  });
};

VersionTest.onDeinit = function() {
};

VersionTest.onHandleEvent = function(evt) {
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

window.addEventListener('load', VersionTest.init.bind(VersionTest));
window.addEventListener('beforeunload', VersionTest.uninit.bind(VersionTest));
window.addEventListener('keydown', VersionTest.handleKeydown.bind(VersionTest));

/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: dialer.js
// * Description: mmitest -> test item: dialer test.
// * Note:
// ************************************************************************

/* global TestItem */
'use strict';

function $(id) {
  return document.getElementById(id);
}

// ------------------------------------------------------------------------

var DialerTest = new TestItem();

DialerTest._call = null;

DialerTest.networkType = null;
DialerTest.mccmnc = null;

//the following are inherit functions
DialerTest.onInit = function() {
  $('dialButton').addEventListener('click', this);

  $('centertext').innerHTML =
      'OUTGOING CALL' + '<br />' + 'Press "Dial" to start';

  var _mobileConnections = window.navigator.mozMobileConnections;
  var _mobileConnection = _mobileConnections[0];
  var request = _mobileConnection.getPreferredNetworkType();
  request.onsuccess = function onSuccessHandler() {
    var networkType = request.result;
    if (networkType) {
      //lte/wcdma/gsm
      DialerTest.networkType = networkType;
      dump('MMITEST DialerTest.networkType='+networkType);
    }
  };

  var _iccManager = window.navigator.mozIccManager;
  var _iccId = _mobileConnection.iccId;
  var iccCard = _iccManager.getIccById(_iccId);
  if (iccCard) {
    let iccInfo = iccCard.iccInfo;
    DialerTest.mccmnc = '' + iccInfo.mcc + iccInfo.mnc;
    dump('MMITEST DialerTest.mccmnc=' + DialerTest.mccmnc);
  }
};

DialerTest.onDeinit = function() {

};

DialerTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  dump('MMITEST evt.key='+evt.key);
  if (evt.key === 'ArrowUp') {
    if (DialerTest.mccmnc == null) {
      alert('Simcard not exist')
      return false;
    }
    var tel = navigator.mozTelephony;
    if (tel) {
      if (DialerTest.networkType === 'lte') {
        var serviceNumber = DialerTest.getServiceNumberOfMCCMNC(DialerTest.mccmnc);
        if (serviceNumber) {
          dump('MMITEST serviceNumber=' + serviceNumber);
          tel.dial(serviceNumber).then(function () {

          });
        } else {
          tel.dialEmergency('112').then(function () {
            // do nothing
          });
        }
      } else {
        tel.dialEmergency('112').then(function () {
          // do nothing
        });
      }
    }
  }
  return false;
};

DialerTest.getServiceNumberOfMCCMNC = function (mccmnc) {
  var serviceNumber = null;
  if (mccmnc) {
    if (mccmnc === '46000' || mccmnc === '46002' || mccmnc === '46007') {
      serviceNumber = '10086';
    } else if (mccmnc === '46001' || mccmnc === '46010') {
      serviceNumber = '10010';
    } else if (mccmnc === '46003') {
      serviceNumber = '10000';
    }
  }
  return serviceNumber;
};

window.addEventListener('load', DialerTest.init.bind(DialerTest));
window.addEventListener('beforeunload', DialerTest.uninit.bind(DialerTest));
window.addEventListener('keydown', DialerTest.handleKeydown.bind(DialerTest));


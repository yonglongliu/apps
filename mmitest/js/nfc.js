/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: nfc.js
// * Description: mmitest -> test item: nfc test.
// * Note: check nfc
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [nfc.js] = ' + s + '\n');
  }
}

const VIBRATE_DURATION = 1500;

var NfcTest = new TestItem();
var nfcStatusItem = document.getElementById('centertext');
var startButton = document.getElementById('retestButton');


NfcTest.setItemString = function(content) {
  nfcStatusItem.innerHTML = content;
};

/**
 * Use the deviceStorage API to create a new file and save the CPLC data
 */
NfcTest.createFile = function(cplcResult) {
  // We should save the CPLC data into internal storage area.
  let sdcard = navigator.getDeviceStorages('sdcard')[0];
  sdcard.available().then((states) => {
    switch (states) {
      case 'available':
        let fileName = 'cplc.txt';
        Promise.all([
          sdcard.freeSpace(),
          sdcard.delete(fileName)]).then((freespace) => {
            // We need to keep enough free space to save the CPLC data.
            let text = new Blob([cplcResult], { type: 'text/plain' });
            if (freespace[0] && freespace[0] > text.size) {
              sdcard.addNamed(text, fileName).then((result) => {
                NfcTest.setItemString('NFC testing passed and CPLC data saved.');
                debug('Success to save the CPLC data into /data/usbmsc_mnt/cplc.txt');
              }, (error) => {
                NfcTest.setItemString('NFC testing passed but CPLC data don\'t saved.');
                debug('Unable to save the CPLC data error: ' + error.name);
              });
            } else {
              NfcTest.setItemString('NFC testing passed but CPLC data don\'t saved.');
              debug('There is not enough free space to save the CPLC data.');
            }
          }).catch((error) => {
          console.log(error);
        });
        break;
      case 'unavailable':
        debug('Your device\'s SD Card is not available.');
        break;
      default:
        debug('Your device\'s SD Card is shared and thus not available.');
        break;
    }
  }, (error) => {
    debug('Unable to get the space used by the SD Card: ' + error.name);
  });
};

/**
 * Start NFC test with command
 */
NfcTest.startNfcTest = function() {
  navigator.jrdExtension.execCmdLE(['nfc_test'], 1).then((result) => {
    // Read the NFC testing result
    NfcTest.interval = setInterval(NfcTest.readNfcInfo, 3000);
  }).catch((error) => {
    debug('NfcTest execute command error: ' + error.name);
    NfcTest.setItemString('Execute NFC testing command failed.');
  });

  setTimeout(() => {
    NfcTest.setItemString('Make the phone close to the NFC Reader device.');
  }, 3500);
};

/**
 *  Save the CPLC data from out nfc test result.
 */
NfcTest.saveCplcData = function(arr) {
  debug('NfcTest format cplc data.');
  let i = 0,
    len = arr.length,
    result = 'CPLC data:';
  for (i; i < len; i++) {
    let str = arr[i].replace(/^\s+/, '');
    let iccData =
      str.match(/^(ICC|IC|Operating)[a-zA-Z.:\D]*[\d+a-zA-Z()\s+]*/);
    if (iccData) {
      result = result + '\n' + iccData[0];
    }
  }
  NfcTest.createFile(result);
};

NfcTest.stopNfcTest = function() {
  if (navigator.jrdExtension) {
    return navigator.jrdExtension.execCmdLE(['nfc_stop'], 1);
  }
};

/**
 *  Read NFC testing result and display the result
 */
NfcTest.readNfcInfo = function() {
  var nfcString = navigator.jrdExtension.fileReadLE('nfcInfo');
  if (!nfcString || nfcString === '') {
    debug('NfcTest can\'t get file content.');
    return;
  }

  debug('nfc test result:' + nfcString);
  clearInterval(NfcTest.interval);

  // XXX: It's a workaround to display cureent NFC testing result
  if (nfcString.indexOf('Error') >= 0) {
    debug('NfcTest testing failed reason: device don\'t support NFC.');
    NfcTest.setItemString('Device don\'t support NFC');
  }

  if (nfcString.indexOf('Unknown') >= 0) {
    debug('NfcTest testing failed reason: Unknown');
    NfcTest.setItemString('NFC testing failed.');
  }

  if (nfcString.indexOf('FAILED') >= 0) {
    debug('NfcTest testing failed.');
    NfcTest.setItemString('NFC testing failed.');
  }

  if (nfcString.indexOf('PASSED') >= 0) {
    if ('vibrate' in navigator) {
      navigator.vibrate(VIBRATE_DURATION);
    }

    RemoteHelper.saveNfcCplc((response)=>{
      debug('saveNfcCplc return value' + response);
    });
    debug('NfcTest testing passed.');
    this.passButton.disabled = '';
    NfcTest.setItemString('NFC testing passed.');

    // Save CPLC data into "/data/nfc/cplc.txt"
    if (nfcString.indexOf('CPLC') >= 0) {
      let arr = nfcString.split('\n');
      NfcTest.setItemString('Saving CPLC data ....');
      NfcTest.saveCplcData(arr);
    } else {
      debug('There is no any CPLC data in the /data/nfc/test_result file.');
      NfcTest.setItemString('NFC testing passed but get CPLC data failed.')
    }
  }
};

NfcTest.onInit = function() {
  if (!navigator.jrdExtension) {
    nfcStatusItem.innerHTML = 'KaiOSExtension NOT support';
    return;
  }

  // Disable the PASS button first
  this.passButton.disabled = 'disabled';
  this.failButton.disabled = '';

  let stop = this.stopNfcTest();
  stop.onsuccess = function () {
    // Create and elevate data file permissions
    navigator.jrdExtension.execCmdLE(['data_nfc_upper'], 1);
  };

  stop.onerror = function () {
    // Create and elevate data file permissions
    navigator.jrdExtension.execCmdLE(['data_nfc_upper'], 1);
  };
};

NfcTest.onDeinit = function() {
  this.stopNfcTest();
  // Clear interval when exiting this page
  if (NfcTest.interval) {
    clearInterval(NfcTest.interval);
  }
};

NfcTest.onHandleEvent = function(evt) {
  switch (evt.key) {
    case 'ArrowUp':
      if (!startButton.hidden) {
        startButton.hidden = true;
        NfcTest.setItemString('Waiting for NFC test initing ...');
        setTimeout(this.startNfcTest.bind(this), 500);
      }
      evt.preventDefault();
      break;
  }
  return false;
};

window.addEventListener('load', NfcTest.init.bind(NfcTest));
window.addEventListener('beforeunload', NfcTest.uninit.bind(NfcTest));
window.addEventListener('keydown', NfcTest.handleKeydown.bind(NfcTest));

/* global Item, RemoteHelper */

/**
 *  Show calibrate information of phone
 */
'use strict';

const CALIBRATEINFO_GSMCMD = 'AT+SGMR=0,0,3,0';
const CALIBRATEINFO_LTECMD = 'AT+SGMR=0,0,3,3';
var CalibrateInfo = new Item();

CalibrateInfo.update = function() {
  this.gsmInfo = document.getElementById('calibrate-gsm-info');
  this.lteInfo = document.getElementById('calibrate-lte-info');
  this.result = document.getElementById('calibrate-info-result');

  this.getCalibrateInfo();
  this.result.focus();
  this.result.addEventListener('keydown', this.scrollPage.bind(this));
};

CalibrateInfo.getCalibrateInfo = function() {
  RemoteHelper.sendATCommand(CALIBRATEINFO_GSMCMD, (info) => {
    this.gsmInfo.innerHTML = '<br/>' + '======== RF GSM ========' + '<br/>' +
      this.formatInfo(info);
  });

  RemoteHelper.sendATCommand(CALIBRATEINFO_LTECMD, (info) => {
    this.lteInfo.innerHTML = '======== RF LTE ========' + '<br/>' +
      this.formatInfo(info) + '<br/>' + '<br/>';
  });
};

CalibrateInfo.formatInfo = function(response) {
  response = response.replace(/OK/g,'');
  var array = response.split('\n');
  var s = '';
  array.forEach(function(str) {
    s += str + '<br/>';
  });

  return s;
};

CalibrateInfo.scrollPage = function(evt) {
  var result = document.getElementById('calibrate-info-result');
  var handled = false;
  if (evt.key === 'ArrowUp') {
    result.scrollTop -= 60;
    handled = true;
  } else if (evt.key === 'ArrowDown') {
    result.scrollTop += 60;
    handled = true;
  }

  if (handled && App.currentPanel === '#calibrate-info') {
    evt.preventDefault();
    evt.stopPropagation();
  }
};

window.addEventListener('keydown', CalibrateInfo.handleKeydown.bind(CalibrateInfo));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#calibrate-info') {
    CalibrateInfo.update();
  }
});

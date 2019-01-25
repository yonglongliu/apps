/* global Item, NavigationMap, RemoteHelper */

'use strict';
var ParaSet = new Item();

ParaSet.update = function(id) {
  this.content = document.getElementById('para-set-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  NavigationMap.initPanelNavigation('.focusable', 0, id, false, document);
};

ParaSet.showView = function(name) {
  App.currentPanel = '#para-set-' + name;
};

ParaSet.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('data-name');
    switch(name) {
      case 'debug':
        this.showView(name);
        this.initDebugParam();
        break;
      case 'rf':
        this.showView(name);
        this.initSendPower();
        break;
      case 'sleep-mode':
        this.showView(name);
        this.initSleepMode();
        break;
      case 'rollback-power':
        this.showView(name);
        this.initRollbackPower();
        break;
    }
    return true;
  }

  if (event.key === 'Backspace') {
    if (App.currentPanel !== '#para-set' && App.currentPanel.indexOf('#para-set') !== -1) {
      App.currentPanel = '#para-set';
      return true;
    }
  }

  return false;
};

ParaSet._bandMap = function() {
  var map = {};
  var GSM900 = 1,
      DCS1800 = 2,
      PCS1900 = 3,
      GSM850 = 4;
  var put = function(key, value) {
    map[key] = value;
  };

  put(0, GSM900);
  put(1, DCS1800);
  put(2, PCS1900);
  put(3, GSM850);
  put(4, GSM900 | DCS1800);
  put(5, GSM850 | GSM900);
  put(6, GSM850 | DCS1800);
  put(7, GSM850 | PCS1900);
  put(8, GSM900 | PCS1900);
  put(9, GSM850 | GSM900 | DCS1800);
  put(10, GSM850 | GSM900 | PCS1900);
  put(11, DCS1800 | PCS1900);
  put(12, GSM850 | DCS1800 | PCS1900);
  put(13, GSM900 | DCS1800 | PCS1900);
  put(14, GSM850 | GSM900 | DCS1800 | PCS1900);

  return map;
};

ParaSet.initDebugParam = function() {
  // Band select
  var selectLi = document.getElementById('band-select');
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();

      select.focus();
    }
  });

  select.onblur = () => {
    var selectedValues = [];
    for(var i = 0; i < select.length; i++) {
      if (select.options[i].selected) {
        selectedValues.push(select.options[i].value);
      }
    }

    this.setBandSelect(selectedValues);
  };

  // Manual Assert
  var manualAssetLi = document.getElementById('manual-asset');
  manualAssetLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();

      this.setManualAsset();
    }
  });

  window.addEventListener('keydown', function(event) {
    var name = event.target.getAttribute('name');
    if (event.key === 'Enter' && name === 'modem-reset') {
      ParaSet.toggleModemReset();
    }
  });

  // CP2 Assert
  var cp2AssetLi = document.getElementById('cp2-assert');
  cp2AssetLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();

      this.setCp2Assert();
    }
  });

  window.addEventListener('keydown', function(event) {
    var name = event.target.getAttribute('name');
    if (event.key === 'Enter' && name === 'cp2-reset') {
      ParaSet.toggleCp2Reset();
    }
  });

  this.initBandSelect();
  this.initModemReset();
  this.initCp2Reset();
};

ParaSet.initCp2Reset = function() {
  var Cp2ResetCheckBox = document.getElementById('cp2-reset');
  RemoteHelper.getproperty('persist.sys.sprd.wcnreset', (value) => {
    Cp2ResetCheckBox.checked = !!parseInt(value);
  }, () => {
  });
};

ParaSet.toggleCp2Reset = function () {
  var checked = document.getElementById('cp2-reset').checked;
  if (!checked) {
    RemoteHelper.setproperty('persist.sys.sprd.wcnreset', 0, () => {});
  } else {
    RemoteHelper.setproperty('persist.sys.sprd.wcnreset', 1, () => {});
  }
};

ParaSet.setCp2Assert = function() {
  var cp2AssertCMD = 'wcn at+spatassert=1';
  RemoteHelper.getproperty('persist.sys.sprd.wcnreset', (value) => {
    if (parseInt(value) === 0) {
      Toaster.showToast({
        message: 'please select cp2reset',
        latency: 2000
      });
    } else {
      // var _wcndCommander = new Commander(IP_ADDRESS, WCND_PORT);
      // _wcndCommander.connect().onopen(function() {
      //   _wcndCommander.send(cp2AssertCMD);
      //   Toaster.showToast({
      //     message: 'Success',
      //     latency: 2000
      //   });
      // });
      dump('wcnd commander : ' + cp2AssertCMD);
      RemoteHelper.sendWCNDCommand(cp2AssertCMD, (value)=> {
        dump('wcnd - data = ' + value);
        Toaster.showToast({
          message: 'Success',
          latency: 2000
        });
      });
    }
  }, () => {});
};

ParaSet.initModemReset = function() {
  var ModemResetCheckBox = document.getElementById('modem-reset');
  RemoteHelper.getproperty('persist.sys.sprd.modemreset', (value) => {
    ModemResetCheckBox.checked = !!parseInt(value);
  }, () => {
  });
};

ParaSet.toggleModemReset = function() {
  var checked = document.getElementById('modem-reset').checked;
  RemoteHelper.setproperty('persist.sys.sprd.modemreset', checked ? 1 : 0);
};

ParaSet.setManualAsset = function() {
  var manualAssetCMD = 'AT+SPATASSERT=1';
  RemoteHelper.getproperty('persist.sys.sprd.modemreset', (value) => {
    if (parseInt(value) === 0) {
       Toaster.showToast({
            message: 'modem reset must be true',
            latency: 2000
          });  
    }
      RemoteHelper.sendATCommand(manualAssetCMD, (response) => {
          Toaster.showToast({
            message: 'Success',
            latency: 2000
          });
      }, () => {});
  }, () => {});
};

ParaSet.parseLTEBand = function(supportBand, checkedBand) {
  var supportResult = supportBand.toString().split(',');
  var mSupportLTEBandTDD = ((parseInt(supportResult[0]) << 16) & 0xFFFF0000) + parseInt(supportResult[1]);
  var mSupportLTEBandFDD = ((parseInt(supportResult[2]) << 16) & 0xFFFF0000) + parseInt(supportResult[3]);

  var checkedResult = checkedBand.split(',');
  var mCheckedLTEBandTDD = ((parseInt(checkedResult[0]) << 16) & 0xFFFF0000) + parseInt(checkedResult[1]);
  var mCheckedLTEBandFDD = ((parseInt(checkedResult[2]) << 16) & 0xFFFF0000) + parseInt(checkedResult[3]);

  var selectItems = document.getElementById('band-select-items');
  selectItems.options.length = 0;
  for (var i = 0; i < 32; i++) {
    var supportIndexTDD = (mSupportLTEBandTDD >> i) & 0x1;
    var checkedIndexTDD = (mCheckedLTEBandTDD >> i) & 0x1;
    if (supportIndexTDD === 1) {
      var option = document.createElement('option');
      option.setAttribute('value', i + 33);
      option.appendChild(document.createTextNode('TDD_BAND' + (i + 33)));
      if (checkedIndexTDD > 0) {
        option.selected = true;
      }
      selectItems.appendChild(option);
    }
  }
  for (var i = 0; i < 32; i++) {
    var supportIndexFDD = (mSupportLTEBandFDD >> i) & 0x1;
    var checkedIndexFDD = (mCheckedLTEBandFDD >> i) & 0x1;
    if (supportIndexFDD === 1) {
      var option = document.createElement('option');
      option.setAttribute('value', i + 1);
      option.appendChild(document.createTextNode('FDD_BAND' + (i + 1)));
      if (checkedIndexFDD > 0) {
        option.selected = true;
      }
      selectItems.appendChild(option);
    }
  }
};

ParaSet.getLTEBand = function(band) {
  var getBandSelectedCMD = 'AT+SPLBAND=0';
  RemoteHelper.sendATCommand(getBandSelectedCMD, (response) => {
    //+SPLBAND: 0,128,0,20
    function getCheckBand(resp) {
      return resp.toString().split('\n')[0].split(':')[1];
    }
    var checkedBand = getCheckBand(response);
    var supportBand = band;

    if (supportBand === "") {
      supportBand = checkedBand;
      var req = navigator.mozSettings.createLock().set({'lte.support.band' : supportBand});
      req.onsuccess = function () {
        console.log('set lte.support.band success!');
      };
      req.onerror = function () {
        console.error('set lte.support.band error');
      };
    }
    ParaSet.parseLTEBand(supportBand, checkedBand);
  }, () => {});
};

ParaSet.initBandSelect = function() {
  var req = navigator.mozSettings.createLock().get('lte.support.band');
  req.onsuccess = function getSuccess() {
    var supportBand = req.result['lte.support.band'];
    console.log('get lte.support.band =' + supportBand);
    if (supportBand === undefined || supportBand === "") {
      ParaSet.getLTEBand("");
    } else {
      ParaSet.getLTEBand(supportBand);
    }
  };

  req.onerror = function() {
    console.error('get lte.support.band failed');
    ParaSet.getLTEBand("");
  }
};

ParaSet.setBandSelect = function(values) {
  if (!values) {
    return;
  }
  // Get band value
  var selectBandTDD = 0;
  var selectBandFDD = 0;
  for (var i = 0; i < values.length; i++) {
    var value = parseInt(values[i]);
    //TDDBand start from band_33
    if (value > 33) {
      selectBandTDD += (0x01 << (value - 33));
    } else {
      selectBandFDD += (0x01 << (value - 1));
    }
  }

  var tddatCmd_h = (selectBandTDD>>16) & 0xFFFF;
  var tddatCmd_l = selectBandTDD & 0xFFFF;
  var fddatCmd_h = (selectBandFDD>>16) & 0xFFFF;
  var fddatCmd_l = selectBandFDD & 0xFFFF;

  var setBandSelectedCMD = 'AT+SPLBAND=1,' + tddatCmd_h + ',' + tddatCmd_l + ',' + fddatCmd_h + ',' + fddatCmd_l;
  RemoteHelper.sendATCommand(setBandSelectedCMD, (response) => {
    console.log('setBandSelectedCMD success');
  }, () => {});
};

ParaSet.initSendPower = function() {
  var sendPowerCheckbox = document.getElementById('send-power');
  RemoteHelper.getproperty('key_sendpower', (value) => {
    sendPowerCheckbox.checked = !!parseInt(value);
  }, () => {
  });

  document.getElementById('para-set-rf').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' &&
        event.target.getAttribute('name') === 'send-power') {
      this.toggleSendPower();
    }
  });
};

ParaSet.toggleSendPower = function() {
  var checked = !document.getElementById('send-power').checked;
  RemoteHelper.setproperty('key_sendpower', checked ? 1 : 0);
};

ParaSet.initSleepMode = function() {
  var sleepModeCheckbox = document.getElementById('sleep-mode');
  RemoteHelper.getproperty('key_sleepmode', (value) => {
    sleepModeCheckbox.checked = !!parseInt(value);
  }, () => {
  });

  document.getElementById('para-set-sleep-mode').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' &&
        event.target.getAttribute('name') === 'sleep-mode') {
      this.toggleSleepMode();
    }
  });
};

ParaSet.toggleSleepMode = function() {
  var checked = !document.getElementById('sleep-mode').checked;
  RemoteHelper.setproperty('key_sleepmode', checked ? 1 : 0);
};

ParaSet.initRollbackPower = function() {
  var section = document.getElementById('para-set-rollback-power');
  section.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      var target = evt.target;
      evt.stopPropagation();
      evt.preventDefault();

      if (target.classList.contains('select-li')) {
        var select = target.querySelector('select');
        select.focus();
      }

      if (target.getAttribute('name') === 'rollback-power-ok') {
        this.setRollbackPower();
      }
    }
  });
};

ParaSet.setRollbackPower = function() {
  var powerLowBandSL = document.getElementById('low-band-select').querySelector('select');
  var powerHighBandSL = document.getElementById('high-band-select').querySelector('select');
  var rollbackSwitchSL = document.getElementById('rollback-switch').querySelector('select');

  var rollbackCMD = 'AT+XVOLLEV=' +
      rollbackSwitchSL.options[rollbackSwitchSL.selectedIndex].value +
      ',' + powerLowBandSL.options[powerLowBandSL.selectedIndex].value +
      ',' + powerHighBandSL.options[powerHighBandSL.selectedIndex].value;

  RemoteHelper.sendATCommand(rollbackCMD, (response) => {
    if (response.indexOf('OK') !== -1) {
      App.currentPanel = '#para-set';
    }
  }, () => {})
};

window.addEventListener('keydown', ParaSet.handleKeydown.bind(ParaSet));
window.addEventListener('panelready', function(e) {
  var hash = e.detail.current;
  if (hash.indexOf('#para-set') !== -1) {
    var id = hash.substring(1);
    ParaSet.update(id);
  }
});

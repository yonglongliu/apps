/* global Item, NavigationMap, MozActivity, RemoteHelper */

/**
 *  APP settings
 */
'use strict';
var AppSettings = new Item();

AppSettings.update = function() {
  this.content = document.getElementById('app-settings-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('app-settings-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'app-settings-menu', false, this.content);

  this.initAutoAnswer();
  this.initArmLog();
  this.initDspLog();
};

AppSettings.showView = function(name) {
  for (var i = 0, len = this.views.length; i < len; i++) {
    var view = this.views[i];
    if (name === view.id) {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }
  }

  NavigationMap.initPanelNavigation('.focusable', 0, name, false, this.content);
};

AppSettings.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'log-settings':
        App.currentPanel = '#log-settings';
        break;
      case 'auto-answer':
        this.toggleAutoAnswer();
        break;
      case 'arm-log':
        this.toggleArmLog();
        break;
      case 'dsp-log':
        this.toggleDspLog();
        break;
      default:
        break;
    }
    return true;
  }

  return false;
};

AppSettings.initAutoAnswer = function() {
  var autoAnswerCMD = 'AT+SPAUTO?';
  var autoAnswerCheck = document.getElementById('auto-answer');
  RemoteHelper.sendATCommand(autoAnswerCMD, (response) => {
    if (response.indexOf('0') !== -1) {
      autoAnswerCheck.checked = false;
    } else if (response.indexOf('1') !== -1) {
      autoAnswerCheck.checked = true;
    }
  }, () => {
  });
};

AppSettings.initArmLog = function() {
  var armLogCMD = 'AT+ARMLOG?';
  var armlogCheck = document.getElementById('arm-log');
  RemoteHelper.sendATCommand(armLogCMD, (response) => {
    if (response.indexOf('0') !== -1) {
      armlogCheck.checked = false;
    } else if (response.indexOf('1') !== -1) {
      armlogCheck.checked = true;
    }
  }, () => {
  });
};

AppSettings.initDspLog = function() {
  var cmd = 'AT+SPDSPOP?';
  var checkbox = document.getElementById('dsp-log');
  RemoteHelper.sendATCommand(cmd, (response) => {
    if (response.indexOf('0') !== -1) {
      checkbox.checked = false;
    } else if (response.indexOf('1') !== -1 || response.indexOf('2') !== -1) {
      checkbox.checked = true;
    }
  }, () => {
  });
};

AppSettings.toggleAutoAnswer = function() {
  var autoAnswerOpenCMD = 'AT+SPAUTO=1';
  var autoAnswercloseCMD = 'AT+SPAUTO=0';
  var checked = document.getElementById('auto-answer').checked;
  if (!checked) {
    RemoteHelper.sendATCommand(autoAnswercloseCMD);
  } else {
    RemoteHelper.sendATCommand(autoAnswerOpenCMD);
  }
};

AppSettings.toggleArmLog = function() {
  var armLogOpenCMD = 'AT+ARMLOG=1';
  var armLogcloseCMD = 'AT+ARMLOG=0';
  var checked = document.getElementById('arm-log').checked;
  if (!checked) {
    RemoteHelper.sendATCommand(armLogcloseCMD);
  } else {
    RemoteHelper.sendATCommand(armLogOpenCMD);
  }
};

AppSettings.toggleDspLog = function() {
  var dspLogOpenCMD = 'AT+SPDSPOP=2';
  var dspLogcloseCMD = 'AT+SPDSPOP=0';
  var checked = document.getElementById('dsp-log').checked;
  if (!checked) {
    RemoteHelper.sendATCommand(dspLogcloseCMD);
  } else {
    RemoteHelper.sendATCommand(dspLogOpenCMD);
  }
};

AppSettings.initSendPower = function() {
  RemoteHelper.getproperty('key_sendpower', () => {
    // This keyword of property is not available now
  }, () => {
  });
};

AppSettings.initSleepMode = function() {
  RemoteHelper.getproperty('key_sleepmode', () => {
    // This keyword of property is not available now
  }, () => {
  });
};

window.addEventListener('keydown', AppSettings.handleKeydown.bind(AppSettings));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#app-settings') {
    AppSettings.update();
  }
});


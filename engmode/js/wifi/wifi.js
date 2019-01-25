/* global Item, NavigationMap */

/**
 *  WiFi test
 */
'use strict';
const WifiInitCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 insmod', type : 'WIFI_DRIVER_INSMOD' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 start', type : 'SET_EUT_START' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 lna_status', type : 'GET_POWER_SAVE_STATUS' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_eng_mode 2', type : 'GET_WIFI_ADAPTIVE_STATUS' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_eng_mode 4', type : 'GET_WIFI_SCAN_OFF_STATUS' }
];

const WifiStopCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 stop', type : 'SET_EUT_STOP' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 rmmod', type : 'WIFI_DRIVER_RMMOD' }
];

const WifiSetPowerSaveModeCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 ', type : ''}
];

const WIFI_ADAPTIVE_ON_CMD = 'wcnd_cli eng iwnpi wlan0 set_eng_mode 1 1';
const WIFI_ADAPTIVE_ON_TYPE = 'ENABLED_WIFI_ADAPTIVE';
const WIFI_ADAPTIVE_OFF_CMD = 'wcnd_cli eng iwnpi wlan0 set_eng_mode 1 0';
const WIFI_ADAPTIVE_OFF_TYPE = 'DISABLED_WIFI_ADAPTIVE';

const WIFI_SCAN_ON_CMD = 'wcnd_cli eng iwnpi wlan0 set_eng_mode 3 1';
const WIFI_SCAN_ON_TYPE = 'ENABLED_WIFI_SCAN';
const WIFI_SCAN_OFF_CMD = 'wcnd_cli eng iwnpi wlan0 set_eng_mode 3 0';
const WIFI_SCAN_OFF_TYPE = 'DISABLED_WIFI_SCAN';

var WiFi = new Item();

WiFi.update = function() {

  this.content = document.getElementById('wifi-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('wifi-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'wifi-menu', false, this.content);
};

WiFi.showView = function(name) {
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

WiFi.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'wf-tx':
        App.currentPanel = '#wifi-tx';
        break;
      case 'wf-rx':
        App.currentPanel = '#wifi-rx';
        break;
      case 'wf-reg-wr':
        App.currentPanel = '#wifi-reg-wr';
        break;
      case 'wf-disable-power-save-mode': {
        var powerSaveMode = document.getElementById('wf-disable-power-save-mode');
        var queue = cloneCommandArray(WifiSetPowerSaveModeCmdQueue);
        if (powerSaveMode.checked) {
          queue[0].cmd = queue[0].cmd + 'lna_on';
          queue[0].type = 'ENABLED_POWER_SAVE';
        } else {
          queue[0].cmd = queue[0].cmd + 'lna_off';
          queue[0].type = 'DISABLED_POWER_SAVE';
        }
        RemoteHelper.sendCommand(queue, WiFi.onCheckboxCmd, WiFi.onCmdError);
        break;
      }
      case 'wf-adaptive':
        var wifiAdaptive = document.getElementById('wf-adaptive-input');
        var queue = [];
        if (wifiAdaptive.checked) {
          queue = [{cmd:WIFI_ADAPTIVE_ON_CMD, type:WIFI_ADAPTIVE_ON_TYPE}];
        } else {
          queue = [{cmd:WIFI_ADAPTIVE_OFF_CMD, type:WIFI_ADAPTIVE_OFF_TYPE}];
        }
        RemoteHelper.sendCommand(queue, WiFi.onCheckboxCmd, WiFi.onCmdError);
        break;
      case 'wf-scan-off':
        var wifiScanOff = document.getElementById('wf-scan-off-input');
        var queue = [];
        if (wifiScanOff.checked) {
          queue = [{cmd:WIFI_SCAN_ON_CMD, type:WIFI_SCAN_ON_TYPE}];
        } else {
          queue = [{cmd:WIFI_SCAN_OFF_CMD, type:WIFI_SCAN_OFF_TYPE}];
        }
        RemoteHelper.sendCommand(queue, WiFi.onCheckboxCmd, WiFi.onCmdError);
        break;
      case 'start-wifi-service': {
        var queue = cloneCommandArray(WifiInitCmdQueue);
        RemoteHelper.sendCommand(queue, WiFi.onInitCmd, WiFi.onInitCmdError);
        break;
      }
      case 'stop-wifi-service': {
        var queue = cloneCommandArray(WifiStopCmdQueue);
        RemoteHelper.sendCommand(queue, WiFi.onStopCmd, WiFi.onStopCmdError);
        break;
      }
      default:
        break;
    }
    return true;
  }

  return false;
};

WiFi.onInitCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'WIFI_DRIVER_INSMOD':
    case 'SET_EUT_START': {
      if (response.startsWith('OK')) {
        cmdQueue.shift();
        RemoteHelper.sendCommand(cmdQueue, WiFi.onInitCmd, WiFi.onCWCmdError);
      } else {
        console.error(cmdQueue.cmd + ' failed');
        alert('Init Wifi Error');
      }
      break;
    }
    case 'GET_POWER_SAVE_STATUS': {
      if (response.startsWith('OK')) {
        var array = response.split(':');
        var value = array[1].trim();
        var mode = document.getElementById('wf-disable-power-save-mode');
        value === '1' ? mode.checked = true : mode.checked = false;

        alert('Start Wifi Ok');
      } else {
        alert('Start Wifi Error');
      }

      cmdQueue.shift();
      RemoteHelper.sendCommand(cmdQueue, WiFi.onInitCmd, WiFi.onCWCmdError);
      break;
    }
    case 'GET_WIFI_ADAPTIVE_STATUS': {
      if (response.startsWith('OK')) {
        var array = response.split(':');
        var value = array[1].trim();
        var mode = document.getElementById('wf-adaptive-input');
        mode.checked = (value === '1');
      }

      cmdQueue.shift();
      RemoteHelper.sendCommand(cmdQueue, WiFi.onInitCmd, WiFi.onCWCmdError);
      break;
    }
    case 'GET_WIFI_SCAN_OFF_STATUS': {
      if (response.startsWith('OK')) {
        var array = response.split(':');
        var value = array[1].trim();
        var mode = document.getElementById('wf-scan-off-input');
        mode.checked = (value === '1');
      }
      break;
    }
    default:
      break;
  }
}

WiFi.onInitCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  alert('Start Wifi Error');
}

WiFi.onStopCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'SET_EUT_STOP': {
      if (response.startsWith('OK')) {
        cmdQueue.shift();
        RemoteHelper.sendCommand(cmdQueue, WiFi.onStopCmd, WiFi.onStopCmdError);
      } else {
        console.error(cmdQueue[0].cmd + ' failed');
        alert('Stop Wifi Service Error');
      }
      break;
    }
    case 'WIFI_DRIVER_RMMOD': {
      if (response.startsWith('OK')) {
        alert('Stop Wifi Service Ok');
      } else {
        alert('Stop Wifi Service Error');
      }
      break;
    }
    default:
      break;
  }
}

WiFi.onStopCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  alert('Stop Wifi Service Error');
}

WiFi.onCheckboxCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;
  var mode;

  switch (type) {
    case 'ENABLED_POWER_SAVE':
    case 'DISABLED_POWER_SAVE':
      mode = document.getElementById('wf-disable-power-save-mode');
      break;
    case 'ENABLED_WIFI_ADAPTIVE':
    case 'DISABLED_WIFI_ADAPTIVE':
      mode = document.getElementById('wf-adaptive-input');
      break;
    case 'ENABLED_WIFI_SCAN':
    case 'DISABLED_WIFI_SCAN':
      mode = document.getElementById('wf-scan-off-input');
      break;
  }

  switch (type) {
    case 'ENABLED_POWER_SAVE':
    case 'ENABLED_WIFI_ADAPTIVE':
    case 'ENABLED_WIFI_SCAN':
      if (response.startsWith('OK')) {
        mode.checked = true;
      } else {
        mode.checked = false;
      }
      break;
    case 'DISABLED_POWER_SAVE':
    case 'DISABLED_WIFI_ADAPTIVE':
    case 'DISABLED_WIFI_SCAN':
      if (response.startsWith('OK')) {
        mode.checked = false;
      } else {
        mode.checked = true;
      }
      break;
  }
}

WiFi.onCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
}

window.addEventListener('keydown', WiFi.handleKeydown.bind(WiFi));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#wifi') {
    WiFi.update();
  }
});
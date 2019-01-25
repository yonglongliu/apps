/* global Item, NavigationMap*/

/**
 *  WiFi TX
 */
'use strict';
const WifiTxCWCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_channel ', type : 'SET_EUT_SET_CHANNEL' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 tx_start', type : 'SET_EUT_TX_START' }
];

const WifiTxGoCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_channel ', type : 'SET_EUT_SET_CHANNEL' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_pkt_length ', type : 'SET_EUT_SET_LENGTH' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_tx_count ', type : 'SET_EUT_SET_COUNT' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_tx_power ', type : 'SET_EUT_SET_POWER' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_rate ', type : 'SET_EUT_SET_RATE' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_preamble ', type : 'SET_EUT_SET_PREAMBLE' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_bandwidth ', type : 'SET_EUT_BANDWIDTH' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_guard_interval ', type : 'SET_EUT_GUARDINTERVAL' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 ', type : "" }
];

const WifiTxStopCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 tx_stop', type : 'SET_EUT_TX_STOP' }
];

var WifiTx = new Item();

WifiTx.update = function () {

  this.content = document.getElementById('wifi-tx-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('wifi-tx-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'wifi-tx-menu', false, this.content);

  this.initSelect(document.getElementById('wf-tx-channel'));
  this.initSelect(document.getElementById('wf-tx-rate'));
  this.initSelect(document.getElementById('wf-tx-mode'));
  this.initSelect(document.getElementById('wf-tx-preamble'));
  this.initSelect(document.getElementById('wf-tx-band-width'));
  this.initSelect(document.getElementById('wf-tx-guard-interval'));
};

WifiTx.showView = function (name) {
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

WifiTx.onHandleKeydown = function (event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'wf-tx-pkt-length':
      case 'wf-tx-pkt-cnt':
      case 'wf-tx-power-level':
        document.getElementById(name+'-input').focus();
        break;
      case 'wf-tx-cw': {
        var queue = cloneCommandArray(WifiTxCWCmdQueue);
        var channel = document.getElementById('wf-tx-channel').querySelector('select');
        queue[0].cmd = queue[0].cmd + channel.options[channel.selectedIndex].value;

        RemoteHelper.sendCommand(queue, WifiTx.onCWCmd, WifiTx.onCWCmdError);
        break;
      }
      case 'wf-tx-go': {
        var queue = cloneCommandArray(WifiTxGoCmdQueue);
        var channel = document.getElementById('wf-tx-channel').querySelector('select');
        queue[0].cmd = queue[0].cmd + channel.options[channel.selectedIndex].value;
        var pktLength = document.getElementById('wf-tx-pkt-length').querySelector('input');
        queue[1].cmd = queue[1].cmd + pktLength.value;
        var pktCnt = document.getElementById('wf-tx-pkt-cnt').querySelector('input');
        queue[2].cmd = queue[2].cmd + pktCnt.value;
        var powerLevel = document.getElementById('wf-tx-power-level').querySelector('input');
        queue[3].cmd = queue[3].cmd + powerLevel.value;
        var rate = document.getElementById('wf-tx-rate').querySelector('select');
        queue[4].cmd = queue[4].cmd + rate.options[rate.selectedIndex].value;
        var preamble = document.getElementById('wf-tx-preamble').querySelector('select');
        queue[5].cmd = queue[5].cmd + preamble.options[preamble.selectedIndex].value;
        var bandWidth = document.getElementById('wf-tx-band-width').querySelector('select');
        queue[6].cmd = queue[6].cmd + bandWidth.options[bandWidth.selectedIndex].value;
        var guardInterval = document.getElementById('wf-tx-guard-interval').querySelector('select');
        queue[7].cmd = queue[7].cmd + guardInterval.options[guardInterval.selectedIndex].value;
        var mode = document.getElementById('wf-tx-mode').querySelector('select');
        if (mode.options[mode.selectedIndex].value === '0') {
          queue[8].cmd = queue[8].cmd + 'tx_start';
          queue[8].type = 'SET_EUT_TX_START';
        } else {
          queue[8].cmd = queue[8].cmd + 'sin_wave';
          queue[8].type = 'SET_EUT_CW_START';
        }

        RemoteHelper.sendCommand(queue, WifiTx.onGoCmd, WifiTx.onGoCmdError);
        break;
      }
      case 'wf-tx-stop':
        var queue = cloneCommandArray(WifiTxStopCmdQueue);
        RemoteHelper.sendCommand(queue, WifiTx.onStopCmd, WifiTx.onStopCmdError);
        break;
      default:
        break;
    }
    return true;
  }
  return false;
};

WifiTx.initSelect = function(selectLi) {
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      select.focus();
    }
  });
};

WifiTx.onCWCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'SET_EUT_SET_CHANNEL':
      if (response.startsWith('OK')) {
        cmdQueue.shift();
        RemoteHelper.sendCommand(cmdQueue, WifiTx.onCWCmd, WifiTx.onCWCmdError);
      }
      break;
    case 'SET_EUT_TX_START':
      if (response.startsWith('OK')) {
        alert('Wifi EUT CW Ok');
      } else {
        alert('Wifi EUT CW Error');
      }
      break;
    default: break;
  }
};

WifiTx.onCWCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  alert('Wifi EUT CW Error');
};

WifiTx.onGoCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'SET_EUT_SET_CHANNEL':
    case 'SET_EUT_SET_LENGTH':
    case 'SET_EUT_SET_COUNT':
    case 'SET_EUT_SET_POWER':
    case 'SET_EUT_SET_RATE':
    case 'SET_EUT_SET_PREAMBLE':
    case 'SET_EUT_BANDWIDTH':
    case 'SET_EUT_GUARDINTERVAL':
      if (response.startsWith('OK')) {
        cmdQueue.shift();
        RemoteHelper.sendCommand(cmdQueue, WifiTx.onGoCmd, WifiTx.onGoCmdError);
      } else {
        console.error(cmdQueue[0].cmd + ' failed');
        alert('Wifi EUT TX GO Error');
      }
      break;
    case 'SET_EUT_TX_START':
    case 'SET_EUT_CW_START':
      if (response.startsWith('OK')) {
        alert('Wifi EUT TX GO Ok');
      } else {
        alert('Wifi EUT TX GO Error');
      }
      break;
    default: break;
  }
}

WifiTx.onGoCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  alert('Wifi EUT TX GO Error');
}

WifiTx.onStopCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  if (type === 'SET_EUT_TX_STOP') {
    if (response.startsWith('OK')) {
      alert('Wifi EUT TX Stop Ok');
    } else {
      console.error(cmdQueue[0].cmd + ' failed');
      alert('Wifi EUT TX Stop Error');
    }
  }
}

WifiTx.onStopCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  alert('Wifi EUT TX Stop Error');
}

window.addEventListener('keydown', WifiTx.handleKeydown.bind(WifiTx));
window.addEventListener('panelready', function (e) {
  if (e.detail.current === '#wifi-tx') {
    WifiTx.update();
  }
});
/* global Item, NavigationMap */

/**
 *  WiFi RX
 */
'use strict';
const WifiRxGoCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_channel ', type : 'SET_EUT_SET_CHANNEL' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 rx_start', type : 'SET_EUT_RX_START' }
];

const WifiRxStopCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 get_rx_ok', type : 'SET_EUT_GET_RXOK' },
  { cmd : 'wcnd_cli eng iwnpi wlan0 rx_stop', type : 'SET_EUT_RX_STOP' }
];

var WifiRx = new Item();

WifiRx.update = function () {

  this.content = document.getElementById('wifi-rx-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('wifi-rx-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'wifi-rx-menu', false, this.content);

  this.initSelect(document.getElementById('wf-rx-channel'));
  var rxOk = document.getElementById('wf-rx-ok').querySelector('p');
  rxOk.innerText = 'RX Ok:';
  var rxPer = document.getElementById('wf-rx-per').querySelector('p');
  rxPer.innerText = 'PER:';
};

WifiRx.showView = function (name) {
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

WifiRx.onHandleKeydown = function (event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'wf-rx-test-num':
        var input = document.getElementById(name+'-input');
        input.setSelectionRange(0, input.value.length);
        input.focus();
        break;
      case 'wf-rx-go': {
        var queue = cloneCommandArray(WifiRxGoCmdQueue);
        var channel = document.getElementById('wf-rx-channel').querySelector('select');
        queue[0].cmd = queue[0].cmd + channel.options[channel.selectedIndex].value;
        RemoteHelper.sendCommand(queue, WifiRx.onGoCmd, WifiRx.onGoCmdError);
        break;
      }
      case 'wf-rx-stop': {
        var queue = cloneCommandArray(WifiRxStopCmdQueue);
        RemoteHelper.sendCommand(queue, WifiRx.onStopCmd, WifiRx.onStopCmdError);
        break;
      }
      default:
        break;
    }
    return true;
  }
  return false;
};

WifiRx.initSelect = function(selectLi) {
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      select.focus();
    }
  });
};

WifiRx.onGoCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'SET_EUT_SET_CHANNEL':
      if (response.startsWith('OK')) {
        cmdQueue.shift();
        RemoteHelper.sendCommand(cmdQueue, WifiRx.onGoCmd, WifiRx.onGoCmdError);
      } else {
        console.error(cmdQueue[0].cmd + ' failed');
        alert('Wifi EUT RX Go Error');
      }
      break;
    case 'SET_EUT_RX_START':
      if (response.startsWith('OK')) {
        alert('Wifi EUT RX Go Ok');
      } else {
        console.error(cmdQueue[0].cmd + ' failed')
        alert('Wifi EUT RX Go Error');
      }
      break;
    default: break;
  }
}

WifiRx.onGoCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  alert('Wifi EUT RX Go Error');
}

WifiRx.onStopCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'SET_EUT_GET_RXOK':
      if (response.startsWith('OK')) {
        var array = response.split(':');
        var result = array[2].trim();
        var rxEndCnt = result.split(' ')[0].split('=')[1];

        var rxTestNum = document.getElementById('wf-rx-test-num-input');
        var rxOk = document.getElementById('wf-rx-ok').querySelector('p');
        rxOk.innerText = 'RX Ok:' + rxEndCnt;
        var rxPer = document.getElementById('wf-rx-per').querySelector('p');
        rxPer.innerText = 'Per:' + ((parseInt(rxTestNum.value) - parseInt(rxEndCnt)) / parseInt(rxTestNum.value)) * 100 + '%';

        cmdQueue.shift();
        RemoteHelper.sendCommand(cmdQueue, WifiRx.onStopCmd, WifiRx.onStopCmdError);
      } else {

      }
      break;
    case 'SET_EUT_RX_STOP':
      if (response.startsWith('OK')) {
        alert('Wifi EUT RX Stop Ok');
      } else {
        alert('Wifi EUT RX Stop Error');
      }
      break;
  }
}

WifiRx.onStopCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  alert('Wifi EUT RX Stop Error');
}

window.addEventListener('keydown', WifiRx.handleKeydown.bind(WifiRx));
window.addEventListener('panelready', function (e) {
  if (e.detail.current === '#wifi-rx') {
    WifiRx.update();
  }
});

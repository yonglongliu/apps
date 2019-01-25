/* global Item, NavigationMap*/

/**
 *  BT no signal BLE RX
 */
'use strict';
const BTBLERX_START_CMD = 'wcnd_cli eng bt set_nosig_rx_testmode 1 1 7 ';
const BTBLERX_START_TYPE = 'CMD_BT_BLE_RX_START';

const BTBLERX_STOP_CMD = 'wcnd_cli eng bt set_nosig_rx_testmode 0 1 7 ';
const BTBLERX_STOP_TYPE = 'CMD_BT_BLE_RX_STOP';

const BTBLERX_READ_CMD = 'wcnd_cli eng bt set_nosig_rx_recv_data_le';
const BTBLERX_READ_TYPE = 'CMD_BT_BLE_RX_READ';

var NoSignalBLERX = new Item();

NoSignalBLERX.autoIntervalId = 0;

NoSignalBLERX.update = function() {

  this.content = document.getElementById('no-signal-ble-rx-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('no-signal-ble-rx-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'no-signal-ble-rx-menu', false, this.content);

  this.initSelect(document.getElementById('bt-ble-rx-pac-type'));

  this.channel = document.getElementById('bt-ble-rx-channel-input');
  this.pactype = document.getElementById('bt-ble-rx-pac-type-select');
  this.gain = document.getElementById('bt-ble-rx-gain-input');
  this.addr = document.getElementById('bt-ble-rx-addr-input');
  NoSignalBLERX.autoIntervalId = 0;
};

NoSignalBLERX.showView = function(name) {
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

NoSignalBLERX.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'bt-ble-rx-channel':
      case 'bt-ble-rx-gain':
      case 'bt-ble-rx-addr':
        document.getElementById(name+'-input').focus();
        break;
      case 'bt-ble-rx-start': {
        var queue = [{cmd:BTBLERX_START_CMD, type:BTBLERX_START_TYPE}];
        queue[0].cmd = queue[0].cmd + this.channel.value + ' ';
        queue[0].cmd = queue[0].cmd + this.pactype.options[this.pactype.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.gain.value + ' ';
        queue[0].cmd = queue[0].cmd + this.addr.value;

        RemoteHelper.sendCommand(queue, NoSignalBLERX.onCmd, NoSignalBLERX.onCmdError);
        break;
      }
      case 'bt-ble-rx-read':
        var queue = [{cmd:BTBLERX_READ_CMD, type:BTBLERX_READ_TYPE}];
        RemoteHelper.sendCommand(queue, NoSignalBLERX.onCmd, NoSignalBLERX.onCmdError);
        break;
      case 'bt-ble-rx-auto':
        var queue = [{cmd:BTBLERX_READ_CMD, type:BTBLERX_READ_TYPE}];
        NoSignalBLERX.autoIntervalId = setInterval(function () {
          RemoteHelper.sendCommand(queue, NoSignalBLERX.onCmd, NoSignalBLERX.onCmdError);
        }, 1000);
        break;
      case 'bt-ble-rx-clear': {
        clearInterval(NoSignalBLERX.autoIntervalId);
        NoSignalBLERX.autoIntervalId = 0;
        NoSignalBLERX.clearResult();
        NoSignalBLERX.content = document.getElementById('no-signal-ble-rx-content');
        NavigationMap.initPanelNavigation('.focusable', 7, 'no-signal-ble-rx-menu', false, NoSignalBLERX.content);
        break;
      }
      case 'bt-ble-rx-stop': {
        var queue = [{cmd:BTBLERX_STOP_CMD, type:BTBLERX_STOP_TYPE}];
        queue[0].cmd = queue[0].cmd + this.channel.value + ' ';
        queue[0].cmd = queue[0].cmd + this.pactype.options[this.pactype.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.gain.value + ' ';
        queue[0].cmd = queue[0].cmd + this.addr.value;

        clearInterval(NoSignalBLERX.autoIntervalId);
        NoSignalBLERX.autoIntervalId = 0;
        NoSignalBLERX.clearResult();
        NoSignalBLERX.content = document.getElementById('no-signal-ble-rx-content');
        NavigationMap.initPanelNavigation('.focusable', 8, 'no-signal-ble-rx-menu', false, NoSignalBLERX.content);
        RemoteHelper.sendCommand(queue, NoSignalBLERX.onCmd, NoSignalBLERX.onCmdError);
        break;
      }
      default:
        break;
    }
    return true;
  } else if (event.key === 'Backspace' || event.key === 'Endcall') {
    clearInterval(NoSignalBLERX.autoIntervalId);
    NoSignalBLERX.autoIntervalId = 0;
    NoSignalBLERX.clearResult();
  }

  return false;
};

NoSignalBLERX.initSelect = function(selectLi) {
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      select.focus();
    }
  });
};

NoSignalBLERX.clearResult = function() {
  var ul = document.getElementById('no-signal-ble-rx-ul');
  var elements = ul.querySelectorAll('.focusable');
  if (elements.length > 10) {
    for (var i = 10; i < elements.length; i++) {
      ul.removeChild(elements[i]);
    }
  }
}

NoSignalBLERX.onCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case BTBLERX_START_TYPE:
      if (response.startsWith('OK')) {
        alert('Start BT BLE RX Ok');
      } else {
        alert('Start BT BLE RX Error');
      }
      break;
    case BTBLERX_STOP_TYPE:
      if (response.startsWith('OK')) {
        alert('Stop BT BLE RX Ok');
      } else {
        alert('Stop BT BLE RX Error');
      }
      break;
    case BTBLERX_READ_TYPE:
      if (response.startsWith('OK')) {
        //OK rssi:9, pkt_cnt:3, pkt_err_cnt:3, bit_cnt:4672, bit_err_cnt:2351;
        var result = response.substring(3);
        var array = result.split(',');
        var rssi = array[0].split(':')[1];
        var ptkCnt = array[1].split(':')[1];
        var ptkErrCnt = array[2].split(':')[1];
        var bitCnt = array[3].split(':')[1];
        var bitErrCnt = array[4].split(':')[1];

        var now = new Date();
        var time = now.toLocaleFormat('%H%M%S');
        var per = ptkErrCnt / ptkCnt * 100 + '%';
        var ber = bitErrCnt / bitCnt * 100 + '%';

        var li = document.createElement('li');
        li.className = 'focusable select-li';

        var p = document.createElement('p');
        p.innerText = time;
        li.appendChild(p);
        p = document.createElement('p');
        p.innerText = rssi;
        li.appendChild(p);
        p = document.createElement('p');
        p.innerText = per;
        li.appendChild(p);
        p = document.createElement('p');
        p.innerText = ber;
        li.appendChild(p);

        var ul = document.getElementById('no-signal-ble-rx-ul');
        ul.appendChild(li);
      } else {
        var now = new Date();
        var time = now.toLocaleFormat('%H%M%S');

        var li = document.createElement('li');
        li.className = 'focusable select-li';

        var p = document.createElement('p');
        p.innerText = time;
        li.appendChild(p);
        p = document.createElement('p');
        p.innerText = 'error';
        li.appendChild(p);

        var ul = document.getElementById('no-signal-ble-rx-ul');
        ul.appendChild(li);
      }

      var currentIndex = 0;
      var elements = document.getElementById('no-signal-ble-rx-ul').querySelectorAll('.focusable');
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].classList.contains('focus')) {
          currentIndex = i;
        }
      }
      NoSignalBLERX.content = document.getElementById('no-signal-ble-rx-content');
      NavigationMap.initPanelNavigation('.focusable', currentIndex, 'no-signal-ble-rx-menu', false, NoSignalBLERX.content);
      break;
  }
}

NoSignalBLERX.onCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');

  var type = cmdQueue[0].type;
  switch (type) {
    case BTBLERX_START_TYPE:
      alert('Start BT BLE RX Error');
      break;
    case BTBLERX_STOP_TYPE:
      alert('Stop BT BLE RX Error');
      break;
    default:
      break;
  }
}

window.addEventListener('keydown', NoSignalBLERX.handleKeydown.bind(NoSignalBLERX));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#no-signal-ble-rx') {
    NoSignalBLERX.update();
  }
});
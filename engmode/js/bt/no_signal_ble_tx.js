/* global Item, NavigationMap */

/**
 *  BT no signal BLE TX
 */
'use strict';
const BTBLETX_START_CMD = 'wcnd_cli eng bt set_nosig_tx_testmode 1 1 ';
const BTBLETX_START_TYPE = 'CMD_BT_BLE_TX_START';

const BTBLETX_STOP_CMD = 'wcnd_cli eng bt set_nosig_tx_testmode 0 1 ';
const BTBLETX_STOP_TYPE = 'CMD_BT_BLE_TX_STOP';

const BTBLETX_PACTYPE_VALUE = '0xFC8 0xFF8 0xFDA 0xFFC';
const BTBLETX_PACTYPE_SCOPE = '0~4';

var NoSignalBLETX = new Item();

NoSignalBLETX.update = function () {

  var powertype = document.getElementById('bt-ble-tx-power-type-select');
  var powervalue = document.getElementById('bt-ble-tx-power-value-input');
  powertype.onchange = NoSignalBLETX.powerTypeOnChange;
  var value = powertype.options[powertype.options.selectedIndex].value;
  if (value === '0') {
    powervalue.placeholder = BTBLETX_PACTYPE_VALUE;
  } else {
    powervalue.placeholder = BTBLETX_PACTYPE_SCOPE;
  }

  this.content = document.getElementById('no-signal-ble-tx-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('no-signal-ble-tx-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'no-signal-ble-tx-menu', false, this.content);

  this.initSelect(document.getElementById('bt-ble-tx-pattern'));
  this.initSelect(document.getElementById('bt-ble-tx-pac-type'));
  this.initSelect(document.getElementById('bt-ble-tx-power-type'));

  this.pattern = document.getElementById('bt-ble-tx-pattern-select');
  this.channel = document.getElementById('bt-ble-tx-channel-input');
  this.pactype = document.getElementById('bt-ble-tx-pac-type-select');
  this.paclen = document.getElementById('bt-ble-tx-pac-len-input');
  this.powertype = document.getElementById('bt-ble-tx-power-type-select');
  this.powervalue = document.getElementById('bt-ble-tx-power-value-input');
  this.paccnt = document.getElementById('bt-ble-tx-pac-cnt-input');
};

NoSignalBLETX.showView = function (name) {
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

NoSignalBLETX.onHandleKeydown = function (event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'bt-ble-tx-channel':
      case 'bt-ble-tx-pac-len':
      case 'bt-ble-tx-power-value':
      case 'bt-ble-tx-pac-cnt':
        document.getElementById(name+'-input').focus();
        break;
      case 'bt-ble-tx-start': {
        var queue = [{ cmd:BTBLETX_START_CMD, type:BTBLETX_START_TYPE}];
        queue[0].cmd = queue[0].cmd + this.pattern.options[this.pattern.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.channel.value + ' ';
        queue[0].cmd = queue[0].cmd + this.pactype.options[this.pactype.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.paclen.value + ' ';
        queue[0].cmd = queue[0].cmd + this.powertype.options[this.powertype.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.powervalue.value + ' ';
        queue[0].cmd = queue[0].cmd + this.paccnt.value;

        RemoteHelper.sendCommand(queue, NoSignalBLETX.onCmd, NoSignalBLETX.onCmdError);
        break;
      }
      case 'bt-ble-tx-stop': {
        var queue = [{ cmd:BTBLETX_STOP_CMD, type:BTBLETX_STOP_TYPE}];
        queue[0].cmd = queue[0].cmd + this.pattern.options[this.pattern.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.channel.value + ' ';
        queue[0].cmd = queue[0].cmd + this.pactype.options[this.pactype.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.paclen.value + ' ';
        queue[0].cmd = queue[0].cmd + this.powertype.options[this.powertype.selectedIndex].value + ' ';
        queue[0].cmd = queue[0].cmd + this.powervalue.value + ' ';
        queue[0].cmd = queue[0].cmd + this.paccnt.value;

        RemoteHelper.sendCommand(queue, NoSignalBLETX.onCmd, NoSignalBLETX.onCmdError);
        break;
      }
      default:
        break;
    }
  }
  return true;
};

NoSignalBLETX.initSelect = function(selectLi) {
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      select.focus();
    }
  });
};

NoSignalBLETX.onCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'CMD_BT_BLE_TX_START':
      if (response.startsWith('OK')) {
        alert('Start BT BLE TX OK');
      } else {
        alert('Start BT BLE TX Error');
      }
      break;
    case 'CMD_BT_BLE_TX_STOP':
      if (response.startsWith('OK')) {
        alert('Stop BT BLE TX OK');
      } else {
        alert('Stop BT BLE TX Error');
      }
      break;
    default:
      break;
  }
}

NoSignalBLETX.onCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
}

NoSignalBLETX.powerTypeOnChange = function (e) {
  var powertype = document.getElementById('bt-ble-tx-power-type-select');
  var powervalue = document.getElementById('bt-ble-tx-power-value-input');
  var value = powertype.options[powertype.options.selectedIndex].value;
  if (value === '0') {
    powervalue.placeholder = BTBLETX_PACTYPE_VALUE;
  } else {
    powervalue.placeholder = BTBLETX_PACTYPE_SCOPE;
  }
}

window.addEventListener('keydown', NoSignalBLETX.handleKeydown.bind(NoSignalBLETX));
window.addEventListener('panelready', function (e) {
  if (e.detail.current === '#no-signal-ble-tx') {
    NoSignalBLETX.update();
  }
});
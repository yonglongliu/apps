/* global Item, NavigationMap */

/**
 *  BT no signal TX
 */
'use strict';
const BTTXStartCmdQueue = [
  { cmd : 'wcnd_cli eng bt set_nosig_tx_testmode 1 0 ', type : 'CMD_BT_TX_START' }
];

const BTTXStopCmdQueue = [
  { cmd : 'wcnd_cli eng bt set_nosig_tx_testmode 0 0 ', type : 'CMD_BT_TX_STOP' }
];

const PacTypeToMaxLen = [
  ['0', '0'], ['1', '0'], ['2', '18'], ['3', '17'], ['4', '27'], ['5', '10'], ['6', '20'], ['7', '30'], ['8', '9'], ['9', '29'],
  ['10', '121'], ['11', '183'], ['12', '120'], ['13', '180'], ['14', '224'], ['15', '339'], ['16', '0'], ['17', '0'], ['20', '54'],
  ['21', '30'], ['22', '60'], ['23', '90'], ['24', '83'], ['25', '29'], ['26', '367'], ['27', '552'], ['28', '360'], ['29', '540'] ,['30', '679'], ['31', '1021']
];

const PacTypeToMaxLenMap = new Map(PacTypeToMaxLen);

var NoSignalTX = new Item();

NoSignalTX.update = function () {

  var pactype = document.getElementById('bt-tx-pac-type-select');
  pactype.onchange = NoSignalTX.pacTypeOnChange;
  var value = pactype.options[pactype.options.selectedIndex].value;
  var maxlen = PacTypeToMaxLenMap.get(value);
  if (maxlen != undefined) {
    var paclen = document.getElementById('bt-tx-pac-len-input');
    paclen.placeholder = '0~' + maxlen;
  }

  this.content = document.getElementById('no-signal-tx-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('no-signal-tx-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'no-signal-tx-menu', false, this.content);

  this.initSelect(document.getElementById('bt-tx-pattern'));
  this.initSelect(document.getElementById('bt-tx-pac-type'));
  this.initSelect(document.getElementById('bt-tx-power-type'));

};

NoSignalTX.showView = function (name) {
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

NoSignalTX.onHandleKeydown = function (event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'bt-tx-channel':
      case 'bt-tx-pac-len':
      case 'bt-tx-power-value':
      case 'bt-tx-pac-cnt':
        document.getElementById(name+'-input').focus();
        break;
      case 'bt-tx-start': {
        var queue = cloneCommandArray(BTTXStartCmdQueue);
        var pattern = document.getElementById('bt-tx-pattern').querySelector('select');
        queue[0].cmd = queue[0].cmd + pattern.options[pattern.selectedIndex].value + ' ';
        var channel = document.getElementById('bt-tx-channel-input');
        queue[0].cmd = queue[0].cmd + channel.value + ' ';
        var pactype = document.getElementById('bt-tx-pac-type').querySelector('select');
        queue[0].cmd = queue[0].cmd + pactype.options[pactype.selectedIndex].value + ' ';
        var paclen = document.getElementById('bt-tx-pac-len-input');
        queue[0].cmd = queue[0].cmd + paclen.value + ' ';
        var powertype = document.getElementById('bt-tx-power-type').querySelector('select');
        queue[0].cmd = queue[0].cmd + powertype.options[powertype.selectedIndex].value + ' ';
        var powervalue = document.getElementById('bt-tx-power-value-input');
        queue[0].cmd = queue[0].cmd + powervalue.value + ' ';
        var paccnt = document.getElementById('bt-tx-pac-cnt-input');
        queue[0].cmd = queue[0].cmd + paccnt.value;

        RemoteHelper.sendCommand(queue, NoSignalTX.onCmd, NoSignalTX.onCmdError);
        break;
      }
      case 'bt-tx-stop': {
        var queue = cloneCommandArray(BTTXStopCmdQueue);
        var pattern = document.getElementById('bt-tx-pattern').querySelector('select');
        queue[0].cmd = queue[0].cmd + pattern.options[pattern.selectedIndex].value + ' ';
        var channel = document.getElementById('bt-tx-channel-input');
        queue[0].cmd = queue[0].cmd + channel.value + ' ';
        var pactype = document.getElementById('bt-tx-pac-type').querySelector('select');
        queue[0].cmd = queue[0].cmd + pactype.options[pactype.selectedIndex].value + ' ';
        var paclen = document.getElementById('bt-tx-pac-len-input');
        queue[0].cmd = queue[0].cmd + paclen.value + ' ';
        var powertype = document.getElementById('bt-tx-power-type').querySelector('select');
        queue[0].cmd = queue[0].cmd + powertype.options[powertype.selectedIndex].value + ' ';
        var powervalue = document.getElementById('bt-tx-power-value-input');
        queue[0].cmd = queue[0].cmd + powervalue.value + ' ';
        var paccnt = document.getElementById('bt-tx-pac-cnt-input');
        queue[0].cmd = queue[0].cmd + paccnt.value;

        RemoteHelper.sendCommand(queue, NoSignalTX.onCmd, NoSignalTX.onCmdError);
        break;
      }
      default:
        break;
    }
  }
  return true;
};

NoSignalTX.initSelect = function(selectLi) {
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      select.focus();
    }
  });
};

NoSignalTX.onCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'CMD_BT_TX_START':
      if (response.startsWith('OK')) {
        alert('Start BT TX OK');
      } else {
        alert('Start BT TX Error');
      }
      break;
    case 'CMD_BT_TX_STOP':
      if (response.startsWith('OK')) {
        alert('Stop BT TX OK');
      } else {
        alert('Stop BT TX Error');
      }
      break;
    default:
      break;
  }
}

NoSignalTX.onCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
}

NoSignalTX.pacTypeOnChange = function (e) {
  var pactype = document.getElementById('bt-tx-pac-type-select');
  var value = pactype.options[pactype.options.selectedIndex].value;
  var maxlen = PacTypeToMaxLenMap.get(value);
  if (maxlen != undefined) {
    var paclen = document.getElementById('bt-tx-pac-len-input');
    paclen.placeholder = '0~' + maxlen;
  }
}

window.addEventListener('keydown', NoSignalTX.handleKeydown.bind(NoSignalTX));
window.addEventListener('panelready', function (e) {
  if (e.detail.current === '#no-signal-tx') {
    NoSignalTX.update();
  }
});
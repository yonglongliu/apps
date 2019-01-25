/* global Item, NavigationMap */

/**
 *  WiFi REG_WR
 */
'use strict';
const RegWrReadCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 get_reg ', type : 'SET_EUT_READ' }
];

const RegWrWriteCmdQueue = [
  { cmd : 'wcnd_cli eng iwnpi wlan0 set_reg ', type : 'SET_EUT_WRITE' }
];

const RegTypeToAddr = [
  ['mac', '0~800'], ['phy0', '0~ff'], ['phy1', '0~ff'], ['rf', '0~6ff']
];

const RegTypeToAddrMap = new Map(RegTypeToAddr);

var WifiRegWr = new Item();

WifiRegWr.update = function () {
  var regtype = document.getElementById('wifi-reg-type-select');
  regtype.onchange = WifiRegWr.onRegTypeChange;
  var key = regtype.options[regtype.options.selectedIndex].value;
  var value = RegTypeToAddrMap.get(key);
  if (value != undefined) {
    var addr = document.getElementById('wf-reg-addr-input');
    addr.placeholder = value;
  }

  this.content = document.getElementById('wifi-reg-wr-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('wifi-reg-wr-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'wifi-reg-wr-menu', false, this.content);

  this.initSelect(document.getElementById('wf-reg-type'));
};

WifiRegWr.showView = function (name) {
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

WifiRegWr.onHandleKeydown = function (event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'wf-reg-addr':
      case 'wf-reg-value':
        var input = document.getElementById(name+'-input');
        input.setSelectionRange(0, input.value.length);
        input.focus();
        break;
      case 'wf-reg-read': {
        var queue = cloneCommandArray(RegWrReadCmdQueue);
        var type = document.getElementById('wf-reg-type').querySelector('select');
        queue[0].cmd = queue[0].cmd + type.options[type.selectedIndex].value + ' ';
        var addr = document.getElementById('wf-reg-addr-input');
        queue[0].cmd = queue[0].cmd + addr.value + ' ';
        var length = document.getElementById('wf-reg-length-input');
        queue[0].cmd = queue[0].cmd + length.value;

        RemoteHelper.sendCommand(queue, WifiRegWr.onCmd, WifiRegWr.onCmdError);
        break;
      }
      case 'wf-reg-write':
        var queue = cloneCommandArray(RegWrWriteCmdQueue);
        var type = document.getElementById('wf-reg-type').querySelector('select');
        queue[0].cmd = queue[0].cmd + type.options[type.selectedIndex].value + ' ';
        var addr = document.getElementById('wf-reg-addr-input');
        queue[0].cmd = queue[0].cmd + addr.value + ' ';
        var value = document.getElementById('wf-reg-value-input');
        queue[0].cmd = queue[0].cmd + value.value;

        RemoteHelper.sendCommand(queue, WifiRegWr.onCmd, WifiRegWr.onCmdError);
        break;
      default:
        break;
    }
    return true;
  }
  return false;
};

WifiRegWr.initSelect = function(selectLi) {
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      select.focus();
    }
  });
};

WifiRegWr.onCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'SET_EUT_READ':
      if (response.startsWith('OK')) {
        var array = response.split(':');
        var value = array[2].trim();
        alert('Read Reg Value ' + value);
      } else {
        alert('Read Reg Error')
      }
      break;
    case 'SET_EUT_WRITE':
      if (response.startsWith('OK')) {
        alert('Write Reg Ok');
      } else {
        alert('Write Reg Error');
      }
      break;
  }
};

WifiRegWr.onCmdError = function(cmdQueue) {
  var type = cmdQueue[0].type;

  console.error(cmdQueue[0].cmd + ' error');
  switch (type) {
    case 'SET_EUT_READ':
      alert('Read Reg Error')
      break;
    case 'SET_EUT_WRITE':
      alert('Write Reg Error');
      break;
  }
};

WifiRegWr.onRegTypeChange = function(e) {
  var regtype = document.getElementById('wifi-reg-type-select');
  var key = regtype.options[regtype.options.selectedIndex].value;
  var value = RegTypeToAddrMap.get(key);
  if (value != undefined) {
    var addr = document.getElementById('wf-reg-addr-input');
    addr.placeholder = value;
  }
};

window.addEventListener('keydown', WifiRegWr.handleKeydown.bind(WifiRegWr));
window.addEventListener('panelready', function (e) {
  if (e.detail.current === '#wifi-reg-wr') {
    WifiRegWr.update();
  }
});

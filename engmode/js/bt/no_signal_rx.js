/* global Item, NavigationMap*/

/**
 *  BT no signal RX
 */
'use strict';
const BTRXStartCmdQueue = [
  { cmd : 'wcnd_cli eng bt set_nosig_rx_testmode 1 0 7 ', type : 'CMD_BT_RX_START' }
];

const BTRXStopCmdQueue = [
  { cmd : 'wcnd_cli eng bt set_nosig_rx_testmode 0 0 7 ', type : 'CMD_BT_RX_STOP' }
];

const BTRXReadCmdQueue = [
  { cmd : 'wcnd_cli eng bt set_nosig_rx_recv_data', type : 'CMD_BT_RX_READ' }
];

var NoSignalRX = new Item();

NoSignalRX.update = function() {

  this.content = document.getElementById('no-signal-rx-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('no-signal-rx-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'no-signal-rx-menu', false, this.content);

  this.initSelect(document.getElementById('bt-rx-pac-type'));
};

NoSignalRX.showView = function(name) {
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

NoSignalRX.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'bt-rx-channel':
      case 'bt-rx-gain':
      case 'bt-rx-addr':
        document.getElementById(name+'-input').focus();
        break;
      case 'bt-rx-start': {
        var queue = cloneCommandArray(BTRXStartCmdQueue);
        var channel = document.getElementById('bt-rx-channel-input');
        queue[0].cmd = queue[0].cmd + channel.value + ' ';
        var pactype = document.getElementById('bt-rx-pac-type-select');
        queue[0].cmd = queue[0].cmd + pactype.options[pactype.selectedIndex].value + ' ';
        var gain = document.getElementById('bt-rx-gain-input');
        queue[0].cmd = queue[0].cmd + gain.value + ' ';
        var addr = document.getElementById('bt-rx-addr-input');
        queue[0].cmd = queue[0].cmd + addr.value;

        RemoteHelper.sendCommand(queue, NoSignalRX.onCmd, NoSignalRX.onCmdError);
        break;
      }
      case 'bt-rx-read':
        RemoteHelper.sendCommand(BTRXReadCmdQueue, NoSignalRX.onCmd, NoSignalRX.onCmdError);
        break;
      case 'bt-rx-auto':
        NoSignalRX.autoIntervalId = setInterval(function () {
          RemoteHelper.sendCommand(BTRXReadCmdQueue, NoSignalRX.onCmd, NoSignalRX.onCmdError);
        }, 1000);
        break;
      case 'bt-rx-clear': {
        clearInterval(NoSignalRX.autoIntervalId);
        NoSignalRX.autoIntervalId = 0;

        var ul = document.getElementById('no-signal-rx-ul');
        var elements = ul.querySelectorAll('.focusable');
        if (elements.length > 10) {
          for (var i = 10; i < elements.length; i++) {
            ul.removeChild(elements[i]);
          }
        }
        NoSignalRX.content = document.getElementById('no-signal-rx-content');
        NavigationMap.initPanelNavigation('.focusable', 7, 'no-signal-rx-menu', false, NoSignalRX.content);
        break;
      }
      case 'bt-rx-stop': {
        var queue = cloneCommandArray(BTRXStopCmdQueue);
        var channel = document.getElementById('bt-rx-channel-input');
        queue[0].cmd = queue[0].cmd + channel.value + ' ';
        var pactype = document.getElementById('bt-rx-pac-type-select');
        queue[0].cmd = queue[0].cmd + pactype.options[pactype.selectedIndex].value + ' ';
        var gain = document.getElementById('bt-rx-gain-input');
        queue[0].cmd = queue[0].cmd + gain.value + ' ';
        var addr = document.getElementById('bt-rx-addr-input');
        queue[0].cmd = queue[0].cmd + addr.value;

        RemoteHelper.sendCommand(queue, NoSignalRX.onCmd, NoSignalRX.onCmdError);
        break;
      }
      default:
        break;
    }
    return true;
  }

  return false;
};

NoSignalRX.initSelect = function(selectLi) {
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      select.focus();
    }
  });
};

NoSignalRX.onCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;

  switch (type) {
    case 'CMD_BT_RX_START':
      if (response.startsWith('OK')) {
        alert('Start BT RX Ok');
      } else {
        alert('Start BT RX Error');
      }
      break;
    case 'CMD_BT_RX_STOP':
      if (response.startsWith('OK')) {
        alert('Stop BT RX Ok');
      } else {
        alert('Stop BT RX Error');
      }
      break;
    case 'CMD_BT_RX_READ':
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

        var ul = document.getElementById('no-signal-rx-ul');
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

        var ul = document.getElementById('no-signal-rx-ul');
        ul.appendChild(li);
      }

      var currentIndex = 0;
      var elements = document.getElementById('no-signal-rx-ul').querySelectorAll('.focusable');
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].classList.contains('focus')) {
          currentIndex = i;
        }
      }
      NoSignalRX.content = document.getElementById('no-signal-rx-content');
      NavigationMap.initPanelNavigation('.focusable', currentIndex, 'no-signal-rx-menu', false, NoSignalRX.content);
      break;
  }
}

NoSignalRX.onCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
}

window.addEventListener('keydown', NoSignalRX.handleKeydown.bind(NoSignalRX));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#no-signal-rx') {
    NoSignalRX.update();
  }
});
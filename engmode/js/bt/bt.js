/* global Item, NavigationMap */

/**
 *  BT test
 */
'use strict';
const GetEUTCmdQueue = [
  { cmd : 'wcnd_cli eng bt eut_status', type : 'CMD_BT_EUT_STATUS' }
];

const SetEUTCmdQueue = [
  { cmd : 'wcnd_cli eng bt dut_mode_configure ', type : '' }
];

const BTOnCmdQueue = [
  { cmd : 'wcnd_cli eng bt bt_on', type : 'CMD_BT_ON' }
];

const BTOffCmdQueue = [
  { cmd : 'wcnd_cli eng bt bt_off', type : 'CMD_BT_OFF' }
];


var BT = new Item();

BT.update = function() {

  this.content = document.getElementById('bt-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();
    var bqbMode = document.getElementById('bqb-mode');
    var stateBqb = 'bqbstatus';
    RemoteHelper.sendBqbCommand(stateBqb,(response) => {
        if(response === 'open'){
            bqbMode.checked = true;
        }else{
            bqbMode.checked = false;
        }
    });
  this.showView('bt-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'bt-menu', false, this.content);
};

BT.showView = function(name) {
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

BT.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'start-bt-service':
        RemoteHelper.sendCommand(BTOnCmdQueue, BT.onCmd, BT.onCmdError);
        break;
      case 'stop-bt-service':
        RemoteHelper.sendCommand(BTOffCmdQueue, BT.onCmd, BT.onCmdError);
        break;
      case 'bt-eut': {
        var queue = cloneCommandArray(SetEUTCmdQueue);
        var eut = document.getElementById('bt-eut');
        if (eut.checked) {
          queue[0].cmd = queue[0].cmd + '1';
          queue[0].type = 'CMD_BT_EUT_OPEN';
        } else {
          queue[0].cmd = queue[0].cmd + '0';
          queue[0].type = 'CMD_BT_EUT_CLOSE';
        }

        RemoteHelper.sendCommand(queue, BT.onCmd, BT.onCmdError);
        break;
      }
      case 'bt-nosingnal':
        App.currentPanel = "#bt-nosignal-test";
        break;
      case 'bqb-mode': {
        var bqb = document.getElementById('bqb-mode');
        if (bqb.checked) {
          var openBqbCmd = 'openbqb';
          RemoteHelper.sendBqbCommand(openBqbCmd,(response) => {
              if (response.startsWith('ok')) {
                  bqb.checked = true;
                  alert('Open BQB Ok');
              } else {
                  bqb.checked = false;
                  alert('Open BQB Error');
              }
          });
        } else {
          var closeBqbCmd = 'closebqb';
          RemoteHelper.sendBqbCommand(closeBqbCmd, (response) => {
              if (response.startsWith('ok')) {
                  bqb.checked = false;
                  alert('Close BQB Ok');
              } else {
                  bqb.checked = true;
                  alert('Close BQB Error');
              }
          });
        }
        break;
      }
      case 'non-ssp': {
        var ssp = document.getElementById('non-ssp');
        if (ssp.checked) {
          RemoteHelper.setproperty('persist.sys.bt.non.ssp', 'close', null, null);
        } else {
          RemoteHelper.setproperty('persist.sys.bt.non.ssp', 'open', null, null);
        }
        break;
      }
      default:
        break;
    }
    return true;
  }

  return true;
};

BT.onCmd = function(cmdQueue, response) {
  var type = cmdQueue[0].type;
  var eut = document.getElementById('bt-eut');

  switch (type) {
    case 'CMD_BT_ON':
      if (response.startsWith('OK')) {
        alert('Open BT Ok');
      } else {
        alert('Open BT Error');
      }
      break;
    case 'CMD_BT_OFF':
      if (response.startsWith('OK')) {
        alert('Close BT Ok');
      } else {
        alert('Close BT Error');
      }
      break;
    case 'CMD_BT_EUT_OPEN':
      if (response.startsWith('OK')) {
        eut.checked = true;
      } else {
        eut.checked = false;
        alert('Open BT EUT Mode Error');
      }
      break;
    case 'CMD_BT_EUT_CLOSE':
      if (response.startsWith('OK')) {
        eut.checked = false;
      } else {
        eut.checked = true;
        alert('Close BT EUT Mode Error');
      }
      break;
    case 'CMD_BT_EUT_STATUS':
      if (response.startsWith('OK')) {
        var array = response.split(' ');
        if (array[3] === '0') {
          eut.checked = false;
        } else {
          eut.checked = true;
        }
      }
      break;
    // case 'CMD_BT_OPEN_BQB':
    //   if (response.startsWith('ok')) {
    //     bqb.checked = true;
    //     alert('Open BQB Ok');
    //   } else {
    //     bqb.checked = false;
    //     alert('Open BQB Error');
    //   }
    //   break;
    // case 'CMD_BT_CLOSE_BQB':
    //   if (response.startsWith('ok')) {
    //     bqb.checked = false;
    //     alert('Close BQB Ok');
    //   } else {
    //     bqb.checked = true;
    //     alert('Close BQB Error');
    //   }
    //   break;
  }
};

BT.onCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
};

window.addEventListener('keydown', BT.handleKeydown.bind(BT));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#bt') {
    var queue = cloneCommandArray(GetEUTCmdQueue);
    RemoteHelper.sendCommand(queue, BT.onCmd, BT.onCmdError);
    BT.update();
  }
});
'use strict';

/**
 * Init variables
 */

var LogSettingsModem = new Item();
LogSettingsModem.update = function() {
  this.content = document.getElementById('log-settings-modem-content');
  this.content.focus();
  this.content.addEventListener('keydown', lsm_handleKeyDownEvent);
  NavigationMap.initPanelNavigation('.focusable', 0, 'log-settings-modem', false, document);
};

var j;
var modemToPC = document.getElementById('modem-to-pc-switch');
var wcnSwitch = document.getElementById('wcn-switch');
var gnssSwitch = document.getElementById('gnss-switch');
var pcmSwitch = document.getElementById('pcm-switch');
/**
 * show toaster
 * @param msg
 */
function showToaster(msg) {
  Toaster.showToast({message: msg, latency: 2000});
}

/**
 * Init slogmodem commander
 * @type {Commander}
 */

var slogCommander = new Commander(IP_ADDRESS, SLOG_PORT);
initSlogConnection();

function initSlogConnection() {
  printLog();
  slogCommander.connect()
      .ondata(function(event) {
        if (!event.data) {
          return;
        }
        if (typeof event.data === 'string') {
          printLog('slog - ondata - \n' + event.data);

        } else {
          printLog('slog - get a unit8array');
        }
      })
      .onopen(function() {
        printLog('slog - connected!');
      })
      .onerror(function(event) {
        printLog('slog - error = ' + event.type + ', data = ' + event.data);

      })
      .onclose(function() {
        printLog('slog - disconnected!');
      });
}

/**
 * For cp2log
 * @type {Commander}
 * @private
 */
var isChecked = false;
var messageFlag = WCND_CP2_STATUS;
(function initWcndConnection() {
  sendwcndcommand(WCND_CP2_STATUS);
})();
// var _wcndCommander = new Commander(IP_ADDRESS, WCND_PORT);
// (function initWcndConnection() {
//   _wcndCommander.connect()
//       .ondata(function(event) {
//         printLog('wcnd - data = ' + event.data);
//         if (!event.data) {
//           printLog('wcnd - return');
//           return;
//         }
//         if (typeof event.data === 'string') {
//           var data = event.data;
//           var index = data.length;
//           data = data.substring(0, index - 1);
//           switch (messageFlag) {
//             case WCND_CP2_STATUS:
//               if (data === '+ARMLOG: 0') {
//                 wcnSwitch.checked = false;
//               } else {
//                 wcnSwitch.checked = true;
//               }
//               isChecked = true;
//               break;
//             case WCND_OPEN_CP2:
//               if (data === 'OK') {
//                 isChecked = false;
//               }
//               break;
//             case WCND_CLOSE_CP2:
//               if (data === 'OK') {
//                 isChecked = false;
//               }
//               break;
//             case DUMP_WCN_ENABLE:
//               if (data === 'OK') {
//                 messageFlag = DUMP_WCN_MEM;
//                 _wcndCommander.send(DUMP_WCN_MEM);
//               }
//               break;
//             case DUMP_WCN_MEM:
//               if (data === 'OK') {
//                 printLog('dmp wcn memory success');
//               }
//               break;
//             default:
//               break;
//           }
//           if (!isChecked) {
//             _wcndCommander.send(WCND_CP2_STATUS);
//             messageFlag = WCND_CP2_STATUS;
//           }
//         }
//       })
//       .onopen(function() {
//         _wcndCommander.send(WCND_CP2_STATUS);
//         printLog('wcnd onopen');
//       })
//       .onerror(function(event) {
//         printLog('wcnd onerror + ' + event.error);
//       })
//       .onclose(function() {
//         printLog('wcnd close');
//       });
// })();

function sendwcndcommand(cmd) {
  debug('wcnd commander : ' + cmd);
  RemoteHelper.sendWCNDCommand(cmd, (value)=> {
    debug('wcnd - data = ' + value);
    if (!value) {
      debug('wcnd - no data return');
      return;
    }
    if (typeof value === 'string') {
      let data = value;
      switch (messageFlag) {
        case WCND_CP2_STATUS:
          if (data === '+ARMLOG: 0') {
            wcnSwitch.checked = false;
          } else {
            wcnSwitch.checked = true;
          }
          isChecked = true;
          break;
        case WCND_OPEN_CP2:
          if (data === 'OK') {
            isChecked = false;
          }
          break;
        case WCND_CLOSE_CP2:
          if (data === 'OK') {
            isChecked = false;
          }
          break;
        case DUMP_WCN_ENABLE:
          if (data === 'OK') {
            messageFlag = DUMP_WCN_MEM;
            // _wcndCommander.send(DUMP_WCN_MEM);
            sendwcndcommand(DUMP_WCN_MEM);
          }
          break;
        case DUMP_WCN_MEM:
          if (data === 'OK') {
            printLog('dmp wcn memory success');
          }
          break;
        default:
          break;
      }
      if (!isChecked) {
        // _wcndCommander.send(WCND_CP2_STATUS);
        messageFlag = WCND_CP2_STATUS;
        sendwcndcommand(WCND_CP2_STATUS);
      }
    }
  });
}

/*
 Add listeners for elements.
 */
// window.addEventListener('keydown', lsm_handleKeyDownEvent);
function lsm_handleKeyDownEvent(event) {
  switch (event.key) {
    case 'Enter':
      var element = document.querySelector('.focus');
      switch (element.id) {
        case 'menuItem-modem-to-pc':
          modemToPC.checked = !modemToPC.checked;
          RemoteHelper.setproperty('persist.sys.engpc.disable', modemToPC.checked ? 0 : 1);
          break;
        case 'menuItem-wcn':
          if (wcnSwitch.checked) {
            messageFlag = WCND_CLOSE_CP2;
            // _wcndCommander.send(WCND_CLOSE_CP2);
            sendwcndcommand(WCND_CLOSE_CP2);
          } else {
            messageFlag = WCND_OPEN_CP2;
            // _wcndCommander.send(WCND_OPEN_CP2);
            sendwcndcommand(WCND_OPEN_CP2);
          }
          break;
        case 'menuItem-dump-wcn':
          RemoteHelper.getproperty('ro.build.type', (value) => {
            if (value === 'user') {
              messageFlag = DUMP_WCN_ENABLE;
              // _wcndCommander.send(DUMP_WCN_ENABLE);
              sendwcndcommand(DUMP_WCN_ENABLE);
            } else {
              messageFlag = DUMP_WCN_MEM;
              // _wcndCommander.send(DUMP_WCN_MEM);
              sendwcndcommand(DUMP_WCN_MEM);
            }
          });
          break;
        case 'menuItem-gnss':
          gnssSwitch.checked = !gnssSwitch.checked;
          gnssSwitch.checked ? slogCommander.send(SLOG_ENABLE_GNSS) : slogCommander.send(SLOG_DISABLE_GNSS);
          break;
        case 'menuItem-pcm':
          if (pcmSwitch.checked) {
            RemoteHelper.sendATCommand('AT+SPDSP=65535,0,0,0');
          } else {
            RemoteHelper.sendATCommand('AT+SPDSP=65535,0,0,4096');
          }
          pcmSwitch.checked = !pcmSwitch.checked;
          break;
        default:
          break;
      }
      break;
    case 'EndCall':
    case 'Backspace':
      slogCommander.disconnect();
      // _wcndCommander.disconnect();
      break;
    default:
      return;
      break;
  }
}

const SLOG_MODEM_CONF = 'data/local/slogmodem/slog_modem.conf';
// const WCN_KEY = 'stream\tcp_wcn\t';
const GNSS_KEY = 'stream\tcp_gnss\t';

// file format is as below, use tab as delimiter
// stream cp_wcn  off 0 5
// stream cp_gnss off 0 5
RemoteHelper.readconf(SLOG_MODEM_CONF, (conf) => {
  function isOn(key) {
    var regexp = new RegExp(key + '\\w+');
    var line = conf.match(regexp);
    return line && (line[0].indexOf('on') !== -1);
  }

  // wcnSwitch.checked = isOn(WCN_KEY);
  gnssSwitch.checked = isOn(GNSS_KEY);
});

RemoteHelper.getproperty('persist.sys.engpc.disable', (value) => {
  modemToPC.checked = (value === '0');
});

window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#log-settings-modem') {
    LogSettingsModem.update();
  }
});
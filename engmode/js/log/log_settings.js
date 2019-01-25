
'use strict';
var LogSettings = new Item();
LogSettings.update = function() {
  this.content = document.getElementById('log-settings-content');
  this.content.focus();
  NavigationMap.initPanelNavigation('.focusable', 0, 'log-settings', false, document);
};

LogSettings.onHandleKeydown = function() {
  return true;
};
/**
 * Some elements
 * @type {Element}
 */
var logSwitch = document.getElementById('log-switch');
var apSwitch = document.getElementById('ap-switch');
var modemSwitch = document.getElementById('modem-switch');
var capSwitch = document.getElementById('cap-switch');

var usedDiv = document.getElementById('used');
var totalDiv = document.getElementById('total');

/*
 * Init commander for communicating with native.
 */
// var _yLogCommander = new Commander(IP_ADDRESS, YLOG_PORT);

function _ylogSendMessage(message) {
    debug('ylog commander send: ' + message);
  RemoteHelper.sendYLOGCommand(message, (value)=> {
      debug('ylog - data = ' + value);
    if (!value) {
      debug('ylog - no data return');
      return;
    }

    if (typeof value === 'string') {
      let data = value;
      switch (message) {
        case YLOG_ALL_START:
        case YLOG_ALL_STOP:
          debug('get ylog all start or stop ondata success');
          setTimeout(() => {_updateUI();} , 1000);
          break;
        default:
          break;
      }
    }
  });
}

/**
 * For AP Log
 * The Native Daemon server(ylogd) will disconnect the connection when it return data every single time,
 * So we have to try to establish connection with it when we send message.
 * @param message
 * @private
 */
// function _ylogSendMessage(message) {
//   _yLogCommander.connect()
//       .ondata(function(event) {
//         if (!event.data) {
//           return;
//         }
//         if (typeof event.data === 'string') {
//           //get string without YLOG_EXIT_FLAG
//           var data = event.data;
//           var index = data.indexOf(YLOG_EXIT_FLAG);
//           data = data.substring(0, index - 1);
//
//           dump('ylog - data - \n' + data);
//
//           switch (message) {
//             case YLOG_ALL_START:
//             case YLOG_ALL_STOP:
//               setTimeout(() => {_updateUI();} , 1000);
//               break;
//             default:
//               break;
//           }
//         } else {
//           printLog('ylog - get a unit8array');
//         }
//       })
//       .onopen(function() {
//         printLog('ylog - connected!');
//         _yLogCommander.send(message);
//       })
//       .onerror(function(event) {
//         printLog('ylog - error = ' + event.type + ', data = ' + event.data);
//       })
//       .onclose(function() {
//         printLog('ylog - disconnected!');
//       });
// }


/**
 * For modem log
 * @type {Commander}
 * @private
 */
const SLOG_MSG_GET = 1;
const SLOG_MSG_START = 2;
const SLOG_MSG_STOP = 3;
const SLOG_MSG_CLEAR = 4;
var _flag_slogMessage = SLOG_MSG_GET;

var _slogCommander = new Commander(IP_ADDRESS, SLOG_PORT);
(function _initSlogConnection() {
  _slogCommander.connect()
      .ondata(function(event) {
        if (!event.data) {
          return;
        }
        if (typeof event.data === 'string') {
          printLog('slog - ondata - ' + event.data);
          var data = event.data;
          switch (_flag_slogMessage) {
            case SLOG_MSG_GET:
              if (data.indexOf('OK ON') > -1) {
                modemSwitch.checked = true;
              } else {
                modemSwitch.checked = false;
              }
              break;
            case SLOG_MSG_START:
            case SLOG_MSG_STOP:
            case SLOG_MSG_CLEAR:
              break;
            default:
              printLog('Unhandled situation!');
              break;
          }
          //update log manager switch status
          _updateLogManagerSwitch();
        } else {
          printLog('slog - get a unit8array');
        }
      })
      .onopen(function() {
        _slogGetState();
        printLog('slog - connected!');
      })
      .onerror(function(event) {
        printLog('slog - error = ' + event.type + ', data = ' + event.data);
      })
      .onclose(function() {
        printLog('slog - disconnected!');
      });
})();

var _updateUI = function() {
  //update ylog status through android_main
  RemoteHelper.getproperty('ylog.svc.android_main', (value) => {
    apSwitch.checked = (value === 'running');
    //update log manager switch status
    _updateLogManagerSwitch();
  });

  RemoteHelper.sendATCommand('AT+SPCAPLOG?', (value) => {
    capSwitch.checked = (value.indexOf('1') !== -1);
  });

  //Update slog

  _getSpace();
};

_updateUI();

//update storage space every 2 seconds
window.setInterval(_getSpace, 2000);

/**
 * Get the size of the storage
 * @private
 */
function _getSpace() {
  var volumes = {};
  var storages = navigator.getDeviceStorages('sdcard');
  storages.forEach(function(storage) {
    var name = storage.storageName;
    if (!volumes.hasOwnProperty(name)) {
      volumes[name] = {};
    }
    volumes[name]['sdcard'] = storage;

    var memory = volumes[name]['sdcard'];
    memory.usedSpace().onsuccess = function(e) {
      var used = e.target.result;
      var usedInfo = _showFormatedSize(used);
      usedDiv.innerHTML = 'Used: ' + usedInfo.size + usedInfo.unit;

      memory.freeSpace().onsuccess = function(e) {
        var free = e.target.result;
        var total = used + free;
        var totalInfo = _showFormatedSize(total);
        totalDiv.innerHTML = 'Total: ' + totalInfo.size + totalInfo.unit;
      };
    };

  });
}

/**
 * Format the memory size
 * @param size
 * @returns {{size: *, unit: string}}
 * @private
 */
function _showFormatedSize(size) {
  if (size === undefined || isNaN(size)) {
    return;
  }

  // KB - 3 KB (nearest ones), MB, GB - 1.29 MB (nearest hundredth)
  var fixedDigits = (size < 1024 * 1024) ? 0 : 2;
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var e;
  if (size) {
    e = Math.floor(Math.log(size) / Math.log(1024));
    size = (size / Math.pow(1024, e)).toFixed(fixedDigits || 0);
  } else {
    e = 0;
    size = '0';
  }

  return {
    size: size,
    unit: units[e]
  };
}

/**
 * show toaster
 * @param msg
 */
function showToaster(msg) {
  Toaster.showToast({message: msg, latency: 2000});
}

/**
 * update slog status through cp type 5mode
 * @private
 */
function _slogGetState() {
  _slogCommander && _slogCommander.send(SLOG_GET_5MODE_STATE);
  _flag_slogMessage = SLOG_MSG_GET;
}

/**
 * Enable All sub system in slog modem
 * @private
 */
function _slogAllStart() {
  if (!_slogCommander) {
    return;
  }
  _flag_slogMessage = SLOG_MSG_START;
  _slogCommander.send(SLOG_ENABLE_5MODE);
  _slogCommander.send(SLOG_ENABLE_WCN);

  RemoteHelper.sendATCommand('AT+ARMLOG=1');
  RemoteHelper.sendATCommand('AT+SPDSPOP=2');

  _slogGetState();
}

/**
 * Disable all sub system in slog modem
 * @private
 */
function _slogAllStop() {
  if (!_slogCommander) {
    return;
  }
  _flag_slogMessage = SLOG_MSG_STOP;
  _slogCommander.send(SLOG_DISABLE_5MODE);
  _slogCommander.send(SLOG_DISABLE_WCN);

  RemoteHelper.sendATCommand('AT+ARMLOG=0');
  RemoteHelper.sendATCommand('AT+SPDSPOP=0');

  _slogGetState();
}

/**
 * Clean storage
 * @private
 */
function _slogClearStorage() {
  if (!_slogCommander) {
    return;
  }
  _slogCommander.send(SLOG_CLEAN);
  _flag_slogMessage = SLOG_MSG_CLEAR;
}

function _updateLogManagerSwitch() {
  logSwitch.checked = modemSwitch.checked || apSwitch.checked || capSwitch.checked;
}

/*
 Add listeners for elements.
 */
window.addEventListener('keydown', ls_handleKeyDownEvent);
function ls_handleKeyDownEvent(event) {
  switch (event.key) {
    case 'Enter':
      var element = document.querySelector('.focus');
      switch (element.id) {
        case 'menuItem-logManager':
          if (logSwitch.checked) {
            RemoteHelper.setproperty('persist.ylog.enabled', 0, () => {});
            _slogAllStop();
            RemoteHelper.sendATCommand('AT+SPCAPLOG=0', () => {
              capSwitch.checked = false;
              _updateLogManagerSwitch();
            });
          } else {
            RemoteHelper.setproperty('persist.ylog.enabled', 1, () => {
              setTimeout(() => { _ylogSendMessage(YLOG_ALL_START);}, 1000);
            });
            _slogAllStart();
            RemoteHelper.sendATCommand('AT+SPCAPLOG=1', () => {
              capSwitch.checked = true;
              _updateLogManagerSwitch();
            });
          }
          logSwitch.checked = apSwitch.checked = !logSwitch.checked;
          break;
        case 'menuItem-ap':
          if (apSwitch.checked) {
            RemoteHelper.setproperty('persist.ylog.enabled', 0, () => {});
          } else {
            RemoteHelper.setproperty('persist.ylog.enabled', 1, () => {
              setTimeout(() => { _ylogSendMessage(YLOG_ALL_START);}, 1000);
            });
          }
          apSwitch.checked = !apSwitch.checked;
          break;
        case 'menuItem-modem':
          if (modemSwitch.checked) {
            _slogAllStop();
          } else {
            _slogAllStart();
          }
          modemSwitch.checked = !modemSwitch.checked;
          break;
        case 'modem-settings':
          App.currentPanel = '#log-settings-modem';
          break;
        case 'ap-settings':
          App.currentPanel = '#log-settings-ap';
          break;
        case 'menuItem-cap':
          if (capSwitch.checked) {
            RemoteHelper.sendATCommand('AT+SPCAPLOG=0', () => {
              capSwitch.checked = false;
              _updateLogManagerSwitch();
            });
          } else {
            RemoteHelper.sendATCommand('AT+SPCAPLOG=1', () => {
              capSwitch.checked = true;
              _updateLogManagerSwitch();
            });
          }
          break;
        case 'clean-logs':
          _slogClearStorage();
          _ylogSendMessage(YLOG_CLEAN);
          break;
        default :
          break;
      }
      break;

    case 'BackSpace':
      App.currentPanel = '#app-settings';
      event.preventDefault();
      break;
    default:
      break;
  }
}

navigator.mozSetMessageHandler('connection', function (request) {
  var port = request.port;
  port.onmessage = function (event) {
    if (request.keyword === 'modemlog') {
      var enable = event.data;
      if (enable) {
        _slogAllStart();
      }
    }
  };
});

window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#log-settings') {
    LogSettings.update();
  }
});

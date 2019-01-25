'use strict';
var LogSettingsAp = new Item();
LogSettingsAp.update = function() {
  this.content = document.getElementById('log-settings-ap-content');
  this.content.focus();
  this.content.addEventListener('keydown', lsa_handleDownEvent);
  NavigationMap.initPanelNavigation('.focusable', 0, 'log-settings-ap', false, document);
};

var tcpIpSwitch = document.getElementById('ap-tcpip-log-switch');
var btHciSwitch = document.getElementById('ap-bt-hci-log-switch');

function lsa_handleDownEvent(event) {
  switch (event.key) {
    case 'Enter':
      var element = document.querySelector('.focus');
      switch (element.id) {
        case 'ap-tcpip-log':
          tcpIpSwitch.checked ? _ylogSendMessage(YLOG_TCPDUMP_STOP) : _ylogSendMessage(YLOG_TCPDUMP_START);
          break;
        case 'ap-bt-hci-log':
          btHciSwitch.checked ? _ylogSendMessage(YLOG_HCIDUMP_STOP) : _ylogSendMessage(YLOG_HCIDUMP_START);
          break;
        default:
          break;
      }
      break;
    case 'EndCall':
    case 'Backspace':
      App.currentPanel = '#log-settings';
      event.preventDefault();
      event.stopPropagation();
      LogSettingsAp.content.removeEventListener('keydown',lsa_handleDownEvent);
      break;
    default:
      break;
  }
}

// var _yLogCommander = new Commander(IP_ADDRESS, YLOG_PORT);
function _ylogSendMessage(message, forced) {
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
        case YLOG_TCPDUMP_START:
          tcpIpSwitch.checked = (data == '[ tcpdump ] = running');
          break;
        case YLOG_TCPDUMP_STOP:
          tcpIpSwitch.checked = (data == '[ tcpdump ] = stop');
          break;
        case YLOG_HCIDUMP_START:
          btHciSwitch.checked = (data == '[ hcidump ] = running');
          break;
        case YLOG_HCIDUMP_STOP:
          btHciSwitch.checked = (data == '[ hcidump ] = stop');
          break;
        default:
          break;
      }
    }
  });
}
// function _ylogSendMessage(message, forced) {
//   _yLogCommander.connect()
//       .ondata(function(event) {
//         if (!event.data) {
//           return;
//         }
//         if (typeof event.data === 'string') {
//           var data = event.data;
//           var index = data.indexOf(YLOG_EXIT_FLAG);
//           data = data.substring(0, index - 1);
//
//           switch (message) {
//             case YLOG_TCPDUMP_START:
//               tcpIpSwitch.checked = (data == '[ tcpdump ] = running');
//               break;
//             case YLOG_TCPDUMP_STOP:
//               tcpIpSwitch.checked = (data == '[ tcpdump ] = stop');
//               break;
//             case YLOG_HCIDUMP_START:
//               btHciSwitch.checked = (data == '[ hcidump ] = running');
//               break;
//             case YLOG_HCIDUMP_STOP:
//               btHciSwitch.checked = (data == '[ hcidump ] = stop');
//               break;
//             default:
//               break;
//           }
//         }
//       })
//       .onopen(function() {
//         _yLogCommander.send(message, forced);
//       })
//       .onerror(function(event) {
//         printLog('ylog - error = ' + event.type + ', data = ' + event.data);
//       })
//       .onclose(function() {
//         printLog('ylog - disconnected!');
//       });
// }

RemoteHelper.getproperty('ylog.svc.tcpdump', (value) => {
  tcpIpSwitch.checked = (value == 'running');
});

RemoteHelper.getproperty('ylog.svc.hcidump', (value) => {
  btHciSwitch.checked = (value == 'running');
});

window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#log-settings-ap') {
    LogSettingsAp.update();
  }
});

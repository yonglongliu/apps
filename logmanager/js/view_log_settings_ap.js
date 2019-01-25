'use strict';
(function(exports) {
  function ViewLogSettingsAp() {}

  ViewLogSettingsAp.prototype = new Page();

  ViewLogSettingsAp.prototype.init = function() {
    this.element = document.getElementById('log-settings-ap');
    this.tcpIpItem = document.getElementById('ap-tcpip-log');
    this.btHciItem = document.getElementById('ap-bt-hci-log');
    this.tcpIpSwitch = document.getElementById('ap-tcpip-log-switch');
    this.btHciSwitch = document.getElementById('ap-bt-hci-log-switch');

    this.element.addEventListener('keydown', this.handleKeydownEvent.bind(this));
    window.addEventListener('statesUpdate', this.updateUI.bind(this));
    window.addEventListener('panelready', (e) => {
      if (e.detail.current === '#log-settings-ap') {
        this.update();
      }
    });
  };

  ViewLogSettingsAp.prototype.update = function() {
    this.updateUI();
    this.initNavigation(this.element);
  };

  ViewLogSettingsAp.prototype.updateUI = function() {
    if (states.get('aplog')) {
      this.tcpIpItem.classList.remove('disabled');
      this.btHciItem.classList.remove('disabled');
    } else {
      this.tcpIpItem.classList.add('disabled');
      this.btHciItem.classList.add('disabled');
    }

    this.tcpIpSwitch.checked = states.get('tcpiplog');
    this.btHciSwitch.checked = states.get('bthcilog');
  };
  
  ViewLogSettingsAp.prototype.handleKeydownEvent = function(event) {
    switch (event.key) {
      case 'Enter':
        if (!event.target.classList.contains('disabled')) {
          let id = event.target.id;
          switch (id) {
            case 'ap-tcpip-log':
              EventSender.emit('sendYlogCommand', {
                target: event.target,
                message: this.tcpIpSwitch.checked ? YLOG_TCPDUMP_STOP : YLOG_TCPDUMP_START
              });
              break;
            case 'ap-bt-hci-log':
              EventSender.emit('sendYlogCommand', {
                target: event.target,
                message: this.btHciSwitch.checked ? YLOG_HCIDUMP_STOP : YLOG_HCIDUMP_START
              });
              break;
            default:
              break;
          }
        }
        break;
      case 'EndCall':
      case 'Backspace':
        app.currentPanel = '#log-settings';
        event.preventDefault();
        event.stopPropagation();
        break;
      default:
        break;
    }
  };

  exports.ViewLogSettingsAp = ViewLogSettingsAp;
}(window));

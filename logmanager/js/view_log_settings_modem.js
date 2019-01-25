'use strict';

(function(exports) {
  function ViewLogSettingsModem() {}

  ViewLogSettingsModem.prototype = new Page();

  ViewLogSettingsModem.prototype.init = function() {
    this.element = document.getElementById('log-settings-modem');
    this.modemToPC = document.getElementById('modem-to-pc-switch');
    this.wcnSwitch = document.getElementById('wcn-switch');
    this.gnssSwitch = document.getElementById('gnss-switch');
    this.pcmSwitch = document.getElementById('pcm-switch');

    window.addEventListener('statesUpdate', this.updateUI.bind(this));
    this.element.addEventListener('keydown', this.handleKeydownEvent.bind(this));
    window.addEventListener('panelready', (e) => {
      if (e.detail.current === '#log-settings-modem') {
        this.update();
      }
    });
  };

  ViewLogSettingsModem.prototype.update = function() {
    this.updateUI();
    this.initNavigation(this.element);
  };

  ViewLogSettingsModem.prototype.updateUI = function() {
    this.modemToPC.checked = states.get('modemtopc');
    this.wcnSwitch.checked = states.get('wcnlog');
    this.gnssSwitch.checked = states.get('gnsslog');
    this.pcmSwitch.checked = states.get('pcmlog');
  };

  ViewLogSettingsModem.prototype.handleKeydownEvent = function(event) {
    switch (event.key) {
      case 'Enter':
        let id = event.target.id;
        switch (id) {
          case 'menuItem-modem-to-pc':
            EventSender.emit('modemToPC', {
                message: this.modemToPC.checked ? 'close' : 'open'});
            break;
          case 'menuItem-wcn':
            EventSender.emit('sendWcndCommand', {
                message: this.wcnSwitch.checked ? WCND_CLOSE_CP2 : WCND_OPEN_CP2});
            break;
          case 'menuItem-dump-wcn':
            remoteHelper.getproperty('ro.build.type', (value) => {
              EventSender.emit('sendWcndCommand', {
                message: (value === 'user') ? DUMP_WCN_ENABLE : DUMP_WCN_MEM});
            });
            break;
          case 'menuItem-gnss':
            EventSender.emit('sendSlogCommand', {
              message: this.gnssSwitch.checked ? SLOG_DISABLE_GNSS : SLOG_ENABLE_GNSS,
              messageFlag: this.gnssSwitch.checked ? SLOG_MSG_GNSS_CLOSE: SLOG_MSG_GNSS_OPEN
            });
            break;
          case 'menuItem-pcm':
            EventSender.emit('sendATCommand', {
              message: this.pcmSwitch.checked ? PCM_LOG_CLOSE : PCM_LOG_OPEN
            });
            break;
          default:
            break;
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

  exports.ViewLogSettingsModem = ViewLogSettingsModem;
}(window));

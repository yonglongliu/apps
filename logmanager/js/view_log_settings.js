'use strict';

(function(exports){
  function ViewLogSettings() {}

  ViewLogSettings.prototype = new Page();

  ViewLogSettings.prototype.init = function() {
    this.element = document.getElementById('log-settings');
    this.logSwitch = document.getElementById('log-switch');
    this.apSwitch = document.getElementById('ap-switch');
    this.modemSwitch = document.getElementById('modem-switch');
    this.capSwitch = document.getElementById('cap-switch');

    window.addEventListener('statesUpdate', this.updateUI.bind(this));
    window.addEventListener('panelready', (e) => {
      if (e.detail.current === '#log-settings') {
        this.update();
      }
    });
    setTimeout(() => {
      this.element.addEventListener('keydown', this.handleKeyDownEvent.bind(this));
      this.hide();
    }, 3000);
  };

  ViewLogSettings.prototype.hide = function() {
    document.getElementById("hidebg").style.display="none";
  };

  ViewLogSettings.prototype.update = function() {
    this.updateUI();
    this.initNavigation(this.element);
  };

  ViewLogSettings.prototype.updateUI = function() {
    this.apSwitch.checked = states.get('aplog');
    this.modemSwitch.checked = states.get('modemlog');
    this.capSwitch.checked = states.get('caplog');
    this.logSwitch.checked =
        states.get('aplog') &&
        states.get('modemlog') &&
        states.get('caplog');

    this.updateLogsUsedSpace();

    if (!this.updateSpaceInterval) {
      //update storage space every 2 seconds
      this.updateSpaceInterval = setInterval(this.updateLogsUsedSpace, 2000);
    }
  };

  /**
   * Get the size of the storage
   * @private
   */
  ViewLogSettings.prototype.updateLogsUsedSpace = function() {
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

    var volumes = {};
    var storages = navigator.getDeviceStorages('sdcard');
    var targetStorageName = 'sdcard';
    if (storages.length > 1) {
      targetStorageName = 'sdcard1';
      storages.forEach(function (storage) {
        var name = storage.storageName;
        if (targetStorageName === name) {
          if (!volumes.hasOwnProperty(name)) {
            volumes[name] = {};
          }
          volumes[name]['sdcard'] = storage;

          var memory = volumes[name]['sdcard'];
          memory.usedSpace().onsuccess = (e) =>
          {
            var used = e.target.result;
            var usedInfo = _showFormatedSize(used);
            document.getElementById('used').textContent = 'Used: ' + usedInfo.size + usedInfo.unit;

            memory.freeSpace().onsuccess = (e) =>
            {
              var free = e.target.result;
              var total = used + free;
              var totalInfo = _showFormatedSize(total);
              document.getElementById('total').textContent = 'Total: ' + totalInfo.size + totalInfo.unit;
            };
          };
        }
      });
    } else {
        //Get the Used Space Size
        var cmdUsedSpace = 'du -sh /storage/emulated';
        var usedSize = 0;
        remoteHelper.sendCommand([{cmd: cmdUsedSpace,type: 'logmanager'}],
          (queue, response) => {
            var result = response.trim().split(/\s+/);
            if(result && result.length > 0){
              usedSize = result[0];
            }
            document.getElementById('used').textContent = 'Used: ' + usedSize;
          },
          () => {
            document.getElementById('used').textContent = 'Used: ' + usedSize;
          }
        );

        //Get the Total Space Size
        var cmdTotalSpace = 'df /storage/emulated | sed -n 2p';
        var totalSize = 0;
        remoteHelper.sendCommand([{cmd: cmdTotalSpace,type: 'logmanager'}],
          (queue, response) => {
            var result = response.trim().split(/\s+/);
            if(result && result.length > 2){
              totalSize = result[1];
            }
            document.getElementById('total').textContent = 'Total: ' + totalSize;
           },
          () => {
            document.getElementById('total').textContent = 'Total: ' + totalSize;
          }
        );
    }
  };

  /**
   * Clean storage
   * @private
   */
  ViewLogSettings.prototype.clearStorage = function() {
    EventSender.emit('sendSlogCommand', {
      message: SLOG_CLEAN,
      messageFlag: SLOG_MSG_CLEAR
    });

    EventSender.emit('sendYlogCommand', {
      message: YLOG_CLEAN
    });
  };

  /**
   * update slog status through cp type 5mode
   * @private
   */
  ViewLogSettings.prototype._slogGetState = function() {
    EventSender.emit('sendSlogCommand', {
      message: SLOG_GET_5MODE_STATE,
      messageFlag: SLOG_MSG_GET
    });
  };

  /**
   * Enable All sub system in slog modem
   * @private
   */
  ViewLogSettings.prototype._slogAllStart = function() {
    EventSender.emit('sendSlogCommand', {
      message: SLOG_ENABLE_5MODE,
      messageFlag: SLOG_MSG_START
    });

    EventSender.emit('sendSlogCommand', {
      message: SLOG_ENABLE_WCN,
      messageFlag: SLOG_MSG_START
    });

    EventSender.emit('sendATCommand', {
      message: ARM_LOG_ENABLE
    });

    EventSender.emit('sendATCommand', {
      message: SPDSPOP_ENABLE
    });

    this._slogGetState();
  };

  /**
   * Disable all sub system in slog modem
   * @private
   */
  ViewLogSettings.prototype._slogAllStop = function() {
    EventSender.emit('sendSlogCommand', {
      message: SLOG_DISABLE_5MODE,
      messageFlag: SLOG_MSG_STOP
    });

    EventSender.emit('sendSlogCommand', {
      message: SLOG_DISABLE_WCN,
      messageFlag: SLOG_MSG_STOP
    });

    EventSender.emit('sendATCommand', {
      message: ARM_LOG_DISABLE
    });

    EventSender.emit('sendATCommand', {
      message: SPDSPOP_DISABLE
    });

    this._slogGetState();
  };

  ViewLogSettings.prototype.toggleTotalLogSwitch = function() {
    if (this.logSwitch.checked) {
      remoteHelper.setproperty('persist.ylog.enabled', 0, () => {
        states.set('aplog', false);
      });
      this._slogAllStop();
      EventSender.emit('sendATCommand', {message: CAP_LOG_DISABLE});
    } else {
      remoteHelper.setproperty('persist.ylog.enabled', 1, () => {
          setTimeout(() => {
          EventSender.emit('sendYlogCommand', {message: YLOG_ALL_START});
          states.set('aplog', true);
        }, 1000);
      });
      // Set 1s delay for ylog really OK
      setTimeout(() => {
        EventSender.emit('sendYlogCommand', {
          message: YLOG_ALL_START,
        });
      }, 1000);
      this._slogAllStart();
      EventSender.emit('sendATCommand', {message: CAP_LOG_ENABLE});
    }
  };

  ViewLogSettings.prototype.toggleAPLogSwitch = function() {
    EventSender.emit('sendEngmodedCommand', {
      message: this.apSwitch.checked ? 'aplogDisable' : 'aplogEnable'
    });
  };

  ViewLogSettings.prototype.toggleModemLogSwitch = function() {
    (this.modemSwitch.checked) ? this._slogAllStop() : this._slogAllStart();
  };

  ViewLogSettings.prototype.toggleCapLogSwitch = function() {
    EventSender.emit('sendATCommand', {
      message: this.capSwitch.checked ? CAP_LOG_DISABLE : CAP_LOG_ENABLE});
  };

  ViewLogSettings.prototype.handleKeyDownEvent = function(event) {
    let target = event.target;
    let key = event.key;
    if (key === 'Enter') {
      let id = target.id;
      switch (id) {
        case 'menuItem-logManager':
          this.toggleTotalLogSwitch();
          break;
        case 'menuItem-ap':
          this.toggleAPLogSwitch();
          break;
        case 'menuItem-modem':
          this.toggleModemLogSwitch();
          break;
        case 'modem-settings':
          app.currentPanel = '#log-settings-modem';
          break;
        case 'ap-settings':
          app.currentPanel = '#log-settings-ap';
          break;
        case 'adb_debug_set':
          app.currentPanel = '#adb-debug-setting';
          break;
        case 'menuItem-cap':
          this.toggleCapLogSwitch();
          break;
        case 'clean-logs':
          this.clearStorage();
          break;

        default:
          break;
      }
    }

    if (key === 'Backspace' || key === 'EndCall') {
      event.preventDefault();
      window.close();
    }
  };

  exports.ViewLogSettings = ViewLogSettings;
}(window));

'use strict';
(function(exports) {
    function AdbDebugSetting() {}

    AdbDebugSetting.prototype = new Page();

    AdbDebugSetting.prototype.init = function() {
        this.element = document.getElementById('adb-debug-setting');
        this.adbDebug = document.getElementById('adb-debug');

        this.element.addEventListener('keydown', this.handleKeydownEvent.bind(this));
        window.addEventListener('statesUpdate', this.updateUI.bind(this));
        window.addEventListener('panelready', (e) => {
            if (e.detail.current === '#adb-debug-setting') {
            this.update();
        }
      });
    };

    AdbDebugSetting.prototype.update = function() {
        this.updateUI();
        this.initNavigation(this.element);
    };

    AdbDebugSetting.prototype.updateUI = function() {
        if(navigator.mozSettings){
            var request = navigator.mozSettings.createLock().get('debugger.remote-mode');
            var self = this;
            request.onsuccess = function () {
                var debug = request.result['debugger.remote-mode'];
                self.adbDebug.checked = (debug === 'adb-devtools');
            };
        }

    };
    AdbDebugSetting.prototype.toggleAdbDebugSetting = function() {
          this.adbDebug.checked = !this.adbDebug.checked;
          if(this.adbDebug.checked){
            navigator.mozSettings.createLock().set({'debugger.remote-mode': 'adb-devtools'});
          }
          else{
              navigator.mozSettings.createLock().set({'debugger.remote-mode': 'disabled'});
          }
    };
    AdbDebugSetting.prototype.handleKeydownEvent = function(event) {
        switch (event.key) {
            case 'Enter':
                if (!event.target.classList.contains('disabled')) {
                    let id = event.target.id;
                    switch (id) {
                        case 'menuItem-adb-debug':
                            this.toggleAdbDebugSetting();
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

    exports.AdbDebugSetting = AdbDebugSetting;
}(window));

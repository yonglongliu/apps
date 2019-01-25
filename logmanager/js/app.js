'use strict';
/* global SimpleNavigationHelper */
(function(exports) {
  function App() {}
  App.prototype = {
    _currentPanel: '#log-settings',

    wifiReset: false,

    get currentPanel() {
      return this._currentPanel;
    },

    set currentPanel(hash) {
      if (!hash.startsWith('#')) {
        hash = '#' + hash;
      }

      if (hash === this._currentPanel) {
        return;
      }

      var oldPanel = document.querySelector(this._currentPanel);
      var newPanel = document.querySelector(hash);
      this._currentPanel = hash;
      this._transit(oldPanel, newPanel);
    },

    _transit: function transit(oldPanel, newPanel) {
      // switch previous/current classes
      oldPanel.className = newPanel.className ? '' : 'previous';
      newPanel.className = 'current';

      /**
       * Most browsers now scroll content into view taking CSS transforms into
       * account.  That's not what we want when moving between <section>s,
       * because the being-moved-to section is offscreen when we navigate to its
       * #hash.  The transitions assume the viewport is always at document 0,0.
       * So add a hack here to make that assumption true again.
       * https://bugzilla.mozilla.org/show_bug.cgi?id=803170
       */
      if ((window.scrollX !== 0) || (window.scrollY !== 0)) {
        window.scrollTo(0, 0);
      }

      newPanel.addEventListener('transitionend', function paintWait() {
        newPanel.removeEventListener('transitionend', paintWait);

        // We need to wait for the next tick otherwise gecko gets confused
        setTimeout(function nextTick() {
          var event = new CustomEvent('panelready', {
            detail: {
              previous: '#' + oldPanel.id,
              current: '#' + newPanel.id
            }
          });
          window.dispatchEvent(event);
        });
      });
    },

    start: function() {
      document.getElementById('log-settings').className = 'current';

      setTimeout(() => {
        let event = new CustomEvent('panelready', {
          detail: {
            previous: '#log-settings',
            current: '#log-settings'
          }
        });
        window.dispatchEvent(event);
      });
    }
  };

  exports.App = App;
}(window));

/* global NavigationMap */
'use strict';

var App = {
  _currentPanel: '#root',

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

  init: function() {
    this.element = document.getElementById('root');
    this.loadMenuItems(App.initMenuListNavigation.bind(this));

    this.element.addEventListener('keydown', this.handleKeydownEvent.bind(this));
    document.body.addEventListener('keydown', (event) => {
      if (('Backspace' === event.key || 'EndCall' === event.key)
          && App.currentPanel === '#root') {
        event.preventDefault();
        var req = window.navigator.jrdExtension.setPropertyLE('engmoded', 'disable');
        req.onsuccess = () => {
          dump('ts--- close app after turn off engmoded');
          window.close();
        };
      }
    });

    App.currentPanel = '#root';
  },

  initMenuListNavigation: function() {
    NavigationMap.initPanelNavigation('.focusable', 0, 'home-menu', false, this.element);
  },

  createListItem: function(name, info, container) {
    var liNode = document.createElement('li');
    var pNode = document.createElement('p');
    pNode.textContent = info;
    liNode.appendChild(pNode);
    liNode.setAttribute('name', name);
    liNode.classList.add('focusable');

    container.appendChild(liNode);
  },

  loadMenuItems: function(callback) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', '../resource/config.json', true);
    xhr.send(null);

    xhr.onreadystatechange = function loadConfiguration() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status === 0 || xhr.status === 200) {
        self.configData = JSON.parse(xhr.responseText);
        var list = self.configData;
        var container = document.getElementById('home-menu');
        for (var i = 0, len = list.menuItems.length; i < len; i++) {
          App.createListItem(list.menuItems[i].itemName, list.menuItems[i].itemInfo, container);
        }
        if (callback) {
          callback();
        }
      }
    };
  },

  openTest: function(curFocusItem) {
    if (curFocusItem.classList.contains('focusable')) {
      var name = curFocusItem.getAttribute('name');
      App.currentPanel = '#' + name;
    }
  },

  closeTest: function() {
    App.currentPanel = '#root';
    this.initMenuListNavigation();
  },

  handleKeydownEvent: function(event) {
    if ('Enter' === event.key) {
      this.openTest(event.target);
    }
  }
};

window.addEventListener('load', function onload() {
  var req = window.navigator.jrdExtension.setPropertyLE('engmoded', 'enable');
  req.onsuccess = () => {
    App.init();
  };
});

window.addEventListener('update-focus', () => {
  if (!document.hidden) {
    setTimeout(() => {
      var prev = document.querySelector('.focus');
      prev && prev.focus();
    });
  }
});

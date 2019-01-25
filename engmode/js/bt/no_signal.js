/* global Item, NavigationMap */

/**
 *  BT no signal test
 */
'use strict';
var NoSignal = new Item();

NoSignal.update = function() {

  this.content = document.getElementById('nosignal-test-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('nosignal-test-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'nosignal-test-menu', false, this.content);
};

NoSignal.showView = function(name) {
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

NoSignal.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'nosignal-tx':
        App.currentPanel = "#no-signal-tx";
        break;
      case 'nosignal-rx':
        App.currentPanel = "#no-signal-rx";
        break;
      case 'nosignal-ble-tx':
        App.currentPanel = "#no-signal-ble-tx";
        break;
      case 'nosignal-ble-rx':
        App.currentPanel = "#no-signal-ble-rx";
        break;
      default:
        break;
    }
    return true;
  }

  return true;
};

window.addEventListener('keydown', NoSignal.handleKeydown.bind(NoSignal));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#bt-nosignal-test') {
    NoSignal.update();
  }
});
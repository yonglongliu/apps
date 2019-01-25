/* global Item, NavigationMap */

/**
 *  FM
 */
'use strict';
var FM = new Item();

FM.update = function() {

  this.content = document.getElementById('fm-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('fm-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'fm-menu', false, this.content);
};

FM.showView = function(name) {
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

FM.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'fm-set-earphone':
          var acm = navigator.mozAudioChannelManager;
          if (acm.headphones) {
              App.currentPanel = "#fm-test";
          } else {
              alert("Please plug in headset");
          }
        break;
      default:
        break;
    }
    return true;
  }

  return true;
};

window.addEventListener('keydown', FM.handleKeydown.bind(FM));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#fm') {
    alert("Do not open FM when testing");
    FM.update();
  }
});
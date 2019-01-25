/* global Item, NavigationMap */

/**
 *  CONNECTIVITY
 */
'use strict';
var Connectivity = new Item();

Connectivity.update = function () {

  this.content = document.getElementById('connectivity-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('connectivity-menu');
  NavigationMap.initPanelNavigation('.focusable', 0, 'connectivity-menu', false, this.content);
};

Connectivity.showView = function (name) {
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

Connectivity.onHandleKeydown = function (event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'connectivity-wifi':
        this.showToast('Do not open Wifi when testing')
        App.currentPanel = "#wifi";
        break;
      case 'connectivity-bt':
        this.showToast('Do not open BT when testing')
        App.currentPanel = "#bt";
        break;
      case 'connectivity-fm':
        App.currentPanel = "#fm";
        break;
      case 'connectivity-start-service': {
        var queue = [ { cmd : 'wcnd -G &', type : 'StartWCNDService' } ];
        RemoteHelper.sendCommand(queue, Connectivity.onStartCmd, Connectivity.onStartCmdError);
        break;
      }
      case 'connectivity-stop-service':
        this.showToast('Not Support Stop Service')
        break;
      default:
        break;
    }
    return true;
  }

  return false;
};

Connectivity.onStartCmd = function(cmdQueue, response) {
  if (response.startsWith('OK')) {
    Connectivity.showToast('Start WCND Service Ok')
  }
}

Connectivity.onStartCmdError = function(cmdQueue) {
  console.error(cmdQueue[0].cmd + ' error');
  Connectivity.showToast('Start WCND Service Error')
}

Connectivity.showToast = function (msg) {
  Toaster.showToast({
    message: msg,
    latency: 1000
  });
}

window.addEventListener('keydown', Connectivity.handleKeydown.bind(Connectivity));
window.addEventListener('panelready', function (e) {
  if (e.detail.current === '#connectivity') {
    Connectivity.update();
  }
});

/* global Item, NavigationMap, MozActivity, RemoteHelper */

/**
 *  Antenna settings
 */
'use strict';
var AntennaSettings = new Item();

AntennaSettings.update = function() {
  this.content = document.getElementById('antenna-settings-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('antenna-settings-menu');
  this.initPrimaryAndDiversity();
};

AntennaSettings.showView = function(name) {
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

AntennaSettings.currentSelect = 'primary-only';

AntennaSettings.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    if (name === AntennaSettings.currentSelect || name === 'primaryanddiversity') {
      return true;
    }
    switch (name) {
      case 'primary-and-diversity':
        this.togglePrimaryAndDiversity();
        AntennaSettings.currentSelect = name;
        break;
      case 'primary-only':
        this.togglePrimaryOnly();
        AntennaSettings.currentSelect = name;
        break;
      case 'diversity-only':
        this.toggleDiversityOnly();
        AntennaSettings.currentSelect = name;
        break;
      default:
        break;
    }
    return true;
  }

  return false;
};

AntennaSettings.initPrimaryAndDiversity = function() {
  console.log("antenna settings init");
  /* query current mode from RIL and set which item will be checked */
  /* not need to do init, beause Dut always select primary-only after reboot */
};

AntennaSettings.togglePrimaryAndDiversity = function() {
  console.log("antenna togglePrimaryAndDiversity");
  RemoteHelper.sendATCommand("AT+SFUN=5");
  RemoteHelper.sendATCommand("AT+SPDUALRFSEL=0");
  RemoteHelper.sendATCommand("AT+SFUN=4");
};

AntennaSettings.togglePrimaryOnly = function() {
  console.log("antenna togglePrimaryOnly");
  RemoteHelper.sendATCommand("AT+SFUN=5");
  RemoteHelper.sendATCommand("AT+SPDUALRFSEL=1");
  RemoteHelper.sendATCommand("AT+SFUN=4");
};

AntennaSettings.toggleDiversityOnly = function() {
  console.log("antenna toggleDiversityOnly");
  RemoteHelper.sendATCommand("AT+SFUN=5");
  RemoteHelper.sendATCommand("AT+SPDUALRFSEL=2");
  RemoteHelper.sendATCommand("AT+SFUN=4");
};

AntennaSettings.initSendPower = function() {
  RemoteHelper.getproperty('key_sendpower', () => {
    // This keyword of property is not available now
  }, () => {
  });
};

AntennaSettings.initSleepMode = function() {
  RemoteHelper.getproperty('key_sleepmode', () => {
    // This keyword of property is not available now
  }, () => {
  });
};

window.addEventListener('keydown', AntennaSettings.handleKeydown.bind(AntennaSettings));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#antenna-settings') {
    AntennaSettings.update();
  }
});


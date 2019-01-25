/* global Item, RemoteHelper */

/**
 *  Show net information of phone
 */
'use strict';

const NETINFO_CMD = [{'cmd': 'AT+CCED=0,1', 'label': 'SCELL'}, {'cmd': 'AT+CCED=0,2', 'label': 'NCELL'}];
var NetInfo = new Item();

NetInfo.update = function() {
  this.navContainer = document.getElementById('net-info-content');
  this.navContainer.focus();
  this.navContainer.addEventListener('keydown', this.scrollPage.bind(this));

  this.getNetInfo();
};

NetInfo.getNetInfo = function() {
  var scellLabel = document.getElementById('scell-info');
  var ncellLabel = document.getElementById('ncell-info');
  NETINFO_CMD.forEach((cmd) => {
    RemoteHelper.sendATCommand(cmd.cmd, (response) => {
      response = response.replace(/\+CCED:/g,'');
      response = response.replace(/OK/g,'');
      if (cmd.label === 'SCELL') {
        scellLabel.innerHTML = response;
      } else if (cmd.label === 'NCELL') {
        ncellLabel.innerHTML = response;
      }
    }, () => {
    });
  });
};

NetInfo.scrollPage = function(evt) {
  var result = document.getElementById('net-info-content');
  var handled = false;
  if (evt.key === 'ArrowUp') {
    result.scrollTop -= 60;
    handled = true;
  } else if (evt.key === 'ArrowDown') {
    result.scrollTop += 60;
    handled = true;
  }

  if (handled && App.currentPanel === '#net-info') {
    evt.preventDefault();
    evt.stopPropagation();
  }
};

window.addEventListener('keydown', NetInfo.handleKeydown.bind(NetInfo));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#net-info') {
    NetInfo.update();
  }
});
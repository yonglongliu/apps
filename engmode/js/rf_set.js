'use strict';
const DUALRF = 'AT+SPDUALRFSEL=0';
const MAINRF = 'AT+SPDUALRFSEL=1';
const AUXRF  = 'AT+SPDUALRFSEL=2';

var RFSet = new Item();
RFSet.update = function() {
  this.content = document.getElementById('rf-set-content');
  this.select = this.content.querySelector('select');
  this.content.focus();

  this.select.onblur = () => {
    let selectedValue;

    for(let i = 0; i < this.select.length; i++) {
      if (this.select.options[i].selected) {
        selectedValue = this.select.options[i].value;
      }
    }
    this.setRF(selectedValue);
  };

  this.content.addEventListener('keydown', this.handleKeydown.bind(this));
  NavigationMap.initPanelNavigation('.focusable', 0, 'rf-set-content', false, document);
};


RFSet.onHandleKeydown = function(evt) {
  if (evt.key === 'Enter') {
    evt.stopPropagation();
    evt.preventDefault();
    this.select.focus();
  }
  return true;
};

RFSet.setRF = function(value) {
  function sendAt(cmd) {
    RemoteHelper.sendATCommand('AT+SFUN=5');
    RemoteHelper.sendATCommand(cmd);
    RemoteHelper.sendATCommand('AT+SFUN=4');
  }

  switch (value) {
    case 'dual-rf':
      sendAt(DUALRF);
      break;
    case 'main-rf':
      sendAt(MAINRF);
      break;
    case 'aux-rf':
      sendAt(AUXRF);
      break;
    case 'none':
    default:
      break;
  }
};

window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#rf-set') {
    RFSet.update();
  }
});


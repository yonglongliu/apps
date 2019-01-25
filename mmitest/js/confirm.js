// ************************************************************************
// * File Name: confirm.js
// * Description: Confirm Dialog.
// * Note:
// ************************************************************************

/* global TestItem */
'use strict';

var ConfirmDialog = new TestItem();

ConfirmDialog.onHandleEvent = function(evt) {
  evt.preventDefault();
  switch (evt.type) {
    case 'keydown':
      switch (evt.key) {
        case 'SoftRight':
        case 'Backspace':
        case 'EndCall':
          window.location = '../index.html';
          break;
        case 'SoftLeft':
          window.location = '../tests/auto.html';
          break;
      }
      break;
  }
  return true;
};


ConfirmDialog.onInit = function() {
  this.passButton.disabled = '';
  this.failButton.disabled = '';
  this.passButton.style.visibility = 'visible';
  this.failButton.style.visibility = 'visible';
  this.passButton.setAttribute('value', 'Continue');
  this.failButton.setAttribute('value', 'Cancel');
  var flag = window.sessionStorage.getItem('AUTOFLAG');
  if (flag == 'MMITEST2') {
    document.getElementById('centertext').innerHTML = 'Warnning, autotest will erase MMI2 flag!';
  } else {
    document.getElementById('centertext').innerHTML = 'Warnning, autotest will erase MMI flag!';
  }
};

ConfirmDialog.onDeinit = function() {

};

window.addEventListener('load', ConfirmDialog.init.bind(ConfirmDialog));
window.addEventListener('beforeunload', ConfirmDialog.uninit.bind(ConfirmDialog));
window.addEventListener('keydown', ConfirmDialog.handleKeydown.bind(ConfirmDialog));

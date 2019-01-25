/* global Item, RemoteHelper */

/**
 *  Show phase check information of phone
 */
'use strict';

var PhaseCheck = new Item();

PhaseCheck.update = function() {
  this.navContainer = document.getElementById('phase-check-result');
  this.navContainer.focus();
  this.navContainer.addEventListener('keydown', this.scrollPage.bind(this));

  var phaseCheckInfo = document.getElementById('phase-check-info');
  RemoteHelper.showbinfile((response) => {
    phaseCheckInfo.innerHTML = this.formatInfo(response);
  }, () => {
    phaseCheckInfo.innerHTML = 'Can\'t get phase check info.';
  });
};

PhaseCheck.formatInfo = function(response) {
  response = response.replace(/OK/g,'');
  var array = response.split('\n');
  var s = '';
  array.forEach(function(str) {
    s += str + '<br/>';
  });

  return s;
};

PhaseCheck.scrollPage = function(evt) {
  var result = document.getElementById('phase-check-result');
  var handled = false;
  if (evt.key === 'ArrowUp') {
    result.scrollTop -= 60;
    handled = true;
  } else if (evt.key === 'ArrowDown') {
    result.scrollTop += 60;
    handled = true;
  }

  if (handled && App.currentPanel === "#phase-check") {
    evt.preventDefault();
    evt.stopPropagation();
  }
};

window.addEventListener('keydown', PhaseCheck.handleKeydown.bind(PhaseCheck));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#phase-check') {
    PhaseCheck.update();
  }
});

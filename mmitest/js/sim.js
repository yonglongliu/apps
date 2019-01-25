/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: sim.js
// * Description: mmitest -> test item: sim card test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [sim.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

// ------------------------------------------------------------------------

var SimTest = new TestItem();

SimTest.onInit = function() {
  debug('SimTest.onInit');
  this.passButton.disabled = 'disabled';

  var conn = window.navigator.mozMobileConnections;
  if (!conn) {
    $('centertext').innerHTML = 'SIM card is missing';
    return;
  }

  if (conn[0] && conn[0].iccId) {
    $('centertext').innerHTML = 'SIM is OK';
    this.passButton.disabled = '';
    this.autoPass(1000);
  } else {
    $('centertext').innerHTML = 'SIM is missing';
  }
};

SimTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  return false;
};

window.addEventListener('load', SimTest.init.bind(SimTest));
window.addEventListener('beforeunload', SimTest.uninit.bind(SimTest));
window.addEventListener('keydown', SimTest.handleKeydown.bind(SimTest));

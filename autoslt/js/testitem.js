/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: testitem.js
// * Description: this is the public class for all test items.
// * Note:
// ************************************************************************

/* global dump */
'use strict';

const DEBUG = true;
function debug(s) {
  if (DEBUG) {
    dump('<autoslt> ------: [testitem.js] = ' + s + '\n');
  }
}

//-------------------------------------------------------------------------

/*
 * The TestItem class
 */
function TestItem() {
  debug('TestItem');
}

/*
 * If you have something need init, inherit the onInit function.
 * If you have something need deinit, inherit the onDeinit function.
 * If you need handle event, inherit the onHandleEvent function.
 */
TestItem.prototype.onkeyevent = function() {
};


TestItem.prototype.onInit = function() {
};
TestItem.prototype.onDeinit = function() {
};
TestItem.prototype.onHandleEvent = function() {
  debug('TestItem.prototype.onHandleEvent');
  return false;
};


TestItem.prototype.init = function() {
  debug('TestItem.prototype.init');

  if (navigator.jrdExtension) {
    navigator.jrdExtension.onkeyevent = this.onkeyevent.bind(this);
  }
  // Dont let the phone go to sleep while in mmitest.
  // user must manually close it
  if (navigator.requestWakeLock) {
    navigator.requestWakeLock('screen');
  }
  this.onInit();
};

TestItem.prototype.uninit = function() {
  if (navigator.jrdExtension) {
    navigator.jrdExtension.onkeyevent = null;
  }

  debug('TestItem.prototype.uninit');
  this.onDeinit();
};

TestItem.prototype.enableButton = function() {

};

TestItem.prototype.visibilityChange = function() {
  if (document.mozHidden) {
    if (navigator.jrdExtension) {
      navigator.jrdExtension.onkeyevent = this.onkeyevent;
    }
  } else {
    if (navigator.jrdExtension) {
      navigator.jrdExtension.onkeyevent = null;
    }
  }
};

TestItem.prototype.handleKeydown = function(evt) {
  evt.preventDefault();
  var event;
  var ret = this.onHandleEvent(evt);
  if (ret) {
    return;
  }
  if (evt.key) {
    switch (evt.key) {
      case 'SoftRight':

        break;
      case 'SoftLeft':

        break;
      case 'Up':
      case 'ArrowUp':
        break;
      case 'Down':
      case 'ArrowDown':
        break;
      case 'Backspace':
      case 'EndCall':
        evt.preventDefault();
        break;
    }
  }
};

window.addEventListener('mozvisibilitychange', TestItem.prototype.visibilityChange.bind(this));

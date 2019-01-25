/* global Item, RemoteHelper */

'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [reboot.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

var REBOOT = new Item();

REBOOT.update = function() {
  this.content = document.getElementById('reboot-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();
  this.showView('reboot-menu');
  $('reboot-stop').disabled = true;
  this.initInput();
};

REBOOT.showView = function (name) {
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

REBOOT.initInput = function () {
  var content = $('reboot-menu');
  var allLi = content.querySelectorAll('li');
  for (let liItem of allLi) {
    liItem.onfocus = function (e) {
      let liInput = e.target.querySelector('input');
      if (liInput) {
        var spos = liInput.value.length;
        if (liInput.setSelectionRange) {
          setTimeout(function () {
            liInput.setSelectionRange(spos, spos);
            liInput.focus();
          }, 0);
        }
      }
    }
  }
  REBOOT.inputCursorInit($('reboot-phone-times'));
  REBOOT.inputCursorInit($('awake-phone-times'));
};

REBOOT.inputCursorInit = function (tobj) {
  tobj.addEventListener('keydown', function (evt) {
    if (evt.key === 'ArrowLeft') {
      evt.stopPropagation();
      evt.preventDefault();
    } else if (evt.key === 'ArrowRight') {
      evt.stopPropagation();
      evt.preventDefault();
    }
  });
};

REBOOT.initProperties = function () {
  debug('init reboot properties');
  RemoteHelper.setproperty('persist.sys.reboot_test', $('reboot-switch').checked, () => {});
  RemoteHelper.setproperty('persist.sys.reboot_test.count', $('reboot-phone-times').value, () => {});
  RemoteHelper.setproperty('persist.sys.reboot_test.delay', $('awake-phone-times').value, () => {});
};

REBOOT.startReboot = function () {
  let delay = $('awake-phone-times').value * 1000;
  debug('startReboot delay:' + delay);
  setTimeout(function () {
    RemoteHelper.sendCommand([{cmd: 'reboot', type: 'RebootTest'}], REBOOT.onSuccess, REBOOT.onError);
  }, delay);
};

REBOOT.onSuccess = function (queue, response) {
  debug('Reboot onSuccess');
};

REBOOT.onError = function (queue, response) {
  debug('Reboot onError');
};

REBOOT.stopReboot = function () {
  RemoteHelper.setproperty('persist.sys.reboot_test', false, () => {});
  RemoteHelper.setproperty('persist.sys.reboot_test.count', 0, () => {});
  RemoteHelper.setproperty('persist.sys.reboot_test.delay', 0, () => {});
};

REBOOT.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    debug('onHandleKeydown name = ' + name);
    switch (name) {
      case 'reboot-start': {
        if ($('reboot-start').disabled === false && $('reboot-switch').checked === true) {
          $('reboot-start').disabled = true;
          $('reboot-stop').disabled = false;
          this.initProperties();
          setTimeout(function () {
            REBOOT.startReboot();
          }, 1000);
        }
        break;
      }
      case 'reboot-stop': {
        if ($('reboot-stop').disabled === false) {
          $('reboot-start').disabled = false;
          $('reboot-stop').disabled = true;
          this.stopReboot();
        }
        break;
      }
    }
  }
  return true;
};

window.addEventListener('keydown', REBOOT.handleKeydown.bind(REBOOT));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#reboot') {
    navigator.requestWakeLock('screen');
    REBOOT.update();
  }
});

/* global Item, RemoteHelper */

'use strict';

function $(id) {
  return document.getElementById(id);
}

const LOW_BRIGHTNESS = 0;
const HIGH_BRIGHTNESS = 1;

const SCREENTIMEOUT_KEY = 'screen.timeout';
const BRIGHTNESS_KEY = 'screen.brightness';

var SLEEPAWAKE = new Item();

SLEEPAWAKE.count = 0;

SLEEPAWAKE.sleep_time = 0;
SLEEPAWAKE.awake_time = 0;

SLEEPAWAKE.alarmId = null;
SLEEPAWAKE.timer = null;

SLEEPAWAKE.power = null;
SLEEPAWAKE.lock = null;

SLEEPAWAKE.currentScreenTimeout = 30;
SLEEPAWAKE.currentBrightness = HIGH_BRIGHTNESS;

SLEEPAWAKE.update = function() {
  this.content = document.getElementById('sleepawake-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();

  this.showView('sleepawake-menu');

  $('sleepawake-stop').disabled = true;

  this.initInput();

  navigator.mozSetMessageHandler('alarm', SLEEPAWAKE.onMozAlarm.bind(this));

  SLEEPAWAKE.power = navigator.mozPower;

  var req = navigator.mozSettings.createLock().get(BRIGHTNESS_KEY);
  req.onsuccess = function getSuccess() {
    SLEEPAWAKE.currentBrightness = req.result[BRIGHTNESS_KEY];
    dump('SLEEPAWAKE currentBrightness =' + SLEEPAWAKE.currentBrightness);
  };
  var requ = navigator.mozSettings.createLock().get(SCREENTIMEOUT_KEY);
  requ.onsuccess = function getSuccess() {
    var screentimeout = requ.result[SCREENTIMEOUT_KEY];
    dump('SLEEPAWAKE screen.timeout =' + screentimeout);
  };
};

SLEEPAWAKE.onMozAlarm = function(message) {
  var data = message.data;
  dump('SLEEPAWAKE data.type = ' + data.type);
  if (data.type === 'sleep-timer') {
    SLEEPAWAKE.alarmId = 0;
    SLEEPAWAKE.count++;
    SLEEPAWAKE.awake();
  }
};

SLEEPAWAKE.showView = function (name) {
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

SLEEPAWAKE.initInput = function () {
  var content = $('sleepawake-menu');
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
};

SLEEPAWAKE.awake = function () {
  dump('SLEEPAWAKE awake');
  // Gaia uses four basic resources names: screen, cpu,  wifi, and gps,
  // but any certified application can expose new resources.
  SLEEPAWAKE.lock = navigator.requestWakeLock('screen');
  dump('SLEEPAWAKE wakelock');
  // navigator.mozSettings.createLock().set({'screen.timeout' : SLEEPAWAKE.currentScreenTimeout});
  // navigator.mozSettings.createLock().set({'screen.brightness' : SLEEPAWAKE.currentBrightness});
  SLEEPAWAKE.power.screenBrightness = SLEEPAWAKE.currentBrightness;
  if (SLEEPAWAKE.count < 50) {
    SLEEPAWAKE.timer = setTimeout(function () {
      SLEEPAWAKE.sleep();
    }, SLEEPAWAKE.awake_time * 1000);
  }
};

SLEEPAWAKE.sleep = function () {
  dump('SLEEPAWAKE sleep');
  if (SLEEPAWAKE.lock) {
    SLEEPAWAKE.lock.unlock();
    SLEEPAWAKE.lock = null;
    dump('SLEEPAWAKE wakeunlock');
  }
  var request;
  var data = {
    type: 'sleep-timer'
  };
  request = navigator.mozAlarms.add(
    new Date(Date.now() + this.sleep_time*1000), 'ignoreTimezone', data
  );
  request.onsuccess = (function(ev) {
    SLEEPAWAKE.alarmId = ev.target.result;
    dump('SLEEPAWAKE SLEEPAWAKE.alarmId = ' + SLEEPAWAKE.alarmId);
    dump('SLEEPAWAKE count : ' + SLEEPAWAKE.count);
    // navigator.mozSettings.createLock().set({'screen.brightness' : 0});
    SLEEPAWAKE.power.screenBrightness = 0;
    // navigator.mozSettings.createLock().set({'screen.timeout' : 5});
  }.bind(this));
  request.onerror = function(ev) {
    dump('SLEEPAWAKE onerror');
  };
};

SLEEPAWAKE.onHandleKeydown = function(event) {
  if (event.key === 'Enter') {
    var name = event.target.getAttribute('name');
    switch (name) {
      case 'sleepawake-start': {
        if ($('sleepawake-start').disabled === false) {
          this.sleep_time = $('sleep-phone-time').value;
          this.awake_time = $('awake-phone-time').value;
          if (this.sleep_time <= 9 || this.awake_time <= 9) {
            break;
          }
          dump('SLEEPAWAKE sleepawake-start');
          $('sleepawake-start').disabled = true;
          $('sleepawake-stop').disabled = false;
          SLEEPAWAKE.sleep();
        }
        break;
      }
      case 'sleepawake-stop': {
        if ($('sleepawake-stop').disabled === false) {
          $('sleepawake-start').disabled = false;
          $('sleepawake-stop').disabled = true;
          SLEEPAWAKE.count = 0;
          dump('SLEEPAWAKE sleepawake-stop');
          if (SLEEPAWAKE.alarmId > 0) {
            navigator.mozAlarms.remove(SLEEPAWAKE.alarmId);
            // navigator.mozSettings.createLock().set({'screen.timeout' : SLEEPAWAKE.currentScreenTimeout});
            // navigator.mozSettings.createLock().set({BRIGHTNESS_KEY : SLEEPAWAKE.currentBrightness});
            SLEEPAWAKE.power.screenBrightness = SLEEPAWAKE.currentBrightness;
          }
          if (SLEEPAWAKE.timer) {
            window.clearTimeout(SLEEPAWAKE.timer);
            SLEEPAWAKE.timer = null;
          }
          if (SLEEPAWAKE.lock) {
            SLEEPAWAKE.lock.unlock();
            SLEEPAWAKE.lock = null;
            dump('SLEEPAWAKE wakeunlock');
          }
          // navigator.mozSettings.createLock().set({'screen.brightness' : SLEEPAWAKE.currentBrightness});
          // SLEEPAWAKE.power.screenBrightness = SLEEPAWAKE.currentBrightness;
        }
        break;
      }
    }
  }
  return true;
};

window.addEventListener('keydown', SLEEPAWAKE.handleKeydown.bind(SLEEPAWAKE));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#sleepawake') {
    SLEEPAWAKE.update();
  }
});

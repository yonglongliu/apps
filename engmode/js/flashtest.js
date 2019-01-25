/**
 * Created by sdduser on 18-11-19.
 */
/* global Item, RemoteHelper */

'use strict';

function $(id) {
  return document.getElementById(id);
}

var FLASHTEST = new Item();

FLASHTEST.videoSelect = null;
FLASHTEST.videoPath = "";
FLASHTEST.video = null;
FLASHTEST.video_src = null;
FLASHTEST.autoTestDuration = 0;
FLASHTEST.autoTestMemSize = 0;
FLASHTEST.autoTest = false;
FLASHTEST.timer = null;

FLASHTEST.tab = null;
FLASHTEST.tabIndex = 0;
FLASHTEST.tabPages = null;
FLASHTEST.TAB_NUMBER = 2;
FLASHTEST.tabsId = ['flashtest-settings', 'flashtest-video'];

FLASHTEST.log = '';

FLASHTEST.DEBUG = {
  get log() {
    return FLASHTEST.log;
  },

  set log(content) {
    FLASHTEST.log = `${content}<br />${FLASHTEST.log}`;
    FLASHTEST.flashtext.innerHTML = FLASHTEST.log;
  },

  clear: function() {
    FLASHTEST.log = '';
    FLASHTEST.flashtext.innerHTML = FLASHTEST.log;
  }
};

FLASHTEST.update = function() {
  this.tab = $('flashtest-tab');
  this.tab.select(this.tabIndex);
  this.tabPages = document.querySelectorAll('.flashtest-tabpage');
  this.element = $('flashtest');
  this.video = $('flashtest-video-control');
  this.video.loop = true;
  this.flashtext = $('flash-text');

  NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  $('flashtest-stop').disabled = true;

  this.initInput();
  this.initPathSelect();
};

FLASHTEST.updateVideoSelect =  function () {
  dump('FLASHTEST updateVideoSelect');
  if (FLASHTEST.videoSelect === null) {
    FLASHTEST.videoSelect = $('flash-video-select');
  }
  if (videolist.length > 0) {
    videolist.forEach(function (v) {
      let i = v.lastIndexOf("/");
      FLASHTEST.videoSelect.options.add(new Option(v.slice(i+1), v));
    });
  }
};

FLASHTEST.initInput = function () {
  var content = $('flashtestparameters');
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

  FLASHTEST.inputCursorInit($('flashtest-play-duration'));
  FLASHTEST.inputCursorInit($('flashtest-test-size'));
};

FLASHTEST.inputCursorInit = function (tobj) {
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

FLASHTEST.initPathSelect = function () {
  var selectLi = $('flashtest-video-select');
  var select = selectLi.querySelector('select');
  selectLi.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
    evt.stopPropagation();
    evt.preventDefault();
    select.focus();
  }
});

  select.addEventListener('change', (evt) => {
    let values = select.selectedOptions;
  let len = values.length;
  for (let i = 0; i < len; i++) {
    FLASHTEST.videoPath = values[i].value;
  }
});

  select.addEventListener('blur', (evt) => {
    window.dispatchEvent(new CustomEvent('update-focus'));
});
};

FLASHTEST.onHandleKeydown = function(e) {
  var name = e.target.getAttribute('name');

  switch (e.key) {
    case 'ArrowLeft':
      this.previousTab();
      break;

    case 'ArrowRight':
      this.nextTab();
      break;

    case 'Enter': {
      switch (name) {
        case 'flashtest-start': {
          if ($('flashtest-start').disabled === false) {
            if (FLASHTEST.video_src === null) {
              if (FLASHTEST.videoPath !== "") {
                videodb.getFile(FLASHTEST.videoPath, function (file) {
                  FLASHTEST.video_src = URL.createObjectURL(file);
                  FLASHTEST.video.src = FLASHTEST.video_src;
                  FLASHTEST.startAutoPlay();
                });
              } else {
                //TODO
                FLASHTEST.DEBUG.log = 'flashtest videoPath is empty';
              }
            } else {
              FLASHTEST.startAutoPlay();
            }
          }
          break;
        }
        case 'flashtest-stop': {
          if ($('flashtest-stop').disabled === false) {
            FLASHTEST.stopAutoPlay();
          }
          break;
        }
      }
      break;
    }
  }

  return true;
};

FLASHTEST.startAutoPlay = function () {
  dump('FLASHTEST startAutoPlay');
  FLASHTEST.autoTestDuration = $('flashtest-play-duration').value;
  FLASHTEST.autoTestMemSize = $('flashtest-test-size').value;

  if (!this.autoTestDuration || this.autoTestDuration < 1) {
    FLASHTEST.DEBUG.log = 'Please set test duration, and make sure at least 1 hour';
    return;
  }
  if (!this.autoTestMemSize || this.autoTestMemSize < 2) {
    FLASHTEST.DEBUG.log = 'Please set memory size, and make sure size at least 2M';
    return;
  }
  $('flashtest-start').disabled = true;
  $('flashtest-stop').disabled = false;
  FLASHTEST.autoTest = true;
  FLASHTEST.DEBUG.clear();
  FLASHTEST.video.play();
  var palyTime = new Date();
  FLASHTEST.DEBUG.log = 'startAutoPlay at ' + palyTime.toLocaleString();
  var param = FLASHTEST.autoTestMemSize + ' ' + FLASHTEST.autoTestDuration;
  RemoteHelper.startFlashTest(param, function () {
    FLASHTEST.DEBUG.log = 'startFlashtest success.';
  }, null);
  FLASHTEST.previousTab();
  FLASHTEST.autoTestDuration *= 3600000;
  FLASHTEST.timer = setTimeout(function () {
    FLASHTEST.stopAutoPlay();
  }, FLASHTEST.autoTestDuration);
};

FLASHTEST.stopAutoPlay = function () {
  dump('FLASHTEST stopAutoPlay>');
  FLASHTEST.autoTest = false;
  window.clearTimeout(FLASHTEST.timer);
  FLASHTEST.timer = null;
  FLASHTEST.video.pause();
  FLASHTEST.video_src = null;
  FLASHTEST.video.src = null;
  var endTime = new Date();
  FLASHTEST.DEBUG.log = 'stopAutoPlay at '+endTime.toLocaleString();
  $('flashtest-start').disabled = false;
  $('flashtest-stop').disabled = true;
  RemoteHelper.stopFlashTest(function () {
    FLASHTEST.DEBUG.log = 'stopFlashTest success.';
  }, null);
};

FLASHTEST.previousTab = function() {
  if (this.tabPages !== null) {
    this.tabPages[this.tabIndex].hidden = true;
    this.tabIndex = (this.tabIndex - 1 + this.TAB_NUMBER) % this.TAB_NUMBER;
    this.tab.select(this.tabIndex);
    this.tabPages[this.tabIndex].hidden = false;

    NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  }
};

FLASHTEST.nextTab = function() {
  if (this.tabPages !== null) {
    this.tabPages[this.tabIndex].hidden = true;
    this.tabIndex = (this.tabIndex + 1) % this.TAB_NUMBER;
    this.tab.select(this.tabIndex);
    this.tabPages[this.tabIndex].hidden = false;

    NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  }
};

window.addEventListener('keydown', FLASHTEST.handleKeydown.bind(FLASHTEST));
window.addEventListener('video-enumerated', function(e) {
  FLASHTEST.updateVideoSelect();
});

window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#flashtest') {
    navigator.requestWakeLock('screen');
    FLASHTEST.update();
  }
});

/* global Item, RemoteHelper */

'use strict';

function $(id) {
  return document.getElementById(id);
}

var firstScanEnded = false;
var videodb;
var videolist = [];

var MEMTEST = new Item();

MEMTEST.videoSelect = null;
MEMTEST.videoPath = "";
MEMTEST.video = null;
MEMTEST.video_src = null;
MEMTEST.autoTestCount = 0;
MEMTEST.autoTestInterval = 0;
MEMTEST.autoTestMemSize = 0;
MEMTEST.autoTest = false;
MEMTEST.timer = null;

MEMTEST.tab = null;
MEMTEST.tabIndex = 0;
MEMTEST.tabPages = null;
MEMTEST.TAB_NUMBER = 2;
MEMTEST.tabsId = ['memtest-settings', 'memtest-video'];

MEMTEST.log = '';

MEMTEST.DEBUG = {
  get log() {
    return MEMTEST.log;
  },

  set log(content) {
    MEMTEST.log = `${content}<br />${MEMTEST.log}`;
    MEMTEST.memtext.innerHTML = MEMTEST.log;
  },

  clear: function() {
    MEMTEST.log = '';
    MEMTEST.memtext.innerHTML = MEMTEST.log;
  }
};

MEMTEST.update = function() {
  this.tab = $('memtest-tab');
  this.tab.select(this.tabIndex);
  this.tabPages = document.querySelectorAll('.memtest-tabpage');
  this.element = $('memtest');
  this.video = $('memtest-video-control');
  this.video.addEventListener('ended', playEnded);
  this.memtext = $('mem-text');
  NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);

  $('memtest-stop').disabled = true;

  this.initInput();
  this.initPathSelect();
};

MEMTEST.updateVideoSelect =  function () {
  dump('MEMTEST updateVideoSelect');
  if (MEMTEST.videoSelect === null) {
    MEMTEST.videoSelect = $('video-select');
  }
  if (videolist.length > 0) {
    videolist.forEach(function (v) {
      let i = v.lastIndexOf("/");
      MEMTEST.videoSelect.options.add(new Option(v.slice(i+1), v));
    });
  }
};

MEMTEST.initInput = function () {
  var content = $('memtestparameters');
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

  MEMTEST.inputCursorInit($('memtest-play-times'));
  MEMTEST.inputCursorInit($('memtest-play-interval'));
  MEMTEST.inputCursorInit($('memtest-test-size'));
};

MEMTEST.inputCursorInit = function (tobj) {
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

MEMTEST.initPathSelect = function () {
  var selectLi = $('memtest-video-select');
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
      MEMTEST.videoPath = values[i].value;
    }
  });

  select.addEventListener('blur', (evt) => {
    window.dispatchEvent(new CustomEvent('update-focus'));
  });
};

MEMTEST.onHandleKeydown = function(e) {
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
        case 'memtest-start': {
          if ($('memtest-start').disabled === false) {
            if (MEMTEST.video_src === null) {
              if (MEMTEST.videoPath !== "") {
                videodb.getFile(MEMTEST.videoPath, function (file) {
                  MEMTEST.video_src = URL.createObjectURL(file);
                  MEMTEST.video.src = MEMTEST.video_src;
                  MEMTEST.startAutoPlay();
                });
              } else {
                //TODO
                MEMTEST.DEBUG.log = 'MEMTEST videoPath is empty';
              }
            } else {
              MEMTEST.startAutoPlay();
            }
          }
          break;
        }
        case 'memtest-stop': {
          if ($('memtest-stop').disabled === false) {
            MEMTEST.stopAutoPlay();
          }
          break;
        }
      }
      break;
    }
  }

  return true;
};

MEMTEST.startAutoPlay = function () {
  MEMTEST.autoTestCount = $('memtest-play-times').value;
  MEMTEST.autoTestInterval = $('memtest-play-interval').value;
  MEMTEST.autoTestMemSize = $('memtest-test-size').value;
  if (!this.autoTestCount || this.autoTestCount < 10) {
    MEMTEST.DEBUG.log = 'Please set test count, and make sure at least 10';
    return;
  }
  if (!this.autoTestInterval || this.autoTestInterval < 5) {
    MEMTEST.DEBUG.log = 'Please set test interval, and make sure at least 5s';
    return;
  }
  if (!this.autoTestMemSize || this.autoTestMemSize < 2) {
    MEMTEST.DEBUG.log = 'Please set memory size, and make sure size at least 2M';
    return;
  }
  $('memtest-start').disabled = true;
  $('memtest-stop').disabled = false;
  MEMTEST.autoTestInterval *= 1000;
  MEMTEST.autoTest = true;
  MEMTEST.DEBUG.clear();
  MEMTEST.video.play();
  MEMTEST.DEBUG.log = 'startAutoPlay.';
  RemoteHelper.startmemtest(MEMTEST.autoTestMemSize, function () {
    MEMTEST.DEBUG.log = 'startMemTest success.';
  }, null);
  MEMTEST.previousTab();
};

MEMTEST.stopAutoPlay = function () {
  MEMTEST.autoTest = false;
  window.clearTimeout(MEMTEST.timer);
  MEMTEST.timer = null;
  MEMTEST.video.pause();
  MEMTEST.video_src = null;
  MEMTEST.video.src = null;

  MEMTEST.DEBUG.log = 'stopAutoPlay.';
  $('memtest-start').disabled = false;
  $('memtest-stop').disabled = true;
  RemoteHelper.stopmemtest(function () {
    MEMTEST.DEBUG.log = 'stopMemTest success.';
  }, null);
};

MEMTEST.previousTab = function() {
  if (this.tabPages !== null) {
    this.tabPages[this.tabIndex].hidden = true;
    this.tabIndex = (this.tabIndex - 1 + this.TAB_NUMBER) % this.TAB_NUMBER;
    this.tab.select(this.tabIndex);
    this.tabPages[this.tabIndex].hidden = false;

    NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  }
};

MEMTEST.nextTab = function() {
  if (this.tabPages !== null) {
    this.tabPages[this.tabIndex].hidden = true;
    this.tabIndex = (this.tabIndex + 1) % this.TAB_NUMBER;
    this.tab.select(this.tabIndex);
    this.tabPages[this.tabIndex].hidden = false;

    NavigationMap.initPanelNavigation('.focusable', 0, this.tabsId[this.tabIndex], false, this.element);
  }
};

function playEnded() {
  if (MEMTEST.autoTest) {
    dump('MEMTEST playEnded');
    MEMTEST.DEBUG.log = `Count: ${MEMTEST.autoTestCount}`;
    if (--MEMTEST.autoTestCount === 0) {
      MEMTEST.stopAutoPlay();
      return;
    } else {
      MEMTEST.timer = setTimeout(()=> {
          dump('MEMTEST video play');
          MEMTEST.video.play();
      }, MEMTEST.autoTestInterval);
    }
  }
}

window.addEventListener('keydown', MEMTEST.handleKeydown.bind(MEMTEST));
window.addEventListener('video-enumerated', function(e) {
  MEMTEST.updateVideoSelect();
});
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#memtest') {
    navigator.requestWakeLock('screen');
    MEMTEST.update();
  }
});

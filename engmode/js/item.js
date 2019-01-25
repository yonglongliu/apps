/* global App */
/* exported RemoteHelper */
/**
 * Base class of all function or test items
 */
'use strict';

const RemoteHelper = {
  // Talk to engmoded, a http server at 127.0.0.1:1380
  _engmodeURL: 'http://127.0.0.1:1380/engmode/?',

  sendYLOGCommand: function(cmd, success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
      'ylog_cli' + ' ' + encodeURIComponent(cmd);
    this.runXHRequest(params, success, failure);
  },

  clearNmealog: function sprd_deletenmealog(success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
      encodeURIComponent('rm /data/sgps_log/Nmealog.txt');
    this.runXHRequest(params, success, failure);
  },

  sendWCNDCommand: function(cmd, success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
      'wcnd_cli' + ' ' + encodeURIComponent(cmd);
    this.runXHRequest(params, success, failure);
  },

  sendBqbCommand: function (cmd ,success, failure) {
        var params = this._engmodeURL + 'cmd=socket' + '&socketcmd=' +
            encodeURIComponent(cmd);
        this.runXHRequest(params,success,failure);
  },

  // to get property via engmode
  getproperty: function sprd_getproperty(key, success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
        encodeURIComponent('getprop ' + key);
    this.runXHRequest(params, success, failure);
  },

  // to set property via engmode
  setproperty: function sprd_setproperty(key, value, success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
        encodeURIComponent('setprop ' + key + ' ' + value);
    this.runXHRequest(params, success, failure);
  },

  startmemtest: function sprd_startmemtest(params, success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=memtester ' +
      params + 'M -1 1';
    this.runXHRequest(params, success, failure);
  },

  stopmemtest: function sprd_stopmemtest(success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=stopmemtester';
    this.runXHRequest(params, success, failure);
  },

  startFlashTest: function sprd_startFlashTest(params, success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=flashtest ' + params;
    this.runXHRequest(params, success, failure);
  },

  stopFlashTest: function sprd_stopFlashTest(success, failure) {
    var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=stopflashtest';
    this.runXHRequest(params, success, failure);
  },

  // to get gnss config.xml via engmode
  getgnssproperty: function sprd_getgnssproperty(key, success, failure) {
    var params = this._engmodeURL + 'cmd=readxml' + '&key=' +
      key;
    this.runXHRequest(params, success, failure);
  },

  // to set gnss config.xml via engmode
  setgnssproperty: function sprd_setgnssproperty(key, value, success, failure) {
    var params = this._engmodeURL + 'cmd=writexml' + '&key=' +
      key + '&value=' + value;
    this.runXHRequest(params, success, failure);
  },

  // to send AT Command via engmode
  sendATCommand: function sprd_sendATCommand(atCommand, success, failure, channel) {
    if (channel !== 0 && channel !== 1) {
      channel = 0;
    }

    var params = this._engmodeURL + 'cmd=' + encodeURIComponent(atCommand) +
        '&sim=' + channel;
    this.runXHRequest(params, success, failure);
  },

  // to get phasecheck info
  showbinfile: function sprd_showbinfile(success, failure) {
    var params = this._engmodeURL + 'cmd=showbinfile&binfile=/dev/block/platform/sdio_emmc/by-name/miscdata';
    this.runXHRequest(params, success, failure);
  },

  // read some file
  readconf: function _readconf(path, success, failure) {
    var params = this._engmodeURL + 'cmd=shell&shellcommand=' + encodeURIComponent('cat ' + path);
    this.runXHRequest(params, success, failure);
  },

  // save some file
  saveFile: function _saveFile(path, content, success, failure) {
    var params = this._engmodeURL + 'cmd=shell&shellcommand='
                                  + encodeURIComponent('echo "' + content + '" > ' + path);
    this.runXHRequest(params, success, failure);
  },

  /**
   * The inner interface to communicate with Engmode service.
   *
   * @param params  The fully string encoded under different style.
   * @param success  Callback to be called when success.
   * @param failure  Callback to be called when error.
   */
  runXHRequest: function sprd_runXHRequest(params, success, failure) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', params, true);
    xhr.responseType = 'text';
    xhr.timeout = 3000;
    xhr.onload = function() {
      var value = xhr.response;
      success && success(value.trim());
    };
    xhr.onerror = function() {
      failure && failure();
    };
    xhr.ontimeout = function () {
      failure && failure();
    };
    xhr.send();
  },

  sendCommand: function (cmdQueue, onsuccess, onerror) {

    var params = this._engmodeURL + 'cmd=shell&shellcommand=' + encodeURIComponent(cmdQueue[0].cmd);
    console.log('send request ' + params);
    this.runXHRequest(
      params,
      (response) => {
        console.log('response ' + response);
        if (onsuccess) {
          onsuccess(cmdQueue, response);
        }
      },
      () => {
        if (onerror) {
          onerror(cmdQueue);
        }
      }
    );
  }
};

function Item() {
  // xxx
}

Item.prototype.init = function() {
  this.onInit();
};

Item.prototype.uninit = function() {
  this.onDeinit();
};

Item.prototype.handleKeydown = function(event) {
  var ret = this.onHandleKeydown(event);
  if (ret) {
    return;
  }

  if (event.key === 'EndCall' || event.key === 'Backspace') {
    event.stopPropagation();
    event.preventDefault();
    if (App.currentPanel !== '#root') {
      if (App.currentPanel === '#memtest') {
        if (MEMTEST.autoTest) {
          MEMTEST.stopAutoPlay();
        }
      }else if (App.currentPanel === '#flashtest') {
        if (FLASHTEST.autoTest) {
          FLASHTEST.stopAutoPlay();
        }
      }
      App.closeTest();
    }
  }
};

/*
 * Need inherit functions.
 */
Item.prototype.onInit = function() {
};

Item.prototype.onDeinit = function() {
};

Item.prototype.onHandleKeydown = function() {
  return false;
};

function cloneCommandArray(array) {
  var newArray = [];
  array.forEach((cmd) => {
    var newCmd = Object.assign({}, cmd);
    newArray.push(newCmd);
  });
  return newArray;
}

'use strict';
/* exported remoteHelper */

(function(exports) {
  // Talk to engmoded, a http server at 127.0.0.1:1380
  function RemoteHelper() {}

  RemoteHelper.prototype = {
    _engmodeURL: 'http://127.0.0.1:1380/engmode/?',

    sendSlogModemCommand: function(cmd, success, failure) {
      var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
        encodeURIComponent(cmd);
      this.runXHRequest(params, success, failure);
    },

    sendSHELLCommand: function(cmd, success, failure) {
      var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
        encodeURIComponent(cmd);
      this.runXHRequest(params, success, failure);
    },

    sendYLOGCommand: function(cmd, success, failure) {
      var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
        'ylog_cli' + ' ' + encodeURIComponent(cmd);
      this.runXHRequest(params, success, failure);
    },

    sendWCNDCommand: function(cmd, success, failure) {
      var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
        'wcnd_cli' + ' ' + encodeURIComponent(cmd);
      this.runXHRequest(params, success, failure);
    },

    // to get property via engmode
    getproperty: function(key, success, failure) {
      var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
          encodeURIComponent('getprop ' + key);
      this.runXHRequest(params, success, failure);
    },

    // to set property via engmode
    setproperty: function(key, value, success, failure) {
      var params = this._engmodeURL + 'cmd=shell' + '&shellcommand=' +
          encodeURIComponent('setprop ' + key + ' ' + value);
      this.runXHRequest(params, success, failure);
    },

    // to send AT Command via engmode
    sendATCommand: function(atCommand, success, failure) {
      var channel = 0;
      var params = this._engmodeURL + 'cmd=' + encodeURIComponent(atCommand) +
        '&sim=' + channel;
      this.runXHRequest(params, success, failure);
    },

    // to get phasecheck info
    showbinfile: function(success, failure) {
      var params = this._engmodeURL +
          'cmd=showbinfile&binfile=/dev/block/platform/sdio_emmc/by-name/miscdata';
      this.runXHRequest(params, success, failure);
    },

    // read some file
    readconf: function(path, success, failure) {
      var params = this._engmodeURL +
          'cmd=shell&shellcommand=' + encodeURIComponent('cat ' + path);
      this.runXHRequest(params, success, failure);
    },

    // save some file
    saveFile: function(path, content, success, failure) {
      var params = this._engmodeURL + 'cmd=shell&shellcommand='
        + encodeURIComponent('echo "' + content + '" > ' + path);
      this.runXHRequest(params, success, failure);
    },

    // read log states
    getLogStates: function(success, failure) {
      var params = this._engmodeURL + 'cmd=getlogstatus';
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
      xhr.onload = function() {
        var value = xhr.response;
        success && success(value.trim());
      };
      xhr.onerror = function() {
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

  exports.RemoteHelper = RemoteHelper;
}(window));

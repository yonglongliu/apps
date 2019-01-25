'use strict';

// Talk to engmoded, a http server at 127.0.0.1:1380
const RemoteHelper = {
  _engmodeURL: 'http://127.0.0.1:1380/engmode/?',

  // read some file
  readFile: function _readconf(path, success, failure) {
    var params = this._engmodeURL + 'cmd=shell&shellcommand=' + encodeURIComponent('cat ' + path);
    this.runXHRequest(params, success, failure);
  },

  // to get property via engmode
  getproperty: function _getproperty(key, success, failure) {
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



    // to send AT Command via engmode
  sendATCommand: function _sendATCommand(atCommand, success, failure) {
    dump('SPREADTRUM sendATCommand:' + atCommand);
    var channel = 0;
    var params = this._engmodeURL + 'cmd=' + encodeURIComponent(atCommand) +
        '&sim=' + channel;
    this.runXHRequest(params, success, failure);
  },

  // to get phasecheck info
  showbinfile: function _showbinfile(success, failure) {
    dump('SPREADTRUM showbinfile');
    // path is hardcoded, we should use some system prop to get it later
    var params = this._engmodeURL + 'cmd=showbinfile&binfile=/dev/block/platform/sdio_emmc/by-name/miscdata';
    this.runXHRequest(params, success, failure);
  },

  // save CPLC
  saveNfcCplc: function _saveNfcCplc(success, failure) {
    var params = this._engmodeURL + 'cmd=shell&shellcommand=' +
      encodeURIComponent('saveNfcCplc');
    this.runXHRequest(params, success, failure);
  },

  /*
   * Comments about writeAllTest, writeAllTestButFail, writeAllPass
   * CMD:   writephasecheck
   * type:  0 ---> means MMI is test or not; 1 --- means MMI is test pass or not;
   * value: type 0 + value 0 ---> MMI is test
   *        type 0 + value 1 ---> MMI is not test (if we want to reset default)
   *        type 1 + value 0 ---> MMI test all pass
   *        type 1 + value 1 ---> MMI test failed
   *
   * Usage: (type 0 + value 1) to reset default if necessary, show (NOT Test)
   *        (type 0 + value 0) + (type 1 + value 1) ---> all test but some one failed, show (Failed)
   *        (type 0 + value 0) + (type 1 + value 0) ---> all test and all pass, show (Pass)
   *
   * Which we can use this to reset trace file.
   * var params = this._engmodeURL + 'cmd=writephasecheck&type=0&station=MMI&value=1';
   */
  writeAllTest: function _writeAllTest(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=0&station=MMI&value=0';
    this.runXHRequest(params, success, failure);
  },

  writeAllTestButFail: function _writeAllTestButFail(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=1&station=MMI&value=1';
    this.runXHRequest(params, success, failure);
  },

  writeAllPass: function _writeAllPass(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=1&station=MMI&value=0';
    this.runXHRequest(params, success, failure);
  },

  writeAllNotTest: function _writeAllTest(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=0&station=MMI&value=1';
    this.runXHRequest(params, success, failure);
  },

  writeMMI2AllTest: function _writeAllTest(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=0&station=MMI2&value=0';
    this.runXHRequest(params, success, failure);
  },

  writeMMI2AllTestButFail: function _writeMMI2AllTestButFail(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=1&station=MMI2&value=1';
    this.runXHRequest(params, success, failure);
  },

  writeMMI2AllPass: function _writeMMI2AllPass(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=1&station=MMI2&value=0';
    this.runXHRequest(params, success, failure);
  },

  writeMMI2AllNotTest: function _writeMMI2AllTest(success, failure) {
    var params = this._engmodeURL + 'cmd=writephasecheck&type=0&station=MMI2&value=1';
    this.runXHRequest(params, success, failure);
  },

  /**
   * The inner interface to communicate with Engmode service.
   *
   * @param params  The fully string encoded under different style.
   * @param success  Callback to be called when success.
   * @param failure  Callback to be called when error.
   */
  runXHRequest: function _runXHRequest(params, success, failure) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', params, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
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

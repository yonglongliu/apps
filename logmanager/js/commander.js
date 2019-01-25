'use strict';

(function(exports){
  function printLog(msg) {
    if (DEBUG) {
      dump('<LogManagerAPP> ------: [commander.js] = ' + msg + '\n');
    }
  }
  function Commander(ip, port) {
    this._socket = undefined;
    this._ip = ip;
    this._port = port;
  }

  Commander.prototype.connect = function() {
    printLog(this._ip + ':' + this._port);
    this._socket = window.navigator.mozTCPSocket.open(this._ip, this._port);
    return this;
  };

  Commander.prototype.ondata = function(callback) {
    if (!this._socket) {
      return null;
    }
    this._socket.ondata = callback;
    return this;
  };

  Commander.prototype.onerror = function(callback) {
    if (!this._socket) {
      return null;
    }
    this._socket.onerror = callback;
    return this;
  };

  Commander.prototype.onopen = function(callback) {
    if (!this._socket) {
      return null;
    }
    this._socket.onopen = callback;
    return this;
  };

  Commander.prototype.onclose = function(callback) {
    if (!this._socket) {
      return null;
    }
    this._socket.onclose = callback;
    return this;
  };

  Commander.prototype.sendMessage = function(message, forced) {
    if (!this._socket) {
      printLog('client - Socket have not been initialized');
      return;
    }
    if (!message) {
      printLog('client - message is empty');
      return;
    }
    if (forced == undefined || forced == null) {
      forced = false;
    }
    //printLog('client - send message = ' + message);
    if (this.hasConnected() || forced) {
      printLog('client - send message = ' + message);
      this._socket.send(message);
    } else {
      printLog('client - connection has not established');
    }
  };

  Commander.prototype.disconnect = function() {
    if (!this._socket) {
      printLog('client - Socket have not been initialized');
      return;
    }
    this._socket.close();
    this._socket = null;
    printLog('client - socket' + this._port + 'has been closed');
  };

  Commander.prototype.hasConnected = function() {
    if (!this._socket) {
      printLog('client - Socket have not been initialized');
      return false;
    }
    printLog('this._socket.readyState = ' + this._socket.readyState);
    return this._socket.readyState === 'open';
  };

  exports.Commander = Commander;
}(window));

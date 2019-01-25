'use strict';

(function(exports) {
  function debug(s) {
    if (DEBUG) {
      dump('<LogManagerAPP> ------: [state.js] = ' + s + '\n');
    }
  }

  function States() {
    var _states = {
      'aplog': false,
      'tcpiplog': false,
      'bthcilog': false,

      'modemlog': false,
      'wcnlog': false,
      'gnsslog': false,
      'pcmlog': false,

      'caplog': false,

      'modemtopc': false
    };

    this.get = function(key) {
      debug('get states key=' + key + ' Retun value=' + _states[key]);
      return _states[key];
    };

    this.set = function(key, value) {
      debug('set states key=' + key + ' value=' + value);
      if (key in _states || typeof value === 'boolean') {
        _states[key] = value;

        EventSender.emit('statesUpdate');
      }
    };
  }
  exports.States = States;
}(window));

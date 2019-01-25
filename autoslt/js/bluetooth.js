/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: bluetooth.js
// * Description: autoslt -> test item: bluetooth test.
// * Note:
// ************************************************************************

'use strict';

function debug_bt(s) {
  // if (DEBUG) {
  console.log('daihai <autoslt> ------: [bluetooth.js] = ' + s + '\n');
  // }
}

// ------------------------------------------------------------------------
const DISCOVER_TIMER_DURATION = 30000;

function BtTest() {
  debug_bt('BtTest');

  this.bluetooth = navigator.mozBluetooth;
  debug_bt('bluetooth>'+this.bluetooth);

  this.discoverTimeout = null;
  this.foundDevice = false;
  this.found = 0;
  this.deviceNames = [];
  this.deviceMacs = [];

  this.bluetooth.addEventListener('attributechanged', (evt) => {
    for (var i in evt.attrs) {
    switch (evt.attrs[i]) {
      case 'defaultAdapter':
        debug_bt('bluetooth.addEventListener attributechanged');

        break;
      default:
        break;
    }
  }
});
};

BtTest.prototype.discoverTimeoutCallback = function() {
  this.discoverTimeout = null;
  this.stopDiscovery();
};

BtTest.prototype.startDiscovery = function() {

  if (!this.bluetooth.defaultAdapter) {
    debug_bt('bt defaultAdapter is null');
    return;
  }

  this.bluetooth.defaultAdapter.startDiscovery().then((handle) => {
    if (!this.discoverTimeout) {
    this.discoverTimeout = setTimeout(
      this.discoverTimeoutCallback.bind(this), DISCOVER_TIMER_DURATION);
  }
  handle.ondevicefound = this.onDeviceFound.bind(this);
  debug_bt('bt startDiscovery success');

}, (reason) => {
    debug_bt('bt startDiscovery error');
    this.stopDiscovery();

  });

};

BtTest.prototype.scanDevice = function(deviceMac) {
  debug_bt('scanDevice with mac '+deviceMac);
  var rssi = '';
  for (var index in this.deviceMacs){
    debug_bt('scanDevice index mac '+this.deviceMacs[index]);

    if (deviceMac === this.deviceMacs[index]){
      rssi = this.deviceNames[index];

      debug_bt('scanDevice index mac with rssi '+rssi);

      if (rssi === ''){
        rssi = 'test';
      }
      break;
    }
  }
  return rssi;
};

BtTest.prototype.stopDiscovery = function() {
  if (!this.bluetooth.defaultAdapter) {
    return Promise.resolve('default adapter is not existed!!');
  }

  if (this.discoverTimeout) {
    clearTimeout(this.discoverTimeout);
  }
  this.discoverTimeout = null;

  return this.bluetooth.defaultAdapter.stopDiscovery().then(() => {

  }, (reason) => {
    debug_bt('stopDiscovery(): stopDiscovery failed: reason = ' + reason);
    return Promise.resolve(reason);
  });
};

// ---- onDeviceFound
BtTest.prototype.onDeviceFound = function(evt) {
  this.foundDevice = true;
  this.deviceNames[this.found] = evt.device.name;
  this.deviceMacs[this.found] = evt.device.address;

  this.found ++;

  debug_bt('device name:'+evt.device.name);
  debug_bt('device address:'+evt.device.address);

};

BtTest.prototype.openBT = function() {
  if (!this.bluetooth.defaultAdapter) {
    debug_bt('defaultAdapter is null');
    return Promise.resolve('error');
  }
  debug_bt('bt status :'+this.bluetooth.defaultAdapter.state);

  this.deviceNames = [];
  this.deviceMacs = [];

  if (this.bluetooth.defaultAdapter.state === 'enabled') {
    debug_bt('bt had opened>');
    this.startDiscovery();
    return Promise.resolve('ok');
  } else {
    var self = this;
    return new Promise(function(resolve) {
      this.bluetooth.defaultAdapter.enable().then(() => {
        self.startDiscovery();
      resolve('ok');
    }, (reason) => {
        debug_bt('setEnabled(): set enable failed: reason = ' + reason);
        resolve('error');
      });
    }.bind(this));
  }
};


BtTest.prototype.closeBT = function() {
  debug_bt('closeBT>');

  this.discoverTimeout = null;
  this.foundDevice = false;
  this.found = 0;
  this.deviceNames = [];
  this.deviceMacs = [];

  if (!this.bluetooth.defaultAdapter) {
    debug_bt('defaultAdapter is null');
    return Promise.resolve('error');
  }

  debug_bt('bt status :'+this.bluetooth.defaultAdapter.state);

  if (this.bluetooth.defaultAdapter.state === 'disabled') {
    debug_bt('bt had closed');
    return Promise.resolve('ok');
  } else {
    return new Promise(function(resolve) {
      this.bluetooth.defaultAdapter.disable().then(() => {
        resolve('ok');
    }, (reason) => {
        debug_bt('setEnabled(): set enable failed: reason = ' + reason);
        resolve('error');
      });
    }.bind(this));
  }
};


/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: wifi.js
// * Description: autoslt -> test item: wifi test.
// * Note:
// ************************************************************************

'use strict';

function debug_wifi(s) {
  console.log('daihai <autoslt> ------: [wifi.js] = ' + s + '\n');
}

var wifiEnabled = false;
const gWifiManager = navigator.mozWifiManager;

// ------------------------------------------------------------------------


function WifiTest() {
  debug_wifi('WifiTest');

  var settings = window.navigator.mozSettings;

  var req = settings.createLock().get('wifi.enabled');
  req.onsuccess = function wf_getStatusSuccess() {
    var enabled = req.result['wifi.enabled'];
    wifiEnabled = enabled;
    debug_wifi('current wifi.enabled is '+enabled);
  };

  // gWifiManager.onstatuschange = function(event) {
  //   var networkStatus = event ? event.status : gWifiManager.connection.status;
  //   debug_wifi('gWifiManager.onstatuschange networkStatus:'+networkStatus);
  //
  //   // switch (networkStatus) {
  //   //   case 'dhcpfailed':
  //   //     break;
  //   //   case 'authenticationfailed':
  //   //
  //   //     break;
  //   //   case 'associationreject':
  //   //
  //   //     break;
  //   //   default:
  //   //     break;
  //   // }
  // };

};

WifiTest.prototype.openWifi = function () {
  var settings = window.navigator.mozSettings;

  return new Promise(function(resolve) {
    var req = settings.createLock().set({'wifi.enabled': true});
    req.onsuccess = function wf_getStatusSuccess() {
      debug_wifi('open wifi success ');
      wifiEnabled = true;
      resolve('ok');
    };
    req.onerror = function wf_getStatusError() {
      debug_wifi('open wifi fail');
      if (wifiEnabled) {
        resolve('ok');
      }else {
        resolve('error');
      }
    };
  }.bind(this));

};

WifiTest.prototype.closeWifi = function () {
  var settings = window.navigator.mozSettings;

  return new Promise(function(resolve) {
    var req = settings.createLock().set({'wifi.enabled': false});
    req.onsuccess = function wf_getStatusSuccess() {
      debug_wifi('close wifi sucess ');
      wifiEnabled = false;
      resolve('ok');
    };
    req.onerror = function wf_getStatusError() {
      debug_wifi('close wifi sucess ');
      if (!wifiEnabled) {
        resolve('ok');
      }else {
        resolve('error');
      }
    };
  }.bind(this));

};

WifiTest.prototype.getWifiApInfo = function (apSsid) {
  debug_wifi('getWifiApInfo with ssid:'+apSsid);
  if (!gWifiManager.enabled) {
    debug_wifi('getWifiApInfo wifi is closed');
    return 'error';
  }

  var wifiConnection = gWifiManager.connection;
  if (!wifiConnection){
    debug_wifi('getWifiApInfo wifiConnection is null');
    return 'fail';
  }

  var currentNetwork = wifiConnection.network;
  if (!currentNetwork) {
    debug_wifi('getWifiApInfo currentNetwork is null');
    return 'fail';
  }

  if (currentNetwork.ssid === apSsid) {
    debug_wifi('getWifiApInfo success');

    return 'ok';
  }else {
    debug_wifi('getWifiApInfo currentNetwork.ssid is '+apSsid);
    return 'fail';
  }
};


WifiTest.prototype.scanWifi = function (scanSsid) {
  if (!wifiEnabled) {
    return Promise.resolve('fail');
  }

  var i = 0;
  var network;

  var req = gWifiManager.getNetworks();

  req.onsuccess = function onScanSuccess() {
    // clear list again for showing scaning result.

    var allNetworks = req.result;
    var networks = {};
    for (i = 0; i < allNetworks.length; ++i) {
      network = allNetworks[i];
      // use ssid + capabilities as a composited key
      var key = network.ssid + '+' + network.capabilities.join('+');
      // keep connected network first, or select the highest strength
      if (!networks[key] || network.connected) {
        networks[key] = network;
      } else {
        if (!networks[key].connected &&
          network.relSignalStrength > networks[key].relSignalStrength)
          networks[key] = network;
      }
    }

    //  var networks = req.result;
    var ssids = Object.getOwnPropertyNames(networks);
    debug_wifi('wifi: network ssids.length: ' + ssids.length);
    if (ssids.length) {
      ssids.sort(function(a, b) {
        return networks[b].relSignalStrength - networks[a].relSignalStrength;
      });
    }

    // add detected networks
    for (i = 0; i < ssids.length; i++) {
      network = networks[ssids[i]];
      if (network === undefined || network.ssid === undefined) {
        continue;
      }
      if (i >= 7) { // don't make the list too long.
        break;
      }
      var listItem = newListItem(network);
      list.appendChild(listItem);
    }

    if (ssids.length === 0) {
    }
  };

  req.onerror = function onScanError() {

  };
};

WifiTest.prototype.connectWifi = function (ssid,password) {
  debug_wifi('connectWifi');
  if (!wifiEnabled) {
    debug_wifi('connectWifi wifi is closed');
    return Promise.resolve('error');
  }

  if (gWifiManager.connection && gWifiManager.connection.network && gWifiManager.connection.network.ssid === ssid){
    debug_wifi('connectWifi current wifi had connected with '+ssid);
    return Promise.resolve('ok');
  }

  return new Promise(function(resolve) {
    var searchNetwork = null;
    var req = gWifiManager.getNetworks();
    req.onsuccess = function () {
      // clear list again for showing scaning result.

      var allNetworks = req.result;

      debug_wifi('getNetworks success,allNetworks.length'+allNetworks.length);

      for (var i = 0; i < allNetworks.length; ++i) {
        var network = allNetworks[i];
        debug_wifi('network ssid:'+network.ssid);

        if (network.ssid === ssid){
          debug_wifi('get current ssid network:'+ssid);
          searchNetwork = network;
          break;
        }
      }
      if (searchNetwork){
        var key = WifiTest.GetKeyManagement(searchNetwork);
        debug_wifi('searchNetwork.security:'+key);

        switch (key) {
          case 'WEP':
          case 'WPA-PSK':
          case 'WPA-EAP':
          case 'WPA2-PSK':
          case 'WPA/WPA2-PSK':
            debug_wifi('searchNetwork.security password:'+password);
            searchNetwork.psk = password;
            searchNetwork.keyManagement = key;
            break;
          case 'WAPI-PSK':
          case 'WAPI-CERT':
            break;
        }

        var request = gWifiManager.associate(searchNetwork);

        var done = function() {

          if (!request.error) {
            debug_wifi('connectWifi associate success with '+ssid);
            var connectSuccess = false;
            gWifiManager.onstatuschange = function onStatuschange() {
              debug_wifi('gWifiManager.onstatuschange networkStatus:'+gWifiManager.connection.status);
              switch (gWifiManager.connection.status) {
                case 'authenticationfailed':
                  resolve('fail');
                  break;
                case 'connected':
                  connectSuccess = true;
                  resolve('ok');
                  break;
              }
            };

            setTimeout(function() {
              if (!connectSuccess) {
                resolve('fail');
              }
            }, 8000);
          }else {
            debug_wifi('connectWifi fail :'+request.error);
            resolve('fail');
          }
        };
        request.onsuccess = done;
        request.onerror = done;

      }else {
        debug_wifi('connectWifi not get '+ssid+' wifi');
        resolve('fail');
      }

    };

    req.onerror = function () {
      debug_wifi('getNetworks error');
      resolve('error');
    };

  }.bind(this));

};

WifiTest.GetKeyManagement = function getKeyManagement(network) {

  var sec = network.security;
  var key = sec[0];
  if (/WEP$/.test(key)) {
    return 'WEP';
  }
  if (/WAPI-PSK$/.test(key)) {
    return 'WAPI-PSK';
  }
  if (/PSK$/.test(key)) {
    return 'WPA-PSK';
  }
  if (/WPA2-PSK$/.test(key)) {
    return 'WPA2-PSK';
  }
  if (/WPA\/WPA2-PSK$/.test(key)) {
    return 'WPA/WPA2-PSK';
  }
  if (/EAP$/.test(key)) {
    return 'WPA-EAP';
  }
  if (/WAPI-CERT$/.test(key)) {
    return 'WAPI-CERT';
  }
  return '';
};

WifiTest.NetworkList = function networkList(list) {
  var self = this;
  var scanning = false;

  function newListItem(network) {
    // ssid
    var li = document.createElement('li');
    // signal is between 0 and 100
    li.textContent = '"' + network.ssid + '" -' + network.relSignalStrength;

    return li;
  }

  // scan wifi networks and display them in the list
  function scan() {
    var i = 0;
    var network;
    if (scanning) {
      return;
    }

    // stop auto-scanning if wifi disabled or the app is hidden
    if (!gWifiManager.enabled || document.mozHidden) {
      scanning = false;
      return;
    }

    scanning = true;
    var req = gWifiManager.getNetworks();

    req.onsuccess = function onScanSuccess() {
      // clear list again for showing scaning result.
      clear(false);

      var allNetworks = req.result;
      var networks = {};
      for (i = 0; i < allNetworks.length; ++i) {
        network = allNetworks[i];
        // use ssid + capabilities as a composited key
        var key = network.ssid + '+' + network.capabilities.join('+');
        // keep connected network first, or select the highest strength
        if (!networks[key] || network.connected) {
          networks[key] = network;
        } else {
          if (!networks[key].connected &&
            network.relSignalStrength > networks[key].relSignalStrength)
            networks[key] = network;
        }
      }

      //  var networks = req.result;
      var ssids = Object.getOwnPropertyNames(networks);
      debug_wifi('wifi: network ssids.length: ' + ssids.length);
      if (ssids.length) {
        ssids.sort(function(a, b) {
          return networks[b].relSignalStrength - networks[a].relSignalStrength;
        });
      }

      // add detected networks
      for (i = 0; i < ssids.length; i++) {
        network = networks[ssids[i]];
        if (network === undefined || network.ssid === undefined) {
          continue;
        }
        if (i >= 7) { // don't make the list too long.
          break;
        }
        var listItem = newListItem(network);
        list.appendChild(listItem);
      }

      if (ssids.length === 0) {
      } else {
        self.autoPass(1000);
      }
      scanning = false;
    };

    req.onerror = function onScanError() {
      // always try again.
      scanning = false;
      window.setTimeout(scan, 5000);
    };
  }

  return {
    clear: clear,
    scan: scan,
    get scanning() {
      return scanning;
    }
  };
};
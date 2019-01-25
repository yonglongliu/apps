'use strict';

const DEBUG = true;

window.onload = function() {
  window.wifiReset = false;
  window.navigator.jrdExtension.setPropertyLE('engmoded', 'enable');

  // Will communicate with wcnd, that need wifi settings config enable.
//  let _settingsLock = navigator.mozSettings.createLock();
//  let req = _settingsLock.get('wifi.enabled');
//  req.onsuccess = () => {
//    if (!req.result['wifi.enabled']) {
//      _settingsLock.set({'wifi.enabled': true});
//      window.wifiReset = true;
//    }
//  };

  // 3s delay for engmoded process init OK and can response requests
  // TODO: need add a flash screen here.
  setTimeout(() => {
    LazyLoader.load('js/remote_helper.js', () => {
      window.remoteHelper = new RemoteHelper();
    });

    LazyLoader.load('js/commander.js', () => {
      // window.slogCommander = new Commander(IP_ADDRESS, SLOG_PORT).connect();
      // window.ylogCommander = new Commander(IP_ADDRESS, YLOG_PORT).connect();
      // window.modemdCommander = new Commander(IP_ADDRESS, MODEMD_PORT).connect();
      // window.wcndCommander = new Commander(IP_ADDRESS, WCND_PORT).connect();
    });

    LazyLoader.load('js/states.js', () => {
      window.states = new States();
    });

    LazyLoader.load('js/native.js', () => {
      Native.init();
    });

    LazyLoader.load('js/view_log_settings.js', () => {
      window.viewLogSettings = new ViewLogSettings();
      window.viewLogSettings.init();
    });

    LazyLoader.load('js/view_log_settings_ap.js', () => {
      window.viewLogSettingsAp = new ViewLogSettingsAp();
      window.viewLogSettingsAp.init();
    });

    LazyLoader.load('js/view_log_settings_modem.js', () => {
      window.viewLogSettingsModem = new ViewLogSettingsModem();
      window.viewLogSettingsModem.init();
    });

    LazyLoader.load('js/adb_debug_setting.js',() => {
      window.adbDebugSetting = new AdbDebugSetting();
      window.adbDebugSetting.init();
    });

    LazyLoader.load('js/app.js', () => {
      window.app = new App();
      window.app.start();
    });
  }, 3000);
};

window.addEventListener('beforeunload', () => {
  window.navigator.jrdExtension.setPropertyLE('engmoded', 'disable');
//  if (window.wifiReset) {
//    navigator.mozSettings.createLock().set({'wifi.enabled': false});
//  }

  // slogCommander && slogCommander.disconnect();
  // ylogCommander && ylogCommander.disconnect();
  // wcndCommander && wcndCommander.disconnect();
  // modemdCommander && modemdCommander.disconnect();
});

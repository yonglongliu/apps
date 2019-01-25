/* global Item, RemoteHelper */

'use strict';
const MODEM_VERSION_CMD = 'AT+CGMR';
const GSM_DSP_VERSION_CMD = 'AT+SPDSPVERSION=0';
const TD_DSP_VERSION_CMD =  'AT+SPDSPVERSION=1';
const WCDMA_DSP_VERSION_CMD = 'AT+SPDSPVERSION=2';
const LTE_DSP_VERSION_CMD = 'AT+SPDSPVERSION=3';
const GSP_CONF_PATH = '/data/gnss/config/config.xml';

var VersionInfo = new Item();
VersionInfo.update = function() {
  this.navContainer = document.getElementById('version-info-result');
  this.navContainer.focus();
  this.navContainer.addEventListener('keydown', this.scrollPage.bind(this));

  this.apVersion = document.getElementById('ap-version');
  this.modemVersion = document.getElementById('modem-version');
  this.psVerion = document.getElementById('ps-version');
  this.gsmDspVerion = document.getElementById('gsm-dsp-version');
  this.tdDspVersion = document.getElementById('td-dsp-version');
  this.wcdmaDspVersion = document.getElementById('wcdma-dsp-version');
  this.lteDspVersion = document.getElementById('lte-dsp-version');
  this.cp2Version = document.getElementById('cp2-version');
  this.gpsVersion = document.getElementById('gps-version');

  this.getVersions();
};

VersionInfo.onHandleKeydown = function() {
  return false;
};

VersionInfo.getVersions = function() {
  // AP version
  RemoteHelper.getproperty('ro.build.display.id', (response) => {
    this.apVersion.textContent = response;
  });

  // Modem version
  RemoteHelper.sendATCommand(MODEM_VERSION_CMD, (response) => {
    this.modemVersion.textContent = this.formatInfo(response, 'modem');
  });

  // PS version
  RemoteHelper.sendATCommand(MODEM_VERSION_CMD, (response) => {
    this.psVerion.textContent = this.formatInfo(response, 'ps');
  });

  // GSM DSP version
  RemoteHelper.sendATCommand(GSM_DSP_VERSION_CMD, (response) => {
    this.gsmDspVerion.textContent = this.formatInfo(response, 'dsp');
  });

  // TD DSP version
  RemoteHelper.sendATCommand(TD_DSP_VERSION_CMD, (response) => {
    this.tdDspVersion.textContent = this.formatInfo(response, 'dsp');
  });

  // WCDMA DSP version
  setTimeout(() => {
    RemoteHelper.sendATCommand(WCDMA_DSP_VERSION_CMD, (response) => {
      this.wcdmaDspVersion.textContent = this.formatInfo(response, 'dsp');
    }, () => {}, 0);
  }, 2000);

  // LTE DSP version
  RemoteHelper.sendATCommand(LTE_DSP_VERSION_CMD, (response) => {
    this.lteDspVersion.textContent = this.formatInfo(response, 'dsp');
  });

  // GPS version
  RemoteHelper.readconf(GSP_CONF_PATH, (response) => {
    this.gpsVersion.textContent = this.formatInfo(response, 'gps');
  });
};

VersionInfo.formatInfo = function(response, format) {
  var result = '';
  switch (format) {
    case 'modem':
      response = response.replace(/OK/g,'');
      var array = response.split('\n');
      array.forEach(function(str) {
        if (str.indexOf('Platform Version') !== -1) {
          result = str.split(':')[1];
        }
      });
      break;

    case 'ps':
      response = response.replace(/OK/g,'');
      var array = response.split('\n');
      array.forEach(function(str) {
        if (str.indexOf('BASE  Version') !== -1) {
          result = str.split(':')[1];
        }
      });
      break;

    case 'dsp':
      response = response.replace(/OK/g,'');
      if (response.indexOf('SPDSPVERSION') !== -1) {
        result = response.split(',')[1];
      } else {
        result = 'xxx';
      }
      break;

    case 'gps':
      response = response.replace(/OK/g,'');
      var array = response.split('\n');
      array.forEach(function(str) {
        if (str.indexOf('GE2-VERSION') !== -1) {
          var substr = str.split('"');
          var len = substr.length;
          result = str.split('"')[len - 2];
        }
      });
      break;

    default:
      break;
  }

  return result;
};

VersionInfo.scrollPage = function(evt) {
  var result = document.getElementById('version-info-result');
  var handled = false;
  if (evt.key === 'ArrowUp') {
    result.scrollTop -= 60;
    handled = true;
  } else if (evt.key === 'ArrowDown') {
    result.scrollTop += 60;
    handled = true;
  }

  if (handled && App.currentPanel === '#version-info') {
    evt.preventDefault();
    evt.stopPropagation();
  }
};

window.addEventListener('keydown', VersionInfo.handleKeydown.bind(VersionInfo));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#version-info') {
    VersionInfo.update();
  }
});

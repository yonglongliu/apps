/* global Item, RemoteHelper */

/**
 *  Show version information of phone
 */
'use strict';
const FPLMN_MAX = 4;
const USIM_CMD = 'AT+CRSM=192,28539,0,0,15,0,\"3F007FFF\"';
const ENG_RPLMN_USIM = 'AT+CRSM=176,28539,0,0,12,\"3F007F20\"';
const ENG_RPLMN_SIM = 'AT+CRSM=176,28539,0,0,24,0,\"3F007FFF\"';

var ForbidPLMN = new Item();
ForbidPLMN.update = function() {
  this.content = document.getElementById('forbid-plmn-content');
  this.getFbdPlmn();
};

ForbidPLMN.getFbdPlmn = function() {
  function checkUsim(simIndex) {
    RemoteHelper.sendATCommand(USIM_CMD, (response) => {
      var array = response.split(',');
      if ('0000' == array[2].substr(0, 4)) {
        isUsim(simIndex);
      } else {
        notUsim(simIndex);
      }
    }, () => {});
  }

  function isUsim(simIndex) {
    RemoteHelper.sendATCommand(ENG_RPLMN_USIM, (result) => {
      ForbidPLMN.content.innerHTML = ForbidPLMN.formatInfo(simIndex, result);
    }, () => {
    });
  }

  function notUsim(simIndex) {
    RemoteHelper.sendATCommand(ENG_RPLMN_SIM, (result) => {
      ForbidPLMN.content.innerHTML = ForbidPLMN.formatInfo(simIndex, result);
    }, () => {
    });
  }

  var settings = navigator.mozSettings,
    mobileConnections = navigator.mozMobileConnections,
    dataSlotId = 0;
  var req = settings &&
      settings.createLock().get('ril.data.defaultServiceId');

  req.onsuccess = () => {
    dataSlotId = req.result['ril.data.defaultServiceId'] || 0;
    for (var i = 0; i < mobileConnections.length; i++) {
      if (mobileConnections[i]) {
        var iccId = mobileConnections[i].iccId || null;
        if (!iccId) {
          console.log('loadDataSIMIccId : The slot ' + dataSlotId +
              ', configured as the data slot, is empty');
        } else {
          checkUsim(i);
        }
      }
    }
  };

  req.onerror = () => {
    console.warn('ril.data.defaultServiceId does not exists');
    console.error('No SIM in the device');
  };
};

ForbidPLMN.formatInfo = function(simIndex, atRSP) {
  var infoPasered = '';
  infoPasered += '<br>SIM' + (simIndex + 1) + ':<br>';
  if (atRSP.indexOf('OK') > -1) {
    var str = atRSP.split(',');
    for (var i = 0; i < FPLMN_MAX; i++) {
      var start = i * 6;
      if ('F' != str[2].substr(start + 1, 1)) {
        infoPasered += 'MCC:';
        infoPasered += str[2].substr(start + 1, 1);
        infoPasered += str[2].substr(start + 0, 1);
        infoPasered += str[2].substr(start + 3, 1);
        infoPasered += ' ';
        infoPasered += 'MNC:';
        if ('F' != str[2].substr(start + 2, 1)) {
          infoPasered += str[2].substr(start + 2, 1);
        }
        infoPasered += str[2].substr(start + 5, 1);
        infoPasered += str[2].substr(start + 4, 1);
        infoPasered += '<br>';
      }
    }
    return infoPasered;
  } else {
    return 'Error string';
  }
};


window.addEventListener('keydown', ForbidPLMN.handleKeydown.bind(ForbidPLMN));
window.addEventListener('panelready', function(e) {
  if (e.detail.current === '#forbid-plmn') {
    ForbidPLMN.update();
  }
});
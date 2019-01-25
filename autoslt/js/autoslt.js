/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: autoslt.js
// * Description: autoslt -> main page.
// * Note: has auto and manu parts.
// ************************************************************************

/* exported DEBUG */
'use strict';

const DEBUG = true;
var _pcTestCommander = new Commander(IP_ADDRESS, AUTOSLT_PORT);
var currentTest = '';

var AutoSlt = {
  enterResult: function AutoSlt_enterResult() {
    console.log('daihai>>_pcTestCommander.getCurrentCmd()>'+_pcTestCommander.getCurrentCmd());
    if (_pcTestCommander.getCurrentCmd() !== CMD_KEY_RESULT){
      window.location = './tests/get_result.html';
    }
  },

  enterManuTest: function AutoSlt_enterManuTest() {
    if (_pcTestCommander.getCurrentCmd() === CMD_KEY_RESULT){
      return;
    }
    let activity = new MozActivity({
      name: 'mmitest'
    });
    activity.onerror = () => {
      console.warn('daihai Could not launch mmitest');
    };
  },

  testForDeatil: function AutoSlt_testForDeatil(html) {
    currentTest = html;
    this.openTest('./tests/'+html);
  },


  get resultButton() {
    return document.getElementById('resultButton');
  },

  get manuButton() {
    return document.getElementById('manuButton');
  },

  get resetButton() {
    return document.getElementById('resetButton');
  },

  get contentView() {
    return document.getElementById('contentView');
  },

  get snLabel() {
    return document.getElementById('SN');
  },

  get mainPanel() {
    return document.getElementById('main-panel');
  },

  get testPanel() {
    return document.getElementById('test-panel');
  },

  get iframe() {
    return document.getElementById('test-iframe');
  },

  openTest: function ut_openTest(name) {
    this.testPanel.classList.remove('hidden');
    this.mainPanel.classList.add('hidden');
    this.iframe.src = name + '.html';
    this.iframe.focus();
  },

  closeTest: function ut_closeTest() {
    this.testPanel.classList.add('hidden');
    this.mainPanel.classList.remove('hidden');
    this.iframe.src = '';
    this.contentView.focus();

  },

  init: function AutoSlt_init() {
    this.contentView.scrollTop = 0;
    setTimeout(() => {
      this.resultButton.disabled = '';
      this.manuButton.disabled = '';
      this.resultButton.addEventListener('click', this);
      this.manuButton.addEventListener('click', this);
      this.resetButton.addEventListener('click', this);


      this.loadView();

      _pcTestCommander.mockServer(AUTOSLT_PORT);

      navigator.mozSettings.createLock().get('debugger.remote-mode').then((result) => {
        console.log('daihai current debugger.remote-mode is '+result['debugger.remote-mode']);
        if (result['debugger.remote-mode'] === 'disabled') {
          if (window.confirm("You have no permission use ADB, you can open the debugger mode.")) {
            navigator.mozSettings.createLock().set({'debugger.remote-mode': 'adb-devtools'});
          }
        }
      });

      this.getResultList();
    }, 2500);

    // Dont let the phone go to sleep while in AutoSlt.
    // user must manually close it
    if (navigator.requestWakeLock) {
      navigator.requestWakeLock('screen');
    }

    // We will enable the NFC in the testing script file,
    // so we need to disable the NFC first.
    if (navigator.mozNfc && navigator.mozNfc.enabled) {
      navigator.mozSettings.createLock().set({'nfc.enabled': false});
    }

    // Disable airplaneMode in AutoSlt to avoid fm test init fail
    navigator.mozSettings.createLock().set({'airplaneMode.enabled': false});

    window.addEventListener('keydown', AutoSlt.handleKeydown.bind(AutoSlt));
  },

  loadView: function AutoSlt_loadView() {
    RemoteHelper.showbinfile((response) => {
      this.showbinfileView(response);
      this.setStation();
    }, () => {
      console.log('daihai>autoslt>info>failed');
      this.loadView();
    });
  },

  showbinfileView: function AutoSlt_showbinfileView(response) {
    var qrcode = new QRCode(document.getElementById("qrcode"), {
      width: 80, //设置宽高
      height: 80
    });

    var sn1;
    var sn2;
    var antenna;
    response = response.replace(/OK/g, '');
    console.log('autoslt>showbinfile response:' + response);

    var array = response.split('\n');

    for (var key in array) {

      if (array[key] === 'SN1:') {
        var index = parseInt(key) + 1;

        sn1 = array[index];
        sn1 = sn1.replace(/[^0-9a-zA-Z]/ig, '');
        console.log('SN1>>>' + sn1);

      } else if (array[key] === 'SN2:') {
        var index = parseInt(key) + 1;
        sn2 = array[index];
        sn2 = sn2.replace(/[^0-9a-zA-Z]/ig, '');
        console.log('SN2>>>' + sn2);

      } else if (array[key].indexOf('ANT') !== -1) {
        antenna = array[key];
        antenna = antenna.replace(/[^0-9a-zA-Z]/ig, '');
        antenna = antenna.slice(3);
        console.log('ant>' + antenna);

      } else if (array[key].indexOf('ANTENNA') !== -1) {
        antenna = array[key];
        antenna = antenna.replace(/[^0-9a-zA-Z]/ig, '');
        antenna = antenna.slice(7);
        console.log('antenna>' + antenna);
      }
    }
    commander_device_sn = sn1 + sn2;
    this.snLabel.innerText = 'SN:' + commander_device_sn;
    qrcode.makeCode(commander_device_sn);

    if (antenna) {
      var antennaEle = document.getElementById('Antenna_ID');
      antenna = antenna.toLowerCase();
      console.log('antenna>result>' + antenna);

      if (antenna === 'nottest') {
        antennaEle.innerText = 'NT';
      } else if (antenna === 'pass') {
        antennaEle.innerText = 'PASS';
      } else if (antenna === 'fail') {
        antennaEle.innerText = 'FAIL';
      }
    }
  },

  setStation: function AutoSlt_setStation() {
    asyncStorage.getItem(RECORD_HISTORY, (value) => {
      printLog(' asyncStorage.getItem RECORD_HISTORY:'+value);
    if(value) {
      var resultDic = JSON.parse(value);
      var dicMMI = resultDic['MMI'];
      var dicVision = resultDic['Vision'];
      var dicAudio = resultDic['Audio'];
      var dicWCN = resultDic['WCN'];

      var mmiELement = document.getElementById('MMI_ID');
      if (dicMMI) {
        mmiELement.innerText = dicMMI.result;
      }
      var visionELement = document.getElementById('Vision_ID');
      if (dicVision) {
        visionELement.innerText = dicVision.result;
      }
      var audioELement = document.getElementById('Audio_ID');
      if (dicAudio) {
        audioELement.innerText = dicAudio.result;
      }
      var wcnELement = document.getElementById('WCN_ID');
      if (dicWCN) {
        wcnELement.innerText = dicWCN.result;
      }

      var allResult = document.getElementById('allResult');
      var antennaELement = document.getElementById('Antenna_ID');

      mmiELement.removeAttribute('class');
      mmiELement.setAttribute('class','result'+mmiELement.innerText);

      visionELement.removeAttribute('class');
      visionELement.setAttribute('class','result'+visionELement.innerText);

      audioELement.removeAttribute('class');
      audioELement.setAttribute('class','result'+audioELement.innerText);

      antennaELement.removeAttribute('class');
      antennaELement.setAttribute('class','result'+antennaELement.innerText);

      wcnELement.removeAttribute('class');
      wcnELement.setAttribute('class','result'+wcnELement.innerText);

      if (mmiELement.innerText === 'FAIL' ||
        visionELement.innerText === 'FAIL' ||
        audioELement.innerText === 'FAIL' ||
        antennaELement.innerText === 'FAIL' ||
        wcnELement.innerText === 'FAIL') {
        if (allResult) {
          allResult.removeAttribute('class');
          allResult.setAttribute('class','resultFAIL');
          allResult.innerText = 'FAIL';
        }
      }else if (mmiELement.innerText === 'PASS' &&
        visionELement.innerText === 'PASS' &&
        audioELement.innerText === 'PASS' &&
        antennaELement.innerText === 'PASS' &&
        wcnELement.innerText === 'PASS') {
        allResult.removeAttribute('class');
        allResult.setAttribute('class','resultPASS');
        allResult.innerText = 'PASS';
      }else if (mmiELement.innerText === 'NT' &&
        visionELement.innerText === 'NT' &&
        audioELement.innerText === 'NT' &&
        antennaELement.innerText === 'NT' &&
        wcnELement.innerText === 'NT') {
        allResult.removeAttribute('class');
        allResult.setAttribute('class','resultNT');
        allResult.innerText = 'NT';
      }else {
        allResult.removeAttribute('class');
        allResult.setAttribute('class','resultGOYellow');
        allResult.innerText = 'GO';
      }
    }
  });
  },

  getResultList: function AutoSlt_geResultList() {
    console.log('daihai>>>getResultList');

    asyncStorage.getItem(AUTOSLT_RESULT, (value) => {
      if (value){
        var noteELement = document.getElementById('note');

        var noteTip = '';
        var resultList = JSON.parse(value);
        for (var key in resultList){
          var value = resultList[key];
          if (value.result === 'FAIL'){
            noteTip = noteTip+value.note+'    ';
          }
        }
        noteELement.innerText = noteTip;
      }
    });
  },

  handleEvent: function AutoSlt_handleEvent(evt) {
    console.log('daihai>>>evt.type:'+evt.type);
    switch (evt.type) {
      case 'click':

        switch (evt.target) {
          case this.resultButton:
            this.enterResult();
            break;

          case this.manuButton:
            this.enterManuTest();
            break;

          case this.resetButton:
            if (window.confirm("Are you sure reset your phone ?")) {
              this.factoryReset()
            }
            break;
        }
        break;
    }
  },

  dispatchEvent: function AutoSlt_dispatchEvent(name,status) {
    dump('daihai>>dispatchEvent>');
    var event = new CustomEvent(name, {
      detail: {
        status:status
      }
    });
    window.dispatchEvent(event);
  },
  /**
   * call mozPower API to reset device
   *
   * @access private
   * @memberOf FactoryReset.prototype
   */
  factoryReset: function AutoSlt_factoryReset() {
    var power = navigator.mozPower;
    if (!power) {
      console.error('daihai Cannot get mozPower');
      return;
    }

    if (!power.factoryReset) {
      console.error('daihai Cannot invoke mozPower.factoryReset()');
      return;
    }
    power.factoryReset();
  },

  handleKeydown: function AutoSlt_handleKeyDown(event) {

    console.log('daihai>>>AutoSlt_handleKeyDown>'+event.key);
    event.preventDefault();

    if (_pcTestCommander.getCurrentCmd() === CMD_KEY_MODE){
      GetKeyResultLastkey = event.key;
      return;
    }

    switch (event.key){
      case 'SoftLeft':
        this.resultButton.click();
        break;
      case 'SoftRight':
        this.manuButton.click();
        break;
      case 'ArrowDown':
        if (this.contentView.scrollTop == 0) {
          this.contentView.classList.add('focus');
          this.resetButton.blur();
        }
        if (this.contentView.classList.contains('focus') && this.contentView.scrollTop < this.contentView.scrollHeight) {
          this.contentView.scrollTop += 10;
        }
        break;
      case 'ArrowUp':
        if (this.contentView.scrollTop == 0) {
          this.contentView.classList.remove('focus');
          this.resetButton.focus();
        }
        if (this.contentView.classList.contains('focus') && this.contentView.scrollTop < this.contentView.scrollHeight) {
          this.contentView.scrollTop -= 10;
        }
        break;
      case 'Enter':
        if (document.activeElement.id="resetButton"){
          this.resetButton.click();
        }
        break;
      case 'Backspace':
      case 'EndCall':
        console.log('daihai>>Backspace>');
        window.navigator.jrdExtension.setPropertyLE('engmoded', 'disable');
        window.close();
        break;
    }
  },

  cameraTest: function AutoSlt_cameraTest(status) {
    console.log('daihai autoslt AutoSlt_cameraTest:'+status);
    this.closeTest();
    var event = new CustomEvent('cameraTest', {
      detail: {
        status:status
      }
    });
    window.dispatchEvent(event);
  }
};

window.addEventListener('load', () => {
  var req = window.navigator.jrdExtension.setPropertyLE('engmoded', 'enable');
req.onsuccess = () => {
  console.log('daihai>engmoded>onsuccess>');
  AutoSlt.init();
};
});

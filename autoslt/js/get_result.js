/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: getResult.js
// * Description: mmitest -> auto test part.
// * Note: When you want to add a new test item, just add the html file
// *       name in array testList
// ************************************************************************

/* global dump, asyncStorage */
'use strict';

const AUTOSLT_RESULT = 'autoslt_result';

const DEBUG = true;

const MMITEST_RESULT = 'mmitest_result';

const TEST_CASE_LIST = [
  'CheckVersion',
  'CheckPhase',
  'CheckCFT',
  'CheckSIM',
  'Memory',
  'RealKey',
  'Lsensor',
  'Psensor',
  'Flash',
  'TouchPanel',
  'LCM_Backlight',
  'LCM_Luminance',
  'LCM_Chroma',
  'LCM_BrightDot',
  'LCM_DarkDot',
  'LCM_Flick',
  'LCM_Crosstalk',
  'Sensor_Calibrate',
  'Accsensor',
  'Magsensor',
  'Gyrosensor',
  'FCAM_Luminance',
  'FCAM_DarkDot',
  'FCAM_BrightDot',
  'FCAM_Chroma',
  'FCAM_Displace',
  'FCAM_Sharpness',
  'BCAM_Luminance',
  'BCAM_DarkDot',
  'BCAM_BrightDot',
  'BCAM_Chroma',
  'BCAM_Displace',
  'BCAM_Sharpness',
  'BCAM_Dual',
  'MainMIC',
  'AuxMIC',
  'Earpiece',
  'Speaker',
  'HeadsetPlugin',
  'HeadsetKey',
  'HeadMIC',
  'HeadL/R',
  'FMRadio',
  'HeadsetPlugOut',
  'Vibrate',
  'BlueTooth',
  'WiFi_2G',
  'GPS',
  'Antenna',
  'Charging',
  'Power',
  'FingerPrint'
];


function debug(s) {
  if (DEBUG) {
    console.log('<autoslt> ------: [getResult.js] = ' + s + '\n');
  }
}

var AutoTestResult = {
  state : 'locked',

  testList: [],
  resultList: {},
  index: 0,
  // 'start', 'next', the start button will be used in two cases.

  get mainPanel () {
    return document.getElementById('main-panel');
  },


  get resultView () {
    return document.getElementById('resultView');
  },

  getResultList: function AutoTestResult_geResultList(callback) {
    asyncStorage.getItem(AUTOSLT_RESULT, (value) => {
      debug('asyncStorage.get AUTOSLT_RESULT :'+value);
    value && callback(value);
  });
  },


  displayResultList: function AutoTestResult_displayResultList(list) {

    if (list) {
      var result = '<li class="idLi">ID</li><li class="caseLi">Test Case</li><li class="resultLi">Result</li>';
      this.resultList = JSON.parse(list);
      var index = 1;
      for(var keyIndex in TEST_CASE_LIST){
        var key = TEST_CASE_LIST[keyIndex];
        debug('index:'+index);
        var value = this.resultList[key];
        if (value) {
          var note = value.note ? value.note : '';
          var resultColor;
          if (value.result === 'PASS') {
            resultColor = 'resultPASS';
          }else if (value.result === 'NT') {
            resultColor = 'resultNT';
          }else {
            resultColor = 'resultFAIL';
          }
          result += '<li class="idLi">' + index + '</li><li class="caseLi">' + key + '</li><li class="resultLi '+ resultColor +'">' +
            value.result + '</li><li class="noteLi">' +  note  + '</li>';
        }else {
          result += '<li class="idLi">' + index + '</li><li class="caseLi">' + key + '</li><li class="resultLi resultNT">NT</li><li class="noteLi"></li>';
        }

        debug('this.resultList result:'+result);

        index = ++index;
      }
      debug('result:'+result);
      this.resultView.innerHTML = result;
    }

  },


  init: function AutoTestResult_init() {

    this.getResultList((list) => {
      this.displayResultList(list);
  });

  },

  handleKeydown: function AutoTestResult_handleKeydown(evt){
    evt.preventDefault();
    switch(evt.key){
      case 'SoftRight':
        // this.end();
        break;

      case 'SoftLeft':

        break;

      case 'ArrowUp':
        if (this.resultView.classList.contains('focus')) {
          this.resultView.scrollTop -= 30;
        } else {
          // this.start();
        }
        break;

      case 'ArrowDown':
        if (this.resultView.classList.contains('focus')) {
          this.resultView.scrollTop += 30;
        }
        break;
      case 'Backspace':
      case 'EndCall':
        window.location = '../index.html';
        break;
      default:
        break;
    }
  },


  setManuResultList: function AutoTestResult_setResult() {
    asyncStorage.setItem(MMITEST_RESULT, JSON.stringify(this.resultManuList));
    debug('set asycstorage result:' + JSON.stringify(this.resultManuList));
  },


  /*
   * return value: 0, 1, 2
   *    0: have not test
   *    1: all items test but have failed item
   *    2: all items test and all items
   */
  getAllTestResult: function rm_getAllTestResult() {
    var mmi_result = RESULT_STATE.ALL_PASS;
    for (var i = 0; i < this.testList.length; i++) {
      var ret = this.resultList[i] === undefined || this.resultList[i] === '' ?
        'not test' : (this.resultList[i] === 'true' ? 'pass': 'fail');
      if (mmi_result === RESULT_STATE.ALL_PASS) {
        if (ret === 'notTest') {
          mmi_result = RESULT_STATE.NOT_TEST;
        } else if (ret === 'fail') {
          mmi_result = RESULT_STATE.ALL_TEST;
        }
      }
    }
    return mmi_result;
  },


  setPhaseCheck: function rm_setPhaseCheck() {
    if (this.state === 'locked') {
      return;
    }
    var result = this.getAllManuTestResult();
    debug('auto setPhaseCheck result = ' + result);
    debug('auto setPhaseCheck this.result.alltest = ' + this.resultManuList.alltest);
    if (!this.resultManuList.alltest) {
      if (result !== RESULT_STATE.NOT_TEST) {
        RemoteHelper.writeAllTest(() => {
          debug('auto write all test success');
        if (result === RESULT_STATE.ALL_TEST) {
          RemoteHelper.writeAllTestButFail(() => {
            debug('write all test but failed success');
        }, () => {});
        } else if (result === RESULT_STATE.ALL_PASS) {
          RemoteHelper.writeAllPass(() => {
            debug('auto write all pass success (first all test)');
          this.state = 'locked';
        }, () => {});
        }
      }, () => {});
        this.resultManuList.alltest = true;
      }
    } else {
      if (result === RESULT_STATE.ALL_PASS) {
        RemoteHelper.writeAllPass(() => {
          debug('auto write all pass success (update test result)');
        this.state = 'locked';
      }, () => {});
      }
    }
  },

};

window.onload = AutoTestResult.init.bind(AutoTestResult);
window.addEventListener('keydown', AutoTestResult.handleKeydown.bind(AutoTestResult));

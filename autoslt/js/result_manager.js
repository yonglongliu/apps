'use strict';

const MMITEST_RESULT = 'mmitest_result';

const RESULT_STATE = {
  NOT_TEST: 0,
  ALL_TEST: 1,
  ALL_PASS: 2
};
/*
 * Default test result template, if there is no info in asycStorage will use this.
 * @items: Avaliable value: notTest, pass, fail; All test item in mmitest which need store.
 * @alltest: Avaliable value: true, false; All test item pass or fail, there is no item is no test.
 */
const TEST_RESULT_TEMPLATE = {
  'items': {
    'traceability': 'notTest',
    'lcd': 'notTest',
    'keypad': 'notTest',
    'backlight': 'notTest',
    'camera': 'notTest',
    'camera_front': 'notTest',
    'rtc': 'notTest',
    'audio': 'notTest',
    'vibrate': 'notTest',
    'accessories': 'notTest',
    'fm': 'notTest',
    'charger': 'notTest',
    'sim': 'notTest',
    'sdcard': 'notTest',
    'nfc' : 'notTest',
    'bluetooth': 'notTest',
    'wifi': 'notTest',
    'gps': 'notTest',
    'call': 'notTest'
  },

  'alltest': false
};

var camera = navigator.mozCameras.getListOfCameras();

var ResultManager = {
  // Default unlocked and allow to write phase check
  state : 'unlocked',

  getResultList: function AutoTest_geResultList(callback) {
    asyncStorage.getItem(MMITEST_RESULT, (value) => {
      if (!value) {
        value = JSON.stringify(TEST_RESULT_TEMPLATE);
      }
      this.result = JSON.parse(value);
      if (callback) {
        callback();
      }
    });
  },

  setResultList: function AutoTest_setResult() {
    asyncStorage.setItem(MMITEST_RESULT, JSON.stringify(this.result));
    debug('set asycstorage result:' + JSON.stringify(this.result));
  },

  hasFront: function has_frontcamera() {
    if (camera && camera.length > 1) {
      return true;
    }
    return false;
  },

  getItemTestResult: function rm_getItemTestResult(key) {
    return this.result.items[key];
  },

  /*
   * return value: 0, 1, 2
   *    0: have not test
   *    1: all items test but have failed item
   *    2: all items test and all items
   */
  getAllTestResult: function rm_getAllTestResult() {
    var result = RESULT_STATE.ALL_PASS;
    for (var key in this.result.items) {
      if (key == 'camera_front' && !this.hasFront()) {
        continue;
      }
      var value = this.result.items[key];
      if (value === 'notTest') {
        result = RESULT_STATE.NOT_TEST;
        break;
      } else if (value === 'fail') {
        // XXX, if fail at this item, set flag to all test unless
        // we get a 'notTest' later in this loop
        result = RESULT_STATE.ALL_TEST;
      }
    }
    return result;
  },

  setPhaseCheck: function rm_setPhaseCheck() {
    if (this.state === 'locked') {
      return;
    }
    var result = this.getAllTestResult();
    debug('setPhaseCheck result = ' + result);
    debug('setPhaseCheck this.result.alltest = ' + this.result.alltest);
    if (!this.result.alltest) {
      if (result !== RESULT_STATE.NOT_TEST) {
        RemoteHelper.writeAllTest(() => {
          debug('write all test success');
          if (result === RESULT_STATE.ALL_TEST) {
            RemoteHelper.writeAllTestButFail(() => {
              debug('write all test but failed success');
            }, () => {});
          } else if (result === RESULT_STATE.ALL_PASS) {
            RemoteHelper.writeAllPass(() => {
              debug('write all pass success (first all test)');
              this.state = 'locked';
            }, () => {});
          }
        }, () => {});
        this.result.alltest = true;
      }
    } else {
      if (result === RESULT_STATE.ALL_PASS) {
        RemoteHelper.writeAllPass(() => {
          debug('write all pass success (update test result)');
          this.state = 'locked';
        }, () => {});
      }
    }
  },

  saveResult: function ut_changeResult(name, value) {
    if (this.result.items[name]) {
      this.result.items[name] = value;
    }

    this.setPhaseCheck();
    this.setResultList(this.result);
  }
};

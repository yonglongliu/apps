/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
/* global TestItem */
'use strict';
const MMITESTRESULT = 'mmitest_result';

var TestResult = new TestItem();

TestResult.onInit = function() {
  this.content = document.getElementById('test-result-content');
  this.content.focus();
  this.showTestResult();
};

TestResult.showTestResult = function() {
  asyncStorage.getItem(MMITESTRESULT, (value) => {
    var testResult = JSON.parse(value);
    var result = '';

    if (testResult) {
      for (var name in testResult.items) {
        // If haven't the front camera, the result ignore.
        if ('camera_front' === name) {
          var camera = navigator.mozCameras.getListOfCameras();
          if (camera && camera.length < 2) {
            continue;
          }
        }

        var colorClass;
        if (testResult.items[name] === 'pass') {
          colorClass = 'result-pass';
        } else if (testResult.items[name] === 'fail') {
          colorClass = 'result-fail';
        } else {
          colorClass = 'result-notest';
        }
        result += '<p class="' + colorClass + '">'
            + name + ': ' + testResult.items[name] + '</p>' ;
      }

      this.content.innerHTML = result;
    }
  });
};

TestResult.onHandleEvent = function(evt) {
  switch (evt.key) {
    case 'Up':
    case 'ArrowUp':
      evt.stopPropagation();
      this.content.scrollTop = this.content.scrollTop - 15;
      return true;
    case 'Down':
    case 'ArrowDown':
      evt.stopPropagation();
      this.content.scrollTop = this.content.scrollTop + 15;
      return true;
  }
  return false;
};

window.addEventListener('load', TestResult.init.bind(TestResult));
window.addEventListener('beforeunload', TestResult.uninit.bind(TestResult));
window.addEventListener('keydown', TestResult.handleKeydown.bind(TestResult));

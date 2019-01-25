/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: camera.js
// * Description: mmitest -> test item: camera test.
// * Note:
// ************************************************************************

/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
  if (DEBUG) {
    dump('<mmitest> ------: [camera.js] = ' + s + '\n');
  }
}

function $(id) {
  return document.getElementById(id);
}

// ------------------------------------------------------------------------

var WHICH_CAMERA = $('camera_front') ? 1 : 0; // 0 is back camera and 1 is front camera.

var beInited = false;

var testJPG = "IMG_mmitest.jpg"
var maxImagePixelSize = 5 * 1024 * 1024;
var captureEnabled = false;

var CameraTest = new TestItem();

CameraTest._flashlightManager = null;
CameraTest.testFlag = true;
CameraTest._cameras = null;
CameraTest._cameraObj = null;

CameraTest._picture = null;
CameraTest.frame = null;
CameraTest.setSource = function() {
  $('viewfinder').mozSrcObject = null;

  this._cameras = navigator.mozCameras.getListOfCameras();
  debug('cameras: ' + this._cameras.toString() + '-- index: ' + WHICH_CAMERA);

  this._picture = navigator.getDeviceStorages('pictures')[0];

  navigator.mozCameras.getCamera(this._cameras[WHICH_CAMERA])
      .then(this.gotCamera.bind(this), this.gotCameraError.bind(this));};

CameraTest.startPreview = function() {
  $('viewfinder').play();
  this.setSource();
};

CameraTest.stopPreview = function() {
  $('viewfinder').pause();
  $('viewfinder').mozSrcObject = null;
};

CameraTest.resumePreview = function() {
  this._cameraObj.resumePreview();
};

CameraTest.gotPreviewScreen = function(stream) {
  $('viewfinder').mozSrcObject = stream;
  $('viewfinder').play();
};

CameraTest.gotCamera = function(params) {
  var camera = this._cameraObj = params.camera;
  var config = {
    pictureSize: this.getProperPictureSize(camera.capabilities.pictureSizes)
  };
  camera.setConfiguration(config);

  var viewfinder = $('viewfinder');
  var style = viewfinder.style;

  var transform = '';
  if (WHICH_CAMERA === 1) {
    transform += ' scale(-1, 1)';
  }
  var angle = camera.sensorAngle;
  transform += 'rotate(' + angle + 'deg)';
  debug('transform ===================== ' + transform);

  style.MozTransform = transform;

  var width = document.body.clientWidth;
  var height = document.body.clientHeight;
  if (angle % 180 === 0) {
    style.top = 0;
    style.left = 0;
    style.width = width + 'px';
    style.height = height + 'px';
  } else {
    style.top = ((height / 2) - (width / 2)) + 'px';
    style.left = -((height / 2) - (width / 2)) + 'px';
    style.width = height + 'px';
    style.height = width + 'px';
  }
  viewfinder.mozSrcObject = camera;
  viewfinder.play();
};

CameraTest.getProperPictureSize = function (sizes) {
  var delta, ratio, gradual = 1, index = 0;
  var screenRatio = document.body.clientWidth/ document.body.clientHeight;

  // get a picture size that's the largest and mostly eaqual to screen ratio
  for (var i = 0, len = sizes.length; i < len; i++) {
    ratio = sizes[i].height / sizes[i].width;
    if (ratio > 1) {
      ratio = 1 / ratio;
    }
    delta = Math.abs(screenRatio - ratio);
    if (delta < gradual || (delta === gradual &&
        sizes[index].height * sizes[index].width < sizes[i].height * sizes[i].width)) {
      gradual = delta;
      index = i;
    }
  }
  return sizes[index];
};

CameraTest.gotCameraError = function() {
  $('centertext').innerHTML = 'got camera error';
  this.failButton.disabled = '';
  this.testFlag = false;
};

CameraTest.visibilityChange = function() {
  if (document.mozHidden) {
    this.stopPreview();
  } else {
    this.startPreview();
  }

  var self = this;
  if (this._cameraObj) {
    this._cameraObj.release().then(function() {
      self._cameraObj = null;
    }, function() {
      debug('fail to release camera');
    });
  }
};

CameraTest.deletePicture = function() {
  var self = this;
  var req = self._picture.get(testJPG);
  req.onerror = function() {
    debug('No IMG_mmitest picture!');

  };
  req.onsuccess = function(e) {
    debug('Got IMG_mmitest picture!');
    self._picture.delete(testJPG);
  };
};

CameraTest.takePicture  = function() {
  debug('takePicture');
  var self = this;
  var config = {
    dateTime: Date.now() / 1000,
    pictureSize: self.pictureSize,
    fileFormat: 'jpeg'
  };

  setTimeout(function() {
    takePicture();
  }, 500);

  setTimeout(function() {
    if (self.testFlag) {
      self.frame.clear();
      self.deletePicture();
      self.startPreview();
      $('captureButton').disabled = '';
      captureEnabled = true;
    }
  }, 10000);

  function takePicture() {
    self._cameraObj.takePicture(config).then(onSuccess, onError);
  }

  function onError(error) {
    debug('takePicture failed!');
  }

  function onSuccess(blob) {
    debug('takePicture successfull!');
    onCreated(blob,testJPG);
  }

  function onCreated( blob,filepath) {
    debug('create picture data!');
    var req = self._picture.addNamed(blob, filepath);
    req.onerror = function(e) { debug('create picture failed, error='+e); };
    req.onsuccess = function(e) {
      debug('create picture successfull!');
      self.stopPreview();
      showImage(blob);
    };
  }

  function showImage(blob) {
    debug('showImage');
    getImageSize(blob, success, function error(){
      debug('getImageSize failed!');
    });
    function success(metadata) {
      debug('getImageSize successfull!');
      setTimeout(function(){
        self.frame.displayImage(blob, metadata.width, metadata.height, null, metadata.rotation, metadata.mirrored);
      }, 500);
    }
  }
};

CameraTest.startInit = function() {
  if (!navigator.mozCameras) {
    $('centertext').innerHTML = 'mozCameras does not exist';
    return;
  }

  if (beInited) {
    return;
  }
  beInited = true;

  this.frame = new MediaFrame($('centertext'), false, maxImagePixelSize);

  if ($('camera_front')) {
    $('title').innerHTML = 'Front Camera';
  } else {
    $('title').innerHTML = 'Camera';
    /*
    navigator.getFlashlightManager().then(FlashlightManager => {
        FlashlightManager.flashlightEnabled = true;
        self._flashlightManager = FlashlightManager;
    });
    */
  }
  this.setSource();

  this.passButton.disabled = 'disabled';
  this.failButton.disabled = 'disabled';
  var self = this;

  setTimeout(function() {
    if (self.testFlag) {
      self.passButton.disabled = '';
    }
    self.failButton.disabled = '';
    $('captureButton').disabled = '';
    captureEnabled = true;
  }, 3000);
};

//the following are inherit functions
CameraTest.onInit = function() {
  $('captureButton').disabled = 'disabled';
  var self = this;
  if (($('camera_front')) && (parent.AutoTest != undefined)) {
    setTimeout(function() {
      self.startInit();
    }, 200);
  } else {
    self.startInit();
  }
};

CameraTest.onDeinit = function() {
  if (this._flashlightManager) {
    this._flashlightManager.flashlightEnabled = !this._flashlightManager.flashlightEnabled;
  }
  if (this._picture) {
    this.deletePicture();
  }
};

CameraTest.onHandleEvent = function(evt) {
  evt.preventDefault();
  if (evt.key === 'Enter' && captureEnabled) {
    captureEnabled = false;
    this.takePicture();
    $('captureButton').disabled = 'disabled';
  }
  return false;
};

window.addEventListener('DOMContentLoaded', CameraTest.init.bind(CameraTest));
window.addEventListener('beforeunload', CameraTest.uninit.bind(CameraTest));
window.addEventListener('mozvisibilitychange', CameraTest.visibilityChange.bind(CameraTest));
window.addEventListener('keydown', CameraTest.handleKeydown.bind(CameraTest));

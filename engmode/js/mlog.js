/* global DEBUG, dump, TestItem */
'use strict';

function debug(s) {
    if (DEBUG) {
        dump('<engmode> ------: [mlog.js] = ' + s + '\n');
    }
}

function $(id) {
    return document.getElementById(id);
}

var beInited = false;
var LOG_INTERVAL = 1000;//1s
var createAe = 'touch /data/mlog/ae.txt';
var createAwb = 'touch /data/mlog/awb.txt';
var createLsc1 = 'touch /data/mlog/lsc1.txt';
var chmodMlog = 'chmod 777 /data/mlog/*';

var MLOG = new Item();
const paths = ['/data/mlog/smart.txt', '/data/mlog/ae.txt', '/data/mlog/awb.txt', '/data/mlog/lsc1.txt'];
var maxImagePixelSize = 5 * 1024 * 1024;
MLOG._interval = null;
MLOG._cameras = null;
MLOG._cameraObj = null;
MLOG._picture = null;
MLOG.frame = null;
MLOG.captured = false;
MLOG.reMaxTry = 0;
MLOG._Try = 0;
MLOG.mlogPathQueue = '/data/mlog/smart.txt';
MLOG.FPS;
MLOG.update = function () {
    MLOG.addPermission();
    this.content = $('mlog-content');
    this.views = this.content.querySelectorAll('.view');
    this.content.focus();
    this.startInit();
    this.showMlog();
};

MLOG.toggleView = function () {
    var logContent = $('centertext');
    var mlogMenu = $('mlog-menu');
    var mlogSwitch = $('mlog-switch');
    if (mlogMenu.hidden === true) {
        mlogMenu.hidden = false;
        logContent.hidden = true;

    } else {
        if (mlogSwitch.checked) {
            logContent.hidden = false;
        } else {
            logContent.hidden = true;
        }
        mlogMenu.hidden = true;
    }
    window.localStorage.setItem('mlog-switch',  mlogSwitch.checked);

    this.showMlog();
};


MLOG.addPermission = function () {
    RemoteHelper.sendCommand([{cmd: chmodMlog, type: 'mlog'}]);
    RemoteHelper.sendCommand([{cmd: createAe, type: 'mlog'}]);
    RemoteHelper.sendCommand([{cmd: createAwb, type: 'mlog'}]);
    RemoteHelper.sendCommand([{cmd: createLsc1, type: 'mlog'}]);
    RemoteHelper.setproperty('persist.sys.isp.smartdebug',1);
    RemoteHelper.setproperty('persist.sys.isp.ae.mlog','/data/mlog/ae.txt');
    RemoteHelper.setproperty('debug.isp.awb.mlog','/data/mlog/awb.txt');
    RemoteHelper.setproperty('debug.camera.isp.lsc',1);


};


MLOG.mlogOnSuccess = function (queue, response) {
    var logcontent = $('centertext');
    logcontent.innerText = response;
};

MLOG.mlogOnError = function (queue, response) {
    debug('gxh MLOG.onerror re-try=' + MLOG.reMaxTry + MLOG.mlogPathQueue);
    if(MLOG.reMaxTry < 4){
        setTimeout(function () {
            var cmdQueue = 'cat ' + MLOG.mlogPathQueue;
            RemoteHelper.sendCommand([{cmd: cmdQueue, type: 'mlog'}], MLOG.mlogOnSuccess, MLOG.mlogOnError);
            MLOG.reMaxTry++;
            debug('gxh MLOG.onerror re-try=' + MLOG.reMaxTry);
        },2000);
    }
};

MLOG.updateMlog = function () {
    var self = this;
    var centerText = $('centertext');
    this.centerText.parentNode.scrollTop = 0;
    var cmdQueue = 'cat ' + MLOG.mlogPathQueue;
    //setTimeout(function () {
        debug("sendCommand========" + cmdQueue);
        RemoteHelper.sendCommand([{cmd: cmdQueue, type: 'mlog'}], MLOG.mlogOnSuccess, MLOG.mlogOnError);
   // }, LOG_INTERVAL);
};

MLOG.showMlog = function () {
    MLOG.reMaxTry = 0;
    var mlogSwitch = $('mlog-switch');
    var checked = window.localStorage.getItem('mlog-switch');
    var mlogMenu = $('mlog-menu');
    var logcontent = $('centertext');
    mlogSwitch.checked = (checked === 'true');
    var path = window.localStorage.getItem('path');
    if(path){
        this.mlogPathQueue = path;
    }
    for(let i = 0; i < paths.length; i ++){
        if(path === paths[i]){
            this.select = this.content.querySelector('select');
            this.select[i].selected = true;
        }
    }
    MLOG.FPS = window.localStorage.getItem('fps');
    if(MLOG.FPS === null)
    {
        MLOG.FPS = 1000;
    }
    this.selectFps = document.getElementById('select-fps');
    for (let i = 0;i < 30;i ++){
        if(MLOG.FPS === this.selectFps[i].value){
            this.selectFps[i].selected = true;
        }
    }
    if (checked === 'true' && mlogMenu.hidden) {
        logcontent.hidden = false;
        this.updateMlog();
        this._interval = window.setInterval(this.updateMlog.bind(this),MLOG.FPS);
    } else {
        logcontent.hidden = true;
        window.clearInterval(this._interval);
    }
    NavigationMap.initPanelNavigation('.focusable', 0, "mlog-menu", false, this.content);
};

MLOG.setSource = function() {
    $('viewfinder').mozSrcObject = null;
    this._cameras = navigator.mozCameras.getListOfCameras();
    this._picture = navigator.getDeviceStorages('pictures')[0];
    navigator.mozCameras.getCamera(this._cameras[0])
        .then(this.gotCamera.bind(this), this.gotCameraError.bind(this));
};

MLOG.startPreview = function() {
    $('viewfinder').play();
    this.setSource();
    this.captured = false;
};

MLOG.stopPreview = function() {
    $('viewfinder').pause();
    $('viewfinder').mozSrcObject = null;
};

MLOG.resumePreview = function() {
    this._cameraObj.resumePreview();
};

MLOG.gotPreviewScreen = function(stream) {
    $('viewfinder').mozSrcObject = stream;
    $('viewfinder').play();
};

MLOG.gotCamera = function(params) {
    var camera = this._cameraObj = params.camera;
    var config = {
        pictureSize: this.getProperPictureSize(camera.capabilities.pictureSizes)
    };
    camera.setConfiguration(config);

    var viewfinder = $('viewfinder');
    var style = viewfinder.style;
    var transform = '';

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

MLOG.getProperPictureSize = function (sizes) {
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

MLOG.gotCameraError = function() {
    $('centertext').innerHTML = 'got camera error';
};

MLOG.startInit = function () {
    if (beInited) {
        return;
    }
    var self = this;
    beInited = true;
    self.frame = new MediaFrame($('centertext'), false, maxImagePixelSize);
    self.setSource();
    setTimeout(function () {
        self.startPreview();
    }, 500);


};

//the following are inherit functionsstartInit
MLOG.onInit = function () {

};

MLOG.onDeinit = function () {
    beInited = false;
    MLOG.reMaxTry = 0;
    debug('gxh onDeinit');
    RemoteHelper.onDeinit();
    window.clearInterval(this._interval);
    this.stopPreview();
};

MLOG.onDestroy = function () {
    beInited = false;
    this.stopPreview();
};



MLOG.onHandleKeydown = function (evt) {
    switch (evt.key) {
        case 'Enter':
            var name = evt.target.getAttribute('name');
            if(name === 'mlog-setting-item'){
                this.content = $('mlog-content');
                this.select = this.content.querySelector('select');
                this.select.focus();
                this.select.onblur = () => {
                    let selectedValue;
                    for(let i = 0; i < this.select.length; i++) {
                        if (this.select.options[i].selected) {
                            selectedValue = this.select.options[i].value;
                        }
                    }
                    window.localStorage.setItem('path',selectedValue);
                    MLOG.showMlog();
                }
            }
            if (name === 'mlog-switch') {
                this.toggleView();
            }
            if(name === 'mlog-setting-fps'){
                this.content = $('mlog-content');
                this.selectFps = document.getElementById('select-fps');
                this.selectFps.focus();
                this.selectFps.onblur = () => {
                    let selectedValue;
                    for (let i = 0; i < this.selectFps.length;i ++){
                        if(this.selectFps.options[i].selected){
                            selectedValue = this.selectFps.options[i].value;
                            MLOG.FPS = selectedValue;
                            window.localStorage.setItem('fps',selectedValue);
                        }
                    }
                }
            }
            break;
        case 'SoftRight':
            this.toggleView();
            break;
        case 'SoftLeft':
            break;
            return true;
        case 'ArrowUp':

        case 'ArrowDown':
            this.centerText = $('centertext');
            this.centerText.focus();
            evt.preventDefault();
            evt.stopPropagation();
            this.scroll(this.centerText.parentNode,evt.key);
            break;
            return true;

    }
    return false;
};
MLOG.scroll = function (element,direction) {
    var sHeight = element.scrollHeight;
    var cHeight = element.clientHeight;
    var moveHeight = sHeight - cHeight;
    var sTop = element.scrollTop;
    var stepLength = 20;
    if (direction === 'ArrowDown') {
        if (sTop < moveHeight) {
            if (sTop + stepLength >= moveHeight) {
                element.scrollTop = moveHeight;
            } else {
                element.scrollTop = sTop + stepLength;
            }
        }
    } else if (direction === 'ArrowUp') {
        if (sTop - stepLength >= 0) {
            element.scrollTop = sTop - stepLength;
        } else {
            element.scrollTop = 0;
        }
    }

};

window.addEventListener('DOMContentLoaded', MLOG.init.bind(MLOG));
window.addEventListener('beforeunload', MLOG.uninit.bind(MLOG));
window.addEventListener('keydown', MLOG.handleKeydown.bind(MLOG));
window.addEventListener('panelready', function (e) {
    if (e.detail.current === '#mlog') {
        navigator.requestWakeLock('screen');
        MLOG.update();
    }
});

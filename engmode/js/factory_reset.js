'use strict';

function debug(s) {
    if (DEBUG) {
        dump('<engmode> ------: [reboot.js] = ' + s + '\n');
    }
}

function $(id) {
    return document.getElementById(id);
}

var FACTORYRESET = new Item();
FACTORYRESET.resetTimes = 0;
FACTORYRESET.awakeTime ;
FACTORYRESET.resetValue = 0;

FACTORYRESET.update = function () {
  this.content = $('reset-content');
  this.views = this.content.querySelectorAll('.view');
  this.content.focus();
  this.showView('reset-menu');
  this.initInput();
};

FACTORYRESET.showView = function (name) {
    for (var i = 0, len = this.views.length; i < len; i++) {
        var view = this.views[i];
        if (name === view.id) {
            view.classList.remove('hidden');
        } else {
            view.classList.add('hidden');
        }
    }
    NavigationMap.initPanelNavigation('.focusable', 0, name, false, this.content);
};

FACTORYRESET.initInput = function () {
    var content = $('reset-menu');
    var allLi = content.querySelectorAll('li');
    for (let liItem of allLi) {
        liItem.onfocus = function (e) {
            let liInput = e.target.querySelector('input');
            if (liInput) {
                var spos = liInput.value.length;
                if (liInput.setSelectionRange) {
                    setTimeout(function () {
                        liInput.setSelectionRange(spos, spos);
                        liInput.focus();
                    }, 0);
                }
            }
        }
    }
    FACTORYRESET.inputCursorInit($('reset-phone-times'));
    FACTORYRESET.inputCursorInit($('reset-awake-phone-times'));
};
FACTORYRESET.inputCursorInit = function (tobj) {
    tobj.addEventListener('keydown', function (evt) {
        if (evt.key === 'ArrowLeft') {
            evt.stopPropagation();
            evt.preventDefault();
        } else if (evt.key === 'ArrowRight') {
            evt.stopPropagation();
            evt.preventDefault();
        }
    });
};

FACTORYRESET.startReset = function () {
   debug('startReset');
   var power = navigator.mozPower;
   if(!power){
       debug('cannot get mozPower');
   }
   if(!power.factoryReset){
       debug(' cannot invoke power.factoryReset()');
   }
   power.factoryReset();
};

FACTORYRESET.stopReset = function () {
    var resetCmd = "echo 0" + '\-' + this.resetValue  + '\-'+ this.awakeTime + " \> /productinfo/factory_reset.txt";
    RemoteHelper.sendCommand([{cmd:resetCmd,type:'engmode'}]);

};

FACTORYRESET.setPropOnSuccess = function () {
    debug('setPropOnSuccess');
    let delaytime = FACTORYRESET.awakeTime * 1000;
    setTimeout(function () {
        FACTORYRESET.startReset();
    },delaytime);
};

FACTORYRESET.setPropOnError = function () {
    debug('setProponError');
    let delaytime = FACTORYRESET.awakeTime * 1000;
    var resetCmd = 'echo ' + FACTORYRESET.resetTimes + '\-' + FACTORYRESET.resetValue + '\-'+ FACTORYRESET.awakeTime + ' \> /productinfo/factory_reset.txt';
    RemoteHelper.sendCommand([{cmd:resetCmd,type:'mlog'}],()=>{});
    setTimeout(function () {
        FACTORYRESET.startReset();
    },delaytime);

};

FACTORYRESET.initResetProperties = function () {
    FACTORYRESET.resetTimes =  $('reset-phone-times').value;
    let resetSwitch = $('reset-switch').checked;
    if(resetSwitch){
        FACTORYRESET.resetValue = 1;
    }else {
        FACTORYRESET.resetValue = 0;
    }
    FACTORYRESET.awakeTime = $('reset-awake-phone-times').value;
    var resetCmd = 'echo ' + FACTORYRESET.resetTimes + '\-' + FACTORYRESET.resetValue + '\-'+ FACTORYRESET.awakeTime + ' \> /productinfo/factory_reset.txt';
    debug('resetCmd ' + resetCmd);
    RemoteHelper.sendCommand([{cmd:resetCmd,type:'mlog'}],FACTORYRESET.setPropOnSuccess,FACTORYRESET.setPropOnError);
};

FACTORYRESET.onHandleKeydown = function (event) {
    if(event.key === 'Enter'){
        var name = event.target.getAttribute('name');
        debug(' reset onHandleKeydown name = ' + name);
        switch (name){
            case 'reset-start' :{
                if($('reset-start').disabled === false && $('reset-switch').checked === true){
                    $('reset-start').disabled = true;
                    $('reset-stop').disabled = false;
                    this.initResetProperties();
                }
                break;
            }
            case 'reset-stop':{
                    FACTORYRESET.stopReset();
                break;
            }
        }
    }
    return true;
};

window.addEventListener('keydown',FACTORYRESET.handleKeydown.bind(FACTORYRESET));
window.addEventListener('panelready', function (e) {
    if (e.detail.current === '#factory-reset') {
        navigator.requestWakeLock('screen');
        FACTORYRESET.update();
    }
});

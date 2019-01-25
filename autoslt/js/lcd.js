/*© 2017 KAI OS TECHNOLOGIES (HONG KONG) LIMITED, all rights reserved.*/
// ************************************************************************
// * File Name: lcd.js
// * Description: mmitest -> test item: lcd test.
// * Note:
// ************************************************************************

/* global TestItem */
'use strict';

function $(id) {
  return document.getElementById(id);
}
var power = navigator.mozPower;

var LcdTest = new TestItem();

function TestItem() {
  this.orignScreenBrightness = power.screenBrightness;
}

LcdTest.onInit = function() {
  var storage = navigator.getDeviceStorages('sdcard');
  var sdCard = storage[storage.length - 1];
  sdCard.available().onsuccess = function () {
    dump('daihai>> sdcard available');
    let request = sdCard.get('/sdcard1/slt/'+parent.commander_lcd_pic_name);
    request.onsuccess = function _success() {
      dump('daihai>> sdcard onsuccess :'+this.result);
      dump('daihai>> result.type :'+this.result.type);
      dump('daihai>> result.name :'+this.result.name);

      power.screenBrightness = parent.commander_lcd_screen_value/255;

      var reader = new FileReader();
      reader.onload = function () {
        $('image_img').src = reader.result;
        dump('daihai>> load picture success');

        parent.AutoSlt.dispatchEvent('lcdtest','ok');
      };
      reader.readAsDataURL(this.result);
    };
    request.onerror = function _error() {
      dump('daihai>> sdcard onerror');
      parent.AutoSlt.dispatchEvent('lcdtest','error');
    };
  };

};

LcdTest.onDeinit = function() {
  power.screenBrightness = this.orignScreenBrightness;
};

window.addEventListener('load', LcdTest.onInit.bind(LcdTest));
window.addEventListener('beforeunload', LcdTest.onDeinit.bind(LcdTest));


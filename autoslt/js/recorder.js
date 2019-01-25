/**
 * Created by sdduser on 18-5-8.
 */

const MIC_CMD = 'AT+SPVLOOP=1,1,8,2,2,1';
const RESET_CMD = 'AT+SPVLOOP=0,1,8,2,3,0';
const ASSIS_MIC_CMD = 'AT+SPVLOOP=1,1,8,2,2,2';

function debug_recorder(s) {
  // if (DEBUG) {
  console.log('daihai <autoslt> ------: [recorder.js] = ' + s + '\n');
  // }
}
var mediaName;

function Recorder() {
  this.mediaRecorder = null;
}


Recorder.prototype.start = function (fileName) {
  mediaName = fileName;
  debug_recorder('start this.mediaName is '+mediaName);

  if (fileName === 'AuxMIC'){
    RemoteHelper.sendATCommand(ASSIS_MIC_CMD);
  }else if (fileName === 'MainMIC'){
    RemoteHelper.sendATCommand(MIC_CMD);
  }

  return new Promise(function(resolve) {

    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      var options = {audioBitsPerSecond: 8000};
    this.mediaRecorder = new MediaRecorder(stream, options);

    this.mediaRecorder.onresume = function(e) {
      debug_recorder('mediaRecorder>onresume>');
    };

    this.mediaRecorder.onstop = function(e) {
      debug_recorder('mediaRecorder>onresume>onstop');
    };

    this.mediaRecorder.onwarning = function(e) {
      debug_recorder('mediaRecorder>onresume>onwarning');
    };

    this.mediaRecorder.onstart2 = function(e) {
      debug_recorder('mediaRecorder>onstart2>');
      resolve('ok');
    };
    this.mediaRecorder.onerror = function(e) {
      debug_recorder('mediaRecorder>onerror>');
      resolve('error');
    };

    if (this.mediaRecorder.state === 'inactive') {
      this.mediaRecorder.start();
      // the event onstart of mediarecorder can not work by 8000Bitrate
      // so this is a workaround
      // if it has be resolve.please delete these code
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.onstart2();
      }
    }
  }).catch((error) => {
      debug_recorder('mediaRecorder>catch>error : ' + error);
    resolve('error');
  });

  }.bind(this));
};

Recorder.prototype.stop = function () {

  return new Promise(function(resolve) {
    this.mediaRecorder.ondataavailable = function(e) {
      debug_recorder('mediaRecorder>ondataavailable>');

      var storage = navigator.getDeviceStorages('sdcard');
      if (!storage) {
        debug_recorder('sdcard not found');
        resolve('error');
        return;
      }else {
        var sdcard = storage[0];
        debug_recorder('stop mediaName is '+mediaName);

        var deletereq = sdcard.delete('/sdcard/slt/'+mediaName+'_Record.wav');
        deletereq.onsuccess = deletereq.onerror = save;
        function save() {
          var filename = '/sdcard/slt/'+mediaName+'_Record.wav';
          var request = sdcard.addNamed(e.data, filename);
          request.onsuccess = function() {
            debug_recorder('mediaRecorder: store data operation successfully');
            resolve('ok');
          };
          request.onerror = function() {
            debug_recorder('mediaRecorder: Failed to store', filename,
              'in DeviceStorage:', request.error);
            resolve('error');
          };
        }
      }
    };

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
      RemoteHelper.sendATCommand(RESET_CMD);
    }
  }.bind(this));
};



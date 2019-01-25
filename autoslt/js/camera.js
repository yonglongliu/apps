'use strict';

const AUTOSLT_RESULT = 'autoslt_result';
const RECORD_HISTORY = 'record_history';

const IP_ADDRESS = '127.0.0.1';
const YLOG_PORT = 8099;
const SLOG_PORT = 4321;
// const WCND_PORT = 4045;
const AUTOSLT_PORT = 7878;

/**************************************************YLog********************************************************/
const YLOG_EXIT_FLAG = '____cli____exit____\n';

/**
 * response type:
 *      opened: 1\n
 *     closed: 0\n
 * @type {string}
 */
const YLOG_GET_STATUS_MAIN = 'ylog android_main get started\n';
const YLOG_GET_STATUS_SYSTEM = 'ylog android_system get started\n';
const YLOG_GET_STATUS_RADIO = 'ylog android_radio get started\n';
const YLOG_GET_STATUS_EVENT = 'ylog android_events get started\n';
const YLOG_GET_STATUS_CRASH = 'ylog android_crash get started\n';
const YLOG_GET_STATUS_TCPDUMP = 'ylog tcpdump get started\n';
const YLOG_GET_STATUS_HCIDUMP = 'ylog hcidump get started\n';
const YLOG_GET_STATUS_KERNEL = 'ylog kernel get started\n';

/**
 * response type:
 * /storage/BE60-0FE5/ylog/ylog
 * /storage/BE600FE5/ylog/last_ylog
 * @type {string}
 */
const YLOG_GET_PATH = 'cpath\n';

/**
 *  response type:
 *  /storage/BE60-0FE5
 * @type {string}
 */
const YLOG_GET_ROOT_DIR = 'rootdir\n';

/**
 * response type:
 * [ all ] = running
 * @type {string}
 */
const YLOG_ALL_START = 'ylog all start\n';

/**
 * response type:
 * [ all ] = stop
 * @type {string}
 */
const YLOG_ALL_STOP = 'ylog all stop\n';

/**
 * response type:
 * [ android_main ] = running
 * @type {string}
 */
const YLOG_MAIN_START = 'ylog android_main start\n';
const YLOG_SYSTEM_START = 'ylog android_system start\n';
const YLOG_RADIO_START = 'ylog android_radio start\n';
const YLOG_EVENT_START = 'ylog android_events start\n';
const YLOG_CRASH_START = 'ylog android_crash start\n';
const YLOG_TCPDUMP_START = 'ylog tcpdump start\n';
const YLOG_HCIDUMP_START = 'ylog hcidump start\n';
const YLOG_KERNEL_START = 'ylog kernel start\n';

/**
 * response type:
 * [ android_main ] = stop
 * @type {string}
 */
const YLOG_MAIN_STOP = 'ylog android_main stop\n';
const YLOG_SYSTEM_STOP = 'ylog android_system stop\n';
const YLOG_RADIO_STOP = 'ylog android_radio stop\n';
const YLOG_EVENT_STOP = 'ylog android_events stop\n';
const YLOG_CRASH_STOP = 'ylog android_crash stop\n';
const YLOG_TCPDUMP_STOP = 'ylog tcpdump stop\n';
const YLOG_HCIDUMP_STOP = 'ylog hcidump stop\n';
const YLOG_KERNEL_STOP = 'ylog kernel stop\n';

/**
 * response type:
 * done\n
 * @type {string}
 */
const YLOG_CLEAN = 'rylogr\n';

/**********************************************************************************************************************/

/**************************************************SLog CP TYPE********************************************************/
/**
 * LTE MODEM:SharkL/SharkL 2/iSharkL 2/Whale 2/iWhale 2
 * @type {string}
 */
const SLOG_CP_TYPE_5MODE = '5MODE';

/**
 * AG-DSP
 * @type {string}
 */
const SLOG_CP_TYPE_AG_DSP = 'AG-DSP';

/**
 * GNSS
 * @type {string}
 */
const SLOG_CP_TYPE_GNSS = 'GNSS';

/**
 * TD/TDD-LTE/FDD-LTE
 * @type {string}
 */
const SLOG_CP_TYPE_TD = 'TD';
const SLOG_CP_TYPE_TDD_LTE = 'TDD-LTE';
const SLOG_CP_TYPE_FDD_LTE = 'FDD-LTE';

/**
 * PM/Sensor Hub
 * @type {string}
 */
const SLOG_CP_TYPE_PM_SH = 'PM_SH';

/**
 * WCDMA MODEM:TShark/Pike
 * @type {string}
 */
const SLOG_CP_TYPE_WCDMA = 'WCDMA';

/**
 * WCN
 * @type {string}
 */
const SLOG_CP_TYPE_WCN = 'WCN';
/**************************************************SLog FILE TYPE******************************************************/

/**
 * DUMP:memory dump
 * @type {string}
 */
const SLOG_FILE_DUMP = 'DUMP';

/**
 * @type {string}
 */
const SLOG_FILE_LOG = 'LOG';

/**************************************************SLog command********************************************************/
/**
 * @null means the command is null. and it may be realized in next version.
 *
 * @segmental means the command is incomplete, and you should complete it with params by yourself.
 *
 * @total means the command is complete, and you can use it directly.
 */

/**
 * @segmental
 *
 * COPY_FILE
 * COPY_FILE <cp_type> <file_type> <file1 path> [<file2 path>…]
 * @type {string}
 */
const SLOG_COPY_FILE_GNSS = '';

/**
 * @null
 */
const SLOG_COPY_FILE_LOG = '';

/**
 * @segmental
 *
 * CP_DUMP_END
 * CP_DUMP_END <cp_type>
 * @type {string}
 */

const SLOG_RESPONSE_CP_DUMP_END = 'CP_DUMP_END ';

/**
 * @segmental
 *
 * CP_DUMP_START
 * CP_DUMP_START <cp_type>
 * @type {string}
 */
const SLOG_RESPONSE_CP_DUMP_START = 'CP_DUMP_START ';

/**
 * @null
 */
const SLOG_DISABLE_IQ = '';

/**
 * @segmental
 *
 * DISABLE_LOG
 * DISABLE_LOG <cp_type1> <cp_type2> …
 * @type {string}
 */
const SLOG_DISABLE_LOG = 'DISABLE_LOG ';

/**
 * @total
 *
 * DISABLE_LOG_OVERWRITE
 * @type {string}
 */
const SLOG_DISABLE_LOG_OVERWRITE = 'DISABLE_LOG_OVERWRITE\n';

/**
 * @total
 *
 * DISABLE_MD
 * @type {string}
 */
const SLOG_DISABLE_MD = 'DISABLE_MD\n';

/**
 * @null
 */
const SLOG_DISABLE_SAVE_DUMP = '';

/**
 * @null
 */
const SLOG_ENABLE_IQ = '';

/**
 * @segmental
 *
 * ENABLE_LOG
 * ENABLE_LOG <cp_type1> <cp_type2> …
 * @type {string}
 */
const SLOG_ENABLE_LOG = 'ENABLE_LOG ';

/**
 * @total
 * ENABLE_LOG_OVERWRITE
 * @type {string}
 */
const SLOG_ENABLE_LOG_OVERWRITE = 'ENABLE_LOG_OVERWRITE\n';

/**
 * @null
 * @type {string}
 */
const SLOG_ENABLE_MD = '';

/**
 * @null
 * @type {string}
 */
const SLOG_ENABLE_SAVE_DUMP = '';

/**
 * @total
 * FLUSH
 * @type {string}
 */
const SLOG_FLUSH = 'FLUSH\n';

/**
 * @null
 * @type {string}
 */
const SLOG_GET_AGDSP_LOG_OUTPUT = '';

/**
 * @null
 * @type {string}
 */
const SLOG_GET_AGDSP_PCM_OUTPUT = '';
const SLOG_GET_DUMP_SAVE_STATE = '';


/**
 * @total
 *
 * GET_DATA_MAX_SIZE
 * OK <size>
 * @type {string}
 */
const SLOG_GET_DATA_MAX_SIZE = 'GET_DATA_MAX_SIZE\n';

/**
 * @total
 *
 * GET_LOG_FILE_SIZE
 * OK <size>
 * @type {string}
 */
const SLOG_GET_LOG_FILE_SIZE = 'GET_LOG_FILE_SIZE\n';

/**
 * @total
 *
 * GET_LOG_OVERWRITE
 *
 * response type:
 * OK ENABLE
 * OK DISABLE
 * @type {string}
 */
const SLOG_GET_LOG_OVERWRITE = 'GET_LOG_OVERWRITE\n';

/**
 * @segmental
 *
 * GET_LOG_STATE <cp_type>
 *
 * response type:
 * OK ON
 * OK OFF
 * ERROR <code>
 * @type {string}
 */
const SLOG_GET_LOG_STATE = 'GET_LOG_STATE ';

/**
 * @total
 *
 * GET_MD_STOR_POS
 *
 * response type:
 * OK INTERNAL
 * OK EXTERNAL
 * @type {string}
 */
const SLOG_GET_MD_STOR_POS = 'GET_MD_STOR_POS\n';

/**
 * @total
 *
 * GET_MD_STOR_POS
 *
 * response type:
 * OK <size>
 * @type {string}
 */
const SLOG_GET_SD_MAX_SIZE = 'GET_SD_MAX_SIZE\n';

/**
 * @null
 * @type {string}
 */
const SLOG_MINI_DUMP = '';

/**
 * @segmental
 *
 * SAVE_RINGBUF
 * SAVE_RINGBUF <cp_type>
 * @type {string}
 */
const SLOG_SAVE_RINGBUF = 'SAVE_RINGBUF ';

/**
 * @segmental
 *
 * SAVE_SLEEP_LOG <cp_type>
 * @type {string}
 */
const SLOG_SAVE_SLEEP_LOG = 'SAVE_SLEEP_LOG ';

/**
 * @null
 *
 * SET_AGDSP_LOG_OUTPUT
 * @type {string}
 */
const SLOG_SET_AGDSP_LOG_OUTPUT = '';

/**
 * @null
 * SET_AGDSP_PCM_OUTPUT
 * @type {string}
 */
const SLOG_SET_AGDSP_PCM_OUTPUT = '';

/**
 * @segmental
 *
 * SET_DATA_MAX_SIZE <size>
 * @type {string}
 */
const SLOG_SET_DATA_MAX_SIZE = 'SET_DATA_MAX_SIZE ';

/**
 * @segmental
 *
 * SET_LOG_FILE_SIZE <size>
 * @type {string}
 */
const SLOG_SET_LOG_FILE_SIZE = 'SET_LOG_FILE_SIZE ';

/**
 * @segmental
 *
 * SET_MD_STOR_POS <pos>
 * <pos>:INTERNAL/EXTERNAL
 * @type {string}
 */
const SLOG_SET_MD_STOR_POS = 'SET_MD_STOR_POS ';

/**
 * @segmental
 *
 * SET_SD_MAX_SIZE <size>
 * @type {string}
 */
const SLOG_SET_SD_MAX_SIZE = 'SET_SD_MAX_SIZE ';


/**
 * @null
 * @type {string}
 */
const SLOG_UNSUBSCRIBE = '';

/**
 * @null
 * @type {string}
 */
const SLOG_SUBSCRIBE = '';

/**
 * @total
 *
 * @type {string}
 */
const SLOG_CLEAN = 'slogctl clear\n';


/************************************************  SLOG IN LogManager *************************************************/

const SLOG_ENABLE_ALL = SLOG_ENABLE_LOG
  + SLOG_CP_TYPE_5MODE + ' '
  + SLOG_CP_TYPE_AG_DSP + ' '
  + SLOG_CP_TYPE_GNSS + ' '
  + SLOG_CP_TYPE_PM_SH + ' '
  + SLOG_CP_TYPE_WCN + '\n';

const SLOG_ENABLE_5MODE = SLOG_ENABLE_LOG + SLOG_CP_TYPE_5MODE + '\n';

const SLOG_ENABLE_GNSS = SLOG_ENABLE_LOG + SLOG_CP_TYPE_GNSS + '\n';

const SLOG_ENABLE_WCN = SLOG_ENABLE_LOG + SLOG_CP_TYPE_WCN + '\n';


const SLOG_DISABLE_ALL = SLOG_DISABLE_LOG
  + SLOG_CP_TYPE_5MODE + ' '
  + SLOG_CP_TYPE_AG_DSP + ' '
  + SLOG_CP_TYPE_GNSS + ' '
  + SLOG_CP_TYPE_PM_SH + ' '
  + SLOG_CP_TYPE_WCN + '\n';

const SLOG_DISABLE_5MODE = SLOG_DISABLE_LOG + SLOG_CP_TYPE_5MODE + '\n';

const SLOG_DISABLE_GNSS = SLOG_DISABLE_LOG + SLOG_CP_TYPE_GNSS + '\n';

const SLOG_DISABLE_WCN = SLOG_DISABLE_LOG + SLOG_CP_TYPE_WCN + '\n';


const SLOG_CLEAR = SLOG_CLEAN;

const SLOG_GET_LOG_PATH = SLOG_GET_MD_STOR_POS;

const SLOG_GET_SINGLE_LOG_SIZE = SLOG_GET_LOG_FILE_SIZE;

const SLOG_GET_INTERNAL_TOTAL_LOG_SIZE = SLOG_GET_DATA_MAX_SIZE;

const SLOG_GET_EXTERNAL_TOTAL_LOG_SIZE = SLOG_GET_SD_MAX_SIZE;


/**
 * Need NOW !
 * @type {string}
 */
const SLOG_GET_GNSS_STATE = SLOG_GET_LOG_STATE + SLOG_CP_TYPE_GNSS;

const SLOG_GET_5MODE_STATE = SLOG_GET_LOG_STATE + SLOG_CP_TYPE_5MODE + '\n';

const SLOG_SET_LOG_PATH = SLOG_SET_MD_STOR_POS;

const SLOG_SET_SINGLE_LOG_SIZE = SLOG_SET_LOG_FILE_SIZE;

const SLOG_SET_EXTERNAL_TOTAL_LOG_SIZE = SLOG_SET_SD_MAX_SIZE;

const SLOG_SET_INTERNAL_TOTAL_LOG_SIZE = SLOG_SET_DATA_MAX_SIZE;


/****************************************************  CAP LOG ********************************************************/

const CAP_GET_STATE = '';

const CAP_ENABLE = '';

const CAP_DISABLE = '';


/**************************************************   WCN  LOG    *****************************************************/


const WCND_OPEN_CP2 = 'wcn at+armlog=1\r';

const WCND_CLOSE_CP2 = 'wcn at+armlog=0\r';

const WCND_CP2_STATUS = 'wcn at+armlog?\r';

const DUMP_WCN_ENABLE = 'wcn dump_enable';

const DUMP_WCN_MEM = 'wcn dumpmem';

/**********************************************************************************************************************/
const CALIBRATEINFO_GSMCMD = 'AT+SGMR=0,0,3,0';
const CALIBRATEINFO_LTECMD = 'AT+SGMR=0,0,3,3';

const CMD_RECORD_RESULT = 'cmd:RecordResult';    //记录结果到手机的数据库
const CMD_CHECK_BEAT = 'cmd:CheckBeat';   //握手检查
const CMD_VERSION_INFO = 'cmd:GetVersionInfo';   //读取软件版本
const CMD_CF_INFO = 'cmd:GetCFTInfo';   //读取软件版本
const CMD_MERMORY_INFO = 'cmd:GetMemoryInfo';   //读取手机存储器容量
const CMD_SIM_RESULT = 'cmd:GetSIMResult';   //判断是否识别SIM
const CMD_FLASH_INFO = 'cmd:GetTFlashInfo';   //读取T-Flash是否识别
const CMD_KEY_MODE = 'cmd:StartKeyMode';   //进入物理按键检测模式
const CMD_KEY_RESULT = 'cmd:GetKeyResult';   //查询最后一个物理按键值
const CMD_END_KEY_MODE = 'cmd:EndKeyMode';   //结束物理按键检测模式
const CMD_START_HEADSET_MODE = 'cmd:StartHeadsetMode';   //进入耳机动作检测模式
const CMD_GET_HEADSET_RESULT = 'cmd:GetHeadsetResult';   //查询最后一个耳机动作
const CMD_END_HEADSET_MODE = 'cmd:EndHeadsetMode';   //退出耳机的状态和按键测试模式

const CMD_START_LCD_MODE = 'cmd:StartLCDMode';   //显示指定图片，指定亮度
const CMD_END_LCD_MODE = 'cmd:EndLCDMode';   //退出显示图片

const CMD_START_VIBRATOR_MODE = 'cmd:StartVibrator';   //马达持续振动
const CMD_END_VIBRATOR_MODE = 'cmd:EndVibrator';   //马达停止振动

const CMD_START_FM = 'cmd:StartFM';   //指定频点播放FM（最大音量）
const CMD_END_FM = 'cmd:EndFM';   //退出FM播放

const CMD_START_FLASH_LIGHT = 'cmd:StartFlashlight';   //进入手电筒模式
const CMD_END_FLASH_LIGHT = 'cmd:EndFlashlight';   //退出手电筒模式

const CMD_START_CAMERA_SHOT = 'cmd:StartCameraShot';   //启动拍照

const CMD_START_AUDIO_PLAY = 'cmd:StartAudioPlay';   //启动音乐播放
const CMD_END_AUDIO_PLAY = 'cmd:EndAudioPlay';   //停止音乐播放

const CMD_SET_BT_ON = 'cmd:SetBTOn';   //打开蓝牙
const CMD_BT_SCAN_INFO = 'cmd:GetBTScanInfo';   //判断是否扫描到指定的蓝牙设备
const CMD_SET_BT_OFF = 'cmd:SetBTOff';   //关闭蓝牙

const CMD_GET_POWER_INFO = 'cmd:GetPowerInfo';   //获取当前电压，电流信息

const CMD_SET_WIFI_ON = 'cmd:SetWiFiOn';   //打开wifi
const CMD_START_WIFI_CONNECT = 'cmd:StartWiFiConnect';   //启动WIFI连接
const CMD_GET_WIFI_INFO = 'cmd:GetWiFiInfo';   //获取WIFI AP信息
const CMD_SET_WIFI_OFF = 'cmd:SetWiFiOff';   //关闭Wifi

const CMD_DEL_GPS_AID_DATA = 'cmd:DelGPSAidData';   //删除GPS历书/星历等辅助定位信息
const CMD_START_GPS_LOCATION = 'cmd:StartGPSLocation';   //打开并启动GPS定位
const CMD_GET_GPS_INFO = 'cmd:GetGPSInfo';   //获取GPS信息
const CMD_END_GPS_LOCATION = 'cmd:EndGPSLocation';   //退出GPS测试模式，停止定位，关闭GPS

const CMD_START_AUDIO_RECORD = 'cmd:StartAudioRecord';   //启动指定MIC的录音
const CMD_END_AUDIO_RECORD = 'cmd:EndAudioRecord';   //停止录音

const CMD_NFC_CHECK = 'cmd:NFCCheck';   //NFC测试

const CMD_GET_PHASE_INFO = 'cmd:GetPhaseInfo';   //获取站位标志位
const CMD_GET_HISTORY_INFO = 'cmd:GetHistoryInfo';   //某站位测试结果查询
const CMD_RECORD_HISTORY_INFO = 'cmd:RecordHistoryInfo';   //设置测试记录

const CMD_POWER_OFF = 'cmd:PowerOff';   //关机

const CMD_USB_CHARGE_ON = 'cmd:SetUSBChargeOn';   //USB充电开
const CMD_USB_CHARGE_OFF = 'cmd:SetUSBChargeOff';   //USB充电开


var CreateDiv = (function(){
  var instance;
  var CreateDiv = function( html ){
    if ( instance ){
      return instance;
    }
    this.html = html; this.init();
    return instance = this;
  };
  CreateDiv.prototype.init = function(){
    var div = document.createElement( 'div' );
    div.innerHTML = this.html;
    document.body.appendChild( div );
  };
  return CreateDiv;
})();



const DEBUGLOG = true;

var currentCmdKey = '';

var btTest = new BtTest();

var wifiTest = new WifiTest();

var gpsTest = new GPSTest();

var fmtest = new FMTest();

var recorderTest = new Recorder();

var commander_GetHeadsetResult;

var commander_lcd_pic_name;
var commander_lcd_screen_value;

var GetKeyResultLastkey;

var commander_device_sn;

var resultDic = {};
var recordHistoryDic = {};

var storage = navigator.getDeviceStorages('sdcard');

var vibrator_timer;
var vibrator_timeout;

var commander_camera_shot_timeout;

function printLog(msg) {
  DEBUGLOG && console.log('<autoslt>' + msg);
}

function Commander(ip, port) {
  printLog('commander');
  this._socket = undefined;
  this._ip = ip;
  this._port = port;
}

Commander.prototype.getCurrentCmd = function() {
  return currentCmdKey;
};

Commander.prototype.getYlogPort = function() {
  return YLOG_PORT;
};

Commander.prototype.getSlogPort = function() {
  return SLOG_PORT;
};

Commander.prototype.getIP = function() {
  return IP_ADDRESS;
};

Commander.prototype.connect = function() {
  printLog(this._ip + this._port);
  this._socket = window.navigator.mozTCPSocket.open(this._ip, this._port);
  return this;
};

Commander.prototype.ondata = function(callback) {
  if (!this._socket) {
    return null;
  }
  this._socket.ondata = callback;
  return this;
};

Commander.prototype.onerror = function(callback) {
  if (!this._socket) {
    return null;
  }
  this._socket.onerror = callback;
  return this;
};

Commander.prototype.onopen = function(callback) {
  if (!this._socket) {
    return null;
  }
  this._socket.onopen = callback;
  return this;
};

Commander.prototype.onclose = function(callback) {
  if (!this._socket) {
    return null;
  }
  this._socket.onclose = callback;
  return this;
};

Commander.prototype.send = function(message, forced) {
  if (!this._socket) {
    printLog('client - Socket have not been initialized');
    return;
  }
  if (!message) {
    printLog('client - message is empty');
    return;
  }
  if (forced == undefined || forced == null) {
    forced = false;
  }
  printLog('client - send message = ' + message);
  if (this.hasConnected() || forced) {
    this._socket.send(message);
  } else {
    printLog('client - connection has not established');
  }
};

Commander.prototype.disconnect = function() {
  if (!this._socket) {
    printLog('client - Socket have not been initialized');
    return;
  }
  this._socket.close();
  this._socket = null;
};

Commander.prototype.hasConnected = function() {
  if (!this._socket) {
    printLog('client - Socket have not been initialized');
    return false;
  }
  printLog('this._socket.readyState = ' + this._socket.readyState);
  return this._socket.readyState == 'open';
};

Commander.parseCmd = function (cmd) {
  var cmdList = cmd.split(',');
  var result = '';
  for (var s in cmdList) {
    var keyAndValue = cmdList[s].split(':');
    if (keyAndValue.length !== 2){
      continue;
    }
    var key = keyAndValue[0].trim();
    var value = keyAndValue[1].trim();
    if (key === 'param'){
      result = value;
      break;
    }
  }
  return result;
};

Commander.prototype.mockServer = function(port) {
  var serverSocket = window.navigator.mozTCPSocket.listen(port);
  serverSocket.onconnect = function(event) {
    printLog('server -----------------------------');
    if (event && event.socket) {
      var socket = event.socket;
      printLog(' Server - connection');
      socket.onclose = function() {
        printLog('server - disconnected!');
      };
      socket.ondata = function(event) {
        printLog(' server receive- ' + event.data);
        currentCmdKey = event.data;

        if (event.data.indexOf(CMD_RECORD_RESULT) > -1) {
          var cmd = Commander.parseCmd(event.data);
          var list = cmd.split('^');
          var dic = {};
          var testcase = list[0];

          var result = list[1];
          dic.result = result;

          var note;
          if (list.length > 2) {
            note = list[2];
            dic['note'] = note;
            dic.note = note;
          }
          printLog(' testcase:'+testcase+';result:'+result+';note:'+note);

          resultDic[testcase] = dic;

          printLog(' dic is :'+JSON.stringify(dic));

          printLog(' resultDic is :'+JSON.stringify(resultDic));

          asyncStorage.setItem(AUTOSLT_RESULT, JSON.stringify(resultDic));

          socket.send('cmd:RecordResult,status:ok');

          return;
        }else if(event.data.indexOf(CMD_SIM_RESULT) > -1) {
          var simNum = Commander.parseCmd(event.data);
          if (!simNum) {
            socket.send('cmd:invaid');
            return;
          }
          var conn = window.navigator.mozMobileConnections;

          var result = 'cmd:GetSIMResult,status:ok,result:';
          for (var i = 0; i < simNum; i++) {
            if (conn && conn[i] && conn[i].iccId) {
              result = result+'pass^';
            }else {
              result = result+'fail^';
            }
          }
          socket.send(result);
          return;
        }else if(event.data.indexOf(CMD_START_LCD_MODE) > -1) {

          if (!storage || storage.length < 2 || 'undefined' === storage[storage.length - 1]) {
            printLog('daihai>CMD_START_LCD_MODE> no sdcard');
            socket.send('cmd:StartLCDMode,status:error');
            return;
          }
          var value = Commander.parseCmd(event.data);
          var list = value.split('^');
          commander_lcd_pic_name = list[0];
          commander_lcd_screen_value = list[1];

          AutoSlt.testForDeatil('lcd');

          window.addEventListener('lcdtest', function(e) {
            printLog('>lcdtest status>'+e.detail.status);

            if (e.detail.status === 'ok') {
              socket.send('cmd:StartLCDMode,status:ok');
            }else if (e.detail.status === 'error'){
              socket.send('cmd:StartLCDMode,status:error');
            }
          });
          return;
        }else if(event.data.indexOf(CMD_START_FM) > -1) {

          var fmValue = Commander.parseCmd(event.data);
          fmtest.turnOn(fmValue).then(function (status) {
            if (status === 'ok'){
              socket.send('cmd:StartFM,status:ok,result:pass^');
            }else if (status === 'fail'){
              socket.send('cmd:StartFM,status:ok,result:fail^');
            }else if (status === 'error'){
              socket.send('cmd:StartFM,status:error');
            }
          });
          return;
        }else if(event.data.indexOf(CMD_START_CAMERA_SHOT) > -1) {
          if (!storage) {
            printLog('daihai>CMD_START_CAMERA_SHOT> storage is null');
            socket.send('cmd:StartCameraShot,status:error');
            return;
          }
          var value = Commander.parseCmd(event.data);
          var list = value.split('^');
          var cameraType = list[0];
          if (list.length === 2){
            commander_camera_shot_timeout = list[1];
          }
          printLog('daihai>CMD_START_CAMERA_SHOT> cameraType:'+cameraType);

          if (cameraType === 'front'){
            var camera = navigator.mozCameras.getListOfCameras();
            if (camera && camera.length < 2) {
              socket.send('cmd:StartCameraShot,status:error');
              return;
            }
            AutoSlt.testForDeatil('camera_front');
          }else {
            AutoSlt.testForDeatil('camera');
          }
          window.addEventListener('cameraTest', function(e) {
            printLog('>CMD_START_CAMERA_SHOT status>'+e.detail.status);
            if (e.detail.status === 'ok') {
              socket.send('cmd:StartCameraShot,status:ok,result:/sdcard/slt/camerashot_'+cameraType+'.jpg^');
            }else if (e.detail.status === 'fail'){
              socket.send('cmd:StartCameraShot,status:ok,result:fail^');
            }else if (e.detail.status === 'error'){
              socket.send('cmd:StartCameraShot,status:error');
            }

          });
          return;
        }else if(event.data.indexOf(CMD_START_AUDIO_PLAY) > -1) {

          var audio_type;
          var audio_volume;
          var music_name;
          var sdCard;

          var value = Commander.parseCmd(event.data);
          var list = value.split('^');
          audio_type = list[0];
          audio_volume = list[1];
          music_name = list[2];

          if (music_name.indexOf('sdcard1') > -1) {
            if (!storage || storage.length < 2 || 'undefined' === storage[storage.length - 1]) {
              printLog('>> no sdcard');
              socket.send('cmd:StartAudioPlay,status:error');
              return;
            }
            sdCard = storage[storage.length - 1];
          }else {
            sdCard = storage[0];
          }
          if (audio_type === 'speaker'){
            navigator.mozTelephony.speakerEnabled = true;

          }else if (audio_type === 'receiver' || audio_type === 'headset'){
            navigator.mozTelephony.speakerEnabled = false;
          }
          printLog('music path >'+music_name);

          var settings = window.navigator.mozSettings;
          if (settings) {
            settings.createLock().set({'audio.volume.content': parseInt(audio_volume)}).then((result) => {

              sdCard.available().onsuccess = function () {
              printLog('>> sdCard available');
              let request = sdCard.get(music_name);
              request.onsuccess = function _success() {
                if (navigator.jrdExtension) {
                  navigator.jrdExtension.startForceInCall();
                }
                var reader = new FileReader();
                reader.onload = function () {
                  var audio = document.getElementById('audio-element-id');
                  audio.src = reader.result;
                  audio.play();
                  socket.send('cmd:StartAudioPlay,status:ok');
                  printLog('>> load music success');
                };
                reader.readAsDataURL(this.result);
              };
              request.onerror = function _error() {
                printLog('>> sdCard onerror');
                socket.send('cmd:StartAudioPlay,status:error');
              };
            };

          });
          }

          return;
        }else if(event.data.indexOf(CMD_BT_SCAN_INFO) > -1) {
          var index = event.data.indexOf('param:');
          index = index+6;
          var deviceMac = event.data.slice(index);
          printLog('search deviceMac is '+deviceMac);

          var rssi = btTest.scanDevice(deviceMac);
          printLog('scanDevice result :'+rssi);

          if (rssi !== ''){
            socket.send('cmd:GetBTScanInfo,status:ok,result:'+rssi+'^');
          }else {
            socket.send('cmd:GetBTScanInfo,status:error');
          }
          return;
        }else if(event.data.indexOf(CMD_START_WIFI_CONNECT) > -1) {

          var value = Commander.parseCmd(event.data);
          if (value.indexOf('^')){
            var list = value.split('^');
            wifiTest.connectWifi(list[0],list[1]).then(function (status) {
              if (status === 'ok'){
                socket.send('cmd:StartWiFiConnect,status:ok,result:pass^');

              }else if (status === 'fail'){
                socket.send('cmd:StartWiFiConnect,status:ok,result:fail^');

              }else if (status === 'error'){
                socket.send('cmd:StartWiFiConnect,status:error');
              }
            });
          }else {
            wifiTest.connectWifi(value,'').then(function (status) {
              if (status === 'ok'){
                socket.send('cmd:StartWiFiConnect,status:ok,result:pass^');

              }else if (status === 'fail'){
                socket.send('cmd:StartWiFiConnect,status:ok,result:fail^');

              }else if (status === 'error'){
                socket.send('cmd:StartWiFiConnect,status:error');
              }
            });
          }
          return;
        }else if(event.data.indexOf(CMD_GET_WIFI_INFO) > -1) {
          var ssid = Commander.parseCmd(event.data);
          printLog('GetWiFiInfo start');
          var result = wifiTest.getWifiApInfo(ssid);
          if (result.indexOf('result') > -1) {
            socket.send('cmd:GetWiFiInfo,status:ok,'+result+'^');
          }else if (result === 'fail') {
            socket.send('cmd:GetWiFiInfo,status:ok,result:fail^');
          }else if (result === 'error') {
            socket.send('cmd:GetWiFiInfo,status:error');
          }
          return;
        }else if(event.data.indexOf(CMD_GET_GPS_INFO) > -1) {
          var status = Commander.parseCmd(event.data);
          if (status === 'satelliteInfo') {
            var result = gpsTest.getSatelliteInfo();
            if (result === '0' || result === ''){
              socket.send('cmd:GetGPSInfo,status:ok,result:fail^');
            }else {
              socket.send('cmd:GetGPSInfo,status:ok,result:'+result);
            }
          }else if (status === 'LocationInfo'){
            var result = gpsTest.getLocationInfo();
            if (result === 'fail'){
              socket.send('cmd:GetGPSInfo,status:ok,result:fail^');
            }else {
              socket.send('cmd:GetGPSInfo,status:ok,result:'+result);
            }
          }
          return;
        }else if(event.data.indexOf(CMD_START_AUDIO_RECORD) > -1) {
          if (!storage) {
            printLog('daihai>CMD_START_AUDIO_RECORD> storage is null');
            socket.send('cmd:StartAudioRecord,status:error');
            return;
          }

          var type = Commander.parseCmd(event.data);

          recorderTest.start(type).then(function (status) {
            if (status === 'ok'){
              socket.send('cmd:StartAudioRecord,status:ok');
            }else if (status === 'error'){
              socket.send('cmd:StartAudioRecord,status:error');
            }
          });
          return;
        }else if(event.data.indexOf(CMD_RECORD_HISTORY_INFO) > -1) {
          var data = Commander.parseCmd(event.data);
          var list = data.split('^');

          var dic = {};
          dic.id = list[1];
          dic.result = list[2];

          recordHistoryDic[list[0]] = dic;
          asyncStorage.setItem(RECORD_HISTORY, JSON.stringify(recordHistoryDic));

          var elementID = list[0]+'_ID';

          var element = document.getElementById(elementID);
          if (element) {
            element.innerText = list[2];
          }

          var mmiELement = document.getElementById('MMI_ID');
          var visionELement = document.getElementById('Vision_ID');
          var audioELement = document.getElementById('Audio_ID');
          var antennaELement = document.getElementById('Antenna_ID');
          var wcnELement = document.getElementById('WCN_ID');
          var allResult = document.getElementById('allResult');

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

          socket.send('cmd:RecordHistoryInfo,status:ok');
          return;
        }else if(event.data.indexOf(CMD_GET_HISTORY_INFO) > -1) {
          var data = Commander.parseCmd(event.data);

          asyncStorage.getItem(RECORD_HISTORY, (value) => {
            printLog(' asyncStorage.getItem RECORD_HISTORY:'+value);
          if(value) {
            var resultDic = JSON.parse(value);
            var dic = resultDic[data];
            if (dic) {
              printLog('CMD_GET_HISTORY_INFO asyncStorage.getItem dic:'+dic);
              socket.send('cmd:GetHistoryInfo,status:ok,result:'+dic.id+'^'+commander_device_sn+'^'+dic.result+'^');
            }else {
              socket.send('cmd:GetHistoryInfo,status:error');
              printLog('CMD_GET_HISTORY_INFO asyncStorage.getItem value is null');
            }
          }else {
            socket.send('cmd:GetHistoryInfo,status:error');
            printLog('CMD_GET_HISTORY_INFO asyncStorage.getItem value is null');
          }
        });
          return;
        }else if(event.data.indexOf('addnew') > -1) {

        }

        switch (event.data) {
          case CMD_CHECK_BEAT:
            socket.send('cmd:CheckBeat,status:ok');
            break;

          case CMD_VERSION_INFO:
            let _lock = navigator.mozSettings.createLock();
            const BUILD_NUMBER_KEY = 'deviceinfo.build_number';
            const DEVICES_OS_KEY = 'deviceinfo.os';
            const HARDWARE_KEY = 'deviceinfo.hardware';
            const SOFTWARE_KEY = 'deviceinfo.software';

            Promise.all([
              _lock.get(BUILD_NUMBER_KEY),
              _lock.get(DEVICES_OS_KEY),
              _lock.get(HARDWARE_KEY),
              _lock.get(SOFTWARE_KEY),
            ]).then((results) => {

              let buildNumber = results[0][BUILD_NUMBER_KEY];
            let devicesOs = results[1][DEVICES_OS_KEY];
            let hardware = results[2][HARDWARE_KEY];
            let software = results[3][SOFTWARE_KEY];

            socket.send('cmd:GetVersionInfo,status:ok,result:build number:'+buildNumber+'^os:'+devicesOs+'^hardware:'+hardware+'^software:'+software+'^Device Sn:'+commander_device_sn+'^');

        }).catch((error) => {
          socket.send('cmd:GetVersionInfo,status:error');
        printLog('Failed to get device info error: ' + error.name);});
        break;

        case CMD_MERMORY_INFO:
          var deviceStorage = navigator.getDeviceStorage('apps');

        if (!deviceStorage) {
          socket.send('cmd:GetMemoryInfo,status:error');
          return;
        }
        var freeSize = null;
        var usedSize = null;
        var totalSize = null;

        deviceStorage.freeSpace().onsuccess = function(e) {
          freeSize = e.target.result;
          deviceStorage.usedSpace().onsuccess = function(e) {
            usedSize = e.target.result;
            // calculate the percentage to show a space usage bar
            totalSize = usedSize + freeSize;

            var fixedDigits_free = (freeSize < 1024 * 1024) ? 0 : 2;
            var sizeInfo_free = FileSizeFormatter.getReadableFileSize(freeSize, fixedDigits_free);

            var fixedDigits_total = (totalSize < 1024 * 1024) ? 0 : 2;
            var sizeInfo_total = FileSizeFormatter.getReadableFileSize(totalSize, fixedDigits_total);
            socket.send('cmd:GetMemoryInfo,status:ok,result:RAM:'+sizeInfo_total.size+sizeInfo_total.unit+'^ROM:'+sizeInfo_free.size+sizeInfo_free.unit+'^');
          }.bind(this);
        }.bind(this);

        break;
        case CMD_CF_INFO:

          var isLTEOnly = true;

        RemoteHelper.getproperty('persist.radio.ssda.testmode', (value) => {
          printLog('persist.radio.ssda.testmode='+value);
        isLTEOnly = (value === '6');
        if (!isLTEOnly) {
          var result = '';
          RemoteHelper.sendATCommand(CALIBRATEINFO_GSMCMD, (info) => {
            result = info;
          if (info === 'ERROR'){
            socket.send('cmd:GetCFTInfo,status:error');
            return;
          }
          RemoteHelper.sendATCommand(CALIBRATEINFO_LTECMD, (info) => {
            result = result+info;
          socket.send('cmd:GetCFTInfo,status:ok,result:'+result+'^');
          printLog('RemoteHelperManager>>'+result);
        });
        });

        }else {
          RemoteHelper.sendATCommand(CALIBRATEINFO_LTECMD, (info) => {
            if (info === 'ERROR'){
            socket.send('cmd:GetCFTInfo,status:error');
          }else {
            socket.send('cmd:GetCFTInfo,status:ok,result:'+info+'^');
          }
          printLog('isLTEOnly>RemoteHelperManager>>'+info);
        });
        }
      });

        break;
        case CMD_FLASH_INFO:
          if (!storage || storage.length < 2 || 'undefined' === storage[storage.length - 1]) {
            socket.send('cmd:GetTFlashInfo,status:error');
            return;
          }else {
            var freeSize = null;
            var usedSize = null;
            var totalSize = null;

            storage[1].freeSpace().onsuccess = function(e) {
              freeSize = e.target.result;
              storage[1].usedSpace().onsuccess = function(e) {
                usedSize = e.target.result;
                // calculate the percentage to show a space usage bar
                totalSize = usedSize + freeSize;
                var fixedDigits_total = (totalSize < 1024 * 1024) ? 0 : 2;
                var sizeInfo_total = FileSizeFormatter.getReadableFileSize(totalSize, fixedDigits_total);
                socket.send('cmd:GetTFlashInfo,status:ok,result:'+sizeInfo_total.size+sizeInfo_total.unit+'^');
              }.bind(this);
            }.bind(this);

            storage[1].freeSpace().onerror = function (e) {
              socket.send('cmd:GetTFlashInfo,status:error');
            }.bind(this);
          }
        break;
        case CMD_KEY_MODE:
          socket.send('cmd:StartKeyMode,status:ok');
        break;
        case CMD_KEY_RESULT:
          if (GetKeyResultLastkey) {
            socket.send('cmd:GetKeyResult,status:ok,result:'+GetKeyResultLastkey+'^');
          }else {
            socket.send('cmd:GetKeyResult,status:ok,result:null^');
          }
        break;

        case  CMD_END_KEY_MODE:
          GetKeyResultLastkey = null;
        socket.send('cmd:EndKeyMode,status:ok');
        break;

        case CMD_START_HEADSET_MODE:
          var acm = navigator.mozAudioChannelManager;
        if (acm) {
          if (acm.headphones) {
            commander_GetHeadsetResult = 'PlugIn';
          } else {
            commander_GetHeadsetResult = 'PlugOut';
          }
          acm.addEventListener('headphoneschange', function () {
            if (acm.headphones) {
              commander_GetHeadsetResult = 'PlugIn';
            } else {
              commander_GetHeadsetResult = 'PlugOut';
            }
          });

          window.addEventListener('keydown', function (evt) {
            printLog('CMD_START_HEADSET_MODE>>' + evt.key);
            if (evt.key === 'HeadsetHook') {
              commander_GetHeadsetResult = 'Hook';
            } else if (evt.key === 'VolumeDown') {
              commander_GetHeadsetResult = 'Vol-';
            } else if (evt.key === 'VolumeUp') {
              commander_GetHeadsetResult = 'Vol+'
            }
          });
        }
        socket.send('cmd:StartHeadsetMode,status:ok');

        break;

        case CMD_GET_HEADSET_RESULT:
          if (commander_GetHeadsetResult) {
            socket.send('cmd:GetHeadsetResult,status:ok,result:'+commander_GetHeadsetResult+'^');
          }else {
            var acm = navigator.mozAudioChannelManager;
            if(acm){
              if (acm.headphones){
                socket.send('cmd:GetHeadsetResult,status:ok,result:PlugIn^');
              } else {
                socket.send('cmd:GetHeadsetResult,status:ok,result:PlugOut^');
              }
            }else {
              socket.send('cmd:GetHeadsetResult,status:error');
            }
          }

        break;

        case CMD_END_HEADSET_MODE:
          commander_GetHeadsetResult = null;
        socket.send('cmd:EndHeadsetMode,status:ok');

        break;

        case CMD_END_LCD_MODE:
          AutoSlt.closeTest();

        socket.send('cmd:EndLCDMode,status:ok');

        break;

        case CMD_START_VIBRATOR_MODE:

          printLog('start vibrate');

        // var isVibrate = navigator.vibrate(500);

        vibrator_timer = setInterval(function () {
          navigator.vibrate(500);
        }, 500);

        socket.send('cmd:StartVibrator,status:ok');

        vibrator_timeout = window.setTimeout(function () {
          if (vibrator_timer) {
            clearInterval(vibrator_timer);
            vibrator_timer = null;
          }
        }, 5000);

        printLog('result vibrate'+isVibrate);
        break;

        case CMD_END_VIBRATOR_MODE:
          if (vibrator_timer) {
            clearInterval(vibrator_timer);
            vibrator_timer = null;
          }
        if (vibrator_timeout) {
          clearTimeout(vibrator_timeout);
          vibrator_timeout = null;
        }
        socket.send('cmd:EndVibrator,status:ok');
        break;

        case CMD_END_FM:
          fmtest.turnOff().then(function (status) {
            if (status === 'ok'){
              socket.send('cmd:EndFM,status:ok,result:pass^');
            }else if (status === 'fail'){
              socket.send('cmd:EndFM,status:ok,result:fail^');
            }else if (status === 'error'){
              socket.send('cmd:EndFM,status:error');
            }
          });
        break;

        case CMD_START_FLASH_LIGHT:

          navigator.getFlashlightManager().then(FlashlightManager => {
            if (FlashlightManager) {
              FlashlightManager.flashlightEnabled = true;
              socket.send('cmd:StartFlashlight,status:ok');
            }else {
              printLog('CMD_START_FLASH_LIGHT FlashlightManager is null');
        socket.send('cmd:StartFlashlight,status:error');
      }
      });

        break;
        case CMD_END_FLASH_LIGHT:
          navigator.getFlashlightManager().then(FlashlightManager => {
            if (FlashlightManager) {
              FlashlightManager.flashlightEnabled = false;
              socket.send('cmd:EndFlashlight,status:ok');
            }else {
              printLog('CMD_END_FLASH_LIGHT FlashlightManager is null');
        socket.send('cmd:EndFlashlight,status:error');
      }
      });
        break;

        case CMD_END_AUDIO_PLAY:
          printLog('CMD_END_AUDIO_PLAY');

        var audio = document.getElementById('audio-element-id');
        audio.pause();
        audio.removeAttribute('src');
        navigator.jrdExtension.stopForceInCall();

        socket.send('cmd:EndAudioPlay,status:ok');

        break;

        case CMD_SET_BT_ON:

          btTest.openBT().then(function(data){
            if (data === 'ok'){
              socket.send('cmd:SetBTOn,status:ok');
            }else {
              socket.send('cmd:SetBTOn,status:error');
            }
          });

        break;

        case CMD_SET_BT_OFF:

          btTest.closeBT().then(function(data){
            if (data === 'ok'){
              socket.send('cmd:SetBTOff,status:ok');
            }else {
              socket.send('cmd:SetBTOff,status:error');
            }
          });

        break;

        case CMD_GET_POWER_INFO:

          var result = '';
        RemoteHelper.readFile('/sys/class/power_supply/sprdfgu/fgu_vol', (current) => {
          printLog('fgu_vol>'+current);
        if (current.indexOf('msg') > -1){
          socket.send('cmd:GetPowerInfo,status:error');
          return;
        }
        result = current+'^';
        RemoteHelper.readFile('/sys/class/power_supply/sprdfgu/fgu_current', (current1) => {
          printLog('fgu_current>'+current1);
        if (current.indexOf('msg') > -1){

          socket.send('cmd:GetPowerInfo,status:error');
          return;
        }
        result = result+current1+'^';
        RemoteHelper.readFile('/sys/class/power_supply/battery/charger_voltage', (current2) => {
          printLog('charger_voltage>'+current2);
        if (current.indexOf('msg') > -1){

          socket.send('cmd:GetPowerInfo,status:error');
          return;
        }
        result = result+current2+'^';
        RemoteHelper.readFile('/sys/class/power_supply/battery/real_time_current', (current3) => {
          printLog('real_time_current>'+current3);
        if (current.indexOf('msg') > -1){

          socket.send('cmd:GetPowerInfo,status:error');
          return;
        }
        result = result+current3+'^';
        socket.send('cmd:GetPowerInfo,status:ok,result:'+result);

      });
      });
      });
      });

        break;

        case CMD_SET_WIFI_ON:

          wifiTest.openWifi().then(function(data){
            if (data === 'ok'){
              socket.send('cmd:SetWiFiOn,status:ok');
            }else {
              socket.send('cmd:SetWiFiOn,status:error');
            }
          });
        break

        case CMD_SET_WIFI_OFF:
          wifiTest.closeWifi().then(function(data){
            if (data === 'ok'){
              socket.send('cmd:SetWiFiOff,status:ok');
            }else {
              socket.send('cmd:SetWiFiOff,status:error');
            }
          });
        break;

        case CMD_DEL_GPS_AID_DATA:
          gpsTest.deleteGpsInfo().then(function(data){
            if (data === 'ok'){
              socket.send('cmd:DelGPSAidData,status:ok');
            }else {
              socket.send('cmd:DelGPSAidData,status:error');
            }
          });
        break;

        case CMD_START_GPS_LOCATION:
          gpsTest.openGps().then(function(data){
            if (data === 'ok'){
              socket.send('cmd:StartGPSLocation,status:ok');
            }else {
              socket.send('cmd:StartGPSLocation,status:error');
            }
          });
        break;

        case CMD_END_GPS_LOCATION:
          gpsTest.closeGps().then(function(data){
            if (data === 'ok'){
              socket.send('cmd:EndGPSLocation,status:ok');
            }else {
              socket.send('cmd:EndGPSLocation,status:error');
            }
          });
        break;

        case CMD_END_AUDIO_RECORD:
          recorderTest.stop().then(function (status) {
            if (status === 'ok'){
              socket.send('cmd:EndAudioRecord,status:ok');
            }else {
              socket.send('cmd:EndAudioRecord,status:error');
            }
          });
        break;

        case CMD_NFC_CHECK:
          navigator.jrdExtension.execCmdLE(['nfc_test'], 1).then((result) => {
            // Read the NFC testing result
            printLog('NfcTest execute command success: ');
        var nfcString = navigator.jrdExtension.fileReadLE('nfcInfo');
        if (!nfcString || nfcString === '') {
          printLog('NfcTest can\'t get file content.');
          socket.send('cmd:NFCCheck,status:error');
          return;
        }

        printLog('nfc test result:' + nfcString);

        // XXX: It's a workaround to display cureent NFC testing result
        if (nfcString.indexOf('Error') >= 0) {
          printLog('NfcTest testing failed reason: device don\'t support NFC.');
          socket.send('cmd:NFCCheck,status:error');
        }

        if (nfcString.indexOf('Unknown') >= 0) {
          printLog('NfcTest testing failed reason: Unknown');
          socket.send('cmd:NFCCheck,status:error');
        }

        if (nfcString.indexOf('FAILED') >= 0) {
          printLog('NfcTest testing failed.');
          socket.send('cmd:NFCCheck,status:ok,status:fail^');
        }

        if (nfcString.indexOf('PASSED') >= 0) {
          printLog('NfcTest testing PASSED.');
          socket.send('cmd:NFCCheck,status:ok,status:pass^');
        }
      }).catch((error) => {
          printLog('NfcTest execute command error: ' + error.name);
        socket.send('cmd:NFCCheck,status:error');
      });
        break;
        case CMD_GET_PHASE_INFO:
          RemoteHelper.showbinfile((response) => {
            response = response.replace(/OK/g, '');
        var array = response.split('\n');
        var s = '';
        array.forEach(function(str) {
          str = str.replace(/[^0-9a-zA-Z]/ig,'');
          console.log('autoslt>forEach info>'+str);

          if (str.indexOf('NotPass') != -1) {
            var index = str.indexOf('NotPass');
            str = str.slice(0,index);
            s = s+str+':';
            s = s+'FAIL.';
          } else if (str.indexOf('Pass') != -1) {
            var index = str.indexOf('Pass');
            str = str.slice(0,index);
            s = s+str+':';
            s = s+'PASS.';
          } else if (str.indexOf('Nottest') != -1) {
            var index = str.indexOf('Nottest');
            str = str.slice(0,index);
            s = s+str+':';
            s = s+'UnTested.';
          }
        });
        printLog('CMD_GET_PHASE_INFO: ' + s);

        socket.send('cmd:GetPhaseInfo,status:ok,result:'+s+'^');

      }, () => {
          socket.send('cmd:GetPhaseInfo,status:error');
        });
        break;

        case CMD_POWER_OFF:

          break;

        case CMD_USB_CHARGE_ON:
          RemoteHelper.writeFile(0,'/sys/class/power_supply/battery/stop_charge', (info) => {
            printLog('CMD_USB_CHARGE_ON: ' + info);
        if (info.indexOf('msg') > -1){
          socket.send('cmd:SetUSBChargeOn,status:error');
        }else {
          socket.send('cmd:SetUSBChargeOn,status:ok');
        }

      });
        break;

        case CMD_USB_CHARGE_OFF:
          RemoteHelper.writeFile(1,'/sys/class/power_supply/battery/stop_charge', (info) => {
            printLog('CMD_USB_CHARGE_ON: ' + info);
        if (info.indexOf('msg') > -1){
          socket.send('cmd:SetUSBChargeOff,status:error');
        }else {
          socket.send('cmd:SetUSBChargeOff,status:ok');
        }
      });
        break;

        default:
        socket.send('cmd:invalid');

        break;
      }
      };

    }
  };
};

// var ProxySingletonCommander = (function () {
//   var instance;
//   return function () {
//     if (!instance) {
//       instance = new Commander(IP_ADDRESS, AUTOSLT_PORT)
//     }
//     return instance;
//   }
// })();


/**
 * Helper class for formatting file size strings
 * required by *_storage.js
 */

var FileSizeFormatter = (function FileSizeFormatter() {
  function getReadableFileSize(bytes, digits) { // in: size in Bytes
    if (bytes === undefined)
      return {};

    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var size, e;
    if (bytes) {
      e = Math.floor(Math.log(bytes) / Math.log(1024));
      size = (bytes / Math.pow(1024, e)).toFixed(digits || 0);
    } else {
      e = 0;
      size = '0';
    }

    return {
      size: size,
      unit: units[e]
    };
  }

  return { getReadableFileSize: getReadableFileSize };
})();
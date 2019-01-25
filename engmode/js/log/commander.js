'use strict';

const IP_ADDRESS = '127.0.0.1';
// const YLOG_PORT = 8099;
const SLOG_PORT = 4321;
// const WCND_PORT = 4045;

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

/**
 * @total
 *
 * GET_DATA_MAX_SIZE
 * OK <size>
 * @type {string}
 */
const SLOG_GET_DATA_MAX_SIZE = 'GET_DATA_MAX_SIZE\n';

const SLOG_GET_DUMP_SAVE_STATE = '';

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

const DEBUG = true;

function printLog(msg) {
  DEBUG && console.log(msg);
}

function Commander(ip, port) {
  this._socket = undefined;
  this._ip = ip;
  this._port = port;
}

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

Commander.prototype.mockServer = function(port) {
  var serverSocket = window.navigator.mozTCPSocket.listen(port);
  serverSocket.onconnect = function(event) {
    printLog('server -----------------------------');
    if (event && event.socket) {
      var socket = event.socket;
      printLog('Server - connection');

      socket.ondata = function(event) {
        printLog('server receive- ' + event.data);
        if (event.data.indexOf(SLOG_CP_TYPE_GNSS) > -1) {
          socket.send('OK ON\n');
        } else {
          socket.send('OK 1024\n');
        }
      };

      socket.onclose = function() {
        printLog('server - disconnected!');
      };
    }
  };
};

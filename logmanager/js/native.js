'use strict';

(function(exports) {
  function debug(s) {
    if (DEBUG) {
      dump('<LogManagerAPP> ------: [native.js] = ' + s + '\n');
    }
  }

  var Native = {
    slogAction: {},
    messageFlag: {
      'ylog': '',
      'slog': '',
      'wcnd': '',
      'modemd': ''
    },

    init: function() {
      window.addEventListener('sendYlogCommand', this);
      window.addEventListener('sendSlogCommand', this);
      window.addEventListener('sendWcndCommand', this);
      window.addEventListener('sendModemdCommand', this);
      window.addEventListener('sendATCommand', this);
      window.addEventListener('sendEngmodedCommand', this);
      window.addEventListener('modemToPC', this);

      this.initLogHandlers();
      this.initStates();
      this.initSlogAction();
    },

    initLogHandlers: function() {
      // function initYlog() {
      //   ylogCommander.ondata(function(event) {
      //     if (!event.data) {
      //       return;
      //     }
      //     if (typeof event.data === 'string') {
      //       debug('ylog - data -full: ' + event.data);
      //       let data = event.data;
      //       let index = data.indexOf(YLOG_EXIT_FLAG);
      //       data = data.substring(0, index - 1);
      //       debug('ylog - data - \n' + data);
      //
      //       switch (Native.messageFlag.ylog) {
      //         case YLOG_TCPDUMP_START:
      //           states.set('tcpiplog', (data === '[ tcpdump ] = running'));
      //           break;
      //         case YLOG_TCPDUMP_STOP:
      //           states.set('tcpiplog', (data === '[ tcpdump ] = stop'));
      //           break;
      //         case YLOG_HCIDUMP_START:
      //           states.set('bthcilog', (data === '[ hcidump ] = running'));
      //           break;
      //         case YLOG_HCIDUMP_STOP:
      //           states.set('bthcilog', (data === '[ hcidump ] = stop'));
      //           break;
      //         case YLOG_ALL_START:
      //           debug('get ylog all start ondata success');
      //           // Ylog all start command will effect tcpip or bthci log
      //           states.set('bthcilog', true);
      //           states.set('tcpiplog', true);
      //           break;
      //         case YLOG_ALL_STOP:
      //           // Ylog all stop command WON'T effect tcpip or bthci log
      //           debug('get ylog all stop ondata success');
      //           break;
      //         default:
      //           break;
      //       }
      //     } else {
      //       debug('ylog - get a unit8array');
      //     }
      //   });
      //   ylogCommander.onopen(function() {debug('ylog - connected!')});
      //   ylogCommander.onerror(function(event) {debug('ylog - error = ' +
      //     event.type + ', data = ' + event.data)});
      //   ylogCommander.onclose(function() {debug('ylog - disconnected!')});
      // }

      // function initSlog() {
      //   slogCommander.ondata(function(event) {
      //     if (!event.data) {
      //       return;
      //     }
      //     if (typeof event.data === 'string') {
      //       let data = event.data;
      //       let index = data.length;
      //       data = data.substring(0, index - 1);
      //       debug('slog - ondata - ' + data + ' CommandMessage:' + Native.messageFlag.slog);
      //
      //       switch (Native.messageFlag.slog) {
      //         case SLOG_MSG_GET:
      //           states.set('modemlog', (data.indexOf('OK ON') > -1));
      //           break;
      //         case SLOG_MSG_START:
      //         case SLOG_MSG_STOP:
      //         case SLOG_MSG_CLEAR:
      //           break;
      //         case SLOG_MSG_GNSS_CLOSE:
      //           if (data === 'OK') {
      //             states.set('gnsslog', false);
      //           }
      //           break;
      //         case SLOG_MSG_GNSS_OPEN:
      //           if (data === 'OK') {
      //             states.set('gnsslog', true);
      //           }
      //           break;
      //         default:
      //           debug('Unhandled situation!');
      //           break;
      //       }
      //     } else {
      //       debug('slog - get a unit8array');
      //     }
      //   });
      //   slogCommander.onopen(() => {debug('slog - connected!')});
      //   slogCommander.onerror((event) => {debug('slog - error = ' +
      //     event.type + ', data = ' + event.data)});
      //   slogCommander.onclose(() => {debug('slog - disconnected!')});
      // }

      // function initWcnd() {
      //   wcndCommander.ondata(function(event) {
      //     debug('wcnd - data = ' + event.data);
      //     if (!event.data) {
      //       debug('wcnd - no data return');
      //       return;
      //     }
      //     if (typeof event.data === 'string') {
      //       let data = event.data;
      //       let index = data.length;
      //       data = data.substring(0, index - 1);
      //       switch (Native.messageFlag.wcnd) {
      //         case WCND_CP2_STATUS:
      //           states.set('wcnlog', (data === '+ARMLOG: 1'));
      //           break;
      //         case WCND_OPEN_CP2:
      //           if (data === 'OK') {
      //             states.set('wcnlog', true);
      //           }
      //           break;
      //         case WCND_CLOSE_CP2:
      //           if (data === 'OK') {
      //             states.set('wcnlog', false);
      //           }
      //           break;
      //         case DUMP_WCN_ENABLE:
      //           if (data === 'OK') {
      //             EventSender.emit('sendWcndCommand', {
      //               message: DUMP_WCN_MEM
      //             });
      //           }
      //           break;
      //         case DUMP_WCN_MEM:
      //           if (data === 'OK') {
      //             debug('dmp wcn memory success');
      //           }
      //           break;
      //         default:
      //           break;
      //       }
      //     }
      //   });
      //   wcndCommander.onopen(function() {debug('wcnd - connected')});
      //   wcndCommander.onerror(function(event) {debug('wcnd - onerror + ' + event.error)});
      //   wcndCommander.onclose(function() {debug('wcnd - disconnected')});
      // }

      // function initModemd() {
      //   modemdCommander.ondata(function(event) {
      //     if (!event.data) {
      //       return;
      //     }
      //     if (typeof event.data === 'string') {
      //       debug('modemd - ondata - \n' + event.data);
      //
      //     } else {
      //       debug('modemd - get a unit8array');
      //     }
      //   });
      //   modemdCommander.onopen(function() {debug('modemd - connected!')});
      //   modemdCommander.onerror(function(event) {debug('modemd - error = ' +
      //     event.type + ', data = ' + event.data)});
      //   modemdCommander.onclose(function() {debug('modemd - disconnected!')});
      // }

      // initYlog();
      // initSlog();
      // initWcnd();
      // initModemd();
    },

    initStates: function() {
      // ap log
      setTimeout(() => {
        remoteHelper.getproperty('init.svc.ylog', (value) => {
          states.set('aplog', (value === 'running'));
        });
      }, 1000);

      // tcp ip log
      setTimeout(() => {
        remoteHelper.getproperty('ylog.svc.tcpdump', (value) => {
          states.set('tcpiplog', (value === 'running'));
        });
      }, 1000);

      // bt hci log
      setTimeout(() => {
        remoteHelper.getproperty('ylog.svc.hcidump', (value) => {
          states.set('bthcilog', (value === 'running'));
        });
      }, 1000);

      // modem log
      setTimeout(() => {
        EventSender.emit('sendSlogCommand', {
          message: SLOG_GET_5MODE_STATE,
          messageFlag: SLOG_MSG_GET
        });
      }, 2000);

      // wcnlog
      setTimeout(() => {
        EventSender.emit('sendWcndCommand', {message: WCND_CP2_STATUS});
      }, 2000);

      // gnss log
      // TODO: need to kneow how to get defaut state(not write in file as blow)
      // file format is as below, use tab as delimiter
      // stream cp_wcn  off 0 5
      // stream cp_gnss off 0 5
      setTimeout(() => {
        remoteHelper.readconf(SLOG_MODEM_CONF, (conf) => {
          function isOn(key) {
            let regexp = new RegExp(key + '\\w+');
            let line = conf.match(regexp);
            return line && (line[0].indexOf('on') !== -1);
          }

          states.set('gnsslog', isOn(GNSS_KEY));
        });
      }, 4000);

      // pcm log
      setTimeout(() => {
        remoteHelper.getproperty('persist.sys.sprd.pcmlog', (value) => {
          states.set('pcmlog', (value === '1'));
        });
      }, 2000);

      // cap log
      setTimeout(() => {
        remoteHelper.sendATCommand('AT+SPCAPLOG?', (value) => {
          states.set('caplog', (value.indexOf('1') > -1));
        });
      }, 2000);

      // modem to pc func
      setTimeout(() => {
        remoteHelper.getproperty('persist.sys.engpc.disable', (value) => {
          states.set('modemtopc', (value === '0'));
        });
      }, 2000);
    },

    initSlogAction: function() {
      remoteHelper.getproperty('persist.modem.w.enable', (response) => {
        this.slogAction.CP0_ENABLE = (parseInt(response) === 1);
      });

      remoteHelper.getproperty('persist.modem.t.enable', (response) => {
        this.slogAction.CP1_ENABLE = (parseInt(response) === 1);
      });

      remoteHelper.getproperty('ro.modem.wcn.enable', (response) => {
        this.slogAction.CP2_ENABLE = (parseInt(response) === 1);
      });

      remoteHelper.getproperty('persist.modem.tl.enable', (response) => {
        this.slogAction.CP3_ENABLE = (parseInt(response) === 1);
      });

      remoteHelper.getproperty('persist.modem.lf.enable', (response) => {
        this.slogAction.CP4_ENABLE = (parseInt(response) === 1);
      });

      remoteHelper.getproperty('persist.modem.l.enable', (response) => {
        this.slogAction.CP5_ENABLE = (parseInt(response) === 1);
      });
    },

    disableSlogCPs: function() {
      if (this.slogAction.CP0_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_DISABLE_WCDMA});
      }
      if (this.slogAction.CP1_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_DISABLE_TD});
      }
      if (this.slogAction.CP2_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_DISABLE_WCN});
      }
      if (this.slogAction.CP3_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_DISABLE_TDD_LTE});
      }
      if (this.slogAction.CP4_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_DISABLE_FDD_LTE});
      }
      if (this.slogAction.CP5_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_DISABLE_5MODE});
      }
    },

    enableSlogCPs: function() {
      if (this.slogAction.CP0_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_ENABLE_WCDMA});
      }
      if (this.slogAction.CP1_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_ENABLE_TD});
      }
      if (this.slogAction.CP2_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_ENABLE_WCN});
      }
      if (this.slogAction.CP3_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_ENABLE_TDD_LTE});
      }
      if (this.slogAction.CP4_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_ENABLE_FDD_LTE});
      }
      if (this.slogAction.CP5_ENABLE) {
        EventSender.emit('sendSlogCommand', {message: SLOG_ENABLE_5MODE});
      }
    },

    handleEvent: function(event) {
      debug('handle command type:' + event.type);
      debug('handle command message: ' + event.detail.message);
      switch(event.type) {
        case 'sendYlogCommand':
          this.ylogHandler(event);
          break;
        case 'sendSlogCommand':
          this.slogHandler(event);
          break;
        case 'sendWcndCommand':
          this.wcndHandler(event);
          break;
        case 'sendModemdCommand':
          this.modemdHander(event);
          break;
        case 'sendATCommand':
          this.atHandler(event);
          break;
        case 'sendEngmodedCommand':
          this.engmodedHandler(event);
          break;
        case 'modemToPC':
          this.toggleModemToPC(event);
          break;
        default:
          break;
      }
    },

    /**
     * For AP Log
     * The Native Daemon server(ylogd) will disconnect the connection when it return data every single time,
     * So we have to try to establish connection with it when we send message.
     */
    ylogHandler: function(event) {
      // xxx: Manual sync switches status; should sync status in ondata() function
      function manualSyncStatus() {
        debug('ylog manual sync');
        remoteHelper.getproperty('ylog.svc.tcpdump', (value) => {
          states.set('tcpiplog', (value === 'running'));
        });
        remoteHelper.getproperty('ylog.svc.hcidump', (value) => {
          states.set('bthcilog', (value === 'running'));
        });
      }

      var message = event.detail.message;
      this.messageFlag.ylog = message;

      // ylogCommander.sendMessage(message);
      debug('ylog commander send: ' + message);
      remoteHelper.sendYLOGCommand(message, (value)=> {
        debug('ylog - data = ' + value);
      if (!value) {
        debug('ylog - no data return');
        return;
      }
      // let data = value;
      // let index = data.indexOf(YLOG_EXIT_FLAG);
      // data = data.substring(0, index - 1);
      // debug('ylog - data - \n' + data);
      if (typeof value === 'string') {
        let data = value;
        switch (Native.messageFlag.ylog) {
          case YLOG_TCPDUMP_START:
            states.set('tcpiplog', (data === '[ tcpdump ] = running'));
            break;
          case YLOG_TCPDUMP_STOP:
            states.set('tcpiplog', (data === '[ tcpdump ] = stop'));
            break;
          case YLOG_HCIDUMP_START:
            states.set('bthcilog', (data === '[ hcidump ] = running'));
            break;
          case YLOG_HCIDUMP_STOP:
            states.set('bthcilog', (data === '[ hcidump ] = stop'));
            break;
          case YLOG_ALL_START:
            debug('get ylog all start ondata success');
            // Ylog all start command will effect tcpip or bthci log
            states.set('bthcilog', true);
            states.set('tcpiplog', true);
            break;
          case YLOG_ALL_STOP:
            // Ylog all stop command WON'T effect tcpip or bthci log
            debug('get ylog all stop ondata success');
            break;
          default:
            break;
        }
      }
      setTimeout(manualSyncStatus, 500);
    });
      // if (ylogCommander.hasConnected()) {
      //   ylogCommander.sendMessage(message);
      //   setTimeout(manualSyncStatus, 500);
      //   debug('ylog commander send: ' + message);
      // } else {
      //   // TODO: why only ylog will always unexpected auto close by it self,
      //   // todo after an ylog command send success?
      //   debug('ylog commander not connected, resend again after 2s...');
      //   window.ylogCommander = ylogCommander.connect();
      //   setTimeout(() => {
      //     if (ylogCommander.hasConnected()) {
      //       // TODO: SPRD should fix here, there's no ylog return message
      //       ylogCommander.sendMessage(message);
      //
      //       setTimeout(manualSyncStatus, 500);
      //     }
      //   }, 2000);
      // }
    },

    slogHandler: function(event) {
      var message = event.detail.message;
      // Because of \n , slog need a new message flag,
      // can not use message to different each other
      this.messageFlag.slog = event.detail.messageFlag;

      // slogCommander.sendMessage(message);
      debug('slog commander send: ' + message);
      remoteHelper.sendSlogModemCommand(message, (value)=> {
        debug('slog - data = ' + value);
        switch (message){
            case SLOG_DISABLE_GNSS :
                states.set('gnsslog', false);
                break;
            case SLOG_ENABLE_GNSS:
                states.set('gnsslog', true);
                break;
            case SLOG_ENABLE_5MODE:
                states.set('modemlog',true);
                break;
            case SLOG_DISABLE_5MODE:
                states.set('modemlog',false);
                break;
            default:
                break;
        }
        if (!value) {
          debug('slog - no data return');
          return;
        }

        if (typeof value === 'string') {
          let data = value;
          switch (Native.messageFlag.slog) {
            case SLOG_MSG_GET:
              states.set('modemlog', (data.indexOf('on') > -1));
              break;
            case SLOG_MSG_START:
            case SLOG_MSG_STOP:
            case SLOG_MSG_CLEAR:
              break;
            default:
              debug('Unhandled situation!');
              break;
          }
        }
      });
    },

    wcndHandler: function(event) {
      var message = event.detail.message;
      this.messageFlag.wcnd = message;

      // wcndCommander.sendMessage(message);
      debug('wcnd commander send: ' + message);
      remoteHelper.sendWCNDCommand(message, (value)=> {
        debug('wcnd - data = ' + value);
        if (!value) {
          debug('wcnd - no data return');
          return;
        }
        if (typeof value === 'string') {
          let data = value;
          switch (Native.messageFlag.wcnd) {
            case WCND_CP2_STATUS:
              states.set('wcnlog', (data === '+ARMLOG: 1'));
              break;
            case WCND_OPEN_CP2:
              if (data === 'OK') {
                states.set('wcnlog', true);
              }
              break;
            case WCND_CLOSE_CP2:
              if (data === 'OK') {
                states.set('wcnlog', false);
              }
              break;
            case DUMP_WCN_ENABLE:
              if (data === 'OK') {
                EventSender.emit('sendWcndCommand', {
                  message: DUMP_WCN_MEM
                });
              }
              break;
            case DUMP_WCN_MEM:
              if (data === 'OK') {
                debug('dmp wcn memory success');
              }
              Toaster.showToast({message: 'Dump wcn memory success', latency: 1000});
              break;
            default:
              break;
          }
        }
      });
    },

    modemdHander: function(event) {
      var message = event.detail.message;
      this.messageFlag.modemd = message;

      // modemdCommander.sendMessage(message);
      debug('modemd commander send: ' + message);
      remoteHelper.sendSHELLCommand(message, (value)=> {
        debug('modemd - data = ' + value);
        if (!value) {
          debug('modemd - no data return');
          return;
        }
      });
    },

    atHandler: function(event) {
      var message = event.detail.message;
      debug('AT COMMAND handler handle message: ' + message);
      remoteHelper.sendATCommand(message, () => {
        switch (message) {
          case CAP_LOG_DISABLE:
            states.set('caplog', false);
            break;
          case CAP_LOG_ENABLE:
            states.set('caplog', true);
            break;
          case PCM_LOG_CLOSE:
            remoteHelper.setproperty('persist.sys.sprd.pcmlog', 0, () => {
              setTimeout(() => {
                states.set('pcmlog', false);
              }, 1000);
            });
            break;
          case PCM_LOG_OPEN:
            remoteHelper.setproperty('persist.sys.sprd.pcmlog', 1, () => {
              setTimeout(() => {
                states.set('pcmlog', true);
              }, 1000);
            });
            break;
          default:
            break;
        }
      });
    },

    engmodedHandler: function(event) {
      switch (event.detail.message) {
        case 'aplogEnable':
          debug('aplog enable');
          remoteHelper.setproperty('persist.ylog.enabled', 1, () => {
            setTimeout(() => {
              EventSender.emit('sendYlogCommand', {message: YLOG_ALL_START});
              states.set('aplog', true);
            }, 1000);
          });
          break;
        case 'aplogDisable':
          debug('aplog disable');
          remoteHelper.setproperty('persist.ylog.enabled', 0, () => {
            states.set('aplog', false);
          });
          break;
        default:
          break;
      }
    },

    toggleModemToPC: function(event) {
      switch (event.detail.message) {
        case 'open':
          remoteHelper.setproperty('persist.sys.engpc.disable', 0, (response) => {
            // TODO: Now, this implement can not it effect on time.
            // setTimeout(() => {
            //   EventSender.emit('sendModemdCommand', {
            //     message: 'persist.sys.engpc.disable'});
          setTimeout(() => {
             Native.disableSlogCPs();
          }, 500);
            // }, 1000);
            states.set('modemtopc', true);
            // modemdCommander.sendMessage('persist.sys.engpc');
            EventSender.emit('sendWcndCommand', {
              message: WCND_START_ENGPC});
          }, (response) => {
            debug('set persist.sys.engpc.disable error(set0): ' + response);
          });
          break;
        case 'close':
          remoteHelper.setproperty('persist.sys.engpc.disable', 1, (resonse) => {
            // TODO: Now, this implement can not it effect on time
            // setTimeout(() => {
            //   EventSender.emit('sendModemdCommand', {
            //     message: 'persist.sys.engpc.disable'});
            //   setTimeout(() => {
          setTimeout(() => {
              Native.enableSlogCPs();
          }, 500);
            //   }, 1000);
            // }, 1000);
            states.set('modemtopc', false);
           // modemdCommander.sendMessage('persist.sys.engpc');
            EventSender.emit('sendWcndCommand', {
              message: WCND_STOP_ENGPC});
          }, (response) => {
            debug('set persist.sys.engpc.disable(set1): ' + response);
          });
          break;
        default:
          break;
      }
    }
  };

  exports.Native = Native;
}(window));

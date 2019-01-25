/*

===============================
Video player.
(c) Copyright 2017-2018 EXPWAY.
-------------------------------
  videoplayer.js
  videoplayer.css
===============================

Requires: domgen.js, filetypes.js

Multiple video players are managed and have the same common API.

- videoplayer(id)       Video player on phone for DASH streams & single video file.
- videoplayerdongle()   Video player on TV dongle for DASH streams & single video file.

*/


// =========================================================================

/*
==========================
VIDEO PLAYER FOR BROWSER
==========================
*/
function videoplayer(idv,ida,idi)
{
	var ev = document.getElementById(idv);
	var ea = document.getElementById(ida);
	var ei = document.getElementById(idi);
	var e = ev;
	var has_source = false;
	var is_requested_to_play = false;	// request to the player
	var is_currently_playing = false; 	// status from player
	var have_player = true;
	var video_live = false;
	this.onended = null;
	this.onerror = null;
	this.playing_url = null;
	var media_type = 'video';
	ev.style.display = 'none';
	ea.style.display = 'none';
	ei.style.display = 'none';
	var mediaplayer = undefined;

	// Set when START is received from PLAYER.
	// to be checked: reset when STOP is received
	var media_start_time_second = 0; // second

	var media_time_second = 1000; // one second expressed in time unit used by the dongle for medias

	var errorListenerRef = null; // used to remove the listener when using bind()

	function stopDashMediaPlayer()
	{
		// console.log("==> stopDashMediaPlayer"); // DEBUG
		if (mediaplayer != undefined)
		{
			mediaplayer.pause();
		}
		// console.log("<== stopDashMediaPlayer"); // DEBUG
	}
	var segmiss_url = null;
	var segmiss_counter = 0;

	this.mpcb_error = function(e)
	{
		//var date = new Date();
		//console.warn(date.toISOString() + ' DashJS ERROR!! ' + e.error + ': ' + e.event.message+'');
		// https://stackoverflow.com/questions/35631329/dash-js-trapping-404-errors-from-mpeg-dash-player
		console.warn("[DASH->APP] ERROR "+e);
		console.warn("[DASH->APP] >> "+e.error);
		if (e.event && e.event.id) console.warn("[DASH->APP] ID >> "+e.event.id);
		if (e.event && e.event.url) console.warn("[DASH->APP] URL >> "+e.event.url);
		if (e.error == 'download' && e.event && e.event.id == 'content') {
			console.warn("[DASH->APP] Missing segment: " + e.event.url);
			if (segmiss_url != e.event.url) {
				segmiss_url = e.event.url;
				segmiss_counter++;
			} // Increment counter for new URL only
			if (this.onerror) {
				this.onerror(mmissingsegment, e.event.url, segmiss_counter);
			}
			//mediaplayer.reset();
			// Try to reload URL
			if (this.playing_url)
				this.play(this.playing_url);
		}
	};
	errorListenerRef = this.mpcb_error.bind(this); // used to remove the listener when using bind()

	this.mpcb_event = function(e)
	{
		//var date = new Date();
		//console.log(date.toISOString() + ' DashJS '+ e.type + ': '+e.message+'');
	};
	// http://cdn.dashjs.org/latest/jsdoc/module-MediaPlayer.html
	this.getDashMediaPlayer=function()
	{
		if (mediaplayer == undefined)
		{
			mediaplayer = dashjs.MediaPlayer().create();
			mediaplayer.initialize(e, null, true);
			//mediaplayer.setFastSwitchEnabled(true);
			mediaplayer.on(dashjs.MediaPlayer.events.ERROR, errorListenerRef, null);
			//mediaplayer.on(dashjs.MediaPlayer.events.LOG, this.mpcb_event.bind(this), null);
			//mediaplayer.getDebug().setLogToBrowserConsole(false);
			//mediaplayer.setLimitBitrateByPortal(true);
		}
		return mediaplayer;
	};
	this.destroy = function()
	{
		segmiss_counter = 0;
		this.stop();
		if (mediaplayer != undefined)
		{
			mediaplayer.off(dashjs.MediaPlayer.events.ERROR, errorListenerRef);
			mediaplayer.reset();
			mediaplayer = undefined;
		}
	};
	this.setmediatype = function(type)
	{
		media_type = type;
		this.setvisible(false);
		video_live = false;
		switch(type)
		{
		case 'live':  video_live = true; // fallthrough
		case 'video': e = ev; have_player = true; break;
		case 'audio': e = ea; have_player = true; break;
		case 'image': e = ei; have_player = false; break;
		}
		this.setvisible(true);
	};
	this.setvisible = function(b)
	{
		e.style.display = b ? "block" : "none";
	};
	this.mute = function(b)
	{
		if (have_player) e.muted = b;
	};
	this.changevolume = function(dstep)
	{
		if (have_player)
		{
			var vol = e.volume + dstep * 0.05;
			e.volume = vol<0.0 ? 0.0 : vol>1.0 ? 1.0 : vol;
		}
	};
	this.pause = function ()
	{
		// console.log("==> PAUSE"); // DEBUG
		if (have_player && is_requested_to_play)
		{
			var player = video_live ? this.getDashMediaPlayer() : e;
			is_requested_to_play = false;
			// if (!is_currently_playing)  // DEBUG
			// {
			// 	console.log("WTF: PAUSE requested, but player is not playing ...");
			// }
			player.pause();
		}
		// else if (!is_requested_to_play) // DEBUG
		// {
		// 	console.log("WTF: PAUSE requested, but playing had never been requested ...");
		// }

		// console.log("<== PAUSE"); // DEBUG
	};
	this.resume = function ()
	{
		// console.log("==> RESUME"); // DEBUG
		if (have_player && has_source && !is_requested_to_play)
		{
			var player = video_live ? this.getDashMediaPlayer() : e;
			is_requested_to_play = true;

			if (mediaplayer != undefined)
			{ // do care/display about missing segment
				mediaplayer.on(dashjs.MediaPlayer.events.ERROR, errorListenerRef, null);
			}

			// if (is_currently_playing) // DEBUG
			// {
			// 	console.log("WTF: RESUME requested, but player is playing ...");
			// }			
			player.play();
		}
		// else if (!is_requested_to_play) // DEBUG
		// {
		// 	console.log("WTF: RESUME requested, but playing had never been requested ...");
		// }
		// console.log("<== RESUME"); // DEBUG
	};
	this.pauseOrResume = function ()
	{
		if (have_player && has_source)
		{
			var player = video_live ? this.getDashMediaPlayer() : e;
			is_requested_to_play = !is_requested_to_play;
			if (is_requested_to_play)
			{
				if (mediaplayer != undefined)
				{ // do care/display about missing segment
					mediaplayer.on(dashjs.MediaPlayer.events.ERROR, errorListenerRef, null);
				}
				player.play();
			}
			else
			{
				if (mediaplayer != undefined)
				{ // do not care/display about missing segment
					mediaplayer.off(dashjs.MediaPlayer.events.ERROR, errorListenerRef);
				}
				player.pause();
			}
		}
	};
	this.isPlaying = function()
	{
		return is_requested_to_play;
	};
	this._endmedia = function ()
	{
		// console.log("==> _endmedia"); // DEBUG

		is_currently_playing = false;

		if (this.onended) this.onended(this);

		// console.log("<== _endmedia"); // DEBUG
	};
	this.stop = function ()
	{
		console.log("[APP...] STOP... VIDEO\tplayer:" + have_player + " playing (old expected):" + is_requested_to_play);
		console.log("[APP...] \tplaying (status):" + is_currently_playing + " live:" + video_live);

		if (mediaplayer != undefined)
		{ // do not care/display about missing segment
			mediaplayer.off(dashjs.MediaPlayer.events.ERROR, errorListenerRef);
		}

		if (have_player && is_requested_to_play) 
		{
			// if (!is_currently_playing) // DEBUG
			// {
			// 	console.log("WTF: STOP is requested, player had been request to play BUT is not playing");
			// }
			stopDashMediaPlayer();
			e.pause();
		}

		this.playing_url = null;

		// The user request to STOP the video
		is_requested_to_play = false;

		has_source = false;
		segmiss_counter = 0;
	};
	this.setMediaTime = function (t) // in seconds Device
	{
		if (have_player && is_requested_to_play)
		{
			if (t < 0) t = 0;
			else if (t > e.duration) t = e.duration;
			e.currentTime = t;
		}
	};
	this.moveMediaTime = function (dt) // in seconds
	{
		if (have_player && is_requested_to_play)
		{
			var t = e.currentTime + dt;
			if (t < 0) t = 0;
			else if (t > e.duration) t = e.duration;
			e.currentTime = t;
		}
	};
	this.getMediaTime = function () // Player: in seconds
	{
		if (have_player && is_requested_to_play) {
			if (video_live) {
				var mp = this.getDashMediaPlayer();
				//var mpDuration = mp.duration(); // Buffer of the Player
				var mpDuration = mp.getMediaPresentationDuration(); // Duration of the media else NaN
				var mpTimeAsUTC = mp.timeAsUTC(); // current position EPOCH
				var mpBufferRangeAsUTC = mp.getBufferRangeAsUTC();

				//return [ mp.getDVRWindowSize(), mp.getDVRSeekOffset() ];
				return [mpDuration, mpTimeAsUTC, mpBufferRangeAsUTC[0], mpBufferRangeAsUTC[1]];
			}
			//return [e.duration, e.currentTime];
			return [NaN, NaN];
		} else { 
			//return false;
			return [NaN, NaN];
		}
	};
	this.play = function (url)
	{
		console.log("[APP...] VIDEO Play URL: " + url + " player:" + have_player + " playing (expected):" + is_requested_to_play + " playing (status):" + is_currently_playing + " live:" + video_live);
		if (have_player)
		{
			if (is_requested_to_play)
			{
				// if (!is_currently_playing) // DEBUG
				// {
				// 	console.log("WTF: STOP for PLAY had been requested but playing is not running")
				// }
				this.stop();
			}
			setDOM(e);
			if (video_live)
			{
				has_source = url.length > 0;
				if (has_source)
				{
					var mp = this.getDashMediaPlayer();
					console.log("[APP->DASH] Play URL: " + url + "...");
					this.playing_url = url;
					mp.attachSource(url);
					is_requested_to_play = true;
				}
			}
			else
			{
				var urls = url.split(",");
				has_source = urls.length > 0;
				var prev_filename = "";
				for (var i = 0; i < urls.length; i++)
				{
					var u = urls[i];
					if (u.charAt(0) == ".")
					{
						u = prev_filename + u;
					}
					else
					{
						var j = u.lastIndexOf(".");
						prev_filename = j < 0 ? u : u.substring(0, j);
					}
					console.log("[APP->PLAY] Add URL: " + u + "...");
					appendDOM(e, ["source", { "src": u, "type": types.getTypeFromName(u) }]);
				}
				if (has_source)
				{
					this.playing_url = url;
					e.load();
					e.play();
					is_requested_to_play = true;
				}
				else
				{
					is_requested_to_play = false;
				}
			}

			if (mediaplayer != undefined)
			{ // do care/display about missing segment
				mediaplayer.on(dashjs.MediaPlayer.events.ERROR, errorListenerRef, null);
			}
		}
		else
		{
			console.log("[APP->FILE] Set source: " + url + "...");
			e.src = url;
			is_requested_to_play = false;
		}
	};

	// Add Event listener from player event
	var othis = this;
	ev.addEventListener('ended', function (e)
	{
		console.log("[<video>->APP] Media playing: ENDED."); // DEBUG
		othis._endmedia();

		// is_requested_to_play = false; // set in othis._endmedia();
	});
	ea.addEventListener('ended', function (e)
	{
		console.log("[<audio>->APP] Media playing: ENDED."); // DEBUG
		othis._endmedia();

		// is_requested_to_play = false; // set in othis._endmedia();
	});

	ev.addEventListener('playing', function (e)
	{
		console.log("[<video>->APP] Media playing: PLAYING."); // DEBUG
		is_currently_playing = true;
		// is_requested_to_play = false;
	});
	ea.addEventListener('playing', function (e)
	{
		console.log("[<audio>->APP] Media playing: PLAYING."); // DEBUG
		is_currently_playing = true;
		// is_requested_to_play = false;
	});

	ev.addEventListener('pause', function (e)
	{
		console.log("[<video>->APP] Media playing: PAUSE."); // DEBUG
		is_currently_playing = false;
		// is_requested_to_play = false;
	});
	ea.addEventListener('pause', function (e)
	{
		console.log("[<audio>->APP] Media playing: PAUSE."); // DEBUG
		is_currently_playing = false;
		// is_requested_to_play = false;
	});

	ev.addEventListener('canplay', function (e)
	{
		 console.log("[<video>->APP] Media playing: CANPLAY."); // DEBUG
	});
	ea.addEventListener('canplay', function (e)
	{
		 console.log("[<audio>->APP] Media playing: CANPLAY."); // DEBUG
	});

	ev.addEventListener('play', function (e)
	{
		console.log("[<video>->APP] Media playing: PLAY."); // DEBUG
		media_start_time_second = new Date().getTime() / media_time_second;
	});
	ea.addEventListener('play', function (e)
	{
		console.log("[<audio>->APP] Media playing: PLAY."); // DEBUG
		media_start_time_second = new Date().getTime() / media_time_second;
	});

	ev.addEventListener('waiting', function (e)
	{
		console.log("[<video>->APP] Media playing: WAITING."); // DEBUG
	});
	ea.addEventListener('waiting', function (e)
	{
		console.log("[<audio>->APP] Media playing: WAITING."); // DEBUG
	});

	ev.addEventListener('error', function (e)
	{
		console.log("[<video>->APP] Media playing: ERROR."); // DEBUG
	});
	ea.addEventListener('error', function (e)
	{
		console.log("[<audio>->APP] Media playing: ERROR."); // DEBUG
	});

	ev.addEventListener('seeking', function (e)
	{
		 console.log("[<video>->APP] Media playing: SEEKING."); // DEBUG
	});
	ea.addEventListener('seeking', function (e)
	{
		 console.log("[<audio>->APP] Media playing: SEEKING."); // DEBUG
	});

	ev.addEventListener('seeked', function (e)
	{
		 console.log("[<video>->APP] Media playing: SEEKED."); // DEBUG
	});
	ea.addEventListener('seeked', function (e)
	{
		 console.log("[<audio>->APP] Media playing: SEEKED."); // DEBUG
	});

	ev.addEventListener('timeupdate', function (e)
	{
		// console.log("[<video>->APP] Media playing: timeupdate."); // DEBUG
	});
	ea.addEventListener('timeupdate', function (e)
	{
		// console.log("[<audio>->APP] Media playing: timeupdate."); // DEBUG
	});

	ev.addEventListener('progress', function (e)
	{
		// console.log("[<video>->APP] Media playing: progress."); // DEBUG
	});
	ea.addEventListener('progress', function (e)
	{
		// console.log("[<audio>->APP] Media playing: progress."); // DEBUG
	});

	ev.addEventListener('ratechange', function (e)
	{
		// console.log("[<video>->APP] Media playing: ratechange."); // DEBUG
	});
	ea.addEventListener('ratechange', function (e)
	{
		// console.log("[<audio>->APP] Media playing: ratechange."); // DEBUG
	});

	ev.addEventListener('loadedmetadata', function (e)
	{
		// console.log("[<video>->APP] Media playing: loadedmetadata."); // DEBUG
	});
	ea.addEventListener('loadedmetadata', function (e)
	{
		// console.log("[<audio>->APP] Media playing: loadedmetadata."); // DEBUG
	});
}

// =========================================================================

var Context = {}; // <== DIAL SDK need this object (undocumented) which should be removed from the DIAL API implementation.


/*
==========================
VIDEO PLAYER FOR DONGLE
==========================
*/
function videoplayerdongle(config)
{
	var media_time_second = 1000; // one second expressed in time unit used by the dongle for medias
	var period_research = 1000;
	var period_reconnect = 1000;
	var count_reconnect = 3;

	var remain_connect_count = count_reconnect;
	var dongle_config = config;

	var dongle_server = null;

	const ENUM_STATUS = {
		UNKNOWN: 0,
		CONNECTING: 1,
		OK: 2,
		FAILURE: 3,
		properties: {
			0: { name: "unknown", value: 0 },
			1: { name: "connecting", value: 1 },
			2: { name: "ok", value: 2 },
			3: { name: "failure", value: 3 }
		}
	};

	var player_status = Object.freeze(ENUM_STATUS); // 0 unknown / 1 connecting / 2 OK / 3 failure
	var dongle_status = Object.freeze(ENUM_STATUS); // 0 unknown / 1 connecting / 2 OK / 3 failure
	player_status = ENUM_STATUS.UNKNOWN;
	dongle_status = ENUM_STATUS.UNKNOWN;

	var player_obj = null;

	// Cumulative delta time from Seek requested
	var dongle_seek_delta_time = 0;

	// Update when POSITION is received.
	// According to "DIAL Client API for FireFox" Sep 1 2017:
	// 		if (!isNaN(media_current_position_second) && !isNaN(media_total_second)) the media is live stream then NaN else media_current_position_second
	var media_current_position_second = NaN; // second

	// POSITION return -1:-1 i.e service is Live Stream
	var media_live_stream = false;

	// Set when START is received from PLAYER.
	// to be checked: reset when STOP is received
	var media_start_time_second = 0; // second

	// Duration of the service (# mediaPresentationDuration)
	// Update when POSITION is received.
	// According to "DIAL Client API for FireFox" Sep 1 2017:	
	// 		if (!isNaN(media_current_position_second) && !isNaN(media_total_second)), the media is Live stream and set to NaN
	var media_total_second = NaN; // second

	// Cumulative requested delta time
	var media_seek_time = 0; // second

	var volume = 10; // 0..20
	var muted = false;
	var tm_update = null;

	var dongle_manager = undefined;
	var dongle_netif_addr = undefined; // Address of the network interface (USB) connected to the TV dongle.
	var dongle_search_id = undefined;
	var dongle_connect_id = undefined;
	var queued_media_item = null;
	var queued_media_list = null;
	var media_id = null;
	var has_source = false;
	var is_playing = false;
	var is_requested_to_play = false; // request to the player
	var is_media_playing = false; // status from the player: i.e is_currently_playing
	var try_connect = false;

	var media_type = 'video';
	this.setmediatype = function (type)
	{
		media_type = type;
	};

	function setIs_requested_to_play(bNewValue)
	{
		// console.log("==> setIs_requested_to_play: old value<" + is_requested_to_play + "> - new <" + bNewValue + ">");
		is_requested_to_play = bNewValue;
		// console.log("<== setIs_requested_to_play"); // DEBUG
	}

	function dongle_setup(f_connect)
	{
		if (typeof window.navigator.dongleManager !== "undefined")
		{
			dongle_manager = window.navigator.dongleManager;
			if (dongle_manager.dongleStatus)
				if (dongle_manager.usbIpAddress)
				{
					dongle_netif_addr = dongle_manager.usbIpAddress;
					dump("default USB address = " + dongle_netif_addr);
				}
			dongle_manager.ondonglestatuschange = function (event)
			{
				dump("Receive donglestatuschange event, isConnected = " + event.isConnected);
				if (event.isConnected)
				{
					dongle_netif_addr = event.usbIpAddress;
					// App can get usb ip address when dongle connected.
					dump("set USB address = " + dongle_netif_addr);
					if (try_connect) f_connect();

				} else if (DONGLE_STATE_ON === dongle_state) // previous state was ON
				{
					dump("dongle_setup ondonglestatuschange: event.isConnected<" + event.isConnected + ">");
					clearTimeout(tm_update);
					setTvDonglePresent(false, true);
					setMediaPlaying(false);
					player_status = ENUM_STATUS.UNKNOWN;

					// Need to relaunch _connect
					// After unplugging the DONGLE, DISCONNECT message is received when re-plugging
					// by reconnecting, the previous connectin is ended
					try_connect = true;
				}
			};
		}
	}

	this.onended = null;
	function setMediaPlaying(b)
	{
		if (b != is_media_playing)
		{
			// if (is_media_playing && media_current_position_second != 0)
			// 	media_current_position_second += ((new Date().getTime()) - media_position_time) / media_time_second;

			// save the time when start/stop the video
			media_start_time_second = new Date().getTime() / media_time_second;
			is_media_playing = b;
		}
	}
	
	this._endmedia = function ()
	{
		// Player is no more playing
		setMediaPlaying(false);
		if (this.onended) 
		{
			this.onended(this);
		}
	};

	// PLAYER CALLBACKS
	this._player_set_status = function (s)
	{
		console.info("[Dongle] Status is " + s);
		//displayMessage("Dongle status: "+s); // DEBUG
		switch (s)
		{
			case 'ERROR':
				/* Media could not be played */
				this._clearmedia();
				player_status = ENUM_STATUS.FAILURE;
				setMediaPlaying(false);
				break;
			case 'PAUSE':
			case 'STOP':
				/* Stopped playing */
				setMediaPlaying(false);
				break;
			case 'START':
				setMediaPlaying(true);
				break;
			case 'RUNNING':
			case 'SEARCHING':
			/*Response of seek() method */
			case 'SEARCHOK':
			/* Response of seek() method */
			case 'DEVICE_BUSY':
			/* Connection count to Remote player exceeded
			 * Max number of connection to Remote Player is 10. */
			case 'SHOW':
				/* showing image */
				break;
			case 'CONNECTED':
				this._update_player_information();

				if (ENUM_STATUS.OK != player_status)
				{
					// Set the Status as CONNECTED
					player_status = ENUM_STATUS.OK;

					this._clearmedia();
					if (queued_media_item != null)
					{
						setIs_requested_to_play(true);
						playQueuedMedia();
					}
				}
				break;
			case 'PLAYEND':
				/* End of playing media */
				this._endmedia();
				break;
			case 'DISCONNECTED':
				/* Disconnected to remote player */
				if (player_status != ENUM_STATUS.UNKNOWN)
				{ // else it could be previous message before unplugging 
					player_status = ENUM_STATUS.UNKNOWN;
					setTvDonglePresent(false, true);
					setMediaPlaying(false);
				}

				break;
		}
	};

	this._update_player_information = function ()
	{ // auto re-schedule
		if (player_obj != null)
		{
			console.info("Periodic update dongle player Volume/Mute/Position");
			player_obj.requestVolume();
			player_obj.requestMute();
			player_obj.requestPosition(); // to get current position and then seek or display ...
		}
		// Schedule next request in 200ms
		tm_update = setTimeout(this._update_player_information.bind(this), 200);
	};

	this.destroy = function ()
	{
		// stop running timer
		clearTimeout(tm_update);
		clearTimeout(dongle_search_id);

		this.stop();
		if (player_obj != null)
		{
			player_obj.disconnect();
			player_obj = null;
		}
		player_status = ENUM_STATUS.UNKNOWN;
		dongle_status = ENUM_STATUS.UNKNOWN;
	};

	this._player_response = function (r)
	{
		//displayMessage("Dongle response: "+r.type+" =["+r.data+"]"); // DEBUG
		// console.info("[Dongle->APP] Notify player response %o",r);
		// console.info("[Dongle->APP] Notify player response "+r.type+" =["+r.data+"]");
		// r.type  r.data
		switch (r.type)
		{
			case 'MUTE': muted = (r.data == 'true'); break;
			case 'LOOP': /*loop = r.data=='true';*/ break;
			case 'PLAYLIST':
				media_id = r.data.length > 0 ? r.data[0].id : null;
				if (media_id !== null)
				{
					console.info("PLAYLIST expected behaviour playing<" + is_requested_to_play + "> - current<" + is_media_playing + ">");
					player_obj.play_Id(media_id, -1);

					// update Player State
					setMediaPlaying(r.data[0].state == 1);

					console.info("PLAYLIST expected behaviour playing<" + is_requested_to_play + "> - current UPDATEDt<" + is_media_playing + ">");

					if (!is_requested_to_play) // state should be in pause
					{
						player_obj.pause();
					}
					// else
					// {
					// 	console.log("WTF: PLAYLIST: is_requested_to_play <TRUE> had been requested to play"); // DEBUG
					// }
					player_obj.requestPosition();
				}
				break;
			case 'VOLUME': volume = parseInt(r.data); break;
			case 'POSITION': // <current>,<total>  in milliseconds
				var pos = r.data.split(',');
				var  media_position_msecond = parseInt(pos[0]);
				var media_total_msecond = parseInt(pos[1]);
				//media_position_time = new Date().getTime();
				if ((-1 == media_position_msecond) && (-1 == media_total_msecond)) 
				{ // live stream
					media_live_stream = true;
					media_current_position_second = NaN;
					media_total_second = NaN;
				}
				else
				{
					media_live_stream = false;
					media_current_position_second = media_position_msecond / media_time_second;
					media_total_second = media_total_msecond / media_time_second;
				}

				break;
			case 'STOPPEDPOSITION': // <current>  in milliseconds
				//media_current_position_second = parseInt(r.data) / media_time_second;
				//media_position_time = new Date().getTime();
				break;
			case 'SLIDESHOW': // <duration>  1..60=on / 0=off
				break;
			case 'PLAYERSTATUS':
				this._player_set_status(r.data);
				break;
			case 'CMD_ERROR':
				var e = r.data;
				console.error("[Dongle->APP] Player returned error: " + e.error + " (" + e.error_description + ")");
				break;
		}
	};

	this._clearmedia = function()
	{
		has_source = false;
		media_live_stream = false;
		media_current_position_second = NaN;
		media_total_second = NaN;
	};
	this._player_status = function(s)
	{
		console.info("[Dongle->APP] Notify player changestatus '"+s+"'");
		this._player_set_status(s);
	};
	var re_url = /^([^:]+:\/\/)(\[[:0-9A-Fa-f.]+\]|[^\[\/:]+)(:\d+)?(\/.*)?$/;
	function isLocalhost(name)
	{ return name=='127.0.0.1' || name=='localhost'; }
	function getUrlForDongle(url)
	{
		// Replace localhost by USB network interface where TV dongle is connected.
		var parts;
		if (dongle_netif_addr && (parts=re_url.exec(url)) && isLocalhost(parts[2]))
			url = url.replace(re_url, "$1"+dongle_netif_addr+"$3$4");
		return url;
	}

	function playQueuedMedia()
	{
		// Late URL replacement: done when dongle is connected, otherwise USB network interface address is not accessible.
		if (!dongle_netif_addr) return; // Cannot play without dongle

		// Create the playlist
		queued_media_item.url = getUrlForDongle(queued_media_item.url);
		queued_media_list = innopia.dial.player.makePlayList(queued_media_item);

		media_id = null; // will be updated when player acknowledge the playlist

		if (queued_media_item.format == 'image')
		{
			console.info("[APP->Dongle] PLAY IMAGE: " + queued_media_item.url);
			player_obj.show_Img(queued_media_list, 0);
		} else
		{
			// Delete all playlist in the player
			player_obj.deleteAllPlayList();

			// Add the current playlist. It will be played when the player acknowledged
			player_obj.addPlayList(queued_media_list);
		}
		queued_media_item = null;
	}

	// SEARCH & CONNECTION
	this._connect_ok = function (dialserv, player)
	{
		if (ENUM_STATUS.UNKNOWN == dongle_status) return; // No search initiated / Player destroyed
		//displayMessage("Dongle connect OK "+dialserv.url); // DEBUG
		try_connect = false; // No more needing connection
		console.info("[Dongle->APP] Call connect to " + dialserv.url + " returned success");
		dongle_setup(this._connect.bind(this));

		// Set the player as current player
		player_obj = player;
		remain_connect_count = count_reconnect;
		setTvDonglePresent(true);

		// Some requests to get current status
		player_obj.requestPlayerStatus();
	};

	this._connect_fail = function (dialserv, e)
	{
		clearTimeout(dongle_connect_id);

		if (ENUM_STATUS.UNKNOWN == dongle_status) return; // No search initiated / Player destroyed
		//displayMessage("Dongle connect FAIL "+dialserv.url); // DEBUG
		try_connect = false; // Need connection
		console.info("[Dongle->APP] Call connect to " + dialserv.url + " returned fail " + e.error + ": " + e.error_description);
		dongle_setup(this._connect.bind(this));
		player_status = ENUM_STATUS.UNKNOWN;
		setTvDonglePresent(false, true);
		if (remain_connect_count-- > 0)
		{
			// Reconnect
			dongle_connect_id = setTimeout(this._connect.bind(this), period_reconnect);
		}
		else
		{
			dongle_status = ENUM_STATUS.FAILURE;

			// No need to re-start procedure, it is auto-udpate
		}
	};

	this._connect = function () {
		//Stop timer for next connect
		clearTimeout(dongle_connect_id);

		if (false == try_connect) {
			// console.info("WTF: _connect should not be called"); // DEBUG
			return; // crossing case
		}
		//displayMessage("Dongle connecting "+dongle_server.url); // DEBUG
		console.info("[APP->Dongle] Calling player.connect to "+dongle_server.url+" applicationid="+dongle_config.appid);
		// o.name, o.ip, o.url (remote player URL for launch), o.output (CVBS/HDMI), o.isJioDongle
		player_status = ENUM_STATUS.CONNECTING;
		innopia.dial.player.connect({
			"applicationid":dongle_config.appid,
			"playlistpolicy":dongle_config.player_share?1:0,
			"device":"device",
			"server":dongle_server,
			"success":this._connect_ok.bind(this),
			"fail":this._connect_fail.bind(this),
			"changestatus":this._player_status.bind(this),
			"response":this._player_response.bind(this) });
		//displayMessage("Dongle ... "+dongle_server.url); // DEBUG
	};

	this._search_ok = function (dialserv)
	{
		if (ENUM_STATUS.UNKNOWN == dongle_status)
			return; // No search initiated / Player destroyed
		//displayMessage("Dongle search OK "+dialserv.url); // DEBUG
		console.log("Dongle search OK " + dialserv.url); // DEBUG
		console.info("[Dongle->APP] Call search returned success - isJioDongle <" + dialserv.isJioDongle + ">"); // DEBUG
		dongle_status = ENUM_STATUS.OK;
		dongle_server = dialserv;
		remain_connect_count = count_reconnect;

		// Stop search dongle timer procedure
		clearTimeout(dongle_search_id);

		// Now, it's time to connect
		this._connect();
	};

	this._search_fail = function (e)
	{
		if (ENUM_STATUS.UNKNOWN == dongle_status) return; // No search initiated / Player destroyed
		//displayMessage("Dongle search FAIL"); // DEBUG
		console.info("[Dongle->APP] Call search returned fail " + e.error + ": " + e.error_description);
		dongle_status = ENUM_STATUS.FAILURE;
		setTvDonglePresent(false, true);

		// No need to re-start procedure
	};

	this._search = function ()
	{
		console.info("[APP->Dongle] Calling search type=" + dongle_config.dongle_type);
		try_connect = true;
		dongle_status = ENUM_STATUS.CONNECTING;
		player_status = ENUM_STATUS.UNKNOWN;
		innopia.dial.search({
			"type": dongle_config.dongle_type,
			"timeout": dongle_config.dongle_timeout_ms,
			"success": this._search_ok.bind(this),
			"fail": this._search_fail.bind(this)
		});
	};

	this.pause = function ()
	{
		console.info("==> [APP->Dongle] PAUSE");
		if (is_requested_to_play)
		{
			// if (!is_media_playing)
			// {
			// 	console.log("WTF: PAUSE: playing is not playing"); // DEBUG
			// }
			if (player_status == ENUM_STATUS.OK)
				player_obj.pause();
		}
		// else
		// {
		// 	console.log("WTF: PAUSE: playing had not been requested")
		// }
		is_requested_to_play = false;

		// console.info("<== [APP->Dongle] PAUSE");
	};

	this.resume = function ()
	{
		console.info("==> [APP->Dongle] RESUME");
		if (has_source && !is_requested_to_play)
		{
			// if (is_media_playing)
			// {
			// 	console.log("WTF: RESUME: player is not in pause")
			// }
			if (player_status == ENUM_STATUS.OK) player_obj.resume();
		}
		// else
		// {
		// 	console.log("WTF: RESUME: pause had not been requested")
		// }

		setIs_requested_to_play(true);

		// console.info("<== [APP->Dongle] RESUME");
	};

	this.pauseOrResume = function ()
	{
		if (has_source)
		{
			//is_requested_to_play = !is_requested_to_play;
			setIs_requested_to_play(!is_requested_to_play);
			if (player_status == ENUM_STATUS.OK)
			{
				console.info("[APP->Dongle] " + (is_requested_to_play ? 'RESUME' : 'PAUSE'));
				if (is_requested_to_play) player_obj.resume();
				else player_obj.pause();
			}
		}
	};

	this.isPlaying = function ()
	{
		return is_requested_to_play;
	};

	this.stop = function ()
	{
		console.info("==>[APP->Dongle] STOP: current status requested<" + is_requested_to_play + "> - player<" + is_media_playing + ">"); // DEBUG
		queued_media_item = null;

		if (is_media_playing || is_requested_to_play)
		{
			if (player_obj != null)
			{
				player_obj.stop();
			}
		}
		this._clearmedia();
		setIs_requested_to_play(false);

		console.info("<== [APP->Dongle] STOP is_media_playing <" + is_media_playing + ">"); // DEBUG
	};

	this.mute = function (b)
	{
		if (player_status == ENUM_STATUS.OK) player_obj.setMute(b ? "true" : "false");
		muted = b;
	};

	this.changevolume = function (dstep)
	{
		var vol = volume + dstep;
		if (player_status == ENUM_STATUS.OK) player_obj.setVolume(vol < 0 ? 0 : vol > 20 ? 20 : vol);
	};

	this.setMediaTime = function (t) // DONGLE: in seconds
	{
		console.info("SEEK from " + media_current_position_second + "/" + media_total_second + " playing=" + is_requested_to_play);
		if (is_requested_to_play && !isNaN(media_total_second))
		{
			if (t < 0) t = 0;
			else if (t > media_total_second) t = media_total_second;
			console.info("SEEK TO t=" + t + "s (if 2=" + player_status + ") seek(" + ((t * media_time_second) >> 0) + ")");
			if (player_status == ENUM_STATUS.OK) player_obj.seek((t * media_time_second) >> 0);
		}
	};

	this.moveMediaTime = function (dt) // in seconds DONGLE
	{
		console.info("SEEK D from " + media_current_position_second + "/" + media_total_second + " playing=" + is_requested_to_play);
		if (is_requested_to_play && !isNaN(media_total_second))
		{
			var t = media_current_position_second + dt;
			if (t < 0) t = 0;
			else if (t > media_total_second) t = media_total_second;
			console.info("SEEK T+" + dt + " TO t=" + t + "s (if 2=" + player_status + ") seek(" + ((t * media_time_second) >> 0) + ")");
			if (player_status == ENUM_STATUS.OK) player_obj.seek((t * media_time_second) >> 0);
		}
	};

	// return [media_total_second, media_position_since_start, media_current_position_second, NaN]
	// media_total_second: total duration of the media (#mediaRepresentationDuration). If unknown, then NaN
	// media_position_since_start: time position in the media, i.e elapsed time since START callBack added to POSITION.
	// BufferStart
	// BufferEnd
	this.getMediaTime = function () // Dongle: return [media_total_second, media_position_since_start, media_current_position_second, NaN]
	{
		if (is_requested_to_play)
		{
			var media_position_since_start = NaN; // second
			
			if (!isNaN(media_current_position_second) && !isNaN(media_current_position_second))
			{
				// position seconds since "START" from player
				media_position_since_start = media_current_position_second + media_start_time_second;
			} else {
				media_position_since_start = NaN;
			}

			return [media_total_second, media_position_since_start, NaN, NaN]; 
		}
		else return false;
	};

	this.play = function (title, url) 
	{
		// Stop previous video
		this.stop();
		has_source = url.length > 0;
		if (has_source)
		{
			console.info("==> DONGLE PLAY title<" + title + "> - url<" + url + "> - media_type<" + media_type + ">"); // DEBUG
			setIs_requested_to_play(true);
			switch (media_type)
			{
				case 'live':
				case 'video':
					queued_media_item = innopia.dial.player.makePlayItem_video(url, title);
					break;
				case 'audio':
					queued_media_item = innopia.dial.player.makePlayItem_audio(url, title);
					break;
				case 'image':
					queued_media_item = {
						'format': 'image',
						'url': url,
						'title': title
					};
					break;
			}

			queued_media_item.type = media_type;

			media_current_position_second = NaN;
			media_current_position_second = NaN;

			if (player_status == ENUM_STATUS.OK)
			{
				// The player is already connected. Send the playlist
				playQueuedMedia();
			}
		} else
		{
			console.info("==> DONGLE PLAY NO SOURCE: title<" + title + "> - url<" + url + "> - media_type<" + media_type + ">"); // DEBUG

			//	is_requested_to_play = false;
			setIs_requested_to_play(false);
		}
		// console.info("<== DONGLE PLAY");
	};

	this._search();
}
/*

========================================
EXPWAY eMBMS TEST APPLICATION for KaiOS.
(c) Copyright 2017-2018 EXPWAY.
----------------------------------------
  app.js
  app.css
========================================

Requires: domgen.js, messages.js, uiscreens.js, uiscreens.css, components.js, components.css, videoplayer.js, videoplayer.css

*/

var app_info =
{
	"name":"eMBMS test application",
	"author":"EXPWAY",
	"version":"1.11",
	"id":"com.expway.embms.test"
};

// =========================================================================

// EPG MANAGEMENT

// ServiceID format: any sequence ended by optional version suffix
// Examples:
//   urn:3gpp:jio:82
//   urn:3gpp:jio:82.1
var re_service_id = /^(.+(?:\D|[^.\d](\d+)))(\.\d+)?$/;

/*
	Get the EPG service identifier.
	@param servid The service identifier from eMBMS metadata.
	@return The service identifier without the optional version suffix.
	Examples:
		getEpgServiceID('urn:3gpp:jio:82')   // 'urn:3gpp:jio:82'
		getEpgServiceID('urn:3gpp:jio:82.1') // 'urn:3gpp:jio:82'
*/
function getEpgServiceID(servid)
{
	// Remove optional version suffix
	return servid.replace(re_service_id, '$1');
}

/*
	Get the EPG service number.
	@param servid The service identifier from eMBMS metadata.
	@return The service number.
	Examples:
		getEpgServiceNumber('urn:3gpp:jio:82')   // '82'
		getEpgServiceNumber('urn:3gpp:jio:82.1') // '82'
*/
function getEpgServiceNumber(servid)
{
	// Get the service number
	return servid.replace(re_service_id, '$2');
}

// =========================================================================

// UI ELEMENTS

lang.finalInit();

var ov_top = new overlay("overlay_top");
var ov_bottom = new overlay("overlay_bottom");

var e_player = new videoplayer("vplayer","aplayer","iplayer");

var ew_dongle_config =
{
	"appid":app_info.id,
	"dongle_type":"rndis",
	"dongle_timeout_ms":2000,
	"player_share":true,
};

var player_dongle = new videoplayerdongle(ew_dongle_config);

var e_position = null; // new timearea_position( "c_position" );
var e_total = null; // new timearea_total( "c_total" );
var e_posbar = null; // new scrollbar("c_posbar");

var e_app_title = new component("app_title");
var e_loading = new component("load_screen");
var e_dongle_screen = new component("dongle_screen");

var e_tv_status = new component("tv_status");
var e_tv_status_image = new cimage("tv_status_image"); // inside e_tv_status
var e_lteb_status = new component("lteb_status");
var e_lteb_status_image = new cimage("lteb_status_image"); // inside e_lteb_status
var e_screen_title = new component("screen_title"); // inside e_app_title
var e_title = new component("title");
var e_message = new component("message");
var e_list = new itemlist("list");
var e_notify_msg = new component("notify_msg");
var e_item_info = new component("item_info");
var e_actionlist = new actionlist("action_list","action_download","action_view","action_delete");

// Limits of display:
e_list.setMaxItemSize(34);
e_screen_title.setMaxTextLen(28);

var offset_seek_cumulative_time = 0; // cumulative time (second)

// =========================================================================

// DONGLE MANAGEMENT

var DONGLE_STATE_UNKNOWN = 0;
var DONGLE_STATE_NONE    = 1;
var DONGLE_STATE_OFF     = 2;
var DONGLE_STATE_ON      = 3;
var dongle_state = DONGLE_STATE_UNKNOWN;
var uid = 903162058;
var notified_dongle_on = false; // Initially, consider no dongle until update by dongle API notification.
var userpref_dongle_on = true; // By default, view on dongle+TV if present.

function setTvDongleState(s) {
	// console.info("==> setTvDongleState: old<" + dongle_state + "> - new<" + s + ">"); // DEBUG

	var s_image = ['fp_only', 'fp_only', 'fp', 'tv'];
	if (s >= 0 && s < s_image.length && s != dongle_state) {
		dongle_state = s;
		e_tv_status_image.setSource('images/video_' + s_image[s] + '.png');
	}

	// console.info("<== setTvDongleState"); // DEBUG
}

function isViewWithDongle()
{
	return userpref_dongle_on && notified_dongle_on;
}

// FROM dongle API
function setTvDonglePresent(b_present, b_connect_error) {
	// console.info("==> setTvDonglePresent(b_present<" + b_present + ">, b_connect_error<" + b_connect_error + ">)");

	if (notified_dongle_on != b_present || dongle_state == DONGLE_STATE_UNKNOWN) {
		notified_dongle_on = b_present;

		// setTvDongleState(notified_dongle_on ? userpref_dongle_on ? DONGLE_STATE_ON : DONGLE_STATE_OFF : DONGLE_STATE_NONE);
		// same as:
		if (notified_dongle_on) { // previously not present or initialisation (ie dongle_state == DONGLE_STATE_UNKNOWN)
			if (userpref_dongle_on) { // should be displayed on dongle
				setTvDongleState(DONGLE_STATE_ON); // Dongle is present and should be used
			} else {
				setTvDongleState(DONGLE_STATE_OFF); // Dongle is present and should not be used
			}
		} else { // previously present or initialisation (ie dongle_state == DONGLE_STATE_UNKNOWN)
			setTvDongleState(DONGLE_STATE_NONE); // Dongle is absent
		}

		if (userpref_dongle_on) {
			screen_manager.notifyEvent('dongletv', notified_dongle_on);
		}

		displayMessage(notified_dongle_on ? mdongleon : (b_connect_error ? mdongleconnecterror : mdongleoff));
	}

	// console.info("<== setTvDonglePresent");
}

// FROM user choice
function setUseDongle(b_use) {
	// console.info("==> setUseDongle: old< " + userpref_dongle_on +"> - new<" + b_use + ">"); // DEBUG

	if (userpref_dongle_on != b_use) {
		userpref_dongle_on = b_use;
		if (dongle_state != DONGLE_STATE_UNKNOWN) {
			setTvDongleState(notified_dongle_on ? userpref_dongle_on ? DONGLE_STATE_ON : DONGLE_STATE_OFF : DONGLE_STATE_NONE);
			if (notified_dongle_on) screen_manager.notifyEvent('dongletv', userpref_dongle_on);
			else displayMessage(mdongleoff);
		}
	}

	// console.info("<== setUseDongle");
}

// FROM user choice
function switchUseDongle()
{ setUseDongle(!userpref_dongle_on); }

// =========================================================================

// VIDEO MANAGEMENT

// Current video player is Dongle player or Feature phone player
var current_videoplayer = null; // No current video player at start of application

function updateVideoTime()
{
	if (!current_videoplayer)
	{
		return;
	}

	var timeinfo = current_videoplayer.getMediaTime(); // [mediaDuration, currentPosition, NaN, NaN] second
	if (timeinfo)
	{
		var mediaDuration = timeinfo[0]; // second
		var currentPosition = timeinfo[1]; // second
		// var bufferStart = timeinfo[2]; // second
		// var bufferEnd = timeinfo[3]; // second

		if (isNaN(mediaDuration))
		{ // Player does not know the duration of the media. Set it according to schedule range
			mediaDuration = media_list[media_index].original.sessionEndTime - media_list[media_index].original.sessionStartTime;
		}

		if (isNaN(currentPosition))
		{ // Player does not know the duration of the media.. Set it according to now
			currentPosition = (((new Date().getTime()) / 1000) >> 0);
		}

		// Set the referene time at media_list[media_index].original.sessionStartTime
		var position_in_scrollBar = currentPosition - media_list[media_index].original.sessionStartTime;
		// var bufferStart_in_scrollBar = bufferStart - media_list[media_index].original.sessionStartTime;
		// var bufferEnd_in_scrollBar = bufferEnd - media_list[media_index].original.sessionStartTime;

		// POSITION: left number cf index.html
		e_position.set(position_in_scrollBar);
		e_position.setvisible(true);

		// TOTAL: rigth number cf index.html
		e_total.set(mediaDuration);
		e_total.setvisible(true);

		// SCROLLBAR: scrollbar cf index.html
		if (e_posbar.set(mediaDuration, position_in_scrollBar + offset_seek_cumulative_time))
		{
			e_posbar.setvisible(true);
		} 
		else
		{
			e_posbar.setvisible(false);
		}
	}
	else // !timeinfo
	{
		e_position.setvisible(false);
		e_total.setvisible(false);
		e_posbar.setvisible(false);
	}
}

function videoError(message, url, counter)
{
		displayMessage(message, counter);
}

e_player.onerror = videoError;

// =========================================================================

// MESSAGES MANAGEMENT

var tm_help = null;
function displayHelp()
{
	if (tm_help) clearTimeout(tm_help);
	e_loading.setvisible(true);
	tm_help = setTimeout(function(){e_loading.setvisible(false);}, 5000);
}

var tm_dispm = null;
function displayMessage(m, counter)
{
	if (tm_dispm) clearTimeout(tm_dispm);
	if (m)
	{
		console.log("MESSAGE: "+m);
		if (counter != undefined)
			e_notify_msg.set(["span", m.toString() + "(x" + counter + ")"]);
		else
			e_notify_msg.set(["span", m.toString()]);
		e_notify_msg.setvisible(true);
		tm_dispm = setTimeout(function(){displayMessage();}, 5000);
	}
	else e_notify_msg.setvisible(false);
}

displayMessage(mloadingservices);

// =========================================================================

// MEDIA LIST MANAGEMENT

// A media list enables switching between multiple media
// from player screen with CH+ and CH- keys.

// Current playing media list
var media_list = [];
var media_index = NaN;

var media_opened_serv = null; // currently open
var media_closing_serv = null; // requested to close --> for zapping management
var media_requested_serv = null; // requested to open --> for zapping management

function mediaUrl(media_item)
{
	if (media_item.is_live) return media_item.mpdUri;
	media_item.url = media_item.file.downloadHttpUrl; // update
	return media_item.url;
}

// d_index == -1  play previous media item
// d_index ==  0  open media (new list)
// d_index == +1  play next media item
function openMedia(d_index)
{
	/* 
	 ** d_index = 0: the enduser select a service from service list screen
	 ** else (d_index != 0): the enduser is zapping
	 **
	 ** if it is zapping, the screen is the same (as previous) and should be replaced (instead of being pushed) in callstack
	 */
	var channel_change = (d_index != 0);
	var i = isNaN(media_index) ? 0 : media_index;

	if ((d_index != 0) && (media_list.length<=1))
	{
		// only one service, do not try to zapp
		return;
	}

	do {
		i += d_index;
		if (i >= media_list.length) i = 0;
		if (i < 0) i = media_list.length - 1;
		if (d_index != 0 && !isNaN(media_index) && (i == media_index)) return; // Same media, nothing to do (except with explicit d_index==0)
		if (d_index == 0) d_index = 1;
	} while (!mediaUrl(media_list[i]));
	media_index = i;
	var media_item = media_list[media_index];

	// Close previously opened live service if any
/*
	mw_live_close(null, function()
	{
		if (media_item.is_live)
		{
			// Live need to be opened before playing
			mw_live_open(media_item,
				function(mpd_uri)
				{
					if (mpd_uri) media_item.mpdUri=mpd_uri;
					screen_manager.openScreen(screen_video_media_file,channel_change,media_item);
				});
		}
		else
		{
			// File already stored in MW directory
			media_item.url = media_item.file.downloadHttpUrl; // update
			screen_manager.openScreen(screen_video_media_file,channel_change,media_item);
		}
	});*/

	if (channel_change)
	{// it is zapping so there is a previous live that should be closed
		media_closing_serv = media_opened_serv;
		mw_live_close(media_closing_serv);
	}

	if (media_item.is_live)
	{
		// Live need to be opened before playing
		displayMessage(mopeningservice);
		media_requested_serv = media_item.original;		
		mw_live_open(media_item.original,
			function(mpd_uri)
			{
				if (mpd_uri)
					media_item.mpdUri=mpd_uri;
				if (media_item.original.mpdUri)
					media_item.mpdUri=media_item.original.mpdUri;
				screen_manager.openScreen(screen_video_media_file,channel_change,media_item);
			},
			function(state,err)
			{
				if (!state) // open is not ok
				{
					displayMessage("ERROR: "+err);
				}
			});
	}
	else
	{
		// File already stored in MW directory
		media_item.url = media_item.file.downloadHttpUrl; // update
		screen_manager.openScreen(screen_video_media_file,channel_change,media_item);
	}
}

// list:[ { name: , type: , url: } | { is_live:true; name: , type: , mpdUri: }, ... ]
function openMediaList(index, list)
{
	if (media_index != index)
	{
		console.log("OPEN MEDIA "+index+" / "+list.length);		
		media_index = index;
		media_list = list;
		openMedia(0);
	}
	else
	{
		console.log("OPEN MEDIA (same as previous): " + index + " / " + list.length);
	}
}

// =========================================================================

// Media list ready to play
var embms_media_list = [];


// Media list type for streaming services:
// CH+/CH- through all streaming services.

// service_list -> embms_media_list
function loadMedialistLive()
{
	embms_media_list = [];
	for(var i in service_list)
	{
		var serv = service_list[i];
		if (serv.servtype == 'streaming') // streaming services only
		{
			serv.media_index = embms_media_list.length;
			serv.is_live = true;
			embms_media_list.push(serv);
			console.log("[APP] MEDIALIST["+i+"] + LIVE "+serv.media_index+" "+serv.name.toString() + " DURATION " + serv.mediaDuration);
		}
	}
}

// Media list type for one file download service:
// CH+/CH- through all downloaded files from the service.

function loadMedialistFiles(filelist)
{
	embms_media_list = [];
	for(var i in filelist)
	{
		var file = filelist[i].original;
		file =
		{
			'url':file.downloadHttpUrl,'name':file.fileUri,'type':file.contentType,
			'file':file,'media_index':embms_media_list.length,'is_live':false
		};
		embms_media_list.push(file);
	}
}

// =========================================================================

// SERVICE MANAGEMENT

var service_list = null;
var i_serv_index = 0;

function selectService(index, item, oitem, eitem)
{
	console.log("[APP] SELECT SERVICE: "+index);
	i_serv_index = index;
	if (oitem.servtype=='filedownload') screen_manager.openScreen(screen_filelist,false,oitem);
	else openMediaList(oitem.media_index, embms_media_list);
}

var b_update_service_list = true;

var file_service = null;
var file_list = null;
var i_file_index = 0;

var ACTION_DOWNLOAD = 0;
var ACTION_VIEW     = 1;
var ACTION_DELETE   = 2;

function selectFile(index, item, oitem, eitem)
{
	var action_index = e_actionlist.getactionindex();
	if (action_index<0)
	{
		alert(minvalidaction.toString());
		return ;
	}
	switch(action_index)
	{
	case ACTION_DOWNLOAD:
		displayMessage('Downloading file ');
		oitem.original.startCapture().then( function(){
			focusFile(index,item,oitem,eitem);
		} );
		oitem.original.onmessage=function(e)
		{
			console.log("[MW->APP] EVENT File.message: "+e.message);
			console.log("[APP] REFRESH FILE "+index+" sel="+(e_list.getselected()==index)+": %o",oitem);
			e_list.refresh();
			if (e_list.getselected()==index)
				focusFile(index,item,oitem,eitem);
		};
		break;
	case ACTION_VIEW:
		displayMessage('Viewing file ');
		openMediaList(oitem.media_index, embms_media_list);
		break;
	case ACTION_DELETE:
		displayMessage('Deleting file ');
		file_service.original.deleteFile(oitem).then( function(){
			focusFile(index,item,oitem,eitem);
		} );
		break;
	}
}

function getFileType(ofile)
{
	return ofile.contentType || types.getTypeFromName(ofile.fileUri);
}

function focusFile(index, item, oitem, eitem)
{
	console.log("Adjust actions for file #"+index+" %o",oitem);
	switch(oitem.original.state)
	{
	case "notdownloaded":
		console.log("--> [not downloaded] +DOWNLOAD -VIEW -DELETE");
		e_actionlist.setactionstate(ACTION_DOWNLOAD, true);
		e_actionlist.setactionstate(ACTION_VIEW, false);
		e_actionlist.setactionstate(ACTION_DELETE, false);
		break;
	case "downloading":
		console.log("--> [downloading] -DOWNLOAD -VIEW +DELETE");
		e_actionlist.setactionstate(ACTION_DOWNLOAD, false);
		e_actionlist.setactionstate(ACTION_VIEW, false);
		e_actionlist.setactionstate(ACTION_DELETE, true);
		break;
	case "succeeded":
		console.log("--> [downloaded succeeded] -DOWNLOAD *VIEW +DELETE");
		e_actionlist.setactionstate(ACTION_DOWNLOAD, false);
		e_actionlist.setactionstate(ACTION_VIEW, type_view_supported.contains(getFileType(oitem.original)) ? true : mnoviewfileformat);
		e_actionlist.setactionstate(ACTION_DELETE, true);
		break;
	case "suspended":
		console.log("--> [suspended] +DOWNLOAD -VIEW +DELETE");
		e_actionlist.setactionstate(ACTION_DOWNLOAD, true);
		e_actionlist.setactionstate(ACTION_VIEW, false);
		e_actionlist.setactionstate(ACTION_DELETE, true);
		break;
	}
	e_actionlist.setselected(0);
}

var m_info_item_serv_type="";

function refreshServiceInfo()
{
	e_item_info.set(["span",m_info_item_serv_type.toString()]);
}

function focusService(index, item, oitem, eitem)
{
	m_info_item_serv_type = oitem.servtype=='streaming' ? mservlive : mservfile;
	refreshServiceInfo();
}

// =========================================================================

// SCREENS MANAGEMENT

function refreshLoadingScreen()
{
	e_loading.set(mloadingservices.toString()+"\n");
	e_loading.add(["img",{'src':'images/app_keys.png'}]);
}

var screen_loading = new Screen({
	"elements":[ e_app_title, e_loading ],
	"orientation":ORIENTATION_PORTRAIT_1,
	"onopen":function()
	{
		refreshLoadingScreen();
	},
	"onclose":function()
	{
		e_loading.set(["img",{'src':'images/app_keys.png'}]);
	},
	"onrefresh":function()
	{
		refreshLoadingScreen();
	},
	"onkeydown":function(key)
	{
		switch(key)
		{
		case KEY_OK:
		case KEY_REFRESH_LIST:  mw_reloadServices(); break;
		default: return false;
		}
		return true;
	},
	});

var screen_servicelist = new Screen({
	"elements":[ e_app_title, e_list, e_item_info, e_tv_status, e_lteb_status ],
	"onopen":function()
	{
		e_screen_title.setText(mservselect.toString());
		e_list.settitle(mselectserv.toString());
		e_list.setitems(service_list,'name');
		e_list.setselected(i_serv_index);
		e_list.onselect = selectService;
		e_list.onfocus = focusService;
		b_update_service_list = true;
		refreshServiceInfo();
		loadMedialistLive();

		if (null == e_position)
			e_position = new timearea("c_position");

		if (null == e_total)
			e_total = new timearea("c_total");

		if (null == e_posbar)
			e_posbar = new scrollbar("c_posbar");

		// reseting chosen item in list (if previously set)
		media_index = NaN;
	},
	"onclose":function()
	{
		b_update_service_list = false;
	},
	"onrefresh":function(nlang)
	{
		e_screen_title.setText(mservselect.toString());
		e_list.settitle(mselectserv.toString());
		var i = e_list.getselected();
		e_list.setitems(service_list,'name');
		e_list.setselected(i);
		refreshServiceInfo();
	},
	"onkeydown":function(key)
	{
		switch(key)
		{
		case KEY_REFRESH_LIST:  mw_reloadServices();loadMedialistLive(); break;
		case KEY_HELP:          displayHelp(); break;
		case KEY_SWITCH_VIEW:   switchUseDongle(); break;
		default: return false;
		}
		return true;
	},
	});

function updateFileList(b_refresh)
{
	mw_getFileList(file_service.original, function(filelist)
	{
		file_list = filelist;
		var i = e_list.getselected();
		if (!b_refresh || i<0) i = i_file_index;
		e_list.setitems(file_list,'label');
		e_list.setselected(i);
		loadMedialistFiles(file_list);
	});
}

function refreshActionList()
{
	e_actionlist.settitle(mselectaction.toString());
	e_actionlist.setactionlabel(ACTION_DOWNLOAD, mdownload.toString());
	e_actionlist.setactionlabel(ACTION_VIEW, mview.toString());
	e_actionlist.setactionlabel(ACTION_DELETE, mdelete.toString());
}

function setAvailableAction()
{
	e_actionlist.setselected(0);
}

var screen_filelist = new Screen({
	"elements":[ e_app_title, e_list, e_actionlist, e_tv_status, e_lteb_status ],
	"onopen":function(oserv)
	{
		file_service = oserv;
		e_screen_title.setText(file_service.name.toString());
		refreshActionList();
		e_list.settitle(mselectfile.toString());
		e_list.onselect = selectFile;
		e_list.onfocus = focusFile;
		updateFileList();
	},
	"onrefresh":function(nlang)
	{
		e_screen_title.setText(file_service.name.toString());
		refreshActionList();
		e_list.settitle(mselectfile.toString());
		updateFileList(true);
	},
	"onkeydown":function(key)
	{
		switch(key)
		{
		case KEY_HELP:          displayHelp(); break;
		case KEY_SWITCH_VIEW:   switchUseDongle(); break;
		default: return false;
		}
		return true;
	},
	});

// =========================================================================

// MEDIA PLAYER SCREEN MANAGEMENT

var current_media_title = null;
var current_media_url = null;
var current_media_type = null;

function setMediaUrl(url, filetype)
{
	// console.log("==> setMediaUrl url<" + url +"> - filetype<" + filetype +">"); // DEBUG

	current_media_url = url;
	if (!filetype) current_media_type = types.getMainTypeFromName(url);
	else current_media_type = types.getMainType(filetype);
	current_videoplayer.setmediatype(current_media_type);

	// console.log("<== setMediaUrl");
}

function playVideo(b_play, title, url, filetype) {
	console.log("==> PLAYER: " + (b_play ? "PLAY" : "STOP") + " T:" + (title ? title : '--') + " U:" + (url ? url : '--') + " M:" + (filetype ? filetype : '--'));
	if (!b_play)
	{
		if (media_opened_serv && (media_closing_serv != media_opened_serv))
		{
			/* One and only one mw_live_close should be called:
			 ** The first one could be sent when closing screen (zapping case)
			 ** then if is not zapping, it should be called here.
			 **
			 ** As current serive hsa not been requested to be closed, it is not zapping case.
			 */
			media_closing_serv = media_opened_serv;
			mw_live_close(media_closing_serv, function () {});
		}

		// No more open service
		media_opened_serv = null;

		// No more closing request
		media_closing_serv = null;

		e_player.stop();
		player_dongle.stop();
		e_player.setvisible(false);
		e_dongle_screen.setvisible(false);
		current_videoplayer = null;
		current_media_title = null;
		current_media_url = null;
	} else if (isViewWithDongle()) {
		// The service is open
		media_opened_serv = media_requested_serv;
		media_closing_serv = null;
		media_requested_serv = null;

		screen_manager.setAutoHideEnable(false);
		e_dongle_screen.set(mviewontv.toString());
		e_dongle_screen.setvisible(true);
		e_player.setvisible(false);
		e_player.stop();
		current_videoplayer = player_dongle;
		if (title) current_media_title = title;

		if (url) { /* update information */
			setMediaUrl(url, filetype);
		} else { /* set current information */
			setMediaUrl(current_media_url, current_media_type);
		}

		player_dongle.play(current_media_title, current_media_url);

		console.log("<== DONGLE PLAYER: " + (b_play ? "PLAY" : "STOP") + " T:" + current_media_title + " U:" + current_media_url + " M:" + current_media_type);
	} else {
		// The service is open
		media_opened_serv = media_requested_serv;
		media_closing_serv = null;
		media_requested_serv= null;

		screen_manager.setAutoHideEnable(true);
		e_player.setvisible(true);

		// By default: eBox, RJIL, Asia then akamai
		e_player.getDashMediaPlayer().clearDefaultUTCTimingSources();
		e_player.getDashMediaPlayer().addUTCTimingSource('urn:mpeg:dash:utc:http-head:2014', 'http://192.168.3.1');
		e_player.getDashMediaPlayer().addUTCTimingSource('urn:mpeg:dash:utc:http-head:2014', 'http://embms.jio.com');
		e_player.getDashMediaPlayer().addUTCTimingSource('urn:mpeg:dash:utc:http-head:2014', 'http://1.asia.pool.ntp.org');
		e_player.getDashMediaPlayer().addUTCTimingSource('urn:mpeg:dash:utc:http-xsdate:2014', 'http://time.akamai.com/?iso');

		// Force Delay to 0
		e_player.getDashMediaPlayer().setLiveDelayFragmentCount(0);

		e_dongle_screen.setvisible(false);
		player_dongle.stop();
		current_videoplayer = e_player;
		if (title)
			current_media_title = title;
		if (url) {
			setMediaUrl(url, filetype);
		} else {
			setMediaUrl(current_media_url, current_media_type);
		}
		e_title.set(current_media_title);
		e_player.play(current_media_url);

		console.log("<== PLAYER: " + (b_play ? "PLAY" : "STOP") + " T:" + current_media_title + " U:" + current_media_url + " M:" + current_media_type);
	}
}


var non_referenced_components = new Screen({
	"elements":[ e_player, e_dongle_screen ],
});

// Single video file/live, Feature Phone / TV Dongle
var screen_video_media_file = new Screen({
	"elements":[ /*e_player*/ ],
	"elements_autohide":[ ov_top, ov_bottom ],
	"ontick":updateVideoTime,
	"onopen":function(url)
	{
		// static string URL / MW live_service / MW file
		var media_title = '--';
		var media_url = url;
		var media_type = null;
		if (typeof(url)=="object")
		{
			if (url['type']) media_type = url['type'].toString();
			if (url['name']) media_title = url['name'].toString();
			if (url.mpdUri) media_url = url.mpdUri;
			else media_url = url.url;
		}
		offset_seek_cumulative_time = 0;
		playVideo(true, media_title, media_url, media_type);
	},
	"onrefresh":function()
	{
		e_dongle_screen.set(mviewontv.toString());
	},
	"onclose":function()
	{
		offset_seek_cumulative_time = 0;
		playVideo(false);
	},
	"ondongletv":function(b)
	{
		console.log("-- Switch to view using "+(b?"TV dongle":"Feature Phone")+" --");
		offset_seek_cumulative_time = 0;
		playVideo(true);
	},
	"onkeydown": function (key) {
		switch (key) {
			case KEY_HELP:
				displayHelp();
				break;
			case KEY_SWITCH_VIEW:
				switchUseDongle();
				break;
			case KEY_PAUSE:
				console.log("KEY: PAUSE/RESUME");
				if (current_videoplayer) current_videoplayer.pauseOrResume();
				break;
			case KEY_TIME_BACKWARD:
				console.log("KEY: <<");
				if (current_videoplayer) {
					offset_seek_cumulative_time += -5;
					current_videoplayer.moveMediaTime(-5); // second
				}
				break;
			case KEY_TIME_FORWARD:
				console.log("KEY: >>");
				if (current_videoplayer) {
					offset_seek_cumulative_time += 5;
					current_videoplayer.moveMediaTime(+5); // second
				}
				break;
			case KEY_VOL_UP:
				console.log("KEY: V+");
				if (current_videoplayer) current_videoplayer.changevolume(+1);
				break;
			case KEY_VOL_DOWN:
				console.log("KEY: V-");
				if (current_videoplayer) current_videoplayer.changevolume(-1);
				break;
			case KEY_CH_PREV:
				console.log("KEY: CH-");
				openMedia(-1);
				break;
			case KEY_CH_NEXT:
				console.log("KEY: CH+");
				openMedia(+1);
				break;
			default:
				return false;
		}
		return true;
	},
	});

// =========================================================================

// MIDDLEWARE MANAGEMENT

// New service list received:
function event_service_list(list)
{
	var currentScreen = screen_manager.getScreenCurrent();
	var servlist_opened = (currentScreen && (screen_servicelist === currentScreen));

	console.log("[APP] "+list.length+" services, update = "+b_update_service_list);
	if (b_update_service_list) // only if application wait for service list (from loading & service list screens)
	{
		service_list = list;
		if (servlist_opened) { e_list.setitems(service_list,'name'); loadMedialistLive(); }
		else if (list.length>0)
		{
			screen_manager.openScreen(screen_servicelist,true); // Open service list screen if not empty
		}
	}
}

mw_on_servicelist_updated = event_service_list;

var cov_state_in = false;
function event_coverage_change(lteb_in)
{
	console.log("[MW->APP] Coverage LTE "+(lteb_in?'IN':'OUT'));
	if (lteb_in != cov_state_in)
	{
		cov_state_in = lteb_in;
		var s_image = lteb_in ? 'in':'out';
		e_lteb_status_image.setSource('images/lteb_'+s_image+'.png');
	}
}

mw_on_coverage_updated = event_coverage_change;
mw_coverage_change_update();

// =========================================================================

// APPLICATION EXIT

function app_destroy()
{
/*
	mw_stop();
	e_player.destroy();
	player_dongle.destroy();
	//window.close();
*/
	mw_stop(function()
	{
		e_player.destroy();
		player_dongle.destroy();
		window.close();
	});
}

screen_manager.onexit = app_destroy;

// =========================================================================

console.info(app_info.name+" - V"+app_info.version+" - (c) Copyright 2017-2018 EXPWAY");
displayMessage();

// Before service list is received from MW:
screen_manager.openScreen(screen_loading);

// =========================================================================
// (c) Copyright 2017-2018 EXPWAY
// =========================================================================

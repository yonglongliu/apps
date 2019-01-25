
///////////////////////////////////////////////////////////////////////////////
// eMBMS MIDDLEWARE functions

///////////////////////////////////////////////////////////////////////////////

var ew_embms_config =
{
	"service_classes":[
		/* Local tests with stub MW */ "ew:test","bbb","cat","img",
		/* Local tests with capture or eBox */ "1","2","3",
		"jio_broadcast"
		],
};

// Callback list for cleanup after object use.
// Callback List Index (CLI):
//    0: listeners on manager
//    1: listeners on services
//    2: listeners on streaming handles
//    3: listeners on file download handles
//    4: listeners on files
var ew_event_cb_list = [[],[],[],[],[]];

// cli: Callback List Index
function ewClearEventListeners(cli)
{
	for(var i in ew_event_cb_list[cli])
	{
		var cbp = ew_event_cb_list[cli][i];
		cbp[0].removeEventListener(cbp[1],cbp[2]);
	}
	ew_event_cb_list[cli] = [];
}

// cli: Callback List Index
function ewCaptureEvent(cli, o, eventname, f_listener)
{
	//console.log("[APP] ADD listener "+f_listener+" for event '"+eventname+"' on object "+o);
	o.addEventListener(eventname, f_listener);
	//o['on'+eventname] = f_listener;
	ew_event_cb_list[cli].push([o,eventname,f_listener]);
}

var mw_manager = navigator.lteBroadcastManager; // USE XPCOM MW

var mw_serv_streaming = null;
var mw_serv_files = null;
var mv_opened_serv = null;

var mw_live_start_cb = null;

function mw_live_started()
{
	if (mw_live_start_cb)
	{
		mw_live_start_cb();
		mw_live_start_cb = null;
	}
}

function mw_live_open(o_serv, f_then, f_status)
{
	console.log("[APP->MW] Calling LteBroadcastStreamingHandle.start");
	o_serv.start().then(
		function () 
		{
			mv_opened_serv = o_serv;
			console.log("[MW->APP] Call LteBroadcastStreamingHandle.start returned OK");
			if (f_then)
			{
				f_then();
			}
			mw_live_start_cb = null;

			if (f_status) f_status(true);
			return (null);
		})
		.catch(function (e)
		{
			mw_error("LteBroadcastStreamingHandle.start", e);
			if (f_status) f_status(false, e);
			}
		);
}

function mw_live_close(o_serv, f_then)
{
	console.log("[APP->MW] Calling Closing Live");
	mw_live_start_cb = null;
	if (!o_serv)
		o_serv = mv_opened_serv;
	if (o_serv) {
		console.log("[APP->MW] Calling LteBroadcastStreamingHandle.stop");
		o_serv.stop().then(
				function ()
				{
					mv_opened_serv = null;
					console.log("[MW->APP] Call LteBroadcastStreamingHandle.stop returned OK");
					if (f_then)
						f_then();
					return (null);
				})
			.catch(
				function (e)
				{
					mw_error("LteBroadcastStreamingHandle.stop", e);
				}
			);
	}
	else
	{
		console.log("[MW->APP] Closing Live: no live running");
		if (f_then)
			f_then();
	}
}

function mw_error(funcname, e)
{
	//console.log("[MW->APP] Call " + funcname + " returned error "+e.error+": "+e.error_description);
	console.log("[MW->APP] Call " + funcname + " returned error: "+e);
}

function mw_start(f_then)
{
	console.log("[APP->MW] Calling LteBroadcastManager.start");
	mw_manager.start().then(
		function()
		{
			console.log("[MW->APP] Call LteBroadcastManager.start returned OK");
			if (f_then) f_then();
			return (null);
		})
		.catch(
			function (e)
			{
				mw_error("LteBroadcastManager.start",e);
			});
}

function mw_stop(f_then)
{
	console.log("[APP->MW] Calling LteBroadcastManager.stop");
	mw_manager.stop()
		.then(
		function()
		{
			console.log("[MW->APP] Call LteBroadcastManager.stop returned OK");
			if (f_then) f_then();
				return(null);
			})
		.catch(
			function(e)
			{
				mw_error("LteBroadcastManager.stop",e);
			});
}

function mw_setServiceClasses(serv_classes, f_then)
{
	console.log("[APP->MW] Calling LteBroadcastManager.setServiceClassFilter "+serv_classes);
	mw_manager.setServiceClassFilter(serv_classes).then(
		function()
		{
			console.log("[MW->APP] Call LteBroadcastManager.setServiceClassFilter "+serv_classes+" returned OK");
			if (f_then) f_then();
			return(null);
		})
		.catch(
			function(e){ mw_error("LteBroadcastManager.setServiceClassFilter "+serv_classes,e); });
}

function mw_getService(type, f_then)
{
	console.log("[APP->MW] Calling LteBroadcastManager.getService "+type);
	mw_manager.getService(type)
		.then(
			function(serv)
			{
				console.log("[MW->APP] Call LteBroadcastManager.getService "+type+" returned OK");
				if (f_then) f_then(serv);
				return (null);
			})
		.catch(
			function(e)
			{
				mw_error("LteBroadcastManager.getService "+type,e);
			});
}

function FileLabel(ofile)
{
	this.file = ofile;
}

FileLabel.prototype.toString = function()
{
	var s = this.file.fileUri;
	switch(this.file.state)
	{
	case "notdownloaded": s=""+s; break;
	case "downloading": s="..."+s; break;
	case "succeeded": s="* "+s; break;
	case "suspended": s="? "+s; break;
	}
    return s;
};

function mw_getFileList(service, f_then)
{
	console.log("[APP->MW] Calling LteBroadcastFileDownloadHandle.getFiles");
	service.getFiles().then(
		function(filelist)
		{
			console.log("[MW->APP] Call LteBroadcastFileDownloadHandle.getFiles returned OK");
			var mwfiles = [];
			for(var i in filelist)
			{
				console.log("[APP] FILE "+i+" / "+filelist.length+"...");
				var file = {};
				mwfiles.push(file);
				file['original']= filelist[i];
				file['label']=new FileLabel(filelist[i]);
			}
			f_then(mwfiles);
		},
		function(e){ mw_error("LteBroadcastFileDownloadHandle.getFiles",e); });
}

var mw_service_lists = [ [], [] ]; // streaming, files
var mw_lteb_in = false; // [LTE Coverage == in]

var mw_on_servicelist_updated = null;
var mw_on_coverage_updated = null;

function mw_notifyCoverage()
{
	//console.log("[MW->APP] Coverage notify to "+mw_on_coverage_updated);
	if (mw_on_coverage_updated)
	{
		mw_on_coverage_updated(mw_lteb_in);
	}
}

function mw_coverage_change_update()
{
	console.log("[APP] New coverage: "+mw_manager.coverage);
	mw_lteb_in = (mw_manager.coverage == "in");
	mw_notifyCoverage();
}

// Event handler function for onerror from LteBroadcastManager
function mw_manager_error(e)
{
	console.log("[MW->APP] ERROR: "+e);
}

// Event handler function for onmessage from LteBroadcastManager
function mw_manager_message(e)
{
	console.log("[MW->APP] EVENT Manager.message: "+e.message);
	switch(e.message)
	{
	case "coveragechanged":
		mw_coverage_change_update();
		break;
	case "saichanged":
		break;
	}
}

// Event handler function for onmessage from LteBroadcastHandle
function mw_handle_message(e)
{
	console.log("[MW->APP] EVENT Handle.message: "+e.message);
	// e.target
	switch(e.message)
	{
	case "started":
		mw_live_started();
		break;
	case "paused":
		break;
	}
}

ewCaptureEvent(0, mw_manager, 'message', mw_manager_message);
ewCaptureEvent(0, mw_manager, 'error', mw_manager_error);

function mw_notifyServiceUpdated()
{
	if (mw_on_servicelist_updated)
	{
		mw_on_servicelist_updated(mw_service_lists[0].concat(mw_service_lists[1]));
		// services[ <N> ]{.names[]{.name .language} .class .language}
	}
}

function mw_message_from_array(a)
{
	var m = {};
	console.log("[APP]     NAMES "+a.length+"...");
	for(var i in a)
	{
		var aa = a[i];
		console.log("[APP]       NAME " + i + " / " + a.length + " IS " + aa + "...");

		if (!aa.hasOwnProperty('language')) {
			/* if out-of-spec information is missing. Set as default */
			Object.defineProperty(aa, "language", {
				value: "default",
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		m[aa.language] = aa.name;
		console.log("[APP]         " + aa.language + " => " + aa.name);
		console.log("[APP]         " + aa.language.toString() + " => " + aa.name.toString());
	}
	return m;
}

function mw_requestHandles(serv, ilist)
{
	console.log("[APP->MW] Calling LteBroadcastService.getHandles");
	serv.getHandles().then(
		function(handles)
		{
			console.log("[MW->APP] Call LteBroadcastManager.getHandles returned OK");
			// Add new fields in service returned
			var mwservices = [];
			var v = handles instanceof Array ? handles : [handles];
			var is_streaming = ilist==0;
			ewClearEventListeners(2+ilist);
			for(var i in v)
			{
				console.log("[APP] SERVICE "+i+" / "+v.length+"...");
				// + .name  --> multilang message for service name changing according to selected language
				var newServ = {};
				mwservices.push(newServ);
				newServ['original']= v[i];
				newServ['media_index']= 0;
				if (is_streaming) newServ['mpdUri'] = v[i]['mpdUri'];

				if (v[i]['names'] && v[i]['names'].length) {
					newServ['name'] = new MultiLangMessage(mw_message_from_array(v[i]['names']));
				}

				if (!newServ.hasOwnProperty('name'))
				{ // update name with Service Id if name is not defined
					newServ['name'] = v[i].handleId;
				}
				// + .servtype  --> 'streaming' | 'filedownload'
				newServ['servtype']= is_streaming ? 'streaming' : 'filedownload';
				console.log("[APP]     ID = "+v[i].handleId);
				console.log("[APP]     NAME = "+newServ['name'].toString());
				console.log("[APP]     MEDIA-INDEX = "+newServ['media_index']);

				if (is_streaming)
				{
					newServ['mediaDuration'] = (v[i].sessionEndTime - v[i].sessionStartTime)/1000;
					console.log("[APP]     MEDIA-DURATION = " + newServ['mediaDuration'] + "s");
				}

				ewCaptureEvent(2+ilist, v[i], 'message', mw_handle_message);
			}
			mw_service_lists[ilist] = mwservices;
			mw_notifyServiceUpdated();
		},
		function(e){ mw_error("LteBroadcastManager.getHandles",e); });
}

// Event handler function for onmessage from LteBroadcastStreamingService
function mw_service_streaming_message(e)
{
	console.log("[MW->APP] EVENT Streaming Service.message: "+e.message);
	// e.target
	switch(e.message)
	{
	case "handlesupdated":
		mw_requestHandles(mw_serv_streaming, 0);
		break;
	case "availabilityupdated":
		break;
	}
}

// Event handler function for onmessage from LteBroadcastFileDownloadService
function mw_service_filecast_message(e)
{
	console.log("[MW->APP] EVENT File Download Service.message: "+e.message);
	// e.target
	switch(e.message)
	{
	case "handlesupdated":
		mw_requestHandles(mw_serv_files, 1);
		break;
	case "availabilityupdated":
		break;
	}
}

function mw_setServiceStreaming(serv)
{
	/* STREAMING SERVICE RECEIVED */
	console.log("[APP] SET mw_serv_streaming.statechange");
	mw_serv_streaming=serv;
	ewCaptureEvent(1, mw_serv_streaming, 'message', mw_service_streaming_message);
	mw_requestHandles(mw_serv_streaming, 0);
}

function mw_setServiceFiles(serv)
{
	/* FILE DOWNLOAD SERVICE RECEIVED */
	console.log("[APP] SET mw_serv_files.statechange");
	mw_serv_files=serv;
	ewCaptureEvent(1, mw_serv_streaming, 'message', mw_service_filecast_message);
	mw_requestHandles(mw_serv_files, 1);
}

function mw_reloadServices()
{
	if (mw_serv_streaming) mw_requestHandles(mw_serv_streaming, 0);
	if (mw_serv_files) mw_requestHandles(mw_serv_files, 1);
}

var _mw_init_done = false;
function _mw_init()
{
	if (_mw_init_done) return;
	_mw_init_done = true;
	mw_start(function(){
		mw_setServiceClasses(ew_embms_config.service_classes, function(){
			mw_getService('streaming', mw_setServiceStreaming);
			mw_getService('filedownload', mw_setServiceFiles);
		});
	});
/*
	mw_start();
	mw_setServiceClasses(ew_embms_config.service_classes);
	mw_getService('streaming', mw_setServiceStreaming);
	mw_getService('filedownload', mw_setServiceFiles);
*/
}

_mw_init();

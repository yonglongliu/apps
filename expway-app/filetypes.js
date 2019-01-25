/*

==========================
File type management.
(c) Copyright 2017 EXPWAY.
--------------------------
  filetypes.js
==========================

*/

function typelist()
{
	var items = [];
	for(var j=0 ; j<arguments.length ; j++) items.push(arguments[j]);
	this.contains = function(type)
	{
		for(var t in items)
		{
			var tt = items[t];
			if (tt.endsWith('/*'))
			{
				var i = type.indexOf('/');
				if (i>=0 && type.substring(0,i)==tt.substring(0,tt.length-2)) return true;
			}
			else if (tt == type) return true;
		}
		return false;
	}
}

var type_view_supported = new typelist('video/*','audio/*','image/*');

function mimetypes()
{
	var default_type = "application/octet-stream";
	var ext_to_type =
	{
		// Pseudo-types to indicate live service type
		//    LIVE
		"mpd":"live/dash",
		// MIME file types for file casting services, if not indicated by eMBMS middleware
		//    VIDEO
		"mp4":"video/mp4",
		"mp2":"video/mpeg",
		"m1v":"video/mpeg",
		"ogg":"video/ogg",
		"ogv":"video/ogg",
		"webm":"video/webm",
		//    AUDIO
		"aac":"audio/aac",
		"m4a":"audio/m4a",
		"m4p":"audio/m4p",
		"m2a":"audio/mpeg",
		"mp2a":"audio/mpeg",
		"mpga":"audio/mpeg",
		"mp3":"audio/mpeg",
		//    IMAGE
		"jpeg":"image/jpeg",
		"jpg":"image/jpeg",
		"gif":"image/gif",
		"png":"image/png",
	};
	this.getMainType = function(type)
	{
		var i = type.indexOf('/');
		return i<0 ? type : type.substring(0,i);
	};
	this.getMainTypeFromName = function(name)
	{
		return this.getMainType(this.getTypeFromName(name));
	};
	this.getTypeFromName = function(name)
	{
		name = name.toLowerCase();
		var i = name.lastIndexOf(".");
		if (i<0) return default_type;
		return ext_to_type[name.substring(i+1)] || default_type;
	};
}

var types = new mimetypes();

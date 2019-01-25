/*

===============================
User Interface Screens.
(c) Copyright 2017-2018 EXPWAY.
-------------------------------
  uiscreens.js
  uiscreens.css
===============================

Requires: domgen.js

*/

// =========================================================================

// PHYSICAL FEATURE PHONE KEY NAMES MAPPED TO LOGICAL KEYS

var KEY_BACK          = "Backspace";
var KEY_UP            = "ArrowUp";
var KEY_DOWN          = "ArrowDown";
var KEY_LEFT          = "ArrowLeft";
var KEY_RIGHT         = "ArrowRight";
var KEY_OK            = "Enter";

var KEY_VOL_UP        = "SoftRight";
var KEY_VOL_DOWN      = "SoftLeft";
var KEY_GO_TO_LIVE    = "0";
var KEY_SWITCH_VIEW   = "Call";
var KEY_MUTE          = "#";
var KEY_HELP          = "5";
var KEY_REFRESH_LIST  = "*";

var KEY_CH_PREV       =  KEY_UP;
var KEY_CH_NEXT       =  KEY_DOWN;
var KEY_TIME_BACKWARD =  KEY_LEFT;
var KEY_TIME_FORWARD  =  KEY_RIGHT;
var KEY_PAUSE         =  KEY_OK;


// =========================================================================

// SCREEN ORIENTATION

var ORIENTATION_LANDSCAPE_1 = 0;
var ORIENTATION_PORTRAIT_1 = 1;
var ORIENTATION_LANDSCAPE_2 = 2;
var ORIENTATION_PORTRAIT_2 = 3;

// =========================================================================

// SCREEN MANAGER

function ScreenManager()
{
	var stack = [];
	var tm_inactivity_delay = 5000;
	var tm_activity = null;
	var tm_autohide_enabled = true;
	var nav_keymap = {};
	var current_screen_orientation = -1;
	var enable_orientation_keys = true;

	var screen_orientations =
	[
		// NAME                  NAVIGATION KEY MAPPING (pressed key=>oriented key)
		[ "landscape-primary"  , { KEY_UP:KEY_LEFT,KEY_LEFT:KEY_DOWN,KEY_DOWN:KEY_RIGHT,KEY_RIGHT:KEY_UP } ],
		[ "portrait-primary"   , { /* Empty: same orientation as device keypad */ } ],
		[ "landscape-secondary", { KEY_UP:KEY_RIGHT,KEY_RIGHT:KEY_DOWN,KEY_DOWN:KEY_LEFT,KEY_LEFT:KEY_UP } ],
		[ "portrait-secondary" , { KEY_UP:KEY_DOWN,KEY_DOWN:KEY_UP,KEY_LEFT:KEY_RIGHT,KEY_RIGHT:KEY_LEFT } ]
	];

	screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation;
	screen.unlockOrientationUniversal = screen.unlockOrientation || screen.mozUnlockOrientation;

	function setScreenOrientation(orientation_num)
	{
		if (orientation_num<0) return screen.unlockOrientationUniversal();
		else return screen.lockOrientationUniversal(screen_orientations[orientation_num][0]);
	}
	this.setOrientation = function(orientation_num)
	{
		if (orientation_num != current_screen_orientation)
		{
			current_screen_orientation = orientation_num;
			setScreenOrientation(orientation_num);
			nav_keymap = screen_orientations[orientation_num][1];
			if (orientation_num>=0)
			{
				var screen = screenCurrent();
				if (screen) { if (screen.screenrotationNotify(screen_orientations[orientation_num][0])) return true; }
			}
		}
	};
	this.setOrientationByKeyEnabled = function(b)
	{
		enable_orientation_keys = b;
	};
	this.setOrientationByKey = function(orientation_num)
	{
		if (!enable_orientation_keys) return false;
		this.setOrientation(orientation_num); return true;
	};
	this.getScreenCurrent = function () {
		return (screenCurrent());
	};
	var screenCurrent = function()
	{
		if (stack.length==0) return null;
		return stack[stack.length-1];
	};
	var screenInactivityCallback = function()
	{
		tm_activity = null;
		if (tm_autohide_enabled)
		{
			var screen = screenCurrent();
			if (screen) screen.setVisibleLevel(1);
		}
	};
	var timerTick = setInterval(function()
	{
		var screen = screenCurrent();
		if (screen) screen.tickNotify();
	}, 100);
	this.activity = function() // On open screen, and key press:
	{
		if (tm_activity) clearTimeout(tm_activity);
		var screen = screenCurrent();
		if (screen) screen.setVisibleLevel(2);
		tm_activity = tm_autohide_enabled ? setTimeout(screenInactivityCallback, tm_inactivity_delay) : null;
	};
	this.setAutoHideEnable = function(b)
	{
		if (tm_autohide_enabled != b)
		{
			tm_autohide_enabled = b;
			this.activity();
		}
	};

	function switchLang()
	{
		var nlang = lang.next(true);
		console.log("Change to language "+nlang);
		var screen = screenCurrent();
		if (screen) screen.langSwitchNotify(nlang);
		return true;
	}
	this.notifyEvent = function(name, arg)
	{
		console.log("Notify screen event "+name+" "+arg);
		var screen = screenCurrent();
		if (screen)
		{
			screen.customEventNotify(name, arg);
			return true;
		}
		return false;
	};

	this.onexit = null;
	this.openScreen = function(screen, replace, arg)
	{
		if (replace && stack.length>0)
		{
			stack[stack.length-1].close();
			stack[stack.length-1] = screen;
		}
		else
		{
			if (stack.length>0) stack[stack.length-1].close();
			stack.push(screen);
		}
		screen._open_arg = arg;
		screen.open(arg);
		this.activity();
	};
	this.closeScreen = function()
	{
		if (stack.length>1)
		{
			stack.pop().close();
			stack[stack.length-1].open(stack[stack.length-1]._open_arg);
			this.activity();
		}
		else
		{
			console.log("Application exit.");
			if (tm_activity)
				clearTimeout(tm_activity);
			if (timerTick)
				clearInterval(timerTick);
			if (this.onexit) this.onexit();
			//window.close();
		}
	};
	var fcb_userkey = null;
	this.setUserkeyCallback = function(fcb)
	{
		fcb_userkey = fcb;
	};
	this.keyDownEvent = function(key_name)
	{
		this.activity();
		var screen = screenCurrent();
		//console.log("UI KEY="+key_name+"...");
		if (nav_keymap)
		{
			var kn = nav_keymap[key_name];
			if (kn) key_name = kn;
			//console.log("UI reoriented KEY="+key_name+"...");
		}
		if (screen) { if (screen.keyDownNotify(key_name)) return true; }
		//console.log("UI KEY="+key_name+" for screen-manager...");
		if (fcb_userkey)
		{
			if (fcb_userkey(key_name)) return true;
		}
		switch(key_name)
		{
			case "3": return switchLang();
			case "4": return this.setOrientationByKey(ORIENTATION_LANDSCAPE_1);
			case "8": return this.setOrientationByKey(ORIENTATION_PORTRAIT_1);
			case "6": return this.setOrientationByKey(ORIENTATION_LANDSCAPE_2);
			case "2": return this.setOrientationByKey(ORIENTATION_PORTRAIT_2);
			//case "5": return this.setOrientationByKey(-1);
			case KEY_BACK:
				//console.log("UI KEY => close");
				this.closeScreen();
				return true;
			default:
				return false;
		}
	};
	var othis = this;

	function handleKeyDown(event)
	{
		event.preventDefault();
		othis.keyDownEvent(event.key);
	}

	document.addEventListener('keydown', handleKeyDown);
}

var screen_manager = new ScreenManager();

// =========================================================================

// SCREEN CLASS

function Screen(screen_def)
{
	var visible_level = 2;
	var all_elements = screen_def["elements"];
	var autohide_elements = screen_def["elements_autohide"];
	var onrefresh = screen_def["onrefresh"];
	var onopen = screen_def["onopen"];
	var onclose = screen_def["onclose"];
	var onkeydown = screen_def["onkeydown"];
	var onscreenrotation = screen_def["onscreenrotation"];
	var ontick = screen_def["ontick"];
	var orientation = screen_def["orientation"];
	var orientation_keys = screen_def["orientation_keys"];
	this.setVisibleLevel = function(n) // 0: hidden, 1: show only no autohide, 2: show all elements
	{
		if (n != visible_level)
		{
			visible_level = n;
			var i = 0;
			for (i = 0; i < all_elements.length; i++) all_elements[i].setvisible(n > 0);
			if (autohide_elements)
				for (i = 0; i < autohide_elements.length; i++) autohide_elements[i].setvisible(n > 1);
		}
	};
	this.setVisibleLevel(0);
	this.customEventNotify = function(name, arg)
	{
		var on_evt = screen_def["on"+name];
		if (on_evt) on_evt(arg);
	};
	this.langSwitchNotify = function(nlang)
	{
		if (onrefresh) onrefresh(nlang);
	};
	this.tickNotify = function()
	{
		if (ontick) ontick(this);
	};
	this.open = function(arg)
	{
		this.setVisibleLevel(2);
		//console.log("SCREEN OR="+orientation+" BYKEY="+orientation_keys); // DEBUG
		if (orientation!==undefined) screen_manager.setOrientation(orientation);
		if (orientation_keys!==undefined) screen_manager.setOrientationByKeyEnabled(orientation_keys);
		lang.langs_other.setItems([]); // Can be overridden in onopen
		if (onopen) onopen(arg);
	};
	this.close = function()
	{
		this.setVisibleLevel(0);
		if (onclose) onclose();
	};
	function eventNotify(comp,name,arg)
	{
		if (comp[name]) if (comp[name].call(comp, arg)) return true;
		return false;
	}
	this.screenrotationNotify = function(orientation)
	{
		var i = 0;
		for (i = 0; i < all_elements.length; i++)
			if (eventNotify(all_elements[i], "onscreenrotation", orientation))
				return true;
		if (autohide_elements)
			for (i = 0; i < autohide_elements.length; i++)
				if (eventNotify(autohide_elements[i], "onscreenrotation", orientation))
					return true;
		if (onscreenrotation)
			if (onscreenrotation(orientation))
				return true;
		return false;
	};
	this.keyDownNotify = function (key_name)
	{
		var i = 0;
		for (i = 0; i < all_elements.length; i++)
			if (eventNotify(all_elements[i], "onkeydown", key_name))
				return true;
		if (autohide_elements)
			for (i = 0; i < autohide_elements.length; i++)
				if (eventNotify(autohide_elements[i], "onkeydown", key_name))
					return true;
		if (onkeydown)
			if (onkeydown(key_name))
				return true;
		return false;
	};
}

// =========================================================================

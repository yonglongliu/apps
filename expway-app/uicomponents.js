/*

==========================
User Interface Components.
(c) Copyright 2017 EXPWAY.
--------------------------
  uicomponents.js
  uicomponents.css
==========================

Requires: uiscreens.js domgen.js

*/

// =========================================================================

function doElemVerticalVisibilityAdjust(elem)
{
	var rect = elem.getBoundingClientRect();
	var vrect = elem.parentNode.parentNode.getBoundingClientRect();
	if (rect.top<vrect.top) elem.parentNode.parentNode.scrollTop+=rect.top-vrect.top;
	else if (rect.bottom>vrect.bottom) elem.parentNode.parentNode.scrollTop+=rect.bottom-vrect.bottom;
}

/*
==========================
Progress bar component.
==========================
*/

// Parameters:
//     id: Identifier of the existing <div> element for the progress bar.
//     width: Progress bar width in pixels (100 by default).
// Returns: A progress bar object having the following functions:
//     .setvisible(boolean)   show/hide the progres bar
//     .set(value)            set the progression value in percentage (0..100)
function progressbar(id, width)
{
	var e = document.getElementById(id);
	if (!width) width = 100;
	var barwidth = width;
	e.className = "progress";
	e.style.width = ""+barwidth+"px";
	var ebar = genDOM(["div",{"class":"progressbar","style":"width:"+barwidth+"px;"}," \u00A0 "]);
	var etext = genDOM(["div",{"class":"progresstext"}," \u00A0 0% \u00A0 "]);
	setDOM(e,ebar,etext);
	var pvalue = 0;
	this.setvisible = function(b)
	{
		e.style.display = b ? "block" : "none";
	};
	this.setvisible(false);
	this.set = function(value)
	{
		pvalue = Math.round(value<0 ? 0 : value>100 ? 100 : value);
		ebar.style.left = ""+((pvalue-100)*barwidth/100)+"px";
		setDOM(etext, " \u00A0 "+pvalue+"% \u00A0 ");
	};
}

// =========================================================================

/*
==========================
Scroll bar component.
==========================
*/

// Parameters:
//     id: Identifier of the existing <div> element for the progress bar.
//     width: Progress bar width in pixels (100 by default).
// Returns: A progress bar object having the following functions:
//     .setvisible(boolean)   show/hide the progres bar
//     .set(value)            set the progression value. Return true is should be displayed else value are not consistant
function scrollbar(id, width, minviewwidth)
{
	var e = document.getElementById(id);
	if (!width) {
		width = e.offsetWidth; // 100;
	}
	var barwidth = width;
	if (!minviewwidth) {
		minviewwidth = (width > 40 ? 40 : width) / 2;
	}
	var minwidth = minviewwidth;
	var viewwidth = minwidth;
	e.className = "scroll";
	e.style.width = "" + barwidth + "px";
	var ebar = genDOM(["div", {
		"class": "scrollbar",
		"style": "width:" + viewwidth + "px;"
	}, " "]);
	setDOM(e, ebar);
	this.setvisible = function (b) {
		e.style.display = b ? "block" : "none";
	};
	this.setvisible(false);
	// totalsize, position, [viewsize]
	this.set = function (totalsize, position, viewsize) {
		if (!viewsize) viewsize = 0; // same behavior when not providing argument and passing 0
		this.setvisible(true);
		barwidth = e.clientWidth;
		if (barwidth <= 0) {
			return (false);
		}
		if (totalsize <= 0) {
			//this.setvisible(false);
			return (false);
		} else {
			var wbar = 0,
				pbar = 0,
				wtotal = barwidth;
			if (viewsize <= 0) {
				// View size unknown
				wbar = minwidth;
				wtotal -= wbar;
			} else {
				wbar = barwidth * viewsize / totalsize;
				if (wbar < minwidth) {
					wtotal += wbar - minwidth;
					wbar = minwidth;
				}
			}

			pbar = wtotal * position / totalsize; // always position > 0
			ebar.style.left = "" + (pbar >> 0) + "px";
			ebar.style.width = "" + ((wbar - 8) >> 0) + "px";
			return (true);
		}
	};
}

// =========================================================================

/*
==========================
Time area component.
==========================
*/

function div(a,b){ return (a/b)>>0; }

function numPad2(value)
{
	return value<10 ? "0"+value : ""+value;
}

function secondsToString(value, b_short)
{
	var sign = value<0 ? "-" : "";
	if (value<0) value = -value;
	return sign + (b_short ? numPad2(div(value,60)) : numPad2(div(value,3600)) +":"+ numPad2(div(value,60)%60) ) +":"+ numPad2(value%60);
}

function timearea(id)
{
	var e = document.getElementById(id);
	var short_form = false;
	var current_value = 0;
	this.setvisible = function(b)
	{
		e.style.display = b ? "block" : "none";
	};
	this.setShortForm = function(b)
	{
		short_form = b;
		setDOM(e, secondsToString(current_value, short_form));
	};
	this.set = function(seconds)
	{
		current_value = div(seconds,1);
		setDOM(e, secondsToString(current_value, short_form));
	};
}

// =========================================================================

/*
==========================
Video overlay component.
==========================
*/

function overlay(id)
{
	var e = document.getElementById(id);
	this.setvisible = function(b)
	{
		//e.style.display = b ? "block" : "none";
		e.style.visibility = b ? "visible" : "hidden";
		e.style.opacity = b ? 1 : 0;
	};
	this.set = function(vcontent)
	{
		setDOM(e, vcontent);
	};
}

// =========================================================================

/*
==========================
Image component.
==========================
*/

function cimage(id)
{
	var e = document.getElementById(id);
	this.setvisible = function(b)
	{
		e.style.display = b ? "initial" : "none";
	};
	this.setSource = function(url)
	{
		e.src = url;
	};
}

// =========================================================================

/*
==========================
Generic component.
==========================
*/

function component(id)
{
	var e = document.getElementById(id);
	var maxtextlen = 0; // 0 or less = unlimited
	var text = null;
	this.setMaxTextLen = function(len)
	{
		maxtextlen = len;
		if (text!=null) setText(text);
	};
	this.setvisible = function(b)
	{
		e.style.display = b ? "initial" : "none";
	};
	this.set = function(vcontent)
	{
		setDOM(e, vcontent);
	};
	this.setText = function(s)
	{
		text = s;
		if (maxtextlen>0 && s.length>maxtextlen) s=s.substring(0, maxtextlen-3)+"...";
		setDOM(e, s);
	};
	this.add = function(vcontent)
	{
		appendDOM(e, vcontent);
	};
}

// =========================================================================

/*
==========================
Item list component.
==========================
*/

function itemlist(id)
{
	var e = document.getElementById(id);
	var items = [];  // ITEM: <div> element
	var nitems = []; // ITEM: displayable name
	var oitems = []; // ITEM: object
	var opath = [];  // path from item object to get the displayable text for the item
	var maxlen = 0; // 0 or less = unlimited
	var index = 0;
	var e_title = genDOM(["div", {"class":"title"}]);
	var e_items = genDOM(["div", {"class":"items"}]);
	appendDOM(e, e_title, ["div", {"class":"itemscontainer"}, e_items]);
	this.setMaxItemSize = function(lmax)
	{
		maxlen = lmax;
		this.refresh();
	};

	this.setvisible = function(b)
	{
		e.style.display = b ? "initial" : "none";
	};
	function goodIndex(n)
	{
		return n<0 ? 0 : n>=items.length ? items.length-1 : n;
	}
	this.settitle = function(s)
	{
		setDOM(e_title, "\u25B2 \u25BC "+s.toString());
	};
	this.setselected = function(n)
	{
		if (items.length==0) return;
		var i = goodIndex(index);
		items[i].className="item";
		index = goodIndex(n);
		items[index].className="itemselected";
		doElemVerticalVisibilityAdjust(items[index]);
		if (this["onfocus"]) this["onfocus"](index, nitems[index], oitems[index], items[index]);
	};
	this.getselected = function()
	{ return goodIndex(index); };
	this.onscreenrotation = function(new_orientation)
	{
		if (items.length>0) doElemVerticalVisibilityAdjust(items[index]);
		return false;
	};
	this.onkeydown = function(key)
	{
		switch(key)
		{
		case KEY_UP:
			this.setselected(index-1);
			break;
		case KEY_DOWN:
			this.setselected(index+1);
			break;
		case KEY_OK:
			if (this["onselect"]) this["onselect"](index, nitems[index], oitems[index], items[index]);
			break;
		default: return false;
		}
		return true;
	};
	this.refresh = function()
	{
		for(var i=0 ; i<oitems.length ; i++)
		{
			var s = oitems[i];
			for(var j=0 ; j<opath.length ; j++)
				s = s[ opath[j] ];
			s = s.toString();
			if (maxlen>0 && s.length>maxlen) s=s.substring(0,maxlen-3)+"...";
			setDOM(items[i], s);
		}
	};
	this.setitems = function(sitems)
	{
		var cur_name = (nitems && nitems.length) ? nitems[index] : null;
		setDOM(e_items);
		items = []; nitems = []; oitems = [];
		opath=Array.prototype.slice.call(arguments, 1);
		for(var i=0 ; i<sitems.length ; i++)
		{
			var s = sitems[i];
			oitems[i] = s;
			for(var j=0 ; j<opath.length ; j++)
				s = s[ opath[j] ];
			s = s.toString();
			nitems[i] = s;
			if (maxlen>0 && s.length>maxlen) s=s.substring(0,maxlen-3)+"...";
			appendDOM(e_items, ["div", {"id":"item"+i, "class":"item"}, s]);
			items[i] = document.getElementById("item"+i);
		}
		var cur_index = cur_name ? nitems.indexOf(cur_name) : -1;
		this.setselected(cur_index<0 ? 0 : cur_index);
	};
}

/*
==========================
Action list component.
==========================
*/

function actionlist(id /*, id_actions...*/)
{
	var e = document.getElementById(id);
	var e_title = document.getElementById(id+"_title");
	var actions = [];  // ACTION: <span> element
	var sactions = []; // ACTION: state (true focus&enable, false nofocus&disabled, <string> focus&disabled)
	var index = 0;
	var l_title = "Select action:";

	for(var j=1 ; j<arguments.length ; j++)
	{
		actions.push(document.getElementById(arguments[j]));
		sactions.push(true);
		actions[j-1].className='action';
	}

	this.setvisible = function(b)
	{
		e.style.display = b ? "initial" : "none";
	};
	function goodIndex(n)
	{
		return n<0 ? 0 : n>=actions.length ? actions.length-1 : n;
	}
	function showListTitle(s)
	{
		setDOM(e_title, "\u25C0 \u25B6 "+s.toString());
	}
	this.settitle = function(s)
	{
		l_title = s;
		showListTitle(s);
	};
	this.setactionlabel = function(i, label)
	{
		setDOM(actions[i], label.toString());
	};
	this.setactionstate = function(i, s)
	{
		sactions[i] = s;
		actions[i].className= sactions[i]===true ? "action" : "action_off";
	};
	this.setselected = function(n,b_down)
	{
		n = goodIndex(n);
		console.log("ALIST.select to ["+n+"] "+sactions[n]);
		if (b_down)
		{
			while (n>=0 && sactions[n]===false) n--;
			if (n<0) return false;
		}
		else
		{
			while (n<actions.length && sactions[n]===false) n++;
			if (n>=actions.length) return false;
		}

		var i = goodIndex(index);
		console.log("ALIST.select from ["+i+"] "+sactions[i]);
		actions[i].className= sactions[i]===true ? "action" : "action_off";
		index = n;
		actions[index].className="action_sel";
		showListTitle(typeof(sactions[index])=="boolean" ? l_title : sactions[index]);
		if (this["onfocus"]) this["onfocus"](index, sactions[index], actions[index]);
		return true;
	};
	this.getselected = function () {
		return goodIndex(index);
	};
	this.getactionindex = function()
	{
		return (sactions[index]===true) ? index : -1;
	};
	this.onkeydown = function(key)
	{
		switch(key)
		{
		case KEY_LEFT:
			this.setselected(index-1,true);
			break;
		case KEY_RIGHT:
			this.setselected(index+1,false);
			break;
		case KEY_OK:
			if (this["onselect"])
			{
				this["onselect"](index, sactions[index], actions[index]);
				break; // only managed if onselect callback defined
			}
		default: return false;
		}
		return true;
	};
}

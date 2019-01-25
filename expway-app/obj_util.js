
function CookieManager()
{
	this.cookiemap = {};
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++)
	{
		var c = ca[i];
		while (c.charAt(0) == ' ')
		{
			c = c.substring(1);
		}
		var j = c.indexOf('=');
		if (j>=0)
		{
			var cname = decodeURIComponent(c.substring(0,j).trim());
			var cvalue = decodeURIComponent(c.substring(j+1).trim());
			this.cookiemap[cname] = cvalue;
		}
	}
}

CookieManager.prototype.setCookie = function(cname, cvalue, exdays)
{
	var d = new Date();
	if (!exdays) exdays = cvalue===undefined ? -100 : 366;
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = encodeURIComponent(cname) + "=" + (cvalue===undefined ? '' : encodeURIComponent(cvalue)) + ";" + expires + ";path=/";
	if (cvalue===undefined) delete this.cookiemap[cname];
	else this.cookiemap[cname] = cvalue;
}

CookieManager.prototype.getCookie = function(cname)
{
	return this.cookiemap[cname];
}

var cookies = new CookieManager();

function Emitter()
{
	var eventTarget = document.createDocumentFragment();

	function delegate(method)
	{
		this[method] = eventTarget[method].bind(eventTarget);
	}

	[
		"addEventListener",
		//"dispatchEvent",
		"removeEventListener"
	].forEach(delegate, this);
	this["defDispatchEvent"] = eventTarget["dispatchEvent"].bind(eventTarget);
	this.getOnHandlerName=function(evname)
	{
		return 'on'+evname;
	}
	this.dispatchEvent=function(e)
	{
		this.defDispatchEvent(e);
		var callname = this.getOnHandlerName(e.type.toLowerCase());
		if (typeof(this[callname])=="function")
		{
			try{ this[callname](e); }
			catch(err){ console.error(err); }
		}
		return !e.defaultPrevented;
	}
}

/*

function ClassName()
{
	Emitter.call(this);
}

*/


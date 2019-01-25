
///////////////////////////////////////////////////////////////////////////////
// LANGUAGE SETTINGS
///////////////////////////////////////////////////////////////////////////////

function LanguageList(items)
{
	this.langlist=items||[];
	this.index=0;
}
LanguageList.prototype.declare=function(langcode)
{
	if (this.langlist.indexOf(langcode)<0)
		this.langlist.push(langcode);
}
LanguageList.prototype.size=function()
{
	return this.langlist.length;
}
LanguageList.prototype.setItems=function(items)
{
	this.langlist = items;
	this.index = 0;
}
LanguageList.prototype.getItems=function()
{
	return this.langlist;
}
LanguageList.prototype.getCurrent=function()
{
	return this.langlist[this.index];
}
LanguageList.prototype.next=function()
{
	console.log("LANGLIST [I="+this.index+"/"+this.langlist.length+": %o ] .next()...", this.langlist);
	if (this.langlist.length>0) this.index = (this.index+1) % this.langlist.length;
	console.log("LANGLIST [I="+this.index+"/"+this.langlist.length+": %o ] .next().", this.langlist);
	return this.getCurrent();
}
LanguageList.prototype.select=function(name)
{
	var i = this.langlist.indexOf(name);
	if (i>=0) this.index = i;
	return i>=0;
}
LanguageList.prototype.getItem=function(i)
{
	return this.langlist[i];
}
LanguageList.prototype.find=function(item)
{
	return this.langlist.indexOf(item);
}

function LanguageManager()
{
	// ISO-639-1 language code configured for the user browser or Hindi by default:
	this.lang_user = navigator.language || navigator.userLanguage || "hi";
	// ISO-639-1 language code by default when message not translated:
	this.lang_default = "en";
	// Currently selected language:
	this.lang_current = cookies.getCookie('lang') || this.lang_user;
	this.langs_available=new LanguageList(); // From UI messages
	this.langs_other=new LanguageList();     // From other source (audio tracks/...)
}
LanguageManager.prototype.declare=function(langcode)
{
	this.langs_available.declare(langcode.toLowerCase());
}
LanguageManager.prototype.next=function(with_other)
{
	if (this.langs_other.size()==0) with_other=false;
	console.log("LANG NEXT TO MEDIA: "+with_other);
	var newlang = (with_other ? this.langs_other : this.langs_available).next();
	if (newlang)
	{
		console.log("LANG NEW: "+newlang);
		this.lang_current=newlang;
		cookies.setCookie('lang', this.lang_current);
	}
	return this.lang_current;
}
LanguageManager.prototype.finalInit=function()
{
	this.langs_available.select(this.lang_current);
}
Object.defineProperty(LanguageManager.prototype, "current",
{
	get: function()
	{
		return this.lang_current;
	},
	set: function(langcode)
	{
		this.lang_current = langcode || this.lang_user;
		this.langs_available.select(this.lang_current);
		cookies.setCookie('lang', this.lang_current);
	}
});
Object.defineProperty(LanguageManager.prototype, "defaultlang",
{
	get: function()
	{
		return this.lang_default;
	}
});
Object.defineProperty(LanguageManager.prototype, "user",
{
	get: function()
	{
		return this.lang_user;
	}
});
Object.defineProperty(LanguageManager.prototype, "external",
{
	get: function()
	{
		return this.langs_other.getItems();
	},
	set: function(items)
	{
		return this.langs_other.setItems(items);
	}
});
/*Object.defineProperty(LanguageManager.prototype, "available_list",
{
	get: function()
	{
		return this.langs_available;
	}
});*/

var lang = new LanguageManager();

function MultiLangMessage(ltm)
{
	var lang_to_message = {};

	for (var lc in ltm) {
		if ("default" === lc) {
			lang.declare(lang.lang_default);
			lang_to_message[lang.lang_default.toLowerCase()] = ltm[lc];
		} else {
			lang.declare(lc);
			lang_to_message[lc.toLowerCase()] = ltm[lc];
		}
	}
	this.getMessage=function(lang)
	{
		return lang_to_message[lang.toLowerCase()];
	};
}

MultiLangMessage.prototype.toString = function()
{
    return this.getMessage(lang.current) || this.getMessage(lang.defaultlang);
}

function buildMessages(maps)
{
	//var s = "";
	for(var a in maps)
	{
		//s = s+"var "+a+" = new MultiLangMessage("+JSON.stringify(maps[a])+");\n";
		window[a] = new MultiLangMessage(maps[a]);
	}
	//return s;
}

//eval(buildMessages(messages));
buildMessages(messages);

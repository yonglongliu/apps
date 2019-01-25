
/*
-------------------------------------------------------------------
Utility functions to manage DOM nodes for an HTML page.
-------------------------------------------------------------------
*/

function style_name(name)
{ return name.replace(/([A-Z])/g,"-$1").toLowerCase(); }

function styleName(name)
{
    var name_parts=name.split(/(-[a-z])/g);
    for(var i=0;i<name_parts.length;i++)
        if (name_parts[i].starts('-'))
            name_parts[i] = name_parts[i].substring(1).toUpperCase();
    return name_parts.join('');
}

// Get the class name of an object
function getObjectClassName(obj)
{
    if (obj===undefined) return undefined;
    if (obj===null) return null;
    try{
    if (obj && obj.constructor && obj.constructor.toString)
    {
        var p = obj.constructor.toString().match(/function\s*(\w+)/);
        if (p && p.length == 2) return p[1];
    }}catch(e){}
    var s = obj.toString();
    if (s.substring(0,8)=="[object ") return s.substring(8,s.length-1);
    return typeof(obj);
}

/*
	DOM (Document Object Model) node builder function
	from Javascript data (arrays, maps & string)
	to easily creates nodes.

	@param[in] def    DOM node definition.
		<node>      -> <node>
		"<text>"    -> array of DOM text node and <br/> elements
		[ "<element-name>",
			{ "<attribute-name>": "<attribute-value>", ... },
			<element-content>... ]
		            -> element with attributes
	@return The node created from the definition.
*/
function genDOM(def)
{
    while (getObjectClassName(def)=="Function") def=def();
    if (typeof(def)=="string")
    {
    	// Replace all \n by <br />
    	var res=[];
    	var lines=def.split("\n");
    	for(var i=0;i<lines.length;i++)
    	{
    		if (i>0) res.push(document.createElement("br"));
    		if (lines[i].length>0) res.push(document.createTextNode(lines[i]));
    	}
        return res;
    }
    if (getObjectClassName(def)=="Array")
    {
        var e = document.createElement(def[0]);
        var j = 1;
        if ((def.length>1)&&(getObjectClassName(def[1])=="Object"))
        {
            var attrs = def[1];
            j++;
            for(name in attrs)
            {
                if ((name=="style")&&(typeof(attrs[name])=="object"))
                {
                    var styles = attrs[name];
                    for(nom in styles)
                    {
                        e.style[nom] = styles[nom];
                        var autre = styleName(nom); if (autre!=nom) e.style[autre] = styles[nom];
                        autre = style_name(nom); if (autre!=nom) e.style[autre] = styles[nom];
                    }
                }
                else if ((name.substring(0,2)=="on")&&(typeof(attrs[name])=="function"))
                    e.addEventListener(name.substring(2), attrs[name]);
                else e.setAttribute(name,attrs[name]);
            }
        }
        for(;j<def.length;j++)
        {
            var n = genDOM(def[j]);
            if (getObjectClassName(n)=="Array")
            {
                for(k=0;k<n.length;k++)
                    e.appendChild( n[k] );
            }
            else e.appendChild( n );
        }
        return e;
    }
    else return def;
}

/*
	Syntax:
		node, def, def, ...
*/
function appendDOM(e)
{
    for(var i=1;i<arguments.length;i++)
    {
        var n = genDOM(arguments[i]);
        if (getObjectClassName(n)=="Array")
        {
            for(k=0;k<n.length;k++)
                e.appendChild( n[k] );
        }
        else e.appendChild( n );
    }
}

function setNodeAt(e, pos, node)
{
    if (!e.hasChildNodes() || pos >= e.childNodes.length) e.appendChild(node);
    else e.insertBefore(node, e.childNodes[pos]);
} 

/*
	Syntax:
		node, position, def, def, ...
*/
function setDomAt(e, pos)
{
    for(var i=2;i<arguments.length;i++)
    {
        var n = genDOM(arguments[i]);
        if (getObjectClassName(n)=="Array")
        {
            for(k=0;k<n.length;k++)
                setNodeAt(e, pos++, n[k]);
        }
        else setNodeAt(e, pos++, n);
    }
}

/**
 * Get the attribute value, or the specified default value.
 */
function getAttr(node, name, defvalue)
{
    if (!node.attributes) return defvalue;
    var v=node.attributes.getNamedItem(name);
    return (v&&v.nodeValue.length)?v.nodeValue:defvalue;
}

function removeNode(node)
{
	if (node.parentNode)
		node.parentNode.removeChild(node);
}

function removeFirstSubnode(node)
{
    if (node.hasChildNodes())
        node.removeChild(node.firstChild);
}

function removeAllSubnodes(node)
{
    while (node.hasChildNodes())
        node.removeChild(node.lastChild);
}

function setDOM(e)
{
    removeAllSubnodes(e);
    for(var i=1;i<arguments.length;i++)
    {
        var n = genDOM(arguments[i]);
        if (getObjectClassName(n)=="Array")
        {
            for(k=0;k<n.length;k++)
                e.appendChild( n[k] );
        }
        else e.appendChild( n );
    }
}

////////////////////////////////////////////////////////////////////////////
//PureShare Dashboard Engine AJAX API
//last modify by:jsmreese
//last modify date:2011/11/23
//Description:  Retrieves a list of divs with id dash_metric_xxx and replaces the with the appropriate metric with security

//GlobalVars  (Dashboard Ajax Api)
var daa_showloading=false;
// var daa_loadingtext="<font face=Arial size=1>Loading Metric...</font>";
var daa_polling=50;
var daa_urlitem="";  //append to URL
var daa_cursor="";
var daa_showerror=true;
var daa_returnfunction;
var daa_showmask=true;
var daa_detectlogin=true;
var daa_serialize=true;


//////////////////////////////////////////////////////////////////////////
// Utility functions
//////////////////////////////////////////////////////////////////////////
var util = {

  shouldDebug: false,

  // Note: Will fail in pathological cases (where the members contain
  // strings similar to describe() result).
  membersEqual: function(array1, array2) {
    return util.describe(array1)==util.describe(array2);
  },

  describe: function(obj) {
    if (obj==null) { return null; }
    switch(typeof(obj)) {
      case 'object': {
        var message = "";
        for (key in obj) {
          message += ", [" + key + "]: [" + obj[key] + "]";
        }
        if (message.length > 0) {
          message = message.substring(2); // chomp initial ', '
        }
        return message;
      }
      default: return "" + obj;
    }
  },

  debug: function(message) {
      if (this.shouldDebug) {
        alert("AjaxJS Message:\n\n" + message);
      }
  },

  error: function(message) {
      if (this.shouldDebug) {
        alert("AjaxJS ERROR:\n\n" + message);
      }
  },

  trim: function(str) {
    return str.replace(/(^\s+|\s+$)/g,'');
  },

  strip: function(str) {
    return str.replace(/\s+/, "");
  }

}

function $_() {

    var elements = new Array();

    for (var i = 0; i < arguments.length; i++) {

      var element = arguments[i];

      if (typeof element == 'string') {
        if (document.getElementById) {
          element = document.getElementById(element);
        } else if (document.all) {
          element = document.all[element];
        }
      }

      elements.push(element);

    }

    if (arguments.length == 1 && elements.length > 0) {
      return elements[0];
    } else {
      return elements;
    }
}

function $C(elType) {
  return document.createElement(elType);
}

// From prototype library. Try.these(f1, f2, f3);
var Try = {
  these: function() {
    var returnValue;
    for (var i = 0; i<arguments.length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) {}
    }
    return returnValue;
  }
}

function getElementsByClassName(classname) {
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = document.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

function extractIFrameBody(iFrameEl) {

  var doc = null;
  if (iFrameEl.contentDocument) { // For NS6
    doc = iFrameEl.contentDocument;
  } else if (iFrameEl.contentWindow) { // For IE5.5 and IE6
    doc = iFrameEl.contentWindow.document;
  } else if (iFrameEl.document) { // For IE5
    doc = iFrameEl.document;
  } else {
    alert("Error: could not find sumiFrame document");
    return null;
  }
  return doc.body;

}

///////////////////////////////////////////////////////////////////////////////
// Used for pattern-specific demos.
///////////////////////////////////////////////////////////////////////////////

var DELAY = 1000;
var steps = 0;
function andThen(action) {
  var delayTime = (++steps * DELAY);
  setTimeout(action, delayTime);
}

function log(message) {
  $_("log").innerHTML += message + "<br/>";
}

function createXMLHttpRequest() {
  try { return new ActiveXObject("Msxml2.XMLHTTP");    } catch(e) {}
  try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
  try { return new XMLHttpRequest();                   } catch(e) {}
  alert("XMLHttpRequest not supported");
  return null;
}

//////////////////////////////////////////////////////////////////////////
// Ajax routines (ajaxCaller)
//////////////////////////////////////////////////////////////////////////


var ajaxCaller = {

  shouldDebug: false,
  shouldEscapeVars: false,
  shouldMakeHeaderMap: true,

  calls : new Array(),
  pendingResponseCount : 0,

   /**************************************************************************
      PUBLIC METHODS
   *************************************************************************/

  getXML: function(url, callbackFunction) {
    this.get(url, null, callbackFunction, true, null);
  },

  getPlainText: function(url, callbackFunction) {
    this.get(url, null, callbackFunction, false, null);
  },

  postForPlainText: function(url, vars, callbackFunction) {
    this.postVars(url, vars, null, callbackFunction, false,
                    null, "POST", null, null, null);
  },

  postForXML: function(url, vars, callbackFunction) {
    this.postVars(url, vars, null, callbackFunction, true,
                    null, "POST", null, null, null);
  },

  get: function(url, urlVars, callbackFunction, expectingXML, callingContext) {
    this._callServer(url, urlVars, callbackFunction, expectingXML,
                    callingContext, "GET", null, null, null);
  },

  postVars:
    function(url, bodyVars, optionalURLVars, callbackFunction, expectingXML,
             callingContext) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "POST", bodyVars, null, null);
  },

  postBody:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "POST", null, bodyType, body);
  },

  putBody:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "PUT", null, bodyType, body);
  },

  options:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body) {
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "OPTIONS", null, bodyType, body);
  },

  trace:
    function(url, optionalURLVars, callbackFunction, expectingXML,
             callingContext, bodyType, body) {
      this._debug("trace");
      this._callServer(url, optionalURLVars, callbackFunction, expectingXML,
                      callingContext, "TRACE", null, bodyType, body);
  },

  deleteIt: function(url, urlVars, callbackFunction,
                     expectingXML, callingContext) {
    this._callServer(url, urlVars, callbackFunction, expectingXML,
                    callingContext, "DELETE", null, null, null);
  },

  head: function(url, urlVars, callbackFunction, expectingXML, callingContext)
  {
    this._callServer(url, urlVars, callbackFunction, expectingXML,
                    callingContext, "HEAD", null, null, null);
  },

  /**************************************************************************
     PRIVATE METHODS
  *************************************************************************/

  _callServer: function(url, urlVars, callbackFunction, expectingXML,
                       callingContext, requestMethod, bodyVars,
                       explicitBodyType, explicitBody) {

    if (urlVars==null) {
      urlVars = new Array();
    }

    this._debug("_callServer() called. About to request URL\n"
                + "call key: [" + this.calls.length + "]\n"
                + "url: [" + url + "]\n"
                + "callback function: [" + callbackFunction + "]\n"
                + "treat response as xml?: [" + expectingXML + "]\n"
                + "Request method?: [" + requestMethod + "]\n"
                + "calling context: [" + callingContext + "]\n"
                + "explicit body type: [" + explicitBodyType + "]\n"
                + "explicit body: [" + explicitBody + "]\n"
                + "urlVars: [" + util.describe(urlVars) + "]\n"
                + "bodyVars: [" + util.describe(bodyVars) + "]"
              );


    var xReq = this._createXMLHttpRequest();
    xReq.onreadystatechange = function() {
      ajaxCaller._onResponseStateChange(call);
    }

    var call = {xReq: xReq,
                callbackFunction: callbackFunction,
                expectingXML: expectingXML,
                callingContext: callingContext,
                url: url};

    if (urlVars!=null) {
      var urlVarsString = this._createHTTPVarSpec(urlVars);
      if (urlVarsString.length > 0) { // TODO check if appending with & instead
        url += "?" + urlVarsString;
      }
    }

    xReq.open(requestMethod, url, true);

    if (   requestMethod=="GET"
        || requestMethod=="HEAD"
        || requestMethod=="DELETE") {
      this._debug("Body-less request to URL " + url);
      xReq.send(null);
xReq =null;
      return;
    }

    if (   requestMethod=="POST"
        || requestMethod=="PUT"
        || requestMethod=="OPTIONS"
        || requestMethod=="TRACE") {
      bodyType = null;
      body = null;
      if (explicitBodyType==null) { // It's a form
        bodyType = 'application/x-www-form-urlencoded; charset=' + ddk_ajax_charset;
        body = this._createHTTPVarSpec(bodyVars);
      } else {
        bodyType = explicitBodyType;
        body = explicitBody;
      }
      this._debug("Content-Type: [" + bodyType + "]\nBody: [" + body + "].");
      xReq.setRequestHeader('Content-Type',  bodyType);
      xReq.send(body);
xReq =null;
      return;
    }
xReq =null;
    this._debug("ERROR: Unknown Request Method: " + requestMethod);


  },

  // The callback of xmlHttpRequest is a dynamically-generated function which
  // immediately calls this function.
  _onResponseStateChange: function(call) {

    var xReq = call.xReq;

    if (xReq.readyState < 4) { //Still waiting
      return;
    }

    if (xReq.readyState == 4) { //Transmit to actual callback
      this._debug("Call " + util.describe(call)
                + " with context [" + call.callingContext+"]"
                + " to " + call.url + " has returned.");
      callbackFunction = call.callbackFunction;
      if (!callbackFunction) { // Maybe still loading, e.g. in another JS file
        setTimeout(function() {
          _onResponseStateChange(call);
        }, 100);
      }
      var content = call.expectingXML ? xReq.responseXML : xReq.responseText;
      responseHeaders = xReq.getAllResponseHeaders();
      headersForCaller = this.shouldMakeHeaderMap ?
        this._createHeaderMap(responseHeaders) : responseHeaders;
      callbackFunction(content, headersForCaller, call.callingContext);
	call.xReq=null;
    }
    call.xReq=null;
    call = null; // Technically the responsibility of GC
    this.pendingResponseCount--;

  },

  // Browser-agnostic factory function
  _createXMLHttpRequest: function() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      return new ActiveXObject('Microsoft.XMLHTTP')
    } else {
      _error("Could not create XMLHttpRequest on this browser");
      return null;
    }
  },

  _createHTTPVarSpec: function(vars) {
      var varsString = "";
      for( key in vars ) {
        var value = vars[key];
        if (this.shouldEscapeVars) {
          escapePlusRE =  new RegExp("\\\+");
          value = value.replace(escapePlusRE, "%2B");
        }
        varsString += '&' + key + '=' + value;
      }
      if (varsString.length > 0) {
        varsString = varsString.substring(1); // chomp initial '&'
      }
      this._debug("Built var String: " + varsString)
      return varsString;
   },

  /* Creates associative array from header type to header */
  _createHeaderMap: function(headersText) {
    extractedHeaders = headersText.split("\n");
    delete extractedHeaders[extractedHeaders.length]; // Del blank line at end
    headerMap = new Array();
    for (i=0; i<extractedHeaders.length-2; i++) {
      head = extractedHeaders[i];
      fieldNameEnding = head.indexOf(":");
      field = head.substring(0, fieldNameEnding);
      value = head.substring(fieldNameEnding + 2, head.length);
      value = value.replace(/\s$/, "");
      headerMap[field] = value;
    }
    return headerMap;
  },

  _debug: function(message) {
      if (this.shouldDebug) {
        alert("AjaxJS Message:\n\n" + message);
      }
  },

  _error: function(message) {
      if (this.shouldDebug) {
        alert("AjaxJS ERROR:\n\n" + message);
      }
  }

};

	var req;
	var metricname;
	var metricnum=0;
	var metriclist=new Array();
	var metricid=new Array();
	var rep=0;
	var daaHash = new Hashtable();


	function daaURLGet(){
		daaHashGet();
	}

	function daaURLFlush(prefix) {
        daaHash.removeKeys(prefix);
        daaHashSet();
    }

    function daaGetValue(key) {
        return daaHash.get(key);
    }

	function daaURLUpdate(name, val)
	{
		daaHash.put (name,val)
		daaHashSet();

	}


	function daaHashUpdate(name, val)
	{
		daaHash.put (name,val)

	}

	function daaHashGet(){
		var q=parseQueryString();
		for (var arg in q) {
		  //alert(arg + ': ' + q[arg]);
			daaHashUpdate(arg, q[arg]);
		}


	}

	function daaHashList(){
		var tempstring='';
		daaHash.moveFirst();
		while (daaHash.next()){
			tempstring+= daaHash.getKey() + '=' +daaHash.getValue() +'\n';
		}
		alert ('HASH TABLE CONTENTS\n=====================\n' + tempstring);

	}

	function daaHashSet(){
		daa_urlitem='';
		daaHash.moveFirst();
		while (daaHash.next()){
			if (daa_urlitem.length>0){
				daa_urlitem+='&';
			}
			daa_urlitem+= daaHash.getKey() + '=' + encodeURIComponent (daaHash.getValue());
		}
		//alert (daa_urlitem);
	}

	function run(objID, metricname, callback, options) {	
        if (typeof callback === "function") {
            var _callback;
			if (options && options.requireAsync) {
				_callback = function (data, header, id) {
					DDK.asyncScriptLoad.done(function () {
						hideMask(id);
						$("#"+id).empty().html(data).find('input[placeholder], textarea[placeholder]').placeholder();
						callback(data, header, id);
					});
				};
			} else {
				_callback = function (data, header, id) {
					hideMask(id);
					$("#"+id).empty().html(data).find('input[placeholder], textarea[placeholder]').placeholder();
					callback(data, header, id);
				};			
			}
            load(objID, metricname, _callback, options);
        } else {
            load(objID, metricname, callback, options);
        }
    }

    function load(objID, metricname, callback, options){
		callback = _.wrap(callback || returnContents, function (func, data, header, id) {
			if (data && data.indexOf("AMEngine JScript") > -1) {
				DDK.error("AMEngine Server JavaScript Error: ", id);
			}

			func(data, header, id);
		});
        ProcessURL3(objID, metricname, callback, options);
    }


	function reloadMetricNameInto (objID, metricname){
	     ProcessURL2(objID,0, metricname);
	}

	function reloadMetricInto (objID, metricid){
	    ProcessURL2(objID,metricid);
	}

	function reloadMetricByName(divname){
		metricname=divname;
		ProcessURL (0,metricname);
	}


	function reloadMetric(obj){
		div_id=obj.id;
		metricname=div_id;
		//alert (metricname);
		if (div_id.substr(0,11)=="dash_metric")
		{
			ProcessURL (div_id.substr(12), metricname);
		}
		if (div_id.substr(0,9)=="am_widget")
		{
			ProcessURL (div_id.substr(10), metricname);
		}
	}


	function reloadAll(){
		metricnum=0;
		rep=0;
		window.setTimeout ("drawEachMetric()", daa_polling);
	}

	function GetDash(id, tempname)
	{
		metricname=tempname;
		ProcessURL (id);
	}


	function drawEachMetric(){
		metricname=metriclist[metricnum];
		for (i=0;i<metriclist.length;i++){
		    //alert (metriclist[i]);
		    //alert (metricid[i]);
		    ProcessURL (metricid[i],metriclist[i]);
		}
	}

	function runDash()
	{
		//Find each item dash metric, then build up an array for each item.
		var div_id;
		var x=0;
		var temp=document.getElementsByTagName("DIV");
		for(var i=0;i<temp.length;i++)
		{
			div_id=temp[i].id;
			if (div_id.substr(0,11)=="dash_metric")
				{
					metriclist[x]=div_id;
					metricid[x]=div_id.substr(12);
					x=x+1
					//alert (div_id.substr(12));
				}
			if (div_id.substr(0,9)=="am_widget")
				{
					metriclist[x]=div_id;
					metricid[x]=div_id.substr(10);
					x=x+1
					//alert (div_id.substr(12));
				}
		}
		if (temp.length>0){
			//Must have something in array
			drawEachMetric()
			}
	}

	//Only if we have jquery can I use this function
	if (!(typeof jQuery == 'undefined'))
		    {
	        (function($) {
                $.fn.serializeAnything = function() {
                    var toReturn    = [];
                    var els         = $(this).find(':input').get();
                    $.each(els, function() {
                        if (this.name && !this.disabled && (this.checked || /select|textarea/i.test(this.nodeName) || /text|hidden|password/i.test(this.type))) {
                            var val = $(this).val();
                            toReturn.push( encodeURIComponent(this.name) + "=" + encodeURIComponent( val ) );
                        }
                    });
                    return toReturn.join("&").replace(/%20/g, "+");
                }
            })(jQuery);
    }

	//Called by the load function
	function ProcessURL3(objID, metricname, callback, options)
	{
	    if (daa_showmask) showMask(objID);
	    var url;
		var randomnumber=Math.floor(Math.random()*11111);
		var _callback;

		url="?nobody=true&config.mn=" + metricname
		if ( ddk_ajax_salt ) { url+="&salt=" + randomnumber; }

		if (daa_urlitem) {
			if (options && options.stateFilter) {
				// if there is a stateFilter
				// fitler the global hash to remove state keywords that don't match the filter
				// while we're at it, trim off the `sec.` keywords as well
				url += _.reduce(_.omit(K.toObject(), function (value, key) { return _.string.startsWith(key, "sec.") || (_.string.startsWith(key, "s_") && !_.string.startsWith(key, options.stateFilter)); }), function (memo, value, key) {
					return memo + "&" + key + "=" + encodeURIComponent(value);
				}, "");
			} else {
				url+='&'+ daa_urlitem;
			}
		} else {
			url+='&skintype=Clarity';
			}
		if (daa_serialize)
		    if (!(typeof jQuery == 'undefined'))
		    {
		      var bodyserial=$('body').serializeAnything();
		      if (bodyserial.length>0)
		        url+="&" + bodyserial;
            }


		var q=parseQueryString(url);
		for (var arg in q) {
			if (q[arg]!=undefined){
		            q[arg]=encodeURIComponent(q[arg]);
		            q[arg] = q[arg].replace(/\+/g,"%2B");
		        }
		}

		if (callback){
			ajaxCaller.postVars('amengine.aspx', q, null, callback, false, objID);
		}else{
			ajaxCaller.postVars('amengine.aspx', q, null, returnContents, false, objID);
		}
		if (daa_showloading==true){
		    if (document.getElementById(objID)){
			        eval ("document.getElementById('" + objID + "').innerHTML='" + daa_loadingtext + "'");
			}else{
			     if (daa_showerror){
			         alert ("AJAX API Error: Cannot render loading text into object ID: " + objID + "\nReason: It cannot be found on this page.");
			     }
			}
		}
	}

	function hideMask(objID)
	{
	    if (typeof jQuery == 'undefined') {
            // jQuery is not loaded
        } else {
            var $obj =  $("#" + objID);
            $obj.am('hidemask');
            //if ( $obj.length>0){
            //   $obj.find('#loadingobj').remove();
            //    $obj.css("position", $obj.data("csspos"));
            //   $obj.css("overflow", $obj.data("cssoverflow"));
                //var element =  $("#" + objID).find("#loadingobj").remove();
                //var loadingobj=$(element).find("#loadingobj");
                //alert (element);

           // }
        }
	}

	//Not used
	function getInlineStyle($obj, stylevalue){
           var styletag=$obj.attr('style'), x;
           if (styletag){
               var stylestemp=styletag.split(';');
               var styles={};
               var c='';
               for (x = 0; x < stylestemp.length; x += 1) {
                 c=stylestemp[x].split(':');
                 if ($.trim(c[0]).toLowerCase()==stylevalue)
                 {
                    //alert ("found"+c[1]);
                    return $.trim(c[1]);
                 }
                 styles[$.trim(c[0])]=$.trim(c[1]);
               }
           }
           return "";
      }

	function showMask(objID)
	{
	    if (typeof jQuery == 'undefined') {
            // jQuery is not loaded
        } else {
            var $elem =  $("#" + objID);
            $elem.am('showmask');
        }
	}

	//New updated function
	function ProcessURL2(objID, metricid, metricname){
	    if (daa_showmask) showMask(objID);

	    var url;
		var randomnumber=Math.floor(Math.random()*11111);
		if (metricid==0){
			url="?nobody=true&config.mn=" + metricname
			if ( ddk_ajax_salt ) { url+="&salt=" + randomnumber; }

		}else{
			url="?nobody=true&config.m=" + metricid
			if ( ddk_ajax_salt ) { url+="&salt=" + randomnumber; }
		}
		if (daa_urlitem){
			url+='&'+ daa_urlitem;
			}
		else{
			url+='&skintype=Clarity';
			}

		var q=parseQueryString(url);
		for (var arg in q) {
			if (q[arg]!=undefined){
		            q[arg]=escape(q[arg]);
		            q[arg] = q[arg].replace(/\+/g,"%2B");
		        }
		}

		if (daa_returnfunction){
			ajaxCaller.postVars('amengine.aspx', q, null, daa_returnfunction, false, objID);
		}else{
			ajaxCaller.postVars('amengine.aspx', q, null, returnContents, false, objID);
		}
		if (daa_showloading==true){
		    if (document.getElementById(objID)){
			        eval ("document.getElementById('" + objID + "').innerHTML='" + daa_loadingtext + "'");
			}else{
			     if (daa_showerror){
			         alert ("AJAX API Error: Cannot render loading text into object ID: " + objID + "\nReason: It cannot be found on this page.");
			     }
			}
		}
	}

	//Generic delay function so we dont search every single keypress
    var delay = (function(){
	    var timer = 0;
	    return function(callback, ms){
		    clearTimeout (timer);
		    timer = setTimeout(callback, ms);
	    };
    })();


	//Old function used for backwards compatability
	function ProcessURL(id,dashmetric)	{
	    if (daa_showmask) showMask(dashmetric);
		var url;
		var randomnumber=Math.floor(Math.random()*11111);
		if (id==0){
			//url="amengine.aspx?nobody=true&config.mn=" + dashmetric
			url="?nobody=true&config.mn=" + dashmetric
			if ( ddk_ajax_salt ) { url+="&salt=" + randomnumber; }
		}else{
			url="?nobody=true&config.m=" + id
			if ( ddk_ajax_salt ) { url+="&salt=" + randomnumber; }
		}

		if (daa_urlitem){
			url+='&'+ daa_urlitem;
			}
		else{
			var tst='&skintype=Clarity';
			if (tst.length>0){
				url+='&skintype=Clarity';
				}
			}
		var q=parseQueryString(url);

		for (var arg in q) {
			if (q[arg]!=undefined){
		            q[arg]=escape(q[arg]);
		            q[arg] = q[arg].replace(/\+/g,"%2B");
		        }
		}


		if (daa_returnfunction){
			ajaxCaller.postVars('amengine.aspx', q, null, daa_returnfunction, false, dashmetric);
		}else{
			ajaxCaller.postVars('amengine.aspx', q, null, returnContents, false, dashmetric);
		};
    	    	//Old GET function
	    	//ajaxCaller.get(url, null, returnContents, false, dashmetric);

		if (daa_showloading==true){
		        if (document.getElementById(dashmetric)){
			        eval ("document.getElementById('" + dashmetric + "').innerHTML='" + daa_loadingtext + "'");
			    }else{
			        if (daa_showerror){
			            alert ("AJAX API Error: Cannot render loading text into object ID: " + dashmetric + "\nReason: It cannot be found on this page.");
			        }
			    }
		}

	}

	//Gets the current query string
	function getQueryString()
    {
        var str = location.search;
        var query = str.charAt(0) == '?' ? str.substring(1) : str;
        return query;
    }

    function getError(data)
    {
        if (typeof jQuery == 'undefined') {
            alert ("Cannot get error message - jQuery not loaded");
        } else {
            if (data.indexOf("AMEngine Error") > 0){
                return $(".ui-state-error", data).text();
            }else if (data.toUpperCase().indexOf("SERVER ERROR IN '/AMENGINE' APPLICATION.") >0) {
                //alert (data);
                //alert (jQuery(data).filter("span").text());
                return (jQuery(data).filter("span").text());
            }
        }
    }

    function getErrorHtml(data)
    {
        if (typeof jQuery == 'undefined') {
            alert ("Cannot get error message - jQuery not loaded");
        } else {
            if (data.indexOf("AMEngine Error") > 0){
                return $(".ui-state-error", data).html();
            }else if (data.toUpperCase().indexOf("SERVER ERROR IN '/AMENGINE' APPLICATION.") >0) {
                return (jQuery(data).filter("span").html());
            }

        }
    }

    function isError(data)
    {
        if (data.indexOf("AMEngine Error") > 0){
            return true;
        }
        else if (data.toUpperCase().indexOf("SERVER ERROR IN '/AMENGINE' APPLICATION.") >0) {
            return true;
        }
        else return false;
    }

    //Checks to see if login page is returned in data
    function isLoginPage(data)
    {
        return (data.indexOf("AMEngine Login") > 0)
    }

    //Actually redirects if a login page is found in the data
    function checkLoginPage(data)
    {
        if (isLoginPage(data))
                location.href='login.aspx?redirect=' + encodeURIComponent(getQueryString());
    }




function returnContents (xml, headers, metname ) {
      if (typeof jQuery == 'undefined') {
            // jQuery is not loaded
      } else {
            var $elem = $("#"+metname);
            $elem.css("position", $elem.data("csspos"));
            $elem.css("overflow", $elem.data("cssoverflow"));
            //if ( $("#" + metname)){
                //$("#" + metname).css({ opacity: 1 });
                //var loadobj = '<div id="Div1" style="width:100%;height:100%" /><img src="' + window.location.origin + '/amengine/imgs/Icons/wait.gif" /></div>';
                //$("#"+objID).append(loadobj);
            //}
			$elem.find('input[placeholder], textarea[placeholder]').placeholder();
      }
      if (daa_detectlogin)
        checkLoginPage(xml);

      var m_html=xml;
      //m_html=m_html.replace (/imgs/g, "/amengine/imgs");
      if (document.getElementById(metname)){
        eval ("document.getElementById('" + metname + "').innerHTML=m_html");
      }else{
        if (daa_showerror){
            alert ("AJAX API Error: Cannot render widget into object ID: " + metname + "\nReason: It cannot be found on this page.");
        }
      }
      if (daa_cursor)
	{document.body.style.cursor=daa_cursor;}
   }


function processReqChange2(id) {
	// only if req shows "loaded"
	if (req.readyState == 4) {
		// only if "OK"
		if (req.status == 200) {
			//Since our images are going to come back relative to activemetrics, we have to find all image paths and change them
			//to the application path so we can call this api from other locations
			var m_html=req.responseText;
			//m_html=m_html.replace (/imgs/g, "/amengine/imgs");
			eval ("document.getElementById('" + metricname + "').innerHTML=m_html");
			metricnum=metricnum+1;

		} else {
			alert("There was a problem retrieving the XML data:\n" +
				req.statusText);
		}
	}
	else if (req.readyState==1){

		if (daa_showloading==true){
			eval ("document.getElementById('" + metricname + "').innerHTML='" + daa_loadingtext + "'");
		}
	}
}

//JQUERY PLUGIN
//version 1.0
if (jQuery){
    (function($){
      var defaults = {
            "datatype": 'html',
            "global": true,
            "showmask": true,
            "autodata": true
      };
      var methods = {
            init : function(options, callback ) {
                this.each(function() {
                    if (options) {
                        $.extend( defaults, options );
                    }
                });
                //attach events
                //methods.showmask.apply(this);    // <- called outside the each loop
                //methods.hidemask.apply(this);    // <- called outside the each loop
                //methods.load.apply(this);    // <- called outside the each loop
                return this;
            },
            load : function(options) {
               //this.options = options = $.extend(true, defaults, options);
               //this.options = $.extend(true, defaults, options || {});
               var arrlength = (this.length-1);
               return this.each(function(i){
                 this.options = $.extend(true, {}, defaults, options || {});
                 var widgetname=$(this).data('widgetname');
                 var beforesuccessmethod = methods._beforesuccess;
                 var successmethod=methods._success;
                 var aftersuccessmethod=methods._aftersuccess;
                 var lastsuccessmethod=methods._lastsuccess;
                 var errormethod= methods.error;
                 var postdata;
                 var islast=false;
                 //Proper object
                 //console.log(this.options);
                 //Passed in
                 //console.log(options);

                 //MASKING for HTML only
                 if ((this.options.showmask) && (this.options.datatype=='html'))
                    methods._showmask($(this));
                 if (options)
                 {
                    //WIDGET NAME/ARRAY
                    if (options.widget)
                    {
                        if ($.isArray(options.widget))
                            widgetname=options.widget[i];
                        else
                            widgetname=options.widget;
                    }

                    postdata=methods._serializeform(widgetname);

                    if (options.datascope)
                       postdata = methods._serializeform(widgetname,this.options.datascope);


                    //DATA OPTIONS
                    if (options.data)
                        postdata=options.data;




                    //BEFORE SUCCESS HANDLER
                    if (options.beforesuccess)
                        beforesuccessmethod = options.beforesuccess;

                    //SUCCESS HANDLER
                    if (options.success)
                        successmethod=options.success;

                    //AFTER SUCCESS HANDLER (Redundant)
                    if (options.aftersuccess)
                       aftersuccessmethod = options.aftersuccess;

                    //LAST SUCCESS
                    if (options.lastsuccess)
                    {
                        lastsuccessmethod=options.lastsuccess;
                        if (arrlength==i)
                            islast=true;
                        else
                            islast=false;
                    }

                    //ERROR METHOD
                    if (options.errormethod)
                        errormethod = options.errormethod;



                 }else{
                    postdata = methods._serializeform(widgetname);
                 }
                 //Add data to current widget for next time
                 if (this.options.autodata) $(this).data('widgetname', widgetname);

                 if (!(widgetname)) alert ("jQuery AM Plugin Error: Unable to determine the widget name to load.");
                 $.ajax({
                    type: 'POST',
                    //context:{widgetname:widgetname, divid:$(this).attr("id"), obj:this},
                    context:this,
                    //url: 'amengine.aspx?config.mn=' + widgetname,
                    url: 'amengine.aspx',
                    data: postdata,

                    success: function(data){
                        if (this.options.datatype=='html')
                            beforesuccessmethod($(this), data);
                        successmethod(data);
                        aftersuccessmethod(data);
                        if (islast) lastsuccessmethod(data);
                    },
                    complete: methods.complete,
                    error: errormethod,
                    dataType: this.options.datatype
                 });


               });

            },
            keywordflush:function(prefix){
                if (prefix)
                    daaURLFlush(prefix);
                else
                    daaURLFlush("");
                return this;
            },
            keyword: function(options){
                //alert (daaHash.get(options.key));
                if (!(options.val))
                    return daaHash.get(options.key);
                daaURLUpdate(options.key,options.val);
                return this;
            },
            loadjson : function(options) {
                alert ("Not Implemented");
                //options.datatype='json';
                //return this.methods.load(options);
            },
             _lastsuccess: function(){
                //run on last success - default to nothing
            },
            _beforesuccess: function($obj,fulldata){
                $obj.am('hidemask');
                checkLoginPage(fulldata);
                if (isError(fulldata))
                {
                    methods.errordialog({
                        title: "AMEngine Error",
                        showicon: false,
                        message:getErrorHtml(fulldata)
                    });
                    return;
                }
                $obj.empty().html(fulldata);
            },
            _success: function(data){
                //alert ("Success");
                //Is this a login page?
                //$(this).am('hidemask');
                //checkLoginPage(data);
                //$(this).empty().html(data);
                //methods.complete(data);
            },
            _aftersuccess: function (data)
            {
                //alert ("Complete called");
                //Do nothing..
            },
            error: function(xhr, status, errortext)
            {
                var messagetext;
                if(status=='parsererror')
			        messagetext = 'Error parsing JSON Request failed:\n' + xhr.responseText;
			    else
			        messagetext = xhr.responseText;
                methods.errordialog({
                    title: "AMEngine Page Error: " + status,
                    showicon:false,
                    message:messagetext
                });
            },
            message: function(options)
            {
                var title="Message";
                var icon="ui-icon-info";
                if (options.title) title = options.title;
                if (options.icon) icon = options.icon;
                var newDiv = $(document.createElement('div'));
                if (options.showicon)
                    $(newDiv).html('<span style="float:left;margin-right:0.5em;" class="ui-icon ' + icon + '"></span> ' + options.message);
                else
                    $(newDiv).html(options.message);

                $(newDiv).dialog({
                    resizable: false,
                    modal: true,
                    width:'45%',
                    height:300,
                    title: title,
                    buttons: {
                        Ok: function() {
                            $(this).dialog('close');
                            $(newDiv).remove();
                            return;
                        }
                    }
                });
                return this;
            },
            errordialog: function(options)
            {
                var title="Error";
                var icon="ui-icon-alert";
                if (options.title) title = options.title;
                if (options.icon) icon = options.icon;
                var newDiv = $(document.createElement('div'));
                if (options.showicon)
                    $(newDiv).html('<span style="float:left;margin-right:0.5em;" class="ui-icon ' + icon + '"></span> ' + options.message);
                else
                    $(newDiv).html(options.message);

                $(newDiv).dialog({
                    resizable: false,
                    modal: true,
                    width:'90%',
                    height:400,
                    title: title,
                    buttons: {
                        Ok: function() {
                            $(this).dialog('close');
                            $(newDiv).remove();
                            return;
                        }
                    }
                });
                return this;
            },
            confirm: function(options) {
                //utility function
                var title="Question";
                var icon="ui-icon-alert";
                if (options.title) title = options.title;
                if (options.icon) icon = options.icon;
                var newDiv = $(document.createElement('div'));
                $(newDiv).html('<span style="float:left;margin-right:0.5em;" class="ui-icon ' + icon + '"></span> ' + options.message);
                $(newDiv).dialog({
                    resizable: false,
                    modal: true,
                    title: title,
                    buttons: {
                        Ok: function() {
                            options.action();
                            $(this).dialog('close');
                            $(newDiv).remove();
                            return;
                        },
                        Cancel: function() {
                            $(this).dialog('close');
                            $(newDiv).remove();
                        }
                    }
                });
                return this;
            },
            hidemask: function (){
                return this.each(function(i){
                    var $elem=$(this);
                    $elem.find('#loadingobj').remove();
                    $elem.css("position", $elem.data("csspos"));
                    $elem.css("overflow", $elem.data("cssoverflow"));
                });
            },
            showmask: function (){
               return this.each(function(i){
                    methods._showmask($(this));
                });
           },
           _showmask:function($elem){

                //Cache inline styles
                $elem.data("csspos",  methods._getInlineStyle($elem, 'position'));
                $elem.data("cssoverflow", methods._getInlineStyle($elem, 'overflow'));
                //alert ($elem.data("csspos"));
                if ( $elem.length>0){
                    if($elem.css("position") == "static") {
        	            $elem.css( 'position','relative');
        	            $elem.css( 'overflow','hidden');
        	            //Should be !IMPORTANT
                    }
                    var loadobj = $('<div id="loadingobj" style="z-index:100;position: absolute;top:0;left:0;-moz-opacity: 0.5; opacity: .50; filter: alpha(opacity=50); background-color: #efefef; width: 100%;height: 100%;zoom: 1;background-image:url(' + (oldIE ? fullPath : "") + 'resources/ddk/imgs/spinner_32x32.gif);background-repeat:no-repeat;background-position:center;"></div>');
                    if(navigator.userAgent.toLowerCase().indexOf("msie") > -1){

        	            loadobj.height($elem.height() + parseInt($elem.css("padding-top")) + parseInt($elem.css("padding-bottom")));
	                    loadobj.width($elem.width() + parseInt($elem.css("padding-left")) + parseInt($elem.css("padding-right")));
                    }
                    $elem.append(loadobj);
                }

           },
          _getInlineStyle:function($obj, stylevalue){
               var styletag=$obj.attr('style'), x;
               if (styletag){
                   var stylestemp=styletag.split(';');
                   var styles={};
                   var c='';
                   for (x = 0; x < stylestemp.length; x += 1) {
                     c=stylestemp[x].split(':');
                     if ($.trim(c[0]).toLowerCase()==stylevalue)
                     {
                        //alert ("found"+c[1]);
                        return $.trim(c[1]);
                     }
                     styles[$.trim(c[0])]=$.trim(c[1]);
                   }
               }
               return "";

          },
          _serializeform: function(metricname,scope) {
		        var url="?nobody=true&config.mn=" + metricname;
		        if (daa_urlitem){
			        url+='&'+ daa_urlitem;
			    }
			    if (scope)
			        var bodyserial=$(scope).serialize();
			    else
		            var bodyserial=$('body').serializeAnything();

		        //alert (bodyserial);
                if (bodyserial.length>0)
		                url+="&" + bodyserial;

		        var q=parseQueryString(url);
		        for (var arg in q) {
			        if (q[arg]!=undefined){
		                    q[arg]=encodeURIComponent(q[arg]);
		                    q[arg] = q[arg].replace(/\+/g,"%2B");
		                }
		        }
		        return q;

          }

      }; //Methods

      //Making it global an also within jQuery namespace
      $.am = $.fn.am = function( method ) {
        if (!(this instanceof $)) {
            return $.fn.am.apply($('<div>'), arguments);
        }
        //$.fn.am = function( method ) {
        // Method calling logic
        if ( methods[method] ) {
          return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
          return methods.init.apply( this, arguments );
        } else {
          $.error( 'Method ' +  method + ' does not exist on jQuery.amengine' );
        }
      };
    })(jQuery);
}


/*******************************************************************************************
 * Object: Hashtable
 * Description: Implementation of hashtable
 * Author: Uzi Refaeli
 *******************************************************************************************/

//======================================= Properties ========================================
Hashtable.prototype.hash	 	= null;
Hashtable.prototype.keys		= null;
Hashtable.prototype.location	= null;

/**
 * Hashtable - Constructor
 * Create a new Hashtable object.
 */
function Hashtable(){
	this.hash = new Array();
	this.keys = new Array();

	this.location = 0;
}

/**
 * put
 * Add new key
 * param: key - String, key name
 * param: value - Object, the object to insert
 */
Hashtable.prototype.put = function (key, value){
	if (value == null)
		return;

    key=key.toLowerCase();
	if (this.hash[key] == null)
		this.keys[this.keys.length] = key;


	this.hash[key] = value;
}

/**
 * get
 * Return an element
 * param: key - String, key name
 * Return: object - The requested object
 */
Hashtable.prototype.get = function (key){
		return this.hash[key.toLowerCase()];
}

//Requested by John - AMENGINE-146
//modified 2012-01-29 by jsmreese to optionally accept an array of prefixes
Hashtable.prototype.removeKeys = function(prefix) {
    var i = this.keys.length - 1;
    while (i + 1) {
		var match = false;
		if ($.isArray(prefix)) {
			var j = prefix.length - 1;
			while (!match && j + 1) {
				match = match || this.keys[i].indexOf(prefix[j]) === 0
				j--;
			}
		} else {
			match = this.keys[i].indexOf(prefix) === 0;
		}

        // does the key match the prefix?
        if (match) {
            // remove the key from the hash
            this.hash[this.keys[i]] = null;

            // and remove it from the key array
            this.keys.splice(i ,1);
        }
        i--;
    }
}

// Added for DDK AJAX API to support K function
// by: jsmreese
// date: 2011-12-16
Hashtable.prototype.toURL = function(prefix) {
    var i = this.keys.length - 1,
		url = "";
	;

    while (i + 1) {
		var match = false;
		if ($.isArray(prefix)) {
			var j = prefix.length - 1;
			while (!match && j + 1) {
				match = match || this.keys[i].indexOf(prefix[j]) === 0
				j--;
			}
		} else {
			match = this.keys[i].indexOf(prefix) === 0;
		}

        // does the key match the prefix?
        if (match) {
            // add the key and value to the url string
			url += "&" + this.keys[i] + "=" + encodeURIComponent(this.hash[this.keys[i]]);
        }

        i--;
    }

	return url;
}

// Added for DDK AJAX API to support K function
// by: jsmreese
// date: 2011-12-16
Hashtable.prototype.toObject = function(prefix) {
    var i = this.keys.length - 1,
		obj = {};
	;

    while (i + 1) {
		var match = false;
		if ($.isArray(prefix)) {
			var j = prefix.length - 1;
			while (!match && j + 1) {
				match = match || this.keys[i].indexOf(prefix[j]) === 0
				j--;
			}
		} else {
			match = this.keys[i].indexOf(prefix) === 0;
		}

        // does the key match the prefix?
        if (match) {
            // add the key and value to obj as a new parameter
			obj[this.keys[i]] = this.hash[this.keys[i]];
        }

        i--;
    }

	return obj;
}


/**
 * remove
 * Remove an element
 * param: key - String, key name
 */
Hashtable.prototype.remove = function (key){
    key=key.toLowerCase();
	for (var i = 0; i < this.keys.length; i++){
		//did we found our key?
		if (key == this.keys[i]){
			//remove it from the hash
			this.hash[this.keys[i]] = null;
			//and throw away the key...
			this.keys.splice(i ,1);
			return;
		}
	}
}

/**
 * size
 * Return: Number of elements in the hashtable
 */
Hashtable.prototype.size = function (){
    return this.keys.length;
}

/**
 * populateItems
 * Deprecated
 */
Hashtable.prototype.populateItems = function (){}

/**
 * next
 * Return: true if theres more items
 */
Hashtable.prototype.next = function (){
	if (++this.location < this.keys.length)
		return true;
	else
		return false;
}

/**
 * moveFirst
 * Move to the first item.
 */
Hashtable.prototype.moveFirst = function (){
	try {
		this.location = -1;
	} catch(e) {/*//do nothing here :-)*/}
}

/**
 * moveLast
 * Move to the last item.
 */
Hashtable.prototype.moveLast = function (){
	try {
		this.location = this.keys.length - 1;
	} catch(e) {/*//do nothing here :-)*/}
}

/**
 * getKey
 * Return: The value of item in the hash
 */
Hashtable.prototype.getKey = function (){
	try {
		return this.keys[this.location];
	} catch(e) {
		return null;
	}
}

/**
 * getValue
 * Return: The value of item in the hash
 */
Hashtable.prototype.getValue = function (){
	try {
		return this.hash[this.keys[this.location]];
	} catch(e) {
		return null;
	}
}

/**
 * getKey
 * Return: The first key contains the given value, or null if not found
 */
Hashtable.prototype.getKeyOfValue = function (value){
	for (var i = 0; i < this.keys.length; i++)
		if (this.hash[this.keys[i]] == value)
			return this.keys[i]
	return null;
}


/**
 * toString
 * Returns a string representation of this Hashtable object in the form of a set of entries,
 * enclosed in braces and separated by the ASCII characters ", " (comma and space).
 * Each entry is rendered as the key, an equals sign =, and the associated element,
 * where the toString method is used to convert the key and element to strings.
 * Return: a string representation of this hashtable.
 */
Hashtable.prototype.toString = function (){

	try {
		var s = new Array(this.keys.length);
		s[s.length] = "{";

		for (var i = 0; i < this.keys.length; i++){
			s[s.length] = this.keys[i];
			s[s.length] = "=";
			var v = this.hash[this.keys[i]];
			if (v)
				s[s.length] = v.toString();
			else
				s[s.length] = "null";

			if (i != this.keys.length-1)
				s[s.length] = ", ";
		}
	} catch(e) {
		//do nothing here :-)
	}finally{
		s[s.length] = "}";
	}

	return s.join("");
}

/**
 * add
 * Concatanates hashtable to another hashtable.
 */
Hashtable.prototype.add = function(ht){
	try {
		ht.moveFirst();
		while(ht.next()){
			var key = ht.getKey();
			//put the new value in both cases (exists or not).
			this.hash[key] = ht.getValue();
			//but if it is a new key also increase the key set
			if (this.get(key) != null){
				this.keys[this.keys.length] = key;
			}
		}
	} catch(e) {
		//do nothing here :-)
	} finally {
		return this;
	}
};


function URLEncode (clearString) {
  var output = '';
  var x = 0;
  clearString = clearString.toString();
  var regex = /(^[a-zA-Z0-9_.]*)/;
  while (x < clearString.length) {
    var match = regex.exec(clearString.substr(x));
    if (match != null && match.length > 1 && match[1] != '') {
    	output += match[1];
      x += match[1].length;
    } else {
      if (clearString[x] == ' ')
        output += '+';
      else {
        var charCode = clearString.charCodeAt(x);
        var hexVal = charCode.toString(16);
        output += '%' + ( hexVal.length < 2 ? '0' : '' ) + hexVal.toUpperCase();
      }
      x++;
    }
  }
  return output;
}

function URLDecode (encodedString) {
  var output = encodedString;
  var binVal, thisString;
  var myregexp = /(%[^%]{2})/;
  while ((match = myregexp.exec(output)) != null
             && match.length > 1
             && match[1] != '') {
    binVal = parseInt(match[1].substr(1),16);
    thisString = String.fromCharCode(binVal);
    output = output.replace(match[1], thisString);
  }
  return output;
}


function getQueryString()
{
    var str = location.search;
    var query = str.charAt(0) == '?' ? str.substring(1) : str;
    return query;
}

function parseQueryString(str) {
    try{
        str = str ? str : location.search;
        var query = str.charAt(0) == '?' ? str.substring(1) : str;
        var args = new Object();
        if (query) {
            var fields = query.split('&');
            for (var f = 0; f < fields.length; f++) {
                var field = fields[f].split('=');
                if (field.length!=2) continue;
                args[field[0]]=decodeURIComponent(field[1].replace(/\+/g, " "));
                //args[unescape(field[0].replace(/\+/g, ' '))] = unescape(field[1].replace(/\+/g, ' '));
            }
        }
    return args;
    }catch(err)
    {
        if (err.description)
            alert ("Error: AJAX Api cannot parse querystring (" + err.description + "): " + str);
        else
            alert ("Error: AJAX Api cannot parse querystring (" + err + "): " + str);
        return args;
    }
}
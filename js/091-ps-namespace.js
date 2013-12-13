// setup PureShare PS namespace
var PS = {};

// setup PS.extend()
extend.myNamespace(PS);
extend.noConflict();

// setup template cache
PS.templateCache = {};


// PS.AM
PS.extend("AM");

// setup sync object
PS.AM.sync = function (postaction, postdata, prefix, successhandler, errorhandler) {
	if (DEBUG) DDK.log("    PS.AM.sync(" +postaction + "," + prefix +")" );
	//postdata==(postdata || {});	
	var phost = {			
		"p_salt": Math.floor(Math.random() * 10000),
		"tablePrefix": prefix
	};
	var pdata = $.extend(true, postdata, phost)
	console.info("POST DATA:", pdata);
	//		$("body").trigger("transferStart");							
	var obj = jQuery.ajax({
		type: "POST",
		url: 'amengine.aspx?config.mn=' + postaction ,
		dataType: "json",
		data:  pdata,
		success: function(results){	
			if (successhandler)	successhandler(results);										
		//				$("body").trigger("transferEnd");
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			if (DEBUG) DDK.log("    ***HTTP Request Dump*** ");
			if (DEBUG) DDK.log(XMLHttpRequest);		
			//				document.write (XMLHttpRequest.responseText);
			if (errorhandler) errorhandler(XMLHttpRequest);	
			//				$("body").trigger("appException", XMLHttpRequest);
			//				$("body").trigger("transferEnd");					
		}//error
	}); //ajax
	return obj;
}




/////////////////////////////////////////////////////////////////////////////
// PS FilterSettings Constructor
//
// The settings argument may be a string, an array of strings, or an object.
//
// settings is treated as the prefix if it is a string or an array of strings
// settings may be an object with these parameters:
// - id: string or array. Specific option id or ids to clear.
// - prefix: string or array. Specific option id prefix or prefixes to clear.
// - regex: regex. Specific test regex. Will clear on match.
// - except: string or array. Specific option id or ids not to clear.
// - exceptPrefix: string or array. Specific option id prefix or prefixes not to clear.
// - exceptRegex: regex. Specific test regex. Will not clear on match.
// - includeEmpty: boolean. Default `false`. Set to `true` to include empty (value = "") options.
//
// Positive rules act as filters. If no positive rules are defined, ALL options will be matched
// before negative rules are applied.
//
// Negative (except) rules are applied after positive rules.
// For example, if an option id is matched by `id` and also by `except` it will not be processed.

PS.FilterSettings = function (settings) {
	settings = settings || {};
	
	this.includeEmpty = settings.includeEmpty || false;
	
	this.id = (settings.id ? [].concat(settings.id) : []);
	
	this.prefix = (settings.prefix ? [].concat(settings.prefix) : ((_.isArray(settings) || typeof settings === "string") ? [].concat(settings) : []));
	this.except = (settings.except ? [].concat(settings.except) : []);
	this.exceptPrefix = (settings.exceptPrefix ? [].concat(settings.exceptPrefix) : []);
	
	this.hasIncludeFilters = !!(this.id.length || this.prefix.length);
	this.hasExcludeFilters = !!(this.except.length || this.exceptPrefix.length);
};

PS.FilterSettings.prototype.test = function (option) {
	var optionId = option.id,
		optionValue = option.get("value"),
		
		// default match state is true, unless include filters are set
		match = !this.hasIncludeFilters;
	
	// check includeEmpty and value
	if (optionValue === "" && !this.includeEmpty) { return false; }
	
	// check include filters
	if (this.hasIncludeFilters) {
	
		// check id
		if (_.indexOf(this.id, optionId) > -1) { match = true; }
		
		// if still no match, check prefix (stop when a match is found)
		!match && _.each(this.prefix, function (prefix) {
			if (_.string.startsWith(optionId, prefix)) { match = true; return false; }
		});
		
		// if still no match, exit
		if (!match) { return false; }	
	}
	
	// check exclude filters
	if (this.hasExcludeFilters) {
		
		// check except
		if (_.indexOf(this.except, optionId) > -1) { match = false; }		

		// if still a match, check exceptPrefix (stop when a match is found)
		match && _.each(this.exceptPrefix, function (exceptPrefix) {
			if (_.string.startsWith(optionId, exceptPrefix)) { match = false; return false; }
		});
		
		// if still no match, exit
		if (!match) { return false; }
	}
	
	// if we got this far, must be a match!
	return true;
};

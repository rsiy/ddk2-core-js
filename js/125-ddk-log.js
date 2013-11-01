/*
 * DDK.log()
 * DDK.info()
 * DDK.warn()
 * DDK.error()
 *
 * Creates DDK versions of standard console methods for logging information to the client console.
 * Will log an arbitrary number of arguments, just like console.log().
 * Always outputs logs for DDK.error, DDK.warn, and DDK.info.
 * Will output logs from DDK.log only when DDK_LOG is true (usually set via URL query string parameter &ddk.log=true).
 * Will not throw an error when console is undefined (IE 8 and 9 when Developer Tools is not open).
 * Will JSON.stringify objects in older console implementations (and recent IE) to avoid logging "[object Object]".
 */
 
 /*
_.each(["error", "warn", "info", "log"], function(method, methodIndex) {
	var func = window.console && window.console[method];
	
	// if DDK.DEBUG is true, and console and console[method] are defined, pass arguments to the method
	// DDK.error() will always log unless console.error is undefined
	if (func && (DDK.DEBUG || !methodIndex)) {
		if (func.apply && !(oldIE  || recentIE)) {
			// if console[method].apply is defined, use it (console methods require the context of console)
			DDK[method] = function () {
				func.apply(console, arguments);
			};
			return;
		}
		
		// if console[method].apply is undefined, call the method using a single string as argument
		// _.map() works properly across JavaScript versions on array-like objects such as arguments
		// you cannot call join() directly on the arguments object in all JavaScript versions because it is not a true array
		DDK[method] = function () {
			func(_.map(arguments, function(arg) {
				// JSON.stringify all objects to avoid logging "[object Object]"
				return (_.isObject(arg) ? JSON.stringify(arg) : arg);
			}).join(", "));
		};
		return;
	}
	
	DDK[method] = $.noop();
});
*/

_.each(["log", "error", "warn", "info"], function(method, methodIndex) {
	DDK[method] = function() {
		var func = window.console && window.console[method];

		// DDK.error, DDK.warn, and DDK.info will always log unless console is not available
		// if DDK_LOG is true, DDK.log will log
		if (func && (DDK_LOG || methodIndex)) {
			if (func.apply) {
				// if console[method].apply is defined, use it (console methods require the context of console)
				func.apply(console, arguments);
			} else {
				// if console[method].apply is undefined, call the method using a single string as argument
				// _.map() works properly across JavaScript versions on array-like objects such as arguments
				// you cannot call join() directly on the arguments object in all JavaScript versions because it is not a true array
				func(_.map(arguments, function(arg) {
					// JSON.stringify all objects to avoid logging "[object Object]"
					return (_.isObject(arg) ? JSON.stringify(arg) : arg);
				}).join(", "));
			}
		}
	}
});

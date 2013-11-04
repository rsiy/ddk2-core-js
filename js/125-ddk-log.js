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
 * Will not throw an error when console is undefined (IE when Developer Tools is not open).
 * Will JSON.stringify objects in older console implementations (and recent IE) to avoid logging "[object Object]".
 */

_.each(["log", "error", "warn", "info"], function (method, methodIndex) {
	var nativeMethod = window.console && window.console[method];

	// DDK.error, DDK.warn, and DDK.info will always log unless console is not available
	// if DDK_LOG is true, DDK.log will log
	if (nativeMethod && (DDK_LOG || methodIndex)) {
		if (nativeMethod.apply && !oldIE && !recentIE) {
			// if console[method].apply is defined, use it (console methods require the context of console)
			DDK[method] = function () { nativeMethod.apply(console, arguments); };
			return;
		}
		
		// if console[method].apply is undefined, call the method directly using a single string as argument
		// _.map() works properly across JavaScript versions on array-like objects such as arguments
		// you cannot call join() directly on the arguments object in all JavaScript versions because it is not a true array
		DDK[method] = function () {
			window.console[method](_.map(arguments, function (arg) {
				// JSON.stringify all objects to avoid logging "[object Object]"
				return (_.isObject(arg) ? JSON.stringify(arg) : arg);
			}).join(", "));
		};
		return;
	}
	
	// if native window.console method is not defined, do nothing
	DDK[method] = function () {};
});

/*
// old method
// logic to log or not is executed with each log call
// new method above executes logging logic only once on function creation
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
*/
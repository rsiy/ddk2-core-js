	/*
	 * K Global Object
	 *
	 *
	 */
(function(window, undefined) {
	// Use the correct document accordingly with window argument (sandbox)
	var document = window.document,
		navigator = window.navigator,
		location = window.location,
		$ = window.jQuery;
		
	function evalKeywordValue(value, evaledKeys) {
		var potentialKeys, 
			matchedKey, 
			regexValidKey = /^[a-z_][a-z0-9_\.]*$/;
		
		// if value is not a string, throw exception
		value = value.toString();
		if (typeof value !== "string") { throw "K.eval error: keyword value does not coerce to a string"; }

		// if evaledKeys is not an array, create an empty array
		if (!_.isArray(evaledKeys)) { evaledKeys = []; }
		
		// if value is an empty string, stop
		if (value === "") { return value; }
		
		// split the value on the tilde character
		potentialKeys = value.split(DDK.char.tilde);
		
		// if the potentialKeys array length is less than or equal to 2, stop
		if (potentialKeys.length <= 2) { return value; }
		
		// reject the first and last potentialKeys, which cannot start/end with tildes
		potentialKeys = potentialKeys.slice(1, -1);
		
		// filter the potentialKeys array for valid keys
		potentialKeys = _.filter(potentialKeys, function (potentialKey) {
			return regexValidKey.test(potentialKey);
		});

		// if the potentialKeys array length is 0, stop
		if (!potentialKeys.length) { return value; }
		
		// sort the potentialKeys array based on alphabetical order
		potentialKeys.sort();
		
		// find the first potentialKey that has a value in the keyword hash
		matchedKey = _.find(potentialKeys, function (potentialKey) {
			return K(potentialKey) != null; // test for not null or undefined
		});
		
		// if there is no matched key, stop
		if (!matchedKey) { return value; }

		// check the recursion depth
		// filter the evaled keys array for the matchedKey
		// throw exception if matchedKey is found more than 5 times
		if (_.filter(evaledKeys, function (key) { return key === matchedKey; }).length > 5) {
			throw "K.eval error: recursive keyword `" + matchedKey + "`";
		}
		
		_.each(potentialKeys, function (potentialKey) {
			if (_.indexOf(evaledKeys, potentialKey) > -1) {
				
			}
		});
		
		
		// execute a global replace for the matchedKey (with tildes) on the value string
		value = value.replace(new RegExp(DDK.char.tilde + matchedKey + DDK.char.tilde, "g"), K(matchedKey));
		
		// add the matchedKey to the evaledKeys array
		evaledKeys.push(matchedKey);

		// return a call to evalKeywordValue on the remaining value, passing in the evaledKeys array
		return evalKeywordValue(value, evaledKeys);
	}

	function Keyword(key, value, prefix) {
		// K(key [, value] [, prefix])
		
		var reservedKeys = "config.m config.mn salt sectoken".split(" ");

		function updateKey(key, value) {
			if (_.indexOf(reservedKeys, key) === -1) {
				daaHash.put(key, value);
				updatedKeys[key] = value;
			}
		}

		var updatedKeys = {};

		// Basic Getter/Setter

		// K(key) : return value associated with key in daaHash
		// typeof key === "string" && key.indexOf("=") == -1 && !value && !prefix
		if (typeof key === "string" && key.indexOf("=") == -1 && typeof value === "undefined" && typeof prefix === "undefined") {
			return daaHash.get(key);
		}

		// K(key, value) : execute keyword update of key value pair in daaHash
		// typeof key === "string" && key.indexOf("=") == -1 && typeof value === "string" && !prefix
		else if (typeof key === "string" && key.indexOf("=") == -1 && typeof prefix === "undefined") {
			updateKey(key, value);
			daaHashSet();
		}


		// Array Getters

		// K([key1, key2, ..., keyN]) : return array of values associated with keys in daaHash
		// $.isArray(key) === true && !value && !prefix
		else if ($.isArray(key) && typeof value === "undefined" && typeof prefix === "undefined") {
			var values = [],
				len = key.length
			;

			for (var i = 0; i < len; i++) {
				values[i] = daaHash.get(key[i]);
			}

			return values;
		}

		// K([key1, key2, ..., keyN], prefix) : return array of values associated with keys in daaHash, with keys prepended by prefix
		// $.isArray(key) === true && typeof value === "string" && !prefix
		// prefix = value;
		// value = undefined;
		else if ($.isArray(key) && typeof value === "string" && typeof prefix === "undefined") {
			prefix = value;
			value = undefined;

			var values = [],
				len = key.length
			;

			for (var i = 0; i < len; i++) {
				values[i] = daaHash.get(prefix + key[i]);
			}

			return values;
		}


		// Array Setters

		// K([key1, key2, ..., keyN], [value1, value2, ..., valueN]) : execute keyword updates on all key value pairs in key and value arrays
		// $.isArray(key) && $.isArray(value) && !prefix
		else if ($.isArray(key) && $.isArray(value) && typeof prefix === "undefined") {
			var len = key.length;

			for (var i = 0; i < len; i++) {
				updateKey(key[i], value[i])
			}

			daaHashSet();
		}

		// K([key1, key2, ..., keyN], [value1, value2, ..., valueN], prefix) : execute keyword updates on all key value pairs in key and value arrays, with keys prepended by prefix
		// $.isArray(key) && $.isArray(value) && typeof prefix === "string"
		else if ($.isArray(key) && $.isArray(value) && typeof prefix === "string") {
			var len = key.length;

			for (var i = 0; i < len; i++) {
				updateKey(prefix + key[i], value[i])
			}

			daaHashSet();
		}


		// URL Getters

		// ... there are no URL Getters ... use .toURL() to return a URL

		// URL Setters (note: URL Setters can begin with & or with the first key value, but not with ?)

		// K("&key1=value1&key2=value2&...&keyN=valueN") : execute keyword updates on all key value pairs in URL
		// typeof key === "string" && key.indexOf("=") > -1 && !value && !prefix
		else if (typeof key === "string" && key.indexOf("=") > -1 && typeof value === "undefined" && typeof prefix === "undefined") {

			var _key = (key.charAt(0) === '?' ? key.substring(1) : key),
				pairs = _key.split('&'),
				i;

			for (i = 0; i < pairs.length; i += 1) {
				var pair = pairs[i].split('=');
				if (pair[0]) {
					updateKey(pair[0], decodeURIComponent(pair[1].replace(/\+/g,' ')));
				}
			}

			daaHashSet();
		}

		// K("&key1=value1&key2=value2&...&keyN=valueN", prefix) : execute keyword updates on all key value pairs in URL, with keys prepended by prefix
		// typeof key === "string" && key.indexOf("=") > -1 && typeof value === "string" && !prefix
		// prefix = value;
		// value = undefined;
		else if (typeof key === "string" && key.indexOf("=") > -1 && typeof value === "string" && typeof prefix === "undefined") {
			prefix = value;
			value = undefined;

			var _key = (key.charAt(0) === '?' ? key.substring(1) : key),
				pairs = _key.split('&'),
				i;

			for (i = 0; i < pairs.length; i += 1) {
				var pair = pairs[i].split('=');
				if (pair[0]) {
					updateKey(prefix + pair[0], decodeURIComponent(pair[1].replace(/\+/g,' ')));
				}
			}

			daaHashSet();
		}


		// Object Getters

		// ... there are no Object Getters ... use .toObject to return an Object


		// Object Setters

		// K({key1: value1, key2: value2, ..., keyN: valueN}) : execute keyword updates on all key value pairs in object
		// $.isPlainObject(key) && !key.from && !value && !prefix
		else if ($.isPlainObject(key) && !key.from && typeof value === "undefined" && typeof prefix === "undefined") {
			for (var i in key) {
				updateKey(i, key[i]);
			}

			daaHashSet();
		}

		// K({key1: value1, key2: value2, ..., keyN: valueN}, prefix) : execute keyword updates on all key value pairs in object
		// $.isPlainObject(key) && typeof value === "string" && !prefix
		// prefix = value;
		// value = undefined;
		else if ($.isPlainObject(key) && typeof value === "string" && typeof prefix === "undefined") {
			prefix = value;
			value = undefined;

			for (var i in key) {
				updateKey(prefix + i, key[i]);
			}

			daaHashSet();
		}


		// Advanced Operations

		// K({options...} : executes bulk keyword operation as defined by options object, which requires "from" parameter.
		// $.isPlainObject(key) === true && key.from && !value && !prefix


		// Else

		// unrecognized K function signature: K(typeof key, typeof value, typeof prefix)


		// trigger keywordupdate event
		if (!_.isEmpty(updatedKeys)) {
			DDK.log("EVENT: keywordupdate", updatedKeys);
			$(document).trigger({
				type: "keywordupdate",
				keywords: updatedKeys
			});
		}

	}

	$.extend(Keyword, {
		// .flush(prefix)
		flush: function(prefix) {
			daaHash.removeKeys(prefix || "");
			daaHashSet();
		},

		// .toURL(prefix)
		toURL: function(prefix) {
			return daaHash.toURL(prefix || "");
		},

		// .toObject(prefix)
		toObject: function(prefix) {
			return daaHash.toObject(prefix || "");
		},

		// .setDefault(key, value)
		setDefault: function(key, value) {
			function setDefaultKeywordValue(_value, _key) {
				var initialValue = K(_key);
				if (!initialValue) {
					K(_key, _value);
				}
			}
			if (_.isObject(key)) {
				_.each(key, setDefaultKeywordValue);
			} else {
				setDefaultKeywordValue(value, key);
			}
		},
		
		// .fromQueryString
		fromQueryString: function () {
			K(window.location.search);
		},
		
		// .eval(key)
		eval: function (key) {
			return evalKeywordValue(K(key), [key]);
		}		
	});

	// Expose K to the global object
	window.Keyword = window.K = Keyword;

}(window));


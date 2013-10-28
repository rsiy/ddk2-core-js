//  Underscore.string
//  (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
//  Underscore.string is freely distributable under the terms of the MIT license.
//  Documentation: https://github.com/epeli/underscore.string
//  Some code is borrowed from MooTools and Alexandru Marasteanu.
//  Version '2.3.0'

!function(root, String){
  'use strict';

  // Defining helper functions.

  var nativeTrim = String.prototype.trim;
  var nativeTrimRight = String.prototype.trimRight;
  var nativeTrimLeft = String.prototype.trimLeft;

  var parseNumber = function(source) { return source * 1 || 0; };

  var strRepeat = function(str, qty){
    if (qty < 1) return '';
    var result = '';
    while (qty > 0) {
      if (qty & 1) result += str;
      qty >>= 1, str += str;
    }
    return result;
  };

  var slice = [].slice;

  var defaultToWhiteSpace = function(characters) {
    if (characters == null)
      return '\\s';
    else if (characters.source)
      return characters.source;
    else
      return '[' + _s.escapeRegExp(characters) + ']';
  };

  var escapeChars = {
    lt: '<',
    gt: '>',
    quot: '"',
    amp: '&',
    apos: "'"
  };

  var reversedEscapeChars = {};
  for(var key in escapeChars) reversedEscapeChars[escapeChars[key]] = key;
  reversedEscapeChars["'"] = '#39';

  // sprintf() for JavaScript 0.7-beta1
  // http://www.diveintojavascript.com/projects/javascript-sprintf
  //
  // Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
  // All rights reserved.

  var sprintf = (function() {
    function get_type(variable) {
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    var str_repeat = strRepeat;

    var str_format = function() {
      if (!str_format.cache.hasOwnProperty(arguments[0])) {
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
      }
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    };

    str_format.format = function(parse_tree, argv) {
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {
        node_type = get_type(parse_tree[i]);
        if (node_type === 'string') {
          output.push(parse_tree[i]);
        }
        else if (node_type === 'array') {
          match = parse_tree[i]; // convenience purposes only
          if (match[2]) { // keyword argument
            arg = argv[cursor];
            for (k = 0; k < match[2].length; k++) {
              if (!arg.hasOwnProperty(match[2][k])) {
                throw new Error(sprintf('[_.sprintf] property "%s" does not exist', match[2][k]));
              }
              arg = arg[match[2][k]];
            }
          } else if (match[1]) { // positional argument (explicit)
            arg = argv[match[1]];
          }
          else { // positional argument (implicit)
            arg = argv[cursor++];
          }

          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
            throw new Error(sprintf('[_.sprintf] expecting number but found %s', get_type(arg)));
          }
          switch (match[8]) {
            case 'b': arg = arg.toString(2); break;
            case 'c': arg = String.fromCharCode(arg); break;
            case 'd': arg = parseInt(arg, 10); break;
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
            case 'o': arg = arg.toString(8); break;
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
            case 'u': arg = Math.abs(arg); break;
            case 'x': arg = arg.toString(16); break;
            case 'X': arg = arg.toString(16).toUpperCase(); break;
          }
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
          pad_length = match[6] - String(arg).length;
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';
          output.push(match[5] ? arg + pad : pad + arg);
        }
      }
      return output.join('');
    };

    str_format.cache = {};

    str_format.parse = function(fmt) {
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
      while (_fmt) {
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
          parse_tree.push(match[0]);
        }
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
          parse_tree.push('%');
        }
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {
            arg_names |= 1;
            var field_list = [], replacement_field = match[2], field_match = [];
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
              field_list.push(field_match[1]);
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else {
                  throw new Error('[_.sprintf] huh?');
                }
              }
            }
            else {
              throw new Error('[_.sprintf] huh?');
            }
            match[2] = field_list;
          }
          else {
            arg_names |= 2;
          }
          if (arg_names === 3) {
            throw new Error('[_.sprintf] mixing positional and named placeholders is not (yet) supported');
          }
          parse_tree.push(match);
        }
        else {
          throw new Error('[_.sprintf] huh?');
        }
        _fmt = _fmt.substring(match[0].length);
      }
      return parse_tree;
    };

    return str_format;
  })();

  var coerceNestedObject = function (object) {
	_.each(object, function (value, key, obj) {
		if (typeof value === "string") {
			obj[key] = _.string.coerce(value);
		} else if (_.isObject(obj[key])) {
			coerceNestedObject(obj[key]);
		}
	}); 
  };
  
  // coerce method helpers
  var coerceType = _.delegator({
	"number": function (data, trimmedData) {
		return trimmedData.match(/^[-]?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?$/) ? +trimmedData : data;
	},
	"boolean": function (data, trimmedData) {
		var bool = _.string.toBoolean(trimmedData);
		return bool == null ? data : bool;
	},
	"object": function (data, trimmedData) {
		try {
			return JSON.parse(trimmedData);
		} catch (e) {
			return data;
		}
	},
	"string": function (data, trimmedData) {
		return data;
	},
	"null": function (data, trimmedData) {
		return trimmedData.match(/^null$/i) ? null : data;
	},
	"undefined": function (data, trimmedData) {
		return trimmedData.match(/^undefined$/i) ? undefined : data;
	}
  }, "string");
  
  var coerceTriggers = {
	"0": "number",
	"1": "number",
	"2": "number",
	"3": "number",
	"4": "number",
	"5": "number",
	"6": "number",
	"7": "number",
	"8": "number",
	"9": "number",
	"-": "number",
	".": "number",
	"t": "boolean",
	"f": "boolean",
	"T": "boolean",
	"F": "boolean",
	"[": "object",
	"{": "object",
	"n": "null",
	"N": "null",
	"u": "undefined",
	"U": "undefined"
  };

  // Defining underscore.string

  var _s = {

    VERSION: '2.3.0',

    isBlank: function(str){
      if (str == null) str = '';
      return (/^\s*$/).test(str);
    },

    stripTags: function(str){
      if (str == null) return '';
      return String(str).replace(/<\/?[^>]+>/g, '');
    },

    capitalize : function(str){
      str = str == null ? '' : String(str);
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    chop: function(str, step){
      if (str == null) return [];
      str = String(str);
      step = ~~step;
      return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
    },

    clean: function(str){
      return _s.strip(str).replace(/\s+/g, ' ');
    },

    count: function(str, substr){
      if (str == null || substr == null) return 0;

      str = String(str);
      substr = String(substr);

      var count = 0,
        pos = 0,
        length = substr.length;

      while (true) {
        pos = str.indexOf(substr, pos);
        if (pos === -1) break;
        count++;
        pos += length;
      }

      return count;
    },

    chars: function(str) {
      if (str == null) return [];
      return String(str).split('');
    },

    swapCase: function(str) {
      if (str == null) return '';
      return String(str).replace(/\S/g, function(c){
        return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
      });
    },

    escapeHTML: function(str) {
      if (str == null) return '';
      return String(str).replace(/[&<>"']/g, function(m){ return '&' + reversedEscapeChars[m] + ';'; });
    },

    unescapeHTML: function(str) {
      if (str == null) return '';
      return String(str).replace(/\&([^;]+);/g, function(entity, entityCode){
        var match;

        if (entityCode in escapeChars) {
          return escapeChars[entityCode];
        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
          return String.fromCharCode(parseInt(match[1], 16));
        } else if (match = entityCode.match(/^#(\d+)$/)) {
          return String.fromCharCode(~~match[1]);
        } else {
          return entity;
        }
      });
    },

    escapeRegExp: function(str){
      if (str == null) return '';
      return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
    },

    splice: function(str, i, howmany, substr){
      var arr = _s.chars(str);
      arr.splice(~~i, ~~howmany, substr);
      return arr.join('');
    },

    insert: function(str, i, substr){
      return _s.splice(str, i, 0, substr);
    },

    include: function(str, needle){
      if (needle === '') return true;
      if (str == null) return false;
      return String(str).indexOf(needle) !== -1;
    },

    join: function() {
      var args = slice.call(arguments),
        separator = args.shift();

      if (separator == null) separator = '';

      return args.join(separator);
    },

    lines: function(str) {
      if (str == null) return [];
      return String(str).split("\n");
    },

    reverse: function(str){
      return _s.chars(str).reverse().join('');
    },

    startsWith: function(str, starts){
      if (starts === '') return true;
      if (str == null || starts == null) return false;
      str = String(str); starts = String(starts);
      return str.length >= starts.length && str.slice(0, starts.length) === starts;
    },

    endsWith: function(str, ends){
      if (ends === '') return true;
      if (str == null || ends == null) return false;
      str = String(str); ends = String(ends);
      return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
    },

    succ: function(str){
      if (str == null) return '';
      str = String(str);
      return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length-1) + 1);
    },

    titleize: function(str){
      return _s.underscored(_s.camelize(str)).replace(/_+/g, ' ').replace(/(?:^|\s)\S/g, function(c){ return c.toUpperCase(); });
    },

    camelize: function(str){
      if (str == null) return '';
      str = String(str);
	  // if a string is ALL_CAPS, lowercase it before camelizing
      return _s.trim(str.match(/[a-z]/g) ? str : str.toLowerCase())
		// lowercase the first character
		.replace(/^[A-Z]/, function(c) { return c.toLowerCase(); })
		// camelize the remaining parts
		.replace(/[-_\s]+(.)?/g, function(match, c){ return c ? c.toUpperCase() : ""; });
    },

    underscored: function(str){
      return _s.trim(str).replace(/([A-Z])/g, '_$1').replace(/[-_\s]+/g, '_').toLowerCase();
    },

    dasherize: function(str){
      return _s.trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
    },

    classify: function(str){
      return _s.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
    },

    humanize: function(str){
      if (str == null) return '';
      str = String(str);
	  // if a string is ALL_CAPS and does not contain lowercase letters, then camelize it before underscoredizeing it.
      return _s.capitalize(_s.trim(_s.underscored(str.match(/[a-z]/g) ? str : _s.camelize(str)).replace(/_/g, ' ')));
    },

    trim: function(str, characters){
      if (str == null) return '';
      if (!characters && nativeTrim) return nativeTrim.call(str);
      characters = defaultToWhiteSpace(characters);
      return String(str).replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');
    },

    ltrim: function(str, characters){
      if (str == null) return '';
      if (!characters && nativeTrimLeft) return nativeTrimLeft.call(str);
      characters = defaultToWhiteSpace(characters);
      return String(str).replace(new RegExp('^' + characters + '+'), '');
    },

    rtrim: function(str, characters){
      if (str == null) return '';
      if (!characters && nativeTrimRight) return nativeTrimRight.call(str);
      characters = defaultToWhiteSpace(characters);
      return String(str).replace(new RegExp(characters + '+$'), '');
    },

    truncate: function(str, length, truncateStr){
      if (str == null) return '';
      str = String(str); truncateStr = truncateStr || '...';
      length = ~~length;
      return str.length > length ? str.slice(0, length) + truncateStr : str;
    },

    /**
     * _s.prune: a more elegant version of truncate
     * prune extra chars, never leaving a half-chopped word.
     * @author github.com/rwz
     */
    prune: function(str, length, pruneStr){
      if (str == null) return '';

      str = String(str); length = ~~length;
      pruneStr = pruneStr != null ? String(pruneStr) : '...';

      if (str.length <= length) return str;

      var tmpl = function(c){ return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' '; },
        template = str.slice(0, length+1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'

      if (template.slice(template.length-2).match(/\w\w/))
        template = template.replace(/\s*\S+$/, '');
      else
        template = _s.rtrim(template.slice(0, template.length-1));

      return (template+pruneStr).length > str.length ? str : str.slice(0, template.length)+pruneStr;
    },

    words: function(str, delimiter) {
      if (_s.isBlank(str)) return [];
      return _s.trim(str, delimiter).split(delimiter || /\s+/);
    },

    pad: function(str, length, padStr, type) {
      str = str == null ? '' : String(str);
      length = ~~length;

      var padlen  = 0;

      if (!padStr)
        padStr = ' ';
      else if (padStr.length > 1)
        padStr = padStr.charAt(0);

      switch(type) {
        case 'right':
          padlen = length - str.length;
          return str + strRepeat(padStr, padlen);
        case 'both':
          padlen = length - str.length;
          return strRepeat(padStr, Math.ceil(padlen/2)) + str
                  + strRepeat(padStr, Math.floor(padlen/2));
        default: // 'left'
          padlen = length - str.length;
          return strRepeat(padStr, padlen) + str;
        }
    },

    lpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr);
    },

    rpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr, 'right');
    },

    lrpad: function(str, length, padStr) {
      return _s.pad(str, length, padStr, 'both');
    },

    sprintf: sprintf,

    vsprintf: function(fmt, argv){
      argv.unshift(fmt);
      return sprintf.apply(null, argv);
    },

    toNumber: function(str, decimals) {
      if (!str) return 0;
      str = _s.trim(str);
      if (!str.match(/^-?\d+(?:\.\d+)?$/)) return NaN;
      return parseNumber(parseNumber(str).toFixed(~~decimals));
    },

    numberFormat : function(number, dec, dsep, tsep) {
      if (isNaN(number) || number == null) return '';

      number = number.toFixed(~~dec);
      tsep = typeof tsep == 'string' ? tsep : ',';

      var parts = number.split('.'), fnums = parts[0],
        decimals = parts[1] ? (dsep || '.') + parts[1] : '';

      return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
    },

    strRight: function(str, sep){
      if (str == null) return '';
      str = String(str); sep = sep != null ? String(sep) : sep;
      var pos = !sep ? -1 : str.indexOf(sep);
      return ~pos ? str.slice(pos+sep.length, str.length) : str;
    },

    strRightBack: function(str, sep){
      if (str == null) return '';
      str = String(str); sep = sep != null ? String(sep) : sep;
      var pos = !sep ? -1 : str.lastIndexOf(sep);
      return ~pos ? str.slice(pos+sep.length, str.length) : str;
    },

    strLeft: function(str, sep){
      if (str == null) return '';
      str = String(str); sep = sep != null ? String(sep) : sep;
      var pos = !sep ? -1 : str.indexOf(sep);
      return ~pos ? str.slice(0, pos) : str;
    },

    strLeftBack: function(str, sep){
      if (str == null) return '';
      str += ''; sep = sep != null ? ''+sep : sep;
      var pos = str.lastIndexOf(sep);
      return ~pos ? str.slice(0, pos) : str;
    },

    toSentence: function(array, separator, lastSeparator, serial) {
      separator = separator || ', '
      lastSeparator = lastSeparator || ' and '
      var a = array.slice(), lastMember = a.pop();

      if (array.length > 2 && serial) lastSeparator = _s.rtrim(separator) + lastSeparator;

      return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;
    },

    toSentenceSerial: function() {
      var args = slice.call(arguments);
      args[3] = true;
      return _s.toSentence.apply(_s, args);
    },

    slugify: function(str) {
      if (str == null) return '';

      var from  = "aàáäâãåæceèéëêìíïîlnòóöôõøsùúüûñçzz",
          to    = "aaaaaaaaceeeeeiiiilnoooooosuuuunczz",
          regex = new RegExp(defaultToWhiteSpace(from), 'g');

      str = String(str).toLowerCase().replace(regex, function(c){
        var index = from.indexOf(c);
        return to.charAt(index) || '-';
      });

      return _s.dasherize(str.replace(/[^\w\s-]/g, ''));
    },

    surround: function(str, wrapper) {
      return [wrapper, str, wrapper].join('');
    },

    quote: function(str) {
      return _s.surround(str, '"');
    },

    exports: function() {
      var result = {};

      for (var prop in this) {
        if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse)$/)) continue;
        result[prop] = this[prop];
      }

      return result;
    },

    repeat: function(str, qty, separator){
      if (str == null) return '';

      qty = ~~qty;

      // using faster implementation if separator is not needed;
      if (separator == null) return strRepeat(String(str), qty);

      // this one is about 300x slower in Google Chrome
      for (var repeat = []; qty > 0; repeat[--qty] = str) {}
      return repeat.join(separator);
    },

    naturalCmp: function(str1, str2){
      if (str1 == str2) return 0;
      if (!str1) return -1;
      if (!str2) return 1;

      var cmpRegex = /(\.\d+)|(\d+)|(\D+)/g,
        tokens1 = String(str1).toLowerCase().match(cmpRegex),
        tokens2 = String(str2).toLowerCase().match(cmpRegex),
        count = Math.min(tokens1.length, tokens2.length);

      for(var i = 0; i < count; i++) {
        var a = tokens1[i], b = tokens2[i];

        if (a !== b){
          var num1 = parseInt(a, 10);
          if (!isNaN(num1)){
            var num2 = parseInt(b, 10);
            if (!isNaN(num2) && num1 - num2)
              return num1 - num2;
          }
          return a < b ? -1 : 1;
        }
      }

      if (tokens1.length === tokens2.length)
        return tokens1.length - tokens2.length;

      return str1 < str2 ? -1 : 1;
    },

    levenshtein: function(str1, str2) {
      if (str1 == null && str2 == null) return 0;
      if (str1 == null) return String(str2).length;
      if (str2 == null) return String(str1).length;

      str1 = String(str1); str2 = String(str2);

      var current = [], prev, value;

      for (var i = 0; i <= str2.length; i++)
        for (var j = 0; j <= str1.length; j++) {
          if (i && j)
            if (str1.charAt(j - 1) === str2.charAt(i - 1))
              value = prev;
            else
              value = Math.min(current[j], current[j - 1], prev) + 1;
          else
            value = i + j;

          prev = current[j];
          current[j] = value;
        }

      return current.pop();
    },

	// nameify(str, prefix, appendGuid)
	// Converts a label or other string into a name suitable
	// for use in the PureShare Metrics Catalog database
	nameify: function (str, prefix, appendGuid) {
		var name;

		if (str == null) { return  ""; }

		// prepend prefix
		// replace all non alphanumeric character with underscore
		// replace all multiple underscore groups with a single underscore
		name = ((prefix ? prefix + "_" : "") + str).replace(/[^a-zA-Z0-9]+/g, "_").replace(/_+/g, "_");
		
		// append guid if required
		if (appendGuid) {
			name += "_" + _.guid();
		}
		
		// prepend underscore if the first character is a number
		if (/[0-9]/.test(name.charAt(0))) {
			name = "_" + name;
		}
		
		// force uppercase
		return name.toUpperCase();
	},
		
	// toBoolean(testString [, trueTest, falseTest])
	// trueTest and falseTest may be strings, regex expressions, or any valid argument for String.match()
	// default trueTest is /^true$/i
	// default falseTest is /^false$/i
	//
	// based on https://github.com/epeli/underscore.string/pull/186/files
	toBoolean: function(str, trueTest, falseTest) {
		// return null if the string is null or undefined
		if (str == null) return  null;
		
		// return true if the string argument is actually the boolean `true` value
		if (str === true) return true;
		
		// return false if the string argument is actually the boolean `false` value or `NaN`
		if (str === false || _.isNaN(str)) return false;		
		
		trueTest = trueTest || /^true$/i;
		falseTest = falseTest || /^false$/i;
		
		// return true if the string matches the trueTest
		if (str.match(trueTest)) { return true; }
		
		// return false if the string matches the falseTest
		if (str.match(falseTest)) { return false; }
		
		// return null if the string matches neither the trueTest nor the falseTest
		return null;
	},
	
	// isQueryString(str)
	// returns `true` if a string is a valid query string
	// returns `false` if a string is not a valid query string
	//
	// this is an intentionally trivial test
	// can improve the test later if required
	// see http://benalman.com/projects/jquery-bbq-plugin/ for a more robust handling of query strings
	isQueryString: function (str) {
		if (typeof str !== "string") return false;
		
		// very simply, a query string should have an `=` character
		// somewhere after the first character of the string
		return str.indexOf("=") > 0;
	},
	
	// parseJSON(str)
	// attempts to parse a string as JSON
	// will return an object if the string was successfully parsed
	// will return the string if the string cannot be parsed with JSON.parse()
	// optionally passed through the fallback function if unable to parse as JSON
	parseJSON: function(str, reviver, fallback) {
		try { return JSON.parse(str, reviver); }
		catch (error) { return typeof fallback === "function" ? fallback(str) : str; }
	},

	// parseQueryString(str)
	// attempts to parse a string as a query string
	// will return an object if the string was successfully parsed
	// will return the string if the string cannot be parsed
	//
	// this is an intentionally basic implementation
	// can improve the implementation later if required
	// see http://benalman.com/projects/jquery-bbq-plugin/ for a more robust handling of query strings
	parseQueryString: function(str) {
		var obj = {};
		
		_.each(str.replace(/\+/g, "").replace(/^\?/g, "").split("&"), function (param) {
			var pair = param.split("="),
				key = pair[0] && decodeURIComponent(pair[0]),
				value = pair[1] && decodeURIComponent(pair[1]);
				
			if (key && typeof value === "string") {
				obj[key] = _.string.coerce(value);
			}
		});
		
		return _.isEmpty(obj) ? str : obj;
	},
	
	// parse(str)
	// attempts to parse a string as JSON, then as a queryString
	// will return an object if the string was successfully parsed
	// will return the string if the string cannot be parsed 
	// with _.string.parseJSON() or _.string.parseQueryString()
	parse: function(str, reviver) {
		return _.string.parseJSON(str, reviver, _.string.parseQueryString)
	},
	
	// parseTaggedList(str)
	// attempts to parse a string as a tagged list
	// tagged list format looks like this:
	// <taggedpair><taggedkey>key</taggedkey><taggedvalue>value</taggedvalue></taggedpair>
	// tagged list is a format into which AMEngine keyword values can be rendered without breaking the grammar
	// will return an array of key/value array pairs
	parseTaggedList: function (str) {
		var pairs = [];
		
		_.each(str.match(/<taggedpair>.+?<\/taggedpair>/g), function (pairMatch) {
			var key, value;

			pairMatch = pairMatch.slice(12, -13);
			_.each(pairMatch.match(/^<taggedkey>.+?<\/taggedkey>/), function (keyMatch) {
				key = keyMatch.slice(11, -12);
			});
			_.each(pairMatch.match(/<taggedvalue>.+?<\/taggedvalue>$/), function (valueMatch) {
				value = valueMatch.slice(13, -14);
			});
			
			pairs.push([key, value]);
		});
		
		return pairs;
	},
	
	// trimWhiteSpace(str)
	// trims leading and trailing white space from a string
	// returns the trimmed string
	trimWhiteSpace: function(str) {
		// return null if the string is null or undefined
		if (str == null) { return  null };
		
		return str.replace(/^\s*/, "").replace(/\s*$/, "");
	},

	// coerce(str)
	// attempts to coerce a string to a native JavaScript type
	// (object, array, number, boolean)
	// based on the first non-whitespace character in the string
	// will return the coerced value, or the original string if unable to coerce
	// will coerce `undefined` and `null` values to empty string
	//
	// depends on custom lodash mixin `_.delegator`
	//
	// exposes coerceType function as coerce.coerceType
	// coerceType is a function object created using _.delegator
	// coerceType cases accept two arguments:
	// - str: the original string
	// - trimmedStr: the original string trimmed of leading and trailing whitespace characters
	//
	// exposes coerceTriggers as coerce.coerceTriggers
	// coerceTriggers is an object character/case mapping to match 
	// the initial non-whitespace character of a string to a
	// coerceType case
	coerce: function(str) {
		var trimmedStr, coercedValue;
		
		// return null if the string is null or undefined
		if (str == null) { return  null };
		
		trimmedStr = _s.trimWhiteSpace(str);
		
		// call coerceType using the first non-whitspace character of the string
		// as the lookup in coerceTriggers for the coerceType caseKey
		coercedValue = coerceType(coerceTriggers[trimmedStr.charAt(0)], str, trimmedStr);
		
		// call coerceType recursively on any nested object properties
		if (_.isObject(coercedValue)) {
			coerceNestedObject(coercedValue);
		}
		
		return coercedValue;
	}
	
  };
  
  // expose coerceType and coerceTriggers as properties of _s.coerece
  _s.coerce.coerceType = coerceType;
  _s.coerce.coerceTriggers = coerceTriggers;

  // Aliases

  _s.strip    = _s.trim;
  _s.lstrip   = _s.ltrim;
  _s.rstrip   = _s.rtrim;
  _s.center   = _s.lrpad;
  _s.rjust    = _s.lpad;
  _s.ljust    = _s.rpad;
  _s.contains = _s.include;
  _s.q        = _s.quote;

  // Exporting

  // CommonJS module is defined
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      module.exports = _s;

    exports._s = _s;
  }

  // Register as a named module with AMD.
  if (typeof define === 'function' && define.amd)
    define('underscore.string', [], function(){ return _s; });


  // Integrate with Underscore.js if defined
  // or create our own underscore object.
  root._ = root._ || {};
  root._.string = root._.str = _s;
}(this, String);

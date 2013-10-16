// DDK.COLUMN_METRIC_TRIGGERS
// list of regex matches for column key trigger suffixes
// if a columnName matches a trigger suffix, the prefix becomes a columnMetric
DDK.COLUMN_METRIC_TRIGGERS = [
	/_ABBR$/,
	/_ID$/,
	/_NAME$/,
	/_LABEL$/,
	/_TARGET$/,
	/_TREND$/,
	/_YOY[1-9][0-9]*$/, // _YOY# positive integer
	/_PRV[1-9][0-9]*$/, // _PRV# positive integer
	/_[12][0-9]{3}$/, // _YYYY - valid 4-digit year 1000-2999
	/_[12][0-9]{3}_Q[1-4]$/, // _YYYY_Q# - valid quarters 1-4
	/_[12][0-9]{3}_W(0[1-9]|[1-4][0-9]|5[0-3])$/, // _YYYY_W## - valid weeks 01-53
	/_[12][0-9]{3}_(0[1-9]|1[12])$/, // _YYYY_MM - valid 2 digit month 01-12
	/_[12][0-9]{3}_(0[1-9]|1[12])_(0[1-9]|[12][0-9]|3[01])$/, // _YYYY_MM_DD - valid 2 digit day 01-31
	/_[1-9][0-9]{0,2}$/ // _# positive integer from 1 to 999
];

DDK.regex = {
	closeAngleBracket: /\x3E/g,
	openAngleBracket: /\x3C/g,
	closeBracket: /\x5D/g,
	openBracket: /\x5B/g,
	escapedOpenBracket: /\x5C\x5B/g,
	escapedCloseBracket: /\x5C\x5D/g,
	percentPercent: /%%/g,
	atPercent: /@%/g,
	percentAt: /%@/g,
	singleQuote: /\x27/g,
	doubleQuote: /\x22/g,
	ampersand: /\x26/g,
	underscore: /\x5F/g,
	whitespace: /\s+/g,
	backslash: /\x5C/g
};

DDK.char = {
	closeBracket: String.fromCharCode(93),
	doubleQuote: String.fromCharCode(34),
	openBracket: String.fromCharCode(91),
	reverseSolidus: String.fromCharCode(92),
	backslash: String.fromCharCode(92),
	singleQuote: String.fromCharCode(39),
	tilde: String.fromCharCode(126),
	crlf: "\r\n",
	space: " ",
	at: "@"
};

DDK.escape = {
	angleBrackets: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.openAngleBracket, "&lt;")
			.replace(DDK.regex.closeAngleBracket, "&gt;");
	},
	brackets: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.openBracket, DDK.char.reverseSolidus + DDK.char.openBracket)
			.replace(DDK.regex.closeBracket, DDK.char.reverseSolidus + DDK.char.closeBracket);
	},
	singleQuote: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.singleQuote, DDK.char.reverseSolidus + DDK.char.singleQuote);
	},
	doubleQuote: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.doubleQuote, DDK.char.reverseSolidus + DDK.char.doubleQuote);
	},
	backslash: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.backslash, DDK.char.backslash + DDK.char.backslash);
	}
};

DDK.unescape = {
	brackets: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.escapedOpenBracket, DDK.char.openBracket)
			.replace(DDK.regex.escapedCloseBracket, DDK.char.closeBracket);
	},
	tilde: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.percentPercent, DDK.char.tilde);
	},
	amControlChars: function(unescapedString) {
		return unescapedString
			.replace(DDK.regex.percentPercent, DDK.char.tilde);
			// these don't work because the config string gets rendered in too many places and too many contexts
			// .replace(DDK.regex.percentAt, DDK.char.openBracket + DDK.char.at + DDK.char.space)
			// .replace(DDK.regex.atPercent, DDK.char.space + DDK.char.closeBracket);
	}
};

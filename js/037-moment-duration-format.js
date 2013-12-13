/*
(format, settings)
(format, decimals)
(format)
(settings)

trim: 
	"left" - format tokens are trimmed from the left until the first moment token that has a value (the final moment token is not trimmed)
	"right" - format tokens are trimmed from the right until the first moment token that has a value > 1 (the final moment token is not trimmed)
	"none" - format tokens are not trimmed
	true - format tokens are trimmed before the first moment token with a value (trim direction is ideally based on native default rtl setting (how to find that?)
	false - format tokens are not trimmed
// default true

decimals: number of decimal places to include after the decimal point (positive integer) or before the decimal point (negative integer)
// default 0

escape: {
	start: "["
	end: "]"
} -- how does mustache / lo-dash set template tokens?
// default []

tokens: object map with tokens

moment.duration.fn.format = function (format, settings) {

}



tokenize
find first/last token
find hasValue
trim
loop through tokes to find all moment token in order (unique)
then find moment token values

then apply values to token array

*/

moment.duration.fn.format = function (format, decimals) {

	// map token characters to moment types
	var tokenTypeMap = {
		"Y": "years",
		"y": "years",
		"M": "months",
		"W": "weeks",
		"w": "weeks",
		"D": "days",
		"d": "days",
		"H": "hours",
		"h": "hours",
		"m": "minutes",
		"S": "seconds",
		"s": "seconds"
	};

	// don't output tokens until a moment token with a value is found
	var foundMomentToken = false;
	
	// regex for tokenizing format string
	var tokenizer = /\[.+?\]|(Y|y)+|M+|(W|w)+|(D|d)+|(H|h)+|m+|(S|s)+|.+?/g;
	
	// regex for identifying escaped tokens
	var escapedToken = /^\[.+\]$/;
	
	// regex for replacing square brackets in escaped tokens
	var squareBrackets = /\[|\]/g;
	
	var remainder, tokens, lastMomentTokenIndex, firstMomentTokenIndex, firstMomentTokenLength, foundFirstMomentToken;
	
	// exit early if `format` is not a string
	if (typeof format !== "string") {
		return "";
	}

	// decimal precision is applied to the final moment token, and must be a positive integer or 0
	decimals = (_.isPositiveInteger(decimals) ? decimals : 0);

	// keep a shadow copy of this moment for calculating remainders
	remainder = moment.duration(this);
	
	// setup tokens array
	tokens = _.map(format.match(tokenizer), function (token, index) {
		var tokenType = tokenTypeMap[token[0]],
			tokenLength = token.length;
		
		return {
			token: (escapedToken.test(token) ? token.replace(squareBrackets, "") : token),
			type: tokenType,
			length: tokenLength,
			hasValue: (tokenType ? this.as(tokenType) : null) > 1
		};
	}, this);

	// identify the last moment token
	lastMomentTokenIndex = _.findLastIndex(tokens, "type");

	// exit early if there are no moment tokens
	if (lastMomentTokenIndex === -1) {
		return _.pluck(tokens, "token").join("");
	}
	tokens[lastMomentTokenIndex].isLastMomentToken = true;

	// identify the first moment token
	firstMomentTokenIndex = _.findIndex(tokens, "type");
	tokens[firstMomentTokenIndex].isFirstMomentToken = true;
	firstMomentTokenLength = tokens[firstMomentTokenIndex].length;
	
	// if the first moment token doesn't have a value
	// discard all tokens before either the first moment token to have a value or the last moment token
	if (!tokens[firstMomentTokenIndex].hasValue) {
		tokens = _.rest(tokens, function (token) {
			// return `true` if:
			// the token is not the last moment token
			// the token is a moment token that does not have a value
			return !(token.isLastMomentToken || (token.type != null && token.hasValue));
		});
	}

	// for the tokens that remain
	foundFirstMomentToken = false;
	return _.map(tokens, function (token) {
		var tokenVal,
			tokenDecimalVal = "",
			tokenAsVal;
		
		if (!token.type) {
			// if it is not a moment token, use the token as its value
			return token.token;
		}
		
		// if the first moment token is found, note it
		// this could affect tokenLength padding later
		if (token.isFirstMomentToken) {
			foundFirstMomentToken = true;
		}
		
		tokenAsVal = remainder.as(token.type);
		tokenVal = Math.floor(tokenAsVal);
		
		if (token.isLastMomentToken && decimals) {
			// if applying decimal precision to the last value
			// use the remainder of the remainder
			tokenDecimalVal = tokenAsVal - tokenVal;
		}
		
		// apply decimalPrecision if required
		if (decimals && tokenDecimalVal !== "") {
			tokenDecimalVal = "." + _.string.rpad(tokenDecimalVal.toString().split(".")[1], decimals, "0").slice(0, decimals);
		}

		// update remainder
		remainder.subtract(tokenVal, token.type);
		
		// apply tokenLength formatting
		// except in the case that this is the first moment token with a value but was not the first moment token in the format
		// if that happens, check the first moment token's tokenLength to see if we should apply tokenLength formatting
		// trust me... it's what the users expect to happen
		if (token.length > 1 && (foundFirstMomentToken || firstMomentTokenLength > 1)) {
			tokenVal = _.string.pad(tokenVal, token.length, "0");
		} else {
			tokenVal = tokenVal.toString();
		}
		
		tokenVal += tokenDecimalVal;
		foundFirstMomentToken = true;
		
		return tokenVal;
	}).join("");
};

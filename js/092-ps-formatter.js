PS.Formatter = function (el) {
	function exec() {
		var formatter = this.format && this[this.format],
			formattedValue;
			
		if (typeof formatter === "function") {
			formattedValue = formatter.call(this);
		}
			
		if (formattedValue != null) {
			this.$el.html(formattedValue);
		}
		
		this.$el.removeAttr("data-format");
	}
	
	var $el = $(el);

	// there can be only one element
	if ($el.length > 1) { throw "PS.Formatter matched more than one element." }
	if (!$el.length) { throw "PS.Formatter did not match any elements." }

	// extend the formatter object
	// with all of the data attributes from 
	// this element and all parent elements
	_.extend(this, _.pick($el.dataStack(), function (value, key) {
		return _.string.startsWith(key, "format");
	}));
	
	// setup element references
	this.$el = $el;
	this.el = $el.get(0);
	
	// create exec function reference
	this.exec = exec;
};

// create a jQuery-esque reference to the PS.Formatter prototype
PS.Formatter.fn = PS.Formatter.prototype;

// default formatter functions
PS.Formatter.fn.text = function () {
	return _.escape(this.formatValue);
};

PS.Formatter.fn.html = function () {
	return this.formatValue;
};

PS.Formatter.fn.number = function () {
	var num = +this.formatValue,
		isNum = !(num == null || isNaN(num)),
		precision = (this.formatPrecision != null ? this.formatPrecision : this.number.defaults.precision);
		
	if (!isNum) {
		return "&nbsp;"
	}
	
	if (num === 0) {
		return "-";
	}
	
	return numeral(num).format("0,0" + (precision ? "." + _.string.repeat("0", precision) : ""));
};


// formats array to be used as a datasource for UI (structured for Select2)
PS.Formatter.formats = [];

// register method for adding formats to the formats array
PS.Formatter.register = function(settings) {
	// verify that the format function exists
	if (typeof PS.Formatter.fn[settings.id] !== "function") {
		DDK.error("Unable to register formatter. `PS.Formatter.fn." + settings.id + "` is not a function.");
		return;
	}
	
	// add format to the formats array
	PS.Formatter.formats.push({
		id: settings.id,
		text: settings.text,
		sortOrder: settings.sortOrder
	});
	
	// sort formats array
	PS.Formatter.formats.sort(function (a, b) {
		return a.sortOrder - b.sortOrder;
	});
	
	// add defaults to the formatter function
	PS.Formatter.fn[settings.id].defaults = settings.defaults || {};		
};
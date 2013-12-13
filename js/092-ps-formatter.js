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

// formats array to be used as a datasource for UI (structured for Select2)
PS.Formatter.formats = [];

// database datatype to format type map
PS.Formatter.typeMap = {};

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
		sortOrder: settings.sortOrder,
		name: settings.name,
		styles: []
	});
	
	// sort formats array
	PS.Formatter.formats.sort(function (a, b) {
		return a.sortOrder - b.sortOrder;
	});
	
	// add defaults to the formatter function
	PS.Formatter.fn[settings.id].defaults = settings.defaults || {};
	
	// extend type map
	if (settings.datatype) {
		_.each(settings.datatype.split(" "), function (datatype) {
			PS.Formatter.typeMap[datatype] = settings.id;
		});
	}
	
	// set default format
	if (!PS.Formatter.defaultFormat || settings.isDefaultFormat) {
		PS.Formatter.defaultFormat = settings.id;
	}
};

// register method for adding styles to the format styles array
PS.Formatter.registerStyle = function(settings) {
	var format = _.find(PS.Formatter.formats, { name: settings.parentName }),
		styles = format.styles;
	
	// verify that the format function is registered
	if (!format) {
		DDK.error("Unable to register format style. `Cannot find '" + settings.parentName + "' in PS.Formatter.formats.");
		return;
	}
	
	// add style to the styles array
	styles.push(settings);
	
	// sort styles array
	styles.sort(function (a, b) {
		return a.sortOrder - b.sortOrder;
	});
	
	// add style defaults to the formatter function
	PS.Formatter.fn[format.id][settings.id] = settings.defaults || {};		
};

PS.Formatter.fn.getSettings = function () {
	return _.extend(
		// start with an empty object
		{},
		
		// add the global default format settings
		this.defaults,
		
		// add the default format settings for this format
		this[this.format].defaults,
		
		// add the default format settings from this format style
		this[this.format][this.formatStyle],
		
		// override with any data-format attributes from the data stack
		// remove the 'format' prefix and camelize the remaining name
		_.reduce(_.pick(this, function (value, key) {
			return key !== "format" && _.string.startsWith(key, "format");
		}), function (accumulator, value, key) {
			accumulator[_.string.camelize(key.slice(6))] = value;
			return accumulator;
		}, {})
	);
};

PS.Formatter.fn.defaults = {
	precision: 0,
	units: "",
	unitsPosition: "right",
	unitsTemplate: "<span class=\"format-units\"><%= units %></span>",
	arrowTemplate: "<span class=\"format-arrow ddk-icon\"><%= arrow %></span>",
	bulbTemplate: "<span class=\"format-bulb ddk-icon\"><%= bulb %></span>",
	orientation: 1
};

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
		settings = this.getSettings();
		
	if (!isNum) {
		return "&nbsp;";
	}
	
	if (num === 0) {
		return "-";
	}
	
	if (settings.units) {
		settings.units = _.template(settings.unitsTemplate, settings);
	}
		
	return (settings.unitsPosition === "left" ? " " + settings.units : "") +
		numeral(num).format("0,0" + (settings.precision ? "." + _.string.repeat("0", settings.precision) : "")) +
		(settings.unitsPosition === "right" ? " " + settings.units : "");
};

PS.Formatter.fn.currency = function () {
	var num = +this.formatValue,
		isNum = !(num == null || isNaN(num)),
		settings = this.getSettings();
		
	if (!isNum) {
		return "&nbsp;";
	}
	
	if (num === 0) {
		return "-";
	}
	
	if (settings.units) {
		if (settings.units === "dollars") { settings.units = "$"; }
		settings.units = _.template(settings.unitsTemplate, settings);
	}
	
	return (settings.unitsPosition === "left" ? " " + settings.units : "") +
		numeral(num).format("0,0" + (settings.precision ? "." + _.string.repeat("0", settings.precision) : "")) +
		(settings.unitsPosition === "right" ? " " + settings.units : "");
};

PS.Formatter.fn.date = function () {
	var settings = this.getSettings(),
		args = [this.formatValue],
		mom;
	
	if (settings.units) {
		args.push(settings.units);
	}
		
	mom = moment.apply(null, args);

	return mom.format(settings.format);
};

PS.Formatter.fn.time = function () {
	var settings = this.getSettings(),
		args = [this.formatValue, settings.units || "seconds"],
		dur;
	
	dur = moment.duration.apply(null, args);

	return dur.format(settings.format, settings.precision);
};

PS.Formatter.fn.date = function () {
	var settings = this.getSettings(),
		args = [this.formatValue],
		mom;
	
	if (settings.units) {
		args.push(settings.units);
	}
		
	mom = moment.apply(null, args);

	return mom.format(settings.format);
};

PS.Formatter.fn.chart = function () {
	var settings = this.getSettings();

	(function ($el, settings) {
		_.defer(function () {
			$el.sparkline(settings.value.split(","), settings);
		});
	})(this.$el, settings);
};

PS.Formatter.fn.arrow = function () {
	var num = +this.formatValue,
		isNum = !(num == null || isNaN(num)),
		settings = this.getSettings();
		
	if (!isNum) {
		return "&nbsp;";
	}
	
	if (num === 0) {
		return "&nbsp;";
	}
	
	if (num > 0 && settings.orientation === 1) {
		settings.arrow = "&#327;"; // up
	} else {
		settings.arrow = "&#328;"; // down
	}
	
	settings.arrow = _.template(settings.arrowTemplate, settings);
	
	return settings.arrow;
};

PS.Formatter.fn.bulb = function () {
	var settings = this.getSettings();
	
	settings.bulb = "&#288;"; // filled circle
	
	settings.bulb = _.template(settings.bulbTemplate, settings);
	
	return settings.bulb;
};
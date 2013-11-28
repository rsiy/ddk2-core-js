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

PS.Formatter.list = [];
PS.Formatter.register = function(settings) {
	PS.Formatter.list.push({
		id: settings.id,
		text: settings.text,
		sortOrder: settings.sortOrder
	});
	
	PS.Formatter.list.sort(function (a, b) {
		return a.sortOrder - b.sortOrder;
	});
	
	PS.Formatter.prototype[settings.id] = settings.formatter;
	PS.Formatter.prototype[settings.id].defaults = settings.defaults || {};		
};

PS.Formatter.register({
	id: "text",
	text: "Text",
	sortOrder: 10,
	formatter: function () {
		return _.escape(this.formatValue);
	}
});

PS.Formatter.register({
	id: "html",
	text: "HTML",
	sortOrder: 100,
	formatter: function () {
		return this.formatValue;
	}
});

PS.Formatter.register({
	id: "number",
	text: "Number",
	sortOrder: 20,
	defaults: {
		precision: 0
	},
	formatter: function () {
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
	}
});
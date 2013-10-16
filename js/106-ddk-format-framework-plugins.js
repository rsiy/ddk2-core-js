$.extend(true, DDK.format, {
	sparkline: function(elem) {
		var $elem = $(elem);
		// console.log("sparkline", elem);
		$elem.sparkline();
	},
	/* demotargetresult DDK Format Framework plugin
	*
	* data-color: valid css color string
	*
	*/
	democomparisonresult: function(elem) {
		var $elem = $(elem),
			color = $elem.data("color") || "green";

		//console.log($elem, color);
		$elem.replaceWith("<span class=\"ddk-icon\" style=\"color: " + color + ";\">&#288;</span>"); // &#288; is the record icon as in play/record of sound
	},
	/* demovalue DDK Format Framework plugin
	*
	* data-precision: integer (number of digits to display after the decimal)
	* data-units: units string (appended to formatted number string)
	*	units generate special unit/value formatting for the following units:
	*	dollars - $ <value>
	*	percent - <value> %
	*	seconds - hh:mm:ss
	*	minutes - hh:mm
	*
	*/
	demovalue: function(elem) {
		var $elem = $(elem),
			precision = parseInt($elem.data("precision")) || 0,
			units = $elem.data("units") || "";

		// handle null parameter values (that still have tildes: ~TIMEPERIOD_UNITS~)
		if (units.indexOf(String.fromCharCode(126)) > -1) { units = ""; }

		$elem.html(function(index, value) {
			var newValue = +value,
				hasValue = !_.isNaN(newValue),
				duration;
			
			//console.log(value, newValue, hasValue, precision, units);

			if (hasValue) {
				if (units === "percent") {
					newValue = numeral(newValue).format("0,0" + (precision ? "." + DDK.util.stringRepeat("0", precision) : ""));
					units = "%";
				} else if (units === "dollars") {
					newValue = numeral(newValue).format("0,0" + (precision ? "." + DDK.util.stringRepeat("0", precision) : ""));
					units = "$";
				} else if (units === "seconds") {
					duration = moment.duration(newValue, 'seconds');
					newValue = DDK.util.trunc(duration.asHours())
						+ ":"
						+ ( duration.minutes().toString().length > 1 ? duration.minutes() : "0" + duration.minutes() )
						+ ":"
						+ ( duration.seconds().toString().length > 1 ? duration.seconds() : "0" + duration.seconds() );
					units = "";
				} else if (units === "minutes") {
					duration = moment.duration(newValue, 'minutes');
					newValue = DDK.util.trunc(duration.asHours())
						+ ":"
						+ ( duration.minutes().toString().length > 1 ? duration.minutes() : "0" + duration.minutes() );
					units = "";
				} else {
					newValue = numeral(newValue).format("0,0" + (precision ? "." + DDK.util.stringRepeat("0", precision) : ""));
				}
			}

			if (units) {
				if (units === "$") {
					$elem.before("<span>" + units + "</span>");
				} else {
					$elem.after("<span>" + units + "</span>");
				}
			}

			// return the newValue if we were able to parse the value as a float
			// else return the unmodified original value
			return (hasValue ? newValue : value);
		});

		$elem.closest(".ddk-bam-content").css("white-space", "nowrap");
	},
	/* democompare DDK Format Framework plugin
	*
	* data-precision: integer (number of digits to display after the decimal)
	* data-units: units string (appended to formatted number string)
	*
	* data-direction: integer (-1, 0, 1)
	*	1: increase in value is shown as up
	*  -1: decrease in value is shown as up
	*   0: no indicator is shown
	* data-color: +color,-color
	*	red/green/blue/orange/black/white/grey/lightgrey
	*	so this takes values like red,green or green,red
	*/
	democompare: function(elem) {
		var $elem = $(elem),
			precision = parseInt($elem.data("precision")) || 0,
			units = $elem.data("units") || "",
			direction = parseInt($elem.data("orientation")) || 1,
			color = $elem.data("color") || "green,red",
			style = $elem.data("style");

		$elem.html(function(index, value) {
			var $this = $(this),
				values = value.split(","),
				currValue = parseFloat(_.last(values)),
				prevValue = parseFloat(_.first(values)),
				compare = 100 * (currValue - prevValue) / prevValue,
				compareIndex = compare > 0 ? 0 : 1,
				compareSign  = compare > 0 ? "+" : "-",
				colors = color.split(","),
				indicator = "";

			if (direction === 1) {
				if (compareIndex === 0) {
					indicator = "&#327;"; // up
				} else {
					indicator = "&#328;"; // down
				}
			} else if (direction === 0) {
				indicator = ""; // nothing
			} else if (direction === -1) {
				if (compareIndex === 0) {
					indicator = "&#328;"; // down
				} else {
					indicator = "&#327;"; // up
				}
			}

			//console.log(values, compareIndex, direction, indicator);
			//return prevValue && compare && prevValue !== currValue ?compareSign+ Math.abs(compare).toFixed(precision).toString()+ "<img src=imgs\\widgets\\arrows\\16x16\\arrow_" + colors\[compareIndex\] + "_" + directions\[compareIndex\] + ($elem.data("style") === "triangle" ? "" : "") + ".gif> " : "-";
			if (prevValue && compare && (prevValue !== currValue)) {
				$this.after("<span class=\"ddk-icon\" style=\"color: " + colors[compareIndex] + ";\">" + indicator + "</span>");
				return DDK.util.trunc(compare, precision) + "%";
			} else {
				return "-";
			}
		});

		$elem.closest(".ddk-bam-content").css("white-space", "nowrap");
	},
	demobar: function(elem) {
		var $elem = $(elem);

		$elem.replaceWith(function() {
			var $this = $(this),
				values = $this.html().split(","),
				metricValue = parseFloat(values[0], 10),
				maxValue = parseFloat(values[1], 10),
				normValue = (100 * metricValue / maxValue) || 0;

			//console.log("demobar:", metricValue, maxValue, normValue);

			return "<div class=\"ddk-format-bar-elem\" style=\"width: " + normValue + "%;\"></div>";
		});
	},
	demotrend: function(elem) {
		var $elem = $(elem),
			$container = $elem.closest(".ddk-bam-content"),
			containerType = ($elem.parents("table").size() ? "table" : "bamset");
		// console.log("sparkline", elem);

		if (!$container.size()) { $container = $elem.parent(); }
		//console.log("demotrend: ", $container[0], " ", $elem.html());
		setTimeout(function() {
			$elem.sparkline(
				$elem.html().split(","),
				{
					lineColor: "#5AA6FF", //"#C2DEFF",
					fillColor: "",
					spotColor: "",
					maxSpotColor: "",
					minSpotColor: "",
					lineWidth: (containerType === "table" ? 2 : 4),
					height: (containerType === "table" ? "26px" : ($container.height() * 0.95) + "px"),
					width: (containerType === "table" ? "80px" : ($container.width() * 0.95) + "px")
				}
			);
		}, 0);
	},
	minichart: function(elem) {
		var $elem = $(elem),
			data = $elem.data(),
			$bamContent = $elem.closest(".ddk-bam-content"),
			$container = $bamContent.size() ? $bamContent : $elem.parent(),
			containerType = ($elem.parents("table").size() ? "table" : "bamset"),
			options = {
				width: (containerType === "table" ? "80px" : ($container.width() * 0.95) + "px")
			},
			hasTarget = (!_.isNaN(parseInt(data.target, 10))),
			values = (!_.isNaN(parseInt(data.value, 10))) && (typeof data.value === "number" ? [] : _.map(data.value.split(","), function (val) { return +val; })),
			targets = hasTarget && (typeof data.target === "number" ? [] : _.map(data.target.split(","), function (val) { return +val; })),
			chartRangeMin,
			chartRangeMax,
			barSpacing = 5,
			typeOptions = {
				bullet: {
					type: "bullet",
					performanceColor: data.result,
					targetColor: "#888",
					height: (containerType === "table" ? "16px" : ($container.height() * 0.95) + "px")
				},
				line: {
					type: "line",
					lineColor: "#5AA6FF", //"#C2DEFF",
					fillColor: "",
					spotColor: "",
					maxSpotColor: "",
					minSpotColor: "",
					lineWidth: (containerType === "table" ? 2 : 4),
					height: (containerType === "table" ? "26px" : ($container.height() * 0.95) + "px")
				},
				bar: {
					type: "bar",
					barColor: "#5AA6FF",
					height: (containerType === "table" ? "22px" : ($container.height() * 0.95) + "px"),
					barSpacing: barSpacing,
					barWidth: (parseInt(options.width, 10) - ((values.length - 1) * barSpacing)) / values.length
				},
				target: {
					type: "line",
					lineColor: "#CCC",
					fillColor: "",
					spotColor: "",
					maxSpotColor: "",
					minSpotColor: "",
					lineWidth: (containerType === "table" ? 1.5 : 2),
					height: (containerType === "table" ? "26px" : ($container.height() * 0.95) + "px")
				}
			};
		
		DDK.log("DDK.format.minichart()", elem, data);
		
		if (hasTarget && !targets.length) {
			_.each(values, function () {
				targets.push(data.target);
			});
		}

		if (hasTarget) {
			chartRangeMin = Math.min(_.min(values), _.min(targets));
			chartRangeMax = Math.max(_.max(values), _.max(targets));
		} else {
			chartRangeMin = _.min(values);
			chartRangeMax = _.max(values);		
		}
		
		//console.log("demotrend: ", $container[0], " ", $elem.html());
		setTimeout(function() {
			if (hasTarget && (data.type === "line" || data.type === "bar")) {
				$elem.sparkline(
					targets,
					_.extend({}, options, typeOptions.target, { chartRangeMin: chartRangeMin, chartRangeMax: chartRangeMax })
				);
			}
			
			$elem.sparkline(
				values,
				_.extend({}, options, typeOptions[data.type], { chartRangeMin: chartRangeMin, chartRangeMax: chartRangeMax }, (hasTarget && (data.type === "line" || data.type === "bar") ? { composite: true } : {}))
			);
		}, 0);
	}
});
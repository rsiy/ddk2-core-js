DDK.reloadFromFavorite = function (target, favoriteId, callback, beforeInit, beforeReload) {
	// target could be a DOM node, a jQuery selector, or a jQuery collection
	var $target = $(target),
		dataConfig = {
			queryWidget: "PSC_Favorites_Record_Query",
			useCoercedTypes: false,
			datasetMode: "array"
		},
		ajaxSettings = {
			type: "POST",
			url: "amengine.aspx",
			dataType: "json",
			data: {
				"config.mn": "DDK_Data_Request"
			},
			success: function (data) {
				var dataset = data && data.datasets && data.datasets[0],
					record =  dataset && dataset[0],
					originalControlId = record && record.sci_fav_ext_id3,
					originalFavName = record && record.sci_fav_name.split && record.sci_fav_name.split(","),
					originalFavId = record && record.sci_fav_id,
					originalControlOptions = originalFavName && originalFavName[4],
					originalControlName = originalFavName && originalFavName[3],
					originalFavValue = record && record.sci_fav_value,
					newControlId = originalControlName && originalControlName + originalFavId,
					newFavValue = originalFavValue && originalFavValue.replace(RegExp(originalControlId, "g"), newControlId),
					newKeys = newFavValue ? newFavValue.split("&") : [],
					dataKeywords = "";

				if (originalFavId && originalControlName && originalControlOptions && newControlId) {
					// parse new favorite value
					// keyword update all state keywords (s_)
					// add all other keywords to the control container's data-keywords attribute
					_.each(newKeys, function (value, index) {
						if (_.string.startsWith(value, "s_")) {
							K(value);
						} else {
							dataKeywords += "&" + value;
						}
					});
					$target.empty().html("<div style='height: 100%; width: 100%;' id='psc_" + originalControlName + "_" + newControlId + "_widget' data-options='" + originalControlOptions + "' data-keywords=\"" + dataKeywords + "\"></div>");
					DDK.reloadControl(originalControlName, newControlId, callback, beforeInit, beforeReload);
				} else {
					DDK.error("DDK.reloadFromFavorite(): cannot parse favorite id " + favoriteId);
				}			
			}
		};

	// target could be an id string
	if (!$target.size()) { $target = $("#" + target); }

	// exit with a warning if the target cannot be found
	if (!$target.size()) {
		DDK.warn("DDK.reloadFromFavorite(): target not found.");
		return;
	}

	// if there is no favoriteId supplied, check the target for a data-favorite-id attribute
	if (!favoriteId) {
		favoriteId = $target.data("favoriteId");
	}
	
	// Exit with an error if favoriteId does not evaluate to a positive number
	// or is not a name
	if (!(+favoriteId > 0)) {
		if (typeof favoriteId !== "string" || favoriteId === "") {
			DDK.error("DDK.reloadFromFavorite(): invalid favoriteId. " + favoriteId + "\nMust be a positve number or a string.");
			return;
		}
	}
	
	// use keyword ddk.fav.id for favoriteId
	ajaxSettings.data["ddk.fav.id"] = favoriteId;
	ajaxSettings.data["data.config"] = JSON.stringify(dataConfig);
	
	// get favorite data
	$.ajax(ajaxSettings);
}

DDK.reloadControl = function (controlName, controlId, callback, beforeInit, beforeReload) {
	var controlTitle = _.string.capitalize(controlName),
		controlContainerId = "psc_" + controlName + "_" + controlId + "_widget",
		options,
		$control = $("#" + controlContainerId),
		controlData = $control.data() || {},
		re = new RegExp(controlId,'g');
		
	// register error if controId contains any uppercase characters or underscore characters
	if (!/^[a-z][a-z0-9]*$/.test(controlId)) {
		DDK.error("Invalid control id: " + controlId + "\n" + 
			"Control ids should begin with a lowercase letter and should contain only numbers and lowecase letters.\n" + 
			"Uppercase letters and underscore characters will cause errors in many control interactions.");
	};

	// initialize custom control options object
	DDK[controlName].data[controlId] = DDK[controlName].data[controlId] || {};
	// cache options for this function
	options = DDK[controlName].data[controlId];

	// cache the callback, beforeInit, and beforeReload functions
	// to custom control options, or grab them from custom control options
	// if they are not passed to this function
	if (callback) {
		DDK[controlName].data[controlId].callback = callback;
	} else if (options.callback) {
		callback = options.callback;
	}
	if (beforeInit) {
		DDK[controlName].data[controlId].beforeInit = beforeInit;
	} else if (options.beforeInit) {
		beforeInit = options.beforeInit;
	}
	if (beforeReload) {
		DDK[controlName].data[controlId].beforeReload = beforeReload;
	} else if (options.beforeReload) {
		beforeReload = options.beforeReload;
	}

	// if a control container is found, load the control
	// else, warn that the container is not found
	if ($control.size()) {
		DDK.pdfCount += 1;

		K({
			id: controlId,
			init_widget: K("s_" + controlId + "_iw") || K(controlName + "__" + controlId + "_init_widget") || controlData.options,
			container_height: options.height || $control.height() || 0,
			container_width: options.width || $control.width() || 0
		}, controlName + "_");

		if (controlName === "bamset" || controlName === "scorecard") {
			K("s_" + controlId + "_mdt", K("s_" + controlId + "_mdt") || JSON.stringify(
				$.extend(true, {}, DDK.template.metricDisplay, (options.customMetricDisplayTemplate) || {})
			).replace(/'/g, "\\'").replace(/"/g, "'"));
		}

		// grab the data-keywords from the control container, and merge them
		// into any existing `s_<id>_keywords` keyword value
		var oldKeys = _.zipObject(_.map(decodeURIComponent(K("s_" + controlId + "_keywords") || "").split("&"), function (value) {
			return value.split("=");
		}));

		var newKeys = _.zipObject(_.map(controlData.keywords ? controlData.keywords.split("&") : [], function (value) {
		  var pair = value.split("=");
		  return [ pair[0], decodeURIComponent(pair[1]) ];
		}));

		K("s_" + controlId + "_keywords", _.reduce(_.extend({}, oldKeys, newKeys), function (memo, value, key) {
			return memo + (key ? "&" + key + "=" + (value ? encodeURIComponent(value) : "") : "");
		}, ""));

		$("body").children(".ps-tooltip-dialog").not(".ddk-dialog-persist").remove();

		if (typeof options.beforeReload === "function") {
			options.beforeReload(controlName, controlId);
		}
		run(controlContainerId, "PSC_" + controlTitle + "_Widget", function (data, header, id) {
			if (typeof options.beforeInit === "function") {
				options.beforeInit(controlName, controlId);
			}
			DDK[controlName].init(controlId);
			if (typeof callback === "function") {
				callback(controlName, controlId);
			}
		}, { 
			stateFilter: "s_" + controlId + "_"
		});
	} else {
		DDK.warn(controlTitle + " Control Reload: " + controlId + " not found.");
	}
};
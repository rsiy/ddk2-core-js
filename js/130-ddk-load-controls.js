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
				"config.mn": "DDK_Control_Data_Request"
			},
			success: function (data) {
				var control = data && data.controls && data.controls[0],
				    errorMessage = data && data.errorMessage,
				    controlContainerId = control && control.controlContainerId,
				    controlName = control && control.controlName,
				    controlId = control && control.controlId,
				    controlOptions = control && control.controlOptions,
				    $control = $("#" + controlContainerId),
				    controlHtml = (control && control.controlHtml)? _.unescape(control.controlHtml) : "",
				    controlFavVal = control && control.controlFavValue,
				    controlData = $control.data() || {},
				    options,
				    containerWidth = $control.width(),
				    containerHeight = $control.height();
					
				if (errorMessage) {
					DDK.error("AMEngine Server JavaScript Error: ", errorMessage);
				} 
				else if ($control.size()) {
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
					// if using data-aspect-ratio, set control container height based on the width
					if (controlData.aspectRatio) {
						containerHeight = containerWidth / controlData.aspectRatio;
						$control.height(containerHeight);
					}

					DDK.defer(function () {
						var subTarget = "psc_" + controlName + "_" + controlId + "_widget",
						    //add class attr if controlName = table to fix issue when resizing window
						    divHtml = "<div style='height: 100%; width: 100%;' id='" + subTarget + "' data-options='" + controlOptions + "' data-keywords=\"" + controlFavVal + "\" " + (controlName === "table"? " class='ps-content-row'" : "") + "></div>";
						hideMask(target);
						$("body").children(".ps-tooltip-dialog").not(".ddk-dialog-persist").remove();
						$target.empty().html(divHtml).find("#"+subTarget).html(controlHtml);

						reloadControlContainer(controlName, controlId, options, callback, $control);
					});
				}
			}
		};

	// target could be an id string
	if (!$target.size()) { $target = $("#" + target); }

	// exit with a warning if the target cannot be found
	if (!$target.size()) {
		DDK.warn("DDK.reloadFromFavorite(): target not found.");
		return;
	} else if (!$target.isControl()) {
		DDK.warn("DDK.reloadFromFavorite(): target is not a control element.");
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

	//include K.toObject values to ajaxSettings.data
	_.each(_.omit(K.toObject(), function (value, key) { 
		return _.string.startsWith(key, "sec.") || (_.string.startsWith(key, "s_")); 
	}), function(value, key) {
		if (key !== "table_id" && key !=="scorecard_id")
			ajaxSettings.data[key] = value;
	});

	// get favorite data
	$.ajax(ajaxSettings);
}

DDK.reloadControl = function (controlName, controlId, callback, beforeInit, beforeReload) {
	var controlTitle = _.string.capitalize(controlName),
		controlContainerId = "psc_" + controlName + "_" + controlId + "_widget",
		options,
		$control = $("#" + controlContainerId),
		controlData = $control.data() || {},
		re = new RegExp(controlId,'g'),
		containerHeight,
		containerWidth;
		
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
		
		containerWidth = $control.width();
		containerHeight = $control.height();
		
		// if using data-aspect-ratio, set control container height based on the width
		if (controlData.aspectRatio) {
			containerHeight = containerWidth / controlData.aspectRatio;
			$control.height(containerHeight);
		}

		K({
			id: controlId,
			init_widget: K("s_" + controlId + "_iw") || K(controlName + "__" + controlId + "_init_widget") || controlData.options,
			container_height: options.height || containerHeight || 0,
			container_width: options.width || containerWidth || 0
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
			reloadControlContainer(controlName, controlId, options, callback, $control);
		}, { 
			stateFilter: "s_" + controlId + "_"
		});
	} else {
		DDK.warn(controlTitle + " Control Reload: " + controlId + " not found.");
	}
};

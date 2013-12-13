PS.Toolbar = new PS.MC.Models.OptionGroup();

// Toolbar init
$(document).on("mouseenter", "[data-toolbar]", function (e) {
	var $target = $(e.currentTarget),
		isInitialized = $target.hasClass("toolbar-initialized"),
		options = {
			suppress: false,
			position: {
				my: "top center",
				at: "bottom center",
				adjust: {
					y: -4
				},
			},
			content: {
				text: "" // placeholder for generated content
			},
			show: {
				effect: false,
				event: "click"
			},
			hide: {
				effect: false,
				event: "click"
			},
			style: {
				classes: "ui-tooltip-bootstrap ui-tooltip-rounded toolbar"
			}
		};
	
	options.content.text = $target.siblings(".toolbar-content." + $target.data("toolbar"));
	
	if ($target.parents().hasClass("toolbar-content")) {
		// sub-toolbars will hide on unfocus and click
		options.hide.event = "unfocus click";

		options.events = {
			// clicking any button will hide the sub-toolbar
			render: function (e, api) {
				api.elements.content.on("click", "button", function (e) {
					api.hide();
				});
			}
		};
		
	} else {
		// top-level toolbars will hide all others
		options.show.solo = true;
		
		// top-level toolbars have a close button
		options.content.button = "Close";
	}
	
	if (!isInitialized) {
		$target.addClass("toolbar-initialized");
		
		$target.qtip(options);
	}
});

// Label init
$(document).on("mouseenter", "[data-label]", function (e) {
	var $target = $(e.currentTarget),
		isInitialized = $target.hasClass("label-initialized");
	
	if (!isInitialized) {
		$target.addClass("label-initialized");
		
		$target.qtip({
			position: {
				my: "bottom center",
				at: "top center",
				adjust: {
					y: -6
				}
			},
			content: {
				text: $target.data("label")
			},
			show: {
				effect: false,
				delay: 500,
				event: "mouseover"
			},
			style: {
				classes: "qtip-dark qtip-rounded toolbar caption"
			}
		});
		
		$target.trigger("mouseover");
	}
});
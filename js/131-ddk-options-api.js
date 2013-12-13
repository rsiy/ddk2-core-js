// Scorecard2 Options API
DDK.scorecard2.optionsAPI = {};
DDK.scorecard2.optionsAPI.config = {
	"id": "scorecard_config_settings",
	"label": "Scorecard Configuration Settings",
	"description": "Settings for configuration of Scorecard and Build Scorecard Dialog.",
	"dialog": {
		"id": "scorecard_config_dialog_settings",
		"label": "Scorecard Configuration Dialog Settings",
		"description": "Settings for controlling the Build Scorecard Dialog.",
		"options": {
			"isSortable": {
				"id": "is_sortable",
				"label": "Sortable",
				"description": "If `true`, will generate a sortable scorecard.",
				"notes": "Sets the value of the scorecard 'sort.enabled' option.",
				"displayType": "checkbox"
			},
			
			"isGrouped": {
				"id": "is_grouped",
				"label": "Grouped",
				"description": "If `true`, will generate a grouped scorecard.",
				"notes": "Enables the scorecard 'grouping.key' option to have a value.",
				"displayType": "checkbox"
			},
			
			"groupingKey": {
				"id": "grouping_key",
				"label": "Grouping Field",
				"abbr": "by",
				"description": "If 'is_grouped' is `true`, will generate a grouped scorecard.",
				"notes": "If 'is_grouped' is `true`, will set the value of the scorecard 'grouping.key' option.",
				"displayType": "text abbr"
			},
			
			"isAdvancedEditor": {
				"id": "is_advanced_editor",
				"label": "Toggle Advanced Configuration Editor",
				"description": "If `true`, will generate a JSON editor for the scorecard 'config' option.",
				"notes": "Controls the configuration editor state.",
				"displayType": "checkbox button icon",
				"icon": "&#311;"
			}
		}
	},
	"config": {
		"id": "scorecard_config_object_settings",
		"label": "Scorecard Configuration Object Settings",
		"description": "Settings for controlling the top-level scorecard configuration object.",
		"options": {
			"tableAttr": {
				"id": "table_attr",
				"label": "Table Attributes",
				"description": "Attributes rendered on the scorecard table element.",
				"notes": ""
			},
			
			"tableClassName": {
				"id": "table_class_name",
				"label": "Table Classes",
				"description": "Classes rendered on the scorecard table element.",
				"notes": ""
			}
		}
	}
};

DDK.scorecard2.optionsAPI.columnConfig = {
	"id": "scorecard_column_config_settings",
	"label": "Scorecard Column Configuration Settings",
	"description": "Settings for configuration of Scorecard Columns in the Build Scorecard Dialog.",
	"dialog": {
		"id": "scorecard_column_config_dialog_settings",
		"label": "Scorecard Column Configuration Dialog Settings",
		"description": "Settings for controlling the Build Scorecard Dialog's Column popup.",
		"options": {
			"headerStyle": {
				"id": "header_style",
				"label": "Header Style",
				"description": "Toggle header between Title/Subtitle configuration and custom format.",
				"notes": ""
			}
		}
	},
	"config": {
		"id": "scorecard_column_config_object_settings",
		"label": "Scorecard Column Configuration Object Settings",
		"description": "Settings for controlling scorecard column configuration objects.",
		"options": {
			"prefix": {
				"id": "prefix",
				"label": "Metric / Dimension",
				"description": "",
				"notes": ""
			},
			
			"title": {
				"id": "title",
				"label": "Title",
				"description": "",
				"notes": ""
			},

			"subtitle": {
				"id": "subtitle",
				"label": "Subtitle",
				"description": "",
				"notes": ""
			},

			"attr": {
				"id": "attr",
				"label": "Attributes",
				"description": "",
				"notes": ""
			},

			"className": {
				"id": "class_name",
				"label": "Classes",
				"description": "",
				"notes": ""
			},

			"sortValue": {
				"id": "sort_value",
				"label": "",
				"description": "",
				"notes": ""
			}
		}
	}
};

_.each([
	{ id: "body", title: "Body", suffix: "Body", tagName: "td" },
	{ id: "header", title: "Header", suffix: "Header", tagName: "th" },
	{ id: "footer", title: "Footer", suffix: "Footer", tagName: "th" },
	{ id: "group", title: "Group Header", suffix: "Group", tagName: "th" }
], function (rowType) {
	var configOptions = DDK.scorecard2.optionsAPI.config.config.options,
		dialogOptions = DDK.scorecard2.optionsAPI.config.dialog.options,
		columnConfigOptions = DDK.scorecard2.optionsAPI.columnConfig.config.options,
		columnDialogOptions = DDK.scorecard2.optionsAPI.columnConfig.dialog.options;
		
	// row config
	configOptions[rowType.id + "RowAttr"] = {
		"id": rowType.id + "_row_attr",
		"label": rowType.title + " Attributes",
		"description": "HTML attributes rendered on each " + rowType.title + " row tr element.",
		"notes": ""
	};
	configOptions[rowType.id + "RowClassName"] = {
		"id": rowType.id + "_row_class_name",
		"label": rowType.title + " Classes",
		"description": "Classes rendered on each " + rowType.title + " row tr element.",
		"notes": ""
	};
	
	// column config
	columnConfigOptions[rowType.id + "Attr"] = {
		"id": rowType.id + "_attr",
		"label": rowType.title + " Attributes",
		"description": "HTML attributes rendered on each " + rowType.tagName + " element in each " + rowType.title + " row.",
		"notes": ""
	};
	columnConfigOptions[rowType.id + "ClassName"] = {
		"id": rowType.id + "_class_name",
		"label": rowType.title + " Classes",
		"description": "Classes rendered on each " + rowType.tagName + " element in each " + rowType.title + " row.",
		"notes": ""
	};
	
	// column dialog
	if (rowType.id !== "body") {
		columnDialogOptions["show" + rowType.suffix] = {
			"id": "show_" + rowType.id,
			"label": rowType.title,
			"description": "Shows the dialog config section for the " + rowType.title + " row.",
			"notes": ""
		};
	}
	
	// column section
	_.each([
		{ id: "content", title: "Content" },
		{ id: "header", title: "Header" },
		{ id: "footer", title: "Footer" }
	], function (sectionType) {
		var idPrefix = rowType.id + "_" + sectionType.id + "_",
			labelPrefix = rowType.title + " " + sectionType.title + " ",
			propertyPrefix = rowType.id + sectionType.title;
		
		// config
		columnConfigOptions[propertyPrefix + "Attr"] = {
			"id": idPrefix + "attr",
			"label": labelPrefix + "Attributes",
			"description": "HTML attributes rendered on each div." + sectionType.id + " element in each " + rowType.title + " row.",
			"notes": ""
		};
		columnConfigOptions[propertyPrefix + "ClassName"] = {
			"id": idPrefix + "class_name",
			"label": labelPrefix + "Classes",
			"description": "Classes rendered on each div." + sectionType.id + " element in each " + rowType.title + " row.",
			"notes": ""
		};
		columnConfigOptions[propertyPrefix + "Value"] = {
			"id": idPrefix + "value",
			"label": labelPrefix + "Value",
			"description": "Sets the data-format-value attribute on each div." + sectionType.id + " element in each " + rowType.title + " row.",
			"notes": ""
		};
		columnConfigOptions[propertyPrefix + "Format"] = {
			"id": idPrefix + "format",
			"label": labelPrefix + "Format",
			"description": "Sets the data-format attribute on each div." + sectionType.id + " element in each " + rowType.title + " row.",
			"notes": ""
		};
		columnConfigOptions[propertyPrefix + "Style"] = {
			"id": idPrefix + "style",
			"label": "Format Style",
			"description": "Sets the data-format-style attribute on each div." + sectionType.id + " element in each " + rowType.title + " row.",
			"notes": ""
		};
		
		// dialog
		if (sectionType.id !== "content") {
			columnDialogOptions["show" + rowType.suffix + sectionType.title] = {
				"id": "show_" + rowType.id + "_" + sectionType.id,
				"label": sectionType.title,
				"description": "Shows the dialog config section for the " + rowType.title + " row " + sectionType.title + " section.",
				"notes": ""
			};
		}
	});
});
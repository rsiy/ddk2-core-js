DDK.template.metricDisplay = {
	currentValue: {
		displayLabel: "Current Value",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='{{value}}' data-units='{{units}}' data-precision='{{precision}}'",
					spanFormat: {
						type: "demovalue"
					},
					spanValue: "{{value}}"
				}
			}
		},
		displayTitle: ""
	},
	abbreviation: {
		displayLabel: "Name (abbreviation)",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='{{abbr}}' data-units='{{units}}' data-precision='{{precision}}'",
					spanFormat: {
						type: "demovalue"
					},
					spanValue: "{{abbr}}"
				}
			}
		},
		displayTitle: ""
	},
	bar: {
		displayLabel: "Current Value (bar)",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='{{value}}'",
					spanFormat: {
						type: "demobar"
					},
					spanValue: "{{value}},{{valueMax}}"
				}
			}
		},
		displayTitle: ""
	},
	metricName: {
		displayLabel: "Name",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='{{name}}'",
					spanValue: "{{name}}"
				}
			}
		},
		displayTitle: "Metric"
	},
	percentChangeTotal: {
		displayLabel: "Percent Change (overall)",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='FN: var trend = \\\[{{trend}}\\\]; return trend\\\[trend.length - 1\\\] / trend\\\[0\\\];' data-precision='{{precision}}' data-orientation='{{orientation}}' data-color='{{color}}'",
					spanFormat: {
						type: "democompare"
					},
					spanValue: "{{trend}}"
				}
			}
		},
		displayTitle: "Overall Change"
	},
	percentChangeLast: {
		displayLabel: "Percent Change (from previous value)",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='FN: return {{value}} / {{prevValue}};' data-precision='{{precision}}' data-orientation='{{orientation}}' data-color='{{color}}'",
					spanFormat: {
						type: "democompare"
					},
					spanValue: "{{prevValue}},{{value}}"
				}
			}
		},
		displayTitle: "Change"
	},
	previousValue: {
		displayLabel: "Previous Value",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='{{prevValue}}' data-units='{{units}}' data-precision='{{precision}}'",
					spanFormat: {
						type: "demovalue"
					},
					spanValue: "{{prevValue}}"
				}
			}
		},
		displayTitle: "Previous"
	},
	comparisonResult: {
		displayLabel: "Comparison Result",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "sort='{{result}}' data-color='{{result}}'",
					spanFormat: {
						type: "democomparisonresult"
					},
					spanValue: "{{result}}"
				}
			}
		},
		displayTitle: ""
	},
	trend: {
		displayLabel: "Chart - Line",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "data-type='line' data-target='{{target}}' data-value='{{trend}}' sort='{{value}}'",
					spanFormat: {
						type: "minichart"
					},
					spanValue: " "
				}
			}
		},
		displayTitle: ""
	},
	bullet: {
		displayLabel: "Chart - Bullet",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "data-type='bullet' data-result='{{result}}' data-value='{{target}},{{value}}' sort='{{value}}'",
					spanFormat: {
						type: "minichart"
					},
					spanValue: " "
				}
			}
		},
		displayTitle: ""
	},
	minicolumns: {
		displayLabel: "Chart - Columns",
		displayLayout: {
			bamContent: {
				bamsectionSpan: {
					spanAttr: "data-type='bar' data-target='{{target}}' data-value='{{trend}}' sort='{{value}}'",
					spanFormat: {
						type: "minichart"
					},
					spanValue: " "
				}
			}
		},
		displayTitle: ""
	}
};
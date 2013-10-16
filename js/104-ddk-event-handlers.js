$(document).on("click", "button.ddk-chart-series-config", DDK.chart.seriesConfig);
$(document).on("click", "input.ddk-color:not(.loaded)", DDK.initColorPicker);
$(document).on("click", "button[data-ddk-dialog]", DDK.dialog);
$(document).on("click", "button[data-ddk-button-action]", DDK.eventHandler);
$(document).on("change keyup", "input[data-ddk-validate], textarea[data-ddk-validate]", DDK.validate);
$(document).on("click", ".ddk-dropdown", DDK.dropdown.show);
$(document).on("click", DDK.dropdown.hide);
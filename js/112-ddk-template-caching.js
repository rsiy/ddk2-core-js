$(document).ready(function () {
	$.extend(true, DDK.scorecard, {
		template: {
			empty: _.template($("#scorecard_empty").html())
		}
	});
	$.extend(true, DDK.bamset, {
		template: {
			empty: _.template($("#bamset_empty").html())
		}
	});
});

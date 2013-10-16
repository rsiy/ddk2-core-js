/*
 * Plug-in API Extensions for DataTables
 *
 */


/*
 * Function: fnGetColumnIndex
 * Purpose:  Return an integer matching the column index of passed in string representing sTitle
 * Returns:  int:x - column index, or -1 if not found
 * Inputs:   object:oSettings - automatically added by DataTables
 *           string:sCol - required - string matching the sTitle value of a table column
 */
$.fn.dataTableExt.oApi.fnGetColumnIndex = function ( oSettings, sCol )
{
	var cols = oSettings.aoColumns;
	for ( var x=0, xLen=cols.length ; x<xLen ; x++ )
	{
		if ( cols[x].sTitle.toLowerCase() == sCol.toLowerCase() )
		{
			return x;
		};
	}
	return -1;
}


/*
 * Function: fnGetDisplayNodes
 * Purpose:  Return an array with the TR nodes used for displaying the table
 * Returns:  array node: TR elements
 *           or
 *           node (if iRow specified)
 * Inputs:   object:oSettings - automatically added by DataTables
 *           int:iRow - optional - if present then the array returned will be the node for
 *             the row with the index 'iRow'
 */
$.fn.dataTableExt.oApi.fnGetDisplayNodes = function ( oSettings, iRow )
{
	var anRows = [];
	if ( oSettings.aiDisplay.length !== 0 )
	{
		if ( typeof iRow !== 'undefined' )
		{
			return oSettings.aoData[ oSettings.aiDisplay[iRow] ].nTr;
		}
		else
		{
			for ( var j=oSettings._iDisplayStart ; j<oSettings._iDisplayEnd ; j++ )
			{
				var nRow = oSettings.aoData[ oSettings.aiDisplay[j] ].nTr;
				anRows.push( nRow );
			}
		}
	}
	return anRows;
};

(function($) {
/*
 * Function: fnGetColumnData
 * Purpose:  Return an array of table values from a particular column.
 * Returns:  array string: 1d data array
 * Inputs:   object:oSettings - dataTable settings object. This is always the last argument past to the function
 *           int:iColumn - the id of the column to extract the data from
 *           bool:bUnique - optional - if set to false duplicated values are not filtered out
 *           bool:bFiltered - optional - if set to false all the table data is used (not only the filtered)
 *           bool:bIgnoreEmpty - optional - if set to false empty values are not filtered from the result array
 * Author:   Benedikt Forchhammer <b.forchhammer /AT\ mind2.de>
 */
$.fn.dataTableExt.oApi.fnGetColumnData = function ( oSettings, iColumn, bUnique, bFiltered, bIgnoreEmpty ) {
	// check that we have a column id
	if ( typeof iColumn == "undefined" ) return new Array();

	// by default we only wany unique data
	if ( typeof bUnique == "undefined" ) bUnique = true;

	// by default we do want to only look at filtered data
	if ( typeof bFiltered == "undefined" ) bFiltered = true;

	// by default we do not wany to include empty values
	if ( typeof bIgnoreEmpty == "undefined" ) bIgnoreEmpty = true;

	// list of rows which we're going to loop through
	var aiRows;

	// use only filtered rows
	if (bFiltered == true) aiRows = oSettings.aiDisplay;
	// use all rows
	else aiRows = oSettings.aiDisplayMaster; // all row numbers

	// set up data array
	var asResultData = new Array();

	for (var i=0,c=aiRows.length; i<c; i++) {
		iRow = aiRows[i];
		var aData = this.fnGetData(iRow);
		var sValue = aData[iColumn];

		// ignore empty values?
		if (bIgnoreEmpty == true && sValue.length == 0) continue;

		// ignore unique values?
		else if (bUnique == true && jQuery.inArray(sValue, asResultData) > -1) continue;

		// else push the value onto the result data array
		else asResultData.push(sValue);
	}

	return asResultData;
}}(jQuery));


$.fn.dataTableExt.oApi.fnGetFilteredData = function ( oSettings ) {
	var a = [];
	for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ ) {
		a.push(oSettings.aoData[ oSettings.aiDisplay[i] ]._aData);
	}
	return a;
}



$.fn.dataTableExt.oApi.fnGetFilteredNodes = function ( oSettings )
{
	var anRows = [];
	for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
	{
		var nRow = oSettings.aoData[ oSettings.aiDisplay[i] ].nTr;
		anRows.push( nRow );
	}
	return anRows;
};

jQuery.fn.dataTableExt.oSort["ddk-formatted-asc"] = function(a, b) {
	var $a = $(a),
		$b = $(b),
		aSort = $a.find("[sort]").attr("sort") || 0,
		bSort = $b.find("[sort]").attr("sort") || 0,
		x, y;

		if (_.string.startsWith(aSort, "FN:")) {
			aSort = (Function(aSort.slice(3))());
		}

		if (_.string.startsWith(bSort, "FN:")) {
			bSort = (Function(bSort.slice(3))());
		}

		x = parseFloat(aSort) || aSort;
		y = parseFloat(bSort) || bSort;

	//console.log(x, y);

	return ((x < y) ? -1 : ((x > y) ?  1 : 0));
};

jQuery.fn.dataTableExt.oSort["ddk-formatted-desc"] = function(a, b) {
	var $a = $(a),
		$b = $(b),
		aSort = $a.find("[sort]").attr("sort") || 0,
		bSort = $b.find("[sort]").attr("sort") || 0,
		x, y;

		if (_.string.startsWith(aSort, "FN:")) {
			aSort = (Function(aSort.slice(3))());
		}

		if (_.string.startsWith(bSort, "FN:")) {
			bSort = (Function(bSort.slice(3))());
		}

		x = parseFloat(aSort) || aSort;
		y = parseFloat(bSort) || bSort;

	return ((x < y) ? 1 : ((x > y) ?  -1 : 0));
};

jQuery.fn.dataTableExt.oSort['num-html-asc']  = function(a,b) {
	var x = a.replace( /<.*?>/g, "" );
	var y = b.replace( /<.*?>/g, "" );
	x = parseFloat( x );
	y = parseFloat( y );
	return ((x < y) ? -1 : ((x > y) ?  1 : 0));
};

jQuery.fn.dataTableExt.oSort['num-html-desc'] = function(a,b) {
	var x = a.replace( /<.*?>/g, "" );
	var y = b.replace( /<.*?>/g, "" );
	x = parseFloat( x );
	y = parseFloat( y );
	return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};

jQuery.fn.dataTableExt.oSort['natural-asc']  = function(a,b) {
	return naturalSort(a,b);
};

jQuery.fn.dataTableExt.oSort['natural-desc'] = function(a,b) {
	return naturalSort(a,b) * -1;
};
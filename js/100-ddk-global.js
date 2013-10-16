	function PSC_Resize(name, id, forceReload) {
		DDK[name].resize(id, forceReload);
	}

	function PSC_Reload(name, id) {
		/* $("body").children(".ps-tooltip-dialog").not(".ddk-dialog-persist").remove(); */
		DDK[name].reload(id);
	}


	/*	PureShare Component
	 *	Dynamic Chart
	 *	PSC_Chart_JS
	 */

	function PSC_Chart_Resize(id, forceResize) {
		var options = DDK.chart.data[id] = DDK.chart.data[id] || {};

		var $control = $("#psc_chart_" + id + "_widget"),
			contentBlock = $control.hasClass("ps-content-block"),
			controlHeight = (contentBlock ? $control.height() : 0),
			controlWidth = (contentBlock ? $control.width(): 0),
			isOverResizeThreshold;

		options.height = options.height ? options.height : 0;
		options.width = options.width ? options.width : 0;

		// !options || Math.abs(options.width - controlWidth) > 150 || Math.abs(options.height - controlHeight) > 150
		if (options) {
			//console.log("Width:", options.width, controlWidth, options.width - controlWidth);
			//console.log("Height:", options.height, controlHeight, options.height - controlHeight);
			isOverResizeThreshold = (
				// getting smaller -- smallest threshold, allows for download bar in Chrome without a resize (52px)
				((options.width - controlWidth) > 60) ||
				((options.height - controlHeight) > 60) ||
				// getting bigger -- medium threshold on height, large threshold on width
				((options.width - controlWidth) < -150) ||
				((options.height - controlHeight) < -80)
			);
		} else {
			isOverResizeThreshold = true;
		}

		if ( forceResize || isOverResizeThreshold) {
			DDK.chart.data[id].height = controlHeight;
			DDK.chart.data[id].width = controlWidth;

			DDK.loadControls({
				name: "chart",
				id: id
			});
			// PSC_Chart_Reload(id)
		}
	}

	function PSC_Chart_Delayed_Reload(id) {
		setTimeout(function() { PSC_Chart_Reload(id) }, 300);
	}

	function PSC_Chart_Reload(chartID, callback, beforeInit, beforeReload) {
		DDK.reloadControl("chart", chartID, callback, beforeInit, beforeReload);
	}

	function PSC_Chart_UpdateChart(id, metricsDynamic, metricsStatic) {
		$('#psc_chart_' + id + '_metrics_choose_button').click();

		K({
			md: metricsDynamic,
			se: metricsStatic + "," + metricsDynamic
			//hd: "",
			//hdt: ""
		}, "s_" + id + "_");

		PSC_Chart_Reload(id);
	}

	/* PureShare Component
	 * Dynamic Table
	 * PSC_Table_JS
	 */

	function fixColumnSizing(selector) {
		var   $widget = $(selector)
			, $scroll = $widget.find('.dataTables_scroll')
			, scrollWidth = $scroll.width()
			, $head = $scroll.find('.dataTables_scrollHead table')
			, $body = $scroll.find('.dataTables_scrollBody table')
			, $foot = $scroll.find('.dataTables_scrollFoot table')
		;

		// console.log(selector + '  PRE: ', $widget.width(), scrollWidth, $head.width(), $body.width());

		if (scrollWidth >= ($head.width() - (oldIE ? 20 : 0))) {
			// bumped this from 17px to 22px in DDK 1.9.2 final
			$head.width(scrollWidth - 22);
			$body.width(scrollWidth - 22);
			$foot.width(scrollWidth - 22);
		}

		// console.log(selector + '  POST: ', $widget.width(), scrollWidth, $head.width(), $body.width(), (scrollWidth >= $head.width()));

	}

	function addColumnFilters(id, isServer) {
		var	$widget = $("#psc_table_" + id + "_widget"),
			options = DDK.table.data[id],
			$dataTable = $('#' + id).dataTable(),
			$scrollHead = $('#' + id + '_wrapper .dataTables_scrollHead thead'),
			aoColumns = $dataTable.fnSettings().aoColumns || [],
			filterRow = '<tr>',
			i,
			oColumn;

		if (options.fms || options.fmt) {
			for (i = 0; i < aoColumns.length; i += 1) {
				oColumn = aoColumns[i];
				if (oColumn && oColumn.bVisible !== false) {
					filterRow += fnCreateColumnFilter(id, i, oColumn.sTitle.toUpperCase());
				}
			}
			filterRow += '</tr>';
			if (isServer)
				$scrollHead.children('tr').eq(1).replaceWith(filterRow);
			else
			$scrollHead.append(filterRow);

			}

		// moved this outside the previous if scope so that resize always happens as needed (http://jira.pureshare.com/jira/browse/PSDDK-308)
		if ($widget.hasClass('ps-content-block')) {
			PSC_Table_Resize(id);
		} else if ( options.table.oSettings ) {
			options.table.fnAdjustColumnSizing();
		}
	}

	//PSDDK-280: save the sorting done on the Table
	function dtSortValue(aoSettings) {
		var cSort = "";
		for (var m=0; m<aoSettings.aaSorting.length; m += 1) {
			cSort += (cSort === "" ? "'" : "^'") + aoSettings.aaSorting[m][0] + "','" + aoSettings.aaSorting[m][1] + "'";
		}
		return cSort;
	}

	function addDTSortListener(id) {
		var	$dataTable = $('#' + id).dataTable(),
			aoColumns = $dataTable.fnSettings().aoColumns || [],
			aoSettings = $dataTable.fnSettings(),
			i;
			//cSort;
		for (i = 0; i < aoColumns.length; i += 1) {
			$(aoColumns[i].nTh).off("click.DT.sort");
			$(aoColumns[i].nTh).on("click.DT.sort", function () {
				//cSort = "";
				//for (var m=0; m<aoSettings.aaSorting.length; m += 1) {
				//	cSort += (cSort === "" ? "'" : "^'") + aoSettings.aaSorting[m][0] + "','" + aoSettings.aaSorting[m][1] + "'";
				//}
				//K("s_" + id + "_tsort", cSort);
				K("s_" + id + "_tsort", dtSortValue(aoSettings));
			});
		}
	}

	function fnCreateColumnFilter( id, i, title ) {
		var filterElement,
			options = DDK.table.data[id]
		;
		if (
			(options.fms.toUpperCase().replace(/_/g,'').indexOf('\''+title.replace(/ /g,'')+'\'') >= 0)
			|| (options.ms.toUpperCase().replace(/_/g,'').indexOf('\''+title.replace(/ /g,'')+'\'') >= 0 && options.fms.toLowerCase() === 'static')
			|| (options.ms.toUpperCase().replace(/_/g,'').indexOf('\''+title.replace(/ /g,'')+'\'') < 0 && options.fms.toLowerCase() === 'dynamic')
			|| (options.fms.toLowerCase() === 'all')
		) {
			filterElement = '<td class="ps-filter">';
			filterElement += fnCreateSelect( options.table.fnGetColumnData(i).sort(naturalSort), title, i, id );

		} else if (
			(options.fmt.toUpperCase().replace(/_/g,'').indexOf('\''+title.replace(/ /g,'')+'\'') >= 0)
			|| (options.ms.toUpperCase().replace(/_/g,'').indexOf('\''+title.replace(/ /g,'')+'\'') >= 0 && options.fmt.toLowerCase() === 'static')
			|| (options.ms.toUpperCase().replace(/_/g,'').indexOf('\''+title.replace(/ /g,'')+'\'') < 0 && options.fmt.toLowerCase() === 'dynamic')
			|| (options.fmt.toLowerCase() === 'all')
		) {
			filterElement = '<td class="ps-filter">';
			filterElement += fnCreateInputText( title, i, id );

		} else {
			filterElement = '<td class="ps-filter">';
		}
		filterElement += '</td>';
		return filterElement;
	}

	function fnCreateInputText( sTitle, i, id ) {
		var r = '<input ';
		r += 'title="Enter a value to filter by ' + sTitle + '" ';
		r += 'class="table-filter-column-text" ';
		r += 'id="psc_table_filter_column_text_input" ';
		r += 'type="text" ';
		r += 'name="psc_table_filter_column_text_input" ';
		r += 'value="Search ' + sTitle + '" ';
		r += 'onfocus="if ( this.className == \'table-filter-column-text\' ) { this.value = \'\'; } this.className = \'table-filter-column-text table-filter-active table-filter-focus\';" ';
		r += 'onblur="if ( this.value == \'\' ) { this.className = \'table-filter-column-text\'; this.value = \'Search ' + sTitle + '\'; } else { this.className = \'table-filter-column-text table-filter-active\'; }" ';
		r += 'onkeyup="DDK.table.data.' + id + '.table.fnFilter( $(this).val(), ' + i + ' );" ';
		r += '>';
		return r;
	}

	function fnCreateSelect( aData, sTitle, i, id ) {
		var r='<select title="Select a value to filter by ' + sTitle + '" onchange="DDK.table.data.' + id + '.table.fnFilter( $(this).val(), ' + i + ');"><option value="">ALL</option>', i, iLen=aData.length;
		for ( i=0 ; i<iLen ; i++ )
		{
			r += '<option value="'+aData[i]+'">'+aData[i]+'</option>';
		}
		return r+'</select>';
	}

	function PSC_Table_FilterGlobal( PSC_Table_Object, value ) {
		PSC_Table_Object.fnFilter( value );
	}

	function PSC_Table_Reload(tableID, callback, beforeInit, beforeReload) {
		DDK.reloadControl("table", tableID, callback, beforeInit, beforeReload);
	}

	function PSC_Table_UpdateTable(id, metricsDynamic, metricsStatic) {
		$('#psc_table_' + id + '_metrics_choose_button').click();

		K({
			md: metricsDynamic,
			se: metricsStatic + "," + metricsDynamic
			//hd: "",
			//hdt: ""
		}, "s_" + id + "_");

		PSC_Table_Reload(id);
	}

	function PSC_Table_Resize(id) {
		/* Adjust column size and table scroll body height twice
		 * because the table scroll head will change size after the first adjustment
		 */
		var options = DDK.table.data[id];
		if (options && options.table && options.table.fnSettings()) {
			PSC_Table_Resize_Scroll_Body(id);
			//if (options.ptype !== "server") {
			setTimeout(function() { PSC_Table_Resize_Scroll_Body(id); }, 200);
			//}
		}
	}

	function PSC_Table_Resize_Scroll_Body(id) {
		var options = DDK.table.data[id];
		DDK.table.bAjaxDataGet = false;
		options.table.fnAdjustColumnSizing();
		DDK.table.bAjaxDataGet = true;

		var $control = $('#psc_table_' + id + '_widget');
		var isBlock = $control.hasClass("ps-content-block");
		var isRow = $control.hasClass("ps-content-row");


		var controlHeight = $control.height();
		var controlWidth = $control.width();
		var toolbarHeight = 0;
		$control.children('.ps-toolbar').each(function() {
			toolbarHeight += $(this).outerHeight(true);
		});
		$control.children('.ddk-fav-bar').each(function() {
			toolbarHeight += $(this).outerHeight(true);
		});
		var infoHeight = $control.find('.dataTables_info').outerHeight(true);
		var pageHeight = $control.find('.dataTables_paginate').outerHeight(true);
		var lengthHeight = $control.find('.dataTables_length').outerHeight(true);

		var scrollHeadHeight = $control.find('.dataTables_scrollHead').outerHeight(true);
		var scrollFootHeight = $control.find('.dataTables_scrollFoot').outerHeight(true);

		var scrollBodyHeight = controlHeight - toolbarHeight - lengthHeight - scrollHeadHeight - scrollFootHeight - (options.ptype === "server" ? 20 : 0);
		scrollBodyHeight -= infoHeight > pageHeight ? infoHeight : pageHeight;

		if (!(isRow || DDK.modePDF)) {
			options.table.fnSettings().oScroll.sY = scrollBodyHeight;
			K('s_' + id + '_h', scrollBodyHeight);
			options.height = scrollBodyHeight;

			fixColumnSizing('#psc_table_' + id + '_widget')
		}
	}

	function PSC_Scorecard_Reload(scorecardID, callback, beforeInit, beforeReload) {
		DDK.reloadControl("scorecard", scorecardID, callback, beforeInit, beforeReload);
	}

	function PSC_Scorecard_Resize(id) {
		var $control = $('#psc_scorecard_' + id + '_widget'),
			$content = $('#psc_scorecard_data_' + id),
			$data = $('#psc_scorecard_data_' + id),
			controlHeight = $control.height(),
			controlWidth = $control.width(),
			toolbarHeight = $control.children('.ps-toolbar').first().outerHeight(true) + $control.children('.ps-toolbar').last().outerHeight(true) + $control.children('.ddk-fav-bar').outerHeight(true),
			contentHeight = controlHeight - toolbarHeight,
			options = DDK.scorecard.data[id],
			isGrouped = Boolean($data.data('gk')),
			isBlock = $control.hasClass("ps-content-block"),
			isRow = $control.hasClass("ps-content-row"),
			isEmpty = $data.data("config") === "\"\"";

		if (isEmpty || isGrouped && isBlock && !DDK.modePDF) {
			K('s_' + id + '_h', contentHeight);
			$content.height(contentHeight);
		} else if (isRow || DDK.modePDF) {
			if (options && options.table && options.table.fnSettings()) {
				PSC_Scorecard_Resize_Scroll_Body(id, true);
				setTimeout(function() { PSC_Scorecard_Resize_Scroll_Body(id, true); }, 200);
			}
		} else {
			if (options && options.table && options.table.fnSettings()) {
				PSC_Scorecard_Resize_Scroll_Body(id);
				setTimeout(function() { PSC_Scorecard_Resize_Scroll_Body(id); }, 200);
			}
		}
	}


	function PSC_Scorecard_Resize_Scroll_Body(id, isRow) {
		var options = DDK.scorecard.data[id];

		options.table.fnAdjustColumnSizing();

		var $control = $('#psc_scorecard_' + id + '_widget');

		var controlHeight = $control.height();
		var controlWidth = $control.width();
		var toolbarHeight = $control.children('.ps-toolbar').first().outerHeight(true);
		toolbarHeight += $control.children('.ps-toolbar').last().outerHeight(true);
		toolbarHeight += $control.children('.ddk-fav-bar').outerHeight(true);
		var infoHeight = $control.find('.dataTables_info').outerHeight(true);
		var pageHeight = $control.find('.dataTables_paginate').outerHeight(true);
		var lengthHeight = $control.find('.dataTables_length').outerHeight(true);

		var scrollHeadHeight = $control.find('.dataTables_scrollHead').outerHeight(true);
		var scrollFootHeight = $control.find('.dataTables_scrollFoot').outerHeight(true);

		var scrollBodyHeight = controlHeight - toolbarHeight - lengthHeight - scrollHeadHeight - scrollFootHeight;
		scrollBodyHeight -= infoHeight > pageHeight ? infoHeight : pageHeight;

		//if (isRow) { scrollBodyHeight = controlHeight; }
		//console.log("Scroll Body Height: ", id, scrollBodyHeight);
		//console.log(scrollBodyHeight, " = ", controlHeight, toolbarHeight, lengthHeight, scrollHeadHeight,scrollFootHeight, infoHeight, pageHeight);
		if (!isRow) {
			options.table.fnSettings().oScroll.sY = scrollBodyHeight + "px";
			K('s_' + id + '_h', scrollBodyHeight);
			options.height = scrollBodyHeight;
		}
		fixColumnSizing('#psc_scorecard_' + id + '_widget')
	}


	function PSC_Tree_Resize(id) {
		var $tree = $("#" + id),
			$treeContainer = $tree.parent().parent(),
			containerHt = $treeContainer.height(),
			toolbarHt;
		if($tree && $tree.length > 0 && containerHt > 0 && $tree.is(":visible")){
			if($treeContainer.children().size() > 1){
				toolbarHt = 0; //to be subtracted to get the new height
				// adds the others height like toolbars, footers etc
				$treeContainer.children(":visible").each(function(){
					var $this = $(this)
					if($this.get(0) != $tree.parent().get(0)){
						toolbarHt += $this.outerHeight();
					}
				});
				$tree.css("max-height", containerHt - toolbarHt - 10); //10 is just for padding
			}
		}

	}

	function PSC_Tree_Reload(treeID, callback, beforeInit, beforeReload) {
		DDK.reloadControl("tree", treeID, callback, beforeInit, beforeReload);
	}

	function PSC_Tree_Refresh(id){
		if(DDK.tree.data[id].tree.length > 0){
			DDK.tree.data[id].tree.jstree("refresh");
		}
		else{
			PSC_Tree_Reload(id, DDK.tree.data[id].callback);
		}
	}


	// PSC_Layout_JS

	var PSC_Layout_Object;
	var bSaveLayoutState = true;

	var aoTabs = [-1, -1, -1, -1];
	var aoAccordion = [-1, -1, -1, -1];

	/* body layout panes var aoTabsndexes: 0 = center, 1 = west, 2 = east, 3 = south */
	var asPane = ['center', 'west', 'east', 'south'];
	var asSection = ['middle', 'top', 'bottom'];

	function fnUpdateQueryString(sQueryString, sKeywordName, sKeywordValue) {
		/* If sQueryString starts with keyword name, or if &sKeywordName appears in sQueryString, update the value */
		if (sQueryString.indexOf(sKeywordName) >= 0) {
			sQueryString = fnUpdateQueryStringValue(sQueryString, sKeywordName, sKeywordValue);
		} else {
			sQueryString += '&' + sKeywordName + '=' + sKeywordValue;
		}
		return sQueryString ;
	}

	function fnUpdateQueryStringValue(sQueryString, sKeywordName, sKeywordValue) {
		var sUpdatedQueryString;
		var asQueryStringKeywords = sQueryString.split('&'),
			i;
		for (i = 0; i < asQueryStringKeywords.length; i += 1) {
			if (asQueryStringKeywords[i].split('=')[0] == sKeywordName) {
				asQueryStringKeywords[i] = sKeywordName + '=' + sKeywordValue;
			}
		}
		for (i = 0; i < asQueryStringKeywords.length; i += 1) {
			if (i == 0) {
				sUpdatedQueryString = asQueryStringKeywords[i];
			} else {
				sUpdatedQueryString += '&' + asQueryStringKeywords[i];
			}
		}
		return sUpdatedQueryString;
	}

	var PSC_Layout_Center_Accordion_Object;
	var PSC_Layout_West_Accordion_Object;
	var PSC_Layout_East_Accordion_Object;
	var PSC_Layout_South_Accordion_Object;

	var PSC_Layout_Center_Tabs_Object;
	var PSC_Layout_West_Tabs_Object;
	var PSC_Layout_East_Tabs_Object;
	var PSC_Layout_South_Tabs_Object;

	/* Placeholder function for custom resize to be overridden by developer */
	function PSC_Layout_Center_CustomResize() {}
	function PSC_Layout_West_CustomResize() {}
	function PSC_Layout_East_CustomResize() {}
	function PSC_Layout_South_CustomResize() {}

	function PSC_Layout_Pane_CustomResize(iPane) {
		switch (iPane) {
			case 0:
				PSC_Layout_Center_CustomResize();
				typeof DDK.layout.center.customResize === "function" && DDK.layout.center.customResize.call();
			break;
			case 1:
				PSC_Layout_West_CustomResize();
				typeof DDK.layout.west.customResize === "function" && DDK.layout.west.customResize.call();
			break;
			case 2:
				PSC_Layout_East_CustomResize();
				typeof DDK.layout.east.customResize === "function" && DDK.layout.east.customResize.call();
			break;
			case 3:
				PSC_Layout_South_CustomResize();
				typeof DDK.layout.south.customResize === "function" && DDK.layout.south.customResize.call();
			break;
		}
	}

	function PSC_Layout_Pane_CustomResize_DDK2(iPane, section) {
		switch (iPane) {
			case 0:
				PSC_Layout_Center_CustomResize();
				typeof DDK.layout.center.customResize === "function" && DDK.layout.center.customResize.call();
				if (DDK.layout.center[section])
					typeof DDK.layout.center[section].customResize === "function" && DDK.layout.center[section].customResize.call();
			break;
			case 1:
				PSC_Layout_West_CustomResize();
				typeof DDK.layout.west.customResize === "function" && DDK.layout.west.customResize.call();
				if (DDK.layout.west[section])
					typeof DDK.layout.west[section].customResize === "function" && DDK.layout.west[section].customResize.call();
			break;
			case 2:
				PSC_Layout_East_CustomResize();
				typeof DDK.layout.east.customResize === "function" && DDK.layout.east.customResize.call();
				if (DDK.layout.east[section])
					typeof DDK.layout.east[section].customResize === "function" && DDK.layout.east[section].customResize.call();
			break;
			case 3:
				PSC_Layout_South_CustomResize();
				typeof DDK.layout.south.customResize === "function" && DDK.layout.south.customResize.call();
				if (DDK.layout.south[section])
					typeof DDK.layout.south[section].customResize === "function" && DDK.layout.south[section].customResize.call();
			break;
		}
	}

	function fnSaveLayoutState() {
		bSaveLayoutState = true;

		var iLayoutWidth = $('#layout_container').width();

		var iLayoutWestSize = PSC_Layout_Object.state.west.size;
		var bLayoutWestIsClosed = PSC_Layout_Object.state.west.isClosed;
		var iLayoutWestPercent = (iLayoutWestSize * 100 / iLayoutWidth).toFixed();

		var iLayoutEastSize = PSC_Layout_Object.state.east.size;
		var bLayoutEastIsClosed = PSC_Layout_Object.state.east.isClosed;
		var iLayoutEastPercent = (iLayoutEastSize * 100 / iLayoutWidth).toFixed();

		var iLayoutSouthSize = PSC_Layout_Object.state.south.size;
		var iLayoutSouthMaxSize = PSC_Layout_Object.state.south.maxSize;
		var bLayoutSouthIsClosed = PSC_Layout_Object.state.south.isClosed;
		var iLayoutSouthPercent = (iLayoutSouthSize * 100 / iLayoutSouthMaxSize).toFixed();

		iLayoutWestSize && daaURLUpdate('s_lpw', iLayoutWestSize + ',' + iLayoutWestPercent + ',' + bLayoutWestIsClosed);
		iLayoutEastSize && daaURLUpdate('s_lpe', iLayoutEastSize + ',' + iLayoutEastPercent + ',' + bLayoutEastIsClosed);
		iLayoutSouthSize && daaURLUpdate('s_lps', iLayoutSouthSize + ',' + iLayoutSouthPercent + ',' + bLayoutSouthIsClosed);

	}

	//PSDDK-175: toggle top/bottom panes
	function fnSaveLayoutState_DDK2() {
		bSaveLayoutState = true;

		var iLayoutWidth = $('#layout_container').width();

		//modify use of state for nested layout
		var outerCenter = PSC_Layout_Object.center.children.layout1;
		var iLayoutWestSize, bLayoutWestIsClosed, iLayoutWestPercent;
		var iLayoutEastSize, bLayoutEastIsClosed, iLayoutEastPercent;
		var iLayoutSouthSize, bLayoutSouthIsClosed, iLayoutSouthPercent, iLayoutSouthMaxSize;
		var iLayoutNorthSize, bLayoutNorthIsClosed, iLayoutNorthPercent;

		if (outerCenter.west !== false) {
			iLayoutWestSize = outerCenter.state.west.size;
			bLayoutWestIsClosed = outerCenter.state.west.isClosed;
			iLayoutWestPercent = (iLayoutWestSize * 100 / iLayoutWidth).toFixed();
			daaURLUpdate('s_lpw', iLayoutWestSize + ',' + iLayoutWestPercent + ',' + bLayoutWestIsClosed);
			if (outerCenter.west.children.layout1.north !== false) {
				var wTop = outerCenter.west.children.layout1.state.north;
				var wTopPercent = (wTop.size * 100 / wTop.maxSize).toFixed();
				daaURLUpdate('s_lpwt', wTop.size + ',' + wTopPercent + ',' + wTop.isClosed);
			}
			if (outerCenter.west.children.layout1.south !== false) {
				var wBottom = outerCenter.west.children.layout1.state.south;
				var wBottomPercent = (wBottom.size * 100 / wBottom.maxSize).toFixed();
				daaURLUpdate('s_lpwb', wBottom.size + ',' + wBottomPercent + ',' + wBottom.isClosed);
			}
		}

		if (outerCenter.east !== false) {
			iLayoutEastSize = outerCenter.state.east.size;
			bLayoutEastIsClosed = outerCenter.state.east.isClosed;
			iLayoutEastPercent = (iLayoutEastSize * 100 / iLayoutWidth).toFixed();
			daaURLUpdate('s_lpe', iLayoutEastSize + ',' + iLayoutEastPercent + ',' + bLayoutEastIsClosed);
			if (outerCenter.east.children.layout1.north !== false) {
				var eTop = outerCenter.east.children.layout1.state.north;
				var eTopPercent = (eTop.size * 100 / eTop.maxSize).toFixed();
				daaURLUpdate('s_lpet', eTop.size + ',' + eTopPercent + ',' + eTop.isClosed);
			}
			if (outerCenter.east.children.layout1.south !== false) {
				var eBottom = outerCenter.east.children.layout1.state.south;
				var eBottomPercent = (eBottom.size * 100 / eBottom.maxSize).toFixed();
				daaURLUpdate('s_lpeb', eBottom.size + ',' + eBottomPercent + ',' + eBottom.isClosed);
			}
		}

		if (outerCenter.south !== false) {
			iLayoutSouthSize = outerCenter.state.south.size;
			iLayoutSouthMaxSize = outerCenter.state.south.maxSize;
			bLayoutSouthIsClosed = outerCenter.state.south.isClosed;
			iLayoutSouthPercent = (iLayoutSouthSize * 100 / iLayoutSouthMaxSize).toFixed();
			daaURLUpdate('s_lps', iLayoutSouthSize + ',' + iLayoutSouthPercent + ',' + bLayoutSouthIsClosed);
			if (outerCenter.east.children.layout1.north !== false) {
				var sTop = outerCenter.east.children.layout1.state.north;
				var sTopPercent = (sTop.size * 100 / sTop.maxSize).toFixed();
				daaURLUpdate('s_lpst', sTop.size + ',' + sTopPercent + ',' + sTop.isClosed);
			}
			if (outerCenter.east.children.layout1.south !== false) {
				var sBottom = outerCenter.east.children.layout1.state.south;
				var sBottomPercent = (sBottom.size * 100 / sBottom.maxSize).toFixed();
				daaURLUpdate('s_lpsb', sBottom.size + ',' + sBottomPercent + ',' + sBottom.isClosed);
			}
		}

		if (outerCenter.north !== false) {
			iLayoutNorthSize = outerCenter.state.north.size;
			bLayoutNorthIsClosed = outerCenter.state.north.isClosed;
			//iLayoutNorthPercent = (iLayoutNorthSize * 100 / iLayoutWidth).toFixed();
			daaURLUpdate('s_lpn', iLayoutNorthSize + ',' + iLayoutNorthPercent + ',' + bLayoutNorthIsClosed);
		}
	}

	function fnResizeLayoutContent(iPane) {
		if (aoAccordion[iPane] !== -1) {
			aoAccordion[iPane].accordion('resize');
			resizeContent(iPane, false, "accordion");
			setTimeout(function() {
				resizeContent(iPane, true, "accordion");
				PSC_Layout_Pane_CustomResize(iPane);
			}, 100);
		} else if (aoTabs[iPane] !== -1) {
			/* there is no tabs resize function */
			resizeContent(iPane, false, "tabs");
			setTimeout(function() {
				resizeContent(iPane, true, "tabs");
				PSC_Layout_Pane_CustomResize(iPane);
			}, 100);
		} else {
			resizeContent(iPane, false);
			setTimeout(function() {
				resizeContent(iPane, true);
				PSC_Layout_Pane_CustomResize(iPane);
			}, 100);
		}

		if (bSaveLayoutState) {
			bSaveLayoutState = false;
			setTimeout(fnSaveLayoutState,1000);
		}
	}

	//PSDDK-175: toggle top/bottom panes
	function fnResizeLayoutContent_DDK2(iPane, iSection) {
		var p = asPane[iPane],
			sec = iSection? (typeof iSection === "string"? iSection : asSection[iSection]) : "middle"
		;

		if (DDK.accordion[p] !== undefined && DDK.accordion[p][sec] !== undefined) {
			DDK.accordion[p][sec].accordion('resize');
			resizeContent(iPane, false, "accordion", sec);
			setTimeout(function() {
				resizeContent(iPane, true, "accordion", sec);
				PSC_Layout_Pane_CustomResize_DDK2(iPane, sec);
			}, 100);

		} else if (DDK.tabs[p] !== undefined && DDK.tabs[p][sec] !== undefined) {
			/* there is no tabs resize function */
			resizeContent(iPane, false, "tabs", sec);
			setTimeout(function() {
				resizeContent(iPane, true, "tabs", sec);
				PSC_Layout_Pane_CustomResize_DDK2(iPane, sec);
			}, 100);
		} else {
			resizeContent(iPane, false, "", sec);
			setTimeout(function() {
				resizeContent(iPane, true, "", sec);
				PSC_Layout_Pane_CustomResize_DDK2(iPane, sec);
			}, 100);
		}

		if (bSaveLayoutState) {
			bSaveLayoutState = false;
			setTimeout(fnSaveLayoutState_DDK2,1000);
		}
	}

	function shrinkLayoutContent(iPane) {
		var selector,
			$pane,
			$content;

		if (aoAccordion[iPane] !== -1) {
			selector = "#layout_" + asPane[iPane] + "_accordion > .ui-accordion-content-active";
		} else if (aoTabs[iPane] !== -1) {
			selector = "#layout_content_" + asPane[iPane] + " > .ui-tabs-panel:visible";
		} else {
			selector = "#layout_content_" + asPane[iPane];
		}

		$pane = $(selector);
		$content = $pane.children("div.ps-content-row:visible, div.ps-content-block:visible").not(".ps-content-fixed");

		$content
			.addClass("ddk-restrict-overflow")
			.width(layoutContentMinwidth);

		$content.each(function() {
			var $this = $(this);
			if ($this.hasClass("ps-content-block")) {
				$this.height(layoutContentMinheight);
			}
		});
	}

	//PSDDK-175: toggle top/bottom panes
	function shrinkLayoutContent_DDK2(iPane, iSection) {
		var selector,
			$pane,
			$content,
			p = asPane[iPane],
			sec = iSection? (typeof iSection === "string"? iSection : asSection[iSection]) : "middle"
		;

		if (DDK.accordion[p] !== undefined && DDK.accordion[p][sec] !== undefined) {
			selector = "#layout_" + (sec === "middle"? "" : sec + "_") + p + "_accordion > .ui-accordion-content-active";
		} else if (DDK.tabs[p] !== undefined && DDK.tabs[p][sec] !== undefined) {
			selector = "#layout_" + (sec === "middle"? "" : sec + "_") + "content_" + p + " > .ui-tabs-panel:visible";
		} else {
			selector = "#layout_" + (sec === "middle"? "" : sec + "_") + "content_" + p;
		}

		$pane = $(selector);
		$content = $pane.children("div.ps-content-row:visible, div.ps-content-block:visible").not(".ps-content-fixed");

		$content
			.addClass("ddk-restrict-overflow")
			.width(layoutContentMinwidth);

		$content.each(function() {
			var $this = $(this);
			if ($this.hasClass("ps-content-block")) {
				$this.height(layoutContentMinheight);
			}
		});
	}

	function resizeControl($elem) {
		var id = $elem.attr("id"),
			idParts
		;
		if (id) {
			idParts = id.split("_");
			if (idParts[0] === "psc" && idParts[3] === "widget") {
				DDK.format(id);
				PSC_Resize(idParts[1], idParts[2]);
			}
		}
	}

	/* Resize Pane Content */
	//PSDDK-175: toggle top/bottom panes
	function resizeContent(pane, resizeComponents, contentType, sectionType) {
		var section = (sectionType === undefined || sectionType === "" || sectionType === "middle")? "" : sectionType + "_";
			selector = "#layout_" + section + (contentType === "accordion" ? "" : "content_") + asPane[pane] + (contentType ? (contentType === "accordion" ? "_accordion > .ui-accordion-content-active" : " > .ui-tabs-panel:visible") : ""),
			$pane = $(selector),
			$content = $pane.children("div.ps-content-row:visible, div.ps-content-block:visible"),
			$rows = $content.filter("div.ps-content-row, div.ps-content-block.ps-content-newgroup"),
			$bam = $content.closest("div[id^=\"psc_bamset\"][id$=\"_widget\"]"),
			$scard = $content.closest("div[id^=\"psc_scorecard\"][id$=\"_widget\"]"),
			blockGroups = [],
			fixedBlockGroups = [],
			$blocks = undefined,
			$firstChild = $content.first(),
			paneContentHeight = $pane.height() - (contentType ? 3 : 0),
			//paneContentWidth = $pane.width(),
			paneContentWidth = (contentType === "accordion")? $pane.parent().width() : $pane.width(),
			fixedHeight = 0,
			availableHeight = undefined,
			availableWidth = undefined,
			blockHeight = undefined,
			blockWidth = undefined,
			blockCount = undefined,
			rowWidth = undefined,
			i = 0,
			blockColumns = undefined,
			blockRows = undefined,
			$fixedBlocks = undefined;

		// clear .ddk-restrict-overflow
		$content.removeClass("ddk-restrict-overflow");
		// fix accordion active option defect when pane is hidden
		if (contentType === "accordion") $pane.width("");

		// allow 22px for scrollbar
		// except when:
		// - the html element has a class of `touch`
		// - any of the pane content has a `ps-pane-noscroll` or `ps-content-noscroll` flag class
		// - the pane content is a single div.ps-content-block
		if ($("html").hasClass("touch") || $content.hasClass("ps-pane-noscroll") || $content.hasClass("ps-content-noscroll") || ($content.size() === 1 && $content.hasClass("ps-content-block"))) {
			// don't add scrollbar padding
			// add 2px padding buffer to handle rounding errors in block size calculations
			paneContentWidth -= 2;
			paneContentHeight -= 2;
		} else {
			// add scrollbar padding
			paneContentWidth -= 22;
			paneContentHeight -= 22;
		}

		// determine available width for rows and blocks
		availableWidth = paneContentWidth;
		if (availableWidth < layoutContentMinwidth) { availableWidth = layoutContentMinwidth; }
		rowWidth = availableWidth - 2 * layoutContentPadding; // - 2;
		if (rowWidth < layoutContentMinwidth) { rowWidth = layoutContentMinwidth; }

		// find first block group if the first child of the pane is a block but not a newgroup block
		if ($firstChild.hasClass("ps-content-block") && !$firstChild.hasClass("ps-content-newgroup")) {
			$blocks = $firstChild.nextUntil(".ps-content-row:visible, .ps-content-block.ps-content-newgroup:visible").addBack();
			if ($blocks.hasClass("ps-content-fixed")) {
				fixedBlockGroups.push($blocks);
			} else {
				blockGroups.push($blocks);
			}
		}

		//console.log("Height: ", paneContentHeight, " Width: ", paneContentWidth, " Available Width: ", availableWidth);

		// loop through the rows and newgroup blocks
		$rows.each(function() {
			var $this = $(this),
				borderVertical = (parseInt($this.css("border-top-width")) || 0) + (parseInt($this.css("border-bottom-width")) || 0),
				borderHorizontal = (parseInt($this.css("border-left-width")) || 0) + (parseInt($this.css("border-right-width")) || 0);

			// find all blocks in this group
			if ($this.hasClass("ps-content-block")) {
				$blocks = $this.nextUntil(".ps-content-row:visible, .ps-content-block.ps-content-newgroup:visible").addBack();
			} else {
				$blocks = $this.nextUntil(".ps-content-row:visible, .ps-content-block.ps-content-newgroup:visible");
			}
			if ($blocks.size()) {
				if ($blocks.hasClass("ps-content-fixed")) {
					fixedBlockGroups.push($blocks);
				} else {
					blockGroups.push($blocks);
				}
			}

			if ($this.hasClass("ps-content-row")) {
				// set row element width
				$this.width(rowWidth - borderHorizontal);

				// resize control (if this row is a control div)
				resizeComponents && resizeControl($this);

				// add up row heights
				fixedHeight += $this.outerHeight(true);
			}
		});

		// resize each block group that contains a ps-content-fixed element
		for (i = 0; i < fixedBlockGroups.length; i += 1) {
			$blocks = fixedBlockGroups[i];

			$fixedBlocks = $blocks.filter(".ps-content-fixed");

			// block height is based on the first fixed block element found in the group
			//console.log("Fixed block height components:", parseInt($fixedBlocks.height()), (parseInt($fixedBlocks.css("border-top-width")) || 0), (parseInt($fixedBlocks.css("border-bottom-width")) || 0));
			blockHeight = parseInt($fixedBlocks.height()) + (parseInt($fixedBlocks.css("border-top-width")) || 0) + (parseInt($fixedBlocks.css("border-bottom-width")) || 0);
			//console.log("Calculated block height:", blockHeight);
			availableWidth = paneContentWidth;
			$fixedBlocks.each(function() {
				var $this = $(this),
					borderVertical = (parseInt($this.css("border-top-width")) || 0) + (parseInt($this.css("border-bottom-width")) || 0),
					borderHorizontal = (parseInt($this.css("border-left-width")) || 0) + (parseInt($this.css("border-right-width")) || 0);

					availableWidth -= $this.width() + borderHorizontal + 2 * layoutContentPadding; // + 2;
			});

			blockCount = $blocks.size() - $fixedBlocks.size();
			if (blockCount) {
				blockWidth = (availableWidth / blockCount).toFixed() - 2 * layoutContentPadding; // - 2;

				$blocks.each(function() {
					var $this = $(this),
						borderVertical = (parseInt($this.css("border-top-width")) || 0) + (parseInt($this.css("border-bottom-width")) || 0),
						borderHorizontal = (parseInt($this.css("border-left-width")) || 0) + (parseInt($this.css("border-right-width")) || 0);

					if (!$this.hasClass("ps-content-fixed")) {
						$this.height(blockHeight - borderVertical);
						$this.width(blockWidth - borderHorizontal);
					}

					// resize control (if this block is a control div)
					resizeComponents && resizeControl($this);

				});
			}

			// add fixed block group height
			fixedHeight += blockHeight + 2 * layoutContentPadding;
		}

		// determine available height for non-fixed-height blocks
		availableHeight = paneContentHeight - fixedHeight;
		if (availableHeight < layoutContentMinheight) { availableHeight = layoutContentMinheight; }
		availableWidth = paneContentWidth;

		// resize each block group that does not contain a ps-content-fixed element
		for (i = 0; i < blockGroups.length; i += 1) {
			$blocks = blockGroups[i];
			blockCount = $blocks.size();
			blockRows = 1;
			blockColumns = 1;

			if (availableWidth > (2 * layoutContentMinwidth + 60) && blockCount > 1) { blockColumns = 2; }
			if (availableWidth > (3 * layoutContentMinwidth + 90) && blockCount > 2) { blockColumns = 3; }

			blockRows = (blockCount / blockColumns).toFixed();
			if (blockRows < 1) { blockRows = 1; }

			/* allow 2 * layout_content_padding for div element padding */
			blockHeight = (availableHeight / blockGroups.length / blockRows).toFixed() - 2 * layoutContentPadding;
			blockWidth = (availableWidth / blockColumns).toFixed() - 2 * layoutContentPadding; // - 2;

			if (blockHeight < layoutContentMinheight) { blockHeight = layoutContentMinheight; }
			if (blockWidth < layoutContentMinwidth) { blockWidth = layoutContentMinwidth; }

			$blocks.each(function() {
				var $this = $(this),
					borderVertical = (parseInt($this.css("border-top-width")) || 0) + (parseInt($this.css("border-bottom-width")) || 0),
					borderHorizontal = (parseInt($this.css("border-left-width")) || 0) + (parseInt($this.css("border-right-width")) || 0);

				$this.height(blockHeight - borderVertical);
				$this.width(blockWidth - borderHorizontal);

				// resize control (if this block is a control div)
				resizeComponents && resizeControl($this);
			});
		}
	}

	


	function PSC_Bamset_Reload(bamsetID, callback, beforeInit, beforeReload) {
		DDK.reloadControl("bamset", bamsetID, callback, beforeInit, beforeReload);
	}

	function PSC_Bamset_Resize(id) {
		var $control = $('#psc_bamset_' + id + '_widget'),
			$content = $('#psc_bamset_data_' + id),
			$data = $('#psc_bamset_data_' + id),
			controlHeight = $control.height(),
			controlWidth = $control.width(),
			toolbarHeight = $control.children('.ps-toolbar').first().outerHeight(true) + $control.children('.ps-toolbar').last().outerHeight(true) + $control.children('.ddk-fav-bar').outerHeight(true),
			contentHeight = controlHeight - toolbarHeight;

		//console.log($control.children('.ps-toolbar').first().outerHeight(true), $control.children('.ps-toolbar').last().outerHeight(true), $control.children('.ddk-fav-bar').outerHeight(true));
		$content.outerHeight(contentHeight);
		$content.children("ul").each(function() {
			var $this = $(this),
				height = $this.height(),
				width = $this.width(),
				scrollType = ($this.hasClass("ddk-bamset-scroll-vertical") ? "vertical" : ($this.hasClass("ddk-bamset-scroll-horizontal") ? "horizontal" : "none")),
				groups = {},
				$group,
				i,
				groupFontSize = []; // header, content, footer

			// resize bamset ul and li elements
			resizeBamsetUL($this, scrollType);

			// resize text in autosize bams
			$this.find(".ddk-bam-autosize").children("div").each(resizeBamText);

			// check for autosize groups and cache them
			$this.find(".ddk-bam-autosize[data-bam-autosize]").each(function(index, elem) {
				var $elem = $(elem),
					group = $elem.data("bam-autosize");
				if (groups[group]) {
					// group already found, ignore this element
				} else {
					groups[group] = $this.find('[data-bam-autosize="' + group + '"]');
				}
			});

			// for each autosize group, find the min font-size for header, content, and footer sections
			// then adjust all elements in the group to match those values
			for (i in groups) {
				if (groups.hasOwnProperty(i)) {
					groupFontSize = [Infinity, Infinity, Infinity];
					$group = groups[i];
					$group
						.each(function(index, elem) {
							var $elem = $(elem);
							groupFontSize[0] = Math.min(groupFontSize[0], parseInt($elem.find(".ddk-bam-header > span").css("font-size")));
							groupFontSize[1] = Math.min(groupFontSize[1], parseInt($elem.find(".ddk-bam-content > span").css("font-size")));
							groupFontSize[2] = Math.min(groupFontSize[2], parseInt($elem.find(".ddk-bam-footer > span").css("font-size")));
						})
						.find(".ddk-bam-header > span")
							.css("font-size", groupFontSize[0] + "px")
							.end()
						.find(".ddk-bam-content > span")
							.css("font-size", groupFontSize[1] + "px")
							.end()
						.find(".ddk-bam-footer > span")
							.css("font-size", groupFontSize[2] + "px")
							.end();
				}
			}
		});
	}

	function resizeBamText(index, elem) {
		var $elem = $(elem),
			$spans = $elem.children(),
			spanCount = $spans.size(),
			height = $elem.height(),
			width = $elem.width(),
			text = $spans.text(),
			textLength = text.length,
			maxTextWidth = Math.max(width - (spanCount * 5), 1),
			maxTextHeight = Math.max(height - 10, 1),
			fontFamily = $elem.css("font-family").replace(/ /g, "").replace(/-/g, "").split(",").pop();

		$spans.css({
			"font-size": Math.floor(Math.min(maxTextHeight, maxTextWidth * 10 / DDK.util.stringWidth(text, fontFamily))) + "px",
			"line-height": height + "px"
		});
	}

	function optimumGrid(options) {
		"use strict";
		var rows,
			columns,
			o = {
				containerHeight: 100,
				containerWidth: 150,
				elementCount: 1,
				preferRows: 2,
				columnFactor: 1,
				rowFactor: 3
			},
			i;

		$.extend(o, options);

		o.aspectRatio = o.containerWidth / o.containerHeight;
		o.square = Math.ceil(Math.pow(o.elementCount, 0.5));
		rows = o.square;
		columns = Math.ceil(o.elementCount / o.square);

		for (i = 0; i < o.square; i += 1) {
			//console.log("c: ", i, o.aspectRatio, o.preferRows * ((o.square - i) * o.columnFactor));
			//console.log("r: ", i, o.aspectRatio, o.preferRows / ((o.square - i) * o.rowFactor));
			if (o.aspectRatio > (o.preferRows * ((o.square - i) * o.columnFactor))) {
				rows = Math.ceil(o.elementCount / (i + 1));
				columns = i + 1;
				break;
			} else if (o.aspectRatio < (o.preferRows / ((o.square - i) * o.rowFactor))) {
				rows = i + 1;
				columns = Math.ceil(o.elementCount / (i + 1));
				break;
			}
		}

		//console.log([columns, rows])
		return [columns, rows];
	}

	function resizeBamsetUL(elem, scrollType) {
		var $elem = $(elem),
			$li = $elem.children("li"),
			liCount = $li.size(),
			height = $elem.height(),
			width = $elem.width() - 17, // leave room for a scrollbar!
			aspectRatio = ($elem.data("bam-aspect-ratio") || 1.5),
			preferRows = 2, // (width / height) aspectRatio below which rows are preferred over columns
			dim,
			marginPercent = parseFloat($elem.closest("ul[data-bam-margin]").data("bam-margin")),
			marginBaseHeight = $elem.closest("ul[data-bam-margin]").height(),
			marginBaseWidth = $elem.closest("ul[data-bam-margin]").width(),
			margin = Math.ceil(0.01 * marginPercent * marginBaseWidth),
			//margin = Math.max(4, Math.floor(0.01 * marginPercent * Math.min(marginBaseHeight, marginBaseWidth))) + "px", // margin is the specified % of the width or the height, whichever is smaller (default margin is 1%, minimum margin is 4px)
			liBaseHeight,
			liBaseWidth;

		//console.log(liCount, margin, height, width, marginBaseHeight, marginBaseWidth);

		if (scrollType === "vertical") {
			// find the base height and base width for the li elements (no borders or margins)
			liBaseWidth = width - 18 - parseInt(margin); // allow 18px + margin for scrollbar and margin above scrollbar
			liBaseHeight = liBaseWidth / aspectRatio;

			// set the height and width, allowing for borders
			$li
				.each(function(index, elem) {
					var $this = $(this),
						borderVertical = (parseInt($this.css("border-top-width")) || 0) + (parseInt($this.css("border-bottom-width")) || 0),
						borderHorizontal = (parseInt($this.css("border-left-width")) || 0) + (parseInt($this.css("border-right-width")) || 0);

					$this.width(liBaseWidth - borderHorizontal).height(liBaseHeight - borderVertical);

				})
				.slice(0, -1)
					.css({"margin-bottom": margin});

		} else if (scrollType === "horizontal") {
			// find the base height and base width for the li elements (no borders or margins)
			liBaseHeight = height - 18 - parseInt(margin); // allow 18px + margin for scrollbar and margin above scrollbar
			liBaseWidth = liBaseHeight * aspectRatio;

			// set the height and width, allowing for borders
			$li
				.each(function(index, elem) {
					var $this = $(this),
						borderVertical = (parseInt($this.css("border-top-width")) || 0) + (parseInt($this.css("border-bottom-width")) || 0),
						borderHorizontal = (parseInt($this.css("border-left-width")) || 0) + (parseInt($this.css("border-right-width")) || 0);

					$this.width(liBaseWidth - borderHorizontal).height(liBaseHeight - borderVertical);

				})
				.slice(0, -1)
					.css({"margin-right": margin});
		} else {
			// scrollType === none
			// figure out how many rows and columns are needed to best lay out li children
			// columns x rows

			// dim = optimumGrid({
				// elementCount: liCount,
				// containerHeight: height,
				// containerWidth: width
			// });

			aspectRatio = width / height;

			if (liCount > 20) {
				// 5 x 5
				dim = [5, 5];
			} else if (liCount > 16) {
				// 5 x 4 or 4 x 5
				if (aspectRatio > preferRows) {
					dim = [5, 4];
				} else {
					dim = [4, 5];
				}
			} else if (liCount === 16) {
				// 4 x 4
				dim = [4, 4];
			} else if (liCount > 12) {
				// 5 x 3 or 3 x 5
				if (aspectRatio > preferRows) {
					dim = [5, 3];
				} else {
					dim = [3, 5];
				}
			} else if (liCount > 9) {
				// 4 x 3 or 3 x 4
				if (aspectRatio > preferRows) {
					dim = [4, 3];
				} else {
					dim = [3, 4];
				}
			} else if (liCount > 6) {
				// 3 x 3
				dim = [3, 3];
			} else if (liCount > 4) {
				// n x 1 or 3 x 2 or 2 x 3 or 1 x n
				if (aspectRatio > (2.5 * preferRows)) {
					dim = [liCount, 1];
				} else if (aspectRatio > preferRows) {
					dim = [3, 2];
				} else if (aspectRatio > (preferRows / 3)) {
					dim = [2, 3];
				} else {
					dim = [1, liCount];
				}
			} else if (liCount === 4) {
				// 2 x 2
				dim = [2, 2];
			} else if (liCount === 3) {
				// 2 x 2 or 3 x 1 or 1 x 3
				if (aspectRatio > (preferRows)) {
					dim = [3, 1];
				} else if (aspectRatio < (preferRows / 1.5)) {
					dim = [1, 3];
				} else {
					dim = [2, 2];
				}
			} else if (liCount === 2) {
				// 2 x 1 or 1 x 2
				if (aspectRatio > preferRows) {
					dim = [2, 1];
				} else {
					dim = [1, 2];
				}
			} else if (liCount === 1) {
				// 1 x 1
				dim = [1, 1];
			}

			// for each li element, set the width, height, margin-right, and margin-bottom

			// find the base height and base width for the li elements (no borders or margins)
			//console.log(width);
			liBaseHeight = Math.floor((height - ((dim[1] - 1) * margin)) / dim[1]) - 2;
			liBaseWidth = Math.floor((width - ((dim[0] - 1) * margin)) / dim[0]) - 2;

			// set the height and width, allowing for borders
			// clear bottom and right margins
			$li.each(function(index, elem) {
					var $this = $(this),
						borderVertical = (Math.ceil(parseFloat($this.css("border-top-width"))) || 0) + (Math.ceil(parseFloat($this.css("border-bottom-width"))) || 0),
						borderHorizontal = (Math.ceil(parseFloat($this.css("border-left-width"))) || 0) + (Math.ceil(parseFloat($this.css("border-right-width"))) || 0);

					$this
						.width(liBaseWidth - borderHorizontal)
						.height(liBaseHeight - borderVertical)
						.css({"margin-bottom": 0})
						.css({"margin-right": 0});

					//console.log(liBaseHeight, liBaseWidth, borderVertical, borderHorizontal);
			});

			// if there is more than one row, set bottom margin for all but the bottom-most row of li elements
			if (dim[1] > 1) {
				// console.log("margin-bottom:", margin, $li.slice(0, dim[0] * (dim[1] - 1)));
				$li
					.slice(0, dim[0] * (dim[1] - 1))
						.css({"margin-bottom": margin});
			}

			// if there is more than one column, set right margin for all but the right-most column of li elements
			if (dim[0] > 1) {
				// console.log("margin-right:", margin, $li.filter(function(index) { return ((index + 1) % dim[0]); }));
				$li
					.filter(function(index) {
						return ((index + 1) % dim[0]);
					})
						.css({"margin-right": margin});
			}
		}

		// for each li child, resize a nested child ul if it has one, all nested ul bamsets are formatted with scrollType=none
		$li.children("ul").each(function(index, elem) {
			resizeBamsetUL(elem, "none");
		});

		// for each trend canvas, resize it to the new parent dimensions
		$li.children(".ddk-bam-content").find("canvas").each(function() {
			var $this = $(this),
				$container = $this.closest(".ddk-bam-content");

			setTimeout(function() {
				//console.log($this, $container.height(), $container.width());
				$this.height($container.height() * 0.95);
				$this.width($container.width() * 0.95);
			}, 0);
		});
	}
	


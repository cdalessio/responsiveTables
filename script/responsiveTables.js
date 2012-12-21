/* Copyright 2012 CJD (Christopher D'Alessio)

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

(function (d,w, undefined) {
		
	if(!("querySelectorAll" in d)) return; // depends on this, so exit since this won't work.
	
	// utility functions that most libraries will provide in one way or another
	var util = {
		getNumFromProp: function(p) {
			return Math.round(Number(p.replace(/[^\.0-9]/g,"")));	
		},
		getBorderWidths: function(el) {
			var st = w.getComputedStyle(el);
			return {
				"top":st.getPropertyValue("border-top-width"), 
				"right":st.getPropertyValue("border-right-width"), 
				"bottom":st.getPropertyValue("border-bottom-width"), 
				"left":st.getPropertyValue("border-left-width")
			};
		},
		getPadding: function(el) {
			var st = w.getComputedStyle(el);
			return {
				"top":st.getPropertyValue("padding-top"), 
				"right":st.getPropertyValue("padding-right"), 
				"bottom":st.getPropertyValue("padding-bottom"), 
				"left":st.getPropertyValue("padding-left")
			};
		},
		getWidth: function(el) {
			var wd = el.clientWidth;
			var wds = util.getBorderWidths(el);
			wd = wd + util.getNumFromProp(wds.right) + util.getNumFromProp(wds.left);
			return wd;
		},
		setStyle: function(el,styles) {
			var styleString = "", key;
			for (key in styles) {
				styleString += key + ":" + styles[key] + ";";
			}
			el.setAttribute("style", styleString);
		},
		addClass: function(el, className) {
			var ccn = el.getAttribute("class") || "";
			el.setAttribute("class", ccn + " " + className);
		},
		removeClass: function(el, className) {
			var ccna = el.getAttribute("class"), classNames = "";
			if (!ccna) return; // nothing to work with
			ccna = ccna.split(" ");
			var l = ccna.length, i;
			for (i = 0; i < l; i++) {
				var ccn = ccna[i]; 
				if(!(ccn == className)) {
					classNames += ccn + " "
				}
			}
			el.setAttribute("class", classNames.trim());
		},
		hasClass: function(el, className) {
			var classAttr = el.getAttribute("class"), matchRegx = new RegExp("\\s*"+className+"\\s*");
			return (classAttr && matchRegx.test(classAttr));
		}
	};
	
	// cloneNode seems to perform best in almost every case, so we'll create once, store, and clone. this use case may be simple enough this isn't useful.
	var elementStore = {
		div: d.createElement("div"),
		span: d.createElement("span")
	};
	
	/* -------------------------------------
	Core code for responsive table solution.
	*/
	
	var data = { // global references, these will be set in the initializers for later re-use
		wrapper: d.querySelector(".responsiveTableWrapper"),
		table: null,
		dropdown: null,
		rowArray: [],
		columns: [],
		dropdownItems: [],
		maxTableWidth: 0,
		columnWidth: 0,
		dropdownWidth: 0,
		dropdownItemHeight: 0,
		leftDropdownPos: 0,
		rowHeights: [],
		cellHeights: [],
		numberOfRows: 1,
		numberOfColumns: 1,
		firstDataColumn: 1,
		dataColumnsDisplayed: 1,
		currentDisplayedColumn: 1,
		translateXOffset: 0,
		startX: 0,
		deltaX: 0,
		interactive: false
	};
	
	var functions = {
		initializeTable: function() {

			// let the table define itself with proper cell widths so we can get dimensions properly
			data.wrapper.setAttribute("style","visibility: hidden; width: 100000px;");
			data.table = data.wrapper.querySelector("table");
			data.maxTableWidth = util.getWidth(data.table);
			var rows = data.table.querySelectorAll("tr");
			data.numberOfRows = rows.length;
			
			// gather rows and set row heights;
			for (var i = 0; i < data.numberOfRows; i++) {
				var currentRow = rows[i];
				var currentRowArray = data.rowArray[i] = currentRow.querySelectorAll("th, td"); // store this for easy access later without DOM crawling
				var h = data.rowHeights[i] = currentRow.clientHeight; 
				data.numberOfColumns = currentRowArray.length;
				data.cellHeights[i] = [];
				
				// set row height so it is correct when we convert away from table styles
				util.setStyle(currentRow, {"height": h + "px"});
				
				for (var j = 0; j < data.numberOfColumns; j++) { // set the heights, store references to column array for easy access later without DOM crawling
					if (!data.columns[j]) {
						data.columns[j] = [];
					}
					var currentCell = data.columns[j][i] = currentRowArray[j];
					if (j === 0 && currentCell.nodeName != "TH") {
						data.firstDataColumn = 0;
					}
					var cp = util.getPadding(currentCell);
					cp = data.cellHeights[i][j] = (h - (util.getNumFromProp(cp.top) + util.getNumFromProp(cp.bottom)));
					util.setStyle(currentCell, {"height":cp + "px"}); // set height so it's right when we convert away from table styles
				}
			}
			
			// clean up temporary style and enable responsive CSS properties
			data.wrapper.removeAttribute("style");
			
			util.addClass(data.table, "responsive");
			data.columnWidth = util.getWidth(data.columns[0][0]); 
			
		},
		initializeDropdown: function() {// build a dropdown out of column headings
			data.dropdown = elementStore["div"].cloneNode();
			data.dropdown.setAttribute("class", "colHeadingDropdown");
			
			var dropdownBorderWidths = util.getBorderWidths(data.dropdown);
			var hBorderSum = util.getNumFromProp(dropdownBorderWidths.left) + util.getNumFromProp(dropdownBorderWidths.right);
			data.dropdownWidth = (data.columnWidth - hBorderSum);
			// create options
			for (var i = 0; i < data.numberOfColumns; i++) {
				var option = data.dropdownItems[i] = elementStore["div"].cloneNode();
				option.innerHTML = data.rowArray[0][i].innerHTML + "&nbsp;";
				option.setAttribute("data-index", i);
				if (i > (data.numberOfColumns - data.dataColumnsDisplayed)) {
					util.addClass(option, "unselectable");
				}
				data.dropdown.appendChild(option);
			}
			
			// make sure the dimensions are what we want them to be
			util.setStyle(data.dropdown, {"visibility":"hidden"});
			data.wrapper.appendChild(data.dropdown);
			
			var dItemBorders = util.getBorderWidths(data.dropdown.children[1]);
			var dropdownHeight = util.getNumFromProp(dItemBorders.top) + util.getNumFromProp(dItemBorders.bottom); 
			data.dropdownItemHeight = data.dropdownItems[0].clientHeight;
			data.leftDropdownPos = data.rowArray[0][data.firstDataColumn].offsetLeft;
			
			var icon = elementStore["span"].cloneNode();
			icon.setAttribute("class","actionIcon");
			data.dropdown.appendChild(icon);
			
			functions.collapseDropdown(); // initialize placement in collapsed state
			
		},
		changeDisplayedColumn: function(colIndex) {
			if (colIndex >= (data.numberOfColumns - data.dataColumnsDisplayed)) {
				colIndex = data.numberOfColumns - data.dataColumnsDisplayed - 1; // if over max, set to max; -1 is to convert count to index
			} else if (colIndex < 0) {
				colIndex = 0; // if below min, set to min
			}
			
			data.currentDisplayedColumn = colIndex + 1;
			data.translateXOffset = (-1 * (colIndex * data.columnWidth));
			
			if (data.translateXOffset > 0) { // make sure this is always no further right than a 0 margin - else it effectively makes the data cells right-align
				data.translateXOffset = 0;	
			}
			for (var i = 0; i < data.numberOfRows; i++) {
				util.setStyle(data.columns[data.firstDataColumn][i], { // we'll always set margin on the 1st column of data - this leaves row headings in place
					"height": data.cellHeights[1][i] + "px",
					"margin-left": data.translateXOffset + "px"
				});
			}	
		},
		// if more than one data column is displayed, we don't want to let the user pick a column that would result in fewer than this number being displayed.
		// this effectively disables those 
		setSelectableItems: function() {
			var maxDisplayableCols = data.numberOfColumns - data.dataColumnsDisplayed; 
			for (var i = 0; i < data.numberOfColumns; i++) {
				var option = data.dropdownItems[i];
				if (i > maxDisplayableCols) {
					util.addClass(option, "unselectable");
					util.removeClass(option, "selected");
				} else {
					util.removeClass(option, "unselectable");
				}
			}
			if (data.dropdown.parentNode && maxDisplayableCols <= 0) {
				data.dropdown = data.wrapper.removeChild(data.dropdown);
			} else if (!data.dropdown.parentNode) {
				data.wrapper.appendChild(data.dropdown);	
			}
		},
		// Set up swipe!
		// when the user releases, this derives the theoretical column we should snap to;
		// since functions.changeDisplayedColumn manages out-of-bounds, we don't have to here.
		getColumnFromPosition: function(xpos) {
			var colIndex = 0;
			colIndex = Math.round((-1 * xpos) / data.columnWidth);
			return colIndex;
		},
		// adapt to available viewport (resize handling) 
		setColumnsToDisplay: function() {
			var wrapperWidth = util.getWidth(data.wrapper);
			data.dataColumnsDisplayed = (Math.floor(wrapperWidth / data.columnWidth) - data.firstDataColumn);
			var tableDisplayWidth = data.dataColumnsDisplayed + data.firstDataColumn;
			util.setStyle(data.table, {
				"width": (data.columnWidth * tableDisplayWidth) + "px",
				"max-width": data.maxTableWidth + "px"
			});
			var properStartCol = data.numberOfColumns - data.dataColumnsDisplayed;
			if (data.currentDisplayedColumn > properStartCol) {
				functions.changeDisplayedColumn(properStartCol);
			}
			functions.setSelectableItems();
		},
		collapseDropdown: function() {
			util.setStyle(data.dropdown, {"height": data.dropdownItemHeight + "px", "left": data.leftDropdownPos + "px", "width": data.dropdownWidth + "px"});
			util.removeClass(data.dropdown, "expanded");
			d.removeEventListener("click", functions.collapseDropdown);
		},
		showDropdown: function(e) {
			for (var i = 0; i < data.numberOfColumns; i++) {
				if (i == data.currentDisplayedColumn) {
					data.dropdownItems[i].setAttribute("class","selected");
				} else if (!util.hasClass(data.dropdownItems[i], "unselectable")) {
					data.dropdownItems[i].removeAttribute("class");
				}
			}
			util.setStyle(data.dropdown, {"left": data.leftDropdownPos + "px", "width": data.dropdownWidth + "px"});
			util.addClass(data.dropdown, "expanded");
			e.stopPropagation();
			d.addEventListener("click", functions.collapseDropdown);
			
		},		
		selectColumn: function(e) {
			var index = Number(e.target.getAttribute("data-index")) || Number(e.target.parentNode.getAttribute("data-index"));
			if (index >= data.firstDataColumn && index <= (data.numberOfColumns - data.dataColumnsDisplayed)) {
				functions.changeDisplayedColumn((index - 1));
			}
			functions.collapseDropdown(e);
		},
		toggleDropdown: function(e) {
			if (util.hasClass(data.dropdown, "expanded")) {
				functions.selectColumn(e);
			} else {
				functions.showDropdown(e);
			}
		},
		startMove: function(e) {
			e.preventDefault();
			util.addClass(data.table, "interactive");
			data.startX = data.deltaX = 0; // reset
			data.startX = e.changedTouches?e.changedTouches[0].clientX:e.clientX;
			data.interactive = true;
		},		
		doMove: function(e) {
			e.preventDefault();
			if (!data.interactive) return;
			data.deltaX = e.changedTouches?e.changedTouches[0].clientX:e.clientX;
			data.deltaX = data.deltaX - data.startX;
			var newTranslate = data.translateXOffset + data.deltaX,
				maxTranslate = ((data.numberOfColumns - data.dataColumnsDisplayed - data.firstDataColumn) * data.columnWidth * -1) - 50; // 50 is arbitrary, but defines how far past the edge;
				
			if (newTranslate < maxTranslate) {
				if (!util.hasClass(data.table, "maxRight")) {
					util.addClass(data.table, "maxRight");
				}
			} else if (newTranslate > 50) {
				if (!util.hasClass(data.table, "maxLeft")) {
					util.addClass(data.table, "maxLeft");
				}
			} else {
				for (var i = 0; i < data.numberOfRows; i++) {
					// we'll always set margin on the 1st column of data - this leaves row headings in place
					util.setStyle(data.columns[data.firstDataColumn][i], {"height": data.rowHeights[i] + "px", "margin-left": newTranslate + "px"});
				}
			}
		},
		endMove: function(e) {
			e.preventDefault();
			util.removeClass(data.table, "interactive");
			util.removeClass(data.table, "maxRight");
			util.removeClass(data.table, "maxLeft");
			data.interactive = false;
			functions.changeDisplayedColumn(functions.getColumnFromPosition(data.deltaX + data.translateXOffset));
		},
		addEventListeners: function() {
			data.dropdown.addEventListener("click", functions.toggleDropdown);
			// event listeners for dragable columns
			var tbody = data.wrapper.querySelector("tbody");
			tbody.addEventListener("mousedown", functions.startMove);
			tbody.addEventListener("mousemove", functions.doMove);
			tbody.addEventListener("mouseup", functions.endMove);
			data.table.addEventListener("mouseleave", functions.endMove); // capture mouse exits and end move. If we don't, the user has to startMove again before they can end it.
			if (("ontouchstart" in d)) {
				tbody.addEventListener("touchstart", functions.startMove);
				tbody.addEventListener("touchmove", functions.doMove);
				tbody.addEventListener("touchend", functions.endMove);
				tbody.addEventListener("touchcancel", functions.endMove);
			}
			
			w.addEventListener("resize", functions.setColumnsToDisplay);
			//w.addEventListener("orientationchange", functions.setColumnsToDisplay);
		},
		initialize: function() {
			functions.initializeTable(); // set up the table
			functions.initializeDropdown(); // build the dropdown
			functions.setColumnsToDisplay(); // make sure everything is displaying correctly
			functions.addEventListeners(); // let the user interact with the table now.
		}		
	};
	
	functions.initialize();
	
})(document, window);

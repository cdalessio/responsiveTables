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

(function (d,w) {
	// utility functions that most libraries will provide in one way or another
	getNumFromProp = function(p) {
		return Math.round(Number(p.replace(/[^\.0-9]/g,"")));	
	}
	var getBorderWidths = function(el) {
		var st = w.getComputedStyle(el);
		return {
			"top":st.getPropertyValue("border-top-width"), 
			"right":st.getPropertyValue("border-right-width"), 
			"bottom":st.getPropertyValue("border-bottom-width"), 
			"left":st.getPropertyValue("border-left-width")
		};
	}
	var getWidth = function(el) {
		var wd = el.clientWidth;
		var wds = getBorderWidths(el);
		wd = wd + getNumFromProp(wds.right) + getNumFromProp(wds.left);
		return wd;
	}
	var setStyle = function(el,styles) {
		var styleString = "", key;
		for (key in styles) {
			styleString += key + ":" + styles[key] + ";";
		}
		el.setAttribute("style", styleString);
	}
	var addClass = function(el, className) {
		var ccn = el.getAttribute("class") || "";
		el.setAttribute("class", ccn + " " + className);
	}
	var removeClass = function(el, className) {
		var ccna = el.getAttribute("class").split(" "), classNames = "";
		var l = ccna.length, i;
		for (i = 0; i < l; i++) {
			var ccn = ccna[i]; 
			if(!(ccn == className)) {
				classNames += ccn + " "
			}
		}
		el.setAttribute("class", classNames.trim());
	}
	var hasClass = function(el, className) {
		var classAttr = el.getAttribute("class"), matchRegx = new RegExp("\\s*"+className+"\\s*");
		return (classAttr && matchRegx.test(classAttr));
	}
	
	var wrapper = d.querySelector(".responsiveTableWrapper"), table = d.querySelector(".responsiveTableWrapper table");
	var rows = table.querySelectorAll("tr"), wrapperWidth = getWidth(wrapper), rowArray = [], columns = [];
	var firstDataColumn = 1, dataColumnsDisplayed = 1;
	
	// let the table define itself with proper cell widths so we can get dimensions properly
	wrapper.setAttribute("style","visibility: hidden; width: 100000px;");
	
	// exit init if we're already able to fit the whole table!
	tableWidth = getWidth(table);
	if (tableWidth < wrapperWidth) {
		wrapper.removeAttribute("style");
		return;	
	}
	
	// get some data from the table so we can change elements to block/inline-block display
	var numberOfRows = rows.length, numberOfColumns, rowHeights = [];
	// gather rows and set row heights;
	for (var i = 0; i < numberOfRows; i++) {
		var currentRow = rows[i];
		var currentRowArray = rowArray[i] = currentRow.querySelectorAll("th, td"); // store this for easy access later without DOM crawling
		var h = rowHeights[i] = currentRow.clientHeight, numberOfColumns = currentRowArray.length;
		for (var j = 0; j < numberOfColumns; j++) { // set the heights, store references to column array for easy access later without DOM crawling
			if (!columns[j]) {
				columns[j] = [];
			}
			var currentCell = columns[j][i] = currentRowArray[j];
			if (j === 0 && currentCell.nodeName != "TH") {
				firstDataColumn = 0;
			}
			setStyle(currentCell, {"height":h+"px"});
		}
	}
	
	// clean up temporary style and enable responsive CSS properties
	wrapper.removeAttribute("style");
	
	addClass(table, "responsive");
	var columnWidth = getWidth(columns[0][0]), tableWidth = getWidth(table);
	var currentDisplayedColumn = 1, translateXOffset = 0, dataColumnsDisplayed = (Math.floor(wrapperWidth / columnWidth) - firstDataColumn);
	var tableDisplayWidth = dataColumnsDisplayed + firstDataColumn;
	setStyle(table, {
		"width": (columnWidth * tableDisplayWidth) + "px"		
	});
	var changeDisplayedColumn = function(colIndex) {
		if (colIndex >= (numberOfColumns - dataColumnsDisplayed)) {
			colIndex = numberOfColumns - dataColumnsDisplayed - 1; // if over max, set to max; -1 is to convert count to index
		} else if (colIndex < 0) {
			colIndex = 0; // if below min, set to min
		}
		
		currentDisplayedColumn = colIndex + 1, translateXOffset = (-1 * (colIndex * columnWidth))
		for (var i = 0; i < numberOfRows; i++) {
			// we'll always set margin on the 1st column of data - this leaves row headings in place
			setStyle(columns[firstDataColumn][i], {
				"height":rowHeights[i]+"px",
				"margin-left": translateXOffset + "px"
			});
		}	
	};
	
	// build a dropdown out of column headings
	var elementStore = {}; // cloneNode seems to perform best in almost every case, so we'll create once, store, and clone. this use case may be simple enough this isn't useful.
	elementStore["div"] = d.createElement("div"), elementStore["span"] = d.createElement("span");
	
	var dropdown = elementStore["div"].cloneNode();
	dropdown.setAttribute("class", "colHeadingDropdown");
	var dropdownBorderWidths = getBorderWidths(dropdown);
	var hBorderSum = getNumFromProp(dropdownBorderWidths.left) + getNumFromProp(dropdownBorderWidths.right);
	var dropdownItems = [], dropdownWidth = (columnWidth - hBorderSum);
	// create options
	for (var i = 0; i < numberOfColumns; i++) {
		var option = dropdownItems[i] = elementStore["div"].cloneNode();
		option.innerHTML = rowArray[0][i].innerHTML + "&nbsp;";
		option.setAttribute("data-index", i);
		if (i > (numberOfColumns - dataColumnsDisplayed)) {
			addClass(option, "unselectable");
		}
		dropdown.appendChild(option);
	}
	// make sure the dimensions are what we want them to be
	setStyle(dropdown, {"visibility":"hidden"});
	wrapper.appendChild(dropdown);
	var dItemBorders = getBorderWidths(dropdown.children[1]);
	var dropdownHeight = getNumFromProp(dItemBorders.top) + getNumFromProp(dItemBorders.bottom), itemHeight = dropdownItems[0].clientHeight;
	dropdownHeight = numberOfRows * (itemHeight + dropdownHeight);
	
	var collapseDropdown = function() {
		setStyle(dropdown, {"height": itemHeight + "px", "left": (firstDataColumn * dropdownWidth) + "px", "width": dropdownWidth + "px"});
		removeClass(dropdown, "expanded");
	}
	collapseDropdown(); // initialize placement in collapsed state
	var showDropdown = function() {
		for (var i = 0; i < numberOfColumns; i++) {
			if (i == currentDisplayedColumn) {
				dropdownItems[i].setAttribute("class","selected");
			} else if (!hasClass(dropdownItems[i], "unselectable")) {
				dropdownItems[i].removeAttribute("class");
			}
		}
		setStyle(dropdown, {"height": dropdownHeight + "px", "left": (firstDataColumn * dropdownWidth) + "px", "width": dropdownWidth + "px"});
		addClass(dropdown, "expanded");
	};
	var selectColumn = function(e) {
		var index = Number(e.target.getAttribute("data-index")) || Number(e.target.parentNode.getAttribute("data-index"));
		if (index >= firstDataColumn && index <= (numberOfColumns - dataColumnsDisplayed)) {
			changeDisplayedColumn((index - 1));
		}
		collapseDropdown();
	};
	var toggleDropdown = function(e) {
		if (hasClass(dropdown, "expanded")) {
			selectColumn(e);
		} else {
			showDropdown();
		}
	}
	
	var icon = elementStore["span"].cloneNode();
	icon.setAttribute("class","actionIcon");
	dropdown.appendChild(icon);
	dropdown.addEventListener("click", toggleDropdown);
	
	// Set up swipe!
	// when the user releases, this derives the theoretical column we should snap to;
	// since changeDisplayedColumn manages out-of-bounds, we don't have to here.
	var getColumnFromPosition = function(xpos) {
		var colIndex = 0;
		colIndex = Math.round((-1 * xpos) / columnWidth);
		return colIndex;
	}
	var startX = deltaX = 0, interactive = false;
	var startMove = function(e) {
		addClass(table, "interactive");
		startX = e.clientX;
		interactive = true;
	}
	var doMove = function(e) {
		e.preventDefault();
		if (!interactive) return;
		deltaX = e.clientX - startX;
		var newTranslate = translateXOffset + deltaX, maxTranslate = ((numberOfColumns - dataColumnsDisplayed - firstDataColumn) * columnWidth * -1) - 50;
		if (newTranslate < maxTranslate) {
			if (!hasClass(table, "maxRight")) {
				addClass(table, "maxRight");
			}
		} else if (newTranslate > 50) {
			if (!hasClass(table, "maxLeft")) {
				addClass(table, "maxLeft");
			}
		} else {
			for (var i = 0; i < numberOfRows; i++) {
				// we'll always set margin on the 1st column of data - this leaves row headings in place
				setStyle(columns[firstDataColumn][i],{"height":rowHeights[i]+"px", "margin-left": newTranslate + "px"});
			}
		}
	}
	var endMove = function(e) {
		removeClass(table, "interactive");
		removeClass(table, "maxRight");
		removeClass(table, "maxLeft");
		interactive = false;
		changeDisplayedColumn(getColumnFromPosition(deltaX + translateXOffset));
	}
	var tbody = wrapper.querySelector("tbody");
	tbody.addEventListener("mousedown", startMove);
	tbody.addEventListener("mousemove", doMove);
	tbody.addEventListener("mouseup", endMove);
	
})(document, window);

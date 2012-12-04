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
	var wrapper = d.querySelector(".responsiveTableWrapper"), table = d.querySelector(".responsiveTableWrapper table");
	var rows = table.querySelectorAll("tr"), rowArray = [], columns = [], headColumn;
	var firstDataColumn = 1;
	
	// utility functions that most libraries will provide in one way or another
	getNumFromProp = function(p) {
		return Number(p.replace(/[^0-9]/g,""));	
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
	
	// let the table define itself with proper cell widths so we can get dimensions properly
	wrapper.setAttribute("style","visibility: hidden; width: 100000px;");
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
			if (j === 0 && currentCell.nodeName.toLowerCase() != "th") {
				firstDataColumn = 0;
			}
			setStyle(currentCell, {"height":h+"px"});
		}
	}
	
	// clean up temporary style and enable responsive CSS properties
	wrapper.removeAttribute("style");
	var currentClassNames = table.getAttribute("class") || "";
	table.setAttribute("class", currentClassNames + " responsive");
	var columnWidth = getWidth(columns[1][1]);
	var currentDisplayedColumn = 1;
	
	var changeDisplayedColumn = function(colIndex) {
		if (colIndex >= (numberOfColumns - 1)) {
			colIndex = numberOfColumns -2; // if over max, set to max
		} else if (colIndex < 0) {
			colIndex = 0; // if below min, set to min
		}
		currentDisplayedColumn = colIndex + 1;
		for (var i = 0; i < numberOfRows; i++) {
			// we'll always set margin on the 1st column of data - this leaves row headings in place
			//columns[firstDataColumn][i].setAttribute("style","height: " + rowHeights[i] + "px; margin-left: -" + (colIndex * columnWidth) + "px;");
			setStyle(columns[firstDataColumn][i],{"height":rowHeights[i]+"px","margin-left":(-1*(colIndex * columnWidth))+"px"});
		}	
	};
	
	// build a dropdown out of column headings
	var elementStore = {}; // cloneNode seems to perform best in almost every case, so we'll create once, store, and clone. this use case may be simple enough this isn't useful.
	elementStore["div"] = d.createElement("div"), elementStore["span"] = d.createElement("span");
	
	var dropdown = elementStore["div"].cloneNode();
	dropdown.setAttribute("class", "colHeadingDropdown");
	var dropdownBorderWidths = getBorderWidths(dropdown);
	var hBorderSum = getNumFromProp(dropdownBorderWidths.left) + getNumFromProp(dropdownBorderWidths.right);
	var dropdownItems = [], dropdownWidth = (columnWidth - hBorderSum) + "px";
	setStyle(dropdown, {"width": dropdownWidth});
	// create options
	for (var i = 0; i < numberOfColumns; i++) {
		var option = dropdownItems[i] = elementStore["div"].cloneNode();
		option.innerHTML = rowArray[0][i].innerHTML + "&nbsp;";
		option.setAttribute("data-index", i);
		dropdown.appendChild(option);
	}
	// make sure the dimensions are what we want them to be
	setStyle(dropdown,{"visibility":"hidden","width":dropdownWidth});
	wrapper.appendChild(dropdown);
	var dItemBorders = getBorderWidths(dropdown.children[1]);
	var dropdownHeight = getNumFromProp(dItemBorders.top) + getNumFromProp(dItemBorders.bottom);
	dropdownHeight = numberOfRows * (dropdownItems[0].clientHeight + dropdownHeight);
	setStyle(dropdown,{"opacity": 0,"height": 0, "width": dropdownWidth});
	
	var showDropdown = function() {
		for (var i = 0; i < numberOfColumns; i++) {
			if (i == currentDisplayedColumn) {
				dropdownItems[i].setAttribute("class","selected");
			} else {
				dropdownItems[i].removeAttribute("class");
			}
		}
		setStyle(dropdown, {"height": dropdownHeight+"px", "width": dropdownWidth});
	};
	var selectColumn = function(e) {
		var index = Number(e.target.getAttribute("data-index")) || Number(e.target.parentNode.getAttribute("data-index"));
		if (index >= firstDataColumn) {
			changeDisplayedColumn((index - 1));
		}
		setStyle(dropdown, {"opacity": 0, "height": 0, "width": dropdownWidth});
	};
	
	var icon = elementStore["span"].cloneNode();
	icon.setAttribute("class","actionIcon");
	wrapper.appendChild(icon);
	icon.addEventListener("click", showDropdown);
	var thead = table.querySelector("thead");
	thead.addEventListener("click", showDropdown);
	dropdown.addEventListener("click", selectColumn);
	
})(document, window);

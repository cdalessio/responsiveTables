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
			currentCell.setAttribute("style","height:"+h+"px");
		}
	}
	
	// clean up temporary style and enable responsive CSS properties
	wrapper.removeAttribute("style");
	var currentClassNames = table.getAttribute("class") || "";
	table.setAttribute("class", currentClassNames + " responsive");
	var columnWidth = (columns[0][0].clientWidth + Number(w.getComputedStyle(columns[1][1],null).getPropertyValue("border-right-width").replace(/[^0-9]/g,"")));
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
			columns[firstDataColumn][i].setAttribute("style","height: " + rowHeights[i] + "px; margin-left: -" + (colIndex * columnWidth) + "px;");
		}	
	};
	
	// build a dropdown out of column headings
	var elementStore = {}; // cloneNode seems to perform best in almost every case, so we'll create once, store, and clone. this use case may be simple enough this isn't useful.
	elementStore["div"] = d.createElement("div"), elementStore["span"] = d.createElement("span");
	
	var dropdown = elementStore["div"].cloneNode();
	dropdown.setAttribute("class","colHeadingDropdown");
	var borderWidth = Number(w.getComputedStyle(dropdown,null).getPropertyValue("border-left-width").replace(/[^0-9]/g,"")) + Number(w.getComputedStyle(dropdown,null).getPropertyValue("border-right-width").replace(/[^0-9]/g,""));
	var dropdownItems = [], dropdownWidth = (columnWidth - borderWidth) + "px";
	dropdown.setAttribute("style","width: " + dropdownWidth);
	// create options
	for (var i = 0; i < numberOfColumns; i++) {
		var option = dropdownItems[i] = elementStore["div"].cloneNode();
		option.innerHTML = rowArray[0][i].innerHTML + "&nbsp;";
		option.setAttribute("data-index",i);
		dropdown.appendChild(option);
	}
	// make sure the dimensions are what we want them to be
	dropdown.setAttribute("style","visibility: hidden; width: " + dropdownWidth);
	wrapper.appendChild(dropdown);
	var dropdownHeight = Number(w.getComputedStyle(dropdown.children[1],null).getPropertyValue("border-top-width").replace(/[^0-9]/g,""))
	var dropdownHeight = numberOfRows * (dropdownItems[0].clientHeight + dropdownHeight);
	dropdown.setAttribute("style","opacity: 0; height: 0; width: " + dropdownWidth);
	
	var showDropdown = function() {
		for (var i = 0; i < numberOfColumns; i++) {
			if (i == currentDisplayedColumn) {
				dropdownItems[i].setAttribute("class","selected");
			} else {
				dropdownItems[i].removeAttribute("class");
			}
		}
		dropdown.setAttribute("style","height: " + dropdownHeight + "px; width: " + dropdownWidth)
	};
	var selectColumn = function(e) {
		var index = Number(e.target.getAttribute("data-index")) || Number(e.target.parentNode.getAttribute("data-index"));
		if (index >= firstDataColumn) {
			changeDisplayedColumn((index - 1));
		}
		dropdown.setAttribute("style","opacity: 0; height: 0; width: " + dropdownWidth);
	};
	
	var icon = elementStore["span"].cloneNode();
	icon.setAttribute("class","actionIcon");
	wrapper.appendChild(icon);
	var thead = table.querySelector("thead");
	thead.addEventListener("click", showDropdown);
	dropdown.addEventListener("click", selectColumn);
	
})(document, window);

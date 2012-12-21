responsiveTables
================

Copyright 2012 CJD (Christopher D'Alessio)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.



Responsive table presentation solutions
=======================================

Ever try to view a table on a phone? It's not much fun. Here is a simple solution to this problem. 
It won't solve for every case,  but it will handle a lot. There are a handful of really good solutions 
out there that may solve your case better.

You get a simple way for a user to identify what their column options are (a dropdown of available columns)
or the option to simply scroll through the columns.

This does not support every browser, but it should work for the most common mobile browsers - it depends on querySelector and some CSS transformations. 
It could be converted to use your favorite javascript library, which would extend browser support. It probably won't work well in proxy browsers (Opera Mini, etc.)
Without the JavaScript, it will display as a plain table, so you can always leave the script out.

What works:

* Takes a table to a simple two (or more) column layout
* Creates a drop-down out of first row cells (ideally, your thead th's), allowing a user to change which columns display.
* Works with or without a TH per row.
* Mouse click/drag "swipe"
* Initial touch event support (should work, but not thoroughly tested)
* Responsive/adaptive, tailoring number of displayed columns to available space
* End-of-range highlighting when click/dragging

This is still in-progress, but I think it may be more polish than function still remaining at this point. Browser-compatibility will be covered when this is ported to a JavaScript library that includes this

Expect versions supporting some popular JS libraries once the core functionality is polished.

Known issues:

* Does not work with colspan or rowspan (yet?)
* IE etc. support lacking (depends on querySelector and similar, available in modern browsers...)
* May not work fully with other CSS - it may, not fully tested yet. This may take a while, so if you use this and find bugs please let me know!

Version 0.5

Basic Markup pattern
--------------------


                <link rel="stylesheet" type="text/css" rel="stylesheet" href="./style/responsiveTables.css" media="all"/>
                
                <div class="responsiveTableWrapper">
                    <table class="basic">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Monday</th>
                                <th>Tuesday</th>
                                <th>Wednesday</th>
                                <th>Thursday</th>
                                <th>Friday</th>
                                <th>Saturday</th>
                                <th>Sunday</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>Row Heading</th>
                                <td>1</td>
                                <td>2</td>
                                <td>3</td>
                                <td>4</td>
                                <td>5</td>
                                <td>6</td>
                                <td>7</td>
                            </tr>
                            <!-- add rows as appropriate -->
                        </tbody>
                        <tfoot>
                            <tr>
                                <th></th>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        
                        </tfoot>
                    </table>
                </div>
                
                <script type="text/javascript" src="./script/responsiveTables.js"></script>

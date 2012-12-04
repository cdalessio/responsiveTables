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

Ever try to view a table on a phone? It's not much fun. Here are a couple simple solutions to this problem.
It won't solve for every case, but it will handle a lot. This does not support every browser, but it should 
work for the most common mobile browsers - it depends on querySelector and some CSS transformations. It could 
be converted to use your favorite javascript library, which would extend browser support. It probably won't 
work well in proxy browsers (Opera Mini, etc.) Without the javascript, it will display as a plain table, so 
you can always leave that out.

What works:

    Takes a table to a simple two-column layout
    Creates a drop-down out of first row cells (ideally, your thead th's), allowing a user to change which columns display.
    Works with or without a TH per row.
    Mouse click/drag "swipe"

This is very much still in-progress.

Expect versions supporting some popular JS libraries once the core functionality is polished.

Known issues:

    Does not work correctly with colspan or rowspan (yet?)
    IE support lacking
    Not yet ideally responsive - it cuts any table to a two-column layout, but still adapts to viewport - that can make for some
    	rather wide tables.
    No TH per row needs a bit of buffing up visually - dropdown is still only half-width
    Does not yet support touch/swipe to move through columns
    May not work fully with other CSS (though color changes should be fine) - it may, it's just not fully tested yet.

Version 0.2

Basic Markup pattern
--------------------


                &lt;link rel=&quot;stylesheet&quot; type=&quot;text/css&quot; rel=&quot;stylesheet&quot; href=&quot;./style/responsiveTables.css&quot; media=&quot;all&quot;/&gt;
                
                &lt;div class=&quot;responsiveTableWrapper&quot;&gt;
                    &lt;table class=&quot;basic&quot;&gt;
                        &lt;thead&gt;
                            &lt;tr&gt;
                                &lt;th&gt;&lt;/th&gt;
                                &lt;th&gt;&lt;span&gt;Monday&lt;/span&gt;&lt;/th&gt;
                                &lt;th&gt;&lt;span&gt;Tuesday&lt;/span&gt;&lt;/th&gt;
                                &lt;th&gt;&lt;span&gt;Wednesday&lt;/span&gt;&lt;/th&gt;
                                &lt;th&gt;&lt;span&gt;Thursday&lt;/span&gt;&lt;/th&gt;
                                &lt;th&gt;&lt;span&gt;Friday&lt;/span&gt;&lt;/th&gt;
                                &lt;th&gt;&lt;span&gt;Saturday&lt;/span&gt;&lt;/th&gt;
                                &lt;th&gt;&lt;span&gt;Sunday&lt;/span&gt;&lt;/th&gt;
                            &lt;/tr&gt;
                        &lt;/thead&gt;
                        &lt;tbody&gt;
                            &lt;tr&gt;
                                &lt;th&gt;&lt;span&gt;Row Heading&lt;/span&gt;&lt;/th&gt;
                                &lt;td&gt;&lt;span&gt;1&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;2&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;3&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;4&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;5&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;6&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;7&lt;/span&gt;&lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;!-- add rows as appropriate
                        &lt;/tbody&gt;
                        &lt;tfoot&gt;
                            &lt;tr&gt;
                                &lt;th&gt;&lt;span&gt;&lt;/span&gt;&lt;/th&gt;
                                &lt;td&gt;&lt;span&gt;&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;&lt;/span&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span&gt;&lt;/span&gt;&lt;/td&gt;
                            &lt;/tr&gt;
                        
                        &lt;/tfoot&gt;
                    &lt;/table&gt;
                &lt;/div&gt;
                
                &lt;script type=&quot;text/javascript&quot; src=&quot;./script/responsiveTables.js&quot;&gt;&lt;/script&gt;

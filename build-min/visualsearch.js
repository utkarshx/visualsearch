(function(){var a=jQuery;if(!window.VS){window.VS={}}if(!VS.app){VS.app={}}if(!VS.ui){VS.ui={}}if(!VS.model){VS.model={}}if(!VS.utils){VS.utils={}}VS.VERSION="0.2.1";VS.VisualSearch=function(b){var c={container:"",query:"",unquotable:[],facetAutocompleteMinLength:1,callbacks:{search:a.noop,focus:a.noop,blur:a.noop,facetMatches:a.noop,valueMatches:a.noop}};this.options=_.extend({},c,b);this.options.callbacks=_.extend({},c.callbacks,b.callbacks);VS.app.hotkeys.initialize();this.searchQuery=new VS.model.SearchQuery();this.searchBox=new VS.ui.SearchBox({app:this,autocompleteMinLength:this.options.facetAutocompleteMinLength});if(b.container){var d=this.searchBox.render().el;a(this.options.container).html(d)}this.searchBox.value(this.options.query||"");a(window).bind("unload",function(f){});return this};VS.init=function(b){return new VS.VisualSearch(b)}})();(function(){var a=jQuery;VS.ui.SearchBox=Backbone.View.extend({id:"search",events:{"click .VS-cancel-search-box":"clearSearch","mousedown .VS-search-box":"maybeFocusSearch","dblclick .VS-search-box":"highlightSearch","click .VS-search-box":"maybeTripleClick"},initialize:function(){this.app=this.options.app;this.flags={allSelected:false};this.facetViews=[];this.inputViews=[];_.bindAll(this,"renderFacets","_maybeDisableFacets","disableFacets","deselectAllFacets");this.app.searchQuery.bind("reset",this.renderFacets);a(document).bind("keydown",this._maybeDisableFacets)},render:function(){a(this.el).append(JST.search_box({}));a(document.body).setMode("no","search");return this},value:function(b){if(b==null){return this.serialize()}return this.setQuery(b)},serialize:function(){var c=[];var b=this.inputViews.length;this.app.searchQuery.each(_.bind(function(e,d){c.push(this.inputViews[d].value());c.push(e.serialize())},this));if(b){c.push(this.inputViews[b-1].value())}return _.compact(c).join(" ")},setQuery:function(b){this.currentQuery=b;VS.app.SearchParser.parse(this.app,b)},viewPosition:function(d){var c=d.type=="facet"?this.facetViews:this.inputViews;var b=_.indexOf(c,d);if(b==-1){b=0}return b},searchEvent:function(c){var b=this.value();this.focusSearch(c);this.value(b);this.app.options.callbacks.search(b,this.app.searchQuery)},addFacet:function(e,c,b){e=VS.utils.inflector.trim(e);c=VS.utils.inflector.trim(c||"");if(!e){return}var d=new VS.model.SearchFacet({category:e,value:c||"",app:this.app});this.app.searchQuery.add(d,{at:b});this.renderFacets();var f=_.detect(this.facetViews,function(g){if(g.model==d){return true}});_.defer(function(){f.enableEdit()})},renderFacets:function(){this.facetViews=[];this.inputViews=[];this.$(".VS-search-inner").empty();this.app.searchQuery.each(_.bind(function(c,b){this.renderFacet(c,b)},this));this.renderSearchInput()},renderFacet:function(d,b){var c=new VS.ui.SearchFacet({app:this.app,model:d,order:b});this.renderSearchInput();this.facetViews.push(c);this.$(".VS-search-inner").children().eq(b*2).after(c.render().el);c.calculateSize();_.defer(_.bind(c.calculateSize,c));return c},renderSearchInput:function(){var b=new VS.ui.SearchInput({position:this.inputViews.length,app:this.app,autocompleteMinLength:this.options.autocompleteMinLength});this.$(".VS-search-inner").append(b.render().el);this.inputViews.push(b)},clearSearch:function(c){var b=_.bind(function(){this.disableFacets();this.value("");this.flags.allSelected=false;this.searchEvent(c);this.focusSearch(c)},this);if(this.app.options.callbacks.clearSearch){this.app.options.callbacks.clearSearch(b)}else{b()}},selectAllFacets:function(){this.flags.allSelected=true;a(document).one("click.selectAllFacets",this.deselectAllFacets);_.each(this.facetViews,function(c,b){c.selectFacet()});_.each(this.inputViews,function(b,c){b.selectText()})},allSelected:function(b){if(b){this.flags.allSelected=false}return this.flags.allSelected},deselectAllFacets:function(d){this.disableFacets();if(this.$(d.target).is(".category,input")){var c=a(d.target).closest(".search_facet,.search_input");var b=_.detect(this.facetViews.concat(this.inputViews),function(e){return e.el==c[0]});if(b.type=="facet"){b.selectFacet()}else{if(b.type=="input"){_.defer(function(){b.enableEdit(true)})}}}},disableFacets:function(b){_.each(this.inputViews,function(c){if(c&&c!=b&&(c.modes.editing=="is"||c.modes.selected=="is")){c.disableEdit()}});_.each(this.facetViews,function(c){if(c&&c!=b&&(c.modes.editing=="is"||c.modes.selected=="is")){c.disableEdit();c.deselectFacet()}});this.flags.allSelected=false;this.removeFocus();a(document).unbind("click.selectAllFacets")},resizeFacets:function(b){_.each(this.facetViews,function(d,c){if(!b||d==b){d.resize()}})},_maybeDisableFacets:function(b){if(this.flags.allSelected&&VS.app.hotkeys.key(b)=="backspace"){b.preventDefault();this.clearSearch(b);return false}else{if(this.flags.allSelected&&VS.app.hotkeys.printable(b)){this.clearSearch(b)}}},focusNextFacet:function(h,g,d){d=d||{};var f=this.facetViews.length;var c=d.viewPosition||this.viewPosition(h);if(!d.skipToFacet){if(h.type=="text"&&g>0){g-=1}if(h.type=="facet"&&g<0){g+=1}}else{if(d.skipToFacet&&h.type=="text"&&f==c&&g>=0){c=0;g=0}}var b,e=Math.min(f,c+g);if(h.type=="text"){if(e>=0&&e<f){b=this.facetViews[e]}else{if(e==f){b=this.inputViews[this.inputViews.length-1]}}if(b&&d.selectFacet&&b.type=="facet"){b.selectFacet()}else{if(b){b.enableEdit();b.setCursorAtEnd(g||d.startAtEnd)}}}else{if(h.type=="facet"){if(d.skipToFacet){if(e>=f||e<0){b=_.last(this.inputViews);b.enableEdit()}else{b=this.facetViews[e];b.enableEdit();b.setCursorAtEnd(g||d.startAtEnd)}}else{b=this.inputViews[e];b.enableEdit()}}}if(d.selectText){b.selectText()}this.resizeFacets()},maybeFocusSearch:function(b){if(a(b.target).is(".VS-search-box")||a(b.target).is(".VS-search-inner")||b.type=="keydown"){this.focusSearch(b)}},focusSearch:function(d,c){var b=this.inputViews[this.inputViews.length-1];b.enableEdit(c);if(!c){b.setCursorAtEnd(-1)}if(d.type=="keydown"){b.keydown(d);b.box.trigger("keydown")}_.defer(_.bind(function(){if(!this.$("input:focus").length){b.enableEdit(c)}},this))},highlightSearch:function(c){if(a(c.target).is(".VS-search-box")||a(c.target).is(".VS-search-inner")||c.type=="keydown"){var b=this.inputViews[this.inputViews.length-1];b.startTripleClickTimer();this.focusSearch(c,true)}},maybeTripleClick:function(c){var b=this.inputViews[this.inputViews.length-1];return b.maybeTripleClick(c)},addFocus:function(){this.app.options.callbacks.focus();this.$(".VS-search-box").addClass("VS-focus")},removeFocus:function(){this.app.options.callbacks.blur();var b=_.any(this.facetViews.concat(this.inputViews),function(c){return c.isFocused()});if(!b){this.$(".VS-search-box").removeClass("VS-focus")}},showFacetCategoryMenu:function(c){c.preventDefault();c.stopPropagation();if(this.facetCategoryMenu&&this.facetCategoryMenu.modes.open=="is"){return this.facetCategoryMenu.close()}var b=[{title:"Account",onClick:_.bind(this.addFacet,this,"account","")},{title:"Project",onClick:_.bind(this.addFacet,this,"project","")},{title:"Filter",onClick:_.bind(this.addFacet,this,"filter","")},{title:"Access",onClick:_.bind(this.addFacet,this,"access","")}];var d=this.facetCategoryMenu||(this.facetCategoryMenu=new dc.ui.Menu({items:b,standalone:true}));this.$(".VS-icon-search").after(d.render().open().content);return false}})})();(function(){var a=jQuery;VS.ui.SearchFacet=Backbone.View.extend({type:"facet",className:"search_facet",events:{"click .category":"selectFacet","keydown input":"keydown","mousedown input":"enableEdit","mouseover .VS-icon-cancel":"showDelete","mouseout .VS-icon-cancel":"hideDelete","click .VS-icon-cancel":"remove"},initialize:function(b){this.flags={canClose:false};_.bindAll(this,"set","keydown","deselectFacet","deferDisableEdit")},render:function(){a(this.el).html(JST.search_facet({model:this.model}));this.setMode("not","editing");this.setMode("not","selected");this.box=this.$("input");this.box.val(this.model.get("value"));this.box.bind("blur",this.deferDisableEdit);this.box.bind("input propertychange",this.keydown);this.setupAutocomplete();return this},calculateSize:function(){this.box.autoGrowInput();this.box.unbind("updated.autogrow");this.box.bind("updated.autogrow",_.bind(this.moveAutocomplete,this))},resize:function(b){this.box.trigger("resize.autogrow",b)},setupAutocomplete:function(){this.box.autocomplete({source:_.bind(this.autocompleteValues,this),minLength:0,delay:0,autoFocus:true,position:{offset:"0 5"},select:_.bind(function(d,c){d.preventDefault();var b=this.model.get("value");this.set(c.item.value);if(b!=c.item.value||this.box.val()!=c.item.value){this.search(d)}return false},this),open:_.bind(function(d,c){var b=this.box;this.box.autocomplete("widget").find(".ui-menu-item").each(function(){var e=a(this);if(e.data("item.autocomplete")["value"]==b.val()){b.data("autocomplete").menu.activate(new a.Event("mouseover"),e)}})},this)});this.box.autocomplete("widget").addClass("VS-interface")},moveAutocomplete:function(){var b=this.box.data("autocomplete");if(b){b.menu.element.position({my:"left top",at:"left bottom",of:this.box.data("autocomplete").element,collision:"flip",offset:"0 5"})}},searchAutocomplete:function(c){var b=this.box.data("autocomplete");if(b){var d=b.menu.element;b.search();d.outerWidth(Math.max(d.width("").outerWidth(),b.element.outerWidth()))}},closeAutocomplete:function(){var b=this.box.data("autocomplete");if(b){b.close()}},autocompleteValues:function(d,f){var c=this.model.get("category");var e=this.model.get("value");var b=d.term;this.options.app.options.callbacks.valueMatches(c,b,function(i,g){g=g||{};i=i||[];if(b&&e!=b){var h=VS.utils.inflector.escapeRegExp(b||"");var j=new RegExp("\\b"+h,"i");i=a.grep(i,function(k){return j.test(k)||j.test(k.value)||j.test(k.label)})}if(g.preserveOrder){f(i)}else{f(_.sortBy(i,function(k){if(k==e||k.value==e){return""}else{return k}}))}})},set:function(b){if(!b){return}this.model.set({value:b})},search:function(c,b){if(!b){b=1}this.closeAutocomplete();this.options.app.searchBox.searchEvent(c);_.defer(_.bind(function(){this.options.app.searchBox.focusNextFacet(this,b,{viewPosition:this.options.order})},this))},enableEdit:function(){if(this.modes.editing!="is"){this.setMode("is","editing");this.deselectFacet();if(this.box.val()==""){this.box.val(this.model.get("value"))}}this.flags.canClose=false;this.options.app.searchBox.disableFacets(this);this.options.app.searchBox.addFocus();_.defer(_.bind(function(){this.options.app.searchBox.addFocus()},this));this.resize();this.searchAutocomplete();this.box.focus()},deferDisableEdit:function(){this.flags.canClose=true;_.delay(_.bind(function(){if(this.flags.canClose&&!this.box.is(":focus")&&this.modes.editing=="is"&&this.modes.selected!="is"){this.disableEdit()}},this),250)},disableEdit:function(){var b=VS.utils.inflector.trim(this.box.val());if(b!=this.model.get("value")){this.set(b)}this.flags.canClose=false;this.box.selectRange(0,0);this.box.blur();this.setMode("not","editing");this.closeAutocomplete();this.options.app.searchBox.removeFocus()},selectFacet:function(c){if(c){c.preventDefault()}var b=this.options.app.searchBox.allSelected();if(this.modes.selected=="is"){return}if(this.box.is(":focus")){this.box.setCursorPosition(0);this.box.blur()}this.flags.canClose=false;this.closeAutocomplete();this.setMode("is","selected");this.setMode("not","editing");if(!b||c){a(document).unbind("keydown.facet",this.keydown);a(document).unbind("click.facet",this.deselectFacet);_.defer(_.bind(function(){a(document).unbind("keydown.facet").bind("keydown.facet",this.keydown);a(document).unbind("click.facet").one("click.facet",this.deselectFacet)},this));this.options.app.searchBox.disableFacets(this);this.options.app.searchBox.addFocus()}return false},deselectFacet:function(b){if(b){b.preventDefault()}if(this.modes.selected=="is"){this.setMode("not","selected");this.closeAutocomplete();this.options.app.searchBox.removeFocus()}a(document).unbind("keydown.facet",this.keydown);a(document).unbind("click.facet",this.deselectFacet);return false},isFocused:function(){return this.box.is(":focus")},showDelete:function(){a(this.el).addClass("search_facet_maybe_delete")},hideDelete:function(){a(this.el).removeClass("search_facet_maybe_delete")},setCursorAtEnd:function(b){if(b==-1){this.box.setCursorPosition(this.box.val().length)}else{this.box.setCursorPosition(0)}},remove:function(c){var b=this.model.get("value");this.deselectFacet();this.disableEdit();this.options.app.searchQuery.remove(this.model);if(b){this.search(c,-1)}else{this.options.app.searchBox.renderFacets();this.options.app.searchBox.focusNextFacet(this,-1,{viewPosition:this.options.order})}},selectText:function(){this.box.selectRange(0,this.box.val().length)},keydown:function(c){var b=VS.app.hotkeys.key(c);if(b=="enter"&&this.box.val()){this.disableEdit();this.search(c)}else{if(b=="left"){if(this.modes.selected=="is"){this.deselectFacet();this.options.app.searchBox.focusNextFacet(this,-1,{startAtEnd:-1})}else{if(this.box.getCursorPosition()==0&&!this.box.getSelection().length){this.selectFacet()}}}else{if(b=="right"){if(this.modes.selected=="is"){c.preventDefault();this.deselectFacet();this.setCursorAtEnd(0);this.enableEdit()}else{if(this.box.getCursorPosition()==this.box.val().length){c.preventDefault();this.disableEdit();this.options.app.searchBox.focusNextFacet(this,1)}}}else{if(VS.app.hotkeys.shift&&b=="tab"){c.preventDefault();this.options.app.searchBox.focusNextFacet(this,-1,{startAtEnd:-1,skipToFacet:true,selectText:true})}else{if(b=="tab"){c.preventDefault();this.options.app.searchBox.focusNextFacet(this,1,{skipToFacet:true,selectText:true})}else{if(VS.app.hotkeys.command&&(c.which==97||c.which==65)){c.preventDefault();this.options.app.searchBox.selectAllFacets();return false}else{if(VS.app.hotkeys.printable(c)&&this.modes.selected=="is"){this.options.app.searchBox.focusNextFacet(this,-1,{startAtEnd:-1});this.remove(c)}else{if(b=="backspace"){if(this.modes.selected=="is"){c.preventDefault();this.remove(c)}else{if(this.box.getCursorPosition()==0&&!this.box.getSelection().length){c.preventDefault();this.selectFacet()}}}}}}}}}}this.resize(c);if(c.which==null){this.searchAutocomplete(c);_.defer(_.bind(this.resize,this,c))}}})})();(function(){var a=jQuery;VS.ui.SearchInput=Backbone.View.extend({type:"text",className:"search_input",events:{"keypress input":"keypress","keydown input":"keydown","click input":"maybeTripleClick","dblclick input":"startTripleClickTimer"},initialize:function(){this.app=this.options.app;this.flags={canClose:false};_.bindAll(this,"removeFocus","addFocus","moveAutocomplete","deferDisableEdit")},render:function(){a(this.el).html(JST.search_input({}));this.setMode("not","editing");this.setMode("not","selected");this.box=this.$("input");this.box.autoGrowInput();this.box.bind("updated.autogrow",this.moveAutocomplete);this.box.bind("blur",this.deferDisableEdit);this.box.bind("focus",this.addFocus);this.setupAutocomplete();return this},setupAutocomplete:function(){this.box.autocomplete({minLength:this.options.autocompleteMinLength,delay:50,autoFocus:true,position:{offset:"0 -1"},source:_.bind(this.autocompleteValues,this),select:_.bind(function(d,c){d.preventDefault();d.stopPropagation();var b=this.options.position;this.app.searchBox.addFacet(c.item instanceof String?c.item:c.item.value,"",b);return false},this)});this.box.data("autocomplete")._renderMenu=function(c,b){var d="";_.each(b,_.bind(function(f,e){if(f.category&&f.category!=d){c.append('<li class="ui-autocomplete-category">'+f.category+"</li>");d=f.category}this._renderItem(c,f)},this))};this.box.autocomplete("widget").addClass("VS-interface")},autocompleteValues:function(d,f){var b=d.term;var e=b.match(/\w+$/);var c=VS.utils.inflector.escapeRegExp(e&&e[0]||"");this.app.options.callbacks.facetMatches(function(i,g){g=g||{};i=i||[];var j=new RegExp("^"+c,"i");var h=a.grep(i,function(k){return k&&j.test(k.label||k)});if(g.preserveOrder){f(h)}else{f(_.sortBy(h,function(k){if(k.label){return k.category+"-"+k.label}else{return k}}))}})},closeAutocomplete:function(){var b=this.box.data("autocomplete");if(b){b.close()}},moveAutocomplete:function(){var b=this.box.data("autocomplete");if(b){b.menu.element.position({my:"left top",at:"left bottom",of:this.box.data("autocomplete").element,collision:"none",offset:"0 -1"})}},searchAutocomplete:function(c){var b=this.box.data("autocomplete");if(b){var d=b.menu.element;b.search();d.outerWidth(Math.max(d.width("").outerWidth(),b.element.outerWidth()))}},addTextFacetRemainder:function(e){var d=this.box.val();var c=d.match(/\b(\w+)$/);if(c){var b=new RegExp(c[0],"i");if(e.search(b)==0){d=d.replace(/\b(\w+)$/,"")}d=d.replace("^s+|s+$","");if(d){this.app.searchBox.addFacet("text",d,this.options.position)}return d}else{return""}},enableEdit:function(b){this.addFocus();if(b){this.selectText()}this.box.focus()},addFocus:function(){this.flags.canClose=false;if(!this.app.searchBox.allSelected()){this.app.searchBox.disableFacets(this)}this.app.searchBox.addFocus();this.setMode("is","editing");this.setMode("not","selected");this.searchAutocomplete()},disableEdit:function(){this.box.blur();this.removeFocus()},removeFocus:function(){this.flags.canClose=false;this.app.searchBox.removeFocus();this.setMode("not","editing");this.setMode("not","selected");this.closeAutocomplete()},deferDisableEdit:function(){this.flags.canClose=true;_.delay(_.bind(function(){if(this.flags.canClose&&!this.box.is(":focus")&&this.modes.editing=="is"){this.disableEdit()}},this),250)},startTripleClickTimer:function(){this.tripleClickTimer=setTimeout(_.bind(function(){this.tripleClickTimer=null},this),500)},maybeTripleClick:function(b){if(!!this.tripleClickTimer){b.preventDefault();this.app.searchBox.selectAllFacets();return false}},isFocused:function(){return this.box.is(":focus")},value:function(){return this.box.val()},setCursorAtEnd:function(b){if(b==-1){this.box.setCursorPosition(this.box.val().length)}else{this.box.setCursorPosition(0)}},selectText:function(){this.box.selectRange(0,this.box.val().length);if(!this.app.searchBox.allSelected()){this.box.focus()}else{this.setMode("is","selected")}},search:function(c,b){if(!b){b=0}this.closeAutocomplete();this.app.searchBox.searchEvent(c);_.defer(_.bind(function(){this.app.searchBox.focusNextFacet(this,b)},this))},keypress:function(h){var c=VS.app.hotkeys.key(h);if(c=="enter"){return this.search(h,100)}else{if(VS.app.hotkeys.colon(h)){this.box.trigger("resize.autogrow",h);var g=this.box.val();var f=[];if(this.app.options.callbacks.facetMatches){this.app.options.callbacks.facetMatches(function(e){f=e})}var i=_.map(f,function(e){if(e.label){return e.label}else{return e}});if(_.contains(i,g)){h.preventDefault();var d=this.addTextFacetRemainder(g);var b=this.options.position+(d?1:0);this.app.searchBox.addFacet(g,"",b);return false}}else{if(c=="backspace"){if(this.box.getCursorPosition()==0&&!this.box.getSelection().length){h.preventDefault();h.stopPropagation();h.stopImmediatePropagation();this.app.searchBox.resizeFacets();return false}}}}},keydown:function(g){var c=VS.app.hotkeys.key(g);if(c=="left"){if(this.box.getCursorPosition()==0){g.preventDefault();this.app.searchBox.focusNextFacet(this,-1,{startAtEnd:-1})}}else{if(c=="right"){if(this.box.getCursorPosition()==this.box.val().length){g.preventDefault();this.app.searchBox.focusNextFacet(this,1,{selectFacet:true})}}else{if(VS.app.hotkeys.shift&&c=="tab"){g.preventDefault();this.app.searchBox.focusNextFacet(this,-1,{selectText:true})}else{if(c=="tab"){g.preventDefault();var f=this.box.val();if(f.length){var d=this.addTextFacetRemainder(f);var b=this.options.position+(d?1:0);this.app.searchBox.addFacet(f,"",b)}else{this.app.searchBox.focusNextFacet(this,0,{skipToFacet:true,selectText:true})}}else{if(VS.app.hotkeys.command&&String.fromCharCode(g.which).toLowerCase()=="a"){g.preventDefault();this.app.searchBox.selectAllFacets();return false}else{if(c=="backspace"&&!this.app.searchBox.allSelected()){if(this.box.getCursorPosition()==0&&!this.box.getSelection().length){g.preventDefault();this.app.searchBox.focusNextFacet(this,-1,{backspace:true});return false}}}}}}}this.box.trigger("resize.autogrow",g)}})})();(function(){var a=jQuery;Backbone.View.prototype.setMode=function(c,b){this.modes||(this.modes={});if(this.modes[b]===c){return}a(this.el).setMode(c,b);this.modes[b]=c}})();(function(){var a=jQuery;VS.app.hotkeys={KEYS:{"16":"shift","17":"command","91":"command","93":"command","224":"command","13":"enter","37":"left","38":"upArrow","39":"right","40":"downArrow","46":"delete","8":"backspace","9":"tab","188":"comma"},initialize:function(){_.bindAll(this,"down","up","blur");a(document).bind("keydown",this.down);a(document).bind("keyup",this.up);a(window).bind("blur",this.blur)},down:function(c){var b=this.KEYS[c.which];if(b){this[b]=true}},up:function(c){var b=this.KEYS[c.which];if(b){this[b]=false}},blur:function(c){for(var b in this.KEYS){this[this.KEYS[b]]=false}},key:function(b){return this.KEYS[b.which]},colon:function(c){var b=c.which;return b&&String.fromCharCode(b)==":"},printable:function(c){var b=c.which;if(c.type=="keydown"){if(b==32||(b>=48&&b<=90)||(b>=96&&b<=111)||(b>=186&&b<=192)||(b>=219&&b<=222)){return true}}else{if((b>=32&&b<=126)||(b>=160&&b<=500)||(String.fromCharCode(b)==":")){return true}}return false}}})();(function(){var a=jQuery;VS.utils.inflector={trim:function(b){return b.trim?b.trim():b.replace(/^\s+|\s+$/g,"")},escapeRegExp:function(b){return b.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")}}})();(function(){var b=jQuery;b.fn.extend({setMode:function(d,e){e=e||"mode";var c=new RegExp("\\w+_"+e+"(\\s|$)","g");var f=(d===null)?"":d+"_"+e;this.each(function(){this.className=(this.className.replace(c,"")+" "+f).replace(/\s\s/g," ")});return f},autoGrowInput:function(){return this.each(function(){var e=b(this);var d=b("<div />").css({opacity:0,top:-9999,left:-9999,position:"absolute",whiteSpace:"nowrap"}).addClass("VS-input-width-tester").addClass("VS-interface");var c="keydown.autogrow keypress.autogrow resize.autogrow change.autogrow";e.next(".VS-input-width-tester").remove();e.after(d);e.unbind(c).bind(c,function(h,i){if(i){h=i}var g=e.val();if(VS.app.hotkeys.key(h)=="backspace"){var f=e.getCursorPosition();if(f>0){g=g.slice(0,f-1)+g.slice(f,g.length)}}else{if(VS.app.hotkeys.printable(h)&&!VS.app.hotkeys.command){g+=String.fromCharCode(h.which)}}g=g.replace(/&/g,"&amp;").replace(/\s/g,"&nbsp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");d.html(g);e.width(d.width()+3+parseInt(e.css("min-width")));e.trigger("updated.autogrow")});e.trigger("resize.autogrow")})},getCursorPosition:function(){var d=0;var e=this.get(0);if(document.selection){e.focus();var f=document.selection.createRange();var c=document.selection.createRange().text.length;f.moveStart("character",-e.value.length);d=f.text.length-c}else{if(e&&b(e).is(":visible")&&e.selectionStart!=null){d=e.selectionStart}}return d},setCursorPosition:function(c){return this.each(function(){return b(this).selectRange(c,c)})},selectRange:function(d,c){return this.each(function(){if(this.setSelectionRange){this.focus();this.setSelectionRange(d,c)}else{if(this.createTextRange){var e=this.createTextRange();e.collapse(true);e.moveEnd("character",c);e.moveStart("character",d);if(c-d>=0){e.select()}}}})},getSelection:function(){var e=this[0];if(e.selectionStart!=null){var h=e.selectionStart;var c=e.selectionEnd;return{start:h,end:c,length:c-h,text:e.value.substr(h,c-h)}}else{if(document.selection){var d=document.selection.createRange();if(d){var f=e.createTextRange();var g=f.duplicate();f.moveToBookmark(d.getBookmark());g.setEndPoint("EndToStart",f);var h=g.text.length;var c=h+d.text.length;return{start:h,end:c,length:c-h,text:d.text}}}}return{start:0,end:0,length:0}}});if(b.browser.msie&&false){window.console={};var a;window.console.log=function(f){if(_.isArray(f)){var d=f[0];var e=_.map(f.slice(1),function(g){return JSON.stringify(g)}).join(" - ")}if(!a){a=b("<div><ol></ol></div>").css({position:"fixed",bottom:10,left:10,zIndex:20000,width:b("body").width()-80,border:"1px solid #000",padding:"10px",backgroundColor:"#fff",fontFamily:"arial,helvetica,sans-serif",fontSize:"11px"});b("body").append(a)}var c=b("<li>"+d+" - "+e+"</li>").css({borderBottom:"1px solid #999999"});a.find("ol").append(c);_.delay(function(){c.fadeOut(500)},5000)}}})();(function(){var a=jQuery;VS.app.SearchParser={ALL_FIELDS:/('.+?'|".+?"|[^'"\s]{2}\S*):\s*('.+?'|".+?"|[^'"\s]\S*)/g,CATEGORY:/('.+?'|".+?"|[^'"\s]{2}\S*):\s*/,parse:function(b,d){var c=this._extractAllFacets(b,d);b.searchQuery.reset(c);return c},_extractAllFacets:function(b,g){var f=[];var c=g;while(g){var d,e;c=g;var h=this._extractNextField(g);if(!h){d="text";e=this._extractSearchText(g);g=VS.utils.inflector.trim(g.replace(e,""))}else{if(h.indexOf(":")!=-1){d=h.match(this.CATEGORY)[1].replace(/(^['"]|['"]$)/g,"");e=h.replace(this.CATEGORY,"").replace(/(^['"]|['"]$)/g,"");g=VS.utils.inflector.trim(g.replace(h,""))}else{if(h.indexOf(":")==-1){d="text";e=h;g=VS.utils.inflector.trim(g.replace(e,""))}}}if(d&&e){var i=new VS.model.SearchFacet({category:d,value:VS.utils.inflector.trim(e),app:b});f.push(i)}if(c==g){break}}return f},_extractNextField:function(d){var b=/^\s*(\S+)\s+(?=\w+:\s?(('.+?'|".+?")|([^'"]{2}\S*)))/;var c=d.match(b);if(c&&c.length>=1){return c[1]}else{return this._extractFirstField(d)}},_extractFirstField:function(c){var b=c.match(this.ALL_FIELDS);return b&&b.length&&b[0]},_extractSearchText:function(b){b=b||"";var c=VS.utils.inflector.trim(b.replace(this.ALL_FIELDS,""));return c}}})();(function(){var a=jQuery;VS.model.SearchFacet=Backbone.Model.extend({serialize:function(){var b=this.quoteCategory(this.get("category"));var c=VS.utils.inflector.trim(this.get("value"));if(!c){return""}if(!_.contains(this.get("app").options.unquotable||[],b)&&b!="text"){c=this.quoteValue(c)}if(b!="text"){b=b+": "}else{b=""}return b+c},quoteCategory:function(d){var e=(/"/).test(d);var b=(/'/).test(d);var c=(/\s/).test(d);if(e&&!b){return"'"+d+"'"}else{if(c||(b&&!e)){return'"'+d+'"'}else{return d}}},quoteValue:function(d){var c=(/"/).test(d);var b=(/'/).test(d);if(c&&!b){return"'"+d+"'"}else{return'"'+d+'"'}}})})();(function(){var a=jQuery;VS.model.SearchQuery=Backbone.Collection.extend({model:VS.model.SearchFacet,serialize:function(){return this.map(function(b){return b.serialize()}).join(" ")},facets:function(){return this.map(function(c){var b={};b[c.get("category")]=c.get("value");return b})},find:function(b){var c=this.detect(function(d){return d.get("category")==b});return c&&c.get("value")},count:function(b){return this.select(function(c){return c.get("category")==b}).length},values:function(b){var c=this.select(function(d){return d.get("category")==b});return _.map(c,function(d){return d.get("value")})},has:function(b,c){return this.any(function(e){var d=e.get("category")==b;if(!c){return d}return d&&e.get("value")==c})},withoutCategory:function(b){return this.map(function(c){if(c.get("category")!=b){return c.serialize()}}).join(" ")}})})();(function(){window.JST=window.JST||{};window.JST.search_box=_.template('<div class="VS-search">\n  <div class="VS-search-box-wrapper VS-search-box">\n    <div class="VS-icon VS-icon-search"></div>\n    <div class="VS-search-inner"></div>\n    <div class="VS-icon VS-icon-cancel VS-cancel-search-box" title="clear search"></div>\n  </div>\n</div>');window.JST.search_facet=_.template('<% if (model.has(\'category\')) { %>\n  <div class="category"><%= model.get(\'category\') %>:</div>\n<% } %>\n\n<div class="search_facet_input_container">\n  <input type="text" class="search_facet_input VS-interface" value="" />\n</div>\n\n<div class="search_facet_remove VS-icon VS-icon-cancel"></div>');window.JST.search_input=_.template('<input type="text" />')})();
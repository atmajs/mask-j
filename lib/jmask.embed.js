
var jmask = exports.jmask = Mask.jmask = (function(mask){
	
	// source ../src/scope-vars.js
	var Dom = mask.Dom,
		_mask_render = mask.render,
		_mask_parse = mask.parse,
		_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
		_signal_emitIn = (mask.Compo || Compo).signal.emitIn;
		
	
	function _mask_ensureTmplFn(value) {
		if (typeof value !== 'string') {
			return value;
		}
		return _mask_ensureTmplFnOrig(value);
	}
	
	
	// end:source ../src/scope-vars.js

	// source ../src/util/array.js
	var arr_eachAny,
		arr_unique;
	
	(function(){
	
		arr_eachAny = function(mix, fn) {
			if (is_ArrayLike(mix) === false) {
				fn(mix);
				return;
			}
			var imax = mix.length,
				i = -1;
			while ( ++i < imax ){
				fn(mix[i], i);
			}
		};
		
		(function() {
			arr_unique = function(array) {
				hasDuplicate_ = false;
				array.sort(sort);
				if (hasDuplicate_ === false) 
					return array;
				
				var duplicates = [],
					i = 0,
					j = 0,
					imax = array.length - 1;
		
				while (i < imax) {
					if (array[i++] === array[i]) {
						duplicates[j++] = i;
					}
				}
				while (j--) {
					array.splice(duplicates[j], 1);
				}
		
				return array;
			};
			
			var hasDuplicate_ = false;
			function sort(a, b) {
				if (a === b) {
					hasDuplicate_ = true;
					return 0;
				}
				return 1;
			}
		}());
		
	}());
	
	// end:source ../src/util/array.js
	// source ../src/util/selector.js
	var selector_parse,
		selector_match;
		
	(function(){
		
		selector_parse = function(selector, type, direction) {
			if (selector == null) 
				log_error('selector is null for the type', type);
			
			var _type = typeof selector;
			if (_type === 'object' || _type === 'function') 
				return selector;
			
			var key,
				prop,
				nextKey,
				filters,
		
				_key,
				_prop,
				_selector;
		
			var index = 0,
				length = selector.length,
				c,
				end,
				matcher, root, current,
				eq,
				slicer;
		
			if (direction === 'up') {
				nextKey = sel_key_UP;
			} else {
				nextKey = type === Dom.SET
					? sel_key_MASK
					: sel_key_COMPOS;
			}
		
			while (index < length) {
		
				c = selector.charCodeAt(index);
		
				if (c < 33) {
					index++;
					continue;
				}
				if (c === 62 /* > */) {
					if (matcher == null) {
						root = matcher = {
							selector: '__scope__',
							nextKey: nextKey,
							filters: null,
							next: {
								type: 'children',
								matcher: null
							}
						};
					} else {
						matcher.next = {
							type: 'children',
							matcher: null
						};
					}
					current = matcher;
					matcher = null;
					index++;
					continue;
				}
				
				end = selector_moveToBreak(selector, index + 1, length);
				if (c === 46 /*.*/ ) {
					_key = 'class';
					_prop = sel_key_ATTR;
					_selector = sel_hasClassDelegate(selector.substring(index + 1, end));
				}
		
				else if (c === 35 /*#*/ ) {
					_key = 'id';
					_prop = sel_key_ATTR;
					_selector = selector.substring(index + 1, end);
				}
		
				else if (c === 91 /*[*/ ) {
					eq = selector.indexOf('=', index);
					//if DEBUG
					eq === -1 && console.error('Attribute Selector: should contain "="');
					// endif
		
					_prop = sel_key_ATTR;
					_key = selector.substring(index + 1, eq);
		
					//slice out quotes if any
					c = selector.charCodeAt(eq + 1);
					slicer = c === 34 || c === 39 ? 2 : 1;
		
					_selector = selector.substring(eq + slicer, end - slicer + 1);
		
					// increment, as cursor is on closed ']'
					end++;
				}
				else if (c === 58 /*:*/ && selector.charCodeAt(index + 1) === 58) {
					index += 2;
					var start = index, name, expr;
					do {
						c = selector.charCodeAt(index);
					} while (c >= 97 /*a*/ && c <= 122 /*z*/ && ++index < length);
					
					name = selector.substring(start, index);
					if (c === 40 /*(*/) {
						start = ++index;
						do {
							c = selector.charCodeAt(index);
						} while (c !== 41/*)*/ && ++index < length);
						expr = selector.substring(start, index);
						index++;
					}
					var pseudo = PseudoSelectors(name, expr);
					if (matcher == null) {
						matcher = {
							selector: '*',
							nextKey: nextKey
						};
					}
					if (root == null) {
						root = matcher;
					}
					if (matcher.filters == null) {
						matcher.filters = [];
					}
					matcher.filters.push(pseudo);
					continue;
				}
				else {
					
					if (matcher != null) {
						matcher.next = {
							type: 'any',
							matcher: null
						};
						current = matcher;
						matcher = null;
					}
					
					_prop = null;
					_key = type === Dom.SET ? 'tagName' : 'compoName';
					_selector = selector.substring(index, end);
				}
		
				index = end;
		
				if (matcher == null) {
					matcher = {
						key: _key,
						prop: _prop,
						selector: _selector,
						nextKey: nextKey,
						filters: null
					};
					if (root == null) 
						root = matcher;
						
					if (current != null) {
						current.next.matcher = matcher;
					}
					
					continue;
				}
				if (matcher.filters == null) 
					matcher.filters = [];
				
				matcher.filters.push({
					key: _key,
					selector: _selector,
					prop: _prop
				});
			}
			
			if (current && current.next) 
				current.next.matcher = matcher;
			
			return root;
		};
		
		selector_match = function(node, selector, type) {
			if (typeof selector === 'string') {
				if (type == null) {
					type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
				}
				selector = selector_parse(selector, type);
			}
			if (typeof selector === 'function') {
				return selector(node);
			}
			
			var obj = selector.prop ? node[selector.prop] : node,
				matched = false;
		
			if (obj == null) 
				return false;
			if (selector.selector === '*') {
				matched = true
			}
			else if (typeof selector.selector === 'function') {
				matched = selector.selector(obj[selector.key]);
			}
			else if (selector.selector.test != null) {
				if (selector.selector.test(obj[selector.key])) {
					matched = true;
				}
			}
			else  if (obj[selector.key] === selector.selector) {
				matched = true;
			}
		
			if (matched === true && selector.filters != null) {
				for(var i = 0, x, imax = selector.filters.length; i < imax; i++){
					x = selector.filters[i];
					
					if (typeof x === 'function') {
						matched = x(node, type);
						if (matched === false) 
							return false;
						continue;
					}
					if (selector_match(node, x, type) === false) {
						return false;
					}
				}
			}
		
			return matched;
		};
		
		// ==== private
		
		var sel_key_UP = 'parent',
			sel_key_MASK = 'nodes',
			sel_key_COMPOS = 'components',
			sel_key_ATTR = 'attr';
		
		
		function sel_hasClassDelegate(matchClass) {
			return function(className){
				return sel_hasClass(className, matchClass);
			};
		}
		
		// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
		function sel_hasClass(className, matchClass, index) {
			if (typeof className !== 'string')
				return false;
			
			if (index == null) 
				index = 0;
				
			index = className.indexOf(matchClass, index);
		
			if (index === -1)
				return false;
		
			if (index > 0 && className.charCodeAt(index - 1) > 32)
				return sel_hasClass(className, matchClass, index + 1);
		
			var class_Length = className.length,
				match_Length = matchClass.length;
				
			if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
				return sel_hasClass(className, matchClass, index + 1);
		
			return true;
		}
		
		
		function selector_moveToBreak(selector, index, length) {
			var c, 
				isInQuote = false,
				isEscaped = false;
		
			while (index < length) {
				c = selector.charCodeAt(index);
		
				if (c === 34 || c === 39) {
					// '"
					isInQuote = !isInQuote;
				}
		
				if (c === 92) {
					// [\]
					isEscaped = !isEscaped;
				}
		
				if (c === 46 || c === 35 || c === 91 || c === 93 || c === 62 || c < 33) {
					// .#[]>
					if (isInQuote !== true && isEscaped !== true) {
						break;
					}
				}
				index++;
			}
			return index;
		}
		
		var PseudoSelectors;
		(function() {
			PseudoSelectors = function(name, expr) {
				var fn = Fns[name];
				if (fn !== void 0) 
					return fn;
				
				var worker = Workers[name];
				if (worker !== void 0) 
					return worker(expr);
				
				throw new Error('Uknown pseudo selector:' + name);
			};		
			var Fns = {
				text: function (node) {
					return node.type === Dom.TEXTNODE;
				},
				node: function(node) {
					return node.type === Dom.NODE;
				}
			};
			var Workers = {
				not: function(expr){
					return function(node, type){
						return !selector_match(node, expr, type);
					}
				}
			};
		}());
	}());
	
	// end:source ../src/util/selector.js
	// source ../src/util/utils.js
	var jmask_filter,
		jmask_find,
		jmask_clone,
		jmask_deepest,
		jmask_getText
		;
	
	(function(){
		
		jmask_filter = function(mix, matcher) {
			if (matcher == null) 
				return mix;
			
			var result = [];
			arr_eachAny(mix, function(node, i) {
				if (selector_match(node, matcher)) 
					result.push(node);
			});
			return result;
		};
		
		/**
		 * - mix (Node | Array[Node])
		 */
		jmask_find = function(mix, matcher, output, deep) {
			if (mix == null) {
				return output;
			}
			if (output == null) {
				output = [];
			}
			if (deep == null) {
				// is root and matchling like `> div` (childs only)
				if (matcher.selector === '__scope__') {
					deep = false;
					matcher = matcher.next.matcher;
				} else{
					deep = true;
				}
			}
			
			arr_eachAny(mix, function(node){
				if (selector_match(node, matcher) === false) {
					
					if (matcher.next == null && deep !== false) 
						jmask_find(node[matcher.nextKey], matcher, output, deep);
					
					return;
				}
				
				if (matcher.next == null) {
					output.push(node);
					if (deep === true) 
						jmask_find(node[matcher.nextKey], matcher, output, deep);
						
					return;
				}
				
				var next = matcher.next;
				deep = next.type !== 'children';
				jmask_find(node[matcher.nextKey], next.matcher, output, deep);
			});
			return output;
		};
		
		jmask_clone = function(node, parent){
			var clone = obj_create(node);
		
			var attr = node.attr;
			if (attr != null){
				clone.attr = obj_create(attr);
			}
		
			var nodes = node.nodes;
			if (nodes != null){
				if (is_ArrayLike(nodes) === false) {
					clone.nodes = [ jmask_clone(nodes, clone) ];
				}
				else {
					clone.nodes = [];
					var imax = nodes.length,
						i = 0;
					for(; i< imax; i++){
						clone.nodes[i] = jmask_clone(nodes[i], clone);
					}
				}
			}
			return clone;
		};
		
		
		jmask_deepest = function(node){
			var current = node,
				prev;
			while(current != null){
				prev = current;
				current = current.nodes && current.nodes[0];
			}
			return prev;
		};
		
		
		jmask_getText = function(node, model, ctx, controller) {
			if (Dom.TEXTNODE === node.type) {
				if (is_Function(node.content)) {
					return node.content('node', model, ctx, null, controller);
				}
				return node.content;
			}
		
			var output = '';
			if (node.nodes != null) {
				for(var i = 0, x, imax = node.nodes.length; i < imax; i++){
					x = node.nodes[i];
					output += jmask_getText(x, model, ctx, controller);
				}
			}
			return output;
		};
	
	}());
	
	// end:source ../src/util/utils.js

	// source ../src/jmask/jmask.js
	function jMask(mix) {
		if (this instanceof jMask === false) 
			return new jMask(mix);
		if (mix == null) 
			return this;
		if (mix.type === Dom.SET) 
			return mix;
		return this.add(mix);
	}
	
	var Proto = jMask.prototype = {
		constructor: jMask,
		type: Dom.SET,
		length: 0,
		components: null,
		add: function(mix) {
			var i, length;
	
			if (typeof mix === 'string') {
				mix = _mask_parse(mix);
			}
	
			if (is_ArrayLike(mix)) {
				for (i = 0, length = mix.length; i < length; i++) {
					this.add(mix[i]);
				}
				return this;
			}
	
			if (typeof mix === 'function' && mix.prototype.type != null) {
				// assume this is a controller
				mix = {
					controller: mix,
					type: Dom.COMPONENT
				};
			}
	
			var type = mix.type;
			if (type === Dom.FRAGMENT) {
				var nodes = mix.nodes;
				for(i = 0, length = nodes.length; i < length;) {
					this[this.length++] = nodes[i++];
				}
				return this;
			}
	
			if (type === Dom.CONTROLLER) {
				if (mix.nodes != null && mix.nodes.length) {
					for (i = mix.nodes.length; i !== 0;) {
						// set controller as parent, as parent is mask dom node
						mix.nodes[--i].parent = mix;
					}
				}
				if (mix.$ != null) {
					this.type = Dom.CONTROLLER;
				}
			}
	
			this[this.length++] = mix;
			return this;
		},
		toArray: function() {
			return _Array_slice.call(this);
		},
		/**
		 *	render([model, cntx, container]) -> HTMLNode
		 * - model (Object)
		 * - cntx (Object)
		 * - container (Object)
		 * - returns (HTMLNode)
		 *
		 **/
		render: function(model, ctx, el, ctr) {
			this.components = [];
	
			if (this.length === 1) {
				return _mask_render(this[0], model, ctx, el, ctr || this);
			}
	
			if (el == null) {
				el = document.createDocumentFragment();
			}
	
			for (var i = 0, length = this.length; i < length; i++) {
				_mask_render(this[i], model, ctx, el, ctr || this);
			}
			return el;
		},
		prevObject: null,
		end: function() {
			return this.prevObject || this;
		},
		pushStack: function(nodes) {
			var next;
			next = jMask(nodes);
			next.prevObject = this;
			return next;
		},
		controllers: function() {
			if (this.components == null) {
				console.warn('Set was not rendered');
			}
			return this.pushStack(this.components || []);
		},
		mask: function(template) {
			if (arguments.length !== 0) {
				return this.empty().append(template);
			}
			return mask.stringify(this);
		},
	
		text: function(mix, ctx, ctr){
			if (typeof mix === 'string' && arguments.length === 1) {
				var node = [ new Dom.TextNode(mix) ];
	
				for(var i = 0, imax = this.length; i < imax; i++){
					this[i].nodes = node;
				}
				return this;
			}
	
			var str = '';
			for(var i = 0, imax = this.length; i < imax; i++){
				str += jmask_getText(this[i], mix, ctx, ctr);
			}
			return str;
		}
	};
	
	arr_each(['append', 'prepend'], function(method) {
	
		Proto[method] = function(mix) {
			var $mix = jMask(mix),
				i = 0,
				length = this.length,
				arr, node;
	
			for (; i < length; i++) {
				node = this[i];
				// we create each iteration a new array to prevent collisions in future manipulations
				arr = $mix.toArray();
	
				for (var j = 0, jmax = arr.length; j < jmax; j++) {
					arr[j].parent = node;
				}
	
				if (node.nodes == null) {
					node.nodes = arr;
					continue;
				}
	
				node.nodes = method === 'append' ? node.nodes.concat(arr) : arr.concat(node.nodes);
			}
	
			return this;
		};
	
	});
	
	arr_each(['appendTo'], function(method) {
	
		Proto[method] = function(mix, model, cntx, controller) {
	
			if (controller == null) {
				controller = this;
			}
	
			if (mix.nodeType != null && typeof mix.appendChild === 'function') {
				mix.appendChild(this.render(model, cntx, null, controller));
	
				_signal_emitIn(controller, 'domInsert');
				return this;
			}
	
			jMask(mix).append(this);
			return this;
		};
	
	});
	
	// end:source ../src/jmask/jmask.js
	// source ../src/jmask/manip.attr.js
	(function() {
		Proto.removeAttr = function(key){
			return coll_each(this, function(node){
				node.attr[key] = null;
			});
		};
		Proto.attr = function(mix, val){
			if (arguments.length === 1 && is_String(mix)) {
				return this.length !== 0 ? this[0].attr[mix] : null;
			}
			function asString(node, key, val){
				node.attr[key] = _mask_ensureTmplFn(val);
			}
			function asObject(node, obj){
				for(var key in obj){
					asString(node, key, obj[key]);
				}
			}
			var fn = is_String(mix) ? asString : asObject;
			return coll_each(this, function(node){
				fn(node, mix, val);
			});
		};
		Proto.prop = function (key, val) {
			if (arguments.length === 1) {
				return this.length !== 0 ? this[0][key] : this[0].attr[key];
			}
			return coll_each(this, function(node){
				node[key] = val;
			});
		};
		Proto.removeProp = function(key){
			return coll_each(this, function(node){
				node.attr[key] = null;
				node[key] = null;
			});
		};
		Proto.tag = function(name) {
			if (arguments.length === 0)
				return this[0] && this[0].tagName;
	
			return coll_each(this, function(node){
				node.tagName = name;
			});
		};
		Proto.css = function(mix, val) {
			if (arguments.length <= 1 && typeof mix === 'string') {
				if (this.length == null)
					return null;
	
				var style = this[0].attr.style;
				if (style == null)
					return null;
	
				var obj = css_parseStyle(style);
				return mix == null ? obj : obj[mix];
			}
	
			if (mix == null)
				return this;
	
			var stringify = typeof mix === 'object'
				? css_stringify
				: css_stringifyKeyVal ;
			var extend = typeof mix === 'object'
				? obj_extend
				: css_extendKeyVal ;
	
			return coll_each(this, function(node){
				var style = node.attr.style;
				if (style == null) {
					node.attr.style = stringify(mix, val);
					return;
				}
				var css = css_parseStyle(style);
				extend(css, mix, val);
				node.attr.style = css_stringify(css);
			});
		};
	
		function css_extendKeyVal(css, key, val){
			css[key] = val;
		}
		function css_parseStyle(style) {
			var obj = {};
			style.split(';').forEach(function(x){
				if (x === '')
					return;
				var i = x.indexOf(':'),
					key = x.substring(0, i).trim(),
					val = x.substring(i + 1).trim();
				obj[key] = val;
			});
			return obj;
		}
		function css_stringify(css) {
			var str = '', key;
			for(key in css) {
				str += key + ':' + css[key] + ';';
			}
			return str;
		}
		function css_stringifyKeyVal(key, val){
			return key + ':' + val + ';';
		}
	
	}());
	
	// end:source ../src/jmask/manip.attr.js
	// source ../src/jmask/manip.class.js
	(function() {
		Proto.hasClass = function(klass){
			return coll_find(this, function(node){
				return has(node, klass);
			});
		};
		var Mutator_ = {
			add: function(node, klass){
				if (has(node, klass) === false) 
					add(node, klass);
			},
			remove: function(node, klass){
				if (has(node, klass) === true) 
					remove(node, klass);
			},
			toggle: function(node, klass){
				var fn = has(node, klass) === true ? remove : add;
				fn(node, klass);
			}
		};
		arr_each(['add', 'remove', 'toggle'], function(method) {
			var fn = Mutator_[method];
			Proto[method + 'Class'] = function(klass) {
				return coll_each(this, function(node){
					fn(node, klass);
				});
			};
		});
		function current(node){
			var className = node.attr['class'];
			return typeof className === 'string' ? className : '';
		}
		function has(node, klass){
			return -1 !== (' ' + current(node) + ' ').indexOf(' ' + klass + ' ');
		}
		function add(node, klass){
			node.attr['class'] =  (current(node) + ' ' + klass).trim();
		}
		function remove(node, klass) {
			node.attr['class'] = (' ' + current(node) + ' ').replace(' ' + klass + ' ', '').trim();
		}
	}());
	
	// end:source ../src/jmask/manip.class.js
	// source ../src/jmask/manip.dom.js
	obj_extend(Proto, {
		clone: function(){
			return jMask(coll_map(this, jmask_clone));
		},
		wrap: function(wrapper){
			var $wrap = jMask(wrapper);
			if ($wrap.length === 0){
				log_warn('Not valid wrapper', wrapper);
				return this;
			}
			var result = coll_map(this, function(x){
				var node = $wrap.clone()[0];
				jmask_deepest(node).nodes = [ x ];
				
				if (x.parent != null) {
					var i = coll_indexOf(x.parent.nodes, x);
					if (i !== -1) 
						x.parent.nodes.splice(i, 1, node);
				}
				return node
			});
			return jMask(result);
		},
		wrapAll: function(wrapper){
			var $wrap = jMask(wrapper);
			if ($wrap.length === 0){
				log_error('Not valid wrapper', wrapper);
				return this;
			}
			this.parent().mask($wrap);
			jmask_deepest($wrap[0]).nodes = this.toArray();
			return this.pushStack($wrap);
		}
	});
	
	arr_each(['empty', 'remove'], function(method) {
		Proto[method] = function(){
			return coll_each(this, Methods_[method]);
		};
		var Methods_ = {
			remove: function(node){
				if (node.parent != null) 
					coll_remove(node.parent.nodes, node);
			},
			empty: function(node){
				node.nodes = null;
			}
		};
	});
	
	// end:source ../src/jmask/manip.dom.js
	// source ../src/jmask/traverse.js
	obj_extend(Proto, {
		each: function(fn, ctx) {
			for (var i = 0; i < this.length; i++) {
				fn.call(ctx || this, this[i], i)
			}
			return this;
		},
		map: function(fn, ctx) {
			var arr = [];
			for (var i = 0; i < this.length; i++) {
				arr.push(fn.call(ctx || this, this[i], i));
			}
			return this.pushStack(arr);
		},
		eq: function(i) {
			return i === -1 ? this.slice(i) : this.slice(i, i + 1);
		},
		get: function(i) {
			return i < 0 ? this[this.length - i] : this[i];
		},
		slice: function() {
			return this.pushStack(Array.prototype.slice.apply(this, arguments));
		}
	});
	
	
	arr_each([
		'filter',
		'children',
		'closest',
		'parent',
		'find',
		'first',
		'last'
	], function(method) {
	
		Proto[method] = function(selector) {
			var result = [],
				matcher = selector == null
					? null
					: selector_parse(selector, this.type, method === 'closest' ? 'up' : 'down'),
				i, x;
	
			switch (method) {
			case 'filter':
				return jMask(jmask_filter(this, matcher));
			case 'children':
				for (i = 0; i < this.length; i++) {
					x = this[i];
					var arr = x[matcher.nextKey];
					if (arr == null) {
						continue;
					}
					result = result.concat(matcher == null ? arr : jmask_filter(arr, matcher));
				}
				break;
			case 'parent':
				for (i = 0; i < this.length; i++) {
					x = this[i].parent;
					if (!x || x.type === Dom.FRAGMENT || (matcher && selector_match(x, matcher))) {
						continue;
					}
					result.push(x);
				}
				arr_unique(result);
				break;
			case 'closest':
			case 'find':
				if (matcher == null) {
					break;
				}
				for (i = 0; i < this.length; i++) {
					jmask_find(this[i][matcher.nextKey], matcher, result);
				}
				break;
			case 'first':
			case 'last':
				var index;
				for (i = 0; i < this.length; i++) {
	
					index = method === 'first' ? i : this.length - i - 1;
					x = this[index];
					if (matcher == null || selector_match(x, matcher)) {
						result[0] = x;
						break;
					}
				}
				break;
			}
	
			return this.pushStack(result);
		};
	
	});
	
	// end:source ../src/jmask/traverse.js


	jMask.prototype.fn = jMask.prototype;
	return jMask;

}(Mask));

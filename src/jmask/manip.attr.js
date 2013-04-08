(function() {
	arr_each(['add', 'remove', 'toggle', 'has'], function(method) {

		jMask.prototype[method + 'Class'] = function(klass) {
			var length = this.length,
				i = 0,
				classNames, j, jmax, node, current;

			if (typeof klass !== 'string') {
				if (method === 'remove') {
					for (; i < length; i++) {
						this[0].attr['class'] = null;
					}
				}
				return this;
			}


			for (; i < length; i++) {
				node = this[i];

				if (node.attr == null) {
					continue;
				}

				current = node.attr['class'];

				if (current == null) {
					current = klass;
				} else {
					current = ' ' + current + ' ';

					if (classNames == null) {
						classNames = klass.split(' ');
						jmax = classNames.length;
					}
					for (j = 0; j < jmax; j++) {
						if (!classNames[j]) {
							continue;
						}

						var hasClass = current.indexOf(' ' + classNames[j] + ' ') > -1;

						if (method === 'has') {
							if (hasClass) {
								return true;
							} else {
								continue;
							}
						}

						if (hasClass === false && (method === 'add' || method === 'toggle')) {
							current += classNames[j] + ' ';
						} else if (hasClass === true && (method === 'remove' || method === 'toggle')) {
							current = current.replace(' ' + classNames[j] + ' ', ' ');
						}
					}
					current = current.trim();
				}

				if (method !== 'has') {
					node.attr['class'] = current;
				}
			}

			if (method === 'has') {
				return false;
			}

			return this;
		};

	});


	arr_each(['attr', 'removeAttr', 'prop', 'removeProp'], function(method) {
		jMask.prototype[method] = function(key, value) {
			if (!key) {
				return this;
			}

			var length = this.length,
				i = 0,
				args = arguments.length,
				node;

			for (; i < length; i++) {
				node = this[i];

				switch (method) {
				case 'attr':
				case 'prop':
					if (args === 1) {
						if (typeof key === 'string') {
							return node.attr[key];
						}

						for (var x in key) {
							node.attr[x] = key[x];
						}

					} else if (args === 2) {
						node.attr[key] = value;
					}
					break;
				case 'removeAttr':
				case 'removeProp':
					node.attr[key] = null;
					break;
				}
			}

			return this;
		};
	});

	util_extend(jMask.prototype, {
		tag: function(arg) {
			if (typeof arg === 'string') {
				for (var i = 0, length = this.length; i < length; i++) {
					this[i].tagName = arg;
				}
				return this;
			}
			return this[0] && this[0].tagName;
		},
		css: function(mix, value) {
			var args = arguments.length,
				length = this.length,
				i = 0,
				css, key, style;

			if (args === 1 && typeof mix === 'string') {
				if (length === 0) {
					return null;
				}
				if (typeof this[0].attr.style === 'string') {
					return css_toObject(this[0].attr.style)[mix];
				} else {
					return null;
				}
			}

			for (; i < length; i++) {
				style = this[i].attr.style;

				if (typeof style === 'function') {
					continue;
				}
				if (args === 1 && typeof mix === 'object') {
					if (style == null) {
						this[i].attr.style = css_toString(mix);
						continue;
					}
					css = css_toObject(style);
					for (key in mix) {
						css[key] = mix[key];
					}
					this[i].attr.style = css_toString(css);
				}

				if (args === 2) {
					if (style == null) {
						this[i].attr.style = mix + ':' + value;
						continue;
					}
					css = css_toObject(style);
					css[mix] = value;
					this[i].attr.style = css_toString(css);

				}
			}

			return this;
		}
	});

	// TODO: val(...)?

	function css_toObject(style) {
		var arr = style.split(';'),
			obj = {},
			index;
		for (var i = 0, x, length = arr.length; i < length; i++) {
			x = arr[i];
			index = x.indexOf(':');
			obj[x.substring(0, index).trim()] = x.substring(index + 1).trim();
		}
		return obj;
	}

	function css_toString(css) {
		var output = [],
			i = 0;
		for (var key in css) {
			output[i++] = key + ':' + css[key];
		}
		return output.join(';');
	}

}());

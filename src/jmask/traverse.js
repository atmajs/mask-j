obj_extend(jMask.prototype, {
	each: function(fn, cntx) {
		for (var i = 0; i < this.length; i++) {
			fn.call(cntx || this, this[i], i)
		}
		return this;
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

	jMask.prototype[method] = function(selector) {
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
				if (x.nodes == null) {
					continue;
				}
				result = result.concat(matcher == null ? x.nodes : jmask_filter(x.nodes, matcher));
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

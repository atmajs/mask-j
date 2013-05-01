function jMask(mix) {


	if (this instanceof jMask === false) {
		return new jMask(mix);
	}

	if (mix == null) {
		return this;
	}
	if (mix.type === Dom.SET) {
		return mix;
	}

	return this.add(mix);
}

jMask.prototype = {
	constructor: jMask,
	type: Dom.SET,
	length: 0,
	components: null,
	add: function(mix) {
		var i, length;

		if (typeof mix === 'string') {
			mix = _mask_parse(mix);
		}

		if (mix instanceof Array) {
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

		if (!type) {
			// @TODO extend to any type?
			console.error('Only Mask Node/Component/NodeText/Fragment can be added to jmask set', mix);
			return this;
		}

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
		return Array.prototype.slice.call(this);
	},
	/**
	 *	render([model, cntx, container]) -> HTMLNode
	 * - model (Object)
	 * - cntx (Object)
	 * - container (Object)
	 * - returns (HTMLNode)
	 *
	 **/
	render: function(model, cntx, container, controller) {
		this.components = [];

		if (this.length === 1) {
			return _mask_render(this[0], model, cntx, container, controller || this);
		}

		if (container == null) {
			container = document.createDocumentFragment();
		}

		for (var i = 0, length = this.length; i < length; i++) {
			_mask_render(this[i], model, cntx, container, controller || this);
		}
		return container;
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
		if (template != null) {
			return this.empty().append(template);
		}

		if (arguments.length) {
			return this;
		}

		var node;

		if (this.length === 0) {
			node = new Dom.Node();
		} else if (this.length === 1) {
			node = this[0];
		} else {
			node = new Dom.Fragment();
			for (var i = 0, length = this.length; i < length; i++) {
				node.nodes[i] = this[i];
			}
		}

		return mask.stringify(node);
	},

	text: function(mix, cntx, controller){
		if (typeof mix === 'string') {
			var node = [new Dom.TextNode(mix)];

			for(var i = 0, x, imax = this.length; i < imax; i++){
				x = this[i];
				x.nodes = node;
			}
			return this;
		}

		var string = '';
		for(var i = 0, x, imax = this.length; i < imax; i++){
			x = this[i];
			string += jmask_getText(x, mix, cntx, controller);
		}
		return string;
	}
};

arr_each(['append', 'prepend'], function(method) {

	jMask.prototype[method] = function(mix) {
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

	jMask.prototype[method] = function(mix, model, cntx, controller) {

		if (mix.nodeType != null && typeof mix.appendChild === 'function') {
			mix.appendChild(this.render(model, cntx, null, controller));

			_signal_emitIn(this, 'domInsert');
			return this;
		}

		jMask(mix).append(this);
		return this;
	};

});

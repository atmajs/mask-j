

util_extend(jMask.prototype, {
	clone: function(){
		var result = [];
		for(var i = 0, length = this.length; i < length; i++){
			result[i] = jmask_clone(this[0]);
		}
		return jMask(result);
	},

	// @TODO - wrap also in maskdom (modify parents)
	wrap: function(wrapper){
		var $mask = jMask(wrapper),
			result = [],
			$wrapper;

		if ($mask.length === 0){
			console.log('Not valid wrapper', wrapper);
			return this;
		}

		for(var i = 0, length = this.length; i < length; i++){
			$wrapper = length > 0 ? $mask.clone() : $mask;
			jmask_deepest($wrapper[0]).nodes = [this[i]];

			result[i] = $wrapper[0];

			if (this[i].parent != null){
				this[i].parent.nodes = result[i];
			}
		}

		return jMask(result);
	},
	wrapAll: function(wrapper){
		var $wrapper = jMask(wrapper);
		if ($wrapper.length === 0){
			console.error('Not valid wrapper', wrapper);
			return this;
		}


		this.parent().mask($wrapper);

		jmask_deepest($wrapper[0]).nodes = this.toArray();
		return this.pushStack($wrapper);
	}
});

arr_each(['empty', 'remove'], function(method) {
	jMask.prototype[method] = function() {
		var i = 0,
			length = this.length,
			node;

		for (; i < length; i++) {
			node = this[i];

			if (method === 'empty') {
				node.nodes = null;
				continue;
			}
			if (method === 'remove') {
				if (node.parent != null) {
					arr_remove(node.parent.nodes, node);
				}
				continue;
			}

		}

		return this;
	};
});

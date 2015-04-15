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

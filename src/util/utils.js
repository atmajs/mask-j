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
		arr_each(mix, function(node) {
			if (selector_match(node, matcher)) 
				result.push(node);
		});
		return result;
	};
	
	/**
	 * - mix (Node | Array[Node])
	 */
	jmask_find = function(mix, matcher, output) {
		if (mix == null) {
			return output;
		}
	
		if (output == null) {
			output = [];
		}
	
		if (mix instanceof Array){
			for(var i = 0, length = mix.length; i < length; i++){
				jmask_find(mix[i], matcher, output);
			}
			return output;
		}
	
		if (selector_match(mix, matcher)){
			output.push(mix);
		}
	
		var next = mix[matcher.nextKey];
	
		if (next != null){
			jmask_find(next, matcher, output);
		}
	
		return output;
	};
	
	jmask_clone = function(node, parent){
	
		var copy = {
			'type': 1,
			'tagName': 1,
			'compoName': 1,
			'controller': 1
		};
	
		var clone = {
			parent: parent
		};
	
		for(var key in node){
			if (copy[key] === 1){
				clone[key] = node[key];
			}
		}
	
		if (node.attr){
			clone.attr = util_extend({}, node.attr);
		}
	
		var nodes = node.nodes;
		if (nodes != null && nodes.length > 0){
			clone.nodes = [];
	
			var isarray = nodes instanceof Array,
				length = isarray === true ? nodes.length : 1,
				i = 0;
			for(; i< length; i++){
				clone.nodes[i] = jmask_clone(isarray === true ? nodes[i] : nodes, clone);
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
	
	
	jmask_getText = function(node, model, cntx, controller) {
		if (Dom.TEXTNODE === node.type) {
			if (typeof node.content === 'function') {
				return node.content('node', model, cntx, null, controller);
			}
			return node.content;
		}
	
		var output = '';
		if (node.nodes != null) {
			for(var i = 0, x, imax = node.nodes.length; i < imax; i++){
				x = node.nodes[i];
				output += jmask_getText(x, model, cntx, controller);
			}
		}
		return output;
	};

}());

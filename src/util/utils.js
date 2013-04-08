
function jmask_filter(arr, matcher) {
	if (matcher == null) {
		return arr;
	}

	var result = [];
	for (var i = 0, x, length = arr.length; i < length; i++) {
		x = arr[i];
		if (selector_match(x, matcher)) {
			result.push(x);
		}
	}
	return result;
}

/**
 * - mix (Node | Array[Node])
 */
function jmask_find(mix, matcher, output) {
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
}

function jmask_clone(node, parent){

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
}


function jmask_deepest(node){
	var current = node,
		prev;
	while(current != null){
		prev = current;
		current = current.nodes && current.nodes[0];
	}
	return prev;
}

////////function jmask_initHandlers($$, parent){
////////	var instance;
////////
////////	for(var i = 0, x, length = $$.length; i < length; i++){
////////		x = $$[i];
////////		if (x.type === Dom.COMPONENT){
////////			if (typeof x.controller === 'function'){
////////				instance = new x.controller();
////////				instance.nodes = x.nodes;
////////				instance.attr = util_extend(instance.attr, x.attr);
////////				instance.compoName = x.compoName;
////////				instance.parent = parent;
////////
////////				x = $$[i] = instance;
////////			}
////////		}
////////		if (x.nodes != null){
////////			jmask_initHandlers(x.nodes, x);
////////		}
////////	}
////////}


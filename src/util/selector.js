function selector_parse(selector, type, direction) {
	if (selector == null) {
		console.warn('selector is null for type', type);
	}

	if (typeof selector === 'object') {
		return selector;
	}

	var key, prop, nextKey, filters, _key, _prop, _selector;

	var index = 0,
		length = selector.length,
		c,
		end,
		matcher,
		eq,
		slicer;

	if (direction === 'up') {
		nextKey = 'parent';
	} else {
		nextKey = type === Dom.SET ? 'nodes' : 'components';
	}

	while (index < length) {

		c = selector.charCodeAt(index);

		if (c < 33) {
			continue;
		}

		end = selector_moveToBreak(selector, index + 1, length);


		if (c === 46 /*.*/ ) {
			_key = 'class';
			_prop = 'attr';
			_selector = new RegExp('\\b' + selector.substring(index + 1, end) + '\\b');
		}

		else if (c === 35 /*#*/ ) {
			_key = 'id';
			_prop = 'attr';
			_selector = selector.substring(index + 1, end);
		}

		else if (c === 91 /*[*/ ) {
			eq = selector.indexOf('=', index);
			//if DEBUG
			eq === -1 && console.error('Attribute Selector: should contain "="');
			// endif

			_prop = 'attr';
			_key = selector.substring(index + 1, eq);

			//slice out quotes if any
			c = selector.charCodeAt(eq + 1);
			slicer = c === 34 || c === 39 ? 2 : 1;

			_selector = selector.substring(eq + slicer, end - slicer + 1);

			// increment, as cursor is on closed ']'
			end++;
		}

		else {
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
			}

			continue;
		}

		if (matcher.filters == null) {
			matcher.filters = [];
		}

		matcher.filters.push({
			key: _key,
			selector: _selector,
			prop: _prop
		});

	}

	return matcher;


	////////
	////////if (key == null) {
	////////	switch (selector[0]) {
	////////	case '#':
	////////		key = 'id';
	////////		selector = selector.substring(1);
	////////		prop = 'attr';
	////////		break;
	////////	case '.':
	////////		key = 'class';
	////////		selector = new RegExp('\\b' + selector.substring(1) + '\\b');
	////////		prop = 'attr';
	////////		break;
	////////	default:
	////////		key = type === Dom.SET ? 'tagName' : 'compoName';
	////////		break;
	////////	}
	////////}
	////////
	////////
	////////
	////////return {
	////////	key: key,
	////////	prop: prop,
	////////	selector: selector,
	////////	nextKey: nextKey
	////////};
}

function selector_moveToBreak(selector, index, length) {
	var c, isInQuote = false,
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

		if (c === 46 || c === 35 || c === 91 || c === 93 || c < 33) {
			// .#[]
			if (!(isInQuote === true && isEscaped === true)) {
				break;
			}
		}
		index++;
	}
	return index;
}

function selector_match(node, selector, type) {
	if (typeof selector === 'string') {
		if (type == null) {
			type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
		}
		selector = selector_parse(selector, type);
	}

	var obj = selector.prop ? node[selector.prop] : node,
		matched = false;

	if (obj == null) {
		return false;
	}

	if (selector.selector.test != null) {
		if (selector.selector.test(obj[selector.key])) {
			matched = true;
		}
	} else  if (obj[selector.key] === selector.selector) {
		matched = true;
	}

	if (matched === true && selector.filters != null) {
		for(var i = 0, x, imax = selector.filters.length; i < imax; i++){
			x = selector.filters[i];

			if (selector_match(node, x, type) === false) {
				return false;
			}
		}
	}

	return matched;
}

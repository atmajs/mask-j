function arr_each(any, fn) {
	var isarray = arr_isArray(any),
		i = -1,
		imax = isarray
			? any.length
			: 1
		;
	var x;
	while ( ++i < imax ){
		x = isarray
			? any[i]
			: any
			;
		fn(x, i);
	}
}

function arr_remove(array, child) {
	if (array == null) {
		console.error('Can not remove myself from parent', child);
		return;
	}

	var index = array.indexOf(child);

	if (index === -1) {
		console.error('Can not remove myself from parent', child, index);
		return;
	}

	array.splice(index, 1);
}

function arr_isArray(x) {
	return x != null
		&& typeof x === 'object'
		&& x.length != null
		&& typeof x.slice === 'function'
		;
}

var arr_unique = (function() {

	var hasDuplicates = false;

	function sort(a, b) {
		if (a === b) {
			hasDuplicates = true;
			return 0;
		}

		return 1;
	}

	return function(array) {
		var duplicates, i, j, imax;

		hasDuplicates = false;

		array.sort(sort);

		if (hasDuplicates === false) {
			return array;
		}

		duplicates = [];
		i = 0;
		j = 0;
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

}());


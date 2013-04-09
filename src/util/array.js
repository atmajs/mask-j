function arr_each(array, fn) {
	for (var i = 0, length = array.length; i < length; i++) {
		fn(array[i], i);
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


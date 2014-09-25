var Dom = mask.Dom,
	_mask_render = mask.render,
	_mask_parse = mask.parse,
	_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn,
	_signal_emitIn = (mask.Compo || Compo).signal.emitIn;
	

function _mask_ensureTmplFn(value) {
	if (typeof value !== 'string') {
		return value;
	}
	return _mask_ensureTmplFnOrig(value);
}


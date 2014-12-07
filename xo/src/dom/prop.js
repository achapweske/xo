define([], function () {

	var propertyNames = {
		'tabindex': 'tabIndex',
		'readonly': 'readOnly',
		'for': 'htmlFor',
		'class': 'className',
		'maxlength': 'maxLength',
		'cellspacing': 'cellSpacing',
		'cellpadding': 'cellPadding',
		'rowspan': 'rowSpan',
		'colspan': 'colSpan',
		'usemap': 'useMap',
		'frameborder': 'frameBorder',
		'contenteditable': 'contentEditable'
	};

	return {
		getProperty: function(node, name) {
			name = propertyNames[name] || name;
			return node[name];
		},
		setProperty: function(node, name, value) {
			name = propertyNames[name] || name;
			node[name] = value;
		},
		removeProperty: function(node, name) {
			name = propertyNames[name] || name;
			delete node[name];
		}
	};
});
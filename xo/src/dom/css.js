define(['src/core/Utils'], function (Utils) {

	var propertyNames = {
		'float': 'cssFloat'
	};

	var vendorNamePrefixes = [ "Webkit", "O", "Moz", "ms" ];

	function resolvePropertyName(style, name) {
		return propertyNames[name] || (propertyNames[name] = detectPropertyName(style, name));
	};

	function detectPropertyName(style, name) {
		// Force lowerCamelCase below for microsoft prefix
		name = name.replace(/^-ms-/, "ms-");

		// Convert dash-separated-name to CamelCase
		name = name.replace(/-([\da-z])/gi, function(match, p1) {
			return p1.toUpperCase();
		});

		// See if property with given name exists
		if (name in style) {
			return name;
		}

		// If not, try name with vendor prefixes
		var rootName = name.charAt(0).toUpperCase() + name.slice(1);
		for (var i = 0; i < vendorNamePrefixes.length; i++) {
			var vendorName = vendorNamePrefixes[i] + rootName;
			if (vendorName in style) {
				return vendorName;
			}
		}

		return name;
	};

	function cssLengthValue(value) {
		if (Utils.isNumeric(value)) {
			return value + 'px';
		}
		else {
			return value;
		}
	};

	function cssBoxLengthValue(value) {
		if (Utils.isString(value) && value.length > 0) {
			return value.split(' ').map(cssLengthValue).join(' ');
		}
		else {
			return value;
		}
	};

	var cssHooks = {
		'border-width': { value: cssBoxLengthValue },
		'border-radius': { value: cssBoxLengthValue },
		'font-size': { value: cssLengthValue },
		'height': { value: cssLengthValue },
		'margin': { value: cssBoxLengthValue },
		'max-height': { value: cssLengthValue },
		'max-width': { value: cssLengthValue },
		'min-height': { value: cssLengthValue },
		'min-width': { value: cssLengthValue },
		'padding': { value: cssBoxLengthValue },
		'transform-origin': { value: cssBoxLengthValue },
		'width': { value: cssLengthValue }
	};

	function getInlineProperty(name) {
		var style = this.style;
		name = resolvePropertyName(style, name);
		return style[name];
	};

	function setInlineProperty(name, value) {
		var style = this.style,
			hook = cssHooks[name];
		name = resolvePropertyName(style, name);

		// if value is an object with a function called 'css', 
		// call that function to get the actual CSS value.
		if (value && Utils.isFunction(value.css)) {
			value = value.css();
		}

		if (hook && hook.value) {
			value = hook.value(value);
		}

		if (Utils.isUndefined(value) || value === null) {
			value = '';
		}

		try {
			style[name] = value;
		}
		catch (ex) {
			// IE8: throws exceptions when setting an unsupported style property 
			// (or setting a supported property to an invalid value)
			if (window.console) console.error(name + '="' + value + '": ' + ex.message);
		}
	};

	return {
		getInlineProperty: getInlineProperty,
		setInlineProperty: setInlineProperty
	};
});
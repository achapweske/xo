define(['./Utils', './Property'], function(Utils, Property) {

	function RelativeProperty(options) {
		Property.call(this, {
			get: RelativeProperty._getRelativeValue,
			set: RelativeProperty._setRelativeValue
		});

		if (!options || !options.path || !options.path.length) {
			throw new Error('missing parameter "path"');
		}

		if (Utils.isString(options.path)) {
			this._path = options.path.split('.');
		}
		else if (Array.isArray(options.path)) {
			this._path = options.path.slice(0);
		}
		else {
			throw options.path + ' is not a string or array';
		}

		while (this._path[0] === 'this') {
			this._path.splice(0, 1);
		}
	};

	RelativeProperty.prototype = new Property;// Object.create(Property.prototype);
	RelativeProperty.prototype.constructor = RelativeProperty;

	RelativeProperty._getRelativeValue = function(property, target) {
		var path = property._path;
		for (var i = 0; i < path.length; i++) {
			if (!target) {
				Utils.warn('Data binding error: property "' + path[i-1] + '" not found');
				return;
			}
			target = RelativeProperty._getValue(target, path[i]);
		}
		return target;
	};

	RelativeProperty._setRelativeValue = function(newValue, property, target) {
		var path = property._path;
		for (var i = 0; i < path.length-1; i++) {
			if (!target) {
				Utils.warn('Data binding error: property "' + path[i-1] + '" not found');
				return;
			}
			target = RelativeProperty._getValue(target, path[i]);
		}
		RelativeProperty._setValue(target, path[i], newValue);
	};

	RelativeProperty._getValue = function(obj, property, priority) {
		if (Property.isProperty(property)) {
			return Property.getValue(obj, property, priority);
		}
		var value = obj[property];
		if (value && Property.isProperty(value)) {
			property = value;
			return Property.getValue(obj, property, priority);
		}
		else {
			return value;
		}
	};

	RelativeProperty._setValue = function(obj, property, newValue, priority) {
		if (Property.isProperty(property)) {
			return Property.setValue(obj, property, newValue, priority);
		}
		var value = obj[property];
		if (value && Property.isProperty(value)) {
			property = value;
			return Property.setValue(obj, property, newValue, priority);
		}
		else {
			obj[property] = newValue;
		}
	};

	return RelativeProperty;
});
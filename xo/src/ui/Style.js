define(['xo', './Dictionary', './PropertyPriorities'], function (xo, Dictionary, PropertyPriorities) {
	function Style() {

	};

	Style.prototype.contentCollection = 'properties';

	Style.prototype.properties = xo.property({
		type: Array
	});

	Style.prototype.definitions = xo.property({
		get: function() {
			return Dictionary.definitions.get(this);
		}
	});

	Style.prototype.applyTo = function(target) {
		var properties = this.properties();
		if (properties) {
			properties.forEach(function(property) {
				property.applyTo(target, PropertyPriorities.Style);
			});
		}
	};

	Style.prototype.clear = function(target) {
		var properties = this.properties();
		if (properties) {
			properties.forEach(function(property) {
				property.clear(target, PropertyPriorities.Style);
			});
		}
	};

	return Style;
});
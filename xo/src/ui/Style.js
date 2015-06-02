define(['xo', './Dictionary', './Property', './PropertyPriorities'], function (xo, Dictionary, Property, PropertyPriorities) {
	
	var Style = xo.Object.extend({
		
		construct: function Style(options) {
			if (options) {
				var properties = xo.pairs(options);
				properties = xo.map(properties, function(pair) {
					return new Property(pair[0], pair[1]);
				});
				this.properties(properties);
			}
		},

		contentCollection: 'properties',

		properties: xo.property({
			type: Array
		}),

		definitions: xo.property({
			get: function() {
				return Dictionary.definitions.get(this);
			}
		}),

		applyTo: function(target) {
			var properties = this.properties();
			if (properties) {
				properties.forEach(function(property) {
					property.applyTo(target, PropertyPriorities.Style);
				});
			}
		},

		clear: function(target) {
			var properties = this.properties();
			if (properties) {
				properties.forEach(function(property) {
					property.clear(target, PropertyPriorities.Style);
				});
			}
		}
	});

	return Style;
});
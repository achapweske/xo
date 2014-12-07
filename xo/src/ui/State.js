define(['xo', './PropertyPriorities'], function (xo, PropertyPriorities) {
	function State() {

	};

	State.prototype.contentCollection = 'properties';

	State.prototype.name = xo.property();
	State.prototype.value = xo.property();
	State.prototype.properties = xo.property();

	State.prototype.applyTo = function(target) {
		var properties = this.properties();
		if (properties) {
			properties.forEach(function(property) {
				property.applyTo(target, PropertyPriorities.State);
			});
		}
	};

	State.prototype.clear = function(target) {
		var properties = this.properties();
		if (properties) {
			properties.forEach(function(property) {
				property.clear(target, PropertyPriorities.State);
			});
		}
	};

	return State;
});

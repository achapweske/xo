define(['xo'], function (xo) {
	function Property(options) {
		if (options) {
			if ('target' in options) this.target(options.target);
			if ('name' in options) this.name(options.name);
			if ('value' in options) this.value(options.value);
		}
	};

	Property.prototype.contentProperty = 'value';

	Property.prototype.target = xo.property();
	Property.prototype.name = xo.property();
	Property.prototype.value = xo.property();

	Property.prototype.applyTo = function(target, priority) {
		target = this.target() || target;
		if (target) {
			xo.Property.setValue(target, this.name(), this.value(), priority);
		}
	};

	Property.prototype.clear = function(target, priority) {
		target = this.target() || target;
		if (target) {
			xo.Property.clearValue(target, this.name(), priority);
		}
	};

	return Property;
});
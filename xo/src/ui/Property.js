define(['xo'], function (xo) {
	var Property = xo.Object.extend({

		construct: function Property(options) {
			if (xo.isString(options)) {
				this.name(arguments[0]);
				this.value(arguments[1]);
				this.target(arguments[3]);
			}
			else {
				this.initialize(options);
			}
		},

		contentProperty: 'value',

		target: xo.property(),
		name: xo.property(),
		value: xo.property(),

		applyTo: function(target, priority) {
			target = this.target() || target;
			if (target) {
				xo.Property.setValue(target, this.name(), this.value(), priority);
			}
		},

		clear: function(target, priority) {
			target = this.target() || target;
			if (target) {
				xo.Property.clearValue(target, this.name(), priority);
			}
		}
	});

	return Property;
});
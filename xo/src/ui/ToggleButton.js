define(['xo', './Button'], function (xo, Button) {
	return Button.extend({
		construct: function(options) {
			this.setDefaultValue('defaultStyleKey', 'ToggleButton');
			this.initialize(options);
		},

		isChecked: xo.property(),

		onClick: function() {
			this.isChecked(!this.isChecked());
		}
	});
});
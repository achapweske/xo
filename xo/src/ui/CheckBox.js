define(['xo', './ToggleButton'], function (xo, ToggleButton) {
	return ToggleButton.extend({
		construct: function CheckBox(options) {
			this.setDefaultValue('defaultStyleKey', 'CheckBox');
			this.initialize(options);
		}
	});
});
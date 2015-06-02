define(['xo', './ContentControl'], function (xo, ContentControl) {
	return ContentControl.extend({
		construct: function(options) {
			this.setDefaultValue('defaultStyleKey', 'ListBoxItem');
			this.cursor('default');
			this.initialize(options);
		},

		isSelected: xo.property({
			defaultValue: false
		})
	});
});
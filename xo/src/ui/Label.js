define(['xo', './ContentControl'], function (xo, ContentControl) {
	var Label = ContentControl.extend({
		construct: function Label(options) {
			this.setDefaultValue('defaultStyleKey', 'Label');
			this.initialize(options);
		}
	});

	return Label;
});
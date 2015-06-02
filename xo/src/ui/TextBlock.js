define(['xo', './Widget'], function (xo, Widget) {

	return Widget.extend({
		construct: function TextBlock(options) {
			this.setDefaultValue('defaultStyleKey', 'TextBlock');
			this.dom.css({
				'line-height': 'normal',
				'vertical-align': 'baseline'
			});
			this.initialize(options);
		},

		contentProperty: 'text',

		text: xo.property({
			changed: function(change) {
				this.dom.text(change.newValue);
			}
		})
	});
});
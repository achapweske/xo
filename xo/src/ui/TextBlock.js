define(['xo', './Widget'], function (xo, Widget) {

	return Widget.extend({

		construct: function TextBlock() {
			Widget.call(this);
			this.dom.css({
				'line-height': 'normal',
				'vertical-align': 'baseline'
			});
		},

		contentProperty: 'text',

		text: xo.property({
			changed: function(change) {
				this.dom.text(change.newValue);
			}
		})
	});
});
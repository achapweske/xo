define(['xo', './ContentControl'], function (xo, ContentControl) {
	return ContentControl.extend({
		construct: function ListBoxItem() {
			ContentControl.call(this);
			this.cursor('default');
		},

		isSelected: xo.property({
			defaultValue: false
		})
	});
});
define(['xo', './Button'], function (xo, Button) {
	return Button.extend({
		construct: function ToggleButton() {
			Button.call(this);
		},

		isChecked: xo.property(),

		onClick: function() {
			this.isChecked(!this.isChecked());
		}
	});
});
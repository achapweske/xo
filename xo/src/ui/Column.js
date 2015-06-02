define(['xo', './Widget'], function (xo, Widget) {
	var Column = xo.Object.extend({
		construct: function Column(options) {
			this.dom = xo('col');
			this.initialize(options);
		},

		background: xo.property({
			changed: function(change) {
				xo.observe(this, this.background, function () {
					this.dom.css('background', change.newValue);				
				}, this, change);
			}
		}),

		width: xo.property({
			changed: function(change) {
				xo.observe(this, this.width, function () {
					this.dom.css('width', change.newValue);
				}, this, change);
			}
		})
	});

	return Column;
});

define(['xo', './Widget'], function (xo, Widget) {
	function Column() {
		this.dom = xo('col');
	};

	Column.prototype.background = xo.property({
		changed: function(change) {
			xo.observe(this, this.background, function () {
				this.dom.css('background', change.newValue);				
			}, this, change);
		}
	});

	Column.prototype.width = xo.property({
		changed: function(change) {
			xo.observe(this, this.width, function () {
				this.dom.css('width', change.newValue);
			}, this, change);
		}
	});

	return Column;
});

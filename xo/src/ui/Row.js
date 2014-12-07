define(['xo'], function (xo) {
	function Row() {
		this.dom = xo('tr');
		//this.dom.css('height', '0.1%')
	};

	Row.prototype.background = xo.property({
		changed: function(change) {
			xo.observe(this, this.background, function () {
				this.dom.css('background', change.newValue);				
			}, this, change);
		}
	});

	Row.prototype.height = xo.property({
		changed: function(change) {
			xo.observe(this, this.height, function () {
				this.dom.css('height', change.newValue);
			}, this, change);
		}
	});

	return Row;
});
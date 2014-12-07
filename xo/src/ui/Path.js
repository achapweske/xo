define(['xo', './Shape', './graphics/Path'], function (xo, Shape, PathGraphic) {
	function Path() {
		Shape.call(this, new PathGraphic());
	};

	Path.prototype = Object.create(Shape.prototype);
	Path.prototype.constructor = Shape;

	Path.prototype.data = xo.property({
		changed: function(change) {
			this._graphic.data(change.newValue);
		}
	});

	return Path;
});
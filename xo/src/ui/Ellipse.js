define(['xo', './Shape', './graphics/Ellipse'], function (xo, Shape, EllipseGraphic) {
	function Ellipse() {
		Shape.call(this, new EllipseGraphic());
		xo.Event.addHandler(this, 'width', this._onWidthChanged, this);
		xo.Event.addHandler(this, 'height', this._onHeightChanged, this);
	};

	Ellipse.prototype = Object.create(Shape.prototype);
	Ellipse.prototype.constructor = Shape;

	Ellipse.prototype._onWidthChanged = function(change) {
		this._graphic.centerX(change.newValue / 2);
		this._graphic.radiusX(change.newValue / 2);
	};

	Ellipse.prototype._onHeightChanged = function(change) {
		this._graphic.centerY(change.newValue / 2);
		this._graphic.radiusY(change.newValue / 2);
	};

	return Ellipse;
});
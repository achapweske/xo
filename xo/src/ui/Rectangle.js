define(['xo', './Shape', './graphics/Rectangle'], function (xo, Shape, RectangleGraphic) {
	function Rectangle() {
		Shape.call(this, new RectangleGraphic());
		xo.Event.addHandler(this, 'width', this._onWidthChanged, this);
		xo.Event.addHandler(this, 'height', this._onHeightChanged, this);
	};

	Rectangle.prototype = Object.create(Shape.prototype);
	Rectangle.prototype.constructor = Shape;

	Rectangle.prototype._onWidthChanged = function(change) {
		this._graphic.width(change.newValue);
	};

	Rectangle.prototype._onHeightChanged = function(change) {
		this._graphic.height(change.newValue);
	};

	return Rectangle;
});
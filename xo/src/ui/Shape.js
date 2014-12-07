define(['xo', './graphics/Drawing'], function (xo, Drawing) {
	function Shape(graphicPrimitive) {
		Drawing.call(this);
		this._graphic = graphicPrimitive;
		this.children().append(graphicPrimitive);
	};

	Shape.prototype = Object.create(Drawing.prototype);
	Shape.prototype.constructor = Shape;

	Shape.prototype.fill = xo.property({
		changed: function(change) {
			this._graphic.fill(change.newValue);
		}
	});

	Shape.prototype.stroke = xo.property({
		changed: function(change) {
			this._graphic.stroke(change.newValue);
		}
	});

	Shape.prototype.strokeWidth = xo.property({
		changed: function(change) {
			this._graphic.strokeWidth(change.newValue);
		}
	});

	return Shape;
});
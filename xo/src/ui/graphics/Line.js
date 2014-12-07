define(['xo', './Shape'], function (xo, Shape) {
	function Line() {
		Shape.call(this, createElement());
	};

	function createElement() {
		try {
			return document.createElementNS('http://www.w3.org/2000/svg', 'line');
		}
		catch (e) {
			return null;
		}
	};

	Line.prototype = Object.create(Shape.prototype);
	Line.prototype.constructor = Line;

	Line.prototype.x1 = xo.property({
		changed: function(change) {
			this.dom.attr('x1', change.newValue);
		}
	});

	Line.prototype.y1 = xo.property({
		changed: function(change) {
			this.dom.attr('y1', change.newValue);
		}
	});

	Line.prototype.x2 = xo.property({
		changed: function(change) {
			this.dom.attr('x2', change.newValue);
		}
	});

	Line.prototype.y2 = xo.property({
		changed: function(change) {
			this.dom.attr('y2', change.newValue);
		}
	});

	return Line;
});
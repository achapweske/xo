define(['xo', './Shape'], function (xo, Shape) {
	function Ellipse() {
		Shape.call(this, { element: createElement() });
	};

	function createElement() {
		try {
			return document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
		}
		catch (e) {
			return null;
		}
	};

	Ellipse.prototype = Object.create(Shape.prototype);
	Ellipse.prototype.constructor = Ellipse;

	Ellipse.prototype.centerX = xo.property({
		changed: function(change) {
			this.dom.attr('cx', change.newValue);
		}
	});

	Ellipse.prototype.centerY = xo.property({
		changed: function(change) {
			this.dom.attr('cy', change.newValue);
		}
	});

	Ellipse.prototype.radiusX = xo.property({
		changed: function(change) {
			this.dom.attr('rx', change.newValue);
		}
	});

	Ellipse.prototype.radiusY = xo.property({
		changed: function(change) {
			this.dom.attr('ry', change.newValue);
		}
	});

	return Ellipse;
});
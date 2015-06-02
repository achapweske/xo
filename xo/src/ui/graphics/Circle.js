define(['xo', './Shape'], function (xo, Shape) {
	function Circle() {
		Shape.call(this, { element: createElement() });
	};

	function createElement() {
		try {
			return document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		}
		catch (e) {
			return null;
		}
	};

	Circle.prototype = Object.create(Shape.prototype);
	Circle.prototype.constructor = Circle;

	Circle.prototype.centerX = xo.property({
		changed: function(change) {
			this.dom.attr('cx', change.newValue);
		}
	});

	Circle.prototype.centerY = xo.property({
		changed: function(change) {
			this.dom.attr('cy', change.newValue);
		}
	});

	Circle.prototype.radius = xo.property({
		changed: function(change) {
			this.dom.attr('r', change.newValue);
		}
	});

	return Circle;
});
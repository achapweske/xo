define(['xo', './Shape'], function (xo, Shape) {
	function Rectangle() {
		Shape.call(this, { element: createElement() });
	};

	function createElement() {
		try {
			return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		}
		catch (e) {
			return null;
		}
	};

	Rectangle.prototype = Object.create(Shape.prototype);
	Rectangle.prototype.constructor = Rectangle;

	Rectangle.prototype.x = xo.property({
		changed: function(change) {
			this.dom.attr('x', change.newValue);
		}
	});

	Rectangle.prototype.y = xo.property({
		changed: function(change) {
			this.dom.attr('y', change.newValue);
		}
	});

	Rectangle.prototype.width = xo.property({
		changed: function(change) {
			this.dom.attr('width', change.newValue);
		}
	});

	Rectangle.prototype.height = xo.property({
		changed: function(change) {
			this.dom.attr('height', change.newValue);
		}
	});

	Rectangle.prototype.cornerRadiusX = xo.property({
		changed: function(change) {
			this.dom.attr('rx', change.newValue);
		}
	});

	Rectangle.prototype.cornerRadiusY = xo.property({
		changed: function(change) {
			this.dom.attr('ry', change.newValue);
		}
	});

	return Rectangle;
});
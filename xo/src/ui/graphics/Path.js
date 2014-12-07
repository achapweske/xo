define(['xo', './Shape'], function (xo, Shape) {
	function Path() {
		Shape.call(this, createElement());
	};

	function createElement() {
		try {
			return document.createElementNS('http://www.w3.org/2000/svg', 'path');
		}
		catch (e) {
			return null;
		}
	};

	Path.prototype = Object.create(Shape.prototype);
	Path.prototype.constructor = Path;

	Path.prototype.data = xo.property({
		changed: function(change) {
			this.dom.attr('d', change.newValue);
		}
	});

	return Path;
});
define(['xo', 'src/ui/Panel'], function (xo, Panel) {
	function Drawing() {
		Panel.call(this, { element: createSVGElement() });
	};

	function createSVGElement() {
		try {
			return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		}
		catch (e) {
			return null;
		}
	};

	Drawing.prototype = Object.create(Panel.prototype);
	Drawing.prototype.constructor = Drawing;

	Drawing.prototype.width = xo.property({
		changed: function(change) {
			this.dom.attr('width', change.newValue);
		}
	});

	Drawing.prototype.height = xo.property({
		changed: function(change) {
			this.dom.attr('height', change.newValue);
		}
	});

	Drawing.prototype.viewBox = xo.property({
		changed: function(change) {
			this.dom.attr('viewBox', change.newValue);
		}
	});

	return Drawing;
});
define(['xo', 'src/ui/Visual'], function (xo, Visual) {
	function Shape(options) {
		Visual.call(this, options);
	};

	Shape.prototype = Object.create(Visual.prototype);
	Shape.prototype.constructor = Shape;

	Shape.prototype.fill = xo.property({
		changed: function(change) {
			this.dom.attr('fill', change.newValue);
		}
	});

	Shape.prototype.fillRule = xo.property({
		defaultValue: 'nonzero',
		changed: function(change) {
			this.dom.attr('fill-rule', change.newValue);
		}
	});

	Shape.prototype.stroke = xo.property({
		changed: function(change) {
			this.dom.attr('stroke', change.newValue);
		}
	});

	Shape.prototype.strokeWidth = xo.property({
		changed: function(change) {
			this.dom.attr('stroke-width', change.newValue);
		}
	});

	Shape.prototype.width = xo.property({
		changed: function(change) {
			this.dom.prop('width', change.newValue);
		}
	});

	Shape.prototype.height = xo.property({
		changed: function(change) {
			this.dom.prop('height', change.newValue);
		}
	});

	return Shape;
});
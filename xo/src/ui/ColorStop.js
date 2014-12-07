define(['xo'], function (xo) {
	function ColorStop() {

	};

	ColorStop.prototype.color = xo.property();

	ColorStop.prototype.offset = xo.property();

	ColorStop.prototype.css = function() {
		var color = this.color();
		if (!color) return '';
		var result = color.css ? color.css() : (''+color);

		var offset = this.offset();
		if (typeof offset != 'undefined' && offset !== null && offset !== '') {
			result += ' ' + offset;
		}
		return result;
	};

	return ColorStop;
});
define(['xo'], function (xo) {
	function LinearGradient() {

	};

	LinearGradient.prototype.contentCollection = 'colorStops';

	LinearGradient.prototype.angle = xo.property();

	LinearGradient.prototype.colorStops = xo.property();

	LinearGradient.prototype.css = function() {
		var angle = this.angle(),
			colorStops = this.colorStops(),
			result = '';

		if (angle) {
			result = angle;
		}
		if (colorStops) {
			for (var i = 0; i < colorStops.length; i++) {
				var colorStop = colorStops[i];
				if (result.length > 0) result += ',';
				result += colorStop.css ? colorStop.css() : colorStop;
			}
		}
		return '-webkit-linear-gradient(' + result + ')';
	};

	return LinearGradient;
});
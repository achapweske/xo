define(['xo'], function (xo) {

	var requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			return window.setTimeout(callback, 1000 / 60);
		};

	var cancelAnimationFrame = window.cancelAnimationFrame ||
	window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		window.msCancelAnimationFrame ||
		window.clearTimeout;

	return xo.Object.extend({
		construct: function AnimationTimer() {
			this._isStarted = false;
			this._onElapsed = this.onElapsed.bind(this);
		},

		elapsed: xo.event(),

		start: function() {
			if (this._isStarted) return;
			this._isStarted = true;
			this._timerId = requestAnimationFrame(this._onElapsed);
		},

		stop: function() {
			if (!this._isStarted) return;
			this._isStarted = false;
			cancelAnimationFrame(this._timerId);
		},

		isStarted: function() {
			return this._isStarted;
		},

		onElapsed: function(timestamp) {
			if (!this._isStarted) return;
			this._timerId = requestAnimationFrame(this._onElapsed);
			this.elapsed(this, { timestamp: timestamp });
		}
	});

});
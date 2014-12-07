define(['xo', './Control'], function (xo, Control) {
	function ScrollBar() {
		Control.call(this);
	}

	ScrollBar.prototype = Object.create(Control.prototype);
	ScrollBar.prototype.constructor = ScrollBar;

	ScrollBar.prototype.largeValue = xo.property({
		defaultValue: 1
	});

	ScrollBar.prototype.smallValue = xo.property({
		defaultValue: 0.1
	});

	ScrollBar.prototype.value = xo.property();

	ScrollBar.prototype.track = xo.property({
		get: function() {
			return this._track;
		}
	});

	ScrollBar.prototype._setTrack = function(newValue) {
		var oldValue = this._track;
		if (oldValue !== newValue) {
			this._track = newValue;
			xo.Event.raiseEvent(this, 'track', { newValue: newValue, oldValue: oldValue });
		}
	};

	ScrollBar.prototype.onApplyTemplate = function(templateInstance) {
		this._setTrack(templateInstance.track);
	};

	return ScrollBar;
});
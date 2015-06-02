define(['xo', './Button'], function (xo, Button) {
	function RepeatButton() {
		Button.call(this);
		this.setDefaultValue('defaultStyleKey', 'RepeatButton');
	};

	RepeatButton.prototype = Object.create(Button.prototype);
	RepeatButton.prototype.constructor = RepeatButton;

	RepeatButton.prototype.delay = xo.property({
		defaultValue: 750
	});

	RepeatButton.prototype.interval = xo.property({
		defaultValue: 200
	});

	RepeatButton.prototype.click = xo.event({
		activate: function() {
			xo.Event.addHandler(this, 'mouseDown', this._onRepeatButtonMouseDown, this);
			xo.Event.addHandler(this, 'mouseUp', this._onRepeatButtonMouseUp, this);
		},
		inactivate: function() {
			xo.Event.removeHandler(this, 'mouseDown', this._onRepeatButtonMouseDown, this);
			xo.Event.removeHandler(this, 'mouseUp', this._onRepeatButtonMouseUp, this);
		}
	});

	RepeatButton.prototype._onRepeatButtonMouseDown = function(e) {
		this.click(this);
		if (!('_delayTimerId' in this)) {
			this._delayTimerId = setTimeout(this._onRepeatButtonDelayElapsed.bind(this), this.delay());
		}
	};

	RepeatButton.prototype._onRepeatButtonMouseUp = function(e) {
		if ('_delayTimerId' in this) {
			clearTimeout(this._delayTimerId);
			delete this._delayTimerId;
		}
		if ('_intervalTimerId' in this) {
			clearInterval(this._intervalTimerId);
			delete this._intervalTimerId;
		}
	};

	RepeatButton.prototype._onRepeatButtonDelayElapsed = function() {
		this.click(this);
		if (!('_intervalTimerId' in this)) {
			this._intervalTimerId = setInterval(this._onRepeatButtonIntervalElapsed.bind(this), this.interval());
		}
	};

	RepeatButton.prototype._onRepeatButtonIntervalElapsed = function() {
		this.click(this);
	};

	return RepeatButton;
});
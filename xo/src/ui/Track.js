define(['xo', './Widget', './RepeatButton', './Thumb'], function (xo, Widget, RepeatButton, Thumb) {
	function Track() {
		Widget.call(this);
		this.dom.css('position', 'relative');
	};

	Track.prototype = Object.create(Widget.prototype);
	Track.prototype.constructor = Track;

	Track.prototype.decreaseRepeatButton = xo.property({
		get: function() {
			return this._decreaseRepeatButton || (this._decreaseRepeatButton = new RepeatButton());
		},
		set: function(newValue) {
			var oldValue = this._decreaseRepeatButton;
			if (newValue != oldValue) {
				this._decreaseRepeatButton = newValue;
				xo.Event.raiseEvent(this, 'decreaseRepeatButton', { newValue: newValue, oldValue: oldValue });
			}
		}
	});

	Track.prototype.increaseRepeatButton = xo.property({
		get: function() {
			return this._increaseRepeatButton || (this._increaseRepeatButton = new RepeatButton());
		},
		set: function(newValue) {
			var oldValue = this._increaseRepeatButton;
			if (newValue != oldValue) {
				this._increaseRepeatButton = newValue;
				xo.Event.raiseEvent(this, 'increaseRepeatButton', { newValue: newValue, oldValue: oldValue });
			}
		}
	});

	Track.prototype.maximum = xo.property({
		defaultValue: 1
	});

	Track.prototype.minimum = xo.property({
		defaultValue: 0
	});

	Track.prototype.orientation = xo.property({
		defaultValue: 'horizontal'
	});

	Track.prototype.thumb = xo.property({
		get: function() {
			return this._thumb || (this._thumb = new Thumb());
		},
		set: function(newValue) {
			var oldValue = this._thumb;
			if (newValue != oldValue) {
				this._thumb = newValue;
				xo.Event.raiseEvent(this, 'thumb', { newValue: newValue, oldValue: oldValue });
			}
		}
	});

	Track.prototype.value = xo.property({
		defaultValue: 0,
		changed: function(change) {
			var offset = 100 * (change.newValue - this.minimum()) / (this.maximum() - this.minimum());
			if (this.orientation() === 'vertical') {
				this.decreaseRepeatButton().height(offset + '%');
				this.increaseRepeatButton().height((100 - offset) + '%');
				this.thumb().dom.css('top', offset + '%');
			}
			else {
				this.decreaseRepeatButton().width(offset + '%');
				this.increaseRepeatButton().width((100 - offset) + '%');
				this.thumb().dom.css('left', offset + '%');
			}
		}
	});

	Track.prototype.onRender = function() {
		var orientation = this.orientation(),
			decreaseRepeatButton = this.decreaseRepeatButton(),
			increaseRepeatButton = this.increaseRepeatButton(),
			thumb = this.thumb();

		xo.EventTracker.ignore(function() {
			var visualChildren = this.visualChildren();
			if (visualChildren.count() !== 3 || 
				visualChildren.get(0) !== decreaseRepeatButton ||
				visualChildren.get(1) !== thumb ||
				visualChildren.get(2) !== increaseRepeatButton) {

				visualChildren.reset([decreaseRepeatButton, thumb, increaseRepeatButton]);
			}
		}, this);

		if (orientation === 'vertical') {
			decreaseRepeatButton.width('100%');
			increaseRepeatButton.width('100%');
			thumb.width('100%');
			thumb.height('25');
		}
		else {
			decreaseRepeatButton.height('100%');
			increaseRepeatButton.height('100%');
			thumb.height('100%');
			thumb.width('25');
		}
		thumb.dom.css('position', 'absolute');

	};

	return Track;
});
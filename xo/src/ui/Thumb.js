define(['xo', './Control'], function (xo, Control) {
	function Thumb() {
		Control.call(this);
		this._activationCount = 0;
	};

	Thumb.prototype = Object.create(Control.prototype);
	Thumb.prototype.constructor = Thumb;

	Thumb.prototype.isDragging = xo.property({
		get: function() {
			return !!this._isDragging;
		},
		activate: function() {
			this._activate();
		},
		inactivate: function() {
			this._inactivate();
		}
	});

	Thumb.prototype._setIsDragging = function(newValue) {
		var oldValue = !!this._isDragging;
		if (newValue !== oldValue) {
			this._isDragging = newValue;
			xo.Event.raiseEvent(this, 'isDragging', { newValue: newValue, oldValue: oldValue });
		}
	};

	Thumb.prototype.dragStarted = xo.event({
		activate: function() {
			this._activate();
		},
		inactivate: function() {
			this._inactivate();
		},
		raised: function() {
			this._setIsDragging(true);
		}
	});

	Thumb.prototype.dragDelta = xo.event({
		activate: function() {
			this._activate();
		},
		inactivate: function() {
			this._inactivate();
		}
	});

	Thumb.prototype.dragCompleted = xo.event({
		activate: function() {
			this._activate();
		},
		inactivate: function() {
			this._inactivate();
		},
		raised: function() {
			this._setIsDragging(false);
		}
	});

	Thumb.prototype._activate = function() {
		if (!this._activationCount++) {
			xo.Event.addHandler(this, 'mouseDown', this._onThumbMouseDown, this);
			xo.Event.addHandler(this, 'mouseUp', this._onThumbMouseUp, this);
			xo.Event.addHandler(this, 'mouseMove', this._onThumbMouseMove, this);
		}
	};

	Thumb.prototype._inactivate = function() {
		if (!--this._activationCount) {
			xo.Event.removeHandler(this, 'mouseDown', this._onThumbMouseDown, this);
			xo.Event.removeHandler(this, 'mouseUp', this._onThumbMouseUp, this);
			xo.Event.removeHandler(this, 'mouseMove', this._onThumbMouseMove, this);
		}
	};

	Thumb.prototype._onThumbMouseDown = function(sender, e) {
		this._dragParent = this.visualParent();
		this._dragStart = e.getPosition(this._dragParent);
		this.captureMouse();
		this.dragStarted(e, this);
	};

	Thumb.prototype._onThumbMouseUp = function(sender, e) {
		delete this._dragStart;
		delete this._dragParent;
		this.releaseMouseCapture();
		this.dragCompleted(e, this);
	};

	Thumb.prototype._onThumbMouseMove = function(sender, e) {
		if ('_dragStart' in this) {
			var position = e.getPosition(this._dragParent);
			var args = {
				deltaX: position.x - this._dragStart.x,
				deltaY: position.y - this._dragStart.y
			};
			this._dragStart = position;
			this.dragDelta(args, this);
		}
	};

	return Thumb;
});
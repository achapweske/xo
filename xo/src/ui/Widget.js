define(['xo', './Visual', './Dictionary', './Style', './Transform', './KeyEventArgs', './MouseEventArgs', './TouchEventArgs'], 
	function (xo, Visual, Dictionary, Style, Transform, KeyEventArgs, MouseEventArgs, TouchEventArgs) {
	
	var Widget = Visual.extend({
		construct: function Widget($super, options) {
			$super(xo.pick(options, 'element'));

			var style = this.style();
			if (style) {
				style.applyTo(this);
			}

			this._setupCallbacks();

			options = xo.omit(options, 'element');
			this.initialize(options);
		}
	});

	// Resources:

	Widget.prototype.definitions = xo.property({
		get: function() {
			return Dictionary.definitions.get(this);
		}
	});

	// Style:
	
	Widget.prototype.defaultStyleKey = xo.property();

	Widget.prototype._defaultStyle = xo.property({
		get: function() {
			var defaultStyleKey = this.defaultStyleKey();
			return defaultStyleKey && this.definitions().find(defaultStyleKey) || undefined;
		}
	});

	Widget.prototype.style = xo.property({
		type: Style,
		get: function() {
			return this._style || this._defaultStyle();
		},
		set: function(newValue) {
			var oldValue = this._style || this._defaultStyle();
			if (newValue !== oldValue) {
				this._style = newValue;
				this.raise('style', { newValue: newValue, oldValue: oldValue });
			}
		},
		changed: function(change) {
			if (change.oldValue) {
				change.oldValue.clear(this);
			}
			if (change.newValue) {
				change.newValue.applyTo(this);
			}
		}
	});

	// Properties:

	Widget.prototype.background = xo.property({
		defaultValue: 'transparent',
		changed: function(change) {
			xo.observe(this, this.background, function () {
				this.dom.css('background', change.newValue);				
			}, this, change);
		}
	});

	Widget.prototype.borderColor = xo.property({
		defaultValue: '',
		changed: function(change) {
			xo.observe(this, this.borderColor, function() {
				this.dom.css('border-color', change.newValue);			
			}, this, change);
		}
	});

	Widget.prototype.borderImage = xo.property({
		changed: function(change) {
			xo.observe(this, this.borderImage, function() {
				this.dom.css('border-image', change.newValue + ' 1 stretch');			
			}, this, change);
		}
	});

	Widget.prototype.borderRadius = xo.property({
		defaultValue: 0,
		changed: function(change) {
			xo.observe(this, this.borderRadius, function() {
				this.dom.css('border-radius', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.borderStyle = xo.property({
		defaultValue: 'solid',
		changed: function(change) {
			xo.observe(this, this.borderStyle, function() {
				this.dom.css('border-style', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.borderWidth = xo.property({
		defaultValue: '0',
		changed: function(change) {
			xo.observe(this, this.borderWidth, function() {
				this.dom.css('border-width', change.newValue || 0);
			}, this, change);
		}
	});

	Widget.prototype.cursor = xo.property({
		changed: function(change) {
			xo.observe(this, this.cursor, function() {
				this.dom.css('cursor', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.fontFamily = xo.property({
		changed: function(change) {
			xo.observe(this, this.fontFamily, function() {
				this.dom.css('font-family', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.fontSize = xo.property({
		changed: function(change) {
			xo.observe(this, this.fontSize, function() {
				this.dom.css('font-size', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.foreground = xo.property({
		defaultValue: 'inherit',
		changed: function(change) {
			xo.observe(this, this.foreground, function() {
				this.dom.css('color', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.height = xo.property({
		defaultValue: 'auto',
		changed: function(change) {
			xo.observe(this, this.height, function() {
				this.dom.css('height', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.horizontalAlignment = xo.property({
		defaultValue: 'left'
	});

	Widget.prototype.isEnabled = xo.property({
		defaultValue: true,
		changed: function(change) {
			xo.observe(this, this.isEnabled, function() {
				this.dom.css('pointer-events', change.newValue ? 'none' : '');
			}, this, change);
		}
	});

	Widget.prototype.isMouseOver = xo.property({
		get: function() {
			if ('_isMouseOver' in this) {
				return this._isMouseOver;
			}
			else if (this.dom.querySelector) {
				return !!this.dom.querySelector(':hover');
			}
			else {
				return false;	// TODO (IE6-7)
			}
		},
		activate: function() {
			this.on('mouseEnter', this._isMouseOver_onMouseOver, this);
			this.on('mouseLeave', this._isMouseOver_onMouseOut, this);
			this._isMouseOver = this.isMouseOver();
		},
		inactivate: function() {
			this.off('mouseEnter', this._isMouseOver_onMouseOver, this);
			this.off('mouseLeave', this._isMouseOver_onMouseOut, this);
			delete this._isMouseOver;
		}
	});

	Widget.prototype._setIsMouseOver = function(newValue) {
		var oldValue = this._isMouseOver;
		if (oldValue !== newValue) {
			this._isMouseOver = newValue;
			this.raise('isMouseOver', { oldValue: oldValue, newValue: newValue });
		}
	};

	Widget.prototype._isMouseOver_onMouseOver = function() {
		this._setIsMouseOver(true);
	};

	Widget.prototype._isMouseOver_onMouseOut = function() {
		this._setIsMouseOver(false);
	};

	Widget.prototype.isPressed = xo.property({
		get: function() {
			if ('_isPressed' in this) {
				return this._isPressed;
			}
			else if (this.dom.querySelector) {
				return !!this.dom.querySelector(':active');
			}
			else {
				return false;	// TODO (IE6-7)
			}
		},
		activate: function() {
			this.on('mouseDown', this._isPressed_onMouseDown);
			this.on('mouseUp', this._isPressed_onMouseUp);
			this._isPressed = this.isPressed();
		},
		inactivate: function() {
			this.off('mouseDown', this._isPressed_onMouseDown);
			this.off('mouseUp', this._isPressed_onMouseUp);
			delete this._isPressed;
		}
	});

	Widget.prototype._setIsPressed = function(newValue) {
		var oldValue = this._isPressed;
		if (newValue !== oldValue) {
			this._isPressed = newValue;
			this.raise('isPressed', { newValue: newValue, oldValue: oldValue });
		}
	};

	Widget.prototype._isPressed_onMouseDown = function() {
		this._setIsPressed(true);
	};

	Widget.prototype._isPressed_onMouseUp = function() {
		this._setIsPressed(false);
	};

	Widget.prototype.margin = xo.property({
		changed: function(change) {		
			xo.observe(this, this.margin, function() {
				this.dom.css('margin', change.newValue);
			}, this, change);	
		}
	});

	Widget.prototype.minHeight = xo.property({
		changed: function(change) {
			xo.observe(this, this.minHeight, function() {
				this.dom.css('min-height', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.minWidth = xo.property({
		changed: function(change) {
			xo.observe(this, this.minWidth, function() {
				this.dom.css('min-width', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.padding = xo.property({
		changed: function(change) {
			xo.observe(this, this.padding, function() {
				this.dom.css('padding', change.newValue);
			}, this, change);
		}
	});

	Widget.prototype.verticalAlignment = xo.property({
		defaultValue: 'top'
	});

	Widget.prototype.width = xo.property({
		changed: function(change) {
			xo.observe(this, this.width, function() {
				this.dom.css('width', change.newValue);
			}, this, change);
		}
	});

	// Events:

	Widget._events = {
		// eventName: eventType
		'click': {
			type: 'click',
			args: MouseEventArgs
		},
		'dblClick': {
			type: 'dblclick',
			args: MouseEventArgs
		},
		'keyDown': {
			type: 'keydown',
			args: KeyEventArgs
		},
		'keyUp': {
			type: 'keyup',
			args: KeyEventArgs
		},
		'mouseDown': {
			type: 'mousedown',
			args: MouseEventArgs
		},
		'mouseEnter': {
			type: 'mouseenter',
			args: MouseEventArgs
		},
		'mouseLeave': {
			type: 'mouseleave',
			args: MouseEventArgs
		},
		'mouseMove': {
			type: 'mousemove',	
			args: MouseEventArgs
		},
		'mouseUp': {
			type: 'mouseup',
			args: MouseEventArgs
		},
		'touchCancel': {
			type: 'touchcancel',
			args: TouchEventArgs
		},
		'touchEnd': {
			type: 'touchend',
			args: MouseEventArgs
		},
		'touchEnter': {
			type: 'touchenter',
			args: MouseEventArgs
		},
		'touchLeave': {
			type: 'touchleave',
			args: MouseEventArgs
		},
		'touchMove': {
			type: 'touchmove',
			args: MouseEventArgs
		},
		'touchStart': {
			type: 'touchstart',
			args: MouseEventArgs
		},
		'wheel': {
			type: 'wheel',
			args: MouseEventArgs
		}
	};

	Widget._defineEvent = function(targetObject, eventName, options) {
		var capitalizedName = xo.capitalize(eventName),
			preEventName = 'pre' + capitalizedName,
			callbackName = '_on' + capitalizedName,
			preCallbackName = '_onPre' + capitalizedName,
			captureCallbackName = '_onCapture' + capitalizedName;

		targetObject[eventName] = xo.event({
			activate: function() {
				this.dom.on(options.type, this[callbackName], false, this);
			},
			inactivate: function() {
				this.dom.off(options.type, this[callbackName], false, this);
			}
		});

		targetObject[preEventName] = xo.event({
			activate: function() {
				this.dom.on(options.type, this[preCallbackName], true, this);
			},
			inactivate: function() {
				this.dom.off(options.type, this[preCallbackName], true, this);
			}
		});

		targetObject[callbackName] = function(e) {
			var args = new options.args(e);
			this[eventName](this, args);
		};

		targetObject[preCallbackName] = function(e) {
			var args = new options.args(e);
			this[preEventName](this, args);
		};

		targetObject[captureCallbackName] = function(e) {
			this[callbackName](e);
			e.stopPropagation();
		};
	};

	(function (events) {
		for (var eventName in events) {
			Widget._defineEvent(Widget.prototype, eventName, events[eventName]);
		}
	})(Widget._events);

	Widget.prototype._setupCallbacks = function() {
		for (var propertyName in this) {
			var propertyValue = this[propertyName];
			if (xo.Event.isEvent(propertyValue)) {
				var callbackName = 'on' + xo.capitalize(propertyName),
					callbackFn = this[callbackName];
				if (xo.isFunction(callbackFn)) {
					xo.Event.addHandler(this, propertyValue, callbackFn, this);
				}
			}
		}
	};

	Widget.prototype.isMouseCaptured = xo.property({
		get: function() {
			return !!this._isMouseCaptured;
		}
	});

	Widget.prototype.captureMouse = function() {
		if (!this._isMouseCaptured) {
			for (var eventName in Widget._events) {
				var eventType = Widget._events[eventName].type,
					captureCallbackName = '_onCapture' + xo.capitalize(eventName);
				this.dom.document().on(eventType, this[captureCallbackName], true, this);
			}

			this._isMouseCaptured = true;
			xo.Event.raiseEvent(this, 'isMouseCaptured', { oldValue: false, newValue: true });
		}
	};

	Widget.prototype.releaseMouseCapture = function() {
		if (this._isMouseCaptured) {
			for (var eventName in Widget._events) {
				var eventType = Widget._events[eventName].type,
					captureCallbackName = '_onCapture' + xo.capitalize(eventName);
				this.dom.document().off(eventType, this[captureCallbackName], true, this);
			}

			this._isMouseCaptured = false;
			xo.Event.raiseEvent(this, 'isMouseCaptured', { oldValue: true, newValue: false });
		}
	};

	return Widget;
});
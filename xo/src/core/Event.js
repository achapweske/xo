define(['./Utils', './Functor', './EventTracker'], function(Utils, Functor, EventTracker) {

	function EventInstance() {
		this._callbacks = [];		
	};

	EventInstance.fromTarget = function(event, target, autoCreate) {
		var id = Utils.id(event);
		if (autoCreate) {
			var events = target._xoevents || (target._xoevents = {});
			return events[id] || (events[id] = new EventInstance());
		}
		else {
			return target._xoevents && target._xoevents[id];
		}
	};

	EventInstance.prototype.add = function(callback, context) {
		this._callbacks.push({ 
			callback: callback, 
			context: context 
		});
	};

	EventInstance.prototype.remove = function(callback, context) {
		var remaining = [];

		if (callback || context) {

			var callbacks = this._callbacks, 
				length = callbacks.length;

			for (var i = 0; i < length; i++) {
				var item = callbacks[i];
				if (callback && callback !== item.callback || 
					context && context != item.context) {
					remaining.push(item);
				}
			}
		}
		this._callbacks = remaining;
	};

	EventInstance.prototype.has = function(callback, context) {
		var callbacks = this._callbacks, 
			length = callbacks.length;

		if (!callback && !context) {
			return length > 0;
		}

		for (var i = 0; i < length; i++) {
			var item = callbacks[i];
			if ((!callback || callback === item.callback) && 
				(!context || context === item.context)) {
				return true;
			}
		}

		return false;
	}

	EventInstance.prototype.count = function(callback, context) {
		var callbacks = this._callbacks, 
			length = callbacks.length;

		if (!callback && !context) {
			return length;
		}

		var count = 0;
		for (var i = 0; i < length; i++) {
			var item = callbacks[i];
			if ((!callback || callback === item.callback) && 
				(!context || context === item.context)) {
				count++;
			}
		}

		return count;
	};

	EventInstance.prototype.raise = function() {
		var callbacks = this._callbacks, 
			length = callbacks.length;

		for (var i = 0; i < length; i++) {
			var item = callbacks[i];
			if (item.callback.apply(item.context, arguments) === false) {
				return;
			}
		}
	};

	function DefaultInstance() {

	};

	DefaultInstance.prototype = new EventInstance();// Object.create(EventInstance.prototype);
	DefaultInstance.prototype.constructor = DefaultInstance;

	DefaultInstance.prototype.add = function(callback, context) {
		throw new Error('Operation not allowed');	
	};

	DefaultInstance.prototype.remove = function(callback, context) {
	};

	DefaultInstance.prototype.has = function(callback, context) {
		return false;
	};

	DefaultInstance.prototype.count = function(callback, context) {
		return 0;
	};

	DefaultInstance.prototype.raise = function() {
	};

	EventInstance.Default = new DefaultInstance();

	function Event(options) {
		if (options) {
			if (options.activate) {
				if (!Utils.isFunction(options.activate)) {
					throw new TypeError('Event: parameter "activate" must be a function');
				}
				this._activate = options.activate;
			}
			if (options.inactivate) {
				if (!Utils.isFunction(options.inactivate)) {
					throw new TypeError('Event: parameter "inactivate" must be a function');
				}
				this._inactivate = options.inactivate;
			}
			if (options.raised) {
				if (!Utils.isFunction(options.raised)) {
					throw new TypeError('Event: parameter "raised" must be a function');
				}
				this._raised = options.raised;
			}
		}
	};

	Event.prototype.constructor = Event;

	Event.define = function(options) {
		function functor() {
			var args = Array.prototype.slice.call(arguments, 0);
			return Functor.apply(functor, 'raise', [this].concat(args));
		};
		return Functor.define(Event, functor, options);
	};

	Event.isEvent = function(obj) {
		if (Utils.isFunction(obj)) {
			return Functor.instanceOf(obj, Event);
		}
		else {
			return obj instanceof Event;
		}
	};

	Event.addHandler = function(obj, event, callback, context) {
		return callApi('add', event, obj, callback, context);
	};

	Event.removeHandler = function(obj, event, callback, context) {
		return callApi('remove', event, obj, callback, context);
	};

	Event.hasHandler = function(obj, event, callback, context) {
		return callApi('has', event, obj, callback, context);
	};

	Event.countHandler = function(obj, event, callback, context) {
		return callApi('count', event, obj, callback, context);
	};

	Event.raiseEvent = function(obj, event) {
		var args = Array.prototype.slice.call(arguments, 2);
		return callApi.apply(window, ['raise', event, obj].concat(args));
	};

	Event.prototype.add = function(target, callback, context) {
		var instance = EventInstance.fromTarget(this, target, true);

		if (Utils.isString(callback)) callback = target[callback];
		instance.add(callback, context || target);

		if (instance.count() === 1) {
			EventTracker.ignore(function () {
				Functor.call(this, 'onActivate', target);
			}, this);
		}
		return this;
	};

	Event.prototype.remove = function(target, callback, context) {
		var instance = EventInstance.fromTarget(this, target, false);
		if (!instance || !instance.has()) {
			return this;
		}

		if (Utils.isString(callback)) callback = target[callback];
		instance.remove(callback, context);

		if (!instance.has()) {
			EventTracker.ignore(function() {
				Functor.call(this, 'onInactivate', target);
			}, this);
		}
		return this;
	};

	Event.prototype.has = function(target, callback, context) {
		var instance = EventInstance.fromTarget(this, target, false);
		if (!instance) return false;
		if (Utils.isString(callback)) callback = target[callback];
		return instance.has(callback, context);
	};

	Event.prototype.count = function(target, callback, context) {
		var instance = EventInstance.fromTarget(this, target, false);
		if (!instance) return 0;
		if (Utils.isString(callback)) callback = target[callback];
		return instance.count(callback, context);
	};

	Event.prototype.raise = function(target) {
		var args = Array.prototype.slice.call(arguments, 1);

		EventTracker.ignore(function() {
			if (this._raised) {
				this._raised.apply(target, args);
			}
			Functor.call(this, 'onRaise', target, args);	
		}, this);

		return this;
	};

	Event.prototype.onActivate = function(target) {
		if (this._activate) {
			this._activate.call(target, this, target);
		}
	};

	Event.prototype.onInactivate = function(target) {
		if (this._inactivate) {
			this._inactivate.call(target, this, target);
		}
	};

	Event.prototype.onRaise = function(target, args) {
		var instance = EventInstance.fromTarget(this, target);
		if (instance) {
			instance.raise.apply(instance, args);
		}
	};

	function callApi(api, event, target) {
		if (typeof target === 'undefined') {
			throw new TypeError('target is undefined');
		}

		if (Utils.isString(event)) {		
			if (!(event in target)) {
				throw new TypeError(target.constructor.name + ' does not contain a property named "' + event + '"');
			}
			event = target[event];
		}

		var args = Array.prototype.slice.call(arguments, 2);
		return Functor.apply(event, api, args);
	};

	return Event;
});
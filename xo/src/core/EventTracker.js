define(['require', './Utils'], function(require, Utils) {
	var Event;

	function EventTracker(target, event) {
		this._target = target;
		this._event = event;	// event or callback function
		this._dependencies = {};
		this._iterations = 0;
	};

	EventTracker._instances = {};
	EventTracker._stack = [];

	EventTracker.fromTarget = function(target, event, autoCreate) {
		var id = Utils.id(target, event);
		var tracker = EventTracker._instances[id];
		if (tracker || !autoCreate) return tracker;
		return EventTracker._instances[id] = new EventTracker(target, event);
	};

	/**
	 * Raise the given event when any events tracked in the given function are raised
	 */
	EventTracker.observe = function(target, event, fn, context) {
		if (Utils.isUndefined(target)) {
			throw new TypeError('undefined target');
		}
		if (Utils.isUndefined(event)) {
			throw new TypeError('undefined event');
		}
		if (!Utils.isFunction(fn)) {
			throw new TypeError('fn must be a valid function');
		}
		var tracker = EventTracker.fromTarget(target, event, true);
		var args = Array.prototype.slice.call(arguments, 2);
		if (!tracker.observe.apply(tracker, args)) {
			var id = Utils.id(target, event);
			delete EventTracker._instances[id];
		}
		return tracker;
	};

	EventTracker.ignore = function(fn, context) {
		EventTracker._stack.push(null);
		try {
			return fn.call(context);
		}
		finally {
			EventTracker._stack.pop();
		}
	};

	EventTracker.track = function(target, event) {
		var tracker = EventTracker._stack[EventTracker._stack.length-1];
		return tracker && tracker.track(target, event);
	};

	EventTracker.prototype.addDependency = function(target, event) {
		var id = Utils.id(target, event),
			deps = this._dependencies;
		return deps[id] || (deps[id] = { target: target, event: event });
	};

	EventTracker.prototype.hasDependency = function(target, event) {
		if (event && target) {
			var id = Utils.id(target, event);
			return (id in this._dependencies);
		}
		else {
			for (var id in this._dependencies) {
				return true;
			}
			return false;
		}
	};

	EventTracker.prototype.getDependency = function(target, event) {
		var id = Utils.id(target, event);
		return this._dependencies[id];
	};

	EventTracker.prototype.observe = function(fn, context) {
		var hasDeps = false;
		this._args = Array.prototype.slice.call(arguments, 2);

		EventTracker._stack.push(this);
		this._iterations++;
		try {
			fn.call(context);
		}
		finally {
			EventTracker._stack.pop();
			
			if (!Event) Event = require('./Event');
			// add before remove to optimize event activation

			// add new dependencies
			for (var id in this._dependencies) {
				var dep = this._dependencies[id];
				if (dep._iteration === this._iterations) {
					if (!dep.added) {
						Event.addHandler(dep.target, dep.event, onEvent, this);
						dep.added = true;
					}
					hasDeps = true;
				}
			}

			// remove old dependencies
			var removed = [];
			for (var id in this._dependencies) {
				var dep = this._dependencies[id];
				if (dep._iteration !== this._iterations) {
					Event.removeHandler(dep.target, dep.event, onEvent, this);
					removed.push(id);
				}
			}

			// delete removed dependencies
			for (var i = 0; i < removed.length; i++) {
				delete this._dependencies[removed[i]];
			}
		}
		return hasDeps;
	};

	EventTracker.prototype.track = function(target, event) {
		if (Utils.isString(event)) event = target[event];
		var dep = this.addDependency(target, event);
		dep._iteration = this._iterations;
	};

	function onEvent() {
		if (Event.isEvent(this._event)) {
			if (this._args && this._args.length > 0) {
				var args = [ this._target, this._event ].concat(this._args);
				return Event.raiseEvent.apply(Event, args);
			}
			return Event.raiseEvent(this._target, this._event);
		}
		else {
			return this._event.apply(this._target, this._args);
		}
	}

	return EventTracker;
});
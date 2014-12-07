define(['./Utils', './Event', './EventTracker', './Functor'], function(Utils, Event, EventTracker, Functor) {

	/*************************************************************************
	 * PropertyInstance
	 ************************************************************************/

	function PropertyInstance() {
		/*
		 * We keep track of a property's value for a given target object by 
		 * adding a _properties member to that target. This is a hash that
		 * maps property IDs to objects with the following members:
		 *
		 * currentValue: the currently-set value with highest priority
		 *   -undefined if no value has been set (or value has been set to undefined)
		 * currentPriority: priority of currentValue
		 *   -undefined if (and only if) no value has been set
		 * priorityValues: values for this property, mapped by priority
		 *   -undefined when no value set or a value has been set for a single priority
		 * oldValue: 
		 *   -last value reported as part of a 'changed' event
		 */
	}

	PropertyInstance.fromTarget = function(property, target, autoCreate) {
		var properties = target._xoproperties;
		if (!properties) {
			if (!autoCreate) {
				return;
			}
			properties = target._xoproperties = {};
		}	
		var id = Utils.id(property);
		var result = properties[id];
		if (result || !autoCreate) return result;
		return (properties[id] = new PropertyInstance(property, target));
	}

	PropertyInstance.prototype.hasValue = function() {
		return typeof this._currentPriority !== 'undefined';
	};

	PropertyInstance.prototype.get = function(priority) {
		if (typeof priority === 'undefined') {
			// get current value regardless of priority
			return this._currentValue;
		}
		if (priority === this._currentPriority) {
			// current value has the given priority
			return this._currentValue;
		}
		else if (this._priorityValues) {
			// another value has the given priority
			return this._priorityValues[priority];
		}
		else {
			// value not set for specified priority
			return undefined;
		}
	};

	PropertyInstance.prototype.set = function(newValue, newPriority) {
		newPriority = newPriority || 0;
		var oldValue = this._currentValue;
		if (!this.hasValue()) {
			// no value currently set
			this._currentValue = newValue;
			this._currentPriority = newPriority;
			return true;
		}
		else if (newPriority === this._currentPriority) {
			// new value has same priority as current value
			this._currentValue = newValue;
		}
		else if (newPriority < this._currentPriority) {
			// new value has lower priority than current value
			if (!this._priorityValues) this._priorityValues = {};
			this._priorityValues[newPriority] = newValue;
		}
		else {
			// new value has higher priority than current value
			if (!this._priorityValues) this._priorityValues = {};
			this._priorityValues[this._currentPriority] = this._currentValue;
			this._currentValue = newValue;
			this._currentPriority = newPriority;
		}
		return this._currentValue !== oldValue;
	};

	PropertyInstance.prototype.clear = function(priority) {
		if (!this.hasValue()) {
			return false;		// already cleared
		}
		if (typeof priority === 'undefined') {
			// clear all values
			delete this._priorityValues;
			delete this._currentValue;
			delete this._currentPriority;
			return true;
		}
		// clear value with given priority
		var values = this._priorityValues;
		if (values) {
			delete values[priority];
		}
		// if clearing current priority, recompute current value
		if (priority !== this._currentPriority) {
			return false;
		}
		delete this._currentValue;
		delete this._currentPriority;
		if (values) {
			var valueCount = 0;
			for (var key in values) {
				if (values.hasOwnProperty(key)) {
					if (typeof this._currentPriority === 'undefined' || key >= this._currentPriority) {
						this._currentPriority = key;
						this._currentValue = values[key];
					}
					valueCount++;
				}
			}
			if (valueCount <= 1) {
				delete this._priorityValues;
			}
		}
		return true;
	}

	/*************************************************************************
	 * Property
	 ************************************************************************/

	function Property(options) {
		Event.call(this, options);

		if (options) {
			if (typeof options.defaultValue !== 'undefined') {
	 			this._defaultValue = options.defaultValue;
	 		}
	 		if (options.attributes) {
	 			if (!Utils.isObject(options.attributes)) {
	 				throw new TypeError('Property: attributes must be an object');
	 			}
	 			this._attributes = options.attributes;
	 		}
	 		if (options.type) {
	 			if (!Utils.isFunction(options.type) && !Utils.isObject(options.type) && !Utils.isArray(options.type)) {
	 				throw new TypeError('Property: type must be a constructor, object, or array');
	 			}
	 			this._type = options.type;
	 		}
			if (options.get) {
				if (!Utils.isFunction(options.get)) {
					throw new TypeError('Property: get must be a function');
				}
				this._get = options.get;
			}
			if (options.set) {
				if (!Utils.isFunction(options.set)) {
					throw new TypeError('Property: set must be a function');
				}
				this._set = options.set;
			}
			if (options.changed) {
				if (!Utils.isFunction(options.changed)) {
					throw new TypeError('Property: changed must be a function');
				}
				this._changed = options.changed;
			}
		}

		if (!this._attributes) {
			this._attributes = {};
		}
	};

	Property.prototype = new Event(); // Object.create(Event.prototype);
	Property.prototype.constructor = Property;
	Property.prototype.superclass = Event;

	Property.define = function(options) {
		function functor() {
			if (arguments.length === 0) {
				return Functor.call(functor, 'get', this);
			}
			else {
				Functor.call(functor, 'set', this, arguments[0]);
			}
		}
		
		var result = Functor.define(Property, functor, options);

		result.attributes = Property.prototype.attributes;
		result.type = Property.prototype.type;
		result.isReadOnly = Property.prototype.isReadOnly;
		result.isWriteOnly = Property.prototype.isWriteOnly;
		
		return result;
	};

	/**
	 * Determine if the given object is a Property
	 * @param  {any}  obj
	 * @return {Boolean} true if obj is a Property
	 */
	Property.isProperty = function(obj) {
		if (Utils.isFunction(obj)) {
			return Functor.instanceOf(obj, Property);
		}
		else {
			return obj instanceof Property;
		}
	};

	Property.getValue = function(obj, property, priority) {
		return callApi(property, 'get', obj, priority)
	};

	Property.setValue = function(obj, property, newValue, priority) {
		return callApi(property, 'set', obj, newValue, priority);
	};

	Property.clearValue = function(obj, property, priority) {
		return callApi(property, 'clear', obj, priority);
	};

	/**
	 * Get the collection of attributes for this property
	 * @return {Object}
	 */
	Property.prototype.attributes = function() {
		return this._attributes;
	};

	/**
	 * Get an array containing the allowed types for this property
	 * @return {Array}
	 */
	Property.prototype.type = function() {
		return this._type;
	}

	Property.prototype.isReadOnly = function() {
		return this._get && !this._set;
	};

	Property.prototype.isWriteOnly = function() {
		return this._set && !this._get;
	};

	Property.prototype.get = function(target, priority) {
		EventTracker.track(target, this);
		if (this._get) {
			var result;
			this._tracker = EventTracker.observe(target, this, function () {
				result = Functor.call(this, 'onGet', target);
			}, this);
			return result;
		}
		else if (!this._set) {
			var instance = PropertyInstance.fromTarget(this, target, false);
			if (instance && instance.hasValue()) {
				return instance.get(priority);
			} 
			else {
				return this._defaultValue;
			}
		}
		else {
			throw new Error('property is write-only');
		}
	};

	function typeError(target, property, msg) {
		var className = Utils.nameOf(target.constructor) || '?',
			propertyName = '?';

		for (var key in target) {
			if (target[key] === property) {
				propertyName = key;
				break;
			}
		}

		throw new TypeError(className + '.' + propertyName + ': ' + msg);
	};

	function checkType(target, property, value, type) {
		if (Utils.isFunction(type)) {
			if (!Utils.instanceOf(value, type)) {
				throw typeError(target, property, 'value must be of type ' + Utils.nameOf(type));
			}
		}
		else if (Utils.isArray(type)) {
			if (!Utils.contains(type, value)) {
				throw typeError(target, property, 'value must be one of [ ' + type.join(', ') + ' ]');
			}
		}
		else {
			if (!Utils.hasValue(type, value)) {
				throw typeError(target, property, 'value must be one of [ ' + Utils.values(type).join(', ') + ' ]');
			}
		}
	}

	Property.prototype.set = function(target, newValue, newPriority) {
		if (this._type && !Utils.isUndefined(newValue)) {
			checkType(target, this, newValue, this._type);
		}
		
		if (this._set) {
			EventTracker.ignore(function () {
				Functor.call(this, 'onSet', target, newValue);
			}, this);
		}
		else if (!this._get) {
			var instance = PropertyInstance.fromTarget(this, target, true);
			if (instance.set(newValue, newPriority)) {
				Event.raiseEvent(target, this);
			}
		}
		else {
			throw new Error('property is read-only');
		}
	};

	Property.prototype.clear = function(target, priority) {
		var instance = PropertyInstance.fromTarget(this, target, false);
		if (instance && instance.clear(priority)) {
			Event.raiseEvent(target, this);
		}
	};

	Property.prototype.onActivate = function(target) {
		if (this._get && !this._tracker) {
			// begin dependency tracking
			this._tracker = EventTracker.observe(target, this, function () {
				if (this.constructor.name === 'AttachedProperty')
					this._get.call(this, target);
				else
					this._get.call(target, this, target);
			}, this);
		}
		Event.prototype.onActivate.call(this, target);
	};

	Property.prototype.onRaise = function(target, args) {
		if (Event.hasHandler(target, this) || this._changed) {
			var change = args[0] || {};

			change.property = this;
			change.target = target;

			if (!('newValue' in change)) {
				change.newValue = Property.prototype.get.call(this, target);
			}

			var instance = PropertyInstance.fromTarget(this, target, true);
			if (!('oldValue' in change)) {
				change.oldValue = ('oldValue' in instance) ? instance.oldValue : this._defaultValue;
			}

			if (args.length > 0 || change.newValue !== change.oldValue) {
				instance.oldValue = change.newValue;
				Functor.call(this, 'onChanged', target, change);
				Event.prototype.onRaise.call(this, target, [ change ]);
			}
		}
	};

	Property.prototype.onGet = function(target) {
		if (this._get) {
			return this._get.call(target, this, target);
		}
	};

	Property.prototype.onSet = function(target, newValue) {
		if (this._set) {
			this._set.call(target, newValue, this, target);
		}
	};

	Property.prototype.onChanged = function(target, change) {
		if (this._changed) {
			this._changed.call(target, change, this);
		}
	};

	function callApi(property, api, target) {
		if (typeof target === 'undefined') {
			throw new TypeError('target is undefined');
		}

		if (Utils.isString(property)) {
			if (!(property in target)) {
				throw new Error(target.constructor.name + ' does not contain a property named "' + property + '"');
			}
			property = target[property];
		}
		
		if (!Property.isProperty(property)) {
			throw new TypeError(property + ' is not an property');
		}

		var args = Array.prototype.slice.call(arguments, 2);
		return Functor.apply(property, api, args);
	};

	return Property;
});
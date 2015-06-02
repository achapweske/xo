define(['./Utils', './Event', './Property', './ComputedProperty', './RelativeProperty'], function(Utils, Event, Property, ComputedProperty, RelativeProperty) {

	function Binding(options) {

		if (Utils.isFunction(options)) {
			options = { compute: options };
		}
		else if (Utils.isString(options)) {
			options = { path: options };
		}
		else if (!options) {
			options = {};
		}

		this._sourceObject = options.source;

		if (options.compute) {
			this._sourceProperty = new ComputedProperty(options.compute);
			this._direction = Binding.Directions.UpdateTarget;
		}
		else if (options.path) {
			this._sourceProperty = new RelativeProperty(options.path);
		}
		else if (options.property) {
			this._sourceProperty = options.property;
		}
		else {
			throw new Error('Unable to create binding: compute, path or property required');
		}

		if (options.direction) {
			var direction = (''+options.direction).toLowerCase();
			if (direction !== Binding.Directions.Both &&
				direction !== Binding.Directions.UpdateTarget &&
				direction !== Binding.Directions.UpdateSource) {
				throw new Error('Binding: direction = "' + options.direction + '" is not valid (must be "UpdateTarget", "UpdateSource", or "Both")');
			}
			this._direction = direction;
		}
		else if (!this._direction) {
			this._direction = Binding.Directions.Both;
		}
		if (options.convert) {
			if (!Utils.isFunction(options.convert)) {
				throw new TypeError('Binding: parameter "convert" is not valid (must be a function)');
			}
			this._convert = options.convert;
		}
		if (options.convertBack) {
			if (!Utils.isFunction(options.convertBack)) {
				throw new TypeError('Binding: parameter "convertBack" is not valid (must be a function)');
			}
			this._convertBack = options.convertBack;
		}
		if (options.trigger) {
			if (!Event.isEvent(options.trigger)) {
				throw new TypeError('Binding: parameter "trigger" is not valid (must be an event)');
			}
			this._trigger = options.trigger;
		}
		if (options.delay) {
			if (isNaN(options.delay)) {
				throw new TypeError('Binding: delay = ' + options.delay + ' is not valid (must be a number)');
			}
			this._delay = options.delay;
		}
		if (options.defaultValue) {
			this._defaultValue = options.defaultValue;
		}
	};

	Binding.Directions = {
		Both: 'both',
		UpdateTarget: 'updatetarget',
		UpdateSource: 'updatesource'
	};

	Binding.DoNothing = {};

	Binding.setBinding = function(targetObject, targetProperty, newBinding) {
		if (!targetProperty) {
			throw new TypeError('setBinding: invalid property "' + targetProperty + '"');
		}
		if (newBinding !== null && !(newBinding instanceof Binding)) {
			throw new TypeError('setBinding: invalid binding "' + newBinding + '"');
		}
		var id = Utils.id(targetProperty),
			bindings = targetObject._xobindings,
			oldBinding = bindings && bindings[id];

		if (oldBinding) {
			oldBinding.setTarget(null);
			delete bindings[id];
		}
		if (newBinding) {
			if (!bindings) bindings = targetObject._xobindings = {};
			bindings[id] = newBinding;
			newBinding._setTarget(targetObject, targetProperty);
		}
		return oldBinding;
	};

	Binding.getBinding = function(targetObject, targetProperty) {
		var id = Utils.id(targetProperty),
			bindings = targetObject._xobindings;
		return bindings && bindings[id];
	};

	Binding._deferred = [];

	Binding.deferBindings = function(callback, context) {
		var result;

		var bindings = [];
		Binding._deferred.push(bindings);
		try {
			result = callback.call(context);
		}
		finally {
			Binding._deferred.pop();
		}

		for (var i = 0, length = bindings.length; i < length; i++) {
			bindings[i].initialize();
		}

		return result;
	};

	Binding._addDeferred = function(binding) {
		var length = Binding._deferred.length;
		if (length > 0) {
			Binding._deferred[length-1].push(binding);
			return true;
		}
		else {
			return false;
		}
	};

	Binding._removeDeferred = function(binding) {
		var length = Binding._deferred.length;
		if (length === 0) {
			return false;
		}

		var deferred = Binding._deferred[length - 1];
		var i = deferred.indexOf(binding);
		if (i === -1) {
			return false;
		}
		deferred.splice(i, 1);
		return true;
	}

	Binding.prototype.isInitialized = function() {
		return !!this._isInitialized;
	};

	Binding.prototype.initialize = function() {
		if (!this._isInitialized) {
			var isUpdatingSource = this._direction === Binding.Directions.Both || 
								   this._direction === Binding.Directions.UpdateSource,
				isUpdatingTarget = this._direction === Binding.Directions.Both || 
								   this._direction === Binding.Directions.UpdateTarget;


			// If no source object is specified, use the target object
			this._originalSource = this._sourceObject;
			if (!this._sourceObject) {
				this._sourceObject = this._targetObject;
			}

			if (isUpdatingSource && this._trigger) {
				var targetTrigger = this._trigger;
				Event.addHandler(this._targetObject, targetTrigger, this._onTargetTrigger, this);
			}
			if (isUpdatingSource && !this._trigger) {
				var targetTrigger = this._targetProperty;
				Event.addHandler(this._targetObject, targetTrigger, this._onTargetChanged, this);
			}
			if (isUpdatingTarget) {
				var sourceTrigger = this._sourceProperty;
				Event.addHandler(this._sourceObject, sourceTrigger, this._onSourceChanged, this);
			}

			if (isUpdatingTarget) {
				this.updateTarget();
			}
			else {
				this.updateSource();
			}

			this._isInitialized = true;
		}
	};

	Binding.prototype.updateSource = function() {
		var newValue = Property.getValue(this._targetObject, this._targetProperty);
		this._updateSourceWithValue(newValue);
	};

	Binding.prototype.updateTarget = function() {
		var newValue = Property.getValue(this._sourceObject, this._sourceProperty);
		this._updateTargetWithValue(newValue);
	};

	Binding.prototype._updateSourceWithValue = function(newValue) {
		if (this._convert) {
			newValue = this._convert(newValue);
			if (newValue === Binding.DoNothing) return;
		}
		if (typeof newValue === 'undefined') {
			newValue = this._defaultValue;
		}
		this._isUpdatingSource = true;
		try {
			Property.setValue(this._sourceObject, this._sourceProperty, newValue);
		}
		finally {
			this._isUpdatingSource = false;
		}
	};

	Binding.prototype._updateTargetWithValue = function(newValue) {
		if (this._convertBack) {
			newValue = this._convertBack(newValue);
			if (newValue === Binding.DoNothing) return;
		}
		this._isUpdatingTarget = true;
		try {
			Property.setValue(this._targetObject, this._targetProperty, newValue);
		}
		finally {
			this._isUpdatingTarget = false;
		}
	};

	Binding.prototype._onSourceChanged = function(change) {
		if (!this._isUpdatingSource) {
			this._updateTargetWithValue(change.newValue);
		}
	};

	Binding.prototype._onTargetChanged = function(change) {
		if (!this._isUpdatingTarget) {
			if (this._delay) {
				this._pendingValue = changed.newValue;
				if (!('_targetChangedTimerId' in this))
					this._targetChangedTimerId = setTimeout(this._onTargetChangedDelayed.bind(this), this._delay);
				return;		
			}
			this._updateSourceWithValue(change.newValue);
		}
	};

	Binding.prototype._onTargetChangedDelayed = function() {
		var newValue = this._pendingValue;
		delete this._targetChangedTimerId;
		delete this._pendingValue;
		this._updateSourceWithValue(newValue);
	};

	Binding.prototype._onTargetTrigger = function() {
		this.updateSource();
	};

	Binding.prototype._setTarget = function(targetObject, targetProperty) {
		if (targetProperty) {

			if (this._targetProperty) {
				throw new Error('Binding target already set');
			}
			this._targetProperty = targetProperty;
			this._targetObject = targetObject;

			if (!Binding._addDeferred(this)) {
				this.initialize();
			}
		}
		else if (this._targetProperty) {

			if (this._trigger) {
				var targetTrigger = this._trigger;
				Event.removeHandler(this._targetObject, targetTrigger, this._onTargetTrigger, this);
			}
			else {
				var targetTrigger = this._targetProperty;
				Event.removeHandler(this._targetObject, targetTrigger, this._onTargetChanged, this);
			}
			var sourceTrigger = this._sourceProperty;
			Event.removeHandler(this._targetObject, sourceTrigger, this._onSourceChanged, this);

			this._targetObject = null;
			this._targetProperty = null;

			this._sourceObject = this._originalSource;
			delete this._originalSource;

			Binding._removeDeferred(this);
			this._isInitialized = false;
		}
	};

	return Binding;
});
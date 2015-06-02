define(['xo', './PropertyPriorities'], function (xo, PropertyPriorities) {
	function ConditionInstance(condition) {
		this._condition = condition;
		this.value();
	};

	ConditionInstance.prototype.target = xo.property();

	ConditionInstance.prototype.value = xo.property({
		get: function() {
			var target = this.target();
			if (target) {
				var test = this._condition.test();
				return xo.ComputedProperty.eval(test, target, target);
			}
		},
		changed: function(change) {
			if (change.newValue) {
				this.onTrue();
			}
			else {
				this.onFalse();
			}
		}
	});

	ConditionInstance.prototype.onTrue = function() {
		var properties = this._condition.properties(),
			target = this.target();
		if (properties) {
			properties.forEach(function(property) {
				property.applyTo(target, PropertyPriorities.Condition);
			});
		}
	};

	ConditionInstance.prototype.onFalse = function() {
		var properties = this._condition.properties(),
			target = this.target();
		if (properties) {
			properties.forEach(function(property) {
				property.clear(target, PropertyPriorities.Condition);
			});
		}
	};

	function Condition() {
		this._instances = {};
	};

	Condition.prototype.contentCollection = 'properties';

	Condition.prototype.test = xo.property({
		attributes: { bind: false }
	});

	Condition.prototype.properties = xo.property({
		type: Array
	});

	Condition.prototype.applyTo = function(target) {
		var id = xo.Utils.id(this, target),
			instance = new ConditionInstance(this);
		this._instances[id] = instance;
		instance.target(target);
	};

	Condition.prototype.clear = function(target) {
		var id = xo.Utils.id(this, target),
			instance = this._instances[id];
		instance.target(null);
		delete this._instances[id];
	};

	return Condition;
});
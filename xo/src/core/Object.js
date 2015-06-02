define(['./Utils', './Class', './ObjectTree', './Property', './Event', './Binding', './Template'], function (Utils, Class, ObjectTree, Property, Event, Binding, Template) {

	function makeEventWrapper(eventName) {
		return function() {
			var context = ObjectTree.getNameScope(this) || this;
			context[eventName].call(context, arguments);
		};
	};

	return Class.extend.call(Object, {
		construct: function() {
			
		},

		initialize: function(options) {
			for (var i = 0; i < arguments.length; ++i) {
				var values = arguments[i];
				if (!values) continue;
				var context = values.$context || this;
				Utils.keys(values).forEach(function (key) {
					if (key === '$context') return;
					var property = this[key],
						value = values[key];
					if (Property.isProperty(property)) {
						this.initializeProperty(property, value);
					}
					else if (Event.isEvent(property)) {
						this.initializeEvent(property, value, context);
					}
					else {
						Utils.warn('Property "' + key + '" not found on object "' + this + '"');
					}
				}, this);
			}
		},

		initializeProperty: function(property, value) {
			if ((value.path || Utils.isFunction(value)) && (property.attributes().bind !== false)) {
				Binding.setBinding(this, property, new Binding(value));
			}
			else {
				Property.assignValue(this, property, value);
			}
		},

		initializeEvent: function(event, value, context) {
			if (Utils.isString(value)) {
				value = makeEventWrapper(value);
			}
			Event.addHandler(this, event, value, context);
		},

		id: Property.define({
			changed: function(change) {
				var nameScope = ObjectTree.getNameScope(this);
				if (nameScope) {
					if (nameScope[change.oldValue] === this) {
						delete nameScope[change.oldValue];
					}
					if (change.newValue) {
						nameScope[change.newValue] = this;
					}
				}
			}
		}),

		setValue: function(property, newValue, priority) {
			return Property.setValue(this, property, newValue, priority);
		},

		getValue: function(property, priority) {
			return Property.getValue(this, property, priority);
		},

		clearValue: function(property, priority) {
			return Property.clearValue(this, property, priority);
		},

		setDefaultValue: function(property, newValue) {
			return this.setValue(property, newValue, Number.NEGATIVE_INFINITY);
		},

		getDefaultValue: function(property) {
			return this.getValue(property, Number.NEGATIVE_INFINITY);
		},

		on: function(event, callback, context) {
			return Event.addHandler(this, event, callback, context || this);
		},

		off: function(event, callback, context) {
			return Event.removeHandler(this, event, callback, context || this);
		},

		raise: function(event) {
			var args = Array.prototype.slice.call(arguments, 0);
			return Event.raiseEvent.apply(Event, [ this ].concat(args));
		},

		toString: function() {
			return Class.getName.call(this.constructor);
		}
	});
});
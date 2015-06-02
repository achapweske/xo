define(['./Utils', './Object', './ObjectTree', './Property', './AttachedProperty', './Event', './EventTracker', './ObservableList'], function (Utils, Object, ObjectTree, Property, AttachedProperty, Event, EventTracker, ObservableList) {
	var Dictionary = Object.extend({
		construct: function Dictionary(owner) {
			this._owner = owner;
			this._definitions = {};
			this._children = new ObservableList();
		},

		contentCollection: 'content',

		content: Property.define({
			set: function(newValue) {
				this.assign(newValue);
			}
		}),

		changed: Event.define(),

		children: Property.define({
			get: function() {
				return this._children;
			}
		}),

		set: function(name, newValue) {
			var oldValue = this._definitions[name];
			if (oldValue !== newValue) {
				this._definitions[name] = newValue;
				this.raise('changed');
			}
		},

		get: function(name) {
			EventTracker.track(this, 'changed');
			return this._definitions[name];
		},

		remove: function(name) {
			if (name in this._definitions) {
				delete this._definitions[name];
				this.raise('changed');
			}
		},

		find: function(name) {
			var result = this.get(name);
			if (typeof result !== 'undefined') {
				return result;
			}
			var children = this.children();
			for (var i = children.count()-1; i >= 0; i--) {
				result = children.get(i).find(name);
				if (typeof result !== 'undefined') {
					return result;
				}
			}

			var parent = this._getParent();
			return parent && parent.find(name);
		},

		assign: function(other) {
			var collection = {},
				children = [];

			if (!Array.isArray(other)) {
				other = [ other ];
			}
			for (var i = 0; i < other.length; i++) {
				var value = other[i];
				if (value instanceof Dictionary) {
					children.push(value);
				}
				else {
					var name = Dictionary.ref.get(value);
					collection[name] = value;
				}
			}

			this._definitions = collection;
			this._children.reset(children);

			this.raise('changed');

			return this;
		},

		_getParent: function() {
			if (!this._owner) return;
			var parent = ObjectTree.getParent(this._owner);
			while (parent) {
				var dictionary = Dictionary._definitions.get(parent);
				if (dictionary) {
					return dictionary;
				}
				parent = ObjectTree.getParent(parent);
			}
			var globals = Dictionary.globals.get(Dictionary);
			if (globals !== this) {
				return globals;
			}
		}
	});

	Dictionary.ref = new AttachedProperty();

	Dictionary._definitions = new AttachedProperty({
		get: function(target) {
			return target._definitions;
		},
		set: function(target, newValue) {
			var oldValue = target._definitions;
			target._definitions = newValue;
			Dictionary._definitions.raise(target, { oldValue: oldValue, newValue: newValue });
		}
	});

	Dictionary.definitions = new AttachedProperty({
		get: function(target) {
			var definitions = Dictionary._definitions.get(target);
			if (!definitions) {
				definitions = new Dictionary(target);
				Dictionary._definitions.set(target, definitions);
			}
			return definitions;
		}
	});

	Dictionary._globals = new Dictionary();

	Dictionary.globals = new AttachedProperty({
		get: function(target) {
			return Dictionary._globals;
		}
	});

	return Dictionary;
});
define(['./Utils', './Object', './ObjectTree', './Property', './AttachedProperty', './Event', './EventTracker', './ObservableList'], function (Utils, Object, ObjectTree, Property, AttachedProperty, Event, EventTracker, ObservableList) {
	var Dictionary = Object.extend({
		construct: function Dictionary() {
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
			return undefined;
		},

		assign: function(other) {
			var definitions, children;

			if (Dictionary.ref.get(other) || other instanceof Dictionary) {
				other = [ other ];
			}

			if (Utils.isArray(other)) {
				definitions = {};
				children = [];
				other.forEach(function (item) {
					if (item instanceof Dictionary) {
						children.push(item);
					}
					else {
						var name = Dictionary.ref.get(item);
						definitions[name] = item;
					}
				});
			}
			else {
				definitions = other;
				children = [];
			}

			this._definitions = definitions;
			this._children.reset(children);

			this.raise('changed');

			return this;
		}
	});

	Dictionary.ref = new AttachedProperty();

	Dictionary.findDefinition = function(target, name) {
		var definitions, result;

		while (target) {
			definitions = Dictionary._definitions.get(target);
			if (definitions) {
				result = definitions.find(name);
				if (!Utils.isUndefined(result)) {
					return result;
				}
			}
			target = ObjectTree.getParent(target);
		}
		
		definitions = Dictionary.globals.get(Dictionary);
		if (definitions) {
			result = definitions.find(name);
			if (!Utils.isUndefined(result)) {
				return result;
			}
		}

		return undefined;
	};

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
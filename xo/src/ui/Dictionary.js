define(['xo'], function (xo) {
	function Dictionary(owner) {
		this._owner = owner;
		this._collection = {};
		this._mergedCollections = new xo.ObservableList();
	};

	Dictionary.ref = new xo.AttachedProperty();

	Dictionary._definitions = new xo.AttachedProperty({
		get: function(target) {
			return target._definitions;
		},
		set: function(target, newValue) {
			var oldValue = target._definitions;
			target._definitions = newValue;
			Dictionary._definitions.raise(target, { oldValue: oldValue, newValue: newValue });
		}
	});

	Dictionary.definitions = new xo.AttachedProperty({
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

	Dictionary.globals = new xo.AttachedProperty({
		get: function(target) {
			return Dictionary._globals;
		},
		set: function(target, newValue) {
			Dictionary._globals.assign(newValue);
		}
	});

	Dictionary.prototype.contentCollection = 'content';

	Dictionary.prototype.content = xo.property({
		set: function(newValue) {
			this.assign(newValue);
		}
	});

	Dictionary.prototype.changed = xo.event();

	Dictionary.prototype.mergedCollections = xo.property({
		get: function() {
			return this._mergedCollections;
		}
	})

	Dictionary.prototype.set = function(name, newValue) {
		this._collection[name] = newValue;
		xo.Event.raiseEvent(this, 'changed');
	};

	Dictionary.prototype.get = function(name) {
		xo.EventTracker.track(this, 'changed');
		return this._collection[name];
	};

	Dictionary.prototype.remove = function(name) {
		delete this._collection[name];
		xo.Event.raiseEvent(this, 'changed');
	};

	Dictionary.prototype.find = function(name) {
		var result = this.get(name);
		if (typeof result !== 'undefined') {
			return result;
		}
		var merged = this.mergedCollections();
		for (var i = merged.count()-1; i >= 0; i--) {
			result = merged.get(i).find(name);
			if (typeof result !== 'undefined') {
				return result;
			}
		}

		var parent = this._getParent();
		return parent && parent.find(name);
	};

	Dictionary.prototype.forEach = function(callback, context) {
		xo.EventTracker.track(this, 'changed');
		var collection = this._collection;
		for (var name in collection) {
			callback.call(context, name, collection[name]);
		}
	};

	Dictionary.prototype.assign = function(other) {
		var collection = {},
			mergedCollections = [];

		if (!Array.isArray(other)) {
			other = [ other ];
		}
		for (var i = 0; i < other.length; i++) {
			var value = other[i];
			if (value instanceof Dictionary) {
				mergedCollections.push(value);
			}
			else {
				var name = Dictionary.ref.get(value);
				collection[name] = value;
			}
		}

		this._collection = collection;
		this._mergedCollections.reset(mergedCollections);

		xo.Event.raiseEvent(this, 'changed');

		return this;
	};

	Dictionary.prototype._getParent = function() {
		if (!this._owner) return;
		var parent = xo.Template.ObjectTreeHelper.getParent(this._owner);
		while (parent) {
			var dictionary = Dictionary._definitions.get(parent);
			if (dictionary) {
				return dictionary;
			}
			parent = xo.Template.ObjectTreeHelper.getParent(parent);
		}
		var globals = Dictionary.globals.get(Dictionary);
		if (globals !== this) {
			return globals;
		}
	};

	return Dictionary;
});
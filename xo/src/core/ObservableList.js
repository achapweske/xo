define(['./Utils', './Event', './EventTracker'], function(Utils, Event, EventTracker) {

	function ObservableList(options) {
		if (Array.isArray(options)) {
			this._array = options.slice(0);
			return;
		}

		this._array = [];

		if (options) {
			if (options.changed) {
				this.addChangedHandler(options.changed, options.context);
			}
		}
	};

	ObservableList.prototype.changed = Event.define({
		activate: function() {
			this._hasChangedHandler = true;
		},
		inactivate: function() {
			this._hasChangedHandler = false;
		}
	});

	ObservableList.prototype.addChangedHandler = function(callback, context) {
		Event.addHandler(this, 'changed', callback, context);
	};

	ObservableList.prototype.removeChangedHandler = function(callback, context) {
		Event.removeHandler(this, 'changed', callback, context);
	}

	ObservableList.prototype.append = function(element) {
		
		this._array.push(element);

		if (this._hasChangedHandler) {
			this._onChanged({
				action: 'add',
				newItems: [ element ],
				newItemsIndex: this._array.length - 1
			})
		}
	};

	ObservableList.prototype.assign = function(collection) {
		if (collection.toArray) {
			collection = collection.toArray();
		}
		else if (!Array.isArray(collection)) {
			collection = [ collection ];
		}
		this.reset(collection);
		return this;
	}

	ObservableList.prototype.clear = function() {
		if (this._array.length > 0) {
			var oldItems = this._array;

			this._array = [];

			if (this._hasChangedHandler) {
				this._onChanged({
					action: 'remove',
					oldItems: oldItems,
					oldItemsIndex: 0
				});
			}
		}
	};

	ObservableList.prototype.contains = function(element) {
		EventTracker.track(this, 'changed');
		return this._array.indexOf(element) !== -1;
	};

	ObservableList.prototype.count = function() {
		EventTracker.track(this, 'changed');
		return this._array.length;
	};

	ObservableList.prototype.forEach = function(callback, context) {
		EventTracker.track(this, 'changed');

		if (!Utils.isFunction(callback)) {
			throw new TypeError(callback + " is not a function");
		}

		var array = this._array,
			length = array.length;

		for (var i = 0; i < length; i++) {
			callback.call(context, array[i], i, this);
		}
	}

	ObservableList.prototype.get = function(index) {
		EventTracker.track(this, 'changed');

		if (index < 0 || index >= this._array.length) {
			throw new RangeError('index is out of range');
		}

		return this._array[index];
	};

	ObservableList.prototype.indexOf = function(element, startIndex) {
		EventTracker.track(this, 'changed');

		return this._array.indexOf(element, startIndex);
	};

	ObservableList.prototype.insert = function(index, element) {
		if (index < 0 || index > this._array.length) {
			throw new RangeError('index is out of range');
		}
		this._array.splice(index, 0, element);

		if (this._hasChangedHandler) {
			this._onChanged({
				action: 'add',
				newItems: [ element ],
				newItemsIndex: index
			});
		}
	};

	ObservableList.prototype.insertRange = function(index, collection) {
		if (index < 0 || index > this._array.length) {
			throw new RangeError('index is out of range');
		}
		if (!collection) {
			throw new ReferenceError('collection is null or undefined');
		}
		if (collection.toArray) {
			collection = collection.toArray();
		}
		if (!Array.isArray(collection)) {
			throw new TypeError('collection is not an array')
		}

		this._array = this._array
			.slice(0, index)
			.concat(collection)
			.concat(this._array.slice(index));

		if (this._hasChangedHandler) {
			this._onChanged({
				action: 'add',
				newItems: collection,
				newItemsIndex: index
			})
		}
	};

	ObservableList.prototype.remove = function(element) {
		var array = this._array,
			length = array.length;

		for (i = 0; i < length; i++) {
			if (array[i] === element) {
				array.splice(i, 1);

				if (this._hasChangedHandler) {
					this._onChanged({
						action: 'remove',
						oldItems: [ element ],
						oldItemsIndex: i
					});
				}

				return true;
			}
		}
		return false;
	};

	ObservableList.prototype.removeAt = function(index) {
		if (index < 0 || index >= this._array.length) {
			throw new RangeError('index is out of range');
		}
		var removed = this._array.splice(index, 1);

		if (this._hasChangedHandler) {
			this._onChanged({
				action: 'remove',
				oldItems: removed,
				oldItemsIndex: index
			});
		}

		return removed[0];
	};

	ObservableList.prototype.removeRange = function(index, count) {
		if (count < 0) {
			throw new RangeError('count must be non-negative');
		}
		if (index < 0) {
			throw new RangeError('index is out of range');
		}
		if (index + count > this._array.length) {
			throw new RangeError('index + count is out of range');
		}
		var removed = this._array.splice(index, count);

		if (this._hasChangedHandler) {
			this._onChanged({
				action: 'remove',
				oldItems: removed,
				oldItemsIndex: index
			});
		}
	};

	ObservableList.prototype.reset = function(collection) {
		var oldItems = this._array;

		this._array = collection.slice(0);

		if (this._hasChangedHandler) {
			this._onChanged({
				action: 'reset',
				newItems: this._array,
				newItemsIndex: 0,
				oldItems: oldItems,
				oldItemsIndex: 0
			});
		}
	};

	ObservableList.prototype.set = function(index, element) {
		if (index < 0 || index >= this._array.length) {
			throw new RangeError('index is out of range');
		}
		var oldItem = this._array[index];
		this._array[index] = element;

		if (this._hasChangedHandler) {
			this._onChanged({
				action: 'replace',
				oldItems: [ oldItem ],
				oldItemsIndex: index,
				newItems: [ element ],
				newItemsIndex: index
			});
		}

		return element;
	};

	ObservableList.prototype.toArray = function() {
		EventTracker.track(this, 'changed');
		return this._array.slice(0);
	};

	ObservableList.prototype._onChanged = function(change) {
		Event.raiseEvent(this, 'changed', change);
	};

	return ObservableList;
});
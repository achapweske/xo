define(['./Utils', './Object', './Property', './Event', './EventTracker'], function(Utils, Object, Property, Event, EventTracker) {

	var ObservableList = Object.extend({

		construct: function(options) {
			if (Array.isArray(options)) {
				this._array = options.slice(0);
				return;
			}

			this._array = [];
			this.initialize(options);
		},

		changed: Event.define({
			activate: function() {
				this._hasChangedHandler = true;
			},
			inactivate: function() {
				this._hasChangedHandler = false;
			}
		}),

		append: function(element) {
			
			this._array.push(element);

			if (this._hasChangedHandler) {
				this.raise('changed', {
					action: 'add',
					newItems: [ element ],
					newItemsIndex: this._array.length - 1
				})
			}
		},

		assign: function(collection) {
			if (Utils.isFunction(collection.toArray)) {
				collection = collection.toArray();
			}
			else if (!Array.isArray(collection)) {
				collection = [ collection ];
			}
			this.reset(collection);
			return this;
		},

		clear: function() {
			if (this._array.length > 0) {
				var oldItems = this._array;

				this._array = [];

				if (this._hasChangedHandler) {
					this.raise('changed', {
						action: 'remove',
						oldItems: oldItems,
						oldItemsIndex: 0
					});
				}
			}
		},

		contains: function(element) {
			EventTracker.track(this, 'changed');
			return this._array.indexOf(element) !== -1;
		},

		count: function() {
			EventTracker.track(this, 'changed');
			return this._array.length;
		},

		forEach: function(callback, context) {
			EventTracker.track(this, 'changed');

			if (!Utils.isFunction(callback)) {
				throw new TypeError(callback + " is not a function");
			}

			var array = this._array,
				length = array.length;

			for (var i = 0; i < length; i++) {
				callback.call(context, array[i], i, this);
			}
		},

		get: function(index) {
			EventTracker.track(this, 'changed');

			if (index < 0 || index >= this._array.length) {
				throw new RangeError('index is out of range');
			}

			return this._array[index];
		},

		indexOf: function(element, startIndex) {
			EventTracker.track(this, 'changed');

			return this._array.indexOf(element, startIndex);
		},

		insert: function(index, element) {
			if (index < 0 || index > this._array.length) {
				throw new RangeError('index is out of range');
			}
			this._array.splice(index, 0, element);

			if (this._hasChangedHandler) {
				this.raise('changed', {
					action: 'add',
					newItems: [ element ],
					newItemsIndex: index
				});
			}
		},

		insertRange: function(index, collection) {
			if (index < 0 || index > this._array.length) {
				throw new RangeError('index is out of range');
			}
			if (!collection) {
				throw new ReferenceError('collection is null or undefined');
			}
			if (Utils.isFunction(collection.toArray)) {
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
				this.raise('changed', {
					action: 'add',
					newItems: collection,
					newItemsIndex: index
				})
			}
		},

		remove: function(element) {
			var array = this._array,
				length = array.length;

			for (i = 0; i < length; i++) {
				if (array[i] === element) {
					array.splice(i, 1);

					if (this._hasChangedHandler) {
						this.raise('changed', {
							action: 'remove',
							oldItems: [ element ],
							oldItemsIndex: i
						});
					}

					return true;
				}
			}
			return false;
		},

		removeAt: function(index) {
			if (index < 0 || index >= this._array.length) {
				throw new RangeError('index is out of range');
			}
			var removed = this._array.splice(index, 1);

			if (this._hasChangedHandler) {
				this.raise('changed', {
					action: 'remove',
					oldItems: removed,
					oldItemsIndex: index
				});
			}

			return removed[0];
		},

		removeRange: function(index, count) {
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
				this.raise('changed', {
					action: 'remove',
					oldItems: removed,
					oldItemsIndex: index
				});
			}
		},

		reset: function(collection) {
			var oldItems = this._array;

			this._array = collection.slice(0);

			if (this._hasChangedHandler) {
				this.raise('changed', {
					action: 'reset',
					newItems: this._array,
					newItemsIndex: 0,
					oldItems: oldItems,
					oldItemsIndex: 0
				});
			}
		},

		set: function(index, element) {
			if (index < 0 || index >= this._array.length) {
				throw new RangeError('index is out of range');
			}
			var oldItem = this._array[index];
			this._array[index] = element;

			if (this._hasChangedHandler) {
				this.raise('changed', {
					action: 'replace',
					oldItems: [ oldItem ],
					oldItemsIndex: index,
					newItems: [ element ],
					newItemsIndex: index
				});
			}

			return element;
		},

		toArray: function() {
			EventTracker.track(this, 'changed');
			return this._array.slice(0);
		}
	});

	return ObservableList;
});
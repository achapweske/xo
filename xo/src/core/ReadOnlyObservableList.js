define(['./Utils', './ObservableList', './Property'], function(Utils, ObservableList, Property) {

	var ReadOnlyObservableList = ObservableList.extend({
		construct: function($super, options) {
			$super(options);
		},

		collection: Property.define({
			changed: function(change) {
				var oldItems = this._collection,
					newItems = change.newValue;

				if (Utils.isArray(newItems)) {
					newItems = new ObservableList(newItems);
				}
				this._collection = newItems;

				if (oldItems) {
					oldItems.off('changed', this.onCollectionChanged, this);
					oldItems = oldItems.toArray();
				}
				if (newItems) {
					newItems.on('changed', this.onCollectionChanged, this);
					newItems = newItems.toArray();
				}

				this.onCollectionChanged({
					action: 'reset',
					oldItems: oldItems,
					oldItemsIndex: 0,
					newItems: newItems,
					newItemsIndex: 0
				});
			}
		}),

		append: function(element) {
			throw new Error('Collection is read-only');
		},

		assign: function($super, collection) {
			throw new Error('Collection is read-only');
		},

		clear: function() {
			throw new Error('Collection is read-only');
		},

		contains: function(element) {
			return this._collection && this._collection.contains(element);
		},

		count: function() {
			return this._collection ? this._collection.count() : 0;
		},

		forEach: function(callback, context) {
			if (this._collection) this._collection.forEach(callback, context);
		},

		get: function(index) {
			if (!this._collection) {
				throw new RangeError('Index out of range');
			}
			return this._collection.get(index);
		},

		indexOf: function(element, startIndex) {
			return this._collection ? this._collection.indexOf(element, startIndex) : -1;
		},

		insert: function(index, element) {
			throw new Error('Collection is read-only');
		},

		insertRange: function(index, collection) {
			throw new Error('Collection is read-only');
		},

		remove: function(element) {
			throw new Error('Collection is read-only');
		},

		removeAt: function(index) {
			throw new Error('Collection is read-only');
		},

		removeRange: function(index, count) {
			throw new Error('Collection is read-only');
		},

		reset: function(collection) {
			throw new Error('Collection is read-only');
		},

		set: function(index, element) {
			throw new Error('Collection is read-only');
		},

		toArray: function() {
			return this._collection ? this._collection.toArray() : [];
		},

		onCollectionChanged: function(change) {
			this.raise('changed', change);
		}
	});

	return ReadOnlyObservableList;
});
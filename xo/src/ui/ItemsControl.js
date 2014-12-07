define(['xo', './Control', './ContentControl', './Visual'], function (xo, Control, ContentControl, Visual) {
	var ItemsControl = Control.extend({

		construct: function ItemsControl() {
			Control.call(this);
		},

		contentCollection: 'items',

		/**
		 * The collection of items to be rendered in this control.
		 *
		 * For each item, a container will be generated and its content property bound to the item.
		 */
		items: xo.property({
			changed: function(change) {

				// If set to an ObservableList, listen for its 'changed' event
				var oldItems = change.oldValue,
					newItems = change.newValue;

				if (oldItems && xo.Event.isEvent(oldItems.changed)) {
					xo.Event.removeHandler(oldItems, 'changed', this._onItemsChanged, this);
				}
				if (newItems && xo.Event.isEvent(newItems.changed)) {
					xo.Event.addHandler(newItems, 'changed', this._onItemsChanged, this);
				}

				// Update the associated itemsPanel
				if (this._itemsPanel()) {
					if (oldItems.toArray) {
						oldItems = oldItems.toArray();
					}
					if (newItems.toArray) {
						newItems = newItems.toArray();
					}

					this._onItemsChanged({
						action: 'reset',
						oldItems: oldItems,
						oldItemsIndex: 0,
						newItems: newItems,
						newItemsIndex: 0
					});
				}
			}
		}),

		/**
		 * Type of container to be generated for items rendered in this control
		 * @type {Function} The container type (should be a descendant of ContentControl)
		 */
		itemContainerType: xo.property({
			defaultValue: ContentControl
		}),

		/**
		 * Style to be applied to generated containers
		 * @type {Style}
		 */
		itemContainerStyle: xo.property(),

		/**
		 * Data template for rendering items within their containers.
		 *
		 * This will be used as the contentTemplate property of generated containers.
		 * @type {[type]}
		 */
		itemTemplate: xo.property(),

		/**
		 * A function to select the itemTemplate for a given item.
		 *
		 * This is ignored if itemTemplate is set.
		 * @type {[type]}
		 */
		itemTemplateSelector: xo.property(),

		/**
		 * Get the container associated with the given item
		 * @param  {Object} item item whose container is to be retrieved
		 * @return {ContentControl} 
		 */
		containerFromItem: function(item) {
			return ItemsControl.itemContainer.get(item);
		},

		/**
		 * Get the item associated with the given container
		 * @param  {ContentControl} container container whose item is to be retrieved
		 * @return {Object}
		 */
		itemFromContainer: function(container) {
			return ItemsControl.containerItem.get(container);
		},

		/**
		 * The panel to which our item (containers) will be added
		 * @type {Panel}
		 */
		_itemsPanel: xo.property(),

		/**
		 * Called when our 'items' collection changes
		 * @param  {Object} change Describes the change that occurred
		 */
		_onItemsChanged: function(change) {
			if (this._itemsPanel()) {
				var oldItems = change.oldItems;
				if (oldItems) {
					for (var i = 0; i < oldItems.length; i++) {
						this._onItemRemoved(oldItems[i], change.oldItemsIndex + i);
					}
				}
				var newItems = change.newItems;
				if (newItems) {
					for (var i = 0; i < newItems.length; i++) {
						this._onItemAdded(newItems[i], change.newItemsIndex + i);
					}
				}
			}
		},

		/**
		 * Called when an item is added to our 'items' collection
		 * @param  {Object} item  The item that was added
		 * @param  {Number} index The new item's index within our 'items' collection
		 */
		_onItemAdded: function(item, index) {
			var itemsPanel = this._itemsPanel();
			if (itemsPanel) {
				var container = this._acquireContainer(item);
				this.onAddingContainer(container, item);
				itemsPanel.children().insert(container, index);
			}
		},

		/**
		 * Called when an item is removed from our 'items' collection
		 * @param  {Object} item  The item that was removed
		 * @param  {Number} index The old item's index within our 'items' collection
		 * @return {[type]}       [description]
		 */
		_onItemRemoved: function(item, index) {
			var itemsPanel = this._itemsPanel();
			if (itemsPanel) {
				var container = this.containerFromItem(item);
				this.onRemovingContainer(container, item);
				itemsPanel.children().remove(container);
				this._releaseContainer(container, item);
			}
		},

		/**
		 * Get the container associated with the given item
		 * @param  {Object} item The object whose container is to be retrieved
		 * @return {Object}      A container
		 */
		_acquireContainer: function(item) {
			var container = this._isContainer(item) ? item : this._createContainer(item);
			ItemsControl.itemContainer.set(item, container);
			ItemsControl.containerItem.set(container, item);
			return container;
		},

		/**
		 * Dissociate the given container from its item
		 * @param  {Object} container The container to be recycled
		 */
		_releaseContainer: function(container, item) {
			ItemsControl.containerItem.clear(container);
			ItemsControl.itemContainer.clear(item);
		},

		/**
		 * Determine if an item can act as its own container
		 */
		_isContainer: function(item) {
			return item instanceof Visual;
		},

		/**
		 * Create a new container of the type specified by itemContainerType
		 * @return {Object} The new container
		 */
		_createContainer: function(item) {
			// create a new container
			var type = this.itemContainerType(),
				container = new type();

			// initialize the new container

			var containerStyle = this.itemContainerStyle();
			if (containerStyle) {
				container.style(containerStyle);
			}

			var itemTemplate = this.itemTemplate();
			if (!xo.isUndefined(itemTemplate)) {
				container.contentTemplate(itemTemplate);
			}

			var itemTemplateSelector = this.itemTemplateSelector();
			if (!xo.isUndefined(itemTemplateSelector)) {
				container.contentTemplateSelector(itemTemplateSelector);
			}

			// allow subclasses to perform initialization
			this.onCreatedContainer(container);		

			return container;
		},

		/**
		 * Called when a new template instance is applied to this control
		 * @param  {Template} templateInstance The new template instance
		 */
		onApplyTemplate: function(templateInstance) {
			var itemsPanel = templateInstance.itemsPanel;
			if (!itemsPanel) {
				console.warn('Named part "itemsPanel" missing from ' + this + ' template');
				return;
			}

			var items = this.items();
			if (items) {
				items.forEach(function(item) {
					var container = this._acquireContainer(item);
					this.onAddingContainer(container, item);
					itemsPanel.children().append(container);
				}, this);
			}

			this._itemsPanel(itemsPanel);
		},

		/**
		 * Called when a container is created.
		 *
		 * Subclasses should override this to perform custom initialization of containers.
		 * @param  {ContentControl} container the newly-created container
		 */
		onCreatedContainer: function(container) {
			
		},

		onDestroyingContainer: function(container) {

		},

		onAddingContainer: function(container, item) {
			if (container !== item) {
				container.content(item);
			}
		},

		onRemovingContainer: function(container) {
			
		}
	});

	ItemsControl.itemContainer = new xo.AttachedProperty();
	ItemsControl.containerItem = new xo.AttachedProperty();

	return ItemsControl;
});
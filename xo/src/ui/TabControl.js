define(['xo', './ItemsControl', './TabItem', './Visual'], function (xo, ItemsControl, TabItem, Visual) {

	/*
	 * The presentation of a TabControl is determined by the following properties:
	 * 
	 * -template: defines the high-level presentation of the control. This 
	 *  should specify an itemsPanel where all TabItems will be rendered, as well 
	 *  as a ContentPresenter bound to selectedContent and selectedContentTemplate 
	 *  for rendering the selected content.
	 * -itemContainerStyle: defines the high-level presentation of each TabItem
	 *  within the itemsPanel and should include a ContentPresenter bound to the
	 *  TabItem's header and headerTemplate.
	 * -itemTemplate: defines the presentation of each TabItem's header data. This
	 *  is used to set the headerTemplate property of generated TabItems.
	 * -contentTemplate: defines the presentation of each TabItem's content data.
	 *  This is used to set the contentTemplate property of generated TabItems.
	 */
	return ItemsControl.extend({

		construct: function TabControl() {
			ItemsControl.call(this);
			this.itemContainerType(TabItem);
		},

		/**
		 * Data template for rendering a TabItem's content data
		 * @type {Template}
		 */
		contentTemplate: xo.property(),

		/**
		 * A function to select the contentTemplate for a given item.
		 *
		 * This is ignored if contentTemplate is set.
		 * @type {Function}
		 */
		contentTemplateSelector: xo.property(),

		/**
		 * Get/set the currently-selected item
		 */
		selectedItem: xo.property({
			get: function() {
				return this._selectedItem;
			},
			set: function(newValue) {
				if (newValue) {
					var container = this.containerFromItem(newValue);
					container.isSelected(true);
				}
				else if (this._selectedItem) {
					var container = this.containerFromItem(this._selectedItem);
					container.isSelected(false);
				}
			}
		}),

		/**
		 * Get the currently-selected item's TabItem container
		 */
		_selectedContainer: xo.property({
			get: function() {
				var selectedItem = this.selectedItem();
				return selectedItem && this.containerFromItem(selectedItem);
			}
		}),

		/**
		 * Get the 'content' property of the currently selected TabItem
		 * @return {Object}
		 */
		selectedContent: xo.property({
			get: function() {
				var container = this._selectedContainer();
				return container && container.content();
			}
		}),

		/**
		 * Get the 'contentTemplate' property of the currently selected TabItem
		 * @type {Template}
		 */
		selectedContentTemplate: xo.property({
			get: function() {
				var container = this._selectedContainer();
				return container && container.contentTemplate();
			}
		}),

		/**
		 * Get the 'contentTemplateSelector' property of the currently selected TabItem
		 * @type {Function}
		 */
		selectedContentTemplateSelector: xo.property({
			get: function() {
				var container = this._selectedContainer();
				return container && container.contentTemplateSelector();
			}
		}),

		onCreatedContainer: function(container) {
			var itemTemplate = this.itemTemplate();
			if (!xo.isUndefined(itemTemplate)) {
				container.headerTemplate(itemTemplate);
			}

			var itemTemplateSelector = this.itemTemplateSelector();
			if (!xo.isUndefined(itemTemplateSelector)) {
				container.headerTemplateSelector(itemTemplateSelector);
			}

			var contentTemplate = this.contentTemplate();
			if (!xo.isUndefined(contentTemplate)) {
				container.contentTemplate(contentTemplate);
			}

			var contentTemplateSelector = this.contentTemplateSelector();
			if (!xo.isUndefined(contentTemplateSelector)) {
				container.contentTemplateSelector(contentTemplateSelector);
			}
		},

		onAddingContainer: function(container, item) {
			if (container !== item) {
				container.content(item);
				if (!(item instanceof Visual)) {
					container.header(item);
				}
			}

			container.on('click', this._onClickTabItem, this);
			container.on('isSelected', this._onIsSelectedChanged, this);
		},

		onRemovingContainer: function(container, item) {
			container.off('click', this._onClickTabItem, this);
			container.off('isSelected', this._onIsSelectedChanged, this);
		},

		_onClickTabItem: function(sender, e) {
			var tabItem = sender;
			tabItem.isSelected(true);
		},

		/**
		 * Called when a TabItem's 'isSelected' property changes
		 */
		_onIsSelectedChanged: function(change) {
			var changedItem = this.itemFromContainer(change.target),
				oldSelectedItem = this._selectedItem,
				newSelectedItem = this._selectedItem;

			if (change.newValue) {
				newSelectedItem = changedItem;
			}
			else if (changedItem === oldSelectedItem) {
				newSelectedItem = null;
			}

			if (newSelectedItem !== oldSelectedItem) {
				this._selectedItem = newSelectedItem;
				if (oldSelectedItem) this.containerFromItem(oldSelectedItem).isSelected(false);
				this.raise('selectedItem', { newValue: newSelectedItem, oldValue: oldSelectedItem });
			}
		}
	});
});
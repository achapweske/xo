define(['xo', './ItemsControl', './ListBoxItem'], function (xo, ItemsControl, ListBoxItem) {

	var SelectionMode = {
		None: 'none',
		Single: 'single',
		Multiple: 'multiple',
		Extended: 'extended'
	};

	var ListBox = ItemsControl.extend({

		construct: function(options) {
			this.setDefaultValue('defaultStyleKey', 'ListBox');
			this.itemContainerType(ListBoxItem);
			this._selectedItems = new xo.ObservableList();
			this.initialize(options);
		},

		selectionMode: xo.property({
			type: SelectionMode,
			defaultValue: SelectionMode.Extended
		}),

		selectedItems: xo.property({
			get: function() {
				return this._selectedItems.toArray();
			}
		}),

		selectedItem: xo.property({
			get: function() {
				if (this._selectedItems.count() > 0) {
					return this._selectedItems.get(0);
				}
				else {
					return null;
				}
			},
			set: function(newValue) {
				var container = this.containerFromItem(newValue);
				this._selectOnly(container);
			}
		}),

		onCreatedContainer: function(container) {
			container.on('click', this._onClickListBoxItem, this);
			container.on('isSelected', this._onIsSelectedChanged, this);
		},

		onDestroyingContainer: function(container) {
			container.off('click', this._onClickListBoxItem, this);
			container.off('isSelected', this._onIsSelectedChanged, this);
		},

		_onClickListBoxItem: function(sender, e) {
			var listBoxItem = sender,
				selectionMode = this.selectionMode();

			if (selectionMode === SelectionMode.Extended) {
				if (e.ctrlKey()) selectionMode = SelectionMode.Multiple;
				else if (!e.shiftKey()) selectionMode = SelectionMode.Single;
			}

			if (selectionMode === SelectionMode.Single) {
				this._selectOnly(listBoxItem);
			}
			else if (selectionMode === SelectionMode.Multiple) {
				this._toggleItem(listBoxItem);
			}
			else if (selectionMode === SelectionMode.Extended) {
				this._selectTo(listBoxItem);
			}
		},

		_toggleItem: function(listBoxItem) {
			listBoxItem.isSelected(!listBoxItem.isSelected());
		},

		_selectOnly: function(listBoxItem) {
			listBoxItem.isSelected(true);
			var selectedItems = this._selectedItems.toArray();
			selectedItems.forEach(function(item) {
				var container = ItemsControl.itemContainer.get(item);
				if (container !== listBoxItem) {
					container.isSelected(false);
				}
			});
		},

		_selectTo: function(listBoxItem) {
			var selectedItems = this._selectedItems.toArray();
			if (selectedItems.length === 0) {
				listBoxItem.isSelected(true);
				return;
			}
			var allItems = this.items(), 
				firstItem = selectedItems[0],
				firstItemIndex = allItems.indexOf(firstItem),
				lastItem = this.itemFromContainer(listBoxItem),
				lastItemIndex = allItems.indexOf(lastItem),
				increment = (lastItemIndex > firstItemIndex) ? 1 : -1,
				newSelection = [],
				i, item;
			
			for (i = firstItemIndex; i !== lastItemIndex + increment; i += increment) {
				item = xo.isArray(allItems) ? allItems[i] : allItems.get(i);
				newSelection.push(item);
			}

			// unselect old items
			selectedItems.forEach(function (item) {
				if (newSelection.indexOf(item) === -1) {
					this.containerFromItem(item).isSelected(false);
				}
			}, this);

			// select new items
			newSelection.forEach(function (item) {
				this.containerFromItem(item).isSelected(true);
			}, this);
		},

		_onIsSelectedChanged: function(change) {
			var item = this.itemFromContainer(change.target);
			if (change.newValue) {
				this._selectedItems.append(item);
			}
			else {
				this._selectedItems.remove(item);
			}
		}
	});

	ListBox.SelectionMode = SelectionMode;

	return ListBox;
});
define(['xo', './Widget', 'src/core/ObservableList'], function (xo, Widget, ObservableList) {
	return Widget.extend({
		/**
		 * Constructor
		 * @param  {[type]} options
		 * @return {[type]}
		 */
		construct: function Panel(options) {
			Widget.call(this, options);
			
			this._children = new ObservableList({
				changed: this._onChildrenChanged,
				context: this
			});
		},

		contentCollection: 'children',

		children: xo.property({
			get: function() {
				return this._children;
			}
		}),

		_onChildrenChanged: function(change) {
			if (change.oldItems) {
				this.visualChildren().removeRange(change.oldItemsIndex, change.oldItems.length);
			}
			if (change.newItems) {
				this.visualChildren().insertRange(change.newItemsIndex, change.newItems);
			}
		}
	});
});
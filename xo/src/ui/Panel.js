define(['xo', './Widget', 'src/core/ObservableList'], function (xo, Widget, ObservableList) {
	return Widget.extend({
		construct: function Panel($super, options) {
			$super(xo.pick(options, 'element'));
			this._children = new ObservableList();
			this._children.on('changed', this._onChildrenChanged, this);
			options = xo.omit(options, 'element');
			this.initialize(options);
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
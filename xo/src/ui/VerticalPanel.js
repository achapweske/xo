define(['xo', './Panel'], function (xo, Panel) {
	return Panel.extend({
		onVisualChildAdded: function(newChild, index) {
			var container = xo('div');
			container.append(newChild.dom);
			this.dom.insert(container, index);
		},

		onVisualChildRemoved: function(oldChild) {
			var container = oldChild.dom.parent();
			container.remove();
			container.remove(oldChild.dom);
		},

		onRender: function() {
			this.children().forEach(function(child) {
				var container = child.dom.parent();
				container.css('text-align', child.horizontalAlignment());
			});
		}
	});
});
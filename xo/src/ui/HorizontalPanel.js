define(['xo', './Panel'], function (xo, Panel) {
	return Panel.extend({

		construct: function HorizontalPanel() {
			Panel.call(this);

			var table = xo({
				tagName: 'table',
				style: {
					'width': '100%',
					'height': '100%',
					'border-spacing': '0'
				}
			});
			this.dom.append(table);

			var tbody = xo('tbody');
			table.append(tbody);
			
			this._cells = xo('tr');
			tbody.append(this._cells);
		},

		onVisualChildAdded: function(newChild, index) {
			var cell = xo({
				tagName: 'td',
				style: {
					'padding': '0',
					'line-height': '0'
				}
			});
			cell.append(newChild.dom);
			this._cells.insert(cell, index);
		},

		onVisualChildRemoved: function(oldChild) {
			var container = oldChild.dom.parent();
			container.remove();
			container.remove(oldChild.dom);
		},

		onRender: function() {
			this.children().forEach(function(child) {
				var container = child.dom.parent();
				container.css('vertical-align', child.verticalAlignment());
			});
		}
	});
});
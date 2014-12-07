define(['xo', './Panel', './Row', './Column', './AnimationTimer'], function (xo, Panel, Row, Column, AnimationTimer) {
	var Grid = Panel.extend({

		construct: function Grid() {
			Panel.call(this);

			this._createGridTable();

			this._rows = new xo.ObservableList({
				context: this,
				changed: this._onRowsChanged
			});

			this._columns = new xo.ObservableList({
				context: this,
				changed: this._onColumnsChanged
			});

			this.on('width', this._onGridWidthChanged);
			this.on('height', this._onGridHeightChanged);
			this.on('minHeight', this._onGridMinHeightChanged);

			this.setDefaultValue('width', '100%');
			this.setDefaultValue('height', '100%');
		},

		_createGridTable: function() {
			this._table = xo('table');
			this._colgroup = xo('colgroup');
			this._tbody = xo('tbody');

			this._table.css({
				'border-spacing': '0',
				'table-layout': 'auto'
			});
			this._table.append(this._colgroup);
			this._table.append(this._tbody);
		},

		rows: xo.property({
			get: function() {
				return this._rows;
			}
		}),

		rowCount: xo.property({
			get: function() {
				return this._rows.count();
			},
			set: function(newValue) {
				var rows = this._rows.toArray();
				while (rows.length < newValue) {
					rows.push(new Row());
				}
				while (rows.length > newValue) {
					rows.pop();
				}
				this._rows.reset(rows);
			}
		}),

		columns: xo.property({
			get: function() {
				return this._columns;
			}
		}),

		columnCount: xo.property({
			get: function() {
				return this._columns.count();
			},
			set: function(newValue) {
				var columns = this._columns.toArray();
				while (columns.length < newValue) {
					columns.push(new Column());
				}
				while (columns.length > newValue) {
					columns.pop();
				}
				this._columns.reset(columns);
			}
		}),

		_onRowsChanged: function(change) {
			if (change.oldItems) {
				change.oldItems.forEach(this._onRowRemoved, this);
			}
			if (change.newItems) {
				change.newItems.forEach(this._onRowAdded, this);
			}
		},

		_onRowAdded: function(newRow, index) {
			if (newRow.dom) {
				this._tbody.insert(newRow.dom, index);
			}
		},

		_onRowRemoved: function(oldRow) {
			if (oldRow.dom) {
				this._tbody.remove(oldRow.dom);
			}
		},

		_onColumnsChanged: function(change) {
			if (change.oldItems) {
				change.oldItems.forEach(this._onColumnRemoved, this);
			}
			if (change.newItems) {
				change.newItems.forEach(this._onColumnAdded, this);
			}
		},

		_onColumnAdded: function(newColumn, index) {
			if (newColumn.dom) {
				this._colgroup.insert(newColumn.dom, index);
			}
		},

		_onColumnRemoved: function(oldColumn, index) {
			if (oldColumn.dom) {
				this._colgroup.remove(oldColumn.dom);
			}
		},

		onVisualChildAdded: function(newChild) {
			// Do nothing
		},

		onRender: function() {
			var container = this.dom,
				table = this._table,
				rowCount = this.rowCount(),
				columnCount = this.columnCount();

			// Ensure we have at least one row
			if (table.node.rows.length === 0) {
				this._defaultRow = xo(table.node.insertRow(-1));
			}
			else if (rowCount > 0 && this._defaultRow) {
				this._defaultRow.remove();
				delete this._defaultRow;
			}
			rowCount = Math.max(rowCount, 1);

			// Ensure we have the right number of cells in each row
			var columnCount = Math.max(columnCount, 1);
			for (var i = 0; i < table.node.rows.length; i++) {
				var row = table.node.rows[i];
				while (row.cells.length < columnCount) {
					var cell = row.insertCell(-1);
					this._onCellAdded(cell);
				}
				while (row.cells.length > columnCount) {
					row.deleteCell(-1);
				}
			}

			// Place each child into the correct cell
			this.children().forEach(function (child) {
				var rowIndex = +Grid.row.get(child) || 0,
					columnIndex = +Grid.column.get(child) || 0;

				rowIndex = Math.max(Math.min(rowIndex, table.node.rows.length-1), 0);
				var row = table.node.rows[rowIndex];

				columnIndex = Math.max(Math.min(columnIndex, row.cells.length-1), 0);
				var cell = xo(row.cells[columnIndex]);

				cell.append(child.dom);

				if (child.dom.node === cell.node.firstChild) {
					cell.css({
						'text-align': child.horizontalAlignment(),
						'vertical-align': child.verticalAlignment()
					});
				}
				else {
					//child.dom.style.position = 'absolute';
					//child.dom.style.left = '50%';
					//child.dom.style.top = '50%';
				}
			});

			this.dom.append(table);

			// Support relative sizing of cell content
			if (!tableCellSupportsRelativeHeight) {			
				if (this._onSizeChildren()) {
					if (!this._onSizeChildrenTimer) {
						this._onSizeChildrenTimer = new AnimationTimer();
						this._onSizeChildrenTimer.on('elapsed', this._onSizeChildren, this);
					}
					this._onSizeChildrenTimer.start();
				}
				else if (this._onSizeChildrenTimer) {
					this._onSizeChildrenTimer.stop();
				}
			}
		},

		_onSizeChildren: function() {
			var result = 0;
			this.children().forEach(function (child) {
				var cell = child.dom.parent(),
					height = child.height();
				if (!xo.isString(height) || height.charAt(height.length-1) !== '%') return;
				child.dom.css('height', cell.height() * parseFloat(height) / 100);
				result++;
			}, this);

			return result;
		},

		_onCellAdded: function(newCell) {
			newCell.style.position = 'relative';
			newCell.style.padding = 0;
			newCell.style.lineHeight = 0;
		},

		_onGridWidthChanged: function(change) {
			var width = change.newValue || 'auto';
			if (width === 'auto') {
				this._table.css('width', 'auto');
			}
			else {
				this._table.css('width', '100%');
			}
		},

		_onGridHeightChanged: function(change) {
			var height = change.newValue || 'auto';
			if (height === 'auto') {
				this._table.css('height', 'auto');
			}
			else {
				this._table.css('height', '100%');
			}
		},

		_onGridMinHeightChanged: function(change) {
			// for tables, CSS height behaves like min-height
			this._table.css('height', this.dom.css('min-height'));
		}
	});

	Grid.row = new xo.AttachedProperty({
		defaultValue: 0
	});

	Grid.column = new xo.AttachedProperty({
		defaultValue: 0
	});

	var tableCellSupportsRelativeHeight = (function() {
		var testTable = xo({ tagName: 'table', style: { height: '100px', 'border-spacing': 0 }}),
			testBody = xo('tbody'),
			testRow = xo('tr'),
			testCell = xo({ tagName: 'td', style: { padding: 0 }}),
			testDiv = xo({ tagName: 'div', style: { height: '100%' }}),
			actualHeight;
		testTable.append(testBody);
		testBody.append(testRow);
		testRow.append(testCell);
		testCell.append(testDiv);
		xo(document.body).append(testTable);
		actualHeight = testDiv.height();
		testTable.remove();
		return actualHeight === 100;
	})();

	return Grid;
});
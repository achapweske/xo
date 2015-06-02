define(['xo', './Grid', './Thumb'], function (xo, Grid, Thumb) {
	function GridSplitter() {
		Thumb.call(this);
		this.setDefaultValue('defaultStyleKey', 'GridSplitter');
	};

	GridSplitter.prototype = Object.create(Thumb.prototype);
	GridSplitter.prototype.constructor = GridSplitter;

	GridSplitter.prototype.resizeBehavior = xo.property({
		defaultValue: 'previousAndNext'
	});

	GridSplitter.prototype.resizeDirection = xo.property({
		defaultValue: 'columns'
	});

	GridSplitter.prototype.onDragStarted = function() {

	};

	GridSplitter.prototype.onDragDelta = function(e) {
		var currentColumnIndex = +Grid.column.get(this);
		var leftColumnIndex = currentColumnIndex - 1;
		var rightColumnIndex = currentColumnIndex + 1;

		var leftColumn = this.visualParent().columns().get(leftColumnIndex);
		var rightColumn = this.visualParent().columns().get(rightColumnIndex);

		var leftColumnWidth = leftColumn.width();
		if (leftColumnWidth == +leftColumnWidth) {
			leftColumn.width(leftColumnWidth + e.deltaX);
		}
		var rightColumnWidth = rightColumn.width();
		if (rightColumnWidth == +rightColumnWidth) {
			rightColumn.width(rightColumnWidth - e.deltaX);
		}
	};

	GridSplitter.prototype.onDragCompleted = function() {

	};

	return GridSplitter;
});
define(['require', 'xo', './EventArgs'], function (require, xo, EventArgs) {
	var Visual = null;

	return EventArgs.extend({
		construct: function MouseEventArgs($super, e) {
			$super(e);
		},

		leftButton: function() {
			return this._originalEvent.buttons & 1;
		},

		middleButton: function() {
			return this._originalEvent.buttons & 4;
		},

		rightButton: function() {
			return this._originalEvent.buttons & 2;
		},

		ctrlKey: function() {
			return this._originalEvent.ctrlKey;
		},

		shiftKey: function() {
			return this._originalEvent.shiftKey;
		},

		altKey: function() {
			return this._originalEvent.altKey;
		},

		metaKey: function() {
			return this._originalEvent.metaKey;
		},

		getPosition: function(relativeTo) {
			if (!Visual) Visual = require('./Visual');
			var viewRoot = Visual.fromNode(window.document.body);
			var transform = viewRoot.transformToDescendant(relativeTo);
			return transform.transform(this._originalEvent.pageX, this._originalEvent.pageY);
		}
	});
});
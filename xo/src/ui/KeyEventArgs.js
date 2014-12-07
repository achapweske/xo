define(['xo', './EventArgs'], function (xo, EventArgs) {
	return EventArgs.extend({
		construct: function KeyEventArgs(e) {
			EventArgs.call(this, e);
		}
	});
});
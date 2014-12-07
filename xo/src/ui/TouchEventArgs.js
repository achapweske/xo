define(['xo', './EventArgs'], function (xo, EventArgs) {
	return EventArgs.extend({
		construct: function TouchEventArgs(e) {
			EventArgs.call(this, e);
		}
	});
});
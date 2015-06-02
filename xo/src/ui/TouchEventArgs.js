define(['xo', './EventArgs'], function (xo, EventArgs) {
	return EventArgs.extend({
		construct: function TouchEventArgs($super, e) {
			$super(e);
		}
	});
});
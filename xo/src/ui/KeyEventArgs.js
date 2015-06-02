define(['xo', './EventArgs'], function (xo, EventArgs) {
	return EventArgs.extend({
		construct: function KeyEventArgs($super, e) {
			$super(e);
		}
	});
});
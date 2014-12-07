define(['./Utils', './Event'], function (Utils, Event) {
	return Utils.extend(Object, {
		construct: function EventTarget() {

		},

		on: function(event, callback, context) {
			return Event.addHandler(this, event, callback, context || this);
		},

		off: function(event, callback, context) {
			return Event.removeHandler(this, event, callback, context || this);
		},

		raise: function(event) {
			var args = Array.prototype.slice.call(arguments, 0);
			return Event.raiseEvent.apply(Event, [ this ].concat(args));
		}
	});
});
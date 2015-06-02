define(['xo'], function (xo) {

	var StateGroup = xo.Object.extend({
		construct: function(options) {
			this._updateCurrentState();
			this.initialize(options);
		},

		contentCollection: 'states',

		target: xo.property(),

		states: xo.property({
			type: Array
		}),

		currentState: xo.property({
			get: function() {
				return this._currentState;
			},
			changed: function(change) {
				if (change.oldValue) {
					change.oldValue.clear(this.target());
				}
				if (change.newValue) {
					change.newValue.applyTo(this.target());
				}
			}
		}),

		_setCurrentState: function(newState) {
			var oldState = this._currentState;
			if (newState !== oldState) {
				this._currentState = newState;
				xo.Event.raiseEvent(this, 'currentState', { oldValue: oldState, newValue: newState });
			}
		},

		_updateCurrentState: function() {
			xo.EventTracker.observe(this, this._updateCurrentState, function() {
				var newState = this._computeCurrentState();
				this._setCurrentState(newState);				
			}, this);
		},

		_computeCurrentState: function() {
			var states = this.states();
			if (states) {
				for (var i = states.length - 1; i >= 0; i--) {
					var state = states[i];
					if (state.value()) {
						return state;
					}
				}
			}
		}
	});

	return StateGroup;
});

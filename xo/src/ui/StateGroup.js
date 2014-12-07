define(['xo'], function (xo) {
	function StateGroup() {
		this._states = new xo.ObservableList();
		this._updateCurrentState();
	};

	StateGroup.prototype.contentCollection = 'states';

	StateGroup.prototype.target = xo.property();

	StateGroup.prototype.states = xo.property({
		get: function() {
			return this._states;
		}
	});

	StateGroup.prototype.currentState = xo.property({
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
	});

	StateGroup.prototype._setCurrentState = function(newState) {
		var oldState = this._currentState;
		if (newState !== oldState) {
			this._currentState = newState;
			xo.Event.raiseEvent(this, 'currentState', { oldValue: oldState, newValue: newState });
		}
	};

	StateGroup.prototype._updateCurrentState = function() {
		xo.EventTracker.observe(this, this._updateCurrentState, function() {
			var newState = this._computeCurrentState();
			this._setCurrentState(newState);				
		}, this);
	};

	StateGroup.prototype._computeCurrentState = function() {
		var states = this._states.toArray();
		for (var i = states.length - 1; i >= 0; i--) {
			var state = states[i];
			if (state.value()) {
				return state;
			}
		}
	}

	return StateGroup;
});

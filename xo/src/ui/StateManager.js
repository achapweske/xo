define(['xo'], function (xo) {
	function StateManager() {

	};

	StateManager.stateGroups = new xo.AttachedProperty({
		get: function(target) {
			if (!target._stateGroups) {
				target._stateGroups = new xo.ObservableList({
					changed: onStateGroupsChanged,
					$context: target
				});
			}
			return target._stateGroups;
		}
	});

	function onStateGroupsChanged(change) {
		var oldItems = change.oldItems;
		if (oldItems) {
			for (var i = 0; i < oldItems.length; i++) {
				oldItems[i].target(null);
			}
		}
		var newItems = change.newItems;
		if (newItems) {
			for (var i = 0; i < newItems.length; i++) {
				newItems[i].target(this);
			}
		}
	};

	return StateManager;
});

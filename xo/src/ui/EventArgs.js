define(['xo', './Visual'], function (xo, Visual) {
	return xo.extend(Object, {
		construct: function EventArgs(originalEvent) {
			this._originalEvent = originalEvent;
		},

		/**
		 * Get the original Visual on which this event was raised
		 * @return {Visual}
		 */
		originalTarget: function() {
			return this._originalTarget || (this._originalTarget = this._getOriginalTarget());
		},

		/**
		 * Get the Visual this event is currently being dispatched to
		 * @return {Visual}
		 */
		currentTarget: function() {
			return this._currentTarget || (this._currentTarget = this._getCurrentTarget());
		},

		/**
		 * Get the Visual on which this event was raised
		 *
		 * This is the same as originalTarget if it is in the same logical tree as currentTarget. Otherwise, it is the nearest ancestor of originalTarget that is in the same logical tree.
		 * @return {Visual}
		 */
		target: function() {
			return this._target || (this._target = this._getTarget());
		},

		_getOriginalTarget: function() {
			return Visual.fromNode(this._originalEvent.target);
		},

		_getCurrentTarget: function() {
			return Visual.fromNode(this._originalEvent.currentTarget);
		},

		_getTarget: function() {
			var target = this.originalTarget(),
				currentTarget = this.currentTarget(),
				parent, result;

			while (target !== currentTarget) {
				parent = target.visualParent();
				if (target.ownerTemplate()) {
					result = parent;
				}
				target = parent;
			}

			return result || target;
		}

	});
});
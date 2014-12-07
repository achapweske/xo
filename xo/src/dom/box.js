define([], function () {
	return {
		/**
		 * Get the width of the given node's border box.
		 *
		 * This does NOT take into account CSS transforms.
		 * @param  {Node} node
		 * @return {Number}
		 */
		getWidth: function(node) {
			return node.offsetWidth;
		},
		/**
		 * Get the height of the given node's border box.
		 *
		 * This does NOT take into account CSS transforms.
		 * @param  {Node} node
		 * @return {Number}
		 */
		getHeight: function(node) {
			return node.offsetHeight;
		}
	};
});
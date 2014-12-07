define([], function () {
	return {
		getOffsetParent: function(node) {
			if (node.offsetParent) return node.offsetParent;
			var doc = node.ownerDocument || node;
			return doc.documentElement;
		},
		/**
		 * Get a node's position relative to its offset parent.
		 *
		 * This does NOT take into account CSS transforms.
		 * @param  {Node} node
		 * @return {Object} an object of the form { x: #, y: # }
		 */
		getOffset: function(node) {
			if (node.offsetParent) return { x: node.offsetLeft, y: node.offsetTop };
			var bounds = node.getBoundingClientRect();
			return { x: bounds.left, y: bounds.top };
		},
		/**
		 * Get a node's absolute position relative to the document
		 *
		 * This does NOT take into account CSS transforms
		 * @param  {Node} node
		 * @return {Object} an object of the form { x: #, y: # }
		 */
		getAbsoluteOffset: function(node) {
			var offset = this.getOffset(node),
				ownerDocument = node.ownerDocument || node,
				documentElement = ownerDocument.documentElement,
				ancestor = node, 
				ancestorOffset;

			while ((ancestor = this.getOffsetParent(ancestor)) != null) {
				ancestorOffset = this.getOffset(ancestor);
				offset.x += ancestorOffset.x;
				offset.y += ancestorOffset.y;
				if (ancestor === documentElement) break;
			}

			ancestor = node;
			while ((ancestor = ancestor.parentNode) != null) {
				offset.x -= ancestor.scrollLeft;
				offset.y -= ancestor.scrollTop;
				if (ancestor === documentElement) break;
			}

			return offset;
		},
		/**
		 * Get a node's position relative to the specified node.
		 *
		 * This does NOT take into account CSS transforms.
		 * @param  {Node} node
		 * @param  {Node} relativeTo
		 * @return {Object} an object of the form { x: #, y: # }
		 */
		getRelativeOffset: function(node, relativeTo) {
			var nodeOffset = this.getAbsoluteOffset(node),
				relativeToOffset = this.getAbsoluteOffset(relativeTo);
			return {
				x: nodeOffset.x - relativeToOffset.x,
				y: nodeOffset.y - relativeToOffset.y
			}
		}
		
	};
});
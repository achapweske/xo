define(['src/core/Utils', './attr', './box', './css', './data', './events', './offset', './prop', './text'], function (Utils, attr, box, css, data, events, offset, prop, text) {

	function Node(options) {
		if (options && options.nodeType) {
			this.node = options;
			options = arguments[1];
		}
		else if (Utils.isString(options)) {
			this.node = document.createElement(options);
			options = arguments[1];
		}
		else {
			var tagName = (options && options.tagName) || 'div';
			this.node = document.createElement(tagName);
		}

		if (options) {
			init.call(this, options);
		}
	};

	function init(options) {
		if (options.id) {
			this.prop('id', options.id);
		}
		if (options.className) {
			this.prop('className', options.className);
		}
		if (options.attributes) {
			this.attr(options.attributes);
		}
		if (options.data) {
			this.data(options.data);
		}
		if (options.style) {
			this.css(options.style);
		}
	};

	Node.toNode = function(options) {
		if (options && options.tagName) {
			return Node.fromNative(options);
		}
		else {
			return new Node(options);
		}
	};

	Node.fromNative = function(n) {
		var node = data.getData(n, 'node');
		if (!node) {
			node = new Node(n);
			data.setData(n, 'node', node);
		}
		return node;
	};

	/**
	 * Insert a new sibling immediately after this node
	 * @param  {Node} newSibling the node to be inserted
	 * @return {Node} this
	 */
	Node.prototype.after = function(newSibling) {
		var node = this.node;
		if (node.parentNode) {
			if (newSibling.node) newSibling = newSibling.node;
			node.parentNode.insertBefore(newSibling, node.nextSibling);
		}
		return this;
	};

	/**
	 * Append a new child to this node
	 * @param  {Node} newChild the node to be appended
	 * @return {Node} this
	 */
	Node.prototype.append = function(newChild) {
		if (newChild.node) newChild = newChild.node;
		this.node.appendChild(newChild);
		return this;
	};

	/**
	 * Get/set an attribute
	 * @param  {string} name name of the attribute to be set or retrieved
	 * @param  {string} [value] the new attribute value
	 * @return {Node} this
	 */
	Node.prototype.attr = function(name, value) {
		if (false) {
			if (arguments.length === 2) {
				return attr.getAttributeNS(this.node, arguments[0], arguments[1]);
			}
			attr.setAttributeNS(this.node, arguments[0], arguments[1], arguments[2]);
			return this;
		}

		if (Utils.isObject(name)) {
			for (var key in name) {
				attr.setAttribute(this.node, key, name[key]);
			}
			return this;
		}

		if (arguments.length === 1) {
			return this.getAttribute(this.node, name);
		}
		attr.setAttribute(this.node, name, value);
		return this;
	};

	/**
	 * Insert a new sibling immediately before this node
	 * @param  {Node} newSibling the node to be inserted
	 * @return {Node} this
	 */
	Node.prototype.before = function(newSibling) {
		var node = this.node;
		if (node.parentNode) {
			if (newSibling.node) newSibling = newSibling.node;
			node.parentNode.insertBefore(newSibling, node);
		}
		return this;
	};

	/**
	 * Remove all children
	 * @return {Node} this
	 */
	Node.prototype.clear = function() {
		var node = this.node, child;
		while (child = node.firstChild) {
			node.removeChild(child);
		}
		return this;
	};

	/**
	 * Get/set an inline CSS style property
	 * @param  {string} name name of the property to be set or retrieved
	 * @param  {string} [value] the new property value
	 * @return {Node} this
	 */
	Node.prototype.css = function(name, value) {
		if (Utils.isObject(name)) {
			for (var key in name) {
				css.setInlineProperty.call(this.node, key, name[key]);
			}
			return this;
		}

		if (arguments.length === 1) {
			return css.getInlineProperty.apply(this.node, arguments);
		}

		css.setInlineProperty.apply(this.node, arguments);
		return this;
	};

	/**
	 * Get/set a named value
	 * @param  {string} name name of the data to be set or retrieved
	 * @param  {string} [value] the new data value
	 * @return {Node} this
	 */
	Node.prototype.data = function(name, value) {
		if (Utils.isObject(name)) {
			for (var key in name) {
				data.setData(this.node, key, name[key]);
			}
			return this;
		}

		if (arguments.length === 1) {
			return data.getData(this.node, name);
		}

		data.setData(this.node, name, value);
		return this;
	};

	/**
	 * Get this node's owner document
	 * @return {Node}
	 */
	Node.prototype.document = function() {
		return Node.fromNative(this.node.ownerDocument || this.node);
	}

	/**
	 * Get this node's first child node
	 * @return {Node} the first child node or null if none
	 */
	Node.prototype.firstChild = function() {
		var firstChild = this.node.firstChild;
		if (firstChild) return Node.fromNative(firstChild);
		return null;
	};

	Node.prototype.height = function() {
		return box.getHeight(this.node);
	};

	/**
	 * Insert a child node at the given index
	 * @param  {Node} newChild the new child node to be inserted
	 * @param  {number} index
	 * @return {Node} this
	 */
	Node.prototype.insert = function(newChild, index) {
		var node = this.node;
		if (newChild.node) newChild = newChild.node;
		var refNode = node.childNodes[index] || null;
		node.insertBefore(newChild, refNode);
		return this;
	};

	/**
	 * Get this node's last child node
	 * @return {Node} the last child node or null if none
	 */
	Node.prototype.lastChild = function() {
		var lastChild = this.node.lastChild;
		if (lastChild) return Node.fromNative(lastChild);
		return null;
	};

	/**
	 * Get this node's next sibling
	 * @return {Node} this node's next sibling, or null if none
	 */
	Node.prototype.next = function() {
		var next = this.node.nextSibling;
		if (next) return Node.fromNative(next);
		return null;
	};

	/**
	 * Unregister an event handler
	 * @param  {string} eventType e.g. 'click'
	 * @param  {function} handler the function to be unregistered
	 * @param  {boolean} useCapture 
	 * @param  {Object} context
	 * @return {Node}
	 */
	Node.prototype.off = function(eventType, handler, useCapture, context) {
		if (arguments.length === 3 && !Utils.isBoolean(useCapture)) {
			context = useCapture;
			useCapture = undefined;
		}
		events.removeEventListenerWithContext(this.node, eventType, handler, useCapture, context || window);
		return this;
	};

	/**
	 * Get this node's position relative to the given node.
	 *
	 * This specifically does NOT take into account CSS transforms
	 * @param  {Node} relativeTo
	 * @return {Object} and object of the form { x: #, y: # }
	 */
	Node.prototype.offset = function(relativeTo) {
		if (relativeTo.node) relativeTo = relativeTo.node;
		if (relativeTo) {
			return offset.getRelativeOffset(this.node, relativeTo);
		}
		else {
			return offset.getAbsoluteOffset(this.node);
		}
	};

	/**
	 * Register an event handler
	 * @param  {string} eventType e.g. 'click'
	 * @param  {function} handler the function to be called when the event occurs
	 * @param  {boolean} [useCapture] true to register the callback for the capturing phase
	 * @param  {Object} [context] the 'this' pointer to be passed to the handler
	 * @return {Node}
	 */
	Node.prototype.on = function(eventType, handler, useCapture, context) {
		if (arguments.length === 3 && !Utils.isBoolean(useCapture)) {
			context = useCapture;
			useCapture = undefined;
		}
		events.addEventListenerWithContext(this.node, eventType, handler, useCapture, context || window);
		return this;
	};

	/**
	 * Get this node's parent node
	 * @return {Node} parent node or null if none
	 */
	Node.prototype.parent = function() {
		var parentNode = this.node.parentNode;
		if (parentNode) {
			return Node.fromNative(parentNode);
		}
		else {
			return null;
		}
	};

	/**
	 * Prepend a new child to this node
	 * @param  {Node} newChild the node to be appended
	 * @return {Node} this
	 */
	Node.prototype.prepend = function(newChild) {
		var node = this.node;
		if (newChild.node) newChild = newChild.node;
		node.insertBefore(newChild, node.firstChild);
		return this;
	};

	/**
	 * Get this node's previous sibling
	 * @return {Node} this node's previous sibling, or null if none
	 */
	Node.prototype.prev = function() {
		var prev = this.node.prevSibling;
		if (prev) return Node.fromNative(prev);
		return null;
	};

	/**
	 * Get/set a node property
	 * @param  {string} name name of the property to be set or retrieved
	 * @param  {string} [value] the new property value
	 * @return {Node} this
	 */
	Node.prototype.prop = function(name, value) {
		if (Utils.isObject(name)) {
			for (var key in name) {
				prop.setProperty(this.node, key, name[key]);
			}
			return this;
		}

		if (arguments.length === 1) {
			return prop.getProperty(this.node, name);
		}

		prop.setProperty(this.node, name, value);
		return this;
	};

	/**
	 * Remove the specified child node
	 * @param  {Node} oldChild the node to be removed
	 * @return {Node} this
	 */
	Node.prototype.remove = function(oldChild) {
		var node = this.node;

		if (arguments.length === 0) {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
			return this;
		}

		if (oldChild.node) oldChild = oldChild.node;
		node.removeChild(oldChild);
		return this;
	};

	/**
	 * Remove the given attribute
	 * @param  {string} name name of the attribute to be removed
	 * @return {Node} this
	 */
	Node.prototype.removeAttr = function(name) {
		if (arguments.length > 1) {
			attr.removeAttributeNS(arguments[0], arguments[1]);
		}

		attr.removeAttribute(this.node, name);
		return this;
	};

	/**
	 * Remove the given named value
	 * @param  {string} name name of the data to be removed
	 * @return {Node} this
	 */
	Node.prototype.removeData = function(name) {
		data.removeData(this.node, name);
		return this;
	};

	/**
	 * Remove the given property
	 * @param  {string} name name of the property to be removed
	 * @return {Node} this
	 */
	Node.prototype.removeProp = function(name) {
		prop.removeProperty(this.node, name);
		return this;
	};

	/**
	 * Get/set this node's text content
	 * @param  {string} [value] new text content
	 * @return {Node} this
	 */
	Node.prototype.text = function(value) {
		if (arguments.length == 0) {
			return text.getText(this.node);
		}
		text.setText(this.node, value);
		return this;
    };

    Node.prototype.val = function(value) {
    	if (arguments.length === 0) {
    		return this.node.value;
    	}
    	this.node.value = value;
    	return this;
    };

    Node.prototype.width = function() {
    	return box.getWidth(this.node);
    };

	return Node;
});
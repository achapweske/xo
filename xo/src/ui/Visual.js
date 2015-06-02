define(['xo', './Transform', './TransformOrigin'], function (xo, Transform, TransformOrigin) {

	var Visual = xo.Object.extend({

// Constructor

		construct: function Visual(options) {
			options = options || {};

			this.dom = createDOM(options.element, {
				attributes: {
					'data-type': this.toString()
				},
				style: {
					'display': 'inline-block',
					'box-sizing': 'border-box',
					'vertical-align': 'top',
					'user-select': 'none',
					'border-style': 'solid',
					'border-width': '0'
				}
			});
			this.dom.data('visual', this);

			this._visualChildren = new xo.ObservableList({
				changed: this._onVisualChildrenChanged,
				$context: this
			});

			options = xo.omit(options, 'element');
			this.initialize(options);
		},
		
// Visual Tree

		visualParent: xo.property({
			get: function () {
				return this._visualParent;
			},
			changed: function(change) {
				this.canRender(change.newValue && change.newValue.canRender());
			}
		}),

		_setVisualParent: function(newParent) {
			var oldParent = this._visualParent;
			if (newParent !== oldParent) {
				this._visualParent = newParent;
				this.raise('visualParent', { newValue: newParent, oldValue: oldParent });
			}
		},
		
		visualChildren: xo.property({
			get: function() {
				return this._visualChildren;
			}
		}),

		_onVisualChildrenChanged: function(change) {
			var oldItems = change.oldItems;
			if (oldItems) {
				var offset = change.oldItemsIndex;
				for (var i = 0, length = oldItems.length; i < length; i++) {
					this._onVisualChildRemoved(oldItems[i], offset + i);
				}
			}
			var newItems = change.newItems;
			if (newItems) {
				var offset = change.newItemsIndex;
				for (var i = 0, length = newItems.length; i < length; i++) {
					this._onVisualChildAdded(newItems[i], offset + i);
				}
			}
		},

		_onVisualChildAdded: function(newChild, index) {
			if (!newChild || !newChild._setVisualParent) {
				console.log('Error: visual child "' + newChild + '" is not a visual');
			}
			else if (this.visualChildren().contains(newChild)) {
				newChild._setVisualParent(this);
				this.onVisualChildAdded(newChild, index);
			}
		},

		_onVisualChildRemoved: function(oldChild, index) {
			if (oldChild && oldChild._setVisualParent) {
				if (oldChild._visualParent === this) {
					oldChild._setVisualParent(null);
					this.onVisualChildRemoved(oldChild, index);
				}
			}
		},

		onVisualChildAdded: function(newChild, index) {
			this.dom.insert(newChild.dom, index);
		},

		onVisualChildRemoved: function(oldChild) {
			this.dom.remove(oldChild.dom);
		},

		/**
		 * Determine if this Visual is an ancestor of the given Visual
		 * @param  {Visual}  descendant the visual to be tested
		 * @return {Boolean} true if this is an ancestor of the given Visual
		 */
		isAncestorOf: function(descendant) {
			while (descendant) {
				descendant = descendant.visualParent();
				if (descendant === this) {
					return true;
				}
			}

			return false;
		},

		isDescendantOf: function(ancestor) {
			return ancestor && ancestor.isAncestorOf(this);
		},

		findCommonAncestor: function(other) {
			var ancestors = [];
			for (var ancestor = this; ancestor; ancestor = ancestor.visualParent()) {
				ancestors.push(ancestor);
			}
			for (var ancestor = other; ancestor; ancestor = other.visualParent()) {
				if (ancestors.indexOf(ancestor) !== -1) {
					return ancestor;
				}
			}
			return null;
		},

		ownerTemplate: xo.property(),

// Transforms

		transform: xo.property({
			type: Transform,
			changed: function(change) {
				xo.observe(this, this.transform, function() {
					this.dom.css('transform', change.newValue);			
				}, this, change);
			}		
		}),

		transformOrigin: xo.property({
			type: TransformOrigin,
			changed: function(change) {
				xo.observe(this, this.transformOrigin, function() {
					this.dom.css('transform-origin', change.newValue);
				}, this, change);
			}
		}),

		transformToAncestor: function(ancestor) {
			var result = new Transform(),
				visual = this,
				parent, transform, transformOrigin, offset;

			while (visual !== ancestor) {
				transform = visual.transform();
				if (transform) {
					transformOrigin = visual._getAbsoluteTransformOrigin();
					result.translate(-transformOrigin.x, -transformOrigin.y);
					result.append(transform);
					result.translate(transformOrigin.x, transformOrigin.y);
				}
				parent = visual.visualParent();
				if (!parent) {
					throw new Error('not an ancestor');
				}
				offset = visual.dom.offset(parent.dom);
				result.translate(offset.x, offset.y);
				visual = parent;
			}

			return result;
		},

		transformToDescendant: function(descendant) {
			return descendant.transformToAncestor(this).invert();
		},

		transformToVisual: function(visual) {
			var commonAncestor = this.findCommonAncestor(visual);
			if (!commonAncestor) {
				throw new Error('The visuals are not related');
			}
			return this.transformToAncestor(commonAncestor).append(
				commonAncestor.transformToDescendant(visual)
			);
		},

		_getAbsoluteTransformOrigin: function() {
			var transformOrigin = this.transformOrigin();
			if (transformOrigin) {
				return {
					x: transformOrigin.getAbsoluteX(this.dom.width()),
					y: transformOrigin.getAbsoluteY(this.dom.height())
				}
			}
			else {
				return {
					x: this.dom.width() * .5,
					y: this.dom.height() * .5
				}
			}
		},

// Rendering

		/**
		 * True if this visual is renderable.
		 *
		 * We bother calling onRender() only if canRender is true.
		 *
		 * For optimized rendering, this is set to true immediately *before* it's added to the DOM and reset to false immediately *after* it's removed.
		 */
		canRender: xo.property({
			get: function() {
				return !!this._canRender;
			},
			set: function(newValue) {
				var oldValue = !!this._canRender;
				if (newValue !== oldValue) {
					this._canRender = newValue;
					this.raise('canRender', { newValue: newValue, oldValue: oldValue });
				}
			},
			changed: function(change) {
				this.render();
				this.visualChildren().forEach(function (child) {
					child.canRender(change.newValue);
				});
			}
		}),

		/**
		 * True if this visual needs to be rendered
		 */
		needsRender: xo.property({
			get: function() {
				return !!this._needsRender;
			}
		}),

		_setNeedsRender: function(newValue) {
			var oldValue = this._needsRender;
			if (newValue !== oldValue) {
				this._needsRender = newValue;
				this.raise('needsRender', { newValue: newValue, oldValue: oldValue });
			}
		},

		/**
		 * Schedule this visual for (re-)rendering
		 */
		invalidate: function() {
			if (!this._needsRender) {
				var self = this;
				this._renderTimerId = setTimeout(function () {
					self.render();
				}, 0);
				this._setNeedsRender(true);
			}
		},

		/**
		 * Render this visual.
		 *
		 * This calls onRender() to re-render the visual. If any properties referenced in onRender() subsequently changed, this visual is automatically invalidated.
		 */
		render: function() {
			if (this._needsRender) {
				clearTimeout(this._renderTimerId);
			}
			xo.ignore(function () {
				// call invalidate() when any dependencies referenced in onRender() change
				xo.observe(this, this.invalidate, this._onRender, this);
			}, this);

			this._setNeedsRender(false);
		},

		_onRender: function() {
			if (this._canRender) this.onRender();
		},

		/*
		 * Called just before the element is to be added to the DOM tree, and then
		 * is called during any animation frame if there are any changes to dependencies
		 * referenced the last time it was called. Dependencies are not tracked when
		 * the element is taken out of the DOM tree.
		 */
		onRender: function() {

		}
		 
	});

	function createDOM(options, defaults) {
		if (options && options.nodeType) {
			return xo(options);	// options is a DOM Node
		}

		if (xo.isString(options)) {
			options = {
				tagName: options
			};
		}

		var actual = defaults;

		if (options) {
			if (options.document) actual.document = options.document;
			if ('id' in options) actual.id = options.id;
			if ('className' in options) actual.className = options.className;
			if (options.attributes) xo.copy(actual.attributes, options.attributes);
			if (options.data) xo.copy(actual.data, options.data);
			if (options.style) xo.copy(actual.style, options.style);
		}

		return xo(actual);
	};
	
	/**
	 * Get the Visual associated with the given DOM node
	 * @param  {Node} node
	 * @return {Visual}
	 */
	Visual.fromNode = function(node) {
		var visual;
		while (node) {
			visual = xo(node).data('visual');
			if (visual) return visual;
			node = node.parentNode;
		}
		return null;
	};

	return Visual;
});
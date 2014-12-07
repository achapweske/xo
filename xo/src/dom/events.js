define(['./data'], function (data) {

	function eventWrapper(callback, e) {
		if (!e) e = window.event;	// IE
		var args = EventArgs.fromEvent(e);
		callback.call(this, args);
	};

	function EventArgs(original) {
		this.nativeEvent = original;
		this.eventPhase = original.eventPhase;
		this.type = original.type;
		this.target = original.target;
		this.currentTarget = original.currentTarget;
		this.ctrlKey = original.ctrlKey;
		this.shiftKey = original.shiftKey;
		this.altKey = original.altKey;
		this.metaKey = original.metaKey;

		// IE<9 
		if (!this.target) {
			this.target = original.srcElement || document;
		}

		// Chrome 23+, Safari
		if (this.target.nodeType === 3) {
			this.target = this.target.parentNode;
		}

		// IE<9
		this.metaKey = !!this.metaKey;
	};

	EventArgs.fromEvent = function(e) {
		if (MouseEventArgs.typeRegEx.test(e.type)) {
			return new MouseEventArgs(e);
		}
		else if (KeyEventArgs.typeRegEx.test(e.type)) {
			return new KeyEventArgs(e);
		}
		else {
			return new EventArgs(e);
		}
	};

	EventArgs.prototype.preventDefault = function() {
		if (this.nativeEvent.preventDefault) {
			this.nativeEvent.preventDefault();
		}
		else {
			this.nativeEvent.returnValue = false;
		}
	};

	EventArgs.prototype.stopPropagation = function() {
		if (this.nativeEvent.stopPropagation) {
			this.nativeEvent.stopPropagation();
		}
		else {
			this.nativeEvent.cancelBubble = true;
		}
	};

	function MouseEventArgs(original) {
		EventArgs.call(this, original);

		this.relatedTarget = original.relatedTarget;
		this.clientX = original.clientX;
		this.clientY = original.clientY;
		this.pageX = original.pageX;
		this.pageY = original.pageY;
		this.screenX = original.screenX;
		this.screenY = original.screenY;
		this.which = original.which;
		this.buttons = original.buttons;

		// IE<9
		if (!('pageX' in original)) {
			var ownerDocument = this.target.ownerDocument || document,
				documentElement = ownerDocument.documentElement,
				body = ownerDocument.body;

			this.pageX = original.clientX + 
				(documentElement && documentElement.scrollLeft || body && body.scrollLeft || 0) - 
				(documentElement && documentElement.clientLeft || body && body.clientLeft || 0);
			
			this.pageY = original.clientY + 
				(documentElement && documentElement.scrollTop  || body && body.scrollTop  || 0) - 
				(documentElement && documentElement.clientTop  || body && body.clientTop  || 0);
		}

		// IE<9
		if (!this.relatedTarget && original.fromElement) {
			this.relatedTarget = (original.fromElement === this.target) ? original.toElement : original.fromElement;
		}

		// IE<9
		if (!this.which && 'button' in original) {
			switch (original.button) {
				case 1: 	// left
					this.which = 1;
					break;
				case 2: 	// right
					this.which = 3;
					break;
				case 4: 	// middle
					this.which = 2;
					break;
				default:
					this.which = 0;
					break;
			}
		}

		// Most browsers
		if (!this.buttons) {
			switch (this.which) {
				case 1: 	// left
					this.buttons = 1;
					break;
				case 2: 	// middle
					this.buttons = 4;
					break;
				case 3: 	// right
					this.buttons = 2;
					break;
				default:
					this.buttons = 0;
					break;
			}
		}
	};

	MouseEventArgs.prototype = Object.create(EventArgs.prototype);
	MouseEventArgs.constructor = MouseEventArgs;
	MouseEventArgs.typeRegEx = /^(?:mouse|pointer|contextmenu)|click/;

	function KeyEventArgs(e) {
		EventArgs.call(this, e);
	};

	KeyEventArgs.prototype = Object.create(EventArgs.prototype);
	KeyEventArgs.constructor = KeyEventArgs;
	KeyEventArgs.typeRegEx = /^key/;

	var events = {
		/**
		 * Register an event listener with the given context
		 * @param {string} eventType the event to listen for (e.g. 'click')
		 * @param {function} handler the function to be called when the given event is triggered
		 * @param {boolean} useCapture true to register the listener for the capturing phase of event dispatch
		 * @param {Object} context the "this" pointer to be used for the given handler
		 */
		addEventListenerWithContext: function(node, eventType, handler, useCapture, context) {
			var wrapper = this.registerEventWrapper(node, eventType, handler, useCapture, context);
			this.addEventListener(node, eventType, wrapper, useCapture);
		},

		/**
		 * Unregister an event listener with the given context
		 * @param  {string} eventType unregister listeners for this event type (e.g. 'click')
		 * @param  {function} listener the function to be unregistered
		 * @param  {boolean} useCapture true to unregister listeners for the capturing phase of event dispatch
		 * @param  {Object} context unregister listeners registered with this context
		 */
		removeEventListenerWithContext: function(node, eventType, handler, useCapture, context) {
			var wrappers = this.unregisterEventWrappers(node, eventType, handler, useCapture, context);
			for (var i = 0; i < wrappers.length; i++) {
				this.removeEventListener(node, eventType, wrappers[i], useCapture);
			}
		},

		registerEventWrapper: function(node, eventType, handler, useCapture, context) {
			var newWrapper = eventWrapper.bind(context, handler),
				eventWrappers = this.getEventWrappers(node, useCapture);

			eventWrappers = eventWrappers[eventType] || (eventWrappers[eventType] = []);
			eventWrappers.push({ handler: handler, context: context, wrapper: newWrapper });

			return newWrapper;
		},

		unregisterEventWrappers: function(node, eventType, handler, useCapture, context) {
			var eventWrappers = this.getEventWrappers(node, useCapture),
				oldWrappers = eventWrappers[eventType],
				newWrappers = eventWrappers[eventType] = [],
				results = [];

			if (oldWrappers) {
				for (var i = 0; i < oldWrappers.length; i++) {
					var entry = oldWrappers[i];
					if (entry.handler === handler && 
						entry.context === context) {
						results.push(entry.wrapper);
					} else {
						newWrappers.push(entry);
					}
				}
			}

			return results;
		},

		getEventWrappers: function(node, useCapture) {
			var eventWrappers = data.getData(node, 'eventWrappers');
			if (!eventWrappers) {
				eventWrappers = { capturing: {}, bubbling: {} };
				data.setData(node, 'eventWrappers', eventWrappers);
			}
			return useCapture ? eventWrappers.capturing : eventWrappers.bubbling;
		},

		/**
		 * Register an event listener. 
		 * To prevent memory leaks, all registered events must be explicitly unregistered.
		 * @param {string} eventType the event to listen for (e.g., 'click')
		 * @param {function} listener the function to be called when the given event is triggered
		 * @param {boolean} useCapture true to register the listener for the capturing phase of event dispatch
		 */
		addEventListener: function(node, eventType, listener, useCapture) {
			if (node.addEventListener) {
				return node.addEventListener(eventType, listener, useCapture);
			}
			

			// register the listener with our internal dispatcher
			this.registerEventListener(node, eventType, listener, useCapture);

			var defn = this.definitions[eventType];
			if (defn && defn.bubbles) node = node.ownerDocument || node;
			if (this.updateEventListenerCount(node, eventType, 1) === 1) {
				this.attachEvent(node, 'on'+eventType, this.dispatchEvent);
			}
		},

		/**
		 * Unregister an event listener.
		 * If the listener was registered more than once, all instances will be unregistered.
		 * @param  {Node} node the node on which the listener is to be unregistered
		 * @param  {string} eventType unregister listeners for this event type (e.g. 'click')
		 * @param  {function} listener the function to be unregistered
		 * @param  {boolean} useCapture true to unregister listeners for the capturing phase of event dispatch
		 */
		removeEventListener: function(node, eventType, listener, useCapture) {
			if (node.removeEventListener) {
				return node.removeEventListener(eventType, listener, useCapture);
			}
			
			// unregister the listener with our internal dispatcher
			var numRemoved = this.unregisterEventListener(node, eventType, listener, useCapture);
			if (numRemoved) {
				var defn = this.definitions[eventType];
				if (defn && defn.bubbles) node = node.ownerDocument || node;
				if (this.updateEventListenerCount(node, eventType, -numRemoved) === 0) {
					this.detachEvent(node, 'on'+eventType, this.dispatchEvent);
				}
			}
		},

		/**
		 * Register a listener with our internal event dispatcher
		 * @param  {Node} node the node on which the listener is to be registered
		 * @param  {string} eventType e.g. 'click'
		 * @param  {function} listener a function to be called when the event is triggered
		 * @param  {boolean} useCapture true to register the listener for the capturing phase
		 */
		registerEventListener: function(node, eventType, listener, useCapture) {
			var listeners = this.getEventListeners(node, eventType, useCapture, true);
			listeners.push(listener);
		},

		/**
		 * Unregister a listener with our internal event dispatcher
		 * @param  {Node} node the node on which the listener was registered
		 * @param  {string} eventType e.g. 'click'
		 * @param  {function} listener the callback function to be unregistered
		 * @param  {boolean} useCapture true to unregister the listener for the capturing phase
		 * @return {number} number of instances of the listener that were unregistered
		 */
		unregisterEventListener: function(node, eventType, listener, useCapture) {
			var count = 0,
				listeners = this.getEventListeners(node, eventType, useCapture, false);
			if (listeners) {
				for (var i = listeners.length - 1; i >= 0; i--) {
					if (listeners[i] === listener) {
						listeners.splice(i, 1);
						count++;
					}
				}
			}
			return count;
		},

		/**
		 * Get listeners registered with our internal event dispatcher
		 * @param  {Node} node get listeners registered on this node
		 * @param  {boolean} useCapture if true, get listeners registered for the capturing phase
		 * @param  {boolean} autoCreate
		 * @return {Array} an array of callback functions
		 */
		getEventListeners: function(node, eventType, useCapture, autoCreate) {
			var listeners = data.getData(node, 'eventListeners');
			if (!listeners) {
				if (!autoCreate) return listeners;
				listeners = { capturing: {}, bubbling: {} };
				data.setData(node, 'eventListeners', listeners);
			}
			listeners = useCapture ? listeners.capturing : listeners.bubbling;

			var handlers = listeners[eventType];
			if (!handlers) {
				if (!autoCreate) return handlers;
				handlers = listeners[eventType] = [];
			}
			return handlers;
		},

		updateEventListenerCount: function(node, eventType, delta) {
			var counts = data.getData(node, 'eventListenerCounts');
			if (!counts) {
				data.setData(node, 'eventListenerCounts', counts = {});
			}
			return counts[eventType] = (counts[eventType] || 0) + delta;
		},

		/**
		 * Internal event dispatcher
		 * @param  {Event} e the event to be dispatched
		 */
		dispatchEvent: function(evt) {
			if (!evt) evt = window.event;
			var type = evt.type,
				defn = events.definitions[type];
			if (!evt.target) evt.target = evt.srcElement;
			if (!('bubbles' in evt)) evt.bubbles = (defn && defn.bubbles) || false;
			if (!('cancelable' in evt)) evt.cancelable = (defn && defn.cancelable) || false;

			// MUST determine propagation path at beginning of dispatch
			// If event listener changes the DOM structure, this should NOT affect the current propagation path
			var propagationPath = events.getSelfAndAncestors(evt.target);

			// tunneling phase
			evt.eventPhase = 1;
			for (var i = propagationPath.length - 1; i > 0; i--) {
				evt.currentTarget = propagationPath[i];
				events.invokeEventListeners(evt.currentTarget, type, true, evt);
			}

			// at target
			evt.eventPhase = 2;
			evt.currentTarget = propagationPath[0];
			events.invokeEventListeners(evt.currentTarget, type, false, evt);

			// bubbling phase
			if (evt.bubbles) {
				evt.eventPhase = 3;
				for (var i = 1; i < propagationPath.length; i++) {
					evt.currentTarget = propagationPath[i];
					events.invokeEventListeners(evt.currentTarget, type, false, evt);
				}
			}

			// done
			evt.eventPhase = 0;
			evt.currentTarget = null;
		},

		definitions: {
			// UIEvents
			'load': { bubbles: false, cancelable: false },
			'unload': { bubbles: false, cancelable: false },
			'abort': { bubbles: false, cancelable: false },
			'error': { bubbles: false, cancelable: false },
			'select': { bubbles: true, cancelable: false },
			'resize': { bubbles: false, cancelable: false },
			'scroll': { bubbles: false, cancelable: false },
			// Focus events
			'blur': { bubbles: false, cancelable: false },
			'focus': { bubbles: false, cancelable: false },
			'focusin': { bubbles: true, cancelable: false },
			'focusout': { bubbles: true, cancelable: false },
			// Mouse events
			'click': { bubbles: true, cancelable: true },
			'dblclick': { bubbles: true, cancelable: true },
			'mousedown': { bubbles: true, cancelable: true },
			'mouseenter': { bubbles: false, cancelable: false },
			'mouseleave': { bubbles: false, cancelable: false },
			'mousemove': { bubbles: true, cancelable: true },
			'mouseout': { bubbles: true, cancelable: true },
			'mouseover': { bubbles: true, cancelable: true },
			'mouseup': { bubbles: true, cancelable: true },
			// Wheel events
			'wheel': { bubbles: true, cancelable: true },
			// Input events
			'beforeinput': { bubbles: true, cancelable: true },
			'input': { bubbles: true, cancelable: false },
			// Keyboard events
			'keydown': { bubbles: true, cancelable: true },
			'keyup': { bubbles: true, cancelable: true },
			// Composition events
			'compositionstart': { bubbles: true, cancelable: true },
			'compositionupdate': { bubbles: true, cancelable: false },
			'compositionend': { bubbles: true, cancelable: false }
		},

		/**
		 * Call listeners registered with our internal event dispatcher
		 * @param  {Node}  node
		 * @param  {String}  eventType 
		 * @param  {Boolean} isCapturing
		 * @param  {Event}  evt
		 */
		invokeEventListeners: function(node, eventType, isCapturing, evt) {
			var listeners = this.getEventListeners(node, eventType, isCapturing);
			if (listeners) {
				for (var i = 0; i < listeners.length; i++) {
					try {
						listeners[i].call(node, evt);
					}
					catch (ex) {
						// per spec, exceptions must not propagate outside of the event handler
						// and must not stop propagation or affect propagation path
						if (window.console) console.error(ex);
					}
				}
			}
		},

		/**
		 * Attach a listener to an event on the given node.
		 * No more than one handler can be attached to a given event on a given node.
		 * @param  {Node} node the node on which the listener is to be attached
		 * @param  {string} eventName the event to be attached (e.g. 'onclick')
		 * @param  {function} handler the function to be called when the event is triggered
		 * @return {boolean} true on success or false if an error occurs
		 */
		attachEvent: function(node, eventName, handler) {
			if (node.attachEvent) {	
				return node.attachEvent(eventName, handler);
			}
			else if (typeof node[eventName] === 'undefined') {
				node[eventName] = handler;
				return true;
			}
			else {
				return false;
			}
		},

		/**
		 * Detach a listener from an event on the given node
	 	 * @param  {Node} node the node on which the listener was attached
		 * @param  {[string]} eventName the event to which the listener was attached (e.g. 'onclick')
		 * @param  {[function]} listener the function to be detached
		 */
		detachEvent: function(node, eventName, listener) {
			if (node.detachEvent) {
				return node.detachEvent(eventName, listener);
			}
			else if (node[eventName] === listener) {
				node[eventName] = void 0;
			}
		},

		/**
		 * Get an array of nodes consisting of the given node and all of its ancestors
		 * @param  {Node} node
		 * @return {Array} the result set in reverse document order
		 */
		getSelfAndAncestors: function(node) {
			var results = [];
			do {
				results.push(node);
				node = node.parentNode;
			} while (node);

			return results;
		}
	};

	return events;
});
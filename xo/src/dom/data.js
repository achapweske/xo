define([], function () {
	var oldAPI = {
		cache: {},
		nextKey: 1,
		releasedKeys: [],
		/**
		 * Generate a new key for our data store cache
		 * @return {string}
		 */
		acquireKey: function() {
			var pool = this.releasedKeys;
			if (pool.length > 0) {
				var key = pool[pool.length - 1];
				pool.splice(pool.length - 1, 1);
				return key;
			}
			return this.nextKey++;
		},
		/**
		 * Release a data store key that's no longer in use.
		 * This helps us work around memory leaks in certain browsers
		 * @param  {string} key
		 */
		releaseKey: function(key) {
			releasedKeys.push(key);
		},
		/**
		 * Create a data store for the given node
		 * @param  {Node} node
		 * @return {Object} the new data store
		 */
		createStore: function(node) {
			var key = node['xodata'] = this.acquireKey();
			return this.cache[key] = {};
		},
		/**
		 * Delete the data store for the given node
		 * @param  {Node} node
		 */
		deleteStore: function(node) {
			var key = node['xodata'];
			if (key) {
				delete this.cache[key];
				this.releaseKey(key);
				node['xodata'] = void 0;
			}
		},
		/**
		 * Get the data store for the given node
		 * @param  {Node} node
		 * @return {Object} the data store, or undefined if no store defined for the given node
		 */
		getStore: function(node) {
			var key = node['xodata'];
			return key && this.cache[key];
		},
		/**
		 * Set a named value for the given node
		 * @param {Node} node
		 * @param {string} name
		 * @param {Object} value
		 */
		set: function(node, name, value) {
			var store = this.getStore(node) || this.createStore(node);
			store[name] = value;
		},
		/**
		 * Get a named value for the given node
		 * @param  {Node} node
		 * @param  {string} name
		 * @return {Object} the value associated with the given name (or undefined if none)
		 */
		get: function(node, name) {
			var store = this.getStore(node);
			return store ? store[name] : undefined;
		},
		/**
		 * Delete a named value for the given node
		 * @param  {Node} node
		 * @param  {string} name
		 */
		clear: function(node, name) {
			var store = this.getStore(node);
			if (store) delete store[name];
		}
	};

	return {
		/**
		 * Set a named value for the given node
		 * @param {Node} node
		 * @param {string} name
		 * @param {Object} value
		 */
		setData: function(node, name, value) {
			var data = node['xodata'] || (node['xodata'] = {});
			data[name] = value;
		},
		/**
		 * Get a named value for the given node
		 * @param  {Node} node
		 * @param  {string} name
		 * @return {Object} the value associated with the given name (or undefined if none)
		 */
		getData: function(node, name) {
			var data = node['xodata'];
			return data ? data[name] : undefined;
		},
		/**
		 * Delete a named value for the given node
		 * @param  {Node} node
		 * @param  {string} name
		 */
		removeData: function(node, name) {
			var data = node['xodata'];
			if (data) delete data[name];
		}
	};
});
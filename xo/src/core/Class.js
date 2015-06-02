define(['./Utils'], function (Utils) {

	var classGeneratorString = (function() {
		var result;
		result = function placeholder() {
			if (!(this instanceof result)) {
				return result.invoke.apply(result, arguments);
			}
			result.prototype.construct.apply(this, arguments);
		};
		return result;
	}).toString();

	function generateClass(name) {
		var str = classGeneratorString.replace('placeholder', name);
    	var classGenerator = eval('(function() { return ' + str + ';})()');
    	return classGenerator();
	};

	var Class = {
		extend: function(defn) {
	    	var superClass = this;

			if (!Utils.isFunction(superClass)) {
				throw new TypeError('superClass must be a function');
			}    	
	    	if (defn && !Utils.isObject(defn)) {
	    		throw new TypeError('defn must be an object');
	    	}

	    	var name = (defn && defn.construct) ? Utils.nameOf(defn.construct) : '';
	    	if (!name) name = (this.getName && this.getName()) || 'Anonymous';
	    	var subClass = generateClass(name);

	    	var fn = function() { };
	    	fn.prototype = superClass.prototype;
	    	subClass.prototype = new fn();
			subClass.prototype.constructor = subClass;
			subClass.__superclass = superClass;
			Utils.copy(subClass, Class);

			// Copy each key-value in defn to the new class's prototype
			
			if (defn) {
				var props = Utils.keys(defn);
				for (var i = 0; i < props.length; i++) {
					var key = props[i],
						value = defn[key];
					if (Utils.isFunction(value)) {
						subClass.addMethod(key, value);
					}
					else {
						subClass.prototype[key] = value;
					}
				}
			}

			// If no constructor is specified, automatically add a default constructor
			// which merely calls the superclass constructor (if any)
			
			if (!subClass.prototype.construct) {
				subClass.addMethod('construct', function($super) {
					if ($super) $super.apply(this, arguments);
				});
			}

			return subClass;
	    },

	    /**
	     * Called when a constructor (returned by Class.extend) is invoked without the 'new' operator
	     */
	    invoke: function() {
	    	throw new Error('Constructor must be invoked using the "new" operator');
	    },

	    /**
	     * Add a function to this class's prototype
	     */
		addMethod: function(name, method) {
			// If the first argument is named '$super', then bind that argument to an object
			// that can be used to call the superclass implementation of the function.
			if (Utils.argumentNames(method)[0] === '$super') {
				var clazz = this;
				this.prototype[name] = function() {
					var args = Array.prototype.slice.call(arguments, 0),
						$super = makeSuper(clazz, this, name);
					method.apply(this, [ $super ].concat(args));
				};
			}
			// If the function is a constructor and its first argument is NOT named '$super',
			// then wrap it in a function that automatically calls the super class's constructor
			// with no arguments.
			else if (name === 'construct') {
				var clazz = this;
				this.prototype[name] = function() {
					var $super = makeSuper(clazz, this, name);
					if ($super) $super.call(this);
					method.apply(this, arguments);
				};
			}
			else {
				this.prototype[name] = method;
			}
		},
		getName: function() {
			return Utils.nameOf(this.prototype.constructor);
		},
		getSuperclass: function() {
			return this.__superclass;
		}
	};

	/**
	 * Get a function that invokes the base class's implementation of the method with the given name
	 */
	function makeSuper(clazz, instance, methodName) {
		var superclass = clazz.getSuperclass(),
			supermethod = null;
		while (superclass) {
			supermethod = superclass.prototype[methodName]
			if (supermethod) break;
			superclass = superclass.getSuperclass && superclass.getSuperclass();
		}
		return supermethod ? function() {
			supermethod.apply(instance, arguments);
		} : null;
	}

	return Class;
});
define([], function() {

	var charCodes = {
		a: 'a'.charCodeAt(0),
		z: 'z'.charCodeAt(0),
		A: 'A'.charCodeAt(0),
		Z: 'Z'.charCodeAt(0),
		'0': '0'.charCodeAt(0),
		'9': '9'.charCodeAt(0)
	}

	function any(array, fn, context) {
		if (context) fn = fn.bind(context);
		for (var i = 0; i < array.length; i++) {
			if (fn(array[i])) return true;
		}
		return false;
	};

	function capitalize(str){
		str = str == null ? '' : String(str);
		return str.charAt(0).toUpperCase() + str.slice(1);
    };

	function clone(obj) {
		if (!isObject(obj)) {
			return obj;
		}
		if (isArray(obj)) {
			return obj.slice();
		}
		var result = {};
		for (var key in obj) {
			result[key] = obj[key];
		}
		return result;
	};

	function contains(array, item) {
		for (var i = 0, length = array.length; i < length; i++) {
			if (array[i] === item) return true;
		}
		return false;
	};

	var builtInKeys = [
		'constructor',
		'toString',
		'valueOf',
		'toLocaleString',
		'prototype',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'hasOwnProperty',
		'length',
		'unique'
	];

	function copy(obj) {
		var source, key, i, j;
		for (i = 1; i < arguments.length; i++) {
			source = arguments[i];
			if (source) {
				for (key in source) {
					if (source.hasOwnProperty(key)) {
						obj[key] = source[key];
					}
				}
				// IE<9: properties with same name as inherited properties aren't enumerated by 'in' operator ("DontEnum" bug)
				for (j = 0; j < builtInKeys.length; j++) {
					key = builtInKeys[j];
					if (source.hasOwnProperty(key)) {
						obj[key] = source[key];
					}
				}
			}
		}
		return obj;
	};

	function endsWith(str, postfix) {
		if (postfix === '') return true;
		if (str == null || postfix == null) return false;
		str = String(str); 
		postfix = String(postfix);
		return str.length >= postfix.length && str.slice(str.length - postfix.length) === postfix;
    };

    function error() {
		if (window.console) {
			console.error.apply(console, arguments);
		}
	};

    function _extend(subClass) {
    	var baseClass = this;

		if (!isFunction(baseClass)) {
			throw new TypeError('baseClass must be a function');
		}    	
    	if (subClass && !isObject(subClass)) {
    		throw new TypeError('subClass must be an object');
    	}

    	var ctor = subClass && subClass.construct;
    	if (!ctor) {
    		ctor = function() {
				baseClass.apply(this, arguments);
			};
		}

    	var fn = function() { };
    	fn.prototype = baseClass.prototype;
    	ctor.prototype = new fn();
		ctor.prototype.constructor = ctor;
		ctor.extend = _extend;
		ctor.mixin = _mixin;

		if (subClass) {
			copy(ctor.prototype, subClass);
		}

		return ctor;
    };

    function extend(baseClass, subClass) {
    	var args = Array.prototype.slice.call(arguments, 1);
    	return _extend.apply(baseClass, args);
	};

	function hasValue(obj, value) {
		for (var key in obj) {
			if (obj[key] === value) {
				return true;
			}
		}
		return false;
	};

	var nextId = 1;

	function id(obj) {
		if (arguments.length > 1) {
			var ids = map(arguments, function (obj) {
				return id(obj);
			});
			return ids.join('.');
		}
		return obj._xoid || (obj._xoid = nextId++);
	};

	function instanceOf(obj, type) {
		if (type === String) return isString(obj);
		if (type === Array) return isArray(obj);
		if (type === Number) return isNumber(obj);
		if (type === Boolean) return isBoolean(obj);
		if (type === Date) return isDate(obj);
		if (type === RegExp) return isRegExp(obj);
		if (type === Object) return isObject(obj);
		if (type === Function) return isFunction(obj);
		return obj instanceof type;
	};

	function isArguments(obj) {
		return Object.prototype.toString.call(obj) === '[object Arguments]';
	};

	if (!isArguments(arguments)) {
		isArguments = function(obj) {
			return !isArray(obj)
	            && obj !== null
	            && typeof obj === 'object'
	            && typeof obj.length === 'number'
	            && obj.length >= 0
	            && isFunction(obj.callee);
		};
	}

	var isArray = Array.isArray;

	if (!isArray) {
		isArray = function(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		};
	}

	function isBoolean(obj) {
		return obj === true || obj === false || Object.prototype.toString.call(obj) === '[object Boolean]';
	};

	function isDate(obj) {
		return Object.prototype.toString.call(obj) === '[object Date]';
	};

	function isDigit(ch) {
		var charCode = ch.charCodeAt(0);
		return charCode >= charCodes['0'] && charCode <= charCodes['0'];
	};

	function isEmpty(obj) {
		for (var key in obj) {
			return false;
		}
		return true;
	};

	function isFunction(obj) {
		return Object.prototype.toString.call(obj) === '[object Function]';
	};

	if (typeof (/./) !== 'function') {
		isFunction = function(obj) {
			return typeof obj === 'function';
		};
	};

	function isLetter(ch) {
		var charCode = ch.charCodeAt(0);
		return charCode >= charCodes.a && charCode <= charCodes.z ||
			charCode >= charCodes.A && charCode <= charCodes.Z;
	};

	function isNaN(obj) {
		return isNumber(obj) && obj !== +obj;
	};

	function isNumber(obj) {
		return Object.prototype.toString.call(obj) === '[object Number]';
	};

	function isNumeric(obj) {
		return obj == +obj && /* IE8: +'' === 0 */ obj !== '';
	};

	function isObject(obj) {
		return obj !== null && typeof obj === 'object';
	};

	function isRegExp(obj) {
		return Object.prototype.toString.call(obj) === '[object RegExp]';
	};

	function isString(obj) {
		return Object.prototype.toString.call(obj) === '[object String]';
	};

	function isUndefined(obj) {
		return obj === void 0;
	};

	function log() {
		if (window.console) {
			console.log.apply(console, arguments);
		}
	};

	function map(collection, fn) {
		var length = collection.length,
			results = new Array(length);
		for (var i = 0; i < length; i++) {
			results[i] = fn(collection[i]);
		}
		return results;
	};

	function _mixin() {
		var baseClass = this;
		for (var i = 0; i < arguments.length; i++) {
			var mixinClass = arguments[i];
			if (isFunction(mixinClass)) mixinClass = mixinClass.prototype;
			copy(baseClass.prototype, mixinClass);
		}
		return baseClass;
	};

	function mixin(baseClass, mixinClass) {
		var args = Array.prototype.slice.call(arguments, 1);
    	return _mixin.apply(baseClass, args);
	};

	/**
	 * Get the name of the given function
	 * @param  {Function} fn
	 * @return {String}
	 */
	function nameOf(fn) {
		if (!isFunction(fn)) {
			throw new TypeError('name(): first parameter must be a function');
		}
		else if (fn.name) {
			return fn.name;
		}
		else {
			return fn.toString().match(/^function\s(.+)\(/)[1];
		}
	};

	function pick(obj) {
		var result = {};
		for (var i = 1; i < arguments.length; i++) {
			var key = arguments[i];
			if (key in obj) result[key] = obj[key];
		}
		return result;
	};

	function startsWith(str, prefix){
		if (prefix === '') return true;
		if (str == null || prefix == null) return false;
		str = String(str); 
		prefix = String(prefix);
		return str.length >= prefix.length && str.slice(0, prefix.length) === prefix;
    };

    function warn() {
		if (window.console) {
			console.warn.apply(console, arguments);
		}
	};

	return {
		any: any,
		capitalize: capitalize,
		clone: clone,
		contains: contains,
		copy: copy,
		endsWith: endsWith,
		error: error,
		extend: extend,
		hasValue: hasValue,
		id: id,
		instanceOf: instanceOf,
		isArguments: isArguments,
		isArray: isArray,
		isBoolean: isBoolean,
		isDate: isDate,
		isDigit: isDigit,
		isEmpty: isEmpty,
		isFunction: isFunction,
		isLetter: isLetter,
		isNaN: isNaN,
		isNumber: isNumber,
		isNumeric: isNumeric,
		isObject: isObject,
		isRegExp: isRegExp,
		isString: isString,
		isUndefined: isUndefined,
		log: log,
		map: map,
		mixin: mixin,
		nameOf: nameOf,
		pick: pick,
		startsWith: startsWith,
		warn: warn
	};
});
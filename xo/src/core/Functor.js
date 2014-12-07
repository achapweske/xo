define(['./Utils'], function (Utils) {
	var Functor = {};

	Functor.define = function(ctor, fn) {
		fn._xoprototype = ctor.prototype;
		ctor.apply(fn, Array.prototype.slice.call(arguments, 2));
		return fn;
	};

	Functor.instanceOf = function(obj, ctor) {
		var proto = obj._xoprototype;
		while (proto) {
			if (proto.constructor === ctor)
				return true;
			proto = proto.superclass && proto.superclass.prototype;
		}
		return false;
	};

	Functor.getProperty = function(obj, name) {
		return obj[name] || obj._xoprototype[name];
	};

	Functor.call = function(obj, name) {
		var fn = Functor.getProperty(obj, name);
		var args = Array.prototype.slice.call(arguments, 2);
		return fn.apply(obj, args);
	};

	Functor.apply = function(obj, name, args) {
		var fn = Functor.getProperty(obj, name);
		return fn.apply(obj, args);
	};

	return Functor;
});
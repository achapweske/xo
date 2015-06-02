define(['./Utils', './Property'], function(Utils, Property) {

	function ComputedProperty(options) {
		Property.call(this, {
			get: ComputedProperty._getComputedValue
		});

		if (Utils.isFunction(options)) {
			options = { compute: options };
		}

		if (!options || !options.compute) {
			throw new Error('missing parameter "compute"');
		}

		this._compute = options.compute;
	};

	ComputedProperty.prototype = new Property;// Object.create(Property.prototype);
	ComputedProperty.prototype.constructor = ComputedProperty;

	ComputedProperty._getComputedValue = function(property, target) {
		try {
			return ComputedProperty.eval(property._compute, target);
		}
		catch (e) {
			Utils.warn('Data binding error: ' + (e.message || e));
		}
	};

	ComputedProperty.eval = function(fn, context, nameScope) {
		var args = Utils.argumentNames(fn);
		if (args.length > 0) {
			if (!nameScope) nameScope = ObjectTree.getNameScope(context) || context;
			args = args.map(function (name) {
				var value = nameScope[name];
				return Utils.isFunction(value) ? value.bind(nameScope) : value;
			});
		}
		return fn.apply(context, args);
	};

	return ComputedProperty;
});
define(['./Property'], function (Property) {

	function AttachedProperty(options) {
		Property.call(this, options);
	};

	AttachedProperty.prototype = new Property;// Object.create(Property.prototype);
	AttachedProperty.prototype.constructor = AttachedProperty;
	AttachedProperty.prototype.superclass = Property;

	AttachedProperty.prototype.onGet = function(target) {
		if (this._get) {
			return this._get.call(this, target);
		}
	};

	AttachedProperty.prototype.onSet = function(target, newValue) {
		if (this._set) {
			this._set.call(this, target, newValue);
		}
	};

	AttachedProperty.prototype.onChanged = function(target, change) {
		if (this._changed) {
			this._changed.call(this, target, change);
		}
	};

	return AttachedProperty;
});
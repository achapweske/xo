define(['./Utils', './Property'], function (Utils, Property) {
	return Utils.extend(Object, {
		construct: function PropertyTarget() {

		},

		setValue: function(property, newValue, priority) {
			return Property.setValue(this, property, newValue, priority);
		},

		getValue: function(property, priority) {
			return Property.getValue(this, property, priority);
		},

		clearValue: function(property, priority) {
			return Property.clearValue(this, property, priority);
		},

		setDefaultValue: function(property, newValue) {
			return this.setValue(property, newValue, Number.NEGATIVE_INFINITY);
		},

		getDefaultValue: function(property) {
			return this.getValue(property, Number.NEGATIVE_INFINITY);
		}
	});
});
define(['xo', './Dictionary', './Visual'], function (xo, Dictionary, Visual) {
	
	return xo.Object.extend({
		construct: function Template() {

		},

		contentProperty: 'visualTree',

		control: xo.property(),

		data: xo.property(),

		definitions: xo.property({
			get: function() {
				return Dictionary.definitions.get(this);
			},
			set: function(newValue) {
				Dictionary.definitions.set(this, newValue);
			}
		}),

		visualTree: xo.property({
			type: Visual,
			changed: function(change) {
				if (change.oldValue) {
					change.oldValue.clear('ownerTemplate');
				}
				if (change.newValue) {
					change.newValue.ownerTemplate(this);
				}
			}
		})
	});
});
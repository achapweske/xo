define(['xo', './HeaderedContentControl'], function (xo, HeaderedContentControl) {
	return HeaderedContentControl.extend({		
		construct: function TabItem(options) {
			this.setDefaultValue('defaultStyleKey', 'TabItem');
			this.cursor('default');
			this.initialize(options);
		},

		isSelected: xo.property({
			defaultValue: false
		})
	});
});
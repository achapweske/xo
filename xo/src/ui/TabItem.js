define(['xo', './HeaderedContentControl'], function (xo, HeaderedContentControl) {
	return HeaderedContentControl.extend({
		
		construct: function TabItem() {
			HeaderedContentControl.call(this);
			this.cursor('default');
		},

		isSelected: xo.property({
			defaultValue: false
		})
	});
});
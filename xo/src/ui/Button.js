define(['xo', './ContentControl'], function (xo, ContentControl) {
	return ContentControl.extend({
		construct: function Button(options) {			
			this.setDefaultValue('defaultStyleKey', 'Button');
			this.setDefaultValue('cursor', 'default');
			this.setDefaultValue('horizontalContentAlignment', 'center');
			this.setDefaultValue('verticalContentAlignment', 'middle');
			this.initialize(options);
		}
	});
});
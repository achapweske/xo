define(['xo', './ContentControl'], function (xo, ContentControl) {
	return ContentControl.extend({
		construct: function Button() {
			ContentControl.call(this);
			
			this.setDefaultValue('cursor', 'default');
			this.setDefaultValue('horizontalContentAlignment', 'center');
			this.setDefaultValue('verticalContentAlignment', 'middle');
		}
	});
});
define(['xo', './ContentControl'], function (xo, ContentControl) {
	function Label() {
		ContentControl.call(this);
	};

	Label.prototype = Object.create(ContentControl.prototype);
	Label.prototype.constructor = Label;

	return Label;
});
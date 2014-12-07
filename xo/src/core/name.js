define([], function () {
	return {
		setProperty: function(value, context, root) {
			root[value] = context;
		}
	};
});
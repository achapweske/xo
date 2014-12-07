requirejs.config({
	paths: {
		'xo': 'xo/xo',
		'src': 'xo/src',
		'test': 'xo/test',
		'external': 'xo/external',
		'text': 'xo/external/require-text/2.0.12/text.min'
	}
});

define(['xo', 'MyApp'], function(xo, MyApp) {
	return new MyApp();
});
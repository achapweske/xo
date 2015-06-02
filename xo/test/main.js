require.config({
	baseUrl: '/xo',
	waitSeconds: 0,
	paths: {
		'QUnit': 'external/qunit/1.15.0/qunit'
	},
	shim: {
		'QUnit': {
			exports: 'QUnit',
			init: function() {
				QUnit.config.autoload = false;
				QUnit.config.autostart = false;
			}
		} 
	}
});

require(
	['QUnit', 'test/core/Utils', 'test/core/Class', 'test/core/Property', 'test/core/Event', 'test/core/EventTracker', 'test/core/Property', 'test/core/AttachedProperty', 'test/core/RelativeProperty', 'test/core/Binding', 'test/core/Parser', 'test/xo' ],
	function(QUnit) {
		QUnit.load();
		QUnit.start();
	}
);
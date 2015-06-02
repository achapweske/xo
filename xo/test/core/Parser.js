define(['QUnit', 'src/core/Parser'], function(QUnit, Parser) {
	QUnit.module('Parser');

	QUnit.test('Parse a single element', function (assert) {
		var str = '<?xml version="1.0"?><Element />';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
	});

	QUnit.test('Parse a single child', function (assert) {
		var str = '<?xml version="1.0"?><Element><Child /></Element>';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.children.length, 1);
		assert.equal(parsed.children[0].moduleName, 'Child');
	});

	QUnit.test('Parse multiple children', function (assert) {
		var str = '<?xml version="1.0"?><Element><Child1 /><Child2 /></Element>';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.children.length, 2);
		assert.equal(parsed.children[0].moduleName, 'Child1');
		assert.equal(parsed.children[1].moduleName, 'Child2');
	});

	QUnit.test('Parse a text child', function (assert) {
		var str = '<?xml version="1.0"?><Element>Test</Element>';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.children.length, 1);
		assert.equal(parsed.children[0], 'Test');
	});

	QUnit.test('Parse a single attribute', function (assert) {
		var str = '<?xml version="1.0"?><Element foo="bar" />';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.properties.length, 1);
		assert.equal(parsed.properties[0].name, 'foo');
		assert.equal(parsed.properties[0].value, 'bar');
	});

	QUnit.test('Parse multiple attributes', function (assert) {
		var str = '<?xml version="1.0"?><Element foo="bar" bla="ble" />';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.properties.length, 2);
		assert.equal(parsed.properties[0].name, 'foo');
		assert.equal(parsed.properties[0].value, 'bar');
		assert.equal(parsed.properties[1].name, 'bla');
		assert.equal(parsed.properties[1].value, 'ble');
	});

	QUnit.test('Parse a delegated property attribute', function (assert) {
		var str = '<?xml version="1.0"?><Element Test.foo="bar"></Element>';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.properties.length, 1);
		assert.equal(parsed.properties[0].moduleName, 'Test');
		assert.equal(parsed.properties[0].name, 'foo');
		assert.equal(parsed.properties[0].value, 'bar');
	});

	QUnit.test('Parse a property element', function (assert) {
		var str = '<?xml version="1.0"?><Element><Element.foo>bar</Element.foo></Element>';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.properties.length, 1);
		assert.equal(parsed.properties[0].name, 'foo');
		assert.equal(parsed.properties[0].value, 'bar');
	});

	QUnit.test('Parse a delegated property element', function (assert) {
		var str = '<?xml version="1.0"?><Element><Test.foo>bar</Test.foo></Element>';
		var parsed = Parser.parse(str);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.properties.length, 1);
		assert.equal(parsed.properties[0].moduleName, 'Test');
		assert.equal(parsed.properties[0].name, 'foo');
		assert.equal(parsed.properties[0].value, 'bar');
	});

	QUnit.test('Parse a system-defined property', function (assert) {
		var str = '<?xml version="1.0"?><Element id="foo"></Element>';
		var options = { modulePaths: { x: 'src/core' }};
		var parsed = Parser.parse(str, options);
		assert.equal(parsed.moduleName, 'Element');
		assert.equal(parsed.properties.length, 1);
		assert.equal(parsed.properties[0].modulePath, 'src/core');
		assert.equal(parsed.properties[0].name, 'name');
		assert.equal(parsed.properties[0].value, 'foo');
	});

});

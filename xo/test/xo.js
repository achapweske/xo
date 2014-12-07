define(['QUnit', '../xo', 'src/core/Property', 'src/core/Event'], function(QUnit, xo, Property, Event) {
	QUnit.module('xo');

	QUnit.test('console contains a log function', function(assert) {
		if (window.console) {
			assert.ok(console.log);
		}
		else {
			assert.ok(true, 'Unable to test: console not enabled');
		}
	});

	QUnit.test('console contains a warn function', function(assert) {
		if (window.console) {
			assert.ok(console.warn);
		}
		else {
			assert.ok(true, 'Unable to test: console not enabled');
		}
	});

	QUnit.test('console contains an error function', function(assert) {
		if (window.console) {
			assert.ok(console.error);
		}
		else {
			assert.ok(true, 'Unable to test: console not enabled');
		}
	});

	QUnit.test('detect an attribute escape sequence', function(assert) {
		var str = '{}{Test}';
		var result = xo.options.helpers.isEscaped(str);
		assert.strictEqual(result, true);
	});

	QUnit.test('detect an attribute non-escape sequence (1)', function(assert) {
		var str = '{Test}';
		var result = xo.options.helpers.isEscaped(str);
		assert.strictEqual(result, false);
	});

	QUnit.test('detect an attribute non-escape sequence (2)', function(assert) {
		var str = 'Test';
		var result = xo.options.helpers.isEscaped(str);
		assert.strictEqual(result, false);
	});

	QUnit.test('apply an attribute escape sequence', function(assert) {
		var str = '{}{Test}';
		var result = xo.options.helpers.escapeString(str);
		assert.ok(result, '{Test}');
	});

	QUnit.test('detect an unclosed script attribute', function(assert) {
		var str = '{Test';
		var result = xo.options.helpers.isUnclosedScript(str);
		assert.strictEqual(result, true);
	});

	QUnit.test('detect a script attribute', function(assert) {
		var str = '{Test}';
		var result = xo.options.helpers.isScript(str);
		assert.strictEqual(result, true);
	});

	QUnit.test('detect a non-script attribute', function(assert) {
		var str = 'Test';
		var result = xo.options.helpers.isScript(str);
		assert.strictEqual(result, false);
	});

	QUnit.test('detect a definition attribute', function(assert) {
		var str = '@Test';
		var result = xo.options.helpers.isDefinition(str);
		assert.strictEqual(result, true);
	});

	QUnit.test('detect a non-definition attribute', function(assert) {
		var str = 'Test';
		var result = xo.options.helpers.isDefinition(str);
		assert.strictEqual(result, false);
	});

	QUnit.test('detect a property path', function(assert) {
		var strs = [
			'{foo}',
			'{foo.bar.test}',
			'{ foo.bar.test }',
			'{ foo.bar.test}',
			'{foo.bar.test }',
			'{$foo.bar.$test}',
			'{_foo.bar._test}',
			'{foo9.bar.test9}',
			'{foo[9].bar.test[9]}'
		];

		for (var i = 0; i < strs.length; i++) {
			var result = xo.options.helpers.isPropertyPath(strs[i]);
			assert.strictEqual(result, true, strs[i]);
		}
	});

	QUnit.test('detect a non property path', function(assert) {
		var strs = [
			'{foo()}',
			'{return foo.bar.test}',
			'{9foo}',
			'{foo.9bar}'
		];

		for (var i = 0; i < strs.length; i++) {
			var result = xo.options.helpers.isPropertyPath(strs[i]);
			assert.strictEqual(result, false, strs[i]);
		}
	});

	QUnit.test('create a javascript function from a string', function (assert) {
		var str = 'function () { return 5; }';
		var fn = xo.options.helpers.evalFunction(str);
		var result = fn();
		assert.equal(result, 5);
	});

	QUnit.test('compile a string', function (assert) {
		var str = 'test';
		var result = xo.options.compileString(str);
		assert.equal(result, 'test');
	});

	QUnit.test('compile a resource name', function (assert) {
		var str = '@myResource', nameScope;
		var context = {
			definitions: function() {
				return {
					find: function(name) {
						if (name === 'myResource') {
							return 'foobar';
						}
					}
				}
			}
		}
		var generator = xo.options.compileString(str);
		var fn = generator.call(context, nameScope);
		var result = fn();
		assert.equal(result, 'foobar');
	});

	QUnit.test('compile a property path', function (assert) {
		var str = '{foo.bar.test}';
		var result = xo.options.compileString(str);
		assert.equal(result.path, 'foo.bar.test');
	});

	QUnit.test('compile a property path (with spaces)', function (assert) {
		var str = '{ foo.bar.test }';
		var result = xo.options.compileString(str);
		assert.equal(result.path, 'foo.bar.test');
	});

	QUnit.test('compile a property path (single segment)', function (assert) {
		var str = '{foo}';
		var result = xo.options.compileString(str);
		assert.equal(result.path, 'foo');
	});

	QUnit.test('compile an object', function (assert) {
		var str = "{foo:'bar'}", nameScope = {};
		var generator = xo.options.compileString(str);
		var result = generator(nameScope);
		assert.equal(result.foo, 'bar');
	});

	QUnit.test('compile an object (with spaces)', function (assert) {
		var str = "{ foo: 'bar' }", nameScope = {};
		var generator = xo.options.compileString(str);
		var result = generator(nameScope);
		assert.equal(result.foo, 'bar');
	});

	QUnit.test('compile an object (multiple properties)', function (assert) {
		var str = "{foo:'bar', bla:'ble'}", nameScope = {};
		var generator = xo.options.compileString(str);
		var result = generator(nameScope);
		assert.equal(result.foo, 'bar');
		assert.equal(result.bla, 'ble');
	});

	QUnit.test('compile an object (with a global reference)', function (assert) {
		var str = "{foo:test}", nameScope = { test: 'bar' };
		var generator = xo.options.compileString(str);
		var result = generator(nameScope);
		assert.equal(result.foo, 'bar');
	});

	QUnit.test('compile an object (with a this reference)', function (assert) {
		var str = "{foo:this.test}", nameScope = {}, context = { test: 'bar' };
		var generator = xo.options.compileString(str);
		var result = generator.call(context, nameScope);
		assert.equal(result.foo, 'bar');
	});

	QUnit.test('compile a function', function (assert) {
		var str = "{2+1}", nameScope = {};
		var generator = xo.options.compileString(str);
		var fn = generator(nameScope);
		var result = fn();
		assert.equal(result, 3);
	});

	QUnit.test('compile a function (with spaces)', function (assert) {
		var str = "{ 2 + 1 }", nameScope = {};
		var generator = xo.options.compileString(str);
		var fn = generator(nameScope);
		var result = fn();
		assert.equal(result, 3);
	});

	QUnit.test('compile a function (with a global reference)', function (assert) {
		var str = "{ 'foo'+test }", nameScope = { test: 'bar' };
		var generator = xo.options.compileString(str);
		var fn = generator(nameScope);
		var result = fn();
		assert.equal(result, 'foobar');
	});

	QUnit.test('compile a function (with a this reference)', function (assert) {
		var str = "{ 'foo'+this.test }", nameScope = {}, context = { test: 'bar' };
		var generator = xo.options.compileString(str);
		var fn = generator.call(context, nameScope);
		var result = fn();
		assert.equal(result, 'foobar');
	});

	QUnit.test('set a property to a string value', function (assert) {
		function Test() {};
		Test.prototype.foo = Property.define();
		var target = new Test(),
			property = { name: 'foo', value: 'bar' },
			context = {};
		xo.options.setProperty(target, property, context);
		assert.equal(target.foo(), 'bar');
	});

	QUnit.test('set a property to a string value (delegated)', function (assert) {
		function Test() {};
		Test.foo = new Property();
		var target = {},
			property = { name: 'foo', value: 'bar', module: Test },
			context = {};
		xo.options.setProperty(target, property, context);
		assert.equal(Test.foo.get(target), 'bar');
	});

	QUnit.asyncTest('set a property to a function generator', function (assert) {
		function Test() {};
		Test.prototype.foo = Property.define();
		var generator = xo.options.compileString("{ 1+2 }");
		var target = new Test(),
			property = { name: 'foo', value: generator },
			context = {};
		xo.options.setProperty(target, property, context);
		setTimeout(function () {
			assert.equal(target.foo(), 3);
			QUnit.start();
		}, 10);
	});

	QUnit.asyncTest('set a property to a function generator (delegated)', function (assert) {
		function Test() {};
		Test.foo = new Property();
		var generator = xo.options.compileString("{ 1+2 }");
		var target = {}, 
			property = { name: 'foo', value: generator, module: Test },
			context = {};
		xo.options.setProperty(target, property, context);
		setTimeout(function () {
			assert.equal(Test.foo.get(target), 3);
			QUnit.start();
		}, 10);
	});

	QUnit.asyncTest('set a property to a relative path', function (assert) {
		function Test() {};
		Test.prototype.foo = Property.define();
		Test.prototype.bar = 'test';
		var generator = xo.options.compileString("{ this.bar }");
		var target = new Test(), 
			property = { name: 'foo', value: generator },
			context = {};
		xo.options.setProperty(target, property, context);
		setTimeout(function () {
			assert.equal(target.foo(), 'test');
			QUnit.start();
		}, 10);
	});

	QUnit.asyncTest('set a property to a relative path (delegated)', function (assert) {
		function Test() {};
		Test.foo = new Property();
		var generator = xo.options.compileString("{ this.bar }");
		var target = { bar: 'test' }, 
			property = { name: 'foo', value: generator, module: Test }
			context = {};
		xo.options.setProperty(target, property, context);
		setTimeout(function () {
			assert.equal(Test.foo.get(target), 'test');
			QUnit.start();
		}, 10);
	});

	QUnit.test('set an event to a function name', function (assert) {
		var context = {
			test: function() {
				return 'bar';
			}
		};
		function Test() {};
		Test.prototype.foo = Event.define();
		var target = new Test(), 
			property = { name: 'foo', value: 'test' };
		xo.options.setProperty(target, property, context);
		assert.ok(Event.hasHandler(target, 'foo', context.test, context));
	});

	QUnit.test('set an event to a function name (delegated)', function (assert) {
		var context = {
			test: function() {
				return 'bar';
			}
		};
		function Test() {};
		Test.foo = new Event();
		var target = {}, 
			property = { name: 'foo', value: 'test', module: Test };
		xo.options.setProperty(target, property, context);
		assert.ok(Event.hasHandler(target, Test.foo, context.test, context));
	});

	QUnit.test('set children to an array', function (assert) {
		var obj = {
			content: xo.property(),
			contentCollection: 'content'
		};
		var children = ['foo'];
		xo.options.setChildren(obj, children);
		assert.equal(obj.content(), children);
	});

	QUnit.test('set children to a string', function (assert) {
		var obj = {
			content: xo.property(),
			contentProperty: 'content'
		};
		var children = ['foo'];
		xo.options.setChildren(obj, children);
		assert.equal(obj.content(), 'foo');
	});


});

	
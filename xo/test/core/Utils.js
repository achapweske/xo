define(['QUnit', 'src/core/Utils'], function(QUnit, Utils) {
	QUnit.module('Utils');

	QUnit.test("name() returns the given function's name", function (assert) {
		function foo() {
			return true;
		}
		var result = Utils.nameOf(foo);
		assert.equal(result, 'foo');
	});

	QUnit.test("instanceOf() works for built-in types", function(assert) {
		assert.ok(Utils.instanceOf(new Array(), Array));
		assert.ok(Utils.instanceOf(new Boolean(), Boolean));
		assert.ok(Utils.instanceOf(new Boolean(true), Boolean));
		assert.ok(Utils.instanceOf(new Boolean(false), Boolean));
		assert.ok(Utils.instanceOf(new Date(), Date));
		assert.ok(Utils.instanceOf(new Error(), Error));
		assert.ok(Utils.instanceOf(new TypeError(), Error));
		assert.ok(Utils.instanceOf(new Object(), Object));
		assert.ok(Utils.instanceOf(new Function(), Function));
		assert.ok(Utils.instanceOf(new Number(), Number));
		assert.ok(Utils.instanceOf(new Number(-1), Number));
		assert.ok(Utils.instanceOf(new Number(0), Number));
		assert.ok(Utils.instanceOf(new Number(1), Number));
		assert.ok(Utils.instanceOf(new RegExp(), RegExp));
		assert.ok(Utils.instanceOf(new String(), String));
	});

	QUnit.test("instanceOf() works for primitive types", function(assert) {
		assert.ok(Utils.instanceOf([], Array));
		assert.ok(Utils.instanceOf(true, Boolean));
		assert.ok(Utils.instanceOf(false, Boolean));
		assert.ok(Utils.instanceOf(function () { return 1; }, Function));
		assert.ok(Utils.instanceOf(0, Number));
		assert.ok(Utils.instanceOf(1, Number));
		assert.ok(Utils.instanceOf(-1, Number));
		assert.ok(Utils.instanceOf({}, Object));
		assert.ok(Utils.instanceOf(/.*/, RegExp));
		assert.ok(Utils.instanceOf('', String));
		assert.ok(Utils.instanceOf('test', String));
	});

	QUnit.test("instanceOf() works for custom types", function(assert) {
		function MyClass() { }
		assert.ok(Utils.instanceOf(new MyClass(), MyClass));
	});

	QUnit.test("instanceOf() works for derived custom types", function(assert) {
		function MyClass() { };
		function YourClass() { };
		YourClass.prototype = new MyClass();
		//YourClass.prototype.constructor = YourClass;

		assert.ok(Utils.instanceOf(new YourClass(), YourClass));
		assert.ok(Utils.instanceOf(new YourClass(), MyClass));
	});

});

	
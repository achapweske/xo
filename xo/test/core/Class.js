define(['QUnit', 'src/core/Class'], function(QUnit, Class) {
	QUnit.module('Class');

	QUnit.test("extend: if no constructor is specified, the base class's constructor is automatically called", function(assert) {
		var class1Called = 0;

		var class1 = Class.extend.call(Object, {
			construct: function() {
				class1Called++;
			}
		});

		var class2 = class1.extend({
		});

		var instance = new class2();

		assert.equal(class1Called, 1);
	});

	QUnit.test("extend: $super invokes the base class's implementation of the current method", function(assert) {
		var class1Called = 0,
			class2Called = 0;

		var class1 = Class.extend.call(Object, {
			member: function() {
				class1Called++;
			}
		});

		var class2 = class1.extend({
			member: function($super) {
				class2Called++;
				$super();
			}
		});

		var instance = new class2();
		instance.member();

		assert.equal(class1Called, 1);
		assert.equal(class2Called, 1);
	});

	QUnit.test("extend: $super invokes the base class's constructor", function(assert) {
		var class1Called = 0,
			class2Called = 0;

		var class1 = Class.extend.call(Object, {
			construct: function() {
				class1Called++;
			}
		});

		var class2 = class1.extend({
			construct: function($super) {
				class2Called++;
				$super();
			}
		});

		var instance = new class2();

		assert.equal(class1Called, 1);
		assert.equal(class2Called, 1);
	});

	QUnit.test("extend: The base class's constructor is automatically called if $super is not an argument", function(assert) {
		var class1Called = 0,
			class2Called = 0;

		var class1 = Class.extend.call(Object, {
			construct: function() {
				class1Called++;
			}
		});

		var class2 = class1.extend({
			construct: function() {
				class2Called++;
			}
		});

		var instance = new class2();

		assert.equal(class1Called, 1);
		assert.equal(class2Called, 1);
	});

	QUnit.test("extend: The base class's constructor is not automatically called if $super is an argument", function(assert) {
		var class1Called = 0,
			class2Called = 0;

		var class1 = Class.extend.call(Object, {
			construct: function() {
				class1Called++;
			}
		});

		var class2 = class1.extend({
			construct: function($super) {
				class2Called++;
			}
		});

		var instance = new class2();

		assert.equal(class1Called, 0);
		assert.equal(class2Called, 1);
	});

	QUnit.test("extend: Arguments are properly passed to a method for which $super is defined", function(assert) {
		var actualArg1, actualArg2;

		var class1 = Class.extend.call(Object, {
			member: function(arg1, arg2) {
			}
		});

		var class2 = class1.extend({
			member: function($super, arg1, arg2) {
				actualArg1 = arg1;
				actualArg2 = arg2;
			}
		});

		var instance = new class2();
		instance.member('a', 2);

		assert.strictEqual(actualArg1, 'a');
		assert.strictEqual(actualArg2, 2);
	});

	QUnit.test("extend: Arguments are properly passed to the method invoked by $super()", function(assert) {
		var actualArg1, actualArg2;

		var class1 = Class.extend.call(Object, {
			member: function(arg1, arg2) {
				actualArg1 = arg1;
				actualArg2 = arg2;
			}
		});

		var class2 = class1.extend({
			member: function($super, arg1, arg2) {
				$super(arg1, arg2);
			}
		});

		var instance = new class2();
		instance.member('a', 2);

		assert.strictEqual(actualArg1, 'a');
		assert.strictEqual(actualArg2, 2);
	});

	QUnit.test("extend: Calling $super() invokes the right implementation when multiple levels of inheritance", function(assert) {
		var class1Called = 0,
			class2Called = 0,
			class3Called = 0;

		var class1 = Class.extend.call(Object, {
			member: function() {
				class1Called++;
			}
		});

		var class2 = class1.extend({
			member: function($super) {
				class2Called++;
				$super();
			}
		});

		var class3 = class2.extend({
			member: function($super) {
				class3Called++;
				$super();
			}
		});


		var class3 = new class3();
		class3.member();

		assert.equal(class1Called, 1);
		assert.equal(class2Called, 1);
		assert.equal(class3Called, 1);
	});



});

	
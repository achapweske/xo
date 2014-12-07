define(['QUnit', 'src/core/Property'], function(QUnit, Property) {
	QUnit.module('Property');

	QUnit.test('initial value of a property is undefined if no defaultValue specified', function (assert) {
		var property = new Property(),
			target = {};
		var initialValue = property.get(target);
		assert.ok(typeof initialValue === 'undefined');
	});

	QUnit.test('initial value of a property is its defaultValue if specified', function (assert) {
		var property = new Property({ defaultValue: 'foo' }),
			target = {};
		var initialValue = property.get(target);
		assert.strictEqual(initialValue, 'foo');
	});

	QUnit.test('initial value of a property is undefined if its defaultValue if specified as undefined', function (assert) {
		var property = new Property({ defaultValue: undefined }),
			target = {};
		var initialValue = property.get(target);
		assert.ok(typeof initialValue === 'undefined');
	});

	QUnit.test('get() delegates to getter if specified', function (assert) {
		var target = {};
		var property = new Property({  
			get: function() {
				return 'foo';
			}
		});
		var value = property.get(target);
		assert.strictEqual(value, 'foo');
	});

	QUnit.test('get() sets delegated getter context to target', function (assert) {
		var target = {}, called = 0;
		var property = new Property({  
			get: function() {
				assert.strictEqual(this, target);
				called++;
			}
		});
		property.get(target);
		assert.equal(called, 1);
	});

	QUnit.test('get() throws an exception if a setter is specified but no getter', function (assert) {
		var target = {}, called = 0;
		var property = new Property({  
			set: function(newValue) {
				return;
			}
		});
		assert.throws(function () {
			property.get(target);
		});
	});

	QUnit.test('set() delegates to setter if specified', function (assert) {
		var target = {}, value;
		var property = new Property({  
			set: function(newValue) {
				value = newValue;
			}
		});
		property.set(target, 'foo');
		assert.strictEqual(value, 'foo');
	});

	QUnit.test('set() sets delegated setter context to target', function (assert) {
		var target = {}, called = 0;
		var property = new Property({  
			set: function() {
				assert.strictEqual(this, target);
				called++;
			}
		});
		property.set(target, 'foo');
		assert.equal(called, 1);
	});

	QUnit.test('set() throws exception if getter specified but no setter', function (assert) {
		var target = {}, value;
		var property = new Property({  
			get: function() {
				return 'foo';
			}
		});
		assert.throws(function() {
			property.set(target, 'bar');
		});
	});

	QUnit.test('Event is raised when value changed', function (assert) {
		var target = {}, called = 0;
		var property = new Property();
		property.add(target, function (change) {
			assert.strictEqual(change.newValue, 'foo');
			assert.ok(typeof change.oldValue === 'undefined');
			called++;
		});
		property.set(target, 'foo');
		assert.equal(called, 1);
	});

	QUnit.test('Merely activating a property should not raise an event', function (assert) {
		var target1 = {}, target2 = {}, called = 0;
		var property1 = new Property();
		var property2 = new Property({
			get: function() {
				return property1.get(target1) + 'bar';
			}
		});
		property2.add(target2, function (change) {
			called++;
		});
		assert.equal(called, 0);
	});

	QUnit.test('Event is raised when dependency changed', function (assert) {
		var target1 = {}, target2 = {}, called = 0;
		var property1 = new Property();
		var property2 = new Property({
			get: function() {
				return property1.get(target1) + 'bar';
			}
		});
		var newValue, oldValue;
		property2.add(target2, function (change) {
			newValue = change.newValue;
			oldValue = change.oldValue;
			called++;
		});
		property1.set(target1, 'foo');
		assert.equal(called, 1);
		assert.equal(newValue, 'foobar');
		assert.ok(typeof oldValue === 'undefined');
	});

	QUnit.test('changed hook is called when property changes', function (assert) {
		var target = {}, called = 0;
		var property = new Property({
			changed: function(change) {
				called++;
			}
		});
		property.set(target, 'foo');
		assert.equal(called, 1);
	});

	QUnit.test('changed hook is called with target as its context', function (assert) {
		var target = {}, context;
		var property = new Property({
			changed: function() {
				context = this
			}
		});
		property.set(target, 'foo');
		assert.equal(context, target);
	});

	QUnit.test('changed hook is called with correct newValue/oldValue', function (assert) {
		var target = {}, oldValue, newValue;
		var property = new Property({
			defaultValue: 'foo',
			changed: function(change) {
				oldValue = change.oldValue;
				newValue = change.newValue;
			}
		});
		property.set(target, 'bar');
		assert.equal(oldValue, 'foo');
		assert.equal(newValue, 'bar');
	});

	QUnit.test('getter returns value set in setter', function (assert) {
		var property = new Property(),
			target = {};
		property.set(target, 'foo');
		var value = property.get(target);
		assert.strictEqual(value, 'foo');
	});

	QUnit.test('get value using function interface', function (assert) {
		function Test() {};
		Test.prototype.property = Property.define({ defaultValue: 'foo' });
		var test = new Test();
		var value = test.property();
		assert.strictEqual(value, 'foo');
	});

	QUnit.test('set value using function interface', function (assert) {
		function Test() {};
		Test.prototype.property = Property.define();
		var test = new Test();
		test.property('foo');
		var value = Property.getValue(test, 'property');
		assert.strictEqual(value, 'foo');
	});

	QUnit.test('retrieve a property attribute', function(assert) {
		var property = new Property({
			attributes: { foo: 'bar' }
		});
		assert.ok(property.attributes());
		assert.equal('bar', property.attributes().foo);
	});

	QUnit.test('if no attributes are set, attributes() returns an empty object', function(assert) {
		var property = new Property();
		assert.ok(property.attributes());
	});

	QUnit.test('set property value when type = Array (and value type = Array)', function(assert) {
		var target = {};
		var property = new Property({ 
			type: Array
		});

		var expectedValue = [ 'foo' ];
		property.set(target, expectedValue);
		var actualValue = property.get(target);

		assert.equal(actualValue, expectedValue);
	});

	QUnit.test('throw error when setting an Array property to a non-Array value', function(assert) {
		var target = {}, expectedValue = [];
		var property = new Property({ 
			defaultValue: expectedValue,
			type: Array
		});

		assert.throws(function() {
			property.set(target, 'foo');			
		}, TypeError);
		var actualValue = property.get(target);

		assert.equal(actualValue, expectedValue);
	});

	QUnit.test('set property value when type = String (and value type = String)', function(assert) {
		var target = {};
		var property = new Property({ 
			type: String
		});

		var expectedValue = 'foo';
		property.set(target, expectedValue);
		var actualValue = property.get(target);

		assert.equal(actualValue, expectedValue);
	});

	QUnit.test('throw error when setting an String property to a non-String value', function(assert) {
		var target = {}, expectedValue = 'foo';
		var property = new Property({ 
			defaultValue: expectedValue,
			type: String
		});

		assert.throws(function() {
			property.set(target, [ 'bar' ]);			
		}, TypeError);
		var actualValue = property.get(target);

		assert.equal(actualValue, expectedValue);
	});


});

	
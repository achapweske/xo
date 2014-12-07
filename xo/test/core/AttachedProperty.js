define(['QUnit', 'src/core/AttachedProperty'], function(QUnit, AttachedProperty) {
	QUnit.module('AttachedProperty');

	QUnit.test('get() sets delegated getter context to property', function (assert) {
		var target = {}, called = 0, actualContext;
		var property = new AttachedProperty({  
			get: function() {
				actualContext = this;
				called++;
			}
		});
		property.get(target);
		assert.equal(called, 1);
		assert.equal(actualContext, property);
	});

	QUnit.test('get() passes target as 1st parameter delegated getter', function (assert) {
		var target = {}, called = 0, actualTarget;
		var property = new AttachedProperty({  
			get: function(param1) {
				actualTarget = param1;
				called++;
			}
		});
		property.get(target);
		assert.equal(called, 1);
		assert.equal(actualTarget, target);
	});

	QUnit.test('set() sets delegated setter context to property', function (assert) {
		var target = {}, called = 0, actualContext;
		var property = new AttachedProperty({  
			set: function() {
				actualContext = this;
				called++;
			}
		});
		property.set(target, 'foo');
		assert.equal(called, 1);
		assert.equal(actualContext, property);
	});

	QUnit.test('set() passes target as 1st parameter delegated setter', function (assert) {
		var target = {}, called = 0, actualTarget;
		var property = new AttachedProperty({  
			set: function(param1) {
				actualTarget = param1;
				called++;
			}
		});
		property.set(target, 'foo');
		assert.equal(called, 1);
		assert.equal(actualTarget, target);
	});

	QUnit.test('changed() hook has context set to property', function (assert) {
		var target = {}, called = 0, actualContext;
		var property = new AttachedProperty({  
			changed: function() {
				actualContext = this;
				called++;
			}
		});
		property.set(target, 'foo');
		assert.equal(called, 1);
		assert.equal(actualContext, property);
	});

	QUnit.test('changed() hook receives target as 1st parameter', function (assert) {
		var target = {}, called = 0, actualTarget;
		var property = new AttachedProperty({  
			changed: function(param1) {
				actualTarget = param1;
				called++;
			}
		});
		property.set(target, 'foo');
		assert.equal(called, 1);
		assert.equal(actualTarget, target);
	});

	
});

	
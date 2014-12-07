define(['QUnit', 'src/core/RelativeProperty', 'src/core/Property'], function(QUnit, RelativeProperty, Property) {
	QUnit.module('RelativeProperty');

	QUnit.test('Get a plain javascript property using a 1-segment path', function (assert) {
		var property = new RelativeProperty({ path: 'test' });
		var target = { test: 'foo' };
		var result = property.get(target, property);
		assert.equal(result, 'foo');
	});

	QUnit.test('Get a Property object value using a 1-segment path', function (assert) {
		var obj = { 
			test: Property.define({ 
				defaultValue: 'foo' 
			}) 
		};
		var property = new RelativeProperty({ path: 'test' });
		var result = property.get(obj, property);
		assert.equal(result, 'foo');
	});

	QUnit.test('Get a plain javascript property using a 2-segment path', function (assert) {
		var obj = { 
			test: {
				toast: 'foo'
			} 
		};
		var property = new RelativeProperty({ path: 'test.toast' });
		var result = property.get(obj, property);
		assert.equal(result, 'foo');
	});

	QUnit.test('Get a Property object value using a 2-segment path', function (assert) {
		var obj1 = {
			toast: Property.define({
				defaultValue: 'foo'	
			})
		}
		var obj2 = { 
			test: Property.define({ 
				defaultValue: obj1
			})
		};
		var property = new RelativeProperty({ path: 'test.toast' });
		var result = property.get(obj2, property);
		assert.equal(result, 'foo');
	});

	QUnit.test('Set a plain javascript property using a 1-segment path', function (assert) {
		var property = new RelativeProperty({ path: 'test' });
		var target = { test: 'foo' };
		property.set(target, 'bar');
		assert.equal(target.test, 'bar');
	});

	QUnit.test('Set a Property object value using a 1-segment path', function (assert) {
		var obj = { 
			test: Property.define({ 
				defaultValue: 'foo' 
			}) 
		};
		var property = new RelativeProperty({ path: 'test' });
		property.set(obj, 'bar');
		assert.equal(obj.test(), 'bar');
	});
});

	
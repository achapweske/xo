define(['QUnit', 'src/core/Binding', 'src/core/Property'], function(QUnit, Binding, Property) {
	QUnit.module('Binding');

	QUnit.test('A source change triggers a target change', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		sourceProperty.set(sourceObject, 'foo');
		var value = targetProperty.get(targetObject);
		assert.equal(value, 'foo');
	});

	QUnit.test('A source change triggers a target change when direction = Both', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject,
				direction: Binding.Directions.Both
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		sourceProperty.set(sourceObject, 'foo');
		var value = targetProperty.get(targetObject);
		assert.equal(value, 'foo');
	});

	QUnit.test('A source change triggers a target change when direction = UpdateTarget', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject,
				direction: Binding.Directions.UpdateTarget
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		sourceProperty.set(sourceObject, 'foo');
		var value = targetProperty.get(targetObject);
		assert.equal(value, 'foo');
	});

	QUnit.test('A source change does NOT trigger a target change when direction = UpdateSource', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject,
				direction: Binding.Directions.UpdateSource
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		sourceProperty.set(sourceObject, 'foo');
		var value = targetProperty.get(targetObject);
		assert.ok(typeof value === 'undefined');
	});

	QUnit.test('A target change triggers a source change', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		targetProperty.set(targetObject, 'foo');
		var value = sourceProperty.get(sourceObject);
		assert.equal(value, 'foo');
	});

	QUnit.test('A target change triggers a source change when direction = Both', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject,
				direction: Binding.Directions.Both
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		targetProperty.set(targetObject, 'foo');
		var value = sourceProperty.get(sourceObject);
		assert.equal(value, 'foo');
	});

	QUnit.test('A target change triggers a source change when direction = UpdateSource', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject,
				direction: Binding.Directions.UpdateSource
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		targetProperty.set(targetObject, 'foo');
		var value = sourceProperty.get(sourceObject);
		assert.equal(value, 'foo');
	});

	QUnit.test('A target change does NOT trigger a source change when direction = UpdateTarget', function (assert) {
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject,
				direction: Binding.Directions.UpdateTarget
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		targetProperty.set(targetObject, 'foo');
		var value = sourceProperty.get(sourceObject);
		assert.ok(typeof value === 'undefined');
	});

QUnit.test('A source change triggers a target change when source property is a function', function (assert) {
		function Test() {}
		Test.prototype.property = Property.define();
		var sourceProperty = Test.prototype.property,
			sourceObject = new Test(),
			targetProperty = new Property(),
			targetObject = {},
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		sourceObject.property('foo');
		var value = targetProperty.get(targetObject);
		assert.equal(value, 'foo');
	});

	QUnit.test('A source change triggers a target change when target property is a function', function (assert) {
		function Test() {}
		Test.prototype.property = Property.define();
		var sourceProperty = new Property(),
			sourceObject = {},
			targetProperty = Test.prototype.property,
			targetObject = new Test(),
			binding = new Binding({ 
				property: sourceProperty,
				source: sourceObject
			});
		Binding.setBinding(targetObject, targetProperty, binding);
		sourceProperty.set(sourceObject, 'foo');
		var value = targetObject.property();
		assert.equal(value, 'foo');
	});

});

	
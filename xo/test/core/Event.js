define(['QUnit', 'src/core/Event'], function(QUnit, Event) {
	QUnit.module('Event');

	QUnit.test('Event callback is called with the given context', function (assert) {
		var event = new Event(), target = {}, context = {}, called = 0;
		var actualContext;
		function callback() {
			actualContext = this;
			called++;
		}
		event.add(target, callback, context);
		event.raise(target);
		assert.equal(called, 1);
		assert.strictEqual(actualContext, context);
	});

	QUnit.test('Event callback is called with target as the default context', function (assert) {
		var event = new Event(), target = {}, called = 0;
		var actualContext;
		function callback() {
			actualContext = this;
			called++;
		}
		event.add(target, callback);
		event.raise(target);
		assert.equal(called, 1);
		assert.strictEqual(actualContext, target);
	});

	QUnit.test('Event passes arguments to callback', function (assert) {
		var event = new Event(), target = {}, context = {}, called = 0,
			arg1 = {}, arg2 = {}, arg3 = {}, arg4 = {}, arg5 = {};
		var actualArguments;
		function callback() {
			actualArguments = Array.prototype.slice.call(arguments, 0);
			called++;
		}
		event.add(target, callback);
		event.raise(target, arg1, arg2, arg3, arg4, arg5);
		assert.equal(called, 1);
		assert.strictEqual(actualArguments.length, 5);
		assert.strictEqual(actualArguments[0], arg1);
		assert.strictEqual(actualArguments[1], arg2);
		assert.strictEqual(actualArguments[2], arg3);
		assert.strictEqual(actualArguments[3], arg4);
		assert.strictEqual(actualArguments[4], arg5);
	});

	QUnit.test('Add multiple callbacks with different contexts', function (assert) {
		var event = new Event(), target = {}, 
			context1 = {}, called1 = 0,
			context2 = {}, called2 = 0;
		function callback1() {
			assert.strictEqual(this, context1);
			called1++;
		}
		function callback2() {
			assert.strictEqual(this, context2);
			called2++;
		}
		event.add(target, callback1, context1);
		event.add(target, callback2, context2);
		event.raise(target);
		assert.equal(called1, 1);
		assert.equal(called2, 1);
	});

	QUnit.test('Add same callback with multiple contexts', function (assert) {
		var event = new Event(), target = {}, 
			context1 = { called: 0 }, context2 = { called: 0 }, 
			called = 0;
		function callback() {
			this.called++;
			called++;
		}
		event.add(target, callback, context1);
		event.add(target, callback, context2);
		event.raise(target);
		assert.equal(called, 2);
		assert.equal(context1.called, 1);
		assert.equal(context2.called, 1);
	});

	QUnit.test('Add multiple callbacks with same context', function (assert) {
		var event = new Event(), target = {}, 
			called1 = 0, called2 = 0,
			context = {};
		function callback1() {
			assert.strictEqual(this, context);
			called1++;
		}
		function callback2() {
			assert.strictEqual(this, context);
			called2++;
		}
		event.add(target, callback1, context);
		event.add(target, callback2, context);
		event.raise(target);
		assert.equal(called1, 1);
		assert.equal(called2, 1);
	});

	QUnit.test('Add a callback multiple times', function (assert) {
		var event = new Event(), target = {}, called = 0;
		function callback() {
			called++;
		}
		event.add(target, callback);
		event.add(target, callback);
		event.raise(target);
		assert.equal(called, 2);
	});

	QUnit.test('Raise an event multiple times', function (assert) {
		var event = new Event(), target = {}, called = 0;
		function callback() {
			called++;
		}
		event.add(target, callback);
		event.raise(target);
		event.raise(target);
		assert.equal(called, 2);
	});

	QUnit.test('Remove the specified callback+context', function (assert) {
		var event = new Event(), target = {}, called1 = 0, called2 = 0,
			context1 = { called: 0 }, context2 = { called: 0 };
		function callback1() {
			assert.strictEqual(this, context2);
			this.called++;
			called1++;
		}
		function callback2() {
			assert.ok(this === context1 || this === context2);
			this.called++;
			called2++;
		}
		event.add(target, callback1, context1);
		event.add(target, callback1, context2);
		event.add(target, callback2, context1);
		event.add(target, callback2, context2);
		event.remove(target, callback1, context1);
		event.raise(target);
		assert.equal(called1, 1);
		assert.equal(called2, 2);
		assert.equal(context1.called, 1);
		assert.equal(context2.called, 2);
	});

	QUnit.test('Remove the specified callback for all contexts', function (assert) {
		var event = new Event(), target = {}, called1 = 0, called2 = 0,
			context1 = { called: 0 }, context2 = { called: 0 };
		function callback1() {
			called1++;
		}
		function callback2() {
			assert.ok(this === context1 || this === context2);
			this.called++;
			called2++;
		}
		event.add(target, callback1, context1);
		event.add(target, callback1, context2);
		event.add(target, callback2, context1);
		event.add(target, callback2, context2);
		event.remove(target, callback1);
		event.raise(target);
		assert.equal(called1, 0);
		assert.equal(called2, 2);
		assert.equal(context1.called, 1);
		assert.equal(context2.called, 1);
	});

	QUnit.test('Remove all callbacks for all contexts', function (assert) {
		var event = new Event(), target = {}, called1 = 0, called2 = 0,
			context1 = {}, context2 = {};
		function callback1() {
			called1++;
		}
		function callback2() {
			called2++;
		}
		event.add(target, callback1, context1);
		event.add(target, callback1, context2);
		event.add(target, callback2, context1);
		event.add(target, callback2, context2);
		event.remove(target);
		event.raise(target);
		assert.equal(called1, 0);
		assert.equal(called2, 0);
	});

	QUnit.test('activate() is called when the first callback is added', function (assert) {
		var target = {}, activated = 0;
		var event = new Event({
			activate: function() {
				assert.strictEqual(this, target);
				activated++;
			}
		});
		event.add(target, function() {});
		assert.equal(activated, 1);
	});

	QUnit.test('activate() is not called when a callback has already been added', function (assert) {
		var target = {}, activated = 0;
		var event = new Event({
			activate: function() {
				activated++;
			}
		});
		event.add(target, function() {});
		event.add(target, function() {});
		assert.equal(activated, 1);
	});

	QUnit.test('inactivate() is called when the last callback is removed', function (assert) {
		var target = {}, inactivated = 0;
		var event = new Event({
			inactivate: function() {
				assert.strictEqual(this, target);
				inactivated++;
			}
		});
		var callback = function() {};
		event.add(target, callback);
		event.remove(target, callback);
		assert.equal(inactivated, 1);
	});

	QUnit.test('inactivate() is not called when the last callback has not been removed', function (assert) {
		var target = {}, inactivated = 0;
		var event = new Event({
			inactivate: function() {
				inactivated++;
			}
		});
		var callback1 = function() {}, callback2 = function() {};
		event.add(target, callback1);
		event.add(target, callback2);
		event.remove(target, callback1);
		assert.equal(inactivated, 0);
	});

	QUnit.test('raise hook is called when raise() is called (and no handlers are registered)', function (assert) {
		var target = { raised: 0 }, raised = 0;
		var event = new Event({
			raised: function() {
				raised++;
				this.raised++;
			}
		});
		Event.raiseEvent(target, event);
		assert.equal(raised, 1);
		assert.equal(target.raised, 1);
	});


	QUnit.test('Add callback to a function event', function (assert) {
		function Test() { };
		Test.prototype.event = Event.define();
		var test = new Test(), context = {}, called = 0;
		function callback() {
			assert.strictEqual(this, context);
			called++;
		}
		Event.addHandler(test, 'event', callback, context);
		test.event();
		assert.equal(called, 1);
	});

	QUnit.test('Remove callback from a function event', function (assert) {
		function Test() { };
		Test.prototype.event = Event.define();
		var test = new Test(), context1 = {}, context2 = {}, called1 = 0, called2 = 0;
		function callback1() {
			assert.strictEqual(this, context1);
			called1++;
		}
		function callback2() {
			assert.strictEqual(this, context2);
			called2++;
		}
		Event.addHandler(test, 'event', callback1, context1);
		Event.addHandler(test, 'event', callback2, context2);
		Event.removeHandler(test, 'event', callback1, context1);
		test.event();
		assert.equal(called1, 0);
		assert.equal(called2, 1);
	});

	QUnit.test('Raise event using function api', function (assert) {
		function Test() { };
		Test.prototype.event = Event.define();
		var test = new Test(), context = {}, called = 0;
		function callback() {
			assert.strictEqual(this, context);
			called++;
		}
		Event.addHandler(test, 'event', callback, context);
		test.event();
		assert.equal(called, 1);
	});

	QUnit.test('Raise event using function api with arguments', function (assert) {
		function Test() { };
		Test.prototype.event = Event.define();
		var test = new Test(), context = {}, called = 0,
			arg1 = {}, arg2 = {}, arg3 = {}, arg4 = {}, arg5 = {},
			actualArguments;
		function callback() {
			actualArguments = Array.prototype.slice.call(arguments, 0);
			called++;
		}
		Event.addHandler(test, 'event', callback, context);
		test.event(arg1, arg2, arg3, arg4, arg5);
		assert.equal(called, 1);
		assert.strictEqual(actualArguments.length, 5);
		assert.strictEqual(actualArguments[0], arg1);
		assert.strictEqual(actualArguments[1], arg2);
		assert.strictEqual(actualArguments[2], arg3);
		assert.strictEqual(actualArguments[3], arg4);
		assert.strictEqual(actualArguments[4], arg5);
	});
});

	
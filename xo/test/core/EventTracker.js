define(['QUnit', 'src/core/EventTracker', 'src/core/Event'], function(QUnit, EventTracker, Event) {
	QUnit.module('EventTracker');

	QUnit.test('track() calls the function with the given context', function (assert) {
		var event = new Event(), target = {}, context = {}, called = false,
			actualContext;
		function fn() {
			actualContext = this;
			called = true;
		}
		EventTracker.observe(target, event, fn, context);
		assert.ok(called);
		assert.strictEqual(actualContext, context);
	});

	QUnit.test('track() returns an empty tracker when no dependencies', function (assert) {
		var event = new Event(), target = {};
		function fn() {
			return;
		}
		var tracker = EventTracker.observe(target, event, fn);
		assert.ok(!tracker.hasDependency());
	});

	QUnit.test('track a single event', function (assert) {
		var event1 = new Event(), event2 = new Event(),
			target1 = {}, target2 = {};
		var tracker = EventTracker.observe(target1, event1, function () {
			EventTracker.track(target2, event2);
		});
		assert.ok(tracker.hasDependency(target2, event2));
		assert.equal(event1.count(target1), 0);
		assert.equal(event2.count(target2), 1);
	});

	QUnit.test('track multiple events', function (assert) {
		var event1 = new Event(), event2 = new Event(), event3 = new Event(),
			target1 = {}, target2 = {}, target3 = {};
		var tracker = EventTracker.observe(target1, event1, function () {
			EventTracker.track(target2, event2);
			EventTracker.track(target3, event3);
		});
		assert.ok(tracker.hasDependency(target2, event2));
		assert.ok(tracker.hasDependency(target3, event3));
		assert.equal(event1.count(target1), 0);
		assert.equal(event2.count(target2), 1);
		assert.equal(event3.count(target3), 1);
	});

	QUnit.test('track an event multiple times', function (assert) {
		var event1 = new Event(), event2 = new Event(),
			target1 = {}, target2 = {};
		var tracker = EventTracker.observe(target1, event1, function () {
			EventTracker.track(target2, event2);
			EventTracker.track(target2, event2);
		});
		assert.ok(tracker.hasDependency(target2, event2));
		assert.equal(event1.count(target1), 0);
		assert.equal(event2.count(target2), 1);
	});

	QUnit.test('untrack an event', function (assert) {
		var event1 = new Event(), event2 = new Event(),
			target1 = {}, target2 = {};
		EventTracker.observe(target1, event1, function () {
			EventTracker.track(target2, event2);
		});
		var tracker = EventTracker.observe(target1, event1, function () {
			return;
		});
		assert.ok(!tracker.hasDependency(target2, event2));
		assert.equal(event1.count(target1), 0);
		assert.equal(event2.count(target2), 0);
	});

	QUnit.test('raising a tracked event invokes the listening event', function (assert) {
		var event1 = new Event(), event2 = new Event(),
			target1 = {}, target2 = {};
		EventTracker.observe(target1, event1, function () {
			EventTracker.track(target2, event2);
		});
		var raised = 0;
		event1.add(target1, function () {
			raised++;
		});
		event2.raise(target2);

		assert.equal(raised, 1);
	});

	QUnit.test('raising a tracked event invokes the listening callback', function (assert) {
		var event = new Event(), target = {}, called = 0, context = { called: 0 };
		function callback() {
			called++;
			this.called++;
		}
		EventTracker.observe(context, callback, function () {
			EventTracker.track(target, event);
		});
		event.raise(target);

		assert.equal(called, 1);
		assert.equal(context.called, 1);
	});

});

	
define(['./Utils', './PropertyTarget', './EventTarget'], function (Utils, PropertyTarget, EventTarget) {
	return PropertyTarget.extend().mixin(EventTarget);
});
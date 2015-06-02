define(['xo', './ContentControl'], function (xo, ContentControl) {

	return ContentControl.extend({

		construct: function ScrollViewer(options) {

			// IE7: if descendant has position:overflow, soo too must this element if overflow is to work properly
			this.dom.css('position', 'relative');

			this.setDefaultValue('defaultStyleKey', 'ScrollViewer');
			this.setDefaultValue('horizontalScrollBarVisibility', 'auto');
			this.setDefaultValue('verticalScrollBarVisibility', 'auto');
			this.setDefaultValue('width', '100%');
			this.setDefaultValue('height', '100%');

			this.initialize(options);
		},

		extentHeight: xo.property({
			get: function() {
				return this.dom.prop('scrollHeight');
			}
		}),

		extentWidth: xo.property({
			get: function() {
				return this.dom.prop('scrollWidth');
			}
		}),

		horizontalOffset: xo.property({
			get: function() {
				return this.dom.prop('scrollLeft');
			},
			set: function(newValue) {
				this.dom.prop('scrollLeft', newValue)
			}
		}),

		horizontalScrollBarVisibility: xo.property({
			changed: function(change) {
				this.dom.css('overflow-x', change.newValue);
			}
		}),

		scrollableHeight: xo.property({
			get: function() {
				return Math.max(0, this.extentHeight() - this.viewportHeight());
			}
		}),

		scrollableWidth: xo.property({
			get: function() {
				return Math.max(0, this.extentWidth() - this.viewportWidth());
			}
		}),

		verticalOffset: xo.property({
			get: function() {
				return this.dom.prop('scrollTop');
			},
			set: function(newValue) {
				this.dom.prop('scrollTop', newValue);
			}
		}),

		verticalScrollBarVisibility: xo.property({
			changed: function(change) {
				this.dom.css('overflow-y', change.newValue);
			}
		}),

		viewportHeight: xo.property({
			get: function() {
				return this.dom.prop('clientHeight');
			}
		}),

		viewportWidth: xo.property({
			get: function() {
				return this.dom.prop('clientWidth');
			}
		}),

		onApplyTemplate: function(templateInstance) {

		}
	});

});
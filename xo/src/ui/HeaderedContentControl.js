define(['xo', './ContentControl'], function (xo, ContentControl) {

	/**
	 * An item with a header and content data.
	 */
	return ContentControl.extend({

		construct: function HeaderedContentControl(options) {
			this.initialize(options);
		},
		
		/**
		 * Data representing the header portion of this control
		 * @type {[type]}
		 */
		header: xo.property(),

		/**
		 * A data template for rendering the header
		 * @type {Template}
		 */
		headerTemplate: xo.property(),

		/**
		 * A function for selecting the header template.
		 *
		 * This is ignored if headerTemplate is set.
		 * @type {Function}
		 */
		headerTemplateSelector: xo.property()
	});
});
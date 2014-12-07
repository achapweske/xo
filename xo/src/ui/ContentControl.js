define(['xo', './Control', 'xo!./ContentControl.xml'], function (xo, Control, defaultTemplate) {

	/**
	 * A control with content data.
	 *
	 * Two templates control the rendering of this control:
	 * 1) The control template specifies the high-level presentation. It should
	 *    include a ContentPresenter bound to the control's content property.
	 * 2) The content data template specifies the presentation of the content
	 *    data. This is rendered by a ContentPresenter bound to the content 
	 *    property, as specified in the control template.
	 *
	 * The content can be either a Visual or a plain object. If no content 
	 * template is specified, it will be treated as a Visual and rendered 
	 * directly by the ContentPresenter. If a content template is specified,
	 * an instance of that template will be bound to the content and rendered
	 * by the ContentPresenter.
	 */
	return Control.extend({
		construct: function ContentControl() {
			Control.call(this);
			this.setDefaultValue('template', defaultTemplate);
		},

		contentProperty: 'content',

		/**
		 * Content to be rendered in this control
		 * @type {[type]}
		 */
		content: xo.property(),

		/**
		 * A template for rendering the content
		 * @type {Template}
		 */
		contentTemplate: xo.property(),

		/**
		 * A function for selecting the content template.
		 *
		 * This is ignored if contentTemplate is set.
		 * @type {Function}
		 */
		contentTemplateSelector: xo.property()

	});
});
define(['xo', './Visual', './Widget', './Template'], function (xo, Visual, Widget, Template) {
	var ContentPresenter = Widget.extend({

		construct: function ContentPresenter(options) {
			Widget.call(this, options);
		},

		contentProperty: 'content',

		content: xo.property(),

		contentTemplate: xo.property({
			type: xo.Template
		}),
		
		contentTemplateSelector: xo.property({
			type: Function
		}),

		/*
		 * Get the template to use for rendering the content
		 *
		 * 1) If contentTemplate is specified, use that
		 * 2) If contentTemplateSelector is set and returns a template, use that
		 * 3) Otherwise, use the template returned by defaultTemplatePresenter
		 */
		chooseTemplate: function(item, container) {
			var contentTemplate = this.contentTemplate();
			if (contentTemplate) {
				return contentTemplate;
			}
			var contentTemplateSelector = this.contentTemplateSelector();
			if (contentTemplateSelector) {
				contentTemplate = contentTemplateSelector.selectTemplate(item, container);
				if (contentTemplate) {
					return contentTemplate;
				}
			}
			return ContentPresenter.defaultTemplateSelector(item, container);
		},

		onRender: function() {
			var content = this.content();

			// select a template based on contentTemplate(Selector)
			// 
			var lastTemplate = this._chosenTemplate;
			this._chosenTemplate = this.chooseTemplate(content, this);
			if (!this._chosenTemplate) {
				console.warn('ContentPresenter: no content template selected');
				return;
			}

			// if the template hasn't changed, update existing instance
			//
			if (this._chosenTemplate === lastTemplate) {
				if (this._templateInstance) {
					this._templateInstance.data(content);
				}
				return;
			}

			// The template has changed - create a new instance
			//
			this._templateInstance = this._chosenTemplate.create(function(result) {
				// pre-binding initialization
				result.control(this);
				result.data(content);
			}, this);

			var visualTree = this._templateInstance.visualTree();
			this._visualRoot(visualTree);
		},


		_visualRoot: xo.property({
			changed: function(change) {
				if (change.newValue) {
					this.visualChildren().reset([ change.newValue ]);
				}
				else {
					this.visualChildren().clear();
				}
			}
		}),

		onVisualChildAdded: function(newChild, index) {
			if (newChild instanceof Widget) {
				newChild.minHeight(this.minHeight());
				newChild.minWidth(this.minWidth());
			}
			Widget.prototype.onVisualChildAdded.apply(this, arguments);
		},

		onVisualChildRemoved: function(oldChild) {
			Widget.prototype.onVisualChildRemoved.apply(this, arguments);
			if (oldChild instanceof Widget) {
				//
			}
		}
	});

	/*
	 * A light-weight visual for rendering text
	 */
	var TextPresenter = Visual.extend({
		construct: function TextPresenter() {
			Visual.call(this, document.createElement('span'));
			this.dom.css('line-height', 'normal');
		},
		text: xo.property({
			changed: function(change) {
				this.dom.text(change.newValue);
			}
		})
	});

	/*
	 * A template for rendering content as a Visual
	 */
	var VisualTemplate = xo.Template.extend({
		construct: function VisualTemplate() { },
		create: function(initCallback, initContext) {
			var templateInstance = new Template();
			templateInstance.visualTree(initContext.content());
			if (initCallback) initCallback.call(initContext, templateInstance);
			return templateInstance;
		}
	});

	ContentPresenter.visualTemplate = new VisualTemplate();

	/*
	 * A template for rendering content as text
	 */
	var DefaultTemplate = xo.Template.extend({
		construct: function DefaultTemplate() { },
		create: function(initCallback, initContext) {
			var templateInstance = new Template(),
				textPresenter = new TextPresenter(),
				binding = new xo.Binding({ source: templateInstance, property: templateInstance.data });
			// bind textPresenter.text to templateInstance.data
			xo.Binding.setBinding(textPresenter, textPresenter.text, binding);			
			templateInstance.visualTree(textPresenter);
			if (initCallback) initCallback.call(initContext, templateInstance);
			return templateInstance;
		}
	});

	ContentPresenter.defaultTemplate = new DefaultTemplate();

	ContentPresenter.defaultTemplateSelector = function(item, container) {
		if (item instanceof Visual) {
			return ContentPresenter.visualTemplate;
		}
		else {
			return ContentPresenter.defaultTemplate;
		}
	};

	return ContentPresenter;
});
define(['xo', './Widget'], function (xo, Widget) {
	return Widget.extend({
		construct: function Control(options) {
			Widget.call(this, options);
		},

		background: xo.property({
			defaultValue: 'transparent'
		}),

		borderColor: xo.property({
			defaultValue: ''
		}),

		borderRadius: xo.property({
			defaultValue: 0
		}),

		borderWidth: xo.property({
			defaultValue: 0
		}),

		horizontalContentAlignment: xo.property({
			defaultValue: 'left'
		}),

		minHeight: xo.property({
			changed: function(change) {
				this._visualRoot() && this._visualRoot().minHeight(change.newValue);
			}
		}),

		minWidth: xo.property({
			changed: function(change) {
				this._visualRoot() && this._visualRoot().minWidth(change.newValue);
			}
		}),

		padding: xo.property(),

		verticalContentAlignment: xo.property({
			defaultValue: 'top'
		}),

		// template:

		template: xo.property({
			type: xo.Template
		}),

		applyTemplate: function() {
			xo.ignore(function () {

				var template = this.template();
				if (!template) {
					xo.warn('no template defined for ' + this);
					return;
				}

				// create a new template instance
				var templateInstance = template.create(function(result) {
					// pre-binding initialization
					result.control(this);
				}, this);
				
				// give subclasses an opportunity to process the new tempate instance
				this.onApplyTemplate(templateInstance);

				var visualRoot = templateInstance.visualTree();
				if (!visualRoot) {
					xo.warn('no visual tree defined for template "' + templateInstance + '"');
					return;
				}
				this._visualRoot(visualRoot);

			}, this);
		},

		onRender: function() {
			this.applyTemplate();
		},

		onApplyTemplate: function(templateInstance) {

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
});
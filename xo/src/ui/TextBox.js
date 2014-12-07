define(['xo', './Control'], function (xo, Control) {
	
	return Control.extend({

		construct: function TextBox() {
			Control.call(this);
			this._textarea = xo({
				tagName: 'textarea',
				attributes: { rows: 1 },
				style: {
					'display': 'block',
					'text-align': 'left',
					'font-family': 'inherit',
					'font-size': 'inherit',
					'resize': 'none',
					'border-style': 'none',
					'border-width': '0',	// IE7: border visible when border-style=none unless border-width=0
					'margin': '0',
					'padding': '0',
					'width': '100%',
					'height': '100%',
					// FF32: pads bottom and right sides to make room for scrollbar unless overflow=hidden
					'overflow': 'hidden'
				}
			});
		},

		contentProperty: 'text',

		minLines: xo.property({
			defaultValue: 1,
			changed: function(change) {
				this._textarea.attr('rows', change.newValue);
			}
		}),

		textAlignment: xo.property({
			defaultValue: 'left',
			changed: function(change) {
				this._textarea.css('text-align', change.newValue);
			}
		}),

		text: xo.property({
			get: function() {
				return this._textarea.val();
			},
			set: function(newValue) {
				this._textarea.val(newValue);
			},
			activate: function() {
				this.dom.on('input', this.onTextChanged, this);
			},
			inactivate: function() {
				this.dom.off('input', this.onTextChanged, this);
			}
		}),

		onTextChanged: function(e) {
			xo.Event.raiseEvent(this, 'text');
		},

		onApplyTemplate: function(templateInstance) {
			var contentHost = templateInstance['part.contentHost'];
			if (contentHost) {
				contentHost.dom.append(this._textarea);
			}
			else {
				this._textarea.remove();
			}
		}

	});

});
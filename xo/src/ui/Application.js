define(['xo', './Dictionary', './Widget'], function (xo, Dictionary, Widget) {
	var Application = xo.Object.extend({

		construct: function() {
			this._viewRoot = this._createViewRoot(window);
			Application._setInstance(this);
		},

		_createViewRoot: function(wnd) {
			wnd.document.documentElement.style.height = '100%';
			var viewRoot = new Widget({ element: wnd.document.body });
			viewRoot.width('100%');
			viewRoot.height('100%');
			viewRoot.margin(0);
			viewRoot.canRender(true);
			return viewRoot;
		},

		definitions: xo.property({
			get: function() {
				return Dictionary.globals.get(this);
			}
		}),

		view: xo.property({
			changed: function(change) {
				if (change.oldValue) {
					this._viewRoot.visualChildren().remove(change.oldValue);
				}
				if (change.newValue) {
					this._viewRoot.visualChildren().append(change.newValue);
				}
			}
		})
	});

	Application.instance = xo.property({
		get: function() {
			return this._instance;
		}
	});

	Application._setInstance = function(newInstance) {
		if (this._instance) {
			throw new Error('More than one Application instance created');
		}
		this._instance = newInstance;
		xo.Event.raiseEvent(this, 'instance', { newValue: newInstance, oldValue: void 0});
	};

	return Application;
});
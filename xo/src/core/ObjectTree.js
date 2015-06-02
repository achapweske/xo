define([], function () {

	var ObjectTree = {
		addChild: function(obj, newChild) {
			var children = obj._xochildren || (obj._xochildren = []);
			children.push(newChild);
			newChild._xoparent = obj;
		},
		getParent: function(obj) {
			return obj._xoparent;
		},
		getChildren: function(obj) {
			return obj._xochildren;
		},
		setIsNameScope: function(obj, isNameScope) {
			if (isNameScope) {
				obj._xonamescope = true;
			}
			else {
				delete obj._xonamescope;
			}
		},
		getIsNameScope: function(obj) {
			return obj._xonamescope;
		},
		getNameScope: function(obj) {
			while (obj) {
				if (obj._xonamescope) {
					return obj;
				}
				obj = obj._xoparent;
			}
		}
	};

	return ObjectTree;
});
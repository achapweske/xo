define([], function () {
	return {
		getAttribute: function(node, name) {
			return node.getAttribute(name);
		},
		setAttribute: function(node, name, value) {
			node.setAttribute(name, value);
		},
		removeAttribute: function(node, name) {
			node.removeAttribute(name);
		},
		getAttributeNS: function(node, ns, name) {
			return node.getAttributeNS(ns, name);
		},
		setAttributeNS: function(node, ns, name, value) {
			node.setAttributeNS(ns, name, value);
		},
		removeAttributeNS: function(node, ns, name) {
			node.removeAttributeNS(ns, name);
		}
	};
});
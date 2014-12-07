define([], function () {
	return {
		getText: function(node) {
			switch (node.nodeType) {
				case 1:
				case 9:
				case 11:
					if (typeof node.textContent === "string") {
						return node.textContent;
					}
					var textContent = '';
					for (node = node.firstChild; node; node = node.nextSibling) {
						textContent += this.getText(node);
					}
					return textContent;
				case 3:
				case 4:
					return node.nodeValue;
				default:
					return '';
			}
		},
		setText: function(node, value) {
			while (node.firstChild ) {
				node.removeChild(node.firstChild);
			}
			var ownerDocument = node.ownerDocument || node;
			var textNode = ownerDocument.createTextNode(value);
			node.appendChild(textNode);
		}
	};
});
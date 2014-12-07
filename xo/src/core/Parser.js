define(['./Utils'], function(Utils) {

	var NodeTypes;
	if (typeof Node !== 'undefined') {
		NodeTypes = Node;
	}
	else {
		// IE6-8
		NodeTypes = {
			ELEMENT_NODE: 1,
			ATTRIBUTE_NODE: 2,
			TEXT_NODE: 3,
			CDATA_SECTION_NODE: 4,
			ENTITY_REFERENCE_NODE: 5,
			ENTITY_NODE: 6,
			PROCESSING_INSTRUCTION_NODE: 7,
			COMMENT_NODE: 8,
			DOCUMENT_NODE: 9,
			DOCUMENT_TYPE_NODE: 10,
			DOCUMENT_FRAGMENT_NODE: 11,
			NOTATION_NODE: 12
		}
	}

	function parse(str, options) {
		options = options || {};
		var type = options.type || 'text/xml';
		str = prepareDocument(str, options);
		var doc;
		if (window.DOMParser) {
			var parser = new DOMParser();
			doc = parser.parseFromString(str, type);
		}
		else {
			doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.async = false;
			doc.loadXML(str);
		}
		var error = doc.documentElement && doc.documentElement.firstChild;
		if (error && error.nodeName === 'parsererror') {
			throw error.textContent;
		}
		return parseDocument(doc, options);
	}

	function prepareDocument(str, options) {
		var xmlToken = new XmlToken(str);
		do {
			if (!xmlToken.next()) {
				return str;
			}
		} while (xmlToken.type !== XmlToken.types.StartTag);

		if (options.modulePaths) {
			for (var key in options.modulePaths) {
				xmlToken.addAttribute('xmlns:' + key, options.modulePaths[key]);				
			}
		}
		
		return xmlToken.toString();
	}

	function parseDocument(doc, options) {
		return parseElement(doc.documentElement, options);
	}

	function parseElement(element, options) {
		var result = {};
		result.moduleName = element.localName || element.baseName;
		if (element.namespaceURI) {
			result.modulePath = element.namespaceURI;
		}
	    parseAttributes(element, result, options);
	    parseChildren(element, result, options);
	    return result;
	}

	function parseAttributes(element, result, options) {
    	var attributes = element.attributes;
    	for (var i = 0; i < attributes.length; i++) {
    		parseAttribute(attributes[i], result, options);
    	}
	}

	function parseAttribute(attr, result, options) {
		if (attr.prefix === 'xmlns' || attr.namespaceURI === 'http://www.w3.org/2000/xmlns/') {
			return;
		}
		
		if (options.parseAttribute) {
			if (options.parseAttribute(attr, result, options)) {
				return;
			}
		}

		var property,
			localName = attr.localName || attr.baseName,
			separatorIndex = localName.indexOf('.');

		if (separatorIndex !== -1) {
			property = { 
				modulePath: attr.namespaceURI,
				moduleName: localName.slice(0, separatorIndex),
				name: localName.slice(separatorIndex + 1), 
				value: attr.value 
			};
		}
		else if (attr.namespaceURI) {
    		property = {
    			modulePath: attr.namespaceURI,
    			name: localName, 
    			value: attr.value 
    		};
		} 
		else {
    		property = { 
    			name: localName, 
    			value: attr.value 
    		};
		}

		if (!result.properties) {
			result.properties = [];
		}
		result.properties.push(property);
	}

	function parseChildren(element, result, options) {
	    if (!element.hasChildNodes()) {
	    	return;
	    }
		var children = element.childNodes;
		if (children.length === 1 && children[0].nodeType == NodeTypes.TEXT_NODE) {
			var text = children[0].nodeValue.trim();
			if (text.length > 0) {
				result.children = result.children || [];
				result.children.push(text);
			}
			return;
		}
		for (var i = 0; i < children.length; i++) {
			parseChild(children[i], result, options);
		}
	}

	function parseChild(child, result, options) {
		if (child.nodeType === NodeTypes.ELEMENT_NODE) {
			var localName = child.localName || child.baseName;
			if (localName.indexOf('.') !== -1) {
				parsePropertyElement(child, result, options);
			}
			/*
			else if (localName === 'String') {
				result.children = result.children || [];
				result.children.push(child.textContent.trim());
			}
			*/
			else {
				result.children = result.children || [];
				result.children.push(parseElement(child, options));
			}
		}
	}

	function parsePropertyElement(element, result, options) {
		var localName = element.localName || element.baseName,
			separatorIndex = localName.indexOf('.'),
			moduleName = localName.slice(0, separatorIndex),
			parent = element.parentNode,
			parentName = parent.localName || parent.baseName,
			property = {
				name: localName.slice(separatorIndex + 1),
				value: parseElement(element, options).children
			};
		if (moduleName !== parentName || element.namespaceURI !== parent.namespaceURI) {
			property.modulePath = element.namespaceURI;
			property.moduleName = moduleName;
		}
		if (property.value.length === 1) {
			property.value = property.value[0];
		}

		if (!result.properties) result.properties = [];
		result.properties.push(property);
	}

	function XmlToken(str) {
		this._buffer = str;
		this._startIndex = 0;
		this._endIndex = 0;
	}

	XmlToken.types = {
		XmlDeclaration: 0,
		Comment: 1,
		StartTag: 2,
		EndTag: 3,
		Text: 4,
		EndOfFile: 10
	};

	XmlToken.prototype.next = function() {
		var buffer = this._buffer,
			i = this._endIndex;
		this._startIndex = i;
		if (i >= buffer.length) {
			this.type = XmlToken.types.EndOfFile;
			return false;
		}
		if (buffer.charAt(i) === '<') {
			var terminator;
			if (buffer.charAt(i+1) === '?') {
				i += 2;
				this.type = XmlToken.types.XmlDeclaration;
				terminator = '?>';
			}
			else if (buffer.charAt(i+1) === '!' && buffer.charAt(i+2) === '-' && buffer.charAt(i+3) === '-') {
				i += 4;
				this.type = XmlToken.types.Comment;
				terminator = '-->';
			}
			else if (buffer.charAt(i+1) === '/') {
				i += 2;
				this.type = XmlToken.types.EndTag;
				terminator = '>';
			}
			else {
				i += 1;
				this.type = XmlToken.types.StartTag;
				terminator = '>';
			}
			i = buffer.indexOf(terminator, i+1);
			this._endIndex = (i === -1) ? buffer.length : i + terminator.length;
			return true;
		}
		else {
			this.type = XmlToken.types.Text;
			i = buffer.indexOf('<', i+1);
			this._endIndex = (i === -1) ? buffer.length : i;
			return true;
		}
	};

	XmlToken.prototype.addAttribute = function(name, value) {
		var attr = ' ' + name + '="' + value + '"';
		var i = this._endIndex - 1;
		if (this._buffer.charAt(i-1) === '/') i--;	// self-closing tag
		this._buffer = this._buffer.slice(0, i) + attr + this._buffer.slice(i);
		this._endIndex += attr.length;
	};

	XmlToken.prototype.toString = function() {
		return this._buffer;
	};

	return {
		parse: parse
	};
});
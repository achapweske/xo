 define(['./src/core/Utils', './src/core/Parser', './src/core/Compiler', './src/core/Linker', './src/core/Template', './src/core/Property', './src/core/AttachedProperty', './src/core/RelativeProperty', './src/core/PropertyTarget', './src/core/Event', './src/core/EventTarget', './src/core/EventTracker', './src/core/Binding', './src/core/ObservableList', './src/core/Object', './src/dom/Node'], 
	function (Utils, Parser, Compiler, Linker, Template, Property, AttachedProperty, RelativeProperty, PropertyTarget, Event, EventTarget, EventTracker, Binding, ObservableList, Object, Node) {

		var options = {
			modulePaths: {
				x: 'src/core'
			},
			systemPath: 'src/ui',
			defaultModulePath: 'src/ui',
			parseAttribute: function(attr, recipe) {
				if (attr.namespaceURI === options.modulePaths.x && 
					(attr.localName === 'source' || attr.baseName === 'source')) {

					var moduleName = attr.value;
					if (moduleName.slice(0, 2) === './') {
						moduleName = options.currentPath + moduleName.slice(1);
					}
					var i = moduleName.lastIndexOf('/');
					if (i !== -1) {
						recipe.moduleName = moduleName.slice(i + 1);
						recipe.modulePath = moduleName.slice(0, i);
					}
					else {
						recipe.moduleName = moduleName;
						recipe.modulePath = '.';
					}
					if (moduleName.slice(-4) === '.xml') {
						recipe.modulePlugin = 'xo';
					}
					return true;
				}
			},
			compileString: function(str) {
				if (helpers.isEscaped(str)) {
					return helpers.escapeString(str);
				}
				else if (helpers.isUnclosedScript(str)) {
					if (window.console) {
						console.warn('"', str + '": missing closing brace "}"');
					}
					return str;
				}
				else if (helpers.isScript(str)) {
					return helpers.compileScript(str);
				}
				else if (helpers.isDefinition(str)) {
					return helpers.compileDefinition(str);
				}
				else {
					return str;
				}
			},
			findDependencies: function(obj, deps) {
				if (obj.modulePath !== options.modulePaths.x) {
					return;
				}
				if (!obj.moduleName) {
					if (obj.name === 'ref') {
						obj.modulePath = '';
						obj.moduleName = 'Dictionary';
					}
					deps['xo'] = null;
				}
			},
			resolveDependencies: function(obj, deps) {
				if (obj.modulePath !== options.modulePaths.x) {
					return;
				}
				if (!obj.moduleName) {
					obj.module = deps['xo'];
				}
			},
			/*
			 *    context: the root of the tree to which obj belongs
			 *        obj: object whose property is to be set
			 *       name: property name
			 *      value: property value
			 *     module: delegate property setting to this module
			 */
			setProperty: function(target, property, context) {
				if (property.module === xo && property.name === 'name') {
					context[property.value] = target;
					return;
				}
				var obj = property.module || target,
				    member = obj[property.name],
				    value = property.value; 

				if (Utils.isFunction(value)) {
					value = value.call(target, context);
				}

				// property
				if (Property.isProperty(member)) {
					if (member.attributes().bind === false) {
						helpers.setPropertyValue(target, member, value);
					}
					else if (Utils.isFunction(value) || value.path) {
						var binding = helpers.createBinding(value, target, context);
						Binding.setBinding(target, member, binding);
					}
					else {
						helpers.setPropertyValue(target, member, value);
					}
				}
				// event 
				else if (Event.isEvent(member)) {
					if (Utils.isFunction(value)) {
						Event.addHandler(target, member, value, target);
					}
					else{
						Event.addHandler(target, member, context[value], context);
					} 
				}
				else {
					Utils.warn('Property "' + property.name + '" not found on target "' + obj + '"');
				}
			},
			setChildren: function(target, children) {
				if (target.contentProperty) {
					try {
						Property.setValue(target, target.contentProperty, children[0]);
					}
					catch (e) {
						Utils.warn(e.message);
					}
				}
				else if (target.contentCollection) {
					helpers.setPropertyValue(target, target.contentCollection, children);
				}
				else if (children.length > 0) {
					Utils.warn('no content property defined for "' + target + '"');
				}
			}
		};

		var propertyPattern = '[$_a-zA-Z][$_a-zA-Z0-9]*',
			subscriptPattern = '\\[[0-9]+\\]',
			propertyPathPattern = '^{\\s*' + propertyPattern + '(?:' + subscriptPattern + ')?(?:\\.' + propertyPattern + '(?:' + subscriptPattern + ')?)*\\s*}$',
			propertyPathExp = RegExp(propertyPathPattern),
			objectPattern = '^{\\s*(?:' + propertyPattern + '|\"[^\"]*\"|\'[^\']*\'):',
			objectExp = RegExp(objectPattern);

		var helpers = {
			escapeSequence: '{}',
			isEscaped: function(str) {
				return Utils.startsWith(str, this.escapeSequence);
			},
			isUnclosedScript: function(str) {
				return str.length > 0 && str.charAt(0) === '{' && str.charAt(str.length-1) !== '}';
			},
			isScript: function(str) {
				return str.length > 0 && str.charAt(0) === '{' && str.charAt(str.length-1) === '}';
			},
			isDefinition: function(str) {
				return str.charAt(0) === '@';
			},
			isPropertyPath: function(str) {
				return propertyPathExp.test(str);
			},
			isJavascriptObject: function(str) {
				return objectExp.test(str);
			},
			escapeString: function(str) {
				return str.slice(this.escapeSequence.length);
			},
			compileScript: function(str) {
				if (this.isPropertyPath(str))
					return this.compilePropertyPath(str);
				else if (this.isJavascriptObject(str)) 
					return this.compileObject(str);
				else
					return this.compileFunction(str);
			},
			compilePropertyPath: function(str) {
				return { path: str.slice(1, -1).trim() };
			},
			compileObject: function(str) {
				str = fixupJavascript(str);
				var globals = parseGlobalReferences(str);
				str = 'function(' + globals.join(',') + '){return ' + str + '}';
				var fn = this.evalFunction(str);
				return function (nameScope, overrideScope) {
					var params = helpers.getProperties(overrideScope || nameScope, globals);
					return fn.apply(this, params);	// returns an object
				};
			},
			compileFunction: function(str) {
				str = fixupJavascript(str);
				var globals = parseGlobalReferences(str);
				str = str.slice(1, -1);	// trim surrounding {}
				str = 'function(' + globals.join(',') + '){return ' + str + '}';
				var fn = this.evalFunction(str);
				return function (nameScope) {
					function bound(nameScope, overrideScope) {
						var params = helpers.getProperties(overrideScope || nameScope, globals);
						return fn.apply(this, params);
					};
					return bound.bind(this, nameScope);
				};
			},
			compileDefinition: function(str) {
				var name = str.slice(1);
				return function () {
					var context = helpers.getDefinitionContext(this);
					return function () {
						var definitions = context.definitions();
						var result = definitions && definitions.find(name);
						if (typeof result === 'undefined') {
							console.log('Definition not found: "' + name + '"');
						}
						return result;
					};
				};
			},
			evalFunction: function(str) {
				return eval('(function() { return ' + str + ';})()');
			},
			getDefinitionContext: function(obj) {
				while (obj && !obj.definitions) {
					obj = Template.ObjectTreeHelper.getParent(obj);
				}
				return obj;
			},
			getProperties: function(obj, names) {
				var results = [];
				for (var i = 0; i < names.length; i++) {
					var property = obj[names[i]];
					if (Utils.isFunction(property)) {
						property = property.bind(obj);
					}
					results.push(property);
				}
				return results;
			},
			setPropertyValue: function(obj, property, newValue) {
				if (Utils.isString(property)) {
					property = obj[property];
				}
				if (property.isReadOnly()) {
					var oldValue = Property.getValue(obj, property);
					if (oldValue && oldValue.assign) {
						oldValue.assign(newValue);
						return;
					}
				}
				newValue = this.convertPropertyValue(obj, property, newValue);
				//try {
					Property.setValue(obj, property, newValue);
				//}
				//catch (e) {
				//	Utils.warn(e.name + ': ' + e.message);
				//}
			},
			convertPropertyValue: function(obj, property, value) {
				var type = property.type();
				if (type && !Utils.instanceOf(value, type)) {
					// value is not of the specified type - find a converter
					if (type === Number) {
						var converted = +type;
						if (!Utils.isNaN(converted)) {
							return converted;
						}
					}
					if (Utils.isString(value) && Utils.isFunction(type.fromString)) {
						try {
							return type.fromString(value);
						}
						catch (e) {
							if (window.console) console.warn(e.name + ': ' + e.message);
						}
					}
				}
				return value;
			},
			createBinding: function(value, obj, nameScope) {
				if (Utils.isFunction(value)) {
					var property = new Property({ 
						get: function() {
							try {
								return value.call(this);
							}
							catch (e) {
								console.log('Data binding error: ' + (e.message || e));
							}
						} 
					});
					return new Binding({ 
						source: obj,
						property: property,
						direction: Binding.Directions.UpdateTarget
					});
				}
				var options = Utils.clone(value);
				if (!options.source && options.path) {
					options.path = options.path.split('.');
					options.source = (options.path[0] === 'this') ? obj : nameScope;
				}
				return new Binding(options);
			}
		};

		function fixupJavascript(str) {
			var token, inQuotes = false, quoteChar;
			for (var i = 0; i < str.length; i++) {
				var ch = str.charAt(i);
				if (inQuotes) {
					inQuotes = (ch !== quoteChar);
				}
				else if (ch === '"' || ch === "'") {
					inQuotes = true;
					quoteChar = ch;
				}
				else if (ch !== ' ' && ch !== '\t') {
					if (token) token += ch;
					else token = ch;
				}
				else if (token) {
					var replace;
					switch (token.toLowerCase()) {
						case 'and':
							replace = '&&';
							break;
						case 'or':
							replace = '||';
							break;
						default:
							replace = null;
							break;
					}
					if (replace) {
						str = str.slice(0, i-token.length).concat(replace).concat(str.slice(i));
						i -= token.length - replace.length;
					}
					token = null;
				}
			}
			return str;
		}

		function parseGlobalReferences(str) {
			var results = [], token, inQuotes = false, quoteChar, prefix;
			for (var i = 0; i < str.length; i++) {
				var ch = str.charAt(i);
				if (inQuotes) {
					inQuotes = (ch !== quoteChar);
				}
				else if (ch === '"' || ch === "'") {
					inQuotes = true;
					quoteChar = ch;
				}
				else if (!token) {
					if (Utils.isLetter(ch) || ch === '$' || ch === '_') {
						token = ch;
						continue;
					}
				}
				else if (Utils.isLetter(ch) || Utils.isDigit(ch) || ch === '$' || ch === '_') {
					token += ch;
					continue;
				}
				else if (token) {
					if (ch !== ':' && prefix !== '.' && prefix !== '[' && !isJavascriptKeyword(token) && !isJavascriptLiteral(token)) {
						results.push(token);
					}
					token = null;
				}
				prefix = ch;
			}
			if (token) {
				if (prefix !== '.' && prefix !== '[' && !isJavascriptKeyword(token) && !isJavascriptLiteral(token)) {
					results.push(token);
				}
			}

			return results;
		}

		function isJavascriptKeyword(token) {
			switch (token) {
				case 'break':
				case 'case':
				case 'class':
				case 'catch':
				case 'const':
				case 'continue':
				case 'debugger':
				case 'default':
				case 'delete':
				case 'do':
				case 'else':
				case 'export':
				case 'extends':
				case 'finally':
				case 'for':
				case 'function':
				case 'if':
				case 'import':
				case 'in':
				case 'instanceof':
				case 'let':
				case 'new':
				case 'return':
				case 'super':
				case 'switch':
				case 'this':
				case 'throw':
				case 'try':
				case 'typeof':
				case 'var':
				case 'void':
				case 'while':
				case 'with':
				case 'yield':
					return true;
				default:
					return false;
			}
		};

		function isJavascriptLiteral(token) {
			switch (token) {
				case 'null':
				case 'true':
				case 'false':
					return true;
				default:
					return false;
			}
		};

		options.helpers = helpers;

		function xo() {
			return Node.toNode.apply(Node, arguments);
		};

		Utils.copy(xo, {
			options: options,
			Utils: Utils,
			Template: Template,
			Property: Property,
			property: Property.define,
			AttachedProperty: AttachedProperty,
			RelativeProperty: RelativeProperty,
			PropertyTarget: PropertyTarget,
			Event: Event,
			event: Event.define,
			EventTarget: EventTarget,
			EventTracker: EventTracker,
			Object: Object,
			observe: EventTracker.observe,
			ignore: EventTracker.ignore,
			Binding: Binding,
			ObservableList: ObservableList,
			Node: Node,
			load: function (name, req, onload, config) {
				var currentPath = name,
					i = currentPath.lastIndexOf('/');
				if (i !== -1) {
					currentPath = currentPath.slice(0, i);
				}
		        req(['text!'+name], function (value) {
		        	options.currentPath = currentPath;
		        	xo.build(value, onload);
		        });
		    },
		    build: function(text, completeCallback) {
				var parsed = Parser.parse(text, xo.options);
				var compiled = Compiler.compile(parsed, xo.options);
				Linker.link(compiled, xo.options, function (linked) {
					var template = new Template(linked, xo.options);
					if (completeCallback) completeCallback(template);
				});
			}
		});

		Utils.copy(xo, Utils);

		return xo;
	}
);
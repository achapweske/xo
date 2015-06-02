 define(['./src/core/Utils', './src/core/Class', './src/core/Parser', './src/core/Compiler', './src/core/Linker', './src/core/Template', './src/core/Property', './src/core/AttachedProperty', './src/core/ComputedProperty', './src/core/RelativeProperty', './src/core/Event', './src/core/EventTracker', './src/core/Binding', './src/core/ObservableList', './src/core/ReadOnlyObservableList', './src/core/Dictionary', './src/core/Object', './src/core/ObjectTree', './src/dom/Node'], 
	function (Utils, Class, Parser, Compiler, Linker, Template, Property, AttachedProperty, ComputedProperty, RelativeProperty, Event, EventTracker, Binding, ObservableList, ReadOnlyObservableList, Dictionary, Object, ObjectTree, Node) {

		Class.invoke = function(defn) {
			if (defn) defn = compile(defn);
			return this.extend({
				construct: function() {
					if (defn) construct.call(this, defn);
				}
			});
		};

		function compile(defn) {
			var result = defn;
			Utils.keys(defn).forEach(function (key) {
				var value = defn[key];
				if (Utils.isString(value) && helpers.isDefinition(value)) {
					value = helpers.compileDefinition(value);
					if (result === defn) {
						result = Utils.clone(defn);
					}
					result[key] = value;
				}
			});
			return result;
		};

		var callStack = [];

		function construct(defn) {
			if (callStack.length === 0) {
				ObjectTree.setIsNameScope(this, true);
			}
			callStack.push(this);
			try {
				if (Utils.isFunction(defn.construct)) {
					defn.construct.call(this);
				}
				Utils.keys(defn).forEach(function (key) {
					var value = defn[key];
					value = Utils.isArray(value) ? value.map(build, this) : build.call(this, value);
					options.setProperty(this, { name: key, value: value });
				}, this);
			}
			finally {
				callStack.pop();
			}
		};

		function isConstructor(obj) {
			return Utils.isFunction(obj) && obj.prototype.constructor === obj && obj.__superclass;
		};

		function build(child) {
			child = isConstructor(child) ? new child() : child;
			ObjectTree.addChild(this, child);
			return child;
		};

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
			/*
			 *    context: the root of the tree to which obj belongs
			 *        obj: object whose property is to be set
			 *       name: property name
			 *      value: property value
			 *     module: delegate property setting to this module
			 */
			setProperty: function(target, property) {
				var obj = property.module || target,
				    member = obj[property.name],
				    value = property.value; 

				// property
				if (Property.isProperty(member)) {
					if ((value.path || Utils.isFunction(value)) && (member.attributes().bind !== false)) {
						Binding.setBinding(target, member, new Binding(value));
					}
					else {
						Property.assignValue(target, member, value);
					}
				}
				// event 
				else if (Event.isEvent(member)) {
					if (Utils.isString(value)) {
						var name = value;
						value = function() {
							var context = ObjectTree.getNameScope(this) || this;
							context[name].call(context, arguments);
						};
					}
					Event.addHandler(target, member, value, target);
				}
				else {
					Utils.warn('Property "' + property.name + '" not found on target "' + obj + '"');
				}
			},
			setChildren: function(target, children) {
				if (target.contentProperty) {
					Property.assignValue(target, target.contentProperty, children[0]);
				}
				else if (target.contentCollection) {
					Property.assignValue(target, target.contentCollection, children);
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
				str = 'function(){return ' + str + '}';
				var fn = this.evalFunction(str);
				return fn();
			},
			compileFunction: function(str) {
				str = fixupJavascript(str);
				var globals = parseGlobalReferences(str);
				str = str.slice(1, -1);	// trim surrounding {}
				str = 'function(' + globals.join(',') + '){return ' + str + '}';
				return this.evalFunction(str);
			},
			compileDefinition: function(str) {
				var name = str.slice(1);
				return function () {
					var context = helpers.getDefinitionContext(this),
						result = Dictionary.findDefinition(context, name);
					if (typeof result === 'undefined') {
						console.log('Definition not found: "' + name + '"');
					}
					return result;
				};
			},
			evalFunction: function(str) {
				return eval('(function() { return ' + str + ';})()');
			},
			getDefinitionContext: function(obj) {
				while (obj && !obj.definitions) {
					obj = ObjectTree.getParent(obj);
				}
				return obj;
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
			Class: Class,
			options: options,
			Utils: Utils,
			Template: Template,
			Property: Property,
			property: Property.define,
			Dictionary: Dictionary,
			AttachedProperty: AttachedProperty,
			ComputedProperty: ComputedProperty,
			RelativeProperty: RelativeProperty,
			Event: Event,
			event: Event.define,
			EventTracker: EventTracker,
			Object: Object,
			observe: EventTracker.observe,
			ignore: EventTracker.ignore,
			ObjectTree: ObjectTree,
			Binding: Binding,
			ObservableList: ObservableList,
			ReadOnlyObservableList: ReadOnlyObservableList,
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
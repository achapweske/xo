define(['./Utils', './Object', './EventTracker', './Binding'], function(Utils, Object, EventTracker, Binding) {

	var Template = Object.extend({
		construct: function Template(recipe, options) {
			this.recipe = recipe;
			this.options = options;
		},

		instance: function() {
			return this._instance || (this._instance = this.create());
		},

		create: function(initCallback, initContext) {
			return EventTracker.ignore(function() {	
				return Binding.deferBindings(function() {
					var parent = ObjectTreeHelper.getParent(this);
					var result = Template.invoke(this.recipe, this.options, null, parent);
					if (initCallback) initCallback.call(initContext, result);
					return result;
				}, this);
			}, this);
		},

		update: function(obj) {
			return EventTracker.ignore(function() {	
				return Binding.deferBindings(function() {
					var parent = ObjectTreeHelper.getParent(this);
					return Template.invoke(this.recipe, this.options, obj, parent);
				}, this);
			}, this);
		}
	});

	var ObjectTreeHelper = {
		getRoot: function(obj) {
			// TODO
		},
		getParent: function(obj) {
			return obj._xoparent;
		},
		addChild: function(obj, child) {
			child._xoparent = obj;
		},
		getChildren: function(obj) {
			// TODO
		}
	};

	Template.ObjectTreeHelper = ObjectTreeHelper;

	Template.invoke = function(recipe, options, target, parent, root) {

		if (!target) {
			if (Array.isArray(recipe)) {
				return createChildren(recipe, options, parent, root);
			}
			if (!recipe.module) {
				return recipe;
			}
			if (isTemplateRecipe(recipe) && root) {
				return createTemplate(recipe, options, parent, root);
			}
			else if (recipe.module instanceof Template) {
				return recipe.module.instance();
			}
			else if (recipe.module === Array) {
				return createArray(recipe, options, parent, root);
			}
			else if (recipe.module === Date) {
				return createDate(recipe, options, parent, root);
			}
			else if (recipe.module === Function) {
				return createFunction(recipe, options, parent, root);
			}
			else if (recipe.module === Number) {
				return createNumber(recipe, options, parent, root);
			}
			else if (recipe.module === String) {
				return createString(recipe, options, parent, root);
			}
			else {
				target = new recipe.module();
			}
		}

		root = root || target;
		ObjectTreeHelper.addChild(parent, target);
		
		if (recipe.properties) {
			recipe.properties.forEach(function (item) {
				var property = createProperty(item, options, target, root);
				options.setProperty(target, property, root);
			});
		}

		if (recipe.children) {
			var children = createChildren(recipe.children, options, target, root);
			options.setChildren(target, children, root);
		}

		return target;
	};

	function isTemplateRecipe(recipe) {
		return recipe.moduleName && recipe.moduleName.slice(-8).toLowerCase() === 'template';
	};

	function createTemplate(recipe, options, parent, root) {
		var result = new Template(recipe, options);
		ObjectTreeHelper.addChild(parent, result);
		return result;
	};

	function createArray(recipe, options, parent, root) {
		var result = new Array();
		if (recipe.children) {
			var children = createChildren(recipe.children, options, result, root);
			result.push.apply(result, children);
		}

		var arrayRecipe = {
			properties: recipe.properties
		};

		return Template.invoke(arrayRecipe, options, result, parent, root);
	};

	function createDate(recipe, options, parent, root) {
		var value = '';
		if (recipe.children) {
			recipe.children.forEach(function(child) {
				value += child;
			});
		}
		if (value == +value) {
			value = +value;
		}
		var result = new Date(value);

		var dateRecipe = {
			properties: recipe.properties
		};

		return Template.invoke(dateRecipe, options, result, parent, root);
	};

	function createFunction(recipe, options, parent, root) {
		var value = '';
		if (recipe.children) {
			recipe.children.forEach(function(child) {
				value += child;
			});
		}
		var fn = eval('(function(){' + value + '})');
		var result = function() {
			return fn;
		}

		var functionRecipe = {
			properties: recipe.properties
		};

		return Template.invoke(functionRecipe, options, result, parent, root);
	};

	function createString(recipe, options, parent, root) {
		var value = '';
		if (recipe.children) {
			recipe.children.forEach(function(child) {
				value += child;
			});
		}
		var result = new String(value);

		var stringRecipe = {
			properties: recipe.properties
		};

		return Template.invoke(stringRecipe, options, result, parent, root);
	};

	function createNumber(recipe, options, parent, root) {
		var value = '';
		if (recipe.children) {
			recipe.children.forEach(function(child) {
				value += child;
			});
		}
		var result = new Number(value);

		var numberRecipe = {
			properties: recipe.properties
		};

		return Template.invoke(numberRecipe, options, result, parent, root);
	};

	function createProperty(property, options, parent, root) {
		return {
			module: property.module,
			name: property.name,
			value: Template.invoke(property.value, options, null, parent, root)
		};
	};

	function createChildren(items, options, parent, root) {
		return items.map(function (item) {
			return Template.invoke(item, options, null, parent, root);
		});
	}



	return Template;
});
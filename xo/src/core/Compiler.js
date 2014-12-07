define(['./Utils'], function(Utils) {
	function compile(recipe, options) {
		options = options || {};
		if (recipe.moduleName && (recipe.properties || recipe.children)) {
			if (recipe.properties) 
				recipe.properties = compile(recipe.properties, options);
			if (recipe.children) 
				recipe.children = compile(recipe.children, options);
		}
		else if (Array.isArray(recipe)) {
			for (var i = 0; i < recipe.length; i++)
				recipe[i] = compile(recipe[i], options);
		}
		else if (recipe.value) {
			recipe.value = compile(recipe.value, options);
		}
		else if (typeof recipe === 'string') {
			if (options.compileString) recipe = options.compileString(recipe);
		}
		return recipe;
	};

	return {
		compile: compile
	};
});
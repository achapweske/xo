define(['./Utils'], function(Utils) {
	var Linker = {}

	Linker.link = function(obj, options, completeCallback) {
		var deps = findDependencies(obj, {}, options);
		loadDependencies(obj, deps, options, function(obj, deps) {
			resolveDependencies(obj, deps, options);
			if (completeCallback) completeCallback(obj);
		});
	};

	function findDependencies(obj, deps, options) {
		deps = deps || {};
		if (options.findDependencies) {
			options.findDependencies(obj, deps, options);
		}
		if (obj.moduleName) {
			var moduleId = makeModuleId(obj, options);
			deps[moduleId] = null;
			if (obj.properties) {
				findDependencies(obj.properties, deps, options);
			}
			if (obj.children) {
				findDependencies(obj.children, deps, options);
			}
		}
		else if (Array.isArray(obj)) {
			for (var i = 0; i < obj.length; i++) {
				findDependencies(obj[i], deps, options);
			}
		}
		if (obj.value) {
			findDependencies(obj.value, deps, options);
		}
		return deps;
	};

	function loadDependencies(obj, deps, options, completeCallback) {
		var moduleIds = [];
		for (var moduleId in deps) {
			var module = deps[moduleId] = loadDependency(moduleId, options);
			if (!module) {
				moduleIds.push(moduleId);
			}
		}

		require(moduleIds, function () {
			for (var i = 0; i < arguments.length; i++) {
				deps[moduleIds[i]] = arguments[i];
			}
			resolveDependencies(obj, deps, options);
			if (completeCallback) completeCallback(obj, deps);
		});
	};

	function loadDependency(moduleId, options) {
		var module = null;
		if (options.loadDependency) {
			module = options.loadDependency(moduleId, options);
		}
		if (!module) {
			module = loadSystemDependency(moduleId, options);
		}
		return module;
	};

	function loadSystemDependency(moduleId, options) {
		var components = parseModuleId(moduleId, options);
		if (components.modulePath !== options.systemPath) {
			return null;
		}
		switch (components.moduleName) {
			case 'Array':
				return Array;
			case 'Date':
				return Date;
			case 'Function':
				return Function;
			case 'Number':
				return Number;
			case 'Object':
				return Object;
			case 'RegExp':
				return RegExp;
			case 'String':
				return String;
			default:
				return null;
		}
	}

	function resolveDependencies(obj, deps, options) {
		if (options.resolveDependencies) {
			options.resolveDependencies(obj, deps);
		}
		if (obj.moduleName) {
			var moduleId = makeModuleId(obj, options);
			var module = deps[moduleId];
			if (module) obj.module = module;
			if (obj.properties) {
				resolveDependencies(obj.properties, deps, options);
			}
			if (obj.children) {
				resolveDependencies(obj.children, deps, options);
			}
		}
		else if (Array.isArray(obj)) {
			for (var i = 0; i < obj.length; i++) {
				resolveDependencies(obj[i], deps, options);
			}
		}
		if (obj.value) {
			resolveDependencies(obj.value, deps, options);
		}
	};

	function makeModuleId(obj, options) {
		var moduleId,
			modulePath = obj.modulePath || options.defaultModulePath;

		if (!modulePath) {
			moduleId = obj.moduleName;
		}
		else if (modulePath[modulePath.length-1] === '/') {
			moduleId = modulePath + obj.moduleName;
		}
		else {
			moduleId = modulePath + '/' + obj.moduleName;
		}

		if (obj.modulePlugin) {
			moduleId = obj.modulePlugin + '!' + moduleId;
		}

		return moduleId;
	};

	function parseModuleId(moduleId, options) {
		var result = {
			moduleName: moduleId
		};
		var i = moduleId.lastIndexOf('/');
		if (i !== -1) {
			result.modulePath = moduleId.slice(0, i);
			result.moduleName = moduleId.slice(i + 1);
		}
		return result;
	}

	return Linker;
});
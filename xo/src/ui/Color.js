define(['xo'], function (xo) {
	function Color(r, g, b, a) {
		if (arguments.length === 1) {
			var other = arguments[0];
			this.r(other.r());
			this.g(other.g());
			this.b(other.b());
			this.a(other.a());
			return;
		}
		if (typeof r !== 'undefined') {
			this.r(r);
		}
		if (typeof g !== 'undefined') {
			this.g(g);
		}
		if (typeof b !== 'undefined') {
			this.b(b);
		}
		if (typeof a !== 'undefined') {
			this.a(a);
		}
	};

	Color.prototype.contentProperty = 'css';

	var namedColors = {
		transparent: { r: 255, g: 255, b: 255, a: 0 }
	};

	Color.prototype.r = xo.property({
		defaultValue: 0
	});

	Color.prototype.g = xo.property({
		defaultValue: 0
	});

	Color.prototype.b = xo.property({
		defaultValue: 0
	});

	Color.prototype.a = xo.property({
		defaultValue: 1
	});

	Color.prototype.css = xo.property({
		get: function() {
			return this.format();
		},
		set: function(newValue) {
			this.parse(newValue);
		}
	});

	Color.parse = function(str, color) {
		var r = 0, g = 0, b = 0, a = 1;

		if (str.charAt(0) === '#' && str.length === 4) {
			r = parseInt(str.slice(1, 2), 16);
			g = parseInt(str.slice(2, 3), 16);
			b = parseInt(str.slice(3, 4), 16);		
		}
		else if (str.charAt(0) === '#' && str.length === 7) {
			r = parseInt(str.slice(1, 3), 16);
			g = parseInt(str.slice(3, 5), 16);
			b = parseInt(str.slice(5, 7), 16);	
		}
		else if (xo.startsWith(str, 'rgb(') && xo.endsWith(str, ')')) {
			var values = str
				.slice(4, -1)
				.split(',')
				.map(function (token) { return token.trim(); });

			r = +values[0];
			g = +values[1];
			b = +values[2];
			a = 1;
		}
		else if (xo.startsWith(str, 'rgba(') && xo.endsWith(str, ')')) {
			var values = str
				.slice(5, -1)
				.split(',')
				.map(function (token) { return token.trim(); });

			r = +values[0];
			g = +values[1];
			b = +values[2];
			a = +values[3];
		}
		else if (str in namedColors) {
			var namedColor = namedColors[str];
			r = namedColor.r;
			g = namedColor.g;
			b = namedColor.b;
			a = namedColor.a;
		}
		else {
			throw new Error('Invalid color: "' + str + '"');
		}

		if (color) {
			color.r(r);
			color.g(g);
			color.b(b);
			color.a(a);
		}
		else {
			return new Color(r, g, b, a);
		}
	};

	Color.format = function(color) {
		var r = color.r(),
			g = color.g(),
			b = color.b(),
			a = color.a();

		if (r === 255 && g === 255 && b === 255 && a === 0) {
			return 'transparent';
		}
		else if (a === 1) {
			return 'rgb(' + r + ',' + g + ',' + b + ')';
		}
		else {
			return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
		}
	};

	Color.prototype.parse = function(str) {
		return Color.parse(str, this);
	};

	Color.prototype.format = function() {
		return Color.format(this);
	};

	Color.prototype.clone = function() {
		return new Color(this);
	};

	Color.prototype.toString = function() {
		return this.format();
	};

	return Color;
});
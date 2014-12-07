define(['xo'], function (xo) {
	function TransformOrigin(options) {
		if (options) {
			if ('x' in options) this.x(options.x);
			if ('xUnits' in options) this.xUnits(options.xUnits);
			if ('y' in options) this.y(options.y);
			if ('yUnits' in options) this.yUnits(options.yUnits);
		}
	};

	TransformOrigin.Units = {
		Pixels: 'px',
		Percent: '%'
	};

	TransformOrigin.css = xo.property({
		get: function() {
			return this.toString();
		}
	});

	TransformOrigin.prototype.getAbsoluteX = function(elementWidth) {
		switch (this.xUnits()) {
			case TransformOrigin.Units.Pixels:
				return this.x();
			case TransformOrigin.Units.Percent:
				return this.x() * elementWidth / 100;
			default:
				throw new Error('TransformOrigin: invalid units "' + this.xUnits() + '"');
		}
	};

	TransformOrigin.prototype.getAbsoluteY = function(elementHeight) {
		switch (this.yUnits()) {
			case TransformOrigin.Units.Pixels:
				return this.y();
			case TransformOrigin.Units.Percent:
				return this.y() * elementHeight / 100;
			default:
				throw new Error('TransformOrigin: invalid units "' + this.yUnits() + '"');
		}
	};

	TransformOrigin.prototype.x = xo.property({
		type: Number
	});
	
	TransformOrigin.prototype.xUnits = xo.property({
		type: TransformOrigin.Units
	});

	TransformOrigin.prototype.y = xo.property({
		type: Number
	});
	
	TransformOrigin.prototype.yUnits = xo.property({
		type: TransformOrigin.Units
	});

	TransformOrigin.fromString = function(str) {
		return TransformOriginParser.parse(str);
	};

	TransformOrigin.prototype.toString = function() {
		var x = this.x(),
			y = this.y(),
			xUnits = x ? this.xUnits() : '';
			yUnits = y ? this.yUnits() : '';

			return x + xUnits + ' ' + y + yUnits;
	};

	TransformOriginParser = {
		valueRegEx: /^(\d+(?:\.\d*)?|(?:\.\d+))([a-z%]*)$/,
		parse: function(str) {
			var tokens = str.split(' ');
			if (tokens.length === 2) {
				var x = this.parseValue(tokens[0]),
					y = this.parseValue(tokens[1]);

				if (x && y) {
					return new TransformOrigin({
						x: x.value,
						xUnits: x.units,
						y: y.value,
						yUnits: y.units
					});
				}
			}

			throw new Error('Invalid transform origin "' + str + '"');
		},
		parseValue: function(str) {
			var match = str.match(this.valueRegEx);
			if (!match) {
				return false;
			}
			var value = +match[1];
			if (xo.isNaN(value)) {
				return false;
			}
			var units = match[2];
			if (!units) {
				value *= 100;
				units = '%';
			}
			if (!xo.hasValue(TransformOrigin.Units, units)) {
				return false;
			}
			return { value: value, units: units };
		}
	};

	return TransformOrigin;
});
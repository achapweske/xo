define(['xo'], function (xo) {

	/*
	 * _matrix is an array of values:
	 *
	 *   [ m11, m12, m21, m22, m31, m32 ]
	 * 
	 * which maps to a 3x3 matrix as follows:
	 *
	 *   [ m11 m12  0  ]
	 *   [ m21 m22  0  ]
	 *   [ m31 m32  1  ]
	 *
	 */

	function Transform() {
		if (arguments.length === 0) {
			this._matrix = [1, 0, 0, 1, 0, 0];
		}
		else {
			this._matrix = toMatrix(arguments);
		}
	};

	function toMatrix(matrix) {
		if (matrix.length === 1 && xo.isArray(matrix[0])) {
			matrix = matrix[0];
		}
		return [
			matrix[0] || 0,
			matrix[1] || 0,
			matrix[2] || 0,
			matrix[3] || 0,
			matrix[4] || 0,
			matrix[5] || 0
		];
	};

	Transform.prototype.contentProperty = 'css';

	/**
	 * Append the specified transform to this transform
	 * @param  {Transform | Array} other
	 * @return {Transform} this
	 */
	Transform.prototype.append = function(other) {
		this.matrix(Matrix.multiply(this._matrix, other._matrix || other));
		return this;
	};
    
	/*
	 * Get/set this transform as a CSS property value
	 */
	Transform.prototype.css = xo.property({
		get: function() {
			return this.format();
		},
		set: function(newValue) {
			this.fromString(newValue);
		}
	});

	/**
	 * Get this transform's determinant
	 * @return {Number}
	 */
	Transform.prototype.determinant = xo.property({
		get: function() {
			return Matrix.determinant(this.matrix());
		}
	});

	/**
	 * Invert this transform
	 * @return {Transform} this
	 */
	Transform.prototype.invert = function() {
		this.matrix(Matrix.inverse(this._matrix));
		return this;
	};

	/*
	 * Determine if this is an identity transform
	 */
	Transform.prototype.isIdentity = xo.property({
		get: function() {
			return Matrix.isIdentity(this.matrix());
		}
	});


	/**
	 * Determine if this transform is invertible
	 * @return {Boolean}
	 */
	Transform.prototype.isInvertible = xo.property({
		get: function() {
			return this.determinant() !== 0;
		}
	});

	Transform.prototype.m11 = xo.property({
		get: function() {
			return this.matrix()[0];
		},
		set: function(newValue) {
			var m = this.matrix();
			m[0] = newValue;
			this.matrix(m);
		}
	});

	Transform.prototype.m12 = xo.property({
		get: function() {
			return this.matrix()[1];
		},
		set: function(newValue) {
			var m = this.matrix();
			m[1] = newValue;
			this.matrix(m);
		}
	});

	Transform.prototype.m21 = xo.property({
		get: function() {
			return this.matrix()[2];
		},
		set: function(newValue) {
			var m = this.matrix();
			m[2] = newValue;
			this.matrix(m);
		}
	});

	Transform.prototype.m22 = xo.property({
		get: function() {
			return this.matrix()[3];
		},
		set: function(newValue) {
			var m = this.matrix();
			m[3] = newValue;
			this.matrix(m);
		}
	});

	Transform.prototype.m31 = xo.property({
		get: function() {
			return this.matrix()[4];
		},
		set: function(newValue) {
			var m = this.matrix();
			m[4] = newValue;
			this.matrix(m);
		}
	});

	Transform.prototype.m32 = xo.property({
		get: function() {
			return this.matrix()[5];
		},
		set: function(newValue) {
			var m = this.matrix();
			m[5] = newValue;
			this.matrix(m);
		}
	});

	Transform.prototype.matrix = xo.property({
		get: function() {
			return this._matrix.slice(0);
		},
		set: function(newValue) {
			var oldValue = this._matrix;
			this._matrix = [
				newValue[0] || 0,
				newValue[1] || 0,
				newValue[2] || 0,
				newValue[3] || 0,
				newValue[4] || 0,
				newValue[5] || 0
			];
			xo.Event.raiseEvent(this, 'matrix', { newValue: this._matrix, oldValue: oldValue });
		}
	});

	Transform.prototype.prepend = function(other) {
		this.matrix(Matrix.multiply(other._matrix || other, this._matrix));
		return this;
	};

	/**
	 * Prepend a rotation to this transform
	 * @param  {number} theta rotation angle in radians
	 * @return {Transform} this
	 */
	Transform.prototype.prependRotate = function(theta) {
		return this.prependRotateAt(theta, 0, 0);
	};

	/**
	 * Prepend a rotation centered about the given point (centerX, centerY)
	 * @param  {Number} theta rotation angle in radians
	 * @param  {Number} centerX rotation center x-coordinate
	 * @param  {Number} centerY rotation center y-coordinate
	 * @return {Transform} this
	 */
	Transform.prototype.prependRotateAt = function(theta, centerX, centerY) {
		var rotation = Matrix.createRotation(theta, centerX, centerY);
		this.matrix(Matrix.multiply(rotation, this._matrix));
		return this;
	};

	/**
	 * Prepend a scaling to this transform
	 * @param  {Number} scaleX x scaling factor
	 * @param  {Number} scaleY y scaling factor
	 * @return {Transform} this
	 */
	Transform.prototype.prependScale = function(scaleX, scaleY) {
		return this.prependScaleAt(scaleX, scaleY, 0, 0);
	}

	/**
	 * Prepend a scaling centered about the given point (centerX, centerY)
	 * @param  {Number} scaleX x scaling factor
	 * @param  {Number} scaleY y scaling factor
	 * @param  {Number} centerX center x-coordinate
	 * @param  {Number} centerY center y-coordinate
	 * @return {Transform} this
	 */
	Transform.prototype.prependScaleAt = function(scaleX, scaleY, centerX, centerY) {
		var scaling = Matrix.createScaling(scaleX, scaleY, centerX, centerY);
		this.matrix(Matrix.multiply(scaling, this._matrix));
		return this;
	};

	/**
	 * Prepend a skewing to this transform
	 * @param  {Number} skewX x-skew angle (radians)
	 * @param  {Number} skewY y-skew angle (radians)
	 * @return {Transform} this
	 */
	Transform.prototype.prependSkew = function(skewX, skewY) {
		var skewing = Matrix.createSkewing(skewX, skewY);
		this.matrix(Matrix.multiply(skewing, this._matrix));
		return this;
	};

	/**
	 * Prepend a translation to this transform
	 * @param  {number} translateX
	 * @param  {number} translateY
	 * @return {Transform} this
	 */
	Transform.prototype.prependTranslate = function(translateX, translateY) {
		var translation = Matrix.createTranslation(translateX, translateY);
		this.matrix(Matrix.multiply(translation, this._matrix));
		return this;
	};

	/**
	 * Append a rotation to this transform.
	 *
	 * The rotation is centered at origin (0, 0)
	 * @param  {Number} theta rotation angle in radians
	 * @return {Transform} this
	 */
	Transform.prototype.rotate = function(theta) {
		return this.rotateAt(theta, 0, 0);
	};

	/**
	 * Append a rotation centered about the given point (centerX, centerY)
	 * @param  {Number} theta rotation angle in radians
	 * @param  {Number} centerX rotation center x-coordinate
	 * @param  {Number} centerY rotation center y-coordinate
	 * @return {Transform} this
	 */
	Transform.prototype.rotateAt = function(theta, centerX, centerY) {
		var rotation = Matrix.createRotation(theta, centerX, centerY);
		this.matrix(Matrix.multiply(this._matrix, rotation));
		return this;
	};

	/**
	 * Append a scaling to this transform
	 * @param  {Number} scaleX x scaling factor
	 * @param  {Number} scaleY y scaling factor
	 * @return {Transform} this
	 */
	Transform.prototype.scale = function(scaleX, scaleY) {
		return this.scaleAt(scaleX, scaleY, 0, 0);
	}

	/**
	 * Append a scaling centered about the given point (centerX, centerY)
	 * @param  {Number} scaleX x scaling factor
	 * @param  {Number} scaleY y scaling factor
	 * @param  {Number} centerX center x-coordinate
	 * @param  {Number} centerY center y-coordinate
	 * @return {Transform} this
	 */
	Transform.prototype.scaleAt = function(scaleX, scaleY, centerX, centerY) {
		var scaling = Matrix.createScaling(scaleX, scaleY, centerX, centerY);
		this.matrix(Matrix.multiply(this._matrix, scaling));
		return this;
	};

	/**
	 * Append a skewing to this transform
	 * @param  {Number} skewX x-skew angle (radians)
	 * @param  {Number} skewY y-skew angle (radians)
	 * @return {Transform} this
	 */
	Transform.prototype.skew = function(skewX, skewY) {
		var skewing = Matrix.createSkewing(skewX, skewY);
		this.matrix(Matrix.multiply(this._matrix, skewing));
		return this;
	};

	/*
	 * Apply this transform to the given coordinates
	 */
	Transform.prototype.transform = function(x, y) {
		var m = this._matrix;
		return {
			x: m[0] * x + m[2] * y + m[4],	// x = m00 * x + m01 * y + m02
			y: m[1] * x + m[3] * y + m[5]	// y = m10 * x + m11 * y + m12
		}
	};

	/**
	 * Append a translation to this transform
	 * @param  {Number} translateX
	 * @param  {Number} translateY
	 * @return {Transform} this
	 */
	Transform.prototype.translate = function(translateX, translateY) {
		var m = this._matrix.slice(0);
		m[4] += translateX;
		m[5] += translateY;
		this.matrix(m);
		return this;
	};

	Transform.prototype.parse = function(str) {
		return Transform.fromString(str, this);
	};

	Transform.prototype.format = function() {
		return Transform.format(this);
	};

	Transform.format = function(transform) {
		if (!transform) return '';
		var m = transform.matrix();
		m = m.map(function(value) {
			// CSS does not allow numbers with exponent notation
			return Math.round(value * 1000000) / 1000000;
		});
		return 'matrix(' + m[0] +',' + m[1] + ',' + m[2] + ',' + m[3] + ',' + m[4] + ',' + m[5] + ')';
	};

	Transform.prototype.clone = function() {
		return new Transform(this._matrix);
	};

	Transform.fromString = function(str, result) {
		return TransformParser.parse(str, result);
	};

	Transform.prototype.toString = function() {
		return this.format();
	};

	var TransformParser = {

		transformCollectionRegEx: /(\w*)\(([^\)]*)\)/g,
		transformFunctionRegEx: /(\w*)\(([^\)]*)\)/,

		parse: function(str, result) {
			var transform = new Transform();

			str = str.trim();
			if (str.length > 0 && !this.transformCollectionRegEx.test(str)) {
				throw new Error('Invalid transform: "' + str + '"');
			}

			var matches = str.match(this.transformCollectionRegEx);
			if (matches) {
				matches.forEach(function(match) {
					match = match.match(this.transformFunctionRegEx);
					try {
						this.parseFunction(match[1], match[2], transform);
					}
					catch (e) {
						throw new Error('Invalid transform "' + str + '" (' + e.message + ')');
					}		
				}, this);
			}

			if (result) {
				result.matrix(transform.matrix());
				return result;
			}
			else {
				return transform;
			}
		},

		parseFunction: function(name, params, transform) {
			var parser = this.functionParsers[name];
			if (!parser) {
				throw new Error('"' + name + '" is not a valid transformation');
			}

			if (xo.isString(params)) {
				params = params.split(',').map(function(param) {
					return param.trim();
				});
			}

			return parser.call(this, params, transform);
		},

		functionParsers: {
			matrix: function(params, transform) {
				var matrix = params.map(function(param) {
					return +param;
				});
				transform.append(matrix);
			},
			translate: function(params, transform) {
				var deltaX = parseFloat(params[0]),
					deltaY = parseFloat(params[1]);
				transform.translate(deltaX, deltaY);
			},
			rotate: function(params, transform) {
				var angle = this.parseAngle(params[0]);
				transform.rotate(angle);
			},
			scale: function(params, transform) {
				var scaleX = parseFloat(params[0]),
					scaleY = parseFloat(params[1]);
				transform.scale(scaleX, scaleY);
			},
			skew: function(params, transform) {
				var skewX = this.parseAngle(params[0]),
					skewY = this.parseAngle(params[1]);
				transform.skew(skewX, skewY);
			}
		},

		parseAngle: function(str) {
			if (+str == str || xo.endsWith(str, 'deg')) {
				return this.degreesToRadians(parseFloat(str));
			}
			else if (xo.endsWith(str, 'rad')) {
				return parseFloat(str);
			}
			throw new Error('Transform: invalid units in expression "' + str + '"');
		},

		degreesToRadians: function(angle) {
			return (angle * Math.PI) / 180;
		}
	};

	// [ m11=0, m12=1, m21=2, m22=3, m31=4 (offsetX), m32=5 (offsetY) ]

	var Matrix = {

		createRotation: function(theta, centerX, centerY) {
			var sin = Math.sin(theta),
				cos = Math.cos(theta),
            	dx  = (centerX * (1 - cos)) + (centerY * sin);
            	dy  = (centerY * (1 - cos)) - (centerX * sin);

 			return [ cos, sin, -sin, cos, dx, dy ];
		},

		createScaling: function(scaleX, scaleY, centerX, centerY) {
			var dx = centerX - scaleX * centerX,
				dy = centerY - scaleY * centerY;

			return [ scaleX, 0, 0, scaleY, dx, dy ];
		},

		createSkewing: function(skewX, skewY) {
			return [ 1, Math.tan(skewY), Math.tan(skewX), 1, 0, 0 ];
		},

		createTranslation: function(translateX, translateY) {
			return [ 1, 0, 0, 1, translateX, translateY ];
		},

		determinant: function(m) {
			// det = m11 * m22 - m12 * m21;
			return m[0] * m[3] - m[1] * m[2];
		},

		inverse: function(m) {
			var det = this.determinant(m);
			if (det === 0) {
				throw new Error('Transform not invertible');
			}
			var n11 =  m[3] / det,								//  m(2,2) / det
				n12 = -m[1] / det,								// -m(1,2) / det
				n21 = -m[2] / det,								// -m(2,1) / det
				n22 =  m[0] / det,								//  m(1,1) / det
				n31 = (m[2] * m[5] - m[4] * m[3]) / det,		// (m(2,1) * m(3,2) - m(3,1) * m(2,2)) / det
				n32 = (m[1] * m[4] - m[0] * m[5]) / det;		// (m(1,2) * m(3,1) - m(1,1) * m(3,2)) / det

			return [ n11, n12, n21, n22, n31, n32 ];
		},

		multiply: function(m1, m2) {
			var n11 = m1[0] * m2[0] + m1[1] * m2[2],			// m1(1,1) * m2(1,1) + m1(1,2) * m2(2,1)
			    n12 = m1[0] * m2[1] + m1[1] * m2[3],			// m1(1,1) * m2(1,2) + m1(1,2) * m2(2,2)
			    n21 = m1[2] * m2[0] + m1[3] * m2[2],			// m1(2,1) * m2(1,1) + m1(2,2) * m2(2,1)
			    n22 = m1[2] * m2[1] + m1[3] * m2[3],			// m1(2,1) * m2(1,2) + m1(2,2) * m2(2,2)
			    n31 = m1[4] * m2[0] + m1[5] * m2[2] + m2[4],	// m1(3,1) * m2(1,1) + m1(3,2) * m2(2,1) + m2(3,1)
			    n32 = m1[4] * m2[1] + m1[5] * m2[3] + m2[5];	// m1(3,1) * m2(1,2) + m1(3,2) * m2(2,2) + m2(3,2)

			return [ n11, n12, n21, n22, n31, n32 ];
		},

		isIdentity: function(m) {
			// m(1,1) = 1 & m(1,2) = 0 & m(2,1) = 0 & m(2,2) = 1 & m(3,1) = 0 && m32 = 0
			return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0;
		}
	};

	return Transform;
});
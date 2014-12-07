define(['xo'], function (xo) {
	function FontFamily(familyNames) {
		if (xo.isArray(familyNames)) {
			this.familyNames(familyNames);
		}
		else if (xo.isString(familyNames)) {
			this.css(familyNames);
		}
		else if (!xo.isUndefined(familyNames)) {
			throw new TypeError('familyNames must be an Array or String');
		}
	};

	FontFamily.prototype.contentProperty = 'css';

	FontFamily.prototype.familyNames = xo.property({
		type: Array,
		get: function() {
			var css = this.css();
			if (css) {
				return css.split(',');
			}
			else {
				return [];
			}
		},
		set: function(newValue) {
			if (newValue) {
				var css = newValue.join(',');
				this.css(css);
			}
			else {
				this.css('');
			}
		}
	});

	FontFamily.prototype.css = xo.property({
		type: String
	});

	return FontFamily;
});
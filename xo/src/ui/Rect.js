define([], function () {
	function Rect() {
		switch (arguments.length) {
			case 0:
				this.x = this.y = 0;
				this.width = this.height = 0;
				break;
			case 1:
				var arg = arguments[0];
				this.x = arg.x || arg.left || 0;
				this.y = arg.y || arg.top || 0;
				this.width = arg.width || (arg.right - arg.left) || 0;
				this.height = arg.height || (arg.bottom - arg.top) || 0;
				break;
			case 2:
				var arg0 = arguments[0];
				var arg1 = arguments[1];
				this.x = arg0.x;
				this.y = arg0.y;
				this.width = arg1.width;
				this.height = arg1.height;
				break;
			case 4:
				this.x = arguments[0];
				this.y = arguments[1];
				this.width = arguments[2];
				this.height = arguments[3];
				break;
			default:
				throw 'Rect: invalid arguments "' + arguments.join(', ') + '"';
		}
	}

	Rect.prototype.left = function() {
		return this.x;
	};

	Rect.prototype.top = function() {
		return this.y;
	};

	Rect.prototype.right = function() {
		return this.x + this.width;
	}

	Rect.prototype.bottom = function() {
		return this.y + this.height;
	};

	Rect.prototype.contains = function(point) {
		return point.x >= this.x && point.y >= this.y && point.x <= this.right() && point.y <= this.bottom();
	};

	return Rect;
});
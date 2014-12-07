define(['xo', './ToggleButton'], function (xo, ToggleButton) {
	function RadioButton() {
		ToggleButton.call(this);
		xo.Event.addHandler(this, 'isChecked', this._onIsCheckedChanged, this);
	};

	RadioButton.prototype = Object.create(ToggleButton.prototype);
	RadioButton.prototype.constructor = RadioButton;

	RadioButton._groups = {};

	RadioButton.prototype.groupName = xo.property({
		changed: function(change) {
			if (change.oldValue) {
				this._removeFromGroup(change.oldValue);
			}
			if (change.newValue) {
				this._addToGroup(change.newValue);
			}
		}
	});

	RadioButton.prototype._removeFromGroup = function(groupName) {
		this._group.splice(this._group.indexOf(this), 1);
		if (this._group.length === 0) {
			delete RadioButton._groups[groupName];
		}
		this._group = null;
	};

	RadioButton.prototype._addToGroup = function(groupName) {
		this._group = RadioButton._groups[groupName] || (RadioButton._groups[groupName] = []);
		this._group.push(this);
	};

	RadioButton.prototype._onIsCheckedChanged = function(change) {
		if (change.newValue && this._group) {
			this._group.forEach(function(radioButton) {
				if (radioButton !== this) {
					radioButton.isChecked(false);
				}
			}, this);
		}
	};

	RadioButton.prototype.onClick = function() {
		this.isChecked(true);
	};

	return RadioButton;
});
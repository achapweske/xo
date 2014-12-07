define(['xo', 'src/ui/Grid', 'xo!MyView.xml'], function (xo, Grid, template) {

	function MyView() {
		Grid.call(this);
		template.update(this);
	};

	MyView.prototype = Object.create(Grid.prototype);
	MyView.prototype.constructor = MyView;

	MyView.prototype.onClick = function(sender, e) {
		var position = e.getPosition(e.target());
		alert('clicked\nsender: ' + sender + '\ntarget: ' + e.target() + '\ncurrentTarget: ' + e.currentTarget() + '\nposition: ' + position.x + ',' + position.y );
	};

	MyView.prototype.onClicked = function(sender, e) {
	}

	MyView.prototype.onToggle = function() {
		alert('checked: ' + this.toggleButton.isChecked());
	};

	MyView.prototype.onRepeat = function() {
		console.log('clicked');
	};

	MyView.prototype.onDragDelta = function(sender, e) {
		console.log(e);
	};

	return MyView;
});
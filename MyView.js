define(['xo', 'src/core/Dictionary', 'src/ui/Grid', /*'xo!MyView.xml',*/ 'src/ui/Style', 'src/ui/Property', 'src/ui/Column', 'src/ui/TextBlock', 'src/ui/Button', 'src/ui/Label', 'src/ui/VerticalPanel'],
	function (xo, Dictionary, Grid, /*template,*/ Style, Property, Column, TextBlock, Button, Label, VerticalPanel) {
/*
	var MyView = Grid.extend({
		construct: function() {
			template.update(this);
		},

		onClick: function(sender, e) {
			var position = e.getPosition(e.target());
			//alert('clicked\nsender: ' + sender + '\ntarget: ' + e.target() + '\ncurrentTarget: ' + e.currentTarget() + '\nposition: ' + position.x + ',' + position.y);
		},

		onClicked: function(sender, e) {
			alert('clicked');
		},

		onToggle: function() {
			alert('checked: ' + this.toggleButton.isChecked());
		},

		onRepeat: function() {
			console.log('clicked');
		},

		onDragDelta: function(sender, e) {
			console.log(e);
		}
	});
*/
	var titleStyle = new Style({
		fontSize: 24,
		foreground: '#00AADE',
		margin: '40 0 20',
		horizontalAlignment: 'center'
	});
	Dictionary.ref.set(titleStyle, 'titleStyle');

	var MyView = Grid({
		definitions: [
			titleStyle
		],
		rowCount: 1,
		columns: [
			Column({ width: 200 }),
			Column({ width: 200 }),
			Column(),
			Column({ width: 5 }),
			Column({ width: 250, background: 'lightgray' })
		],
		children: [
			VerticalPanel({
				width: 200,
				padding: 30,
				children: [
					TextBlock({ style: '@titleStyle', text: 'Button' })
				]
			})
		]
	});

/*
	MyView = MyView({
		
		definitions: {
			titleStyle: new Style({
				properties: [
					Property({ name: 'fontSize', value: 24 }),
					Property({ name: 'foreground', value: '#00AADE' }),
					Property({ name: 'margin', value: '40 0 20' }),
					Property({ name: 'horizontalAlignment', value: 'center' })
				]
			})
		},
		rowCount: 1,
		columns: [
			Column({ width: 200 }),
			Column({ width: 200 }),
			Column(),
			Column({ width: 5 }),
			Column({ width: 250, background: 'lightgray' })
		],
		children: [
			VerticalPanel({
				width: 200,
				padding: 200,
				children: [
					TextBlock({ style: Lookup('titleStyle'), text: 'Button'}),
					Button({ horizontalAlignment: 'center', click: 'onClicked', content: 'Button' }),
					TextBlock({ text: 'Label' }),
					Label({ horizontalAlignment: 'center', content: 'Label' })
				]
			})
		]
	});
*/
	return MyView;
});
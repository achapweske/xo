define(['xo', 'src/ui/Application', 'xo!MyApp.xml'], function (xo, Application, template) {

	var MyApp = Application.extend({
		construct: function($super) {
			$super();
			template.update(this);
		}
	});

	return MyApp;
});
define(['xo', 'src/ui/Application', 'xo!MyApp.xml'], function (xo, Application, template) {

	function MyApp() {
		Application.call(this);
		template.update(this);
	};

	MyApp.prototype = Object.create(Application.prototype);
	MyApp.prototype.constructor = MyApp;

	return MyApp;
});
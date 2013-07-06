require.config({
	"baseUrl": "./js/",
	paths: {
		jquery: 'lib/jquery-1.10.1.min',
		template: 'lib/handlebars',
		twojs: 'lib/two.min.js',
		backbone: 'backbone-min',
		underscore: 'underscore-min',
		html: 'freehtml'
	},
  priority: ['jquery']
});
require(['jquery','html','classobj' ], function ($,_html,c){
		var html = _html.htmlObj;
		var provider = _html.classObj.getInstance();
		var doc = {
			'body' : new html('body'), 
			header2 : new html({tagName:"div",classes:"headerM headerGrey"}),
			header2_child : new html({tagName:"div",classes:"container positionR"}),
			header2_link : new html({tagName:"a",classes: "textDecNone displayBlock paddingTopLL fontsizeXxlarge",content:"use Twojs"}),
			container : new html({tagName:"div",classes:"container marginTop"})
		};   
		//doc.container.add();
		doc.header2.add(doc.header2_child.add(doc.header2_link));
		doc.body.add(doc.header2);
});

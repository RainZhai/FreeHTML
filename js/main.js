require.config({
	"baseUrl": "./js/",
	paths: {
		jquery: 'jquery-1.10.1.min',
		html: 'freehtml'
	},
  priority: ['jquery']
});
require(['jquery','html'], function ($,_html){
	require(['classobj'], function (c) {
		var html = _html.htmlObj;
		var provider = _html.classObj.getInstance();
		var BoxIf = new _html.interface('Box', ['add', 'remove']); 
		var links_class = provider.getClass(c,'font','1')+"headerLink headerLinkBlue left paddingRight paddingLeft displayBlock textDecNone";
		var doc = {
			header : new html({"id":"header","tagName":"div","class":"header headerBlue"}),
			nav : new html({"tagName":"nav","class":"listStyleNo positionR clearfix"}),
			links_1 : new html({tagName:"a",class: links_class,content:"link1"}),
			links_2 : new html({tagName:"a",class: links_class,content:"link2"})
		};
		doc.header.actions.add = function(ele){
			div.jQobj.append(ele);
		};
		doc.header.actions.remove = function(){div.jQobj.empty();};
		_html.ensureImplements(doc.header.actions,BoxIf);
		doc.header.setParent('body');
		doc.header.addContent(doc.nav);
		doc.nav.addContent(doc.links_1).addContent(doc.links_2);
	})
});

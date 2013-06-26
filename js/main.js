require.config({
	"baseUrl": "./js/",
	paths: {
		jquery: 'lib/jquery-1.10.1.min',
		template: 'lib/handlebars',
		html: 'freehtml'
	},
  priority: ['jquery']
});
require(['jquery','html','classobj','template'], function ($,_html,c,t){
		var html = _html.htmlObj;
		var provider = _html.classObj.getInstance();
		var BoxIf = new _html.interface('Box', ['add']);
		var links_class = provider.getClass(c,'font','1')+ c.font.bold +" headerLink headerLinkBlue left paddingRight paddingLeft displayBlock textDecNone";
		var doc = {
			'body' : new html('body'),
			header : new html({"id":"header","tagName":"div","class":"header headerBlue"}),
			nav : new html({"tagName":"nav","class":"listStyleNo positionR clearfix"}),
			links_1 : new html({tagName:"a",class: links_class,content:"link1"}),
			links_2 : new html({tagName:"a",class: links_class,content:"link2"}),
			header2 : new html({"tagName":"div","class":"headerM headerGrey"}),
			header2_child : new html({"tagName":"div","class":"container positionR"}),
			header2_link : new html({tagName:"a",class: "textDecNone displayBlock paddingTopLL fontsizeXxlarge",content:"FreeHTML"}),
			container : new html({"tagName":"div","class":"container marginTop"}),
			content : new html({"tagName":"div","class":"content"}),
			main:  new html({"tagName":"div","class":"c_main main mainRight positionR"}),
			userlist: new html({"tagName":"div"})
		};
		doc.header.actions.add = function(ele){
			div.jQobj.append(ele);
		};
		_html.ensureImplements(doc.header.actions,BoxIf);
		doc.header.addContent(doc.nav);
		doc.nav.addContent(doc.links_1).addContent(doc.links_2);
		// compile our template
		var userlist = t.compile($("#people-template").html());
		var data = {
			people: [
				{ first_name: "Alan", last_name: "Johnson", phone: "1234567890", email: "alan@test.com", member_since: "Mar 25, 2011" },
				{ first_name: "Allison", last_name: "House", phone: "0987654321", email: "allison@test.com", member_since: "Jan 13, 2011" }
			]
		};
		doc.userlist.addContent(userlist(data));
		doc.main.addContent(doc.userlist)
		var sidebar = t.compile($("#sidebar-template").html());
		doc.container.addContent(sidebar({category:"FreeHTML介绍",introduction:"FreeHTML是一个快速创建html页面的框架"})).addContent(doc.main);
		doc.header2.addContent(doc.header2_child.addContent(doc.header2_link));
		doc.body.addContent(doc.header).addContent(doc.header2).addContent(doc.container);
});

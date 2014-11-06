require.config({
	"baseUrl": "./js/",
	paths: {
		jquery: 'lib/jquery-1.10.1.min',
		template: 'lib/template',
		html: 'freehtml'
	},
  priority: ['jquery']
});
require(['jquery','html','classobj','template'], function ($,_html,c,t){
		var html = _html.htmlObj;
		var provider = _html.classObj.getInstance();
		var BoxIf = new _html.interface('Box', ['add']);
		var links_class = provider.getClass(c,'width','30')+ c.font.bold +" headerLink headerLinkBlue left paddingRight paddingLeft displayBlock textDecNone";
		var doc = {
			'body' : new html('body'),
			header : new html({id:"header",tagName:"div",classes:"header headerBlue"}),
			nav : new html({id:'nav',tagName:"nav",classes:"listStyleNo positionR clearfix"}),
			links_1 : new html({tagName:"a",classes: links_class,content:"link1",events:{click:function(){alert(111);}}}),
			links_2 : new html({tagName:"a",classes: links_class,content:"link2"}),
			header2 : new html({tagName:"div",classes:"headerM headerGrey"}),
			header2_child : new html({tagName:"div",classes:"container positionR"}),
			header2_link : new html({tagName:"a",classes: "textDecNone displayBlock paddingTopLL fontsizeXxlarge",content:"FreeHTML"}),
			container : new html({tagName:"div",classes:"container marginTop"}),
			content : new html({tagName:"div",classes:"content"}),
			main:  new html({tagName:"div",classes:"c_main main mainRight positionR",child: new html({tagName:'div',content:"FreeHTML"})}),
			userlist: new html({tagName:"div"})
		};
		doc.header.actions.add = function(ele){
			div.jq.append(ele);
		};
		_html.ensureImplements(doc.header.actions,BoxIf);
		doc.header.add(doc.nav);
		doc.nav.add(doc.links_1,doc.links_2);
		var data = {
			isAdmin: true,
			people: [
				{ first_name: "Alan", last_name: "Johnson", phone: "1234567890", email: "alan@test.com", member_since: "Mar 25, 2011" },
				{ first_name: "Allison", last_name: "House", phone: "0987654321", email: "allison@test.com", member_since: "Jan 13, 2011" }
			]
		};
		// compile our template
		var userlist = t("people-template",data);
		doc.userlist.add(userlist);
		doc.main.add(doc.userlist);
			//.add('article.html .main','url');
		var sidebar = t("sidebar-template", {isAdmin: true, category:"FreeHTML介绍",introduction:"FreeHTML是一个快速创建html页面的插件"});
		doc.container.add(sidebar, doc.main);
		var dom = _html.create('p',{'height':'40px','width':'100%','background':'#ccc','bottom':'0','position':'fixed','left':'0'},{'title':'hello'});
		doc.header2.add(doc.header2_child.add(doc.header2_link));
		doc.body.add(doc.header,doc.header2,doc.container,dom);
		//doc.body.add("#header,#nav");
});

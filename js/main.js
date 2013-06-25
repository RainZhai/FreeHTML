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
		var BoxIf = new _html.interface('Box', ['add', 'remove']); 
		var links_class = provider.getClass(c,'font','1')+"headerLink headerLinkBlue left paddingRight paddingLeft displayBlock textDecNone";
		var doc = {
			header : new html({"id":"header","tagName":"div","class":"header headerBlue"}),
			nav : new html({"tagName":"nav","class":"listStyleNo positionR clearfix"}),
			links_1 : new html({tagName:"a",class: links_class,content:"link1"}),
			links_2 : new html({tagName:"a",class: links_class,content:"link2"}),
			userlist: new html({"tagName":"div"})
		};
		doc.header.actions.add = function(ele){
			div.jQobj.append(ele);
		};
		doc.header.actions.remove = function(){div.jQobj.empty();};
		_html.ensureImplements(doc.header.actions,BoxIf);
		doc.header.addContent(doc.nav);
		doc.nav.addContent(doc.links_1).addContent(doc.links_2);
        // compile our template
        var template = t.compile($("#people-template").html());
        
        var data = {
          people: [
            { first_name: "Alan", last_name: "Johnson", phone: "1234567890", email: "alan@test.com", member_since: "Mar 25, 2011" },
            { first_name: "Allison", last_name: "House", phone: "0987654321", email: "allison@test.com", member_since: "Jan 13, 2011" },
            { first_name: "Nick", last_name: "Pettit", phone: "9836592272", email: "nick@test.com", member_since: "Apr 9, 2009" },
            { first_name: "Jim", last_name: "Hoskins", phone: "7284927150", email: "jim@test.com", member_since: "May 21, 2010" },
            { first_name: "Ryan", last_name: "Carson", phone: "8263729224", email: "ryan@test.com", member_since: "Nov 1, 2008" }
          ]
        };
         
		doc.userlist.addContent(template(data));
		doc.userlist.setParent('body');
		doc.header.setParent('body');
});

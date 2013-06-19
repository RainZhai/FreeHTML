require.config({
	paths: {
		jquery: 'jquery-1.10.1.min'
	},
	shim: {
		'freehtml': {
			deps: ['jquery'], 
			exports: 'freehtml'
		}
	}
});
require(['jquery','freehtml'], function ($){
	require(['classobj'], function (c) {
		var html = $.htmlUtil.htmlObj;
		var provider = $.htmlUtil.classObj.getInstance();
		//console.info(c.getFontStyle('1'));
		var BoxIf = new $.htmlUtil.interface('Box', ['add', 'remove']); 
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
		$.htmlUtil.ensureImplements(doc.header.actions,BoxIf);
		doc.header.setParent('body');
		doc.header.addContent(doc.nav);
		doc.nav.addContent(doc.links_1).addContent(doc.links_2);
	})
});

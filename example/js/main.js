require.config({
	"baseUrl": "../js/",
	paths: {
		jquery: 'lib/jquery-1.10.1.min',
		html: 'freehtml',
		classobj: 'classobj'
	},
  priority: ['jquery']
});
require(['jquery','html','classobj'], function ($,_html,c){
		var html = _html.htmlObj;
		var provider = _html.classObj.getInstance(); 
		var links_class = provider.getClass(c,'width','30')+ c.font.bold;
		var doc = {
			stage: new html('#stage'),
			door: new html({tagName:"div",class:"positionA",css:{bottom:0,left:20,width:1000,height:668,'z-index':100}}), 
			door_1: new html({tagName:"div",css:{width:1000,height:668,'background':'url(images/scence_1/door_1.png) no-repeat center center'}}),
			door_2: new html({tagName:"div",css:{width:1000,height:668,'background':'url(images/scence_1/door_2.png) no-repeat center center'}}),
			door_3: new html({tagName:"div",css:{width:1000,height:668,'background':'url(images/scence_1/door_3.png) no-repeat center bottom'}}),
			column: new html({tagName:"div",class:"positionA",css:{top:315,left:370,width:297,height:152,'z-index':1}}), 
			column_1: new html({tagName:"div",css:{width:297,height:152,'background':'url(images/scence_1/column_1.png) no-repeat center center'}}),
			column_2: new html({tagName:"div",css:{width:297,height:152,'background':'url(images/scence_1/column_2.png) no-repeat center center'}}),
			column_3: new html({tagName:"div",css:{width:297,height:152,'background':'url(images/scence_1/column_3.png) no-repeat center bottom'}})
		};
		doc.stage.css({'background':'url(images/scence_1/base.jpg) no-repeat center center',width:1000,height:668});
		
		doc.door.add(doc.door_1);
		doc.column.add(doc.column_1);
		doc.stage.add(doc.door).add(doc.column);
		$('.item-1').click(function(){
			doc.door.content(doc.door_1.jq.fadeIn(1000));
		});
		$('.item-2').click(function(){
			doc.door.content(doc.door_2.jq.fadeIn(1000));
		});
		$('.item-3').click(function(){
			doc.door.content(doc.door_3.jq.fadeIn(1000));
		});
		$('.item2-1').click(function(){
			doc.column.content(doc.column_1.jq.fadeIn(1000));
		});
		$('.item2-2').click(function(){
			doc.column.content(doc.column_2.jq.fadeIn(1000));
		});
		$('.item2-3').click(function(){
			doc.column.content(doc.column_3.jq.fadeIn(1000));
		});
});

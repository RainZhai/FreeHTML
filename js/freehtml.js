// JavaScript Document
(function($) { 
	$.htmlUtil = {};
	/*
	*  接口声明
	*	 param 1,名称;2,方法数组
	*  例:var BoxIf = new $.rainUtil.interface('Box', ['add', 'remove']);
	*/
	$.htmlUtil.interface = function(name, methods) { 
		if(arguments.length != 2) {
			throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
		}
		
		this.name = name;
		this.methods = [];
		for(var i = 0, len = methods.length; i < len; i++) {
			if(typeof methods[i] !== 'string') {
				throw new Error("Interface constructor expects method names to be passed in as a string.");
			}
			this.methods.push(methods[i]);        
		}
	}
	
	/*
	*  接口实现检查
	*	 param 1,函数;2,接口
	*  例:$.htmlUtil.ensureImplements(div.actions,BoxIf);
	*/
	$.htmlUtil.ensureImplements = function(object) {
		if(arguments.length < 2) {
			throw new Error("Function Interface.ensureImplements called with " + arguments.length  + "arguments, but expected at least 2.");
		}
	
		for(var i = 1, len = arguments.length; i < len; i++) {
			var interface = arguments[i];
			if(interface.constructor !== $.htmlUtil.interface) {
				throw new Error("Function Interface.ensureImplements expects arguments two and above to be instances of Interface.");
			}
			
			for(var j = 0, methodsLen = interface.methods.length; j < methodsLen; j++) {
				var method = interface.methods[j];
				if(!object[method] || typeof object[method] !== 'function') {
					throw new Error("Function ensureImplements: object " 
					  + "does not implement the " + interface.name + " interface. Method " + method + " was not found.");
				}
			}
		} 
	};
	/*
	*  class单体对象声明
	*  例:var c = $.htmlUtil.classObj.getInstance();
	*/
	$.htmlUtil.classObj=(function(){
			var uniqueInstance;
			function constructor() {
				var o = { 
						getClass:function(c/*classes*/,type/*string*/, param/*string*/){
							if(type==='font' && typeof(parseInt(param,10))==='number'){
								return c[type]['fontsize']+'-'+param+' ';
							}
							return c[type][param]+' ';
						}
				};
				return o;
			}
			
			return {
				getInstance: function() {
					if(!uniqueInstance) {
						uniqueInstance = constructor();
					}
					return uniqueInstance;
				}
			}
		})();
	/*
	*  html对象声明
	*	 param 参数对象
	*  例:var div = new $.htmlUtil.htmlObj({"id":"header","tagName":"div","class":"red","content":"hello world"});
	*/
	$.htmlUtil.htmlObj=function(obj) {
		var o = {
			html: null,
			jQobj: null,
			/*设置构造器*/
			constructor: function(){
				o.getHtml();
				o.getJQobj();
			},
			/*检查对象属性*/
			checkObj: function(propName/*string*/) {
				if(!propName){
					throw new Error('Invalid property.');
				}
			},
			/*设置默认动作*/
			actions: function(){},
			/*设置样式*/
			css: function(obj){
				o.jQobj.css(obj);
			},
			/*设置html标签*/
			getHtml: function(){
				if(!o.html){
					if(obj.tagName){
						var id = (function(){ 
							if(obj.id){return ' id="'+obj.id+'"';}
							return ' ';
						})();
						var classes = (function(){ 
							if(obj.class){return ' class="'+obj.class+'"';}
							return ' ';
						})();
						var content = (function(){ 
							if(obj.content){return obj.content;}
							return '';
						})();
						o.html = "<"+obj.tagName+id+classes+">"+content+"</"+obj.tagName+">";
					}
				}
				return o.html;
			},
			/*获取jq对象*/
			getJQobj: function(){
				if(!o.jQobj){
					if(o.html){ o.jQobj =  $(o.html); }
				}
				return o.jQobj;
			},
			/*设置父元素*/
			setParent: function(selector/*string*/){
				$(selector).append(o.getJQobj());
				return o;
			},
			/*设置标签内容*/
			setContent: function(ele/*string | object*/){
				if(typeof(ele)==='object'){
				o.jQobj.empty().append(ele.jQobj);
				}else{
				o.jQobj.empty().append(ele);}
				return o;
			},
			/*添加标签内容*/
			addContent: function(ele/*string | object*/){
				if(typeof(ele)==='object'){
					o.jQobj.append(ele.jQobj);
				}else{
					o.jQobj.append(ele);}
				return o;
			},
			classes: function(classes){
				o.jQobj.addClass(classes);
				return o;
			}
		};
		o.constructor();
		return o;
	}
})(jQuery);
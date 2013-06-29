/**
*	define jquery plugin freehtml
*/
(function($) { 
	$.freehtml = {};
	/*
	*  接口声明
	*	 param 1,名称;2,方法数组
	*  例:var BoxIf = new $.rainUtil.interface('Box', ['add', 'remove']);
	*/
	$.freehtml.interface = function(name, methods) { 
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
	$.freehtml.ensureImplements = function(object) {
		if(arguments.length < 2) {
			throw new Error("Function Interface.ensureImplements called with " + arguments.length  + "arguments, but expected at least 2.");
		}
	
		for(var i = 1, len = arguments.length; i < len; i++) {
			var interface = arguments[i];
			if(interface.constructor !== $.freehtml.interface) {
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
	$.freehtml.classObj=(function(){
			var uniqueInstance;
			function constructor() {
				var o = {
						getClass:function(c/*classes*/,type/*string*/, param/*string*/){
							if(c && type && typeof(parseInt(param,10))==='number'){
								var name;
								switch(type){
									case 'fontsize':
										name = c['font']['fontsize']+'-'+param+' '; break;
									case 'textIndent':
										name = c['text']['textIndent']+'-'+param+' '; break;
									case 'lineHight':
										name = c['box']['lineHight']+'-'+param+' '; break;
									case 'width':
										name = c['box']['width']+'-'+param+' '; break;
									case 'fwidth':
										name = c['box']['width-fluid']+'-'+param+' '; break;
									case 'height':
										name = c['box']['height']+'-'+param+' '; break;
									case 'fheight':
										name = c['box']['height-fluid']+'-'+param+' '; break;
									case 'padding':
										name = c['box']['padding']+'-'+param+' '; break;
									case 'paddingTop':
										name = c['box']['paddingTop']+'-'+param+' '; break;
									case 'paddingBottom':
										name = c['box']['paddingBottom']+'-'+param+' '; break;
									case 'paddingLeft':
										name = c['box']['paddingLeft']+'-'+param+' '; break;
									case 'paddingRight':
										name = c['box']['paddingRight']+'-'+param+' '; break;
									case 'margin':
										name = c['box']['margin']+'-'+param+' '; break;
									case 'marginTop':
										name = c['box']['marginTop']+'-'+param+' '; break;
									case 'marginBottom':
										name = c['box']['marginBottom']+'-'+param+' '; break;
									case 'marginLeft':
										name = c['box']['marginLeft']+'-'+param+' '; break;
									case 'marginRight':
										name = c['box']['marginRight']+'-'+param+' '; break;
									case 'z':
										name = c['box']['z']+'-'+param+' '; break;
								}
								return name;
							} 
							return '';
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
	*	param 参数对象
	*	例:var div = new $.htmlUtil.htmlObj({"id":"header","tagName":"div","class":"red","content":"hello world"});
	*	html('body') 是否给dom元素封装这些方法??
	*/
	$.freehtml.htmlObj=function(obj) {
		var o = {
			html: null,
			jQobj: null,
			parent: null,
			child: null,
			/*设置构造器*/
			constructor: function(){
				o.getHtml();
				o.getJQobj();
				//设置对象的父级元素
				if(o.parent){ o.setParent(o.parent);}
				//设置对象的子级元素
				if(o.child){ o.add(o.child);}
			},
			/*检查对象属性*/
			checkObj: function(propName/*string*/, obj) {
				if(!(propName in obj)){
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
					//传入参数为string,html对象为传入字符
					if(typeof(obj)==='string'){ o.html = obj;}
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
			content: function(ele/*string | jq | htmlobj*/){
				var _ele = ele.jQobj || ele;
				o.jQobj.empty().append(_ele);
				return o;
			},
			/*添加标签内容*/
			add: function(ele/*string | jq | htmlobj*/){
				var _ele = ele.jQobj || ele;
				o.jQobj.append(_ele);
				return o;
			},
			/*清除标签内容*/
			remove: function(ele/*string | jq | htmlobj*/){
				if(ele){
				var _ele = ele.jQobj || ele;
				o.jQobj.remove(_ele);
				}else{
				o.jQobj.empty();
				}
				return o;
			},
			//
			/*添加class样式名*/
			classes: function(classes){
				o.jQobj.addClass(classes);
				return o;
			}
		};
		o.constructor();
		return o;
	}
	
	return $.freehtml;
})(jQuery);
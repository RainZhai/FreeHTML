# FreeHTML.js
FreeHTML.js 是一个基于jquery的html代码创建工具，它可以用来完成各种html标签的创建，并且能够使用内置的各种css样式集合来进行样式的设置。

FreeHTML.js使用requirejs来管理模块.并使用handlebars来设置html模板,css框架使用[Rain CSS](http://www.webdevelopmentmachine.com/rain-css/index.html)。

首先，引入freehtml.js，然后通过new html()的方式来创建html对象:
var html = _html.htmlObj;
var doc = {
	'body' : new html('body'),
	header : new html({id:"header",tagName:"div",classes:"header headerBlue"})
}
html对象提供一系列方法来完成去其他html对象的各种操作。
例如将header加入到body元素里面:
doc.body.add(doc.header);

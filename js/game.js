
 	//声明蘑菇
	var Mushroom = function(props){	
		Mushroom.superClass.constructor.call(this, props);
		this.init();
	};
	Q.inherit(Mushroom, Q.DisplayObjectContainer);

	Mushroom.prototype.init = function(){  
	//松鼠的头部，是一个MovieClip类型。
	this.head = new Q.MovieClip({id:"head", image:Q.getDOM("headIdle"), useFrames:true, interval:1, x:5, y:0});
	this.head.addFrame([
	{rect:[0,0,66,56]},
	{rect:[69,0,66,56]},
	{rect:[138,0,66,56]},
	{rect:[207,0,66,56]}
	]);

	//松鼠的身体，也是一个MovieClip类型。
	this.body = new Q.MovieClip({id:"body", image:Q.getDOM('bodyWalk'), useFrames:true, interval:1, x:0, y:25});
	this.body.addFrame([
	{rect:[0,0,108,66]},
	{rect:[109,0,108,66]},
	{rect:[218,0,108,66]},
	{rect:[327,0,108,66]},
	{rect:[436,0,108,66]},
	{rect:[545,0,108,66]},
	{rect:[0,70,108,66]},
	{rect:[109,70,108,66]},
	{rect:[218,70,108,66]},
	{rect:[327,70,108,66]},
	{rect:[436,70,108,66]}
	]);

	//由头部和身体组成了一只松鼠。
	this.addChild(this.body, this.head);
			//初始化数据
			this.eventChildren = false;
			this.jumping = false;
			this.speedY = this.currentSpeedY = 30;    
			this.originY = this.y;
	};

	Mushroom.prototype.move = function(e){ 
		if(!this.jumping) 
		{
			this.jumping = true;
			this.currentSpeedY = this.speedY;
		}
	}
	//松鼠的更新函数，此方法会不断的被quark系统调用而产生跳跃动画。
	Mushroom.prototype.update = function(){
    if(this.jumping){
        this.currentSpeedY -= 3;
        this.y -= this.currentSpeedY; 
        if(this.originY <= this.y){
            this.y = this.originY;
            this.jumping = false;
        }
    }
	};
	//=================================================
	var container,params, timer, stage, context, em, squirrel;
	container = Q.getDOM("container");
	container.style.background = "-moz-linear-gradient(top, #00889d, #94d7e1, #58B000)";
	params = Q.getUrlParams();
	console.info(params.canvas);
	if(params.canvas){
		var canvas = Quark.createDOM("canvas", {width:480, height:320, style:{position:"absolute",background:"-moz-linear-gradient(top, #00889d, #94d7e1, #58B000)"}});
		container.appendChild(canvas);
		context = new Quark.CanvasContext({canvas:canvas});
	}else{
		context = new Q.DOMContext({canvas:container});
	}	  
	
	//初始化舞台
	stage = new Q.Stage({context:context, width:480, height:320, update:function(){
		frames++;
		//this.x++;
	}});
	var background = new Q.DisplayObjectContainer({width:1000, height:320, x:-1000, y:0,update:function(){
		this.x+=4;
	}});
	stage.addChild(background);
	var rect1 = new Q.Graphics({width:100, height:100, x:0, y:0});
	rect1.drawRect(0, 0, 100, 100).lineStyle(1, "#000").beginFill("red").endFill().cache();
	background.addChild(rect1);
	//初始化timer并启动
	timer = new Q.Timer(1000/30);
	timer.addListener(stage);
	timer.start();

	//注册舞台事件，使舞台上的元素能接收交互事件
	em = new Q.EventManager();
	var events = Q.supportTouch ? ["touchend"] : ["mouseup","mousemove"];
	em.registerStage(stage, events, true, true);
	em.register(stage, events,function(e){ mushroom.x = e.pageX- mushroom.width/2;}, true, true);
  //蘑菇实例   
	var mushroom = new Mushroom({id:"squirrel", x:200, y:200, autoSize:true});
	stage.addChild(mushroom);

	//为松鼠添加touchend或mouseup事件侦听，控制其跳跃。
	mushroom.addEventListener(events[0], mushroom.move);
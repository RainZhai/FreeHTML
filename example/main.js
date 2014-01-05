
(function(){

window.onload = function()
{
	game.init();
};
	
var game = 
{
	res: [
	{id:"splash", size:372, src:"images/splash.png"},
	{id:"ray", size:69, src:"images/ray.png"},
	{id:"btns", size:77, src:"images/btns.png"},
	{id:"dolphin", size:186, src:"images/dolphin.png"},
	{id:"ball", size:151, src:"images/ball.png"},
	{id:"wave1", size:42, src:"images/wave_1.png"},
	{id:"wave2", size:50, src:"images/wave_2.png"},
	{id:"wave3", size:49, src:"images/wave_3.png"},
	{id:"island", size:19, src:"images/island.png"},
	{id:"cloud", size:37, src:"images/cloud.png"},
	{id:"sun", size:14, src:"images/sun.png"},
	{id:"num1", size:15, src:"images/num1.png"},
	{id:"num2", size:29, src:"images/num2.png"}
	],
	
	container: null,
	width: 0,
	height: 0,
	params: null,
	frames: 0,
	
	fps: 40,
	timer: null,
	eventTarget: null,
	state: null,
	
	dolphin: null,
	balls: [],
	maxBalls: 5,
	collidedBall: null,
	
	time: {total:120, current:120},
	score: 0,
	scoreNum: null
};

var STATE = 
{
	MENU: 0,
	MAIN: 1,
	OVER: 2
};

var ns = window.game = game;

game.init = function()
{
	//加载进度信息
	var container = Q.getDOM("container");
	var div = document.createElement("div");
	div.style.position = "absolute";
	div.style.width = container.clientWidth + "px";
	div.style.left = "0px";
	div.style.top = (container.clientHeight >> 1) + "px";
	div.style.textAlign = "center";
	div.style.color = "#fff";
	div.style.font = Q.isMobile ?  'bold 16px 黑体' : 'bold 16px 宋体';
	div.style.textShadow = Q.isAndroid ? "0 2px 2px #111" : "0 2px 2px #ccc";
	container.appendChild(div);
	this.loader = div;
    
    //隐藏浏览器顶部导航
    setTimeout(game.hideNavBar, 10);    
    if(Q.supportOrient)
    {
        window.onorientationchange = function(e)
        {
            game.hideNavBar();
            game.calcStagePosition();
        };
    }    
	
    //加载图片素材
	var loader = new Q.ImageLoader();
	loader.addEventListener("loaded", Q.delegate(this.onLoadLoaded, this));
	loader.addEventListener("complete", Q.delegate(this.onLoadComplete, this));
	loader.load(this.res);
};

//加载进度条
game.onLoadLoaded = function(e)
{
	this.loader.innerHTML = "正在加载资源中，请稍候...<br>";
	this.loader.innerHTML += "(" + Math.round(e.target.getLoadedSize()/e.target.getTotalSize()*100) + "%)";
}

//加载完成
game.onLoadComplete = function(e)
{
	e.target.removeAllEventListeners();
	Q.getDOM("container").removeChild(this.loader);
	this.loader = null;
	
	this.images = e.images;
	//初始化一些类
	ns.Ball.init();
	ns.Num.init();
	//启动游戏
	this.startup();
}

//获取图片资源
game.getImage = function(id)
{
	return this.images[id].image;
}

//启动游戏
game.startup = function()
{
	//手持设备的特殊webkit设置
	if(Q.isWebKit && Q.supportTouch)
	{
		document.body.style.webkitTouchCallout = "none";
		document.body.style.webkitUserSelect = "none";
		document.body.style.webkitTextSizeAdjust = "none";
		document.body.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
	}
	
	//初始化容器设置
	var colors = ["#00c2eb", "#cbfeff"];
	this.container = Q.getDOM("container");
	this.container.style.overflow = "hidden";
	this.container.style.background = "-moz-linear-gradient(top, "+ colors[0] +", "+ colors[1] +")";
	this.container.style.background = "-webkit-gradient(linear, 0 0, 0 bottom, from("+ colors[0] +"), to("+ colors[1] +"))";
	this.container.style.background = "-o-linear-gradient(top, "+ colors[0] +", "+ colors[1] +")";
	this.container.style.filter = "progid:DXImageTransform.Microsoft.gradient(startColorstr="+ colors[0] +", endColorstr="+ colors[1] +")";
	this.width = this.container.clientWidth;
	this.height = this.container.clientHeight;

    //获取URL参数设置
	this.params = Q.getUrlParams();
    this.maxBalls = this.params.balls || 5;
    this.time = this.params.time ? {total:this.params.time, current:this.params.time} : {total:120, current:120};
    this.fps = this.params.fps || 40;
	
	//初始化context
	var context = null;
	if(this.params.canvas)
	{
		var canvas = Q.createDOM("canvas", {id:"canvas", width:this.width, height:this.height, style:{position:"absolute"}});
		this.container.appendChild(canvas);
		this.context = new Q.CanvasContext({canvas:canvas});
	}else
	{
		this.context = new Q.DOMContext({canvas:this.container});
	}
	
	//创建舞台
	this.stage = new Q.Stage({width:this.width, height:this.height, context:this.context, update:Q.delegate(this.update, this)});
	
	//初始化定时器
	var timer = new Q.Timer(1000 / this.fps);
	timer.addListener(this.stage);
	timer.addListener(Q.Tween);
	timer.start();
	this.timer = timer;
		
	//预加载背景音乐
	var audio = new Quark.Audio("sounds/test.mp3", true, true, true);
	this.audio = audio;
	
	//注册事件
	var me = this;
	var em = new Q.EventManager();
	var events = Q.supportTouch ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];
	em.register(this.context.canvas, events, function(e)
	{
		var ne = (e.touches && e.touches.length > 0) ? e.touches[0] : 
			(e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;
		//确保touchend事件的类型正确
        if(Q.supportTouch) ne.type = e.type;

		var x = ne.pageX - me.stage.stageX, y = ne.pageY - me.stage.stageY;
		var obj = me.stage.getObjectUnderPoint(x, y);
		
		//加载音效
		if(me.audio && !me.audio.loading)
		{
			me.audio.loading = true;
			me.audio.load();
		}
		
		if(me.eventTarget != null && me.eventTarget != obj)
		{
			if(me.eventTarget.onEvent != null) me.eventTarget.onEvent({type:"mouseout"});
			me.eventTarget = null;
		}
		if(obj != null)
		{
			me.eventTarget = obj;
			if(obj.useHandCursor) me.context.canvas.style.cursor = "pointer";
			if(obj.onEvent != null) obj.onEvent(ne);
		}
		if(me.state == STATE.MAIN)
		{
			if(ne.type == "touchend" || ne.type == "mouseup" && obj != me.pauseBtn)
			{
				me.dolphin.jump();
			}
		}else if(me.state == STATE.OVER && ne.type != "mousemove" && ne.type != "touchmove")
		{
			//me.restart();
		}
	}, true, true);
	
	//按键事件
	em.register(document, ["keydown", "keyup"], function(e)
	{
		var key = e.keyCode;
		if(me.state != STATE.MAIN) return;		
		if(key == Q.KEY.A || key == Q.KEY.LEFT)
		{
			if(e.type == "keydown") me.dolphin.move(-1);
			else if(e.type == "keyup") me.dolphin.stopMove();
		}else if(key == Q.KEY.D || key == Q.KEY.RIGHT)
		{
			if(e.type == "keydown") me.dolphin.move(1);
			else if(e.type == "keyup") me.dolphin.stopMove();
		}else if(key == Q.KEY.SPACE)
		{
			me.dolphin.jump();
		}
	}, false, false);
	
	//显示开始菜单
	this.showMenu();
	
	//显示FPS
	this.showFPS();
};

//显示开始菜单
game.showMenu = function()
{	
	if(this.ray == null)
	{
		//旋转的光线
		var ray = new Q.Bitmap({id:"ray", image:this.getImage("ray")});
		ray.scaleX = ray.scaleY = 1.2;
		ray.regX = ray.width >> 1;
		ray.regY = ray.width >> 1;
		ray.x = this.width >> 1;
		ray.y = this.height >> 1;
		this.ray = ray;
		
		//启动画面
		var splash = new Q.Bitmap({id:"splash", image:this.getImage("splash")});
		splash.scaleX = splash.scaleY = 0.8;
		splash.x = 100;
		splash.y = 0;
		this.splash = splash;
		
		//开始按钮
		var playBtn = new Q.Button({id:"playBtn", image:this.getImage("btns")});
		playBtn.setUpState({rect:[0,286,200,200]});
		playBtn.setOverState({rect:[0,86,200,200]});
		playBtn.regX = playBtn.width >> 1;
		playBtn.regY = playBtn.height >> 1;
		playBtn.x = this.width >> 1;
		playBtn.y = (this.height >> 1) + 30;
		this.playBtn = playBtn;
		playBtn.onEvent = function(e)
		{
			Q.Button.prototype.onEvent.call(this, e);
			if(e.type == "mouseup" || e.type == "touchend")
			{
				game.stage.removeAllChildren();
				game.context.canvas.style.cursor = "";
				if(game.state == STATE.MENU)
				{				
					trace("game start");
					setTimeout(Q.delegate(game.showMain, game), 100);
				}else if(game.state == STATE.OVER)
				{
					trace("game restart");
					game.overlay.parentNode.removeChild(game.overlay);
					game.stage.removeAllChildren();			
					game.score = 0;
					game.time.current = game.time.total;
					game.timer.paused = false;
					setTimeout(Q.delegate(game.showMain, game), 100);
				}
			}else if(e.type == "mouseout")
			{
				game.context.canvas.style.cursor = "";
			}
		}
		
		//帮助提示
		var tip = Q.createDOM("div", {id:"tip", style:
		{
			position: "absolute",
			width: this.width + "px",
			height: "50px",
			top: (this.height-60) + "px",
			textAlign: "center",
			color: "#000",
			font: Q.isMobile ?  'bold 24px 黑体' : 'bold 24px 宋体',
			textShadow: Q.isAndroid ? "0 2px 2px #111" : "0 2px 2px #ccc"
			
		}});
		tip.innerHTML = "操作提示：A或←键向左，D或→键向右，空格键或鼠标点击跳跃。<br>手持设备支持重力感应操作、点击跳跃。";
		this.tip = tip;
	}
	
	this.state = STATE.MENU;
	this.stage.addChild(this.ray, this.splash, this.playBtn);
	this.container.appendChild(this.tip);
}

//游戏主场景
game.showMain = function()
{
	var me = this;
	//设置当前状态
	this.state = STATE.MAIN;
	
	if(this.tip.parentNode) this.tip.parentNode.removeChild(this.tip);
	
	//启动重力感应
	Q.Orientation.register(function(data){game.acceleration = data;});
	
	if(this.cloud == null)
	{
		//云层
		var cloud = new Q.Bitmap({id:"cloud", image:this.getImage("cloud")});
		cloud.y = -100;
		cloud.speedY = 0.2;
		cloud.dirY = -1;
		this.cloud = cloud;
		
		//阳光
		var sun = new Q.Bitmap({id:"sun", image:this.getImage("sun")});
		this.sun = sun;
		
		//海岛
		var island = new Q.Bitmap({id:"island", image:this.getImage("island")});
		island.x = this.width - island.width >> 1;
		island.y = this.height - island.height - 60;
		this.island = island;
		
		//后层波浪
		var waveBack = new Q.Bitmap({id:"waveBack", image:this.getImage("wave3")});
		waveBack.x = this.width - waveBack.width >> 1;
		waveBack.y = this.height - waveBack.height - 20;
		waveBack.speedX = 0.2;
		waveBack.dirX = 1;
		this.waveBack = waveBack;
		
		//中层波浪
		var waveMiddle = new Q.Bitmap({id:"waveMiddle", image:this.getImage("wave2")});
		waveMiddle.x = this.width - waveMiddle.width >> 1;
		waveMiddle.y = this.height - waveMiddle.height + 25;
		waveMiddle.speedX = 0.2;
		waveMiddle.dirX = 1;
		this.waveMiddle = waveMiddle;
		
		//创建海豚
		var dolphin = new ns.Dolphin({id:"dolphin"});
		dolphin.scaleX = dolphin.scaleY = 0.40;
		this.dolphin = dolphin;
		
		//创建下落的球组
		this.createBalls();
		
		//前景波浪
		var waveFront = new Q.Bitmap({id:"waveFront", image:this.getImage("wave1")});
		waveFront.x = this.width - waveFront.width >> 1;
		waveFront.y = this.height - waveFront.height + 15;
		waveFront.speedX = 0.3;
		waveFront.dirX = 1;
		this.waveFront = waveFront;
		
		//移动波浪和云层
		this.changeWaveDirection();
		this.timer.addListener({step:function()
		{
			me.moveWave(me.waveBack);
			me.moveWave(me.waveMiddle);
			me.moveWave(me.waveFront);
			game.cloud.y += game.cloud.speedY * game.cloud.dirY;
		}});
		
		//每隔一段时间改变波浪和云层的运行方向
		var delay = function()
		{
			me.timer.delay(function()
			{
				game.changeWaveDirection();
				game.cloud.dirY = -game.cloud.dirY;
				delay();
			}, 5000);
		}
		delay();
		
		//阳光若隐若现动态效果
		Q.Tween.to(me.sun, {alpha:0.2}, {time:1500, reverse:true, loop:true});
		
		/*/倒计时图标
		var clock = new Q.Bitmap({id:"clock", image:this.getImage("clock")});
		clock.scaleX = clock.scaleY = 0.8;
		clock.x = 10;
		clock.y = 8;
		this.clock = clock;
		//*/
		
		//暂停、继续按钮
		var pauseBtn = new Q.Button({id:"pauseBtn", image:this.getImage("btns")});
		pauseBtn.setUpState({rect:[86,0,86,86]});
		pauseBtn.setOverState({rect:[0,0,86,86]});
		pauseBtn.x = -2;
		pauseBtn.y = -2;
		this.pauseBtn = pauseBtn;
		this.pauseBtn.onEvent = function(e)
		{
			if(game.state == STATE.OVER) return;
			if(e.type == "mouseup" || e.type == "touchend")
			{
				var paused = game.timer.paused;
				game.timer.paused = !paused;
				pauseBtn.gotoAndStop( paused ? 0 : 1);
				game.stage.step();
			}else if(e.type == "mouseout")
			{
				game.context.canvas.style.cursor = "";
			}		
		}
	}
	
	//初始化海豚
	this.dolphin.x = this.width - this.dolphin.getCurrentWidth() >> 1;
	this.dolphin.y = this.height - this.dolphin.getCurrentHeight() - 5;
	this.dolphin.dirX = 0;
	this.dolphin.dirY = 0;
	this.dolphin.jumping = false;
	this.dolphin.avatar.gotoAndPlay("idle");
	
	//添加所有对象到舞台
	this.stage.addChild(this.cloud, this.sun, this.island, this.waveBack, this.waveMiddle);
	for(var i = 0; i < this.balls.length; i++) 
	{
		var ball = this.balls[i];
		ball.reset(ns.Ball.getRandomType());
		this.stage.addChild(ball);
	}
	this.stage.addChild(this.dolphin, this.waveFront, this.pauseBtn);
	
	//显示倒计时
	this.showTimer();
	//显示得分
	this.updateScore();
}

//移动波浪
game.moveWave = function(wave)
{
	var dx = wave.speedX * wave.dirX;
	if(wave.x + dx <= this.width - wave.width) 
	{
		wave.x = this.width - wave.width;
		wave.dirX = 1;
	}else if(wave.x + dx >= 0)
	{
		wave.x = 0;
		wave.dirX = -1;
	}else
	{
		wave.x += dx;
	}
}

//随机改变波浪的方向
game.changeWaveDirection = function()
{
	this.waveBack.dirX = Math.random() > 0.5 ? 1 : -1;
	this.waveMiddle.dirX = Math.random() > 0.5 ? 1 : -1;
	this.waveFront.dirX = Math.random() > 0.5 ? 1 : -1;
}

//创建小球
game.createBalls = function()
{
	var minX = 100, maxX = this.width-100, minY = -500, maxY = 0;
	//for(var i = 0; i < 1; i++)
	for(var i = 0; i < this.maxBalls; i++)
	{
		var ball = new ns.Ball({id:"ball"+i, type:ns.Ball.getRandomType()});
		ball.scaleX = ball.scaleY = 0.30;
		this.balls.push(ball);
	}
}

//主更新方法
game.update = function(timeInfo)
{
	this.frames++;
	
	if(this.state == STATE.MENU)
	{
		if(this.ray) this.ray.rotation += 0.1;
	}else if(this.state == STATE.MAIN)
	{
		this.updateBalls();
		this.updateDolphin();
	}
}

//更新小球
game.updateBalls = function()
{
	var me = this, balls = this.balls, minBottom = 80;
	for(var i = 0; i < balls.length; i++)
	{
		var ball = me.balls[i];
		if(ball.delay > 0)
		{
			ball.delay -= 1;
			continue;
		}
		if(ball.currentSpeedY > 0) ball.currentSpeedY += 0.05;
		else if(ball.currentSpeedY < 0) ball.currentSpeedY += 0.15;
		ball.y += ball.currentSpeedY;
		ball.x += ball.currentSpeedX;
		if(ball.bouncing)
		{
			if(ball.currentSpeedY >= 0)
			{
				ball.stopBounce();
				return;
			}
		}
		if(ball.y > me.height - minBottom && ball.alpha > 0)
		{
			ball.alpha -= 0.1;
			ball.fading = true;
		}
		if(ball.y > me.height)
		{
			ball.reset(ns.Ball.getRandomType());
		}
	}
}

//更新海豚位置
game.updateDolphin = function()
{
	var acc = this.acceleration, dw = this.dolphin.getCurrentWidth(), dh = this.dolphin.getCurrentHeight();
	if(acc != null)
	{
		//重力感应移动
		var ax = acc.accelerationX, ay = acc.accelerationY, or = window.orientation;
        var av = (or%180) ? ay : ax;
        var dv = (or%180) ? (ax<0?1:-1) : (ay<0?-1:1);
        
		this.dolphin.currentSpeedX = this.dolphin.jumping ? 0.5*Math.abs(av) : this.dolphin.currentSpeedX + 0.08*Math.abs(av);
		if(av*dv > 0.5)
		{
			this.dolphin.x -= this.dolphin.currentSpeedX*1;
			if(this.dolphin.x < 0) this.dolphin.x = 0;
		}else if(av*dv < -0.5)
		{
			this.dolphin.x += this.dolphin.currentSpeedX*1;
			if(this.dolphin.x > this.width - dw) this.dolphin.x = this.width - dw;
		}else
		{
			this.dolphin.currentSpeedX = this.dolphin.speedX;
		}
	}else if(this.dolphin.dirX != 0)
	{
		//普通移动
		//this.dolphin.currentSpeedX += 0.1;
		this.dolphin.x += this.dolphin.currentSpeedX * this.dolphin.dirX;
		if(this.dolphin.x < 0) this.dolphin.x = 0;
		else if(this.dolphin.x > this.width - dw) this.dolphin.x = this.width - dw;
	}
	
	if(this.dolphin.dirY != 0)
	{
		//跳跃
		this.dolphin.currentSpeedY -= 0.3;
		this.dolphin.y -= this.dolphin.dirY*this.dolphin.currentSpeedY;
		if(this.dolphin.oldY <= this.dolphin.y)
		{
			this.dolphin.stopJump();
			this.collidedBall = null;
		}else
		{
			if(this.collidedBall == null)
			{
				if(this.checkCollision())
				{
					//trace("hit:", this.collidedBall);
					//this.timer.pause();
					//Q.toggleDebugRect(this.stage);
				}
			}
		}
	}
}

var sortBallFunc = function(a, b){return a.y < b.y;}

//海豚与球的碰撞检测
game.checkCollision = function()
{
	var me = this, balls = this.balls, dolphin = this.dolphin;
	//根据球的Y轴排序
	balls.sort(sortBallFunc);
	
	for(var i = 0; i < balls.length; i++)
	{
		var ball = balls[i];
		if(ball.fading || ball.bouncing) continue;
		var gapH = ball.getCurrentWidth()*0.5, gapV = ball.getCurrentHeight()*0.5;
		var dx = ball.x - dolphin.x, dy = dolphin.y - ball.y;		
		//trace(ball, dolphin.y, ball.y, gapV, ball.x, dolphin.x, gapH);
		
		if(dx <= dolphin.getCurrentWidth()+gapH && dx >= 0 && dy <= gapV && dy >= -gapV-100)
		{
			ball.getCollide();
			var ddx = dx - gapH;
			ball.currentSpeedX = Math.abs(ddx) > 20 ? ddx*0.1 : 0;
			this.collidedBall = ball;
			this.addScore(ball, ball.currentScore);
			return true;
		}
	}
	return false;
}

//得分
game.addScore = function(ball, score)
{
	if(this.addNum == null)
	{
		var container = new Q.DisplayObjectContainer({id:"addNum", width:100, height:65});
		var plus = new ns.Num({id:"plus", type:ns.Num.Type.num1});
		plus.setValue(11);
		container.addChild(plus);
		var num = new ns.Num({id:"num", type:ns.Num.Type.num1});
		num.x = plus.x + plus.width - 15;
		container.addChild(num);
		this.addNum = container;
	}	
	this.stage.addChild(this.addNum);
	this.addNum.getChildAt(1).setValue(score);
	this.addNum.x = ball.x - 50;
	this.addNum.y = ball.y - 100;
	this.addNum.alpha = 1;
	
	this.score += score;
	this.updateScore();
	
	Q.Tween.to(this.addNum, {y:this.addNum.y-100, alpha:0}, {time:1000});
}

//更新总得分
game.updateScore = function()
{
	if(this.scoreNum == null)
	{
		var container = new Q.DisplayObjectContainer({id:'score', width:200, height:65});
		var num0 = new ns.Num({id:"num0", type:ns.Num.Type.num2});
		var num1 = new ns.Num({id:"num1", type:ns.Num.Type.num2});
		var num2 = new ns.Num({id:"num2", type:ns.Num.Type.num2});
		var num3 = new ns.Num({id:"num3", type:ns.Num.Type.num2});
		num1.x = 50;
		num2.x = 100;
		num3.x = 150;
		container.addChild(num0, num1, num2, num3);
		container.scaleX = container.scaleY = 0.8;
		container.x = this.width - container.getCurrentWidth() - 15 >> 0;
		container.y = 15;
		this.scoreNum = container;
	}	
	this.stage.addChild(this.scoreNum);
	
	var str = this.score.toString(), len = str.length;
	str = len > 4 ? str.slice(len - 4) : str;
	while(str.length < 4) str = "0" + str;
	for(var i = 0; i < str.length; i++)
	{
		this.scoreNum.getChildAt(i).setValue(Number(str[i]));
	}
}

//显示倒计时
game.showTimer = function()
{	
	if(this.countdown == null)
	{
		//初始化倒计时
		var countdown = new Q.DisplayObjectContainer({id:'countdown', width:250, height:65});
		var num1 = new ns.Num({id:"min1", type:ns.Num.Type.num2});
		var num2 = new ns.Num({id:"min2", type:ns.Num.Type.num2});
		var sep = new ns.Num({id:"sep", type:ns.Num.Type.num2});
		var sec1 = new ns.Num({id:"sec1", type:ns.Num.Type.num2});
		var sec2 = new ns.Num({id:"sec2", type:ns.Num.Type.num2});
		num2.x = 45;
		sep.x = 80;
		sec1.x = 125;
		sec2.x = 170;
		sep.setValue(10);
		countdown.addChild(num1, num2, sep, sec1, sec2);
		countdown.scaleX = countdown.scaleY = 0.8;
		countdown.x = 90;
		countdown.y = 15;
		this.countdown = countdown;
	}	
	this.stage.addChild(this.countdown);
	this.time.current = this.time.total;
	this.updateTimer();
	
	//启动倒计时Tween
	Q.Tween.to(this.time, null, {time:1000, loop:true, 
	onComplete:function(tween)
	{
		game.updateTimer();
		if(game.time.current <= -1)
		{
			tween.stop();
			game.gameOver();
		}
	}});
}

//更新倒计时数值
game.updateTimer = function()
{	
	var me = this, time = this.time;
	var min = Math.floor(time.current / 60), sec = time.current % 60;
	me.countdown.getChildAt(0).setValue(min>=10?Math.floor(min/10) : 0);
	me.countdown.getChildAt(1).setValue(min>=10?(min%10) : min);
	me.countdown.getChildAt(3).setValue(sec>=10?Math.floor(sec/10) : 0);
	me.countdown.getChildAt(4).setValue(sec>=10?(sec%10) : sec);
	time.current--;
}

//游戏结束
game.gameOver = function()
{
	trace("game over:", this.score);
	this.timer.pause();
	if(this.context.context == null)
	{
		if(this.overlay == null)
		{
			this.overlay = Q.createDOM("div", {id:"overlay", style:
			{
				position: "absolute",
				width: this.width + "px",
				height: this.height + "px",
				background: "#000",
				opacity: 0.4
			}});
		}
		this.container.lastChild.appendChild(this.overlay);
	}
	
	this.state = STATE.OVER;
	this.playBtn.setState(Q.Button.state.OVER);
	this.stage.addChild(this.playBtn);
	this.stage.step();
	
	//保存分数
	this.saveScore(this.score);
}

//重新开始
game.restart = function()
{
	trace("game restart");
	this.overlay.parentNode.removeChild(this.overlay);
	this.stage.removeAllChildren();
	this.timer.paused = false;
	this.showMenu();
	
	this.score = 0;
	this.time.current = this.time.total;
}

//获取保存的分数
game.getScore = function()
{
	var key = "dolphin_score";
	if(Q.supportStorage && localStorage.hasOwnProperty(key))
	{
		var score = Number(localStorage.getItem("dolphin_score"));
		return score;
	}
	return 0;
}

//保存分数到localStorage
game.saveScore = function(score)
{
	var key = "dolphin_score";
	if(Q.supportStorage)
	{
		localStorage.removeItem(key);
		localStorage.setItem(key, score);
	}
}

//显示当前FPS值
game.showFPS = function()
{
	var me = this, fpsContainer = Quark.getDOM("fps");
	setInterval(function()
	{
		fpsContainer.innerHTML = "FPS:" + me.frames;
		me.frames = 0;
	}, 1000);
}

//隐藏浏览器顶部导航
game.hideNavBar = function()
{
    window.scrollTo(0, 1);
}

//重新计算舞台stage在页面中的偏移
game.calcStagePosition = function()
{
    if(game.stage) 
    {
        var offset = Q.getElementOffset(game.stage.context.canvas);
        game.stage.stageX = offset.left;
        game.stage.stageY = offset.top;
    }
}
	
})();
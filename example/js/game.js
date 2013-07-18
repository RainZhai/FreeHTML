(function(){
	if(!window.console){window.console = function(){};window.console.info = window.console.debug = window.console.warn = window.console.log = window.console.error = function(str){alert(str);}}

	window.log = function(){
		if(arguments.length>0){
			for(var i=0,l=arguments.length;i<l; i++){ console.log(arguments[i]);}
		}
	}
var game = {
	res : [ {
		id : "bg",
		size : 1020,
		src : "images/game_bg.jpg"
	}],

	container : null,
	width : 0,
	height : 0,
	params : null,
	frames : 0,

	fps : 40,
	timer : null,
	eventTarget : null,
	state : null,

	mainRole : null,
	balls : [],
	maxBalls : 5,
	collidedBall : null,

	time : {
		total : 120,
		current : 120
	},
	score : 0,
	scoreNum : null
};
window.game = game;
// 创建小球
game.createBalls = function() {
	var minX = 100, maxX = this.width - 100, minY = -500, maxY = 0;
	for ( var i = 0; i < this.maxBalls; i++) {
		var ball = new game.Ball({
			id : "ball" + i,
			type : game.Ball.getRandomType()
		});
		this.balls.push(ball);
	}
}
game.init = function() {
	var params, timer, context, em;
	var _this = this;
	this.container = Q.getDOM("container");
	this.container.style.background = "url(images/game_bg.jpg) no-repeat center center";
	_this.width = this.container.clientWidth;
	_this.height = this.container.clientHeight;
	params = Q.getUrlParams();
	if (params.canvas) {
		var canvas = Quark.createDOM("canvas", {
			width : 800,
			height : 600,
			style : {
				position : "absolute",
				background : "url(images/game_bg.jpg) no-repeat center center"
			}
		});
		this.container.appendChild(canvas);
		context = new Quark.CanvasContext({
			canvas : canvas
		});
	} else {
		context = new Q.DOMContext({
			canvas : this.container
		});
	}

	// 初始化舞台
	_this.stage = new Q.Stage({
		context : context,
		width : 800,
		height : 600,
		update : function() {
			frames++;
			_this.updateSquirrel();
			_this.updateBalls();
		}
	});
	// 设置背景
	var background = new Q.DisplayObjectContainer({
		width : 2000,
		height : 600,
		x : -1000,
		y : 0,
		update : function() {
			if (this.x > 2000) {
				this.removeChild(rect1);
			} else {
				this.x += 4;
			}
		}
	});
	_this.stage.addChild(background);
	var rect1 = new Q.Graphics({
		width : 100,
		height : 100,
		x : 0,
		y : 0
	});
	rect1.drawRect(0, 0, 100, 100).lineStyle(1, "#000").beginFill("red").endFill().cache();
	background.addChild(rect1);

	// 蘑菇实例
	_this.mainRole = new game.Squirrel({
		id : "squirrel",
		x : 200,
		y : 500,
		autoSize : true
	});
	_this.stage.addChild(_this.mainRole);
	
	//创建下落球
	game.Ball.init();
	_this.createBalls();
	for ( var i = 0; i < _this.balls.length; i++) {
	var ball = _this.balls[i];
	ball.reset(game.Ball.getRandomType());
	_this.stage.addChild(ball);
	}
	// 初始化timer并启动
	timer = new Q.Timer(1000 / 30);
	timer.addListener(_this.stage);
	timer.start();

	// 注册舞台事件，使舞台上的元素能接收交互事件
	em = new Q.EventManager();
	var events = Q.supportTouch ? [ "touchend" ] : [ "mouseup", "mousemove" ];
	em.registerStage(_this.stage, events, true, true);
	// 按键事件
	em.register(document, [ "keydown", "keyup" ], function(e) {
		var key = e.keyCode;
		// if (me.state != STATE.MAIN) return;
		if (key == Q.KEY.A || key == Q.KEY.LEFT) {
			if (e.type == "keydown")
				_this.mainRole.move(-1);
			else if (e.type == "keyup")
				_this.mainRole.stopMove();
		} else if (key == Q.KEY.D || key == Q.KEY.RIGHT) {
			if (e.type == "keydown")
				_this.mainRole.move(1);
			else if (e.type == "keyup")
				_this.mainRole.stopMove();
		} else if (key == Q.KEY.W || key == Q.KEY.UP) {
			_this.mainRole.jump();
		}
	}, false, false);
	/*
	 * em.register(_this.stage, events, function(e) { _this.mainRole.x = e.pageX -
	 * _this.mainRole.width / 2; }, true, true);
	 */

	// 为松鼠添加touchend或mouseup事件侦听，控制其跳跃。
	// this.mainRole.addEventListener(events[0], this.mainRole.move);
}
game.updateSquirrel = function() {
	// 更新松鼠的移动
	if (this.mainRole.dirX != 0) {
		// 普通移动
		this.mainRole.x += this.mainRole.currentSpeedX * this.mainRole.dirX;
		if (this.mainRole.x < 0)
			this.mainRole.x = 0;
		else if (this.mainRole.x > this.stage.width - this.mainRole.width)
			this.mainRole.x = this.stage.width - this.mainRole.width;
	}

	if (this.mainRole.dirY != 0) {
		// 跳跃
		this.mainRole.currentSpeedY -= 4;
		this.mainRole.y -= this.mainRole.dirY * this.mainRole.currentSpeedY;
		if (this.mainRole.oldY <= this.mainRole.y) {
			this.mainRole.stopJump();
			this.collidedBall = null;
		}else{
			if(this.collidedBall == null){
				this.checkCollision()
			}
		}
	}
}
game.updateBalls = function() {
	var me = this, balls = this.balls, minBottom = 50;
	for ( var i = 0; i < balls.length; i++) {
		var ball = me.balls[i];
		if (ball.delay > 0) {
			ball.delay -= 1;
			continue;
		}
		if (ball.currentSpeedY > 0)
			ball.currentSpeedY += 0.2;
		else if (ball.currentSpeedY < 0)
			ball.currentSpeedY += 0.4;
		ball.y += ball.currentSpeedY;
		ball.x += ball.currentSpeedX;  
		if (ball.bouncing) {
			if (ball.currentSpeedY >= 0) {
				ball.stopBounce();
				return;
			}
		}
		if (ball.y > me.height - minBottom && ball.alpha > 0) {
			ball.alpha -= 0.1;
			ball.fading = true;
		}
		if (ball.y > me.height) {
			ball.reset(game.Ball.getRandomType());
		}
	}
}
//var sortBallFunc = function(a, b){return a.y < b.y;}

//碰撞检测
game.checkCollision = function() {
	var me = this, balls = this.balls, mainRole = this.mainRole;
	// 根据球的Y轴排序
	//balls.sort(sortBallFunc);

	for ( var i = 0; i < balls.length; i++) {
		var ball = balls[i];
		if (ball.fading || ball.bouncing)
			continue;
		var gapH = ball.getCurrentWidth() * 0.5, gapV = ball
				.getCurrentHeight() * 0.5;
		var dx = ball.x - mainRole.x, dy = mainRole.y - ball.y;
		log(gapH,gapV,dx,dy);
		if (dx <= mainRole.getCurrentWidth() + gapH && dx >= 0
				&& dy <= gapV && dy >= -gapV - 100) {
			ball.getCollide();
			var ddx = dx - gapH;
			ball.currentSpeedX = Math.abs(ddx) > 20 ? ddx * 0.1 : 0;
			this.collidedBall = ball;
			//this.addScore(ball, ball.currentScore);
			return true;
		}
	}
	return false;
}

})();
window.onload=function(){
game.init();
}
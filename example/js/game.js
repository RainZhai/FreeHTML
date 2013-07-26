(function() {
	if (!window.console) {
		window.console = function() {};
		window.console.info = window.console.debug = window.console.warn = window.console.log = window.console.error = function(
				str) {
			alert(str);
		}
	}

	window.log = function() {
		if (arguments.length > 0) {
			for ( var i = 0, l = arguments.length; i < l; i++) {
				console.log(arguments[i]);
			}
		}
	}
	var STATE = {
		MENU : 0,
		PLAY : 1,
		OVER : 2
	};

	var game = {
		res : [ {
			id : "icons",
			size : 22,
			src : "images/icons.png"
		}, {
			id : "bg",
			size : 202,
			src : "images/game_bg.jpg"
		}, {
			id : "body",
			size : 42,
			src : "images/body_walk.png"
		}, {
			id : "head",
			size : 11,
			src : "images/head_idle.png"
		}, {
			id : "boom",
			size : 210,
			src : "images/boom_bg.jpg"
		} ],

		container : null,
		width : 800,
		height : 600,
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
			total : 0,
			current : 0
		},
		score : 0,
		scoreNum : null,
		life:true,
		boombg: null,
		freegame:null
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
		var _this = this;
		_this.container = Q.getDOM("container");
		var div = document.createElement("div");
		_this.container.appendChild(div);
		_this.loader = div;
		// 加载图片素材
		var loader = new Q.ImageLoader();
		loader.addEventListener("loaded", Q.delegate(this.onLoadLoaded, this));
		loader.addEventListener("complete", Q.delegate(this.onLoadComplete, this));
		loader.load(this.res);
	}
	// 加载进度条
	game.onLoadLoaded = function(e) {
		this.loader.innerHTML = "正在加载资源中，请稍候...<br>";
		this.loader.innerHTML += "(" + Math.round(e.target.getLoadedSize() / e.target.getTotalSize() * 100) + "%)";
	}

	// 加载完成
	game.onLoadComplete = function(e) {
		e.target.removeAllEventListeners();
		Q.getDOM("container").removeChild(this.loader);
		this.loader = null;
		this.images = e.images;
		// 初始化一些类
		game.Ball.init();
		// 启动游戏
		this.startup();
	}
	// 获取图片资源
	game.getImage = function(id) {
		return this.images[id].image;
	}
	game.startup = function() {
		var _this = this;
		// 手持设备的特殊webkit设置
		if (Q.isWebKit && Q.supportTouch) {
			document.body.style.webkitTouchCallout = "none";
			document.body.style.webkitUserSelect = "none";
			document.body.style.webkitTextSizeAdjust = "none";
			document.body.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
		}
		_this.width = this.container.clientWidth;
		_this.height = this.container.clientHeight;
		_this.params = Q.getUrlParams();
		if (_this.params.canvas) {
			var canvas = Quark.createDOM("canvas", {width : _this.width,height : _this.height,
				style : {position : "absolute",background : "url(images/game_bg.jpg) no-repeat center center"}
			});
			_this.container.appendChild(canvas);
			_this.context = new Quark.CanvasContext({canvas : canvas});
		} else {
			_this.context = new Q.DOMContext({canvas : _this.container});
		}

		// 初始化舞台
		_this.stage = new Q.Stage({context : _this.context, width : _this.width,height : _this.height,
			update : function() {
				_this.frames++;
				if (_this.state == STATE.MENU) {
				} else if (_this.state == STATE.PLAY) {
					_this.updateMainrole();
					_this.updateBalls();
				}
			}
		});
		
		// 初始化timer并启动
		_this.timer = new Q.Timer(1000/_this.fps);
		_this.timer.addListener(_this.stage);
		_this.timer.addListener(Q.Tween);
		_this.timer.start();
		//预加载背景音乐
		var audio = new Quark.Audio("audio/bg.mp3", true, true, true);
		_this.audio = audio;
// 设置移动背景
/*	var background = new Q.DisplayObjectContainer({
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
		var rect1 = new Q.Graphics({width : 100,height : 100,x : 0,y : 0});
		rect1.drawRect(0, 0, 100, 100).lineStyle(1, "#000").beginFill("red").endFill().cache();
		background.addChild(rect1);*/

		// 注册舞台事件，使舞台上的元素能接收交互事件
		em = new Q.EventManager();
		var events = Q.supportTouch ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];
		em.registerStage(_this.stage, events, function(e) {
			var ne = (e.touches && e.touches.length > 0) ? e.touches[0]: (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;
			// 确保touchend事件的类型正确
			if (Q.supportTouch)
				ne.type = e.type;

			var x = ne.pageX - _this.stage.stageX, y = ne.pageY - _this.stage.stageY;
			var obj = _this.stage.getObjectUnderPoint(x, y);

			// 加载音效
			if (_this.audio && !_this.audio.loading) {
				_this.audio.loading = true;
				_this.audio.load();
			}

			if (_this.eventTarget != null && _this.eventTarget != obj) {
				if (_this.eventTarget.onEvent != null)
					_this.eventTarget.onEvent({
						type : "mouseout"
					});
				_this.eventTarget = null;
			}
			if (obj != null) {
				_this.eventTarget = obj;
				if (obj.useHandCursor)
					_this.context.canvas.style.cursor = "pointer";
				if (obj.onEvent != null)
					obj.onEvent(ne);
			}
			if (_this.state == STATE.PLAY) {
				if (ne.type == "touchend" || ne.type == "mouseup" && obj != _this.pauseBtn) {
					_this.mainRole.jump();
				}
			}
		}, true, true);
		// 按键事件
		em.register(document, [ "keydown", "keyup" ], function(e) {
			var key = e.keyCode;
			if (_this.state != STATE.PLAY) return;
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
		// 显示开始菜单
		this.showUI();
		// 显示FPS
		this.showFPS();
	}
	// 显示开始菜单
	game.showUI = function() {
		if (this.playBtn==null) {
			// 开始按钮
			var playBtn = new Q.Button({id : "playBtn",image : this.getImage("icons"), x:350, y:250, width:100, height:100});
			playBtn.setUpState({rect : [110, 0, 90, 90 ]});
			playBtn.setOverState({rect : [110, 0, 90, 90 ]});
			//playBtn.setDownState({rect : [110, 97, 90, 90 ]});
			this.playBtn = playBtn;
			playBtn.addEventListener("mouseup",function(){
					game.stage.removeAllChildren();
					game.context.canvas.style.cursor = "";
					if (game.state == STATE.MENU) {
						trace("game start");
						setTimeout(Q.delegate(game.showMain, game), 100);
					} else if (game.state == STATE.OVER) {
						trace("game restart"); 
						game.stage.removeAllChildren();
						game.score = 0;
						game.time.current = game.time.total;
						game.timer.paused = false;
						setTimeout(Q.delegate(game.showMain, game), 100);
					}			
			});
			playBtn.addEventListener("touchend",function(){
					game.stage.removeAllChildren();
					game.context.canvas.style.cursor = "";
					if (game.state == STATE.MENU) {
						trace("game start");
						setTimeout(Q.delegate(game.showMain, game), 100);
					} else if (game.state == STATE.OVER) {
						trace("game restart"); 
						game.stage.removeAllChildren();
						game.score = 0;
						game.time.current = game.time.total;
						game.timer.paused = false;
						setTimeout(Q.delegate(game.showMain, game), 100);
					}			
			}); 

			// 帮助提示
			var tip = Q.createDOM("div", {
				id : "tip",
				style : {
					position : "absolute",
					width : this.width + "px",
					height : "50px",
					top : (this.height - 60) + "px",
					textAlign : "center",
					color : "red",
					font : Q.isMobile ? 'bold 18px 黑体' : 'bold 18px 宋体',
					textShadow : Q.isAndroid ? "0 2px 2px #111" : "0 2px 2px #ccc"

				}
			});
			tip.innerHTML = "操作提示：A或←键向左，D或→键向右，S键或↑跳跃。<br>移动设备重力感应进行移动、点击跳跃。";
			this.tip = tip;
		}

		this.state = STATE.MENU;
		this.stage.addChild(this.playBtn);
		this.container.appendChild(this.tip);
		//this.ui = true;
	}
	// 游戏主场景
	game.showMain = function() {
		var _this = this;
		// 设置当前状态
		_this.state = STATE.PLAY;
		Q.Orientation.register(function(data){game.acceleration = data;});
		if (_this.tip.parentNode)
			_this.tip.parentNode.removeChild(_this.tip);

		if (_this.mainRole == null) {
			// 蘑菇实例
			_this.mainRole = new game.Squirrel({
				id : "squirrel",
				x : 200,
				y : 500,
				autoSize : true
			});
			_this.stage.addChild(_this.mainRole);

			// 创建下落球
			_this.createBalls();
			for ( var i = 0; i < _this.balls.length; i++) {
				var ball = _this.balls[i];
				ball.reset(game.Ball.getRandomType());
				_this.stage.addChild(ball);
			} 
			// 暂停、继续按钮
			var pauseBtn = new Q.Button({id : "pauseBtn",image : _this.getImage("icons"), x:_this.stage.width - 40, y:20, width:40, height:40});
			pauseBtn.setUpState({
				rect : [ 0, 187, 40, 40 ]
			});
			pauseBtn.setOverState({
				rect : [ 0, 187, 40, 40 ]
			});
			_this.pauseBtn = pauseBtn;
			
			_this.pauseBtn.addEventListener("mouseup",function(){
				if (game.state == STATE.OVER)
					return;
				else
					var paused = game.timer.paused;
					game.timer.paused = !paused;
					game.stage.step();
			})
			
			_this.pauseBtn.addEventListener("touchend",function(){
				if (game.state == STATE.OVER)
					return;
				else
					var paused = game.timer.paused;
					game.timer.paused = !paused;
					game.stage.step();
			})
		}
		//创建爆炸层
		_this.boombg = new Q.Bitmap({image:_this.getImage('boom'), width: _this.stage.width,height: _this.stage.height, x:0,y:0,alpha:0,scaleX:0.5, scaleY:0.5});

		// 添加所有对象到舞台
		for ( var i = 0; i < this.balls.length; i++) {
			var ball = this.balls[i];
			ball.reset(game.Ball.getRandomType());
			_this.stage.addChild(ball);
		}
		_this.stage.addChild(_this.boombg, _this.mainRole, _this.pauseBtn);

		// 显示倒计时
		_this.showTimer();
		//显示得分
		_this.updateScore();
	}

	// 更新松鼠的移动
	game.updateMainrole = function() {
		var acc = this.acceleration, dw = this.mainRole.getCurrentWidth(), dh = this.mainRole.getCurrentHeight();
		if (acc != null) {
			// 重力感应移动
			var ax = acc.accelerationX, ay = acc.accelerationY, or = window.orientation;
			var av = (or % 180) ? ay : ax;
			var dv = (or % 180) ? (ax < 0 ? 1 : -1) : (ay < 0 ? -1 : 1);

			this.mainRole.currentSpeedX = this.mainRole.jumping ? 0.5 * Math.abs(av) : this.mainRole.currentSpeedX + 0.08
					* Math.abs(av);
			if (av * dv > 0.5) {
				this.mainRole.x -= this.mainRole.currentSpeedX * 1;
				if (this.mainRole.x < 0)
					this.mainRole.x = 0;
			} else if (av * dv < -0.5) {
				this.mainRole.x += this.mainRole.currentSpeedX * 1;
				if (this.mainRole.x > this.width - dw)
					this.mainRole.x = this.width - dw;
			} else {
				this.mainRole.currentSpeedX = this.mainRole.speedX;
			}
		} else if (this.mainRole.dirX != 0) {
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
			} else {
				if (this.collidedBall == null) {
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
	// 碰撞检测
	game.checkCollision = function() {
		var _this = this, balls = this.balls, mainRole = this.mainRole;
		// 根据球的Y轴排序
		balls.sort(function(a, b) {
			return a.y < b.y;
		});

		for ( var i = 0; i < balls.length; i++) {
			var ball = balls[i];
			if (ball.fading || ball.bouncing)
				continue;
			// 球的半高半宽
			var hW = ball.getCurrentWidth() * 0.5, hH = ball.getCurrentHeight() * 0.5;
			var dx = ball.x - mainRole.x, dy = mainRole.y - ball.y;
			if (dx <= mainRole.getCurrentWidth() + hW && dx >= 0 && dy <= 2*hH && dy >= -hH - 100) {
					if(ball.name ==='bomb'){
						_this.gameOver();
					}
					ball.getCollide();
					var ddx = dx - hW;
					ball.currentSpeedX = Math.abs(ddx) > 20 ? ddx * 0.1 : 0;
					this.collidedBall = ball; 
					this.addScore(ball, ball.type.score);
					return true;
			}
		}
		return false;
	}
	// 得分
	game.addScore = function(ball, score) {
		if (this.addNum == null) {
			var container = new Q.DisplayObjectContainer({
				id : "addNum",
				width : 100,
				height : 65
			});
			var plus = new Q.Text({id: "plus",color:'red',font:"bold 30px arial", text:"+",width:50,height:30,lineSpacing:0, textAlign:"left"});
			container.addChild(plus);
			var num = new Q.Text({id: "num",color:'red',font:"bold 30px arial",width:50,height:30,lineSpacing:0, textAlign:"left"});
			num.x = plus.x + plus.width - 15;
			container.addChild(num);
			this.addNum = container;
		}
		this.stage.addChild(this.addNum);
		this.addNum.getChildAt(1).text = score;
		this.addNum.x = ball.x - 50;
		this.addNum.y = ball.y - 50;
		this.addNum.alpha = 1;

		Q.Tween.to(this.addNum, {y : this.addNum.y - 100,alpha : 0}, {time : 1000});
		this.score += score;
		this.updateScore();
	}

	// 更新总得分
	game.updateScore = function() {
		if (this.scoreNum == null) {
			var container = new Q.DisplayObjectContainer({
				id : 'score',
				width : 200,
				height : 65
			});
			var num0 = new Q.Text({
				id : "num0",color:'red',font:"bold 30px arial", text:"+",width:50,height:30,lineSpacing:0, textAlign:"left"
			});
			var num1 = new Q.Text({
				id : "num1",color:'red',font:"bold 30px arial", text:"+",width:50,height:30,lineSpacing:0, textAlign:"left"
			});
			var num2 = new Q.Text({
				id : "num2",color:'red',font:"bold 30px arial", text:"+",width:50,height:30,lineSpacing:0, textAlign:"left"
			});
			var num3 = new Q.Text({
				id : "num3",color:'red',font:"bold 30px arial", text:"+",width:50,height:30,lineSpacing:0, textAlign:"left"
			});
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
		while (str.length < 4)
			str = "0" + str;
		for ( var i = 0; i < str.length; i++) {
			this.scoreNum.getChildAt(i).text = str[i];
		}
	}

	// 显示倒计时
	game.showTimer = function() {
		if (this.timebox == null) {
			// 初始化倒计时
			var timebox = new Q.DisplayObjectContainer({
				id : 'timebox',
				width : 250,
				height : 65
			});
			var num1 =new Q.Text({
				id : "min1"
			});
			var num2 = new Q.Text({
				id : "min2"
			});
			var sep = new Q.Text({
				id : "sep"
			});
			var sec1 = new Q.Text({
				id : "sec1"
			});
			var sec2 = new Q.Text({
				id : "sec2"
			});
			num2.x = 45;
			sep.x = 80;
			sec1.x = 125;
			sec2.x = 170;
			sep.text = 10;
			timebox.addChild(num1, num2, sep, sec1, sec2);
			timebox.scaleX = timebox.scaleY = 0.8;
			timebox.x = 90;
			timebox.y = 15;
			this.timebox = timebox;
		}
		this.stage.addChild(this.timebox);
		this.time.current = this.time.total;
		this.updateTimer();
	}

	// 更新倒计时数值
	game.updateTimer = function() {
		var me = this, time = this.time;
		var min = Math.floor(time.current / 60), sec = time.current % 60;
		me.timebox.getChildAt(0).text = (min >= 10 ? Math.floor(min / 10) : 0);
		me.timebox.getChildAt(1).text = (min >= 10 ? (min % 10) : min);
		me.timebox.getChildAt(3).text = (sec >= 10 ? Math.floor(sec / 10) : 0);
		me.timebox.getChildAt(4).text = (sec >= 10 ? (sec % 10) : sec);
		time.current++;
	}

	// 游戏结束
	game.gameOver = function() {
		trace("game over:", this.score);
		Q.Tween.to(this.boombg, {alpha:1, scaleX:0.8, scaleY:0.8}, {time:300,	onComplete:function(tween){
			game.timer.pause();
			game.state = STATE.OVER;
			game.playBtn.changeState([110, 97, 90, 90 ]);
			game.stage.addChild(game.playBtn);
			game.stage.step();
			// 保存分数
			game.saveScore(this.score);
		}});
		//this.container.lastChild.appendChild(this.overlay);
	}

	// 重新开始
	game.restart = function() {
		trace("game restart");
		this.overlay.parentNode.removeChild(this.overlay);
		this.stage.removeAllChildren();
		this.timer.paused = false;
		this.showUi();

		this.score = 0;
		this.time.current = this.time.total;
	}

	// 获取保存的分数
	game.getScore = function() {
		var key = "squirrel_score";
		if (Q.supportStorage && localStorage.hasOwnProperty(key)) {
			var score = Number(localStorage.getItem("squirrel_score"));
			return score;
		}
		return 0;
	}

	// 保存分数到localStorage
	game.saveScore = function(score) {
		var key = "squirrel_score";
		if (Q.supportStorage) {
			localStorage.removeItem(key);
			localStorage.setItem(key, score);
		}
	}

	// 显示当前FPS值
	game.showFPS = function() {
		var me = this, fpsContainer = Quark.getDOM("fps");
		setInterval(function() {
			fpsContainer.innerHTML = "FPS:" + me.frames;
			me.frames = 0;
		}, 1000);
	}

	//隐藏浏览器顶部导航
	game.hideNavBar = function() {
		window.scrollTo(0, 1);
	}

	//重新计算舞台stage在页面中的偏移
	game.calcStagePosition = function() {
		if (game.stage) {
			var offset = Q.getElementOffset(game.stage.context.canvas);
			game.stage.stageX = offset.left;
			game.stage.stageY = offset.top;
		}
	}
})();
window.onload = function() {
	game.init();
}
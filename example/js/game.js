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
			size : 131,
			src : "images/boom_bg.png"
		},{id:"stop_up",size:4,src:"images/slot_stop_up.png"}
		,{id:"stop_over",size:6,src:"images/slot_stop_over.png"}
		,{id:"start",size:9,src:"images/slot_start.jpg"}
		,{id:"kake",size:2,src:"images/slot_kake.png"}
		,{id:"slot_back",size:31,src:"images/slot_back.jpg"}
		,{id:"slot_ok",size:31,src:"images/slot_ok.png"}
		,{id:"item1",size:2,src:"images/1.png"}
		,{id:"item2",size:4,src:"images/2.png"}
		,{id:"item3",size:5,src:"images/3.png"}
		,{id:"item4",size:6,src:"images/4.png"}
		,{id:"item5",size:4,src:"images/5.png"}
		,{id:"item6",size:1,src:"images/6.png"}
		],
		stage: null,
		container : null,
		width : 800,
		height : 600,
		params : null,
		frames : 0,

		fps : 40,
		timer : null,
		events: null,
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
		freegame:null,
	};
	window.game = game;
	game.getWidth = function(){
		return this.width;
	}
	game.getHeight = function(){
		return this.height;
	}
	game.getEvents = function(i){
		return this.events[i];
	}
	// create balls array
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
		// load images
		var loader = new Q.ImageLoader();
		loader.addEventListener("loaded", Q.delegate(this.onLoadLoaded, this));
		loader.addEventListener("complete", Q.delegate(this.onLoadComplete, this));
		loader.load(this.res);
	}
	//set the load state info
	game.onLoadLoaded = function(e) {
		this.loader.innerHTML = "loading..<br>";
		this.loader.innerHTML += "(" + Math.round(e.target.getLoadedSize() / e.target.getTotalSize() * 100) + "%)";
	}

	// set load complete info
	game.onLoadComplete = function(e) {
		e.target.removeAllEventListeners();
		Q.getDOM("container").removeChild(this.loader);
		this.loader = null;
		this.images = e.images;
		//init balls
		game.Ball.init();
		//game startup
		this.startup();
	}
	game.getImage = function(id) {
		return this.images[id].image;
	}
	game.startup = function() {
		var _this = this; 
		if (Q.isWebKit && Q.supportTouch) {
			document.body.style.webkitTouchCallout = "none";
			document.body.style.webkitUserSelect = "none";
			document.body.style.webkitTextSizeAdjust = "none";
			document.body.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
		}
		_this.width = _this.container.clientWidth;
		_this.height = _this.container.clientHeight;
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

		// set the main game stage
		_this.stage = new Q.Stage({context : _this.context, width : _this.width,height : _this.height,
			update : function(timeInfo) {
				_this.frames++;
				if (_this.state == STATE.MENU) {
				} else if (_this.state == STATE.PLAY) {
					_this.updateMainrole();
					_this.updateBalls();
				}
			}
		});
		
		// set the timer
		_this.timer = new Q.Timer(1000/_this.fps);
		_this.timer.addListener(_this.stage);
		_this.timer.addListener(Q.Tween);
		_this.timer.start();
		//add bg audio
		
		var audio = new Quark.Audio("http://rainzhai.qiniudn.com/squirrel_bg.mp3", true, true, true);
		_this.audio = audio;
// set the move bg
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

		// register the stage events
		
		em = new Q.EventManager();
		_this.events = Q.supportTouch ? ["touchstart", "touchmove", "touchend"] : ["mousedown", "mousemove", "mouseup"];
		em.registerStage(_this.stage, _this.events, function(e) {
			var ne = (e.touches && e.touches.length > 0) ? e.touches[0]: (e.changedTouches && e.changedTouches.length > 0) ? e.changedTouches[0] : e;
			//set the touch
			if (Q.supportTouch)
				ne.type = e.type; 
			var x = ne.pageX - _this.stage.stageX, y = ne.pageY - _this.stage.stageY;
			var obj = _this.stage.getObjectUnderPoint(x, y);

			if (_this.audio && !_this.audio.loading) {
				_this.audio.loading = true;
				_this.audio.load();
			}

			if (_this.eventTarget != null && _this.eventTarget != obj) {
				if (_this.eventTarget.onEvent != null)
					_this.eventTarget.onEvent({	type : "mouseout"});
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
		// register the document events
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
		
		// this.mainRole.addEventListener(events[0], this.mainRole.move); 
		this.showUI();
		this.showFPS();
	}
	
	game.showUI = function() {
		var _this = this;
		if (_this.playBtn==null) {
			var playBtn = new Q.Button({id : "playBtn",image : _this.getImage("icons"), x:350, y:350, width:100, height:100});
			playBtn.setUpState({rect : [110, 0, 90, 90 ]});
			playBtn.setOverState({rect : [110, 0, 90, 90 ]});
			//playBtn.setDownState({rect : [110, 97, 90, 90 ]});
			_this.playBtn = playBtn;
			playBtn.addEventListener(_this.events[2],function(e){
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
 
			var tip = Q.createDOM("div", {
				id : "tip",
				style : {
					position : "absolute",
					width : _this.width + "px",
					height : "50px",
					top : (_this.height - 60) + "px",
					textAlign : "center",
					color : "red",
					font : Q.isMobile ? 'bold 18px Arial' : 'bold 18px Arial',
					textShadow : Q.isAndroid ? "0 2px 2px #111" : "0 2px 2px #ccc"

				}
			});
			tip.innerHTML = "操作提示:A或←键向左，D或→键向右，W键或↑点击跳跃。<br/>支持重力感应操作、点击跳跃。";
			_this.tip = tip;
		}

		_this.state = STATE.MENU;
		_this.stage.addChild(_this.playBtn);
		_this.container.appendChild(this.tip);
		//this.ui = true;
	}

	game.showMain = function() {
		var _this = this; 
		_this.state = STATE.PLAY;
		Q.Orientation.register(function(data){game.acceleration = data;});
		if (_this.tip.parentNode)
			_this.tip.parentNode.removeChild(_this.tip);

		if (_this.mainRole == null) {
			_this.mainRole = new game.Squirrel({
				id : "squirrel",
				x : 200,
				y : 500,
				autoSize : true
			});
			_this.stage.addChild(_this.mainRole);

			_this.createBalls();
			for ( var i = 0; i < _this.balls.length; i++) {
				var ball = _this.balls[i];
				//ball.reset(game.Ball.getRandomType());
				_this.stage.addChild(ball);
			} 
			var pauseBtn = new Q.Button({id : "pauseBtn",image : _this.getImage("icons"), x:_this.width - 40, y:20, width:40, height:40});
			pauseBtn.setUpState({
				rect : [ 0, 187, 40, 40 ]
			});
			pauseBtn.setOverState({
				rect : [ 0, 187, 40, 40 ]
			});
			_this.pauseBtn = pauseBtn;
			
			_this.pauseBtn.addEventListener(_this.events[2],function(e){
				if (game.state == STATE.OVER)
					return;
				else
					var paused = game.timer.paused;
					game.timer.paused = !paused;
					game.stage.step();
			})
		}
		_this.boombg = new Q.Bitmap({image:_this.getImage('boom'), width: _this.width,height: _this.height, x:0,y:0,alpha:0,scaleX:0.8, scaleY:0.8});

		for ( var i = 0; i < this.balls.length; i++) {
			var ball = this.balls[i];
			ball.reset(game.Ball.getRandomType());
			_this.stage.addChild(ball);
		}
		_this.stage.addChild(_this.boombg, _this.mainRole, _this.pauseBtn);

		_this.showTimer();
		_this.updateScore();
	}

	game.updateMainrole = function() {
		var acc = this.acceleration, dw = this.mainRole.getCurrentWidth(), dh = this.mainRole.getCurrentHeight();
		if (acc != null) {
			var ax = acc.accelerationX, ay = acc.accelerationY, or = window.orientation;
			var av = (or % 180) ? ay : ax;
			var dv = (or % 180) ? (ax < 0 ? 1 : -1) : (ay < 0 ? -1 : 1);

			this.mainRole.currentSpeedX = this.mainRole.jumping ? 0.4 * Math.abs(av) : this.mainRole.currentSpeedX + 0.08
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
			this.mainRole.x += this.mainRole.currentSpeedX * this.mainRole.dirX;
			if (this.mainRole.x < 0)
				this.mainRole.x = 0;
			else if (this.mainRole.x > this.width - this.mainRole.width)
				this.mainRole.x = this.width - this.mainRole.width;
		}

		if (this.mainRole.dirY != 0) {
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
				ball.currentSpeedY += 0.1;
			else if (ball.currentSpeedY < 0)
				ball.currentSpeedY += 0.2;
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
	game.checkCollision = function() {
		var _this = this, balls = this.balls, mainRole = this.mainRole;
		balls.sort(function(a, b) {
			return a.y < b.y;
		});

		for ( var i = 0; i < balls.length; i++) {
			var ball = balls[i];
			if (ball.fading || ball.bouncing)
				continue;
			var hW = ball.getCurrentWidth() * 0.5, hH = ball.getCurrentHeight() * 0.5;
			var dx = ball.x - mainRole.x, dy = mainRole.y - ball.y;
			if (dx <= mainRole.getCurrentWidth() + hW && dx >= 0 && dy <= 2*hH && dy >= -hH - 100) {
					if(ball.name ==='bomb'){
						_this.gameOver();
					} 
					if(ball.name ==='chest'){
						_this.startFreegame();
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
			container.x = this.width - container.getCurrentWidth() - 25;
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

	game.showTimer = function() {
		if (this.timebox == null) {
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

	game.updateTimer = function() {
		var me = this, time = this.time;
		var min = Math.floor(time.current / 60), sec = time.current % 60;
		me.timebox.getChildAt(0).text = (min >= 10 ? Math.floor(min / 10) : 0);
		me.timebox.getChildAt(1).text = (min >= 10 ? (min % 10) : min);
		me.timebox.getChildAt(3).text = (sec >= 10 ? Math.floor(sec / 10) : 0);
		me.timebox.getChildAt(4).text = (sec >= 10 ? (sec % 10) : sec);
		time.current++;
	}
	game.gameOver = function() {
		trace("game over:", this.score);
		Q.Tween.to(this.boombg, {alpha:1, scaleX:0.8, scaleY:0.8}, {time:200,	onComplete:function(tween){
			game.timer.pause();
			game.state = STATE.OVER;
			//game.playBtn.changeState([110, 97, 90, 90 ]);
			var over = new Q.Text({
				id : "gameover",color:'white',font:"bold 42px Arial", text:"游戏结束",x:290,y:280,width:200,height:50,lineSpacing:0, textAlign:"center"
			});
			game.stage.addChild(game.playBtn, over);
			game.stage.step();
			game.saveScore(this.score);
		}});
		//this.container.lastChild.appendChild(this.overlay);
	}
	game.startFreegame = function(){
		var _this =this;
		if(_this.freegame==null){
			_this.freegame = slotgame;
		}
		_this.freegame.init();
	}

	game.restart = function() {
		trace("game restart");
		this.overlay.parentNode.removeChild(this.overlay);
		this.stage.removeAllChildren();
		this.timer.paused = false;
		this.showUi();

		this.score = 0;
		this.time.current = this.time.total;
	}

	game.getScore = function() {
		var key = "squirrel_score";
		if (Q.supportStorage && localStorage.hasOwnProperty(key)) {
			var score = Number(localStorage.getItem("squirrel_score"));
			return score;
		}
		return 0;
	}

	game.saveScore = function(score) {
		var key = "squirrel_score";
		if (Q.supportStorage) {
			localStorage.removeItem(key);
			localStorage.setItem(key, score);
		}
	}

	game.showFPS = function() {
		var me = this, fpsContainer = Quark.getDOM("fps");
		setInterval(function() {
			fpsContainer.innerHTML = "FPS:" + me.frames;
			me.frames = 0;
		}, 1000);
	}

	game.hideNavBar = function() {
		window.scrollTo(0, 1);
	}

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
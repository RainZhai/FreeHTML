/**
 * slot game
 * 
 */
(function() {
	var slotgame = {
		container : null,
		backLayer : null, 
		MOVE_STEP : 10,
		combination : [ [ 1, 1, 5 ], [ 1, 2, 4 ], [ 1, 5, 1 ], [ 2, 1, 4 ],
				[ 2, 3, 3 ], [ 2, 4, 1 ], [ 2, 5, 4 ], [ 3, 1, 2 ],
				[ 3, 4, 3 ], [ 3, 5, 5 ], [ 4, 1, 2 ], [ 4, 2, 3 ],
				[ 4, 5, 1 ], [ 4, 5, 5 ], [ 5, 1, 1 ], [ 5, 2, 4 ],
				[ 5, 3, 2 ], [ 5, 5, 1 ], [ 1, 1, 1 ], [ 1, 1, 1 ] ],
		reels : [],
		kakes : [],
		stopBtn : [],
		start : null,
		win : null
	}
	window.slotgame = slotgame;
	slotgame.init = function() {
		this.gameInit();
	}
	slotgame.gameInit = function(event) {
		var _this = this, i, j, childmap;
		_this.container = new Q.DisplayObjectContainer({
			width : game.getWidth(),
			height : game.getHeight(),
			x : 0,
			y : 0
		});
		_this.backLayer = new Q.Bitmap({
			image : game.getImage("slot_back"),
			x : 0,
			y : 0,
			update:function(){
				_this.onframe();
			}
		});

		_this.container.addChild(_this.backLayer);

		for (i = 0; i < 3; i++) {
			var reel = new game.Reel(_this.combination, i);
			reel.x = 150 * i + 90;
			reel.y = 225;
			_this.reels.push(reel);
			_this.container.addChild(reel);
			var kake = new Q.Bitmap({
				image : game.getImage("kake")
			});
			kake.x = 150 * i + 90;
			kake.y = 225;
			_this.kakes.push(kake);
			_this.container.addChild(kake);
			var stop = new Q.Button({
				id : "slotstopBtn",
				image : game.getImage("icons"),
				width : 100,
				height : 100
			});
			stop.setUpState({
				rect : [ 110, 0, 90, 90 ]
			});
			stop.setOverState({
				rect : [ 110, 0, 90, 90 ]
			});
			// ["stop_up"]["stop_over"]
			stop.x = 150 * i + 110;
			stop.y = 490;
			stop.index = i;
			_this.stopBtn.push(stop);
			stop.visible = false;
			stop.addEventListener(game.getEvents(2), _this.stopevent);
			_this.container.addChild(stop);
		}
		
		_this.start = new Q.Button({
			id : "slotstartBtn",
			image : game.getImage("icons"),
			width : 100,
			height : 100
		});
		_this.start.setUpState({
			rect : [ 110, 0, 90, 90 ]
		});
		_this.start.setOverState({
			rect : [ 110, 0, 90, 90 ]
		});
		_this.start.x = 55;
		_this.start.y = 450;
		_this.start.addEventListener(game.getEvents(2), _this.onmouseup);
		_this.container.addChild(_this.start);

		_this.win = new Q.Button({
			id : "slotwinBtn",
			image : game.getImage("icons"),
			width : 100,
			height : 100
		});
		//"slot_ok"
		_this.win.setUpState({rect : [ 110, 0, 90, 90 ]});
		_this.win.setOverState({rect : [ 110, 0, 90, 90 ]});
		_this.win.visible = false;
		_this.win.addEventListener(game.getEvents(2), _this.winclick);
		_this.container.addChild(_this.win);
		game.stage.addChild(_this.container);
	}
	slotgame.onframe = function() {
		var i;
		for (i = 0; i < 3; i++) {
			this.reels[i].onframe();
		}
	}
	slotgame.stopevent = function(event, currentTarget) {
		this.reels[currentTarget.index].stopFlag = true;
	}
	slotgame.onmouseup = function(event) {
		var _this = slotgame;
		var i;
		var stopNum = Math.floor(Math.random() * (_this.combination.length / 3));
		_this.start.visible = false;
		for (i = 0; i < 3; i++) {
			_this.stopBtn[i].visible = true;
			_this.reels[i].startReel = true;
			_this.reels[i].stopFlag = false;
			_this.reels[i].stopNum = stopNum;
		}
	}
	slotgame.winclick = function() {
		this.win.visible = false;
		this.start.visible = true;
	}
	slotgame.checkWin = function() {
		var i;
		var allstop = 0;
		for (i = 0; i < 3; i++) {
			if (!this.reels[i].startReel)
				allstop++;
		}
		if (allstop >= 3) {
			for (i = 0; i < 3; i++) {
				this.stopBtn[i].visible = false;
			}

			if (this.reels[0].stopNum >= 19) {
				_this.win.visible = true;
			} else {
				this.start.visible = true;
			}
		}
	}
})();
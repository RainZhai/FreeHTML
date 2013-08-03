(function() {
	var Ball = game.Ball = function(props) {
		props = props || {};
		this.type = props.type;
		Ball.superClass.constructor.call(this, this.type);
		this.id = props.id || Q.UIDUtil.createUID("Ball");
		this.reset(this.type);
	};
	Q.inherit(Ball, Q.Bitmap);

	Ball.prototype.init = function() {
	};

	Ball.prototype.update = function(timeInfo) {
		this.rotation += 0.5;
	};

	Ball.prototype.reset = function(type) {
		this.setType(type);
		this.rect = this.type.rect;
		this.alpha = 1;
		this.fading = false;
		this.bouncing = false;
		this.currentSpeedY = this.type.speedY;
		this.currentSpeedX = 0;
		this.delay = Math.floor(Math.random() * 50);

		this.setRandomPosition();
	}

	Ball.prototype.setRandomPosition = function() {
		var minX = 100, maxX = game.width - 100, minY = -100, maxY = 0;
		this.x = Math.floor(Math.random() * (maxX - minX) + minX);
		this.y = -100;
	}

	Ball.prototype.setType = function(type) {
		this.type = type;
	}
	Ball.prototype.draw = function(color, radius) {
		this.drawCircle(0, 0, radius).beginFill(color).endFill().cache();
	} 
	Ball.getRandomType = function() {
		var list = this.TypeList;
		var r = Math.floor(Math.random() * list.length);
		return list[r];
	};

	Ball.prototype.getCollide = function() {
		this.currentSpeedY = Math.floor(-10);
		this.bouncing = true;
	}

	Ball.prototype.stopBounce = function() {
		this.bouncing = false;
	}
	Ball.init = function() {
		this.Type = {};
		this.Type.nut = {
			name: 'nut',
			regX : 94,
			regY : 92,
			score : 20,
			speedY : 0.2,
			image: game.getImage("icons"),
			rect:[0,223,70,83]
		};
		this.Type.nut2 = {
				name: 'nut',
				regX : 94,
				regY : 92,
				score : 10,
				speedY : 0.2,
				scaleX:0.8,
				scaleY:0.8,
				image: game.getImage("icons"),
				rect:[0,223,70,83]
			};
		this.Type.bomb = {
				name: 'bomb',
				regX : 94,
				regY : 92,
				score : 0,
				speedY : 0.4,
				image: game.getImage("icons"),
				rect:[102,217,72,98]
			};
		this.Type.chest = {
				name: 'chest',
				regX : 94,
				regY : 92,
				score : 0,
				speedY : 0.4,
				scaleX:0.8,
				scaleY:0.8,
				image: game.getImage("icons"),
				rect:[0,310,120,84]
			};
		this.TypeList = [ this.Type.nut,this.Type.nut2,this.Type.bomb,this.Type.chest ];
	}
})();
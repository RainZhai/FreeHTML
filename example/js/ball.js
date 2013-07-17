(function(){
var Ball = game.Ball = function(props) {
	props = props || {};
	this.type = props.type;
	Ball.superClass.constructor.call(this, this.type);
	this.id = props.id || Q.UIDUtil.createUID("Ball");

	this.reset(this.type);
	console.log(this.type.color)
	this.draw(this.type.color,this.type.radius);
};
Q.inherit(Ball, Q.Graphics);

Ball.prototype.init = function() {
};

Ball.prototype.update = function(timeInfo) {
	this.rotation += 0.5;
};

Ball.prototype.reset = function(type) {
	this.setType(type);
	this.currentScore = this.type.score;
	this.alpha = 1;
	this.fading = false;
	this.bouncing = false;
	this.currentSpeedY = this.speedY;
	this.currentSpeedX = 0;
	this.delay = Math.floor(Math.random() * 50);

	this.setRandomPosition();
}

Ball.prototype.setRandomPosition = function() {
	var minX = 100, maxX = game.width - 100, minY = -100, maxY = 0;
	this.x = Math.floor(Math.random() * (maxX - minX) + minX);
	this.y = Math.floor(50);
}

Ball.prototype.setType = function(type) {
	this.type = type;
}
Ball.prototype.draw = function(color,radius) {
	this.drawCircle(0, 0, radius).beginFill(color).endFill().cache();
}
Ball.getRandomType = function() {
	var list = this.TypeList;
	var r = Math.floor(Math.random() * list.length);
	return list[r];
};

Ball.prototype.getCollide = function() {
	this.currentScore += this.type.scoreStep;
	if (this.currentScore > this.type.maxScore)
		this.currentScore = this.type.maxScore;
	this.currentSpeedY = -10;
	this.bouncing = true;
}

Ball.prototype.stopBounce = function() {
	this.bouncing = false;
}

Ball.init = function() {
	this.Type = {};
	this.Type.small = {
		regX : 94,
		regY : 92,
		width : 188,
		height : 184,
		score : 0,
		speedY : 0,
		color: '#75C4FE',
		radius: 20
	};

	this.Type.medium = {
		regX : 94,
		regY : 92,
		width : 188,
		height : 184,
		score : 1,
		speedY : 0.5,
		color: '#CAE03C',
		radius: 30
	};

	this.Type.big = {
		regX : 94,
		regY : 92,
		width : 188,
		height : 184,
		score : 2,
		speedY : 1,
		color: 'red',
		radius: 15
	};

	this.TypeList = [ this.Type.small, this.Type.medium, this.Type.big ];
};
})();
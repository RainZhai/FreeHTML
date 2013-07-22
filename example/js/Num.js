(function() {
	var Ball = game.Ball = function(props) {
		props = props || {};
		this.type = props.type;
		Ball.superClass.constructor.call(this, this.type);
		this.id = props.id || Q.UIDUtil.createUID("Nummber");

		this.reset(this.type);
		this.draw(this.type.color, this.type.radius);
	};
	Q.inherit(Ball, Q.Text);

	Ball.prototype.init = function() {
	}; 

	Ball.prototype.reset = function(type) { }

	Ball.prototype.setRandomPosition = function() {
		var minX = 100, maxX = game.width - 100, minY = -100, maxY = 0;
		this.x = Math.floor(Math.random() * (maxX - minX) + minX);
		this.y = -100;
	}
})();
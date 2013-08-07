(function() {
	var Reel = game.Reel = function(props) {
		props = props || {};
		Reel.superClass.constructor.call(this, props);
		this.id = props.id || Q.UIDUtil.createUID("Reel");
		this.init(props.combination,props.index);
	};
	Q.inherit(Reel, Q.DisplayObjectContainer);

	Reel.prototype.init = function(combination,index) {
		this.maxSpeed = 70;
		this.minSpeed = 10;
		this.currentNum = 1;
		this.stopNum = 0;
		this.maxNum = 6;
		this.speedUpStep = 2;
		this.speedDownStep = 2;
		this.combination = combination;
		this.stopFlag = true;
		this.currentSpeed = 0;
		this.startReel = false;
		this.index = index;

		this.reels = [];
		this.indexs = [0,0,0,0];
		this.reels.push(new Q.Bitmap(this.getReel()));
		this.reels.push(new Q.Bitmap(this.getReel()));
		this.reels.push(new Q.Bitmap(this.getReel()));
		this.reels.push(new Q.Bitmap(this.reels[0]));
		
		
		var i,sy;
		this.reels[0].height = 60;
		this.reels[0]
		this.reels[0].x = 0;
		this.reels[0].x = 80-this.reels[0].height;
		this.reels[2].height = 60;
		this.reels[3].visible = false;
		sy = 0;
		for(i=0;i<this.reels.length;i++){
			this.reels[i].y = sy;
			sy += this.reels[i].height;
			this.addChild(this.reels[i]);
		}
	};

	Reel.prototype.onframe = function (){
	var _this = this;

	if(_this.startReel) _this.wheel();
	};
	Reel.prototype.getReel = function (){
		var _this = this;
		if(_this.currentNum > _this.maxNum)_this.currentNum = 1;
		_this.indexs[0] = _this.currentNum;

		_this.indexs.pop();
		_this.indexs.unshift(_this.currentNum);
		//var nextReel = new LBitmapData(imglist["item"+_this.currentNum++]);
		var nextReel ={image:game.getImage('item'+_this.currentNum++), width:60,height:60, x:0,y:0};
		return nextReel;
	};
	Reel.prototype.wheel = function (){
		var _this = this;
		
		//速度控制
		if (_this.stopFlag) {
			if (_this.currentSpeed > _this.minSpeed) {
				_this.currentSpeed -= _this.speedDownStep;
			} else {
				_this.currentSpeed = _this.minSpeed;
			}
		} else {
			if (_this.currentSpeed < _this.maxSpeed) {
				_this.currentSpeed += _this.speedUpStep;
			} else {
				_this.currentSpeed = _this.maxSpeed;
			}
		}
		if(_this.stopFlag && _this.currentSpeed <= _this.minSpeed && _this.indexs[1] == _this.combination[_this.stopNum][_this.index] && _this.reels[1].y + _this.currentSpeed > 60){
			_this.currentSpeed = 60 - _this.reels[1].y; 
			_this.startReel = false;
			
		}
		_this.setY();
		if(!_this.startReel)checkWin();
	};
	Reel.prototype.setY = function(){
		var _this = this;
		_this.reels[1].y += _this.currentSpeed;
		if(_this.reels[1].y + _this.reels[1].height > 200){
			_this.reels[1].height = 200 - _this.reels[1].y;
		}
		if(_this.reels[1].y > 80){
			_this.reels[0].height = 80;
			_this.reels[0].y = _this.reels[1].y - 80;
		}else{
			_this.reels[0].height = _this.reels[1].y;
			_this.reels[0].y = 0;
		} 
		_this.reels[0].x = 0;
		_this.reels[0].y = 80-_this.reels[0].height;
		
		_this.reels[2].y = _this.reels[1].y + _this.reels[1].height;
		
		if(_this.reels[2].y > 200){
			_this.reels[2].visible = false;
		}else if(_this.reels[2].y + 80 > 200){
			_this.reels[2].height = 200 - _this.reels[2].y;
		}else{
			_this.reels[3].y = _this.reels[2].y + _this.reels[2].height;
			if(_this.reels[3].y < 200){
				_this.reels[3].height = 200 - _this.reels[3].y;
			}
		}
		
		if(_this.reels[0].y > 0){
			var child = _this.reels.pop();
			child.bitmapData = _this.getReel();
			child.visible = true;
			_this.reels.unshift(child);
			child.y = 0;
			child.height = _this.reels[1].y;
			child.bitmapData.height = child.height;
			child.x = 0;
			child.y = 80-child.height;
		}
		if(_this.reels[3].y >= 200){
			_this.reels[3].visible = false;
		}
	};
})();
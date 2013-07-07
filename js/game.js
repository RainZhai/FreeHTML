require.config({
	"baseUrl": "./js/",
	paths: {
		jquery: 'lib/jquery-1.10.1.min',
		template: 'lib/handlebars',
		twojs: 'lib/two.min.js',
		backbone: 'backbone-min',
		underscore: 'underscore-min',
		html: 'freehtml'
	},
  priority: ['jquery']
});
require(['jquery','html','classobj'], function ($,_html,c){
	var html = _html.htmlObj;
	var provider = _html.classObj.getInstance();
	var doc = {
		'body' : new html('body'),
		container : new html('#canvas'),
		startBtn: new html({tagName:"img",id:'startBtn',src:'images/START-Button.png',css:{width:100,height:37}})
	};
    //全局变量   
    var backgroundForestImg = new Image();//森林背景图   
    var mushroomImg = new Image();//蘑菇 
	var bearEyesClosedImg = new Image();//闭着眼睛的熊熊 
    var ctx;//2d画布   
    var screenWidth;//画布宽度   
    var screenHeight;//画布高度 
	var speed = 2;//不变常量,从新开始的速度  
    var horizontalSpeed = speed;//水平速度,随着熊的碰撞会发生改变
	var verticalSpeed = -speed;	//垂直速度,开始肯定是要向上飘，所以要负数，随着熊的碰撞会发生改变
	var bearAngle = 2;//熊旋转的速度
	var flowerImg = new Image();//奖品鲜花
	var leafImg = new Image();//奖品叶子
	var acornImg = new Image();//奖品橡子
	var gameRunning = false;//游戏运行状态
	var gameloopId;//记住循环的变量
	var lives=3;//3条生命数
	var livesImages = new Array();//生命图片数组
	var score = 0;//分数
	var scoreImg = new Image();//分数板
    //公用 定义一个游戏物体戏对象   
    function GameObject()   
    {   
        this.x = 0;   
        this.y = 0;   
        this.image = null;   
    }   
       
    //定义蘑菇Mushroom 继承游戏对象GameObject   
    function Mushroom() {};   
    Mushroom.prototype = new GameObject();//游戏对象GameObject   
    //蘑菇实例   
    var mushroom = new Mushroom();        //循环描绘物体  
	 
	//定义动物熊 Animal 继承 游戏对象GameObject
	function Animal() {};
	Animal.prototype = new GameObject();//游戏对象GameObject
	Animal.prototype.angle = 0;//动物的角度，目前中（即作为动物它在屏幕上旋转退回）
	//定义熊实例 
	var animal = new Animal();
	
	//定义奖品数组Prizes和对象Prize，继承游戏对象GameObject
	var prizes = new Array();
	function Prize() {};
	Prize.prototype = new GameObject();//继承游戏对象GameObject
	Prize.prototype.row = 0;//奖品行位置
	Prize.prototype.col = 0;//奖品列位置
	Prize.prototype.hit = false;//是否被撞过
	Prize.prototype.point = 0;//分数
	
    function GameLoop()   
    {   
        //清除屏幕   
        ctx.clearRect(0, 0, screenWidth, screenHeight);   
        ctx.save();   
        //绘制背景   
        ctx.drawImage(backgroundForestImg, 0, 0, screenWidth, screenHeight);   
        //绘制蘑菇   
        ctx.drawImage(mushroom.image, mushroom.x, mushroom.y); 
		//绘制奖品
		DrawPrizes();
		//绘制生命条
		DrawLives();
		//绘制分数板
		DrawScore();		
		//绘制熊
		//改变移动动物X和Y位置
		animal.x += horizontalSpeed;
		animal.y += verticalSpeed;
		//改变翻滚角度
		animal.angle += bearAngle;
		//以当前熊的中心位置为基准
   	    ctx.translate(animal.x + (animal.image.width/2), animal.y + (animal.image.height/2));
		//根据当前熊的角度轮换
    	ctx.rotate(animal.angle * Math.PI/180);
		//描绘熊
	  	ctx.drawImage(animal.image, - (animal.image.width/2), - (animal.image.height/2));

        ctx.restore();
		//检测是否碰到边界
		HasAnimalHitEdge();
		//检测熊碰撞蘑菇
		HasAnimalHitMushroom();
		//检测熊碰撞奖品
		HasAnimalHitPrize();
        }   
    //加载图片   
    function LoadImages()   
    {   
        mushroomImg.src = "images/mushroom.png";//蘑菇   
        backgroundForestImg.src = "images/forest1.jpg";//森林背景图  
		bearEyesClosedImg.src = "images/bear_eyesclosed.png";//闭着眼睛的
		flowerImg.src = "images/flower.png";//奖品花
		acornImg.src = "images/acorn.png";//奖品橡子
		leafImg.src = "images/leaf.png";//奖品叶子
		scoreImg.src = "images/score.png";//分数板
		//生命图片因为只有6个，所以最多只能6个
		for(var x=0; x<6; x++)
		{
			livesImages[x] = new Image();	
			livesImages[x].src = "images/lives" + x + ".png";
		}
		
		mushroom.image = mushroomImg;   
		animal.image = bearEyesClosedImg;
		backgroundForestImg.onload = function(){GameLoop(); };
    } 
	//熊碰撞边界
	function HasAnimalHitEdge()
	{
		//熊碰到右边边界
		if(animal.x>screenWidth - animal.image.width)
		{
			if(horizontalSpeed > 0)//假如向右移动
				horizontalSpeed =-horizontalSpeed;//改变水平速度方向
		}
		//熊碰到左边边界
		if(animal.x<-10)
		{
			if(horizontalSpeed < 0)//假如向左移动
				horizontalSpeed = -horizontalSpeed;//改变水平速度方向
		}
		//熊碰到下面边界
		if(animal.y>screenHeight - animal.image.height)
		{
			lives -=1;//生命减1
			if(lives>0)
			{
				horizontalSpeed = speed;
				verticalSpeed = -speed;
				animal.x = parseInt(screenWidth/2);
				animal.y = parseInt(screenHeight/2);
				doc.startBtn.jq.show();
				ToggleGameplay();
				GameLoop();
			}
		}
		//熊碰到上边边界
		if(animal.y<0)
		{
			verticalSpeed = -verticalSpeed;
		}
		if(lives<=0)
			GameOver();
	}
	//事件处理   
	function AddEventHandlers()   
	{   
		//鼠标移动则蘑菇跟着移动   
		doc.container.jq.mousemove(function(e){   
			mushroom.x = e.pageX - (mushroom.image.width/2);   
		}); 
		//开始按钮   
		doc.startBtn.jq.click(function (){		
			ToggleGameplay();
		});
	} 
	//检测2个物体是否碰撞
	function CheckIntersect(object1, object2, overlap)
	{
		//    x-轴                      x-轴
		//  A1------>B1 C1              A2------>B2 C2
		//  +--------+   ^              +--------+   ^
		//  | object1|   | y-轴         | object2|   | y-轴
		//  |        |   |              |        |   |
		//  +--------+  D1              +--------+  D2
		//
	 	//overlap是重叠的区域值
		A1 = object1.x + overlap;
		B1 = object1.x + object1.image.width - overlap;
		C1 = object1.y + overlap;
		D1 = object1.y + object1.image.height - overlap;
	 
		A2 = object2.x + overlap;
		B2 = object2.x + object2.image.width - overlap;
		C2 = object2.y + overlap;
		D2 = object2.y + object2.image.width - overlap;
	 
		//假如他们在x-轴重叠
		if(A1 > A2 && A1 < B2
		   || B1 > A2 && B1 < B2)
		{
			//判断y-轴重叠
			if(C1 > C2 && C1 < D1
		   || D1 > C2 && D1 < D2)
			{
				//碰撞
				return true;
			}
	 
		}
		return false;
	}
	//动物碰撞蘑菇
	function HasAnimalHitMushroom()
	{
		//假如碰撞
		if(CheckIntersect(animal, mushroom, 5))
		{
			//假如碰撞的位置属于蘑菇的左下位置
			if((animal.x + animal.image.width/2) < (mushroom.x + mushroom.image.width*0.25))
			{
				horizontalSpeed = -speed;//反弹
			}
			//假如碰撞的位置属于蘑菇的左上位置
			else if((animal.x + animal.image.width/2) < (mushroom.x + mushroom.image.width*0.5))
			{
				//反弹速度减半
				horizontalSpeed = -speed/2;
			}
			//假如碰撞的位置属于蘑菇的右上位置
			else if((animal.x + animal.image.width/2) < (mushroom.x + mushroom.image.width*0.75))
			{
				horizontalSpeed = speed/2;
			}
			else
			{
				horizontalSpeed = speed;
			}
			verticalSpeed = -speed;//改变垂直速度。也即动物向上移动
	 
		}
	}
	//创建奖品数组
	function InitPrizes()
	{
		var count=0;
		//一共3行
		for(var x=0; x<3; x++)
		{
			//一共23列
			for(var y=0; y<23; y++)
			{
				prize = new Prize();
				if(x==0)
				{
					prize.image = flowerImg;//鲜花放在第一行
					prize.point = 3;//3分
				}
				if(x==1)
				{
					prize.image = acornImg;//豫子刚在第2行
					prize.point = 2;//2分
				}
				if(x==2)
				{
					prize.image = leafImg;//叶子放在第3行
					prize.point = 1;//1分
				}
					
				prize.row = x;
				prize.col = y;
				prize.x = 20 * prize.col + 10;//x轴位置
				prize.y = 20 * prize.row + 40;//y轴位置
				//装入奖品数组，用来描绘
				prizes[count] = prize;
				count++;
			}
		}
	}
	//绘制奖品，把奖品显示在画布上
	function DrawPrizes()
	{
		for(var x=0; x<prizes.length; x++)
		{
			currentPrize = prizes[x];			
			//假如没有被撞击，则描绘
			if(!currentPrize.hit)
			{
				ctx.drawImage(currentPrize.image, prizes[x].x, prizes[x].y);
			}
		}
		if(AllPrizesHit())
		{
			GameOver();
		}
	}
	
	//撞到奖品
	function HasAnimalHitPrize()
	{
		//取出所有奖品
		for(var x=0; x<prizes.length; x++)
		{
			var prize = prizes[x];
	 		//假如没有碰撞过
			if(!prize.hit)
			{
				//判断碰撞
				if(CheckIntersect(prize, animal, 0))
				{
					prize.hit = true;
					//熊反弹下沉
					verticalSpeed = speed;
					//得分
					score += prize.point;
				}
			}
		}

	}
	//判断是否撞完奖品，假如其中有一个
	function AllPrizesHit()
	{
		for(var c=0; c<prizes.length; c++)
		{
			checkPrize = prizes[c];
			if(checkPrize.hit == false)
				return false;
				
		}
		return true;
	}
	//开始或者暂停游戏
	function ToggleGameplay()
	{
		gameRunning = !gameRunning;
		if(gameRunning)
		{
			doc.startBtn.jq.hide();
		     gameloopId = setInterval(GameLoop, 10); 
		}else
		{
			clearInterval(gameloopId);
		}
	}
	//结束游戏
	function GameOver()
	{
		gameRunning = false;
		clearInterval(gameloopId);
		alert("游戏结束!");
	}
	//描绘生命条
	function DrawLives()
	{
		ctx.drawImage(livesImages[lives], 0, 0);
	}
	//描绘分数
	function DrawScore()
	{
		ctx.drawImage(scoreImg, screenWidth-(scoreImg.width),0);
		ctx.font = "12pt Arial";
		ctx.fillText("" + score, 425, 25);  
	}
    //初始化     
		AddEventHandlers();//添加事件  
        LoadImages();           
        ctx = doc.container.jq[0].getContext('2d'); //获取2d画布      
        screenWidth = 480; //画布宽度 
        screenHeight = 320;   
		//初始化蘑菇
        mushroom.x = parseInt(screenWidth/2);// 蘑菇X坐标  
        mushroom.y = screenHeight - 40;//蘑菇Y坐标   
		//初始化熊
		animal.x = parseInt(screenWidth/2);
		animal.y = parseInt(screenHeight/2); 
		//初始化奖品
		InitPrizes();
          
	doc.body.add(doc.container).add(doc.startBtn);
});

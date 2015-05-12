var PlayScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new ChipmunkDemo();
        this.addChild(layer);
    }
});

var ChipmunkDemo = cc.Layer.extend({
    waterLayer:null,
    button:null,
    time:60,
    score:0,
    isOver:false,
    animateHelper:null,
    bubbleNode:null,
    ctor:function(){
        this._super();

        var winSize = cc.director.getWinSize(),
            self = this;

        self.animateHelper = new AnimationHelper();

        self.waterLayer = new WaterLayer(cc.color(139,191,211,255),winSize.width,winSize.height*0.6);
        self.addChild(self.waterLayer,0,1);

        var closeItem = new cc.MenuItemImage(
            res.CloseNormal_png,
            res.CloseSelected_png,
            function () {
                if (!self.isOver) 
                {
                    self.getChildByTag(1).leftImpulse();
                }
            }, self);
        closeItem.attr({
            x: 20,
            y: winSize.height*0.2,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var closeItem2 = new cc.MenuItemImage(
            res.CloseNormal_png,
            res.CloseSelected_png,
            function () {
                if (!self.isOver) 
                {
                    self.getChildByTag(1).rightImpulse();
                }
            }, self);
        closeItem2.attr({
            x: winSize.width - 20,
            y: winSize.height*0.2,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(closeItem,closeItem2);
        menu.x = 0;
        menu.y = 0;
        self.addChild(menu, 1);

        self.bubbleNode = new cc.SpriteBatchNode(res.p_png,30);
        self.bubbleNode.setPosition(cc.p(0,0));
        self.waterLayer.addChild(self.bubbleNode,bgSpriteIndex,bgSpriteIndex);

        self.schedule(self.calTime,1);

        self.schedule(self.backgroundSpriteShow,3);

        self.backgroundSpriteShow();
    },
    setupDebugNode: function () {
        this._debugNode = new cc.PhysicsDebugNode(this.space);               
        this._debugNode.visible = DEBUG_NODE_SHOW;                          
        this.addChild(this._debugNode);                                     
    },
    onEnter:function(){
        this._super();

    },
    onExit:function(){
        this._super();
    },
    backgroundSpriteShow:function(dt){
        var showRandom = Math.random();
        if (showRandom<0.5) 
        {
            //right to left
            if (showRandom<0.25) 
            {
               this.addSpriteWithFrame(mySprite.cow,true); 
            }
            else{
                this.addSpriteWithFrame(mySprite.cow,false); 
            }
        }
    },
    addSpriteWithFrame:function(spriteObj,toLeft){

        var winSize = cc.director.getWinSize(),
            self = this,
            cow = spriteObj;

        var testSprite = new cc.Sprite(spriteObj.img),
            spriteSize = testSprite.getContentSize();

        var px = toLeft? winSize.width-spriteSize.width/2 : spriteSize.width/2,
            py = 20 + (self.waterLayer.height-40) * Math.random(); //上下留边

        testSprite.setPosition(cc.p(px,py));

        self.waterLayer.addChild(testSprite,5);

        //move action
        var movePx = toLeft? 0-spriteSize.width/2 : this.waterLayer.width + spriteSize.width/2;
        var moveP = cc.p(movePx,py),
            actionTime = 10,
            moveAction = cc.moveTo(actionTime,moveP);

        //frame action
        var frameAction = self.animateHelper.frameAnimation(actionTime,spriteObj),
            frameAnimate = new cc.Animate(frameAction);

        var bubbleSeq = self.bubbleAction(testSprite,actionTime);
        //action all
        var moveSpawn = new cc.Spawn(moveAction,frameAnimate,bubbleSeq),
            removeSprite = new cc.CallFunc.create(self.removeSprite, self, testSprite),
            delay = new cc.DelayTime(0.4);

        var sequence = new cc.Sequence(delay, moveSpawn,removeSprite);

        testSprite.runAction(sequence);
    },
    removeSprite:function(sprite){
        if (sprite) 
        {
            sprite.removeFromParent(true);
        }
    },
    bubbleAction:function(sprite,time){
        //bubble action
        var delay = Math.random()*0.8;//吐泡泡的延时时间系数

        var bubbleAnimation = new cc.CallFunc(this.bubbleAnimation,this,sprite),
            bubbleDelay = new cc.DelayTime(delay*time), 
            bubbleInterval = new cc.DelayTime(0.4),//吐泡泡的间隔时间
            bubbleSeq;

        var sequence = new cc.Sequence(bubbleDelay,bubbleAnimation,
                                        bubbleInterval,bubbleAnimation,
                                        bubbleInterval,bubbleAnimation);
        if (delay>0.4) 
        {
            
            bubbleSeq = sequence;
        }
        else
        {
            //可以吐两次泡泡
            var twiceDelay = new cc.DelayTime((0.8-delay)*time);
            var sequenceTwice = new cc.Sequence(twiceDelay,bubbleAnimation,
                                        bubbleInterval,bubbleAnimation,
                                        bubbleInterval,bubbleAnimation);
            bubbleSeq = new cc.Sequence(sequence,sequenceTwice);
        }
        return bubbleSeq;
    },
    bubbleAnimation:function(sprite){
        if (sprite) 
        {
            //创建泡泡精灵并加上action动画
            var bubble = this.animateHelper.bubbleAnimation(sprite.getPosition(),true,this.bubbleNode);
            this.bubbleNode.addChild(bubble);
        }
    },
    calTime:function(dt){
        var self = this;
        self.time--;
        if (self.time == 0) 
        {
            // self.gameOver();  
        }
    },
    addScore:function(){
        this.score += this.time * 10;
    },
    gameOver:function(){
        this.score += this.time * 100;
        this.isOver = true;
        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.calTime);
        console.log("game over, "+this.score);
    }
});
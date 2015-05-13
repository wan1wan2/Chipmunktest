var AnimationHelper = function(){

}

AnimationHelper.prototype.frameAnimation = function(actionTime,obj){

	var sprite = obj;
		// size = cc.rect(0,0,sprite.size.width,sprite.size.height);

	if (cc.animationCache.getAnimation(sprite.name)) 
	{
		return cc.animationCache.getAnimation(sprite.name);
	}

	var animationFrames = [];

	cc.spriteFrameCache.addSpriteFrames(res.cow_frame_plist);

	for (var i = 0; i< sprite.frame.length; i++)
	{
			//cc.SpriteFrame(文件名称, rect, rotated, offset, originalSize)
			//cc.AnimationFrame(spriteFrame, delayUnits, userInfo)
		var	frame = cc.spriteFrameCache.getSpriteFrame(sprite.frame[i]),
			animationFrame = new cc.AnimationFrame(frame,1,0);

		animationFrames.push(animationFrame);
	}

	// cc.Animation(frames, delay, loops)
	var frameSpeed = 0.3,
	    frameRepeat = actionTime/(frameSpeed*sprite.frame.length);
	var animation = new cc.Animation(animationFrames,frameSpeed,frameRepeat);

	//缓存动画
	cc.animationCache.addAnimation(animation,sprite.name);

	return animation;
}

AnimationHelper.prototype.bubbleAnimation = function(sprite,spriteNode){

	var winSize = cc.director.getWinSize(),
		leftDirection = sprite.toLeft;

	var bubble = new cc.Sprite(spriteNode.getTexture());

	var pos = sprite.getPosition();
	var px = leftDirection? pos.x-sprite.getContentSize().width/2 : pos.x+sprite.getContentSize().width/2;
	bubble.setPosition(cc.p(px,pos.y));

	var duration = (winSize.height - pos.y)/winSize.height * 10;
	var moveBy = new cc.MoveBy(duration,cc.p(leftDirection?40:-40,winSize.height-pos.y+bubble.getContentSize().height)),
		scaleBy = new cc.ScaleBy(duration,2),
		spawn = new cc.Spawn(moveBy,scaleBy),
		removeSprite = new cc.CallFunc.create(this.removeSprite, this,bubble),
		sequence = new cc.Sequence(spawn,removeSprite);

	bubble.runAction(sequence);

	return bubble;
}

AnimationHelper.prototype.removeSprite = function(sprite){
	if (sprite) 
    {
        sprite.removeFromParent(true);
    }
}



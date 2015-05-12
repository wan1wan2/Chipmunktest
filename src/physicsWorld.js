var SPRITE_WIDTH = 60,                                       
    SPRITE_HEIGHT = 59,
    POLE_WIDTH = 10,
    POLE_HEIGHT = 70,
    OBSTACLE_WIDTH = 60,
    OBSTACLE_HEIGHT = 25;

var DEBUG_NODE_SHOW = true; 

var Ball_CollisionType = 10,
    Poll_CollisionType = 11,
    Static_Space_CollisionType = 5;

var zIndex = 10,
    polyIndex = 8,
    bgSpriteIndex = 5;
var polyTag = 8,
    obsTag = 9;

var WaterLayer = cc.LayerColor.extend({
    space:null,
    ballShape:[],
    ballNode:null,
    poleNode:null,
    obsNode:null,
    ctor:function(){
        this._super();
        var winSize = cc.director.getWinSize();
        this.width = winSize.width;
        this.height = winSize.height*0.6;
        this.setColor(cc.color(139,191,211,255));
        this.setPosition(cc.p(0,winSize.height*0.4));

        //初始化物理世界
        this.initPhysics();
        //初始化各个精灵
        this.initSprite();

        this.scheduleUpdate();
    },
    setupDebugNode: function () {
        this._debugNode = new cc.PhysicsDebugNode(this.space);               
        this._debugNode.visible = DEBUG_NODE_SHOW;                          
        this.addChild(this._debugNode);                                     
    },
    onEnter:function(){
        this._super();
        
        //监听，添加浮力
        // this.space.addCollisionHandler( Ball_CollisionType, 0, null, this.waterPreSolve, null, null);

        //监听球和三个杠子的碰撞
        this.space.addCollisionHandler(Ball_CollisionType,Poll_CollisionType,
                                        this.collisionBegin.bind(this),
                                        this.collisionPre.bind(this),
                                        this.collisionPost.bind(this),
                                        this.collisionSeparate.bind(this));
    },
    onExit:function(){
        this._super();

        //注销监听
        this.space.removeCollisionHandler(1, 0);
        this.space.removeCollisionHandler(Ball_CollisionType, Poll_CollisionType);
    },
    initPhysics:function(){
        var winSize = cc.director.getWinSize();

        this.space = new cp.Space(); //创建空间对象
        this.setupDebugNode();
        this.space.iterations = 30;  //????
        this.space.gravity = cp.v(0,-20); //重力
        this.space.sleepTimeThreshold = 0.5; 
        this.space.collisionSlop = 0.5;

        // this.space.gravity = cp.v(0,-50);  //设置重力
        // this.space.damping = 0.1;
        var staticBody = this.space.staticBody; 

         // 设置空间边界  
         //创建物理空间，它是由4条边线段形状构成的，
         // 从上到下分别创建了这4个线段形状（cp.SegmentShape），
         // new cp.SegmentShape语句可以创建一条线段形状，它的构造函数有4个参数，
         // 第一个形状所附着的物体，由于是静态物体，本例中使用this.space.staticBody表达式获得静态物体。
         // 第二个参数是线段开始点，第三个参数是线段结束点，第四个参数是线段的宽度。
        var walls = [
                   new cp.SegmentShape(staticBody, cp.v(0, 0),   
                                        cp.v(this.width, 0), 0),                    
                   new cp.SegmentShape(staticBody, cp.v(0, this.height),   
                                                cp.v(this.width, this.height), 0),             
                   new cp.SegmentShape(staticBody, cp.v(0, 0),   
                                                cp.v(0, this.height), 0),                    
                   new cp.SegmentShape(staticBody, cp.v(this.width, 0),   
                                        cp.v(this.width, this.height), 0)         
        ];  

        for (var i = 0; i < walls.length; i++) 
        {
            var shape = walls[i];
            shape.setElasticity(0.1); //弹性系数
            shape.setFriction(1); //摩擦系数
            this.space.addStaticShape(shape);

            shape.setCollisionType(Static_Space_CollisionType);//添加碰撞检测的tag
        }


    },
    initSprite:function(){

        //使用BatchNode来优化渲染
        this.ballNode = new cc.SpriteBatchNode(res.sprite_png, 10);
        this.ballNode.setPosition(cc.p(0,0));
        this.addChild(this.ballNode,10,10);

        this.poleNode = new cc.SpriteBatchNode(res.pole_png, 3);
        this.poleNode.setPosition(cc.p(0,0));
        this.addChild(this.poleNode,polyTag,polyIndex);

        this.obsNode = new cc.SpriteBatchNode(res.obs_png, 3);
        this.obsNode.setPosition(cc.p(0,0));
        this.addChild(this.obsNode,polyTag,polyIndex);

        for (var i = 0; i < 10; i++) {
            this.addNewSpriteAtPosition();
        }

        this.addNewPole();

    },
    addNewSpriteAtPosition:function(){

        //创建动态物体，第一个参数是质量，可以改变物体的物理特性，第二个参数是惯性值，其中的第一个参数是质量，第二个是宽度，第三个是高度

        var p = cc.p(Math.random()*this.width,Math.random()*this.height*0.2);
        // var p = cc.p(Math.random()*this.width,this.height);

        var body = new cp.Body(0.05,cp.momentForCircle(0.05,SPRITE_WIDTH,SPRITE_HEIGHT,cp.v(0,0))); 
        body.setPos(p);//设置重心坐标
        this.space.addBody(body);

        var shape = new cp.CircleShape(body,SPRITE_WIDTH/2+10,cp.v(0,0)); //创建形状对象
        shape.setElasticity(0.3);
        shape.setFriction(0.5);
        shape.setCollisionType(Ball_CollisionType);
        shape.tag = zIndex;
        this.space.addShape(shape);
        this.ballShape.push(shape);

        //创建物理引擎精灵对象
        var sprite = new cc.PhysicsSprite(this.ballNode.getTexture());
        sprite.setBody(body);
        sprite.setPosition(cc.p(p.x,p.y));
        this.ballNode.addChild(sprite,zIndex,zIndex);
        zIndex++;
    },
    removeBall: function(tag){
        var shape,index;
        for(var i = 0;i<this.ballShape.length;i++)
        {
            if (this.ballShape[i].tag == tag) 
            {
                shape = this.ballShape[i];
                index = i;
            }
        }
        if (shape) 
        {
            this.space.removeShape(shape);
            this.ballShape.splice(index,1);

            var sprite = this.ballNode.getChildByTag(tag);
            sprite.removeFromParent(true);
            this.parent.addScore();
            if (this.ballShape.length == 0) 
            {
                this.parent.gameOver();
            }
        }
    },
    addNewPole:function(){

        var pos0 = cc.p(this.width/2,this.height/2),
            pos1 = cc.p(this.width/4,this.height*0.75),
            pos2 = cc.p(this.width*0.75,this.height*0.75),
            pos = [pos0,pos1,pos2];
        for (var i = 0; i < pos.length; i++) {
            var body = new cp.StaticBody(0.05, cp.momentForBox(0.05, POLE_WIDTH, POLE_HEIGHT));
            body.setPos(pos[i]);

            var shape = new cp.BoxShape(body,POLE_WIDTH,POLE_HEIGHT); //创建形状对象
            shape.setElasticity(0.5);
            shape.setFriction(0.5);
            shape.setCollisionType(Poll_CollisionType);
            this.space.addStaticShape(shape);

            var sprite = new cc.PhysicsSprite(this.poleNode.getTexture());
            sprite.setBody(body);
            sprite.setPosition(pos[i]);
            this.poleNode.addChild(sprite);
        };

        var obsPos0 = cc.p(this.width/2,this.height/2 - POLE_HEIGHT/2 - OBSTACLE_HEIGHT/2),
            obsPos1 = cc.p(this.width/4,this.height*0.75 - POLE_HEIGHT/2 - OBSTACLE_HEIGHT/2),
            obsPos2 = cc.p(this.width*0.75,this.height*0.75 - POLE_HEIGHT/2 - OBSTACLE_HEIGHT/2),
            obsPos = [obsPos0,obsPos1,obsPos2];

        for (var i =0;i<obsPos.length;i++)
        {
            var body = new cp.StaticBody(0.05, cp.momentForBox(0.05, OBSTACLE_WIDTH, OBSTACLE_HEIGHT));
            body.setPos(obsPos[i]);

            var shape = new cp.BoxShape(body,OBSTACLE_WIDTH,OBSTACLE_HEIGHT); //创建形状对象
            shape.setElasticity(0.5);
            shape.setFriction(0.5);
            this.space.addStaticShape(shape);

            var sprite = new cc.PhysicsSprite(this.obsNode.getTexture());
            sprite.setBody(body);
            sprite.setPosition(obsPos[i]);
            this.obsNode.addChild(sprite);
        }
    },
    leftImpulse:function(){
        for (var i = 10;i<zIndex;i++)
        {
            var child = this.ballNode.getChildByTag(i);
            if (child) 
            {
                var x = child.getPosition().x,
                    y = child.getPosition().y,
                    horizon = (this.width-x)/this.width * 10,
                    vertical = (this.height-y)/this.height * 10;
               child.getBody().applyImpulse(cp.v(horizon,vertical), cp.v(0,0)); 
            }    
        } 
    },
    rightImpulse:function(){
        for (var i = 10;i<zIndex;i++)
        {
            var child = this.ballNode.getChildByTag(i);
            if (child) 
            {
                var x = child.getPosition().x,
                    y = child.getPosition().y,
                    horizon = (-x)/this.width * 10,
                    vertical = (this.height-y)/this.height * 10;
               child.getBody().applyImpulse(cp.v(horizon,vertical), cp.v(0,0));
            }  
        } 
    },
    updateBallAndPole:function(posBall,posPole,tag,vy){
        if (this.checkShouldScore(posBall,posPole,vy)) 
        {
            this.removeBall(tag);
        }
    },
    checkShouldScore:function(posBall,posPole,vy){
        var condition0 = posBall.y>posPole.y+POLE_HEIGHT/2+SPRITE_HEIGHT/4,
            condition1 = Math.abs(posBall.x-posPole.x)<SPRITE_WIDTH/2,
            condition2 = vy<0;
        return condition0&&condition1&&condition2;
    },
    collisionBegin: function(arb,space) {

        if (arb.isFirstContact()) 
        {
            var shapes = arb.getShapes();
 
            var shapeA = shapes[0];
            var shapeB = shapes[1];
            var posPole = shapeB.body.p,
                posBall = shapeA.body.p;
            var vy = arb.body_a.vy;
            
            this.space.addPostStepCallback(function () {
                this.updateBallAndPole(posBall,posPole,shapeA.tag,vy);
            }.bind(this));
        }
            
        return true;

    },
    collisionPre : function ( arbiter, space ) {
        // console.log(arbiter.totalImpulse());

        
        return true;
    },
    collisionPost : function ( arbiter, space ) {
        // console.log(arbiter);
        // console.log(arbiter.surface_vr);
        // console.log(arbiter.totalImpulseWithFriction());
    },

    collisionSeparate : function ( arbiter, space ) {
        // console.log(arbiter.surface_vr);
    },
    waterPreSolve : function(arb, space, ptr) {

        var FLUID_DENSITY = 0.00014;
        var FLUID_DRAG = 2.0;

        var shapes = arb.getShapes();
        var water = shapes[0];
        var poly = shapes[1];

        var body = poly.getBody();

        // Get the top of the water sensor bounding box to use as the water level.
        var level = water.getBB().t;

        // Clip the polygon against the water level
        var count = poly.getNumVerts();

        var clipped = [];

        var j=count-1;
        for(var i=0; i<count; i++) {
            var a = body.local2World( poly.getVert(j));
            var b = body.local2World( poly.getVert(i));

            if(a.y < level){
                clipped.push( a.x );
                clipped.push( a.y );
            }

            var a_level = a.y - level;
            var b_level = b.y - level;

            if(a_level*b_level < 0.0){
                var t = Math.abs(a_level)/(Math.abs(a_level) + Math.abs(b_level));

                var v = cp.v.lerp(a, b, t);
                clipped.push(v.x);
                clipped.push(v.y);
            }
            j=i;
        }

        // Calculate buoyancy from the clipped polygon area
        var clippedArea = cp.areaForPoly(clipped);

        var displacedMass = clippedArea*FLUID_DENSITY;
        var centroid = cp.centroidForPoly(clipped);
        var r = cp.v.sub(centroid, body.getPos());

        var dt = space.getCurrentTimeStep();
        var g = space.gravity;

        // Apply the buoyancy force as an impulse.
        body.applyImpulse( cp.v.mult(g, -displacedMass*dt), r);

        // Apply linear damping for the fluid drag.
        var v_centroid = cp.v.add(body.getVel(), cp.v.mult(cp.v.perp(r), body.w));
        var k = 1; //k_scalar_body(body, r, cp.v.normalize_safe(v_centroid));
        var damping = clippedArea*FLUID_DRAG*FLUID_DENSITY;
        var v_coef = Math.exp(-damping*dt*k); // linear drag
//  var v_coef = 1.0/(1.0 + damping*dt*cp.v.len(v_centroid)*k); // quadratic drag
        body.applyImpulse( cp.v.mult(cp.v.sub(cp.v.mult(v_centroid, v_coef), v_centroid), 1.0/k), r);

        // Apply angular damping for the fluid drag.
        var w_damping = cp.momentForPoly(FLUID_DRAG*FLUID_DENSITY*clippedArea, clipped, cp.v.neg(body.p));
        body.w *= Math.exp(-w_damping*dt* (1/body.i));


        return true;
    },
    update: function (dt) {  
        var timeStep = 0.03;                                                
        this.space.step(timeStep);                                        
    }  
});



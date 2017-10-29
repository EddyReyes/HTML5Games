// player/frog
function Player()
{
	// player data
	this.rect = new Rect();
	// set initial size
	this.rect.dim.width = constants.PLAYERSIZE;
	this.rect.dim.height = constants.PLAYERSIZE;
	// initially the frog will be sitting on the first liliPad of the liliPad Array
	this.liliPadNum = 0;
	// projectedPos is use to calculate displacement for smooth jumping motion
	this.projectedPos = new Position();
	
	// create arms
	this.arms = new arms();
	this.arms.init(this, constants.PLAYERARMSIZE);
	// create legs
	this.legs = new legs();
	this.legs.init(this, constants.PLAYERLEGSIZE);
	// create eyes
	this.eyes = new eyes();
	this.eyes.init(this, constants.PLAYEREYESIZE, constants.PLAYEREYEOFFSET);
	
	// create jumpZone (to check for safe jumping on liliPads)
	this.jumpZone = new jumpZone();
	this.drawJumpZone = false;
	this.jumping = false;
	this.state = playerStates.alive;
	this.lifeBar = new lifeBar();
	this.score = 0;
	
	// jump timer
	this.jumpTimer = 0;
	
	// liliPad reference
	this.liliPads = 0;
	
	// initialize the member function references 
 	// for the class prototype
  	if (typeof(_Player_prototype_called) == 'undefined')
  	{
		_Player_prototype_called = true;
		Player.prototype.update = update;
		Player.prototype.init = init;
		Player.prototype.jump = jump;
		Player.prototype.draw = draw;
		//Player.prototype.legs = legs;
		//Player.prototype.arms = arms;
		//Player.prototype.eyes = eyes;
	}
	
	// initialize the liliPad reference so player can keep track of liliPad positions
	function init(liliPads)
	{
		this.liliPads = liliPads;
		this.lifeBar.init();
	}
	
	// update function: calculates frogs position in real time by influencing frog to gravitate toward projected position
	function update(updateTime)
	{
		// update jump timer
		this.jumpTimer += updateTime;
		// set up projected position so that the player always wants to be on the
		// lilipad centers
		if(this.liliPads.scrolling)
		{
			this.rect.pos.x = this.liliPads.next[0].rect.pos.x + this.liliPads.next[0].rect.dim.width/2 - this.rect.dim.width/2;
			this.rect.pos.y = this.liliPads.next[0].rect.pos.y + this.liliPads.next[0].rect.dim.height/2 - this.rect.dim.height/2;
			
			//if(this.jumping)
			//	this.jumping != this.jumping;
		}
		else if(this.state == playerStates.alive)
		{
			// this code locks the player onto the liliPad
			this.rect.pos.x = this.liliPads.pads[this.liliPadNum].rect.pos.x + this.liliPads.pads[this.liliPadNum].rect.dim.width/2 - this.rect.dim.width/2;
			this.rect.pos.y = this.liliPads.pads[this.liliPadNum].rect.pos.y + this.liliPads.pads[this.liliPadNum].rect.dim.height/2 - this.rect.dim.height/2;
			
			// if current liliPad sinks player dies
			if(this.liliPads.pads[this.liliPadNum].type == liliPadTypes.SINK)
			{
				if(!(this.liliPads.pads[this.liliPadNum].sinkState < 1) && this.liliPads.pads[this.liliPadNum].sinking)
				{
					this.state = playerStates.dead;
					this.lifeBar.damage();
				}
			}
		}
		else
		{
			if(this.state == playerStates.jumping || this.state == playerStates.respawning) // if player is alive, he will make it all the way to the next liliPad
			{
				this.projectedPos.x = this.liliPads.pads[this.liliPadNum].rect.pos.x + this.liliPads.pads[this.liliPadNum].rect.dim.width/2 - this.rect.dim.width/2;
				this.projectedPos.y = this.liliPads.pads[this.liliPadNum].rect.pos.y + this.liliPads.pads[this.liliPadNum].rect.dim.height/2 - this.rect.dim.height/2;
			}
		
			// influence the player to move toward the projected position
			if(this.state == playerStates.respawning)
				var displacement = (this.projectedPos.x - this.rect.pos.x) * updateTime/constants.RESPAWNSPEED;
			else	
				var displacement = (this.projectedPos.x - this.rect.pos.x) * updateTime/constants.PLAYERSPEED;
			this.rect.pos.x += displacement;
			
			
			// when moving in the Y axis, the frog behaves slightly different
			if(this.state == playerStates.respawning)
				displacement = (this.projectedPos.y - this.rect.pos.y) * updateTime/constants.RESPAWNSPEED;
			else
				displacement = (this.projectedPos.y - this.rect.pos.y) * updateTime/constants.PLAYERSPEED;
			// if the frog is almost in the center of the pad, the Y axis needs to catch up to the center faster, or else it looks like the frog
			// is falling off the liliPad
			if(this.rect.pos.x >= (this.liliPads.pads[this.liliPadNum].rect.pos.x + this.liliPads.pads[this.liliPadNum].rect.dim.width/2 - this.rect.dim.width/2) - 1)
				displacement *= 1.5;
			this.rect.pos.y += displacement;
			
			var rect; // used to compare positional data to activate scrolling and positional locking	
			switch(this.state)
			{
				case playerStates.jumping:
					// if player reaches the last liliPad begin scrolling
					if(this.liliPadNum >=  this.liliPads.pads.length -1)
					{
						if(this.rect.pos.x >= this.liliPads.pads[this.liliPads.pads.length-1].rect.pos.x - 0.05)
						{
							this.liliPads.scroll();
							this.liliPadNum = 0;
						}
					}
					// if player finally reaches next liliPad center lock player in place
					rect = this.liliPads.pads[this.liliPadNum].rect;
					if(this.rect.pos.x >= (rect.pos.x + rect.dim.width/2 - this.rect.dim.width/2) - constants.PLAYERMOVEFLOOR &&
						this.rect.pos.y >= rect.pos.y + rect.dim.height/2 - this.rect.dim.height/2 - 1 &&
						this.rect.pos.y <= rect.pos.y + rect.dim.height/2 - this.rect.dim.height/2 + 1)
					{
						this.state = playerStates.alive;
					}
					break;
				case playerStates.dead:
					// this code respawns player at previous liliPad
					pos = this.projectedPos;
					if(this.rect.pos.x >= (pos.x) - constants.PLAYERMOVEFLOOR &&
						this.rect.pos.y >= pos.y - 1 &&
						this.rect.pos.y <= pos.y + 1)
					{
						this.liliPadNum--;
						this.state = playerStates.respawning;
						game.sound.play('death');
					}
					break;
				case playerStates.respawning:
					// player will remain in respawning state until it reaches the previous liliPad
					pos = this.projectedPos;
					if(this.rect.pos.x <= (pos.x) + constants.PLAYERMOVEFLOOR)
					{
						this.state = playerStates.jumping;
					}
					break;
				default: break;
			}
		}
		// update arms, legs, and eyes (position and size)
		this.arms.update(this);
		this.legs.update(this, updateTime);
		this.eyes.update(this, updateTime);
		this.lifeBar.update();

		var nextPad = this.liliPadNum +1;
		this.jumpZone.update(this, this.liliPads.pads[nextPad >= this.liliPads.pads.length?0:nextPad]);
	}
	
	// jump: when the user decides to jump, the frog simply jumps to a different liliPad
	function jump()
	{
		if(this.jumpTimer >= 500)
		{
			// player can only jump if he still has lives
			if(this.lifeBar.lives > 0)
			{
				// jump to next liliPad in array
				// if player can reach the next liliPad he falls in water and dies
				if(this.state == playerStates.alive || this.state == playerStates.jumping)
				{
					if(this.jumpZone.inZone)
					{
						if(this.liliPadNum < this.liliPads.pads.length -1)
						{
							this.liliPadNum++;
							this.state = playerStates.jumping;
							this.score++;
							game.sound.play('jump');
						}
					}
					// if not in the jump zone (frog drown) and map is not scrolling
					else if(!this.liliPads.scrolling)
					{
						this.liliPadNum++;
						// player will only get half way to the next pad using midpoint formula
						this.projectedPos.x = ((this.liliPads.pads[this.liliPadNum].rect.pos.x + this.liliPads.pads[this.liliPadNum].rect.dim.width/2 - this.rect.dim.width/2)
									+ this.rect.pos.x)/2;
						this.projectedPos.y = ((this.liliPads.pads[this.liliPadNum].rect.pos.y + this.liliPads.pads[this.liliPadNum].rect.dim.height/2 - this.rect.dim.height/2)
									+ this.rect.pos.y)/2;
						this.state = playerStates.dead;
						this.lifeBar.damage();
						game.sound.play('jump');
					}
				}
			}
			this.jumpTimer = 0;
		}
	}
	
	// draw: gets canvas object and draws player in it, including arms, legs, and eyes
	function draw()
	{
		var canvas = document.getElementById('canvas');
		if(canvas.getContext)
		{
			var context = canvas.getContext('2d');
			// draw body
			if(this.state == playerStates.respawning) context.fillStyle= "rgba(0,200,0,0.4)"; // set fillStyle to dark green
			else context.fillStyle= "rgb(0,200,0)"; // set fillStyle to dark green
				
			context.fillRect(this.rect.pos.x,this.rect.pos.y,this.rect.dim.width,this.rect.dim.height);
			
			// left arm
			context.fillRect(this.arms.leftArm.pos.x,this.arms.leftArm.pos.y,this.arms.leftArm.dim.width,this.arms.leftArm.dim.height);
			// right arm
			context.fillRect(this.arms.rightArm.pos.x,this.arms.rightArm.pos.y,this.arms.rightArm.dim.width,this.arms.rightArm.dim.height);
			// left leg
			context.fillRect(this.legs.leftLeg.pos.x,this.legs.leftLeg.pos.y,this.legs.leftLeg.dim.width,this.legs.leftLeg.dim.height);
			//right leg
			context.fillRect(this.legs.rightLeg.pos.x,this.legs.rightLeg.pos.y,this.legs.rightLeg.dim.width,this.legs.rightLeg.dim.height);
			
			// switch to black for eyes
			context.fillStyle= "rgb(0,0,0)"; // set fillStyle to black
			// left eye
			context.fillRect(this.eyes.left.pos.x,this.eyes.left.pos.y,this.eyes.left.dim.width,this.eyes.left.dim.height);
			//right eye
			context.fillRect(this.eyes.right.pos.x,this.eyes.right.pos.y,this.eyes.right.dim.width,this.eyes.right.dim.height);
			
			if(this.drawJumpZone)
			{
				// draw jumpzone
				if(this.jumpZone.inZone)
					context.strokeStyle= "rgb(0,255,0)"; // set fillStyle to green
				else
					context.strokeStyle= "rgb(255,0,0)"; // set fillStyle to red
				
				context.lineWidth = 2;
				context.strokeRect(this.jumpZone.rect.pos.x, this.jumpZone.rect.pos.y, this.jumpZone.rect.dim.width, this.jumpZone.rect.dim.height);
			}
			
			// draw lives
			this.lifeBar.draw();
		}
	}
	
	// objects
	
	// player legs
	function legs()
	{
		// left leg
		this.leftLeg = new Rect();
		// right leg
		this.rightLeg = new Rect();
		
		// create projected variabls
		this.leftLeg.projected;
		
		// set prototype data
		legs.prototype.init = init;
		legs.prototype.update = update;
		
		// init: initializes leg position and dimention data
		function init(player, legSize)
		{
			// init leg size (legs will be square)
			this.leftLeg.dim.width = legSize;
			this.leftLeg.dim.height = legSize;
			this.rightLeg.dim.width = legSize;
			this.rightLeg.dim.height = legSize;
			
			// left leg will be located on the upper left side of the player
			this.leftLeg.pos.x = player.rect.pos.x - this.leftLeg.dim.width;
			this.leftLeg.pos.y = player.rect.pos.y - this.leftLeg.dim.height;
			
			// right leg will be located on the lower left side of the player
			this.rightLeg.pos.x = player.rect.pos.x - this.rightLeg.dim.width;
			this.rightLeg.pos.y = player.rect.pos.y + player.rect.dim.height;
			
			// update legs once during initialization to calculate current position
			this.update(player, 0);
		}
		
		function update(player, updateTime)
		{
			// update leg positions
			this.projected = player.rect.pos.x - this.leftLeg.dim.height; // using height instead of width becuase it doesnt change, since width changes, it would mess up the formula
			// calculate displacement for smooth gravatation effect
			var displacement = (this.projected - this.leftLeg.pos.x) * updateTime/constants.LEGSPEED;
			// if displacement less then 1 just snap to position
			if(displacement < constants.PLAYERMOVEFLOOR)
			{
				this.leftLeg.pos.x += Math.floor(displacement);
				this.rightLeg.pos.x+= Math.floor(displacement);
			}
			else
			{
				this.leftLeg.pos.x += displacement;
				this.rightLeg.pos.x += displacement;
			}
			
			if(this.leftLeg.pos.x > player.rect.pos.x - 2)
			{
				this.leftLeg.pos.x = player.rect.pos.x - 2;
				this.rightLeg.pos.x = player.rect.pos.x - 2;
			}
			// update leg y-axis
			this.leftLeg.pos.y = player.rect.pos.y - this.leftLeg.dim.height;
			this.rightLeg.pos.y = player.rect.pos.y + player.rect.dim.height;
			
			// update leg widths
			this.leftLeg.dim.width = player.rect.pos.x - this.leftLeg.pos.x;
			this.rightLeg.dim.width = player.rect.pos.x - this.rightLeg.pos.x;
		}
	}
	
	function arms()
	{
		// left arm
		this.leftArm = new Rect();
		// right arm
		this.rightArm = new Rect();
		
		// set prototype data
		arms.prototype.init = init;
		arms.prototype.update = update;
		
		function init(player, armSize)
		{
			// init arm size (arms will be square)
			this.leftArm.dim.width = armSize;
			this.leftArm.dim.height = armSize;
			this.rightArm.dim.width = armSize;
			this.rightArm.dim.height = armSize;
			
			this.update(player);
		}
		
		function update(player)
		{
			// left arm will be located on the upper right side of the player
			this.leftArm.pos.x = player.rect.pos.x + player.rect.dim.width;
			this.leftArm.pos.y = player.rect.pos.y - this.leftArm.dim.height;
			// right arm will be located on teh lower right side of the player
			this.rightArm.pos.x = player.rect.pos.x + player.rect.dim.width;
			this.rightArm.pos.y = player.rect.pos.y + player.rect.dim.height;
		}
	}
	
	function eyes()
	{
		// left eye
		this.left = new Rect();
		// right eye
		this.right = new Rect();
		this.offset = 0;
		
		// data for blinking effect
		this.updateTime = 0;
		this.blinkTime = 0;
		this.blinking = false;
		
		// set prototype data
		eyes.prototype.init = init;
		eyes.prototype.update = update;
		
		function init(player, eyeSize, offset)
		{
			this.eyeSize = eyeSize;
			// init leg size (legs will be square)
			this.left.dim.width = this.eyeSize;
			this.left.dim.height = this.eyeSize;
			this.right.dim.width = this.eyeSize;
			this.right.dim.height = this.eyeSize;
			this.offset = offset;
			this.update(player, 0);
		}
		
		function update(player, updateTime)
		{
			// left leg will be located on the upper left side of the player
			this.left.pos.x = player.rect.pos.x + player.rect.dim.width - this.left.dim.width - this.offset;
			this.left.pos.y = player.rect.pos.y + this.offset;
			// right leg will be located on teh lower right side of the player
			this.right.pos.x = player.rect.pos.x + player.rect.dim.width - this.right.dim.width - this.offset;
			this.right.pos.y = player.rect.pos.y + player.rect.dim.height - this.right.dim.height - this.offset;
			
			this.updateTime += updateTime;
			// update size if blinking
			if(this.blinking) 
			{
				this.left.dim.width = constants.BLINKSIZE;
				this.right.dim.width = constants.BLINKSIZE;
				if(this.updateTime >= this.blinkTime)
				{
					this.blinking = false;
					// blink time is between 1 and 5 seconds
					this.blinkTime = Math.floor((Math.random() * constants.PLAYERMAXBLINK) + constants.PLAYERMINBLINK);
					this.updateTime = 0;
				}
			}
			else
			{
				this.left.dim.width = this.left.dim.height;
				this.right.dim.width = this.right.dim.height;
				if(this.updateTime >= this.blinkTime)
				{
					this.blinking = true;
					this.blinkTime = constants.BLINKTIME; // blink for some short amount of time
					this.updateTime = 0;
				}
			}
		}
	}
}

function lifeBar()
{
	this.lives = constants.PLAYERLIVES;
	this.bar = new Array(this.lives);
	this.border = new Rect();
	
		
	// set prototype data
	if (typeof(_lifeBar_prototype_called) == 'undefined')
	{
		_lifeBar_prototype_called = true;
		lifeBar.prototype.init = init;
		lifeBar.prototype.damage = damage;
		lifeBar.prototype.update = update;
		lifeBar.prototype.draw = draw;
	}
	
	function init()
	{
		if(this.lives)
		{
			this.bar = new Array(this.lives);
			for(var i = 0; i < this.bar.length; i++)
			{
				this.bar[i] = new Rect();
				this.bar[i].dim.width = constants.LIFEWIDTH;
				this.bar[i].dim.height = constants.LIFEHEIGHT;
				this.bar[i].pos.x = (i * this.bar[i].dim.width) + (i * constants.LIFEBARSPACE) + constants.LIFEBAROFFSET;
				this.bar[i].pos.y = constants.LIFEBAROFFSET;
			}
			this.border.pos.x = this.bar[0].pos.x - constants.LIFEBARSPACE;
			this.border.pos.y = this.bar[0].pos.y - constants.LIFEBARSPACE;
			this.border.dim.width = (this.bar[0].dim.width * constants.PLAYERLIVES) + (constants.LIFEBARSPACE * (constants.PLAYERLIVES+1));
			this.border.dim.height = this.bar[0].pos.y + constants.LIFEBARSPACE;
		}
		else this.bar = 0;
	}
	
	function damage()
	{
		if(this.lives > 0)
			this.lives--;
	}
	
	function update()
	{
		if(this.lives < this.bar.length)
			this.init();
	}
	
	function draw()
	{
		var context = document.getElementById('canvas').getContext('2d');
		if(this.bar)
		{
			for(var i = 0; i < this.bar.length; i++)
			{
				context.fillStyle= "rgb(0,200,0)"; // set fillStyle to dark green
				context.fillRect(this.bar[i].pos.x,this.bar[i].pos.y,this.bar[i].dim.width,this.bar[i].dim.height);
			}
		}
		// draw a border around life bar
		context.strokeStyle= "rgb(255,255,255)"; // set strokeStyle to black
		context.lineWidth = 1; // make stroke skinny
		
		context.strokeRect(this.border.pos.x, this.border.pos.y, this.border.dim.width, this.border.dim.height);
	}
}



//Bounding box for safe jump zone, used for checking if any liliPads are close enough to jump to
function jumpZone()
{
	this.rect = new Rect();
	this.inZone = false;
	
	// set prototype data
	if (typeof(_jumpZone_prototype_called) == 'undefined')
	{
		_jumpZone_prototype_called = true;
		jumpZone.prototype.update = update;
	}

	function update(player, pad)
	{
		this.rect.dim.width = constants.JUMPZONEWIDTH;
		this.rect.dim.height = player.rect.dim.height + (constants.JUMPZONEOFFSET * 2);
		this.rect.pos.x = player.rect.pos.x;
		this.rect.pos.y = player.rect.pos.y - constants.JUMPZONEOFFSET;
		
		// check if other rect is colliding with jump zone
		if(this.rect.pos.x + this.rect.dim.width < pad.rect.pos.x || // if right side of jumpZone is to the left of rect OR
		   this.rect.pos.x > pad.rect.pos.x + pad.rect.dim.width || // if left side of jumpZone is to the right of rect OR
		   this.rect.pos.y + this.rect.dim.height < pad.rect.pos.y || // if bottom of jumpZone is over the top of rect OR
		   this.rect.pos.y > pad.rect.pos.y + pad.rect.dim.height) // if top of jumpZone is under the botttom of rect
		{
			this.inZone = false; // then they are not colliding
		}
		else
			this.inZone = true; // else they are
			
		if(pad.type == liliPadTypes.SINK)
		{
			this.inzone = pad.sinking?false:true;
		}
	}
}
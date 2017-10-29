function liliPad()
{
	this.rect = new Rect();
	this.type = liliPadTypes.NONE;
	this.speed = constants.LILIPADSPEED;
	
	// initialize the member function references 
 	// for the class prototype
  	if (typeof(_liliPad_prototype_called) == 'undefined')
  	{
		_liliPad_prototype_called = true;
		liliPad.prototype.init = init;
		liliPad.prototype.update = update;
		liliPad.prototype.draw = draw;
		liliPad.prototype.scroll = scroll;
	}
	
	function init(type, pos)
	{
		this.type = type;
		this.rect.dim.height = constants.LILIPADSIZE;
		this.rect.dim.width = constants.LILIPADSIZE;
		this.rect.pos = pos;
		if(this.type == liliPadTypes.SINK)
		{
			// save size data so we can restore the rect to the original size when
			// submerged lilipad comes back to the surface
			this.sinkRect = new Rect();
			this.sinkRect.dim.height = this.rect.dim.height;
			this.sinkRect.dim.width = this.rect.dim.width;
			this.sinkRect.pos.x = this.rect.pos.x;
			this.sinkRect.pos.y = this.rect.pos.y;
			
			// keep track of sink state
			this.sinking = true;
			// keep track of how long the lilipad is submerged for
			this.sinkTime = constants.LILIPADMAXSINKTIME;
			this.floatTime = constants.LILIPADFLOATTIME;
			this.updateTime = 0;
			
			// sink state (for wobbly animation)
			this.sinkState = 0;
		}
		
		switch(type)
		{
			case liliPadTypes.UP:
			case liliPadTypes.DOWN:
				var rand = Math.floor(Math.random() * (constants.LILIPADMAXSPEED -constants.LILIPADSPEED) * 1000)/1000 + constants.LILIPADSPEED;
				this.speed = rand;
				break;
			case liliPadTypes.SINK:
				var rand = Math.floor(Math.random() * constants.LILIPADMAXSINKTIME) + constants.LILIPADMINSINKTIME;
				this.sinkTime = rand;
				break;
			default: break;
		}
	}
	
	function update(updateTime)
	{
		switch(this.type)
		{
			case liliPadTypes.NONE:
				break;
			case liliPadTypes.DOWN:
				// scroll down
				this.rect.pos.y += updateTime * this.speed;
				// reverse
				if(this.rect.pos.y + this.rect.dim.height > document.getElementById('canvas').height)
				{
					this.type = liliPadTypes.UP;
				}
				break;
			case liliPadTypes.UP:
				// scroll up
				this.rect.pos.y -= updateTime * this.speed;
				// reverse
				if(this.rect.pos.y < 0)
				{
					this.type = liliPadTypes.DOWN;
				}
				break;
			case liliPadTypes.SINK:
				// sinking is complicated...
				this.updateTime += updateTime; // time sink/float states
				if(this.sinking)
				{
					var offset;
					switch(this.sinkState)
					{
					case 0:
						offset = -2;
						break;
					case 1:
						offset = 3;
						break;
					case 2:
						offset = 0;
						break;
					default: break;
					}
					
					// first move the liliPad to the (x, y) coordinates of the sunken version
					this.rect.pos.x +=  ((this.sinkRect.pos.x + this.sinkRect.dim.width/2 - (constants.LILIPADSINK)/2) - offset -
							    this.rect.pos.x) * updateTime/ constants.LILIPADSINKSPEED;
					this.rect.pos.y += ((this.sinkRect.pos.y + this.sinkRect.dim.height/2 - (constants.LILIPADSINK)/2) - offset -
							    this.rect.pos.y) * updateTime/ constants.LILIPADSINKSPEED;
					
					
					// then make the width and height smaller
					var displacement = ((constants.LILIPADSINK + (offset*2)) - this.rect.dim.width) * updateTime/constants.LILIPADSINKSPEED;
						this.rect.dim.width += displacement;
						this.rect.dim.height += displacement;
					
					// reset sinkState
					if(this.rect.dim.width >= (constants.LILIPADSINK+offset) - 0.5 &&
					   this.rect.dim.width <= (constants.LILIPADSINK+offset) + 0.5)
					{
						if(this.sinkState < 2)
							this.sinkState++;
					}
					
					// if timer runs out trigger floating
					if(this.updateTime >= this.sinkTime)
					{
						this.updateTime = 0;
						this.sinking = false;
						this.sinkState = 0;
						game.sound.play('liliPadFloat');
					}
				}
				else{
					var offset;
					switch(this.sinkState)
					{
					case 0:
						offset = 4;
						break;
					case 1:
						offset = -4;
						break;
					case 2:
						offset = 0;
						break;
					default: break;
					}
					// first move the liliPad to the (x, y) coordinates of the sunken version
					this.rect.pos.x += (this.sinkRect.pos.x - offset - this.rect.pos.x) * updateTime/ constants.LILIFLOATSPEED;
					this.rect.pos.y += (this.sinkRect.pos.y - offset - this.rect.pos.y) * updateTime/ constants.LILIFLOATSPEED;
					
					
					// then make the width and height smaller
					var displacement = (this.sinkRect.dim.width + (offset*2) - this.rect.dim.width) * updateTime/constants.LILIFLOATSPEED;
						this.rect.dim.width += displacement;
						this.rect.dim.height += displacement;
					
					// reset sinkState
					if(this.rect.dim.width >= (this.sinkRect.dim.width + offset) - 0.5 &&
					   this.rect.dim.width <= (this.sinkRect.dim.width + offset) + 0.5)
					{
						if(this.sinkState < 2)
							this.sinkState++;
					}
					
					// if timer runs out trigger sinking
					if(this.updateTime >= this.floatTime)
					{
						this.updateTime = 0;
						this.sinking = true;
						this.sinkState = 0;
						game.sound.play('liliPadSink');
					}
				}
				break;
			default: break;
		}
	}
	
	function draw()
	{
		var canvas = document.getElementById('canvas');
		if(canvas.getContext)
		{
			var context = canvas.getContext('2d');
			// draw liliPad
			context.fillRect(this.rect.pos.x, this.rect.pos.y, this.rect.dim.width, this.rect.dim.height);
		}
	}
	
	function scroll(updateTime, pos)
	{
		this.rect.pos.x += (pos.x - this.rect.pos.x) * updateTime/constants.SCROLLSPEED;
		
		if(this.type == liliPadTypes.SINK)
		{
			this.sinkRect.pos.x += (pos.x - this.sinkRect.pos.x) * updateTime/constants.SCROLLSPEED;
		}
		
		if(this.rect.pos.x < pos.x + 0.05) return false;
		else return true;
	}
}

function pads()
{
	// store the amount of pads for each batch here
	this.numPads = 3;
	// default pads
	this.pads = new Array(this.numPads);
	// when player reaches end of array of pads, new pads must come in, they are stored here
	this.next = 0;
	// if new pads are scrolling in, this variable keeps track of that state
	this.scrolling = false;
	
	
	
	// prototype declarations
	if (typeof(_pads_prototype_called) == 'undefined')
  	{
		pads_prototype_called = true;
		pads.prototype.init = init;
		pads.prototype.update = update;
		pads.prototype.scroll = scroll;
		pads.prototype.draw = draw;
	}
	
	// initialize pads
	function init()
	{
		// get canvas element for access to width/height parameters
		var canvas = document.getElementById('canvas');
		for(var i = 0; i < this.pads.length; i++)
		{
			this.pads[i] = new liliPad();
			var pos = new Position();
			// initialize positions according to canvas size
			pos.x = (i * canvas.width/this.pads.length) + canvas.width/this.pads.length - constants.LILIPADSIZE;
			pos.y = canvas.height/2 - constants.LILIPADSIZE/2;
			// first pad can only be a still pad, and last pad can not be a sinking pad
			switch(i)
			{
				case 0: this.pads[i].init(0 ,pos);
					break;
				case this.pads.length -1: this.pads[i].init(Math.floor(Math.random() * 3) ,pos);
					break;
				default: this.pads[i].init(Math.floor(Math.random() * 4) ,pos);
					break;
			}	
		}
	}
	
	function update(updateTime)
	{
		if(this.scrolling)
		{
			// scroll in new pads
			for(var i = 0; i < this.next.length; i ++)
			{
				// the new batch of pads knows where to go becuase the new pad data was stored in this.next.temp[i]
				this.scrolling = this.next[i].scroll(updateTime, this.next.temp[i].rect.pos);
			}
			// scroll out old pads
			for(var i = 0; i < this.pads.length; i ++)
			{
				var pos = new Position();
				// scroll out to the left, where they will never be seen again
				pos.x = this.pads[i].rect.pos.x - document.getElementById('canvas').width;
				pos.y = this.pads[i].rect.pos.y;
				if(i == this.pads.length-1)
					this.pads[i].scroll(updateTime, this.next.temp[0].rect.pos)
				else
					this.pads[i].scroll(updateTime,pos);
			}
			
			// if pads are done scrolling replace the array reference with the new pads
			if(!this.scrolling)
			{
				this.pads = this.next;
			}
			// update new pads as they slide in exept for the first one the first one is already being
			// updated by pads[pads.length] becuase it has a shared reference with next[0]
			for(var i = 1; i < this.next.length; i++)
			{
				this.next[i].update(updateTime);
			}
		}
		// update pads
		for(var i =0; i < this.pads.length; i++)
		{
			this.pads[i].update(updateTime);
		}
		
	}
	
	function scroll()
	{
		// get canvas element to access canvas width/height parameters
		var canvas = document.getElementById('canvas');
		// increase number of pads only as long as it doesnt make the pads too close
		if((this.numPads + 1) * constants.LILIPADSIZE < canvas.width)
			this.numPads++;
		this.scrolling = true;
		
		
		this.next = new Array(this.numPads);
		for(var i = 0; i < this.next.length; i++)
		{
			// first pad is passed by reference to array, it is the last pad of the last batch
			if(i == 0)
				this.next[i] = this.pads[this.pads.length-1];
			else
			{
				// all other new pads are generated here
				this.next[i] = new liliPad();
				var pos = new Position();
				pos.x = (i-1 *canvas.width/this.numPads) + canvas.width/this.numPads - constants.LILIPADSIZE + canvas.width;
				pos.y = canvas.height/2 - constants.LILIPADSIZE/2;
				
				// thier type is randomly generated, except for last pad, which should not be allowed to be a sinking type
				if(i != this.next.length - 1)
				{
					var type = Math.floor(Math.random() * 4);
					this.next[i].init(type ,pos);
				}
				else
					this.next[i].init(Math.floor(Math.random() * 3) ,pos);
			}
		}
		// this.next.temp stores the pad data of last batch, so while the old pads leave, the new pads still know where to go
		this.next.temp = new Array(this.next.length);
		for(var i = 0; i < this.next.temp.length; i++)
		{
			// store temporary positional data for next batch of pads
			this.next.temp[i] = new liliPad();
			var pos = new Position();
			pos.x = (i * canvas.width/this.next.length) + canvas.width/this.next.length - constants.LILIPADSIZE;
			pos.y = canvas.height/2 - constants.LILIPADSIZE/2;
			this.next.temp[i].init(this.pads.type, pos);
		}
	}
	
	function draw()
	{
		for(var i =0; i < this.pads.length; i++)
		{
			this.pads[i].draw();
		}
		
		if(this.scrolling)
		{
			if(this.next)
			{
				for(var i =0; i < this.next.length; i++)
				{
					this.next[i].draw();
				}
			}
		}
	}
}
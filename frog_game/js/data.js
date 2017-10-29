// data structures
function input()
{
	this.timeout = 500;
}

// position(x,y)
function Position(x, y)
{
    if(x)
        this.x = x;
    else
        this.x = 0;
    if(y)
        this.y = y;
    else
        this.y = 0;
}

// dimensions(width, height)
function Dimentions(width, height)
{
    if(width)
        this.width = width;
    else
        this.width = 0;
    if(height)
        this.height = height;
    else
        this.height= 0;
}

function Rect(x, y, width, height)
{
    this.pos = new Position();
    this.dim = new Dimentions();
    
    if(x) this.pos.x = x;
    if(y) this.pos.y = y;
    if(width) this.dim.width = width;
    if(height) this.dim.height = height;
}
// timer
function updateSpeed()
{
	this.speed = 0;
	this.now = new Date().getTime();
	this.then = this.now;
	
	 // initialize the member function references 
 	// for the class prototype
  	if (typeof(_updateSpeed_prototype_called) == 'undefined')
  	{
		_updateSpeed_prototype_called = true;
		updateSpeed.prototype.update = update;
	}
	
	function update()
	{
		this.then = this.now;
		this.now = new Date().getTime();
		this.speed = this.now - this.then;
	}
}

// color(r,g,b,a): used for dynamically returning color (rgb, rgba) strings for contex.fillStyle
function Color()
{
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0.5;
    
    if(typeof(_Color_protoype_called) == 'undefined')
    {
        _Color_protoype_called = true;
        Color.prototype.rgb = rgb;
        Color.prototype.rgba = rgba;
        Color.prototype.random = random;
    }
    
    function rgb(r, g, b)
    {
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')'; 
    }
    function rgba()
    {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')'; 
    }
    function random()
    {
        this.r = Math.floor(Math.random() * 255);
        this.g = Math.floor(Math.random() * 255);
        this.b = Math.floor(Math.random() * 255);
    }
}

// CONSTANTS

function constants()
{
	// player data
	this.PLAYERSIZE = 15;
	this.PLAYERARMSIZE = 4;
	this.PLAYERLEGSIZE = 6;
	this.PLAYEREYESIZE = 2;
	this.PLAYEREYEOFFSET = 3;
	this.PLAYERMINBLINK = 1000;
	this.PLAYERMAXBLINK = 4000;
	this.PLAYERSPEED = 100;
	this.PLAYERMOVEFLOOR = 0.05;
	this.RESPAWNSPEED = 150;
	
	// jump zone data
	this.JUMPZONEWIDTH = 200;
	this.JUMPZONEOFFSET = 10;
	
	// player body part data
	this.LEGSPEED = 70;
	this.BLINKTIME = 300;
	this.BLINKSIZE = 0.5;
	
	// life bar data
	this.PLAYERLIVES = 3;
	this.LIFEWIDTH = 15;
	this.LIFEHEIGHT = 10;
	this.LIFEBAROFFSET = 15;
	this.LIFEBARSPACE = 5;
	
	// liliPad data
	this.LILIPADSIZE = 25;
	this.LILIPADSPEED = 0.03;
	this.LILIPADMAXSPEED = 0.15;
	this.LILIPADSINK = 5;
	this.LILIPADMINSINKTIME = 1000;
	this.LILIPADMAXSINKTIME = 3000;
	this.LILIPADFLOATTIME = 3000;
	this.LILIPADSINKSPEED = 150;
	this.LILIFLOATSPEED = 200;
	this.SCROLLSPEED = 300;
}
function liliPadTypes()
{
	this.NONE = 0;
	this.UP = 1;
	this.DOWN = 2;
	this.SINK = 3;
}

function playerStates()
{
	this.dead = 0;
	this.alive = 1;
	this.jumping = 2;
	this.respawning = 3;
}

constants = new constants();
liliPadTypes = new liliPadTypes();
playerStates = new playerStates();
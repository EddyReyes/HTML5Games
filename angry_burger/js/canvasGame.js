/*
  Dependencies:
  prototype.js
  
  Author: Eduardo Reyes
  Created: 12/4/2011
  
  canvasGame.js is a libary for games on the HTML5 canvas object. This library provides a mouse and
  keyboard input interface, shapes, collision detection, drag and drop functionality between multiple
  shapes, buttons, text with word wrapping, image and sound resource management, and loading bars. 
  
  User Input:
  The mouse object is created under window.object, for global access.
  It keeps track of the mouse position inside a page, as well as mouse down data. For more information
  scroll down to the Mouse class.
  The keyboard object is created under window.keyboard, for global access.
  It keeps track of which key's are currently down. For more information scroll down to the Keyboard class.
  
  Game Components:
  Game compnents include a timer, for keeping track of time (for game loop updates), basic shapes,
  draggable shapes, a special object that keeps track of multiple draggable objects correctly, according
  to the order in which they were dropped (the draggables object), buttons, a resources manager, and a loading bar.
  For a detailed desctiption of each one please scroll down to that object.
*/

/** Mouse Class

Note: new mouse object automatically instantiated at end of file
under window.mouse. No need to create a new mouse object.
This gives global access to the mouse from anywhere.

Also note, this mouse object is designed for game use. mouse.update() must be
called inside a game loop before it is used to update anything else.

Example use:
mouse.down
  Returns mouse down state
mouse.getPos()
  Returns current mouse position inside the page
mouse.getPos(canvas)
  Returns current position relative to a DOM element, such as a canvas
mouse.getOldPos(canvas)
  Returns the last position where mouse was not down, useful for dragging shapes around.
*/
var Mouse = Class.create({
    initialize: function(){
	this.pos = {x:0, y:0};
	this.oldPos = {x:0, y:0};
	this.down = false;
	
	// if there is no global refernce to mouse, make one
	if(!window.mouse) window.mouse = this;
	// add event handlers to document
	Event.observe(document, 'mousemove', MOUSE_XY);
	Event.observe(document, 'mousedown', MOUSE_DOWN);
	Event.observe(document, 'mouseup', MOUSE_UP);
    },
    update: function(){
	if(!this.down){
	    this.oldPos.x = this.pos.x;
	    this.oldPos.y = this.pos.y;
	}
    },
    // getPos(): returns the position of the mouse, if an element is passed in
    // ie: canvas, it instead checks its position relative to that element
    getPos: function(element){
	if(element){
	    return {x: this.pos.x - element.offsetLeft, y: this.pos.y - element.offsetTop}
	}
	else return this.pos;
    },
    // getOldPos(): returns the position of the mouse, if an element is passed in
    // ie: canvas, it instead checks its old position relative to that element
    getOldPos: function(element){
	if(element){
	    return {x: this.oldPos.x - element.offsetLeft, y: this.oldPos.y - element.offsetTop}
	}
	else return this.oldPos;
    }
});
// note: e.pageX and e.pageY already normalised
function MOUSE_XY(e){ 
    window.mouse.pos.x = e.pageX || (e.clientX + document.documentElement.scrollLeft ?
	       document.documentElement.scrollLeft :
	       document.body.scrollLeft);
    window.mouse.pos.y = e.pageY || (e.clientY + document.documentElement.scrollTop ?
	       document.documentElement.scrollTop :
	       document.body.scrollTop);
    return true;
}
function MOUSE_DOWN(e){
    mouse.down = true;
    return true;
}
function MOUSE_UP(e){
    mouse.down = false;
    return true;
}

/** Keyboard Class

Note: new keyboard object automatically instantiated at end of file
under window.keyboard. No need to create a new keyboard object.
This gives global access to the keyboard from anywhere.

Also this keyboard object does not handle the keypress event, only keydown, and keyup.
This keyboard is meant for use in games, therefore only returns key states. To view list of keys just
browse the keys object located below. This keyboard object stops key propagation through
DOM nodes, unless it is an F-Key in which case, propagation is allowed. (allows debugging through F-Keys)

Bug: The TAB key (keyCode: 9) is not recommended for use with a game, it does not register correctly

Example use:
keyboard.keyState([keyboard.keys.SPACE]); or keyboard.keyState(' ');
  Returns true if the space bar is being held down, else false
*/
var Keyboard = Class.create({
    initialize: function(){
        // if there is no global reference to keyboard make one
        if(!window.keyboard) window.keyboard = this;
        this._keys = Object();
	// add event handlers
	Event.observe(window, 'keydown', KEY_DOWN);
	Event.observe(window, 'keyup', KEY_UP);
    },
    keyState: function(key){
        return this._keys[key]?this._keys[key]:false;
    },
    keys:  {
    0 			: '0',
    1 			: '1',
    2 			: '2',
    3 			: '3',
    4 			: '4',
    5 			: '5',
    6 			: '6',
    7 			: '7',
    8 			: '8',
    9 			: '9',
    BACKSPACE 		:String.fromCharCode(8),
    ENTER       	:String.fromCharCode(13),
    SHIFT       	:String.fromCharCode(16),
    CTRL        	:String.fromCharCode(17),
    ALT         	:String.fromCharCode(18),
    PAUSE       	:String.fromCharCode(19),
    CAPS_LOCK		:String.fromCharCode(20),
    ESC         	:String.fromCharCode(27),
    SPACE 		: ' ',
    PAGE_UP 		: '!',
    PAGE_DOWN 		: '"',
    END 		: '#',
    HOME 		: '$',
    LEFT_ARROW 		: '%',
    UP_ARROW 		: '&',
    RIGHT_ARROW 	: "'",
    DOWN_ARROW 		: '(',
    INSERT 		: '-',
    DELETE 		: '.',
    A 			: 'A',
    B 			: 'B',
    C 			: 'C',
    D 			: 'D',
    E 			: 'E',
    F 			: 'F',
    G 			: 'G',
    H 			: 'H',
    I 			: 'I',
    J 			: 'J',
    K 			: 'K',
    L 			: 'L',
    M 			: 'M',
    N	 		: 'N',
    O 			: 'O',
    P 			: 'P',
    Q 			: 'Q',
    R	 		: 'R',
    S 			: 'S',
    T 			: 'T',
    U 			: 'U',
    V 			: 'V',
    W 			: 'W',
    X 			: 'X',
    Y 			: 'Y',
    Z 			: 'Z',
    WINDOW_LEFT 	: '[',
    WINDOW_RIGHT 	: '\'',
    SELECT 		: ']',
    NUMPAD_0 		: '`',
    NUMPAD_1 		: 'a',
    NUMPAD_2 		: 'b',
    NUMPAD_3 		: 'c',
    NUMPAD_4 		: 'd',
    NUMPAD_5 		: 'e',
    NUMPAD_6 		: 'f',
    NUMPAD_7 		: 'g',
    NUMPAD_8 		: 'h',
    NUMPAD_9 		: 'i',
    NUMPAD_MULTIPLY 	: 'j',
    NUMPAD_ADD 		: 'k',
    NUMPAD_SUBTRACT 	: 'm',
    NUMPAD_DECIMAL 	: 'n',
    NUMPAD_DIVIDE 	: 'o',
    F1 			: 'p',
    F2 			: 'q',
    F3 			: 'r',
    F4 			: 's',
    F5 			: 't',
    F6 			: 'u',
    F7 			: 'v',
    F8 			: 'w',
    F9 			: 'x',
    F10 		: 'y',
    F11 		: 'z',
    F12 		: '{',
    NUM_LOCK    	:String.fromCharCode(144),
    SCROLL_LOCK 	:String.fromCharCode(145),
    SEMI_COLON  	:String.fromCharCode(186),
    EQUAL       	:String.fromCharCode(187),
    COMMA       	:String.fromCharCode(188),
    DASH        	:String.fromCharCode(189),
    PERIOD      	:String.fromCharCode(190),
    FORWARD_SLASH   	:String.fromCharCode(191),
    GRAVE_ACCENT    	:String.fromCharCode(192),
    OPEN_BRACKET    	:String.fromCharCode(219),
    BACK_SLASH      	:String.fromCharCode(220),
    CLOSE_BRACKET   	:String.fromCharCode(221),
    SINGLE_QUOTE    	:String.fromCharCode(222)
    }
});
function KEY_DOWN(e){
    var key = String.fromCharCode(e.charCode || e.keyCode);
    keyboard._keys[key] = true;
    // stop key propagation except for F keys and ESC
    if(key < 'p' && key > 'z' && key != String.fromCharCode(27))
	Event.stop(e);
}

function KEY_UP(e){
    var key = String.fromCharCode(e.charCode || e.keyCode);
    keyboard._keys[key] = false;
    // stop key propagation except for F keys and ESC
    if(key < 'p' && key > 'z' && key != String.fromCharCode(27))
	Event.stop(e);
}

// Create a reference to keyboard and mouse in the window object for global access
window.keyboard = new Keyboard();
window.mouse = new Mouse();

/* If you dont need either the keyboard or mouse in your app/game, and you want to remove it
to conserve space, the following functions are available*/
function noKeyboard(){
    if(window.keyboard){
	Event.stopObserving(window, 'keydown', KEY_DOWN);
	Event.stopObserving(window, 'keyup', KEY_UP);
	delete window.keyboard;
    }
}
function noMouse(){
    if(window.mouse){
	Event.stopObserving(document, 'mousemove', MOUSE_XY);
	Event.stopObserving(document, 'mousedown', MOUSE_DOWN);
	Event.stopObserving(document, 'mouseup', MOUSE_UP);
	delete window.mouse;
    }
}
// End of user Input objects
/* Game Components */

var Timer = Class.create({
    initialize: function(){
        this.passed = 0;
	this.now = new Date().getTime();
	this.then = this.now;
    },
    update: function(){
        this.then = this.now;
        this.now = new Date().getTime();
        this.passed = this.now - this.then;
    }
});

var Color = Class.create({
    initialize: function(r,g,b,a){
        this.r = r||0;
        this.g = g||0;
        this.b = b||0;
        this.a = a||0.5;
    },
    rgb: function(){
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')'; 
    },
    rgba: function(){
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')'; 
    },
    random: function(){
        this.r = Math.floor(Math.random() * 255);
        this.g = Math.floor(Math.random() * 255);
        this.b = Math.floor(Math.random() * 255);
    }
});

var Rect = Class.create({
    initialize: function(x, y, width, height){
        this.x = x||0;
        this.y = y||0;
        this.height = height||0;
        this.width = width||0;
    },
    colliding: function(rect){
        return!(this.x + this.width < rect.x ||
            this.y + this.height < rect.y ||
            this.x > rect.x + rect.width ||
            this.y > rect.y + rect.height)
    },
    inside: function(point){
        return (point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height);
    },
    bound: function(rect){
        // horizontal limiting
        if(this.x < rect.x) this.x = rect.x;
        if((this.x + this.width) > rect.width) this.x = rect.width - this.width;
        // vertical limiting
        if(this.y < rect.y) this.y = rect.y;
        if((this.y + this.height) > rect.height) this.y = rect.height - this.height;
    },
    getCenter: function(){
        return {x:this.x+(this.width/2), 
            y:this.y + (this.height/2)};
    },
    move: function(x, y){
        this.x += x;
        this.y += y;
    },
    fill: function(context){
        context.fillRect(this.x, this.y, this.width, this.height);
    },
    stroke: function(context, width){
        context.lineWidth = width||1;
        context.strokeRect(this.x, this.y, this.width, this.height);
    },
    setPos: function(x, y){
        this.x = x;
        this.y = y;
    },
    getNew: function(rect){
	return new Rect(rect.x, rect.y, rect.width, rect.height);
    }
});

var RoundedRect = Class.create(Rect, {
    initialize: function($super, rect, radius){
        $super(rect.x, rect.y, rect.width, rect.height);
        this.radius = radius||0;
    },
    fill: function(context){
        context.beginPath();  
        context.moveTo(this.x,this.y + this.radius);  
        context.lineTo(this.x,this.y + this.height - this.radius);  
        context.quadraticCurveTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height);  
        context.lineTo(this.x + this.width - this.radius, this.y + this.height);  
        context.quadraticCurveTo( this.x + this.width, this.y + this.height, this.x + this.width, this.y + this.height - this.radius);  
        context.lineTo(this.x + this.width, this.y + this.radius);  
        context.quadraticCurveTo(this.x + this.width, this.y, this.x+ this.width - this.radius, this.y);  
        context.lineTo(this.x + this.radius, this.y);  
        context.quadraticCurveTo(this.x, this.y, this.x, this.y + this.radius);  
        context.fill();  
    },
    stroke: function(context, width){
        context.lineWidth = width||1;
        context.beginPath();  
        context.moveTo(this.x,this.y + this.radius);  
        context.lineTo(this.x,this.y + this.height - this.radius);  
        context.quadraticCurveTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height);  
        context.lineTo(this.x + this.width - this.radius, this.y + this.height);  
        context.quadraticCurveTo( this.x + this.width, this.y + this.height, this.x + this.width, this.y + this.height - this.radius);  
        context.lineTo(this.x + this.width, this.y + this.radius);  
        context.quadraticCurveTo(this.x + this.width, this.y, this.x+ this.width - this.radius, this.y);  
        context.lineTo(this.x + this.radius, this.y);  
        context.quadraticCurveTo(this.x, this.y, this.x, this.y + this.radius);  
        context.stroke(); 
    }
});

var Circle = Class.create({
    initialize: function(x, y, radius){
        this.x = x||0;
        this.y = y||0;
        this.radius = radius||0;
    },
    colliding: function(circle){
        return distance(point1 = {x: this.x, y: this.y}, point2 ={x: circle.x, y: circle.y}) 
            < this.radius + circle.radius;
    },
    inside: function(point){
        return distance(point, this) <= this.radius;
    },
    bound: function(rect){
        // horizontal limiting
       if(this.x - this.radius < rect.x) this.x = rect.x + this.radius;
       if((this.x + this.radius) > rect.width) this.x = rect.width - this.radius;
       // vertical limiting
       if(this.y - this.radius < rect.y) this.y = rect.y + this.radius;
       if((this.y + this.radius) > rect.height) this.y = rect.height - this.radius;
    },
    fill: function(context){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, degToRad(0), degToRad(360), false);
        context.fill();
    },
    stroke: function(context, width){
        context.lineWidth = width||1;
        context.beginPath();
        context.stroke(this.x, this.y, this.radius, degToRad(0), degToRad(360), false);
        context.fill();
    },
    setPos: function(x, y){
        this.x = x;
        this.y = y;
    }
});

/** ImageRect: A simple rectangle and image combination
* @argument {Object} img The image to draw
* @argument {Number} x
* @argument {Number} y
* @argument {Number} width
* @argument {Number} height
*/
var ImageRect = Class.create(Rect, {
    initialize: function($super, img, x, y, width, height){
	$super(x, y, width, height);
	this._img = img;
    },
    draw: function(context){
	if(this._img.loaded){
	    context.drawImage(this._img, this.x, this.y, this.width, this.height);
	}
    },
    getImage: function(){return this._img;}
});

/** CanvasText: This object draws text onto a canvas but also handles the
exceptionaly important task of word wrapping. If a word reaches the end
of the specified box, it cuts off the remaining letters/words and continues on the next line.
However to accomplish this, all of the following arguments are REQUIRED:
*   context: is required becuase the measureText function is a member function of context.
*   attr: is an object containing data which is essential in measuring the text size. Inside the
*   attr object the following must be allocated.
*       box: a Rect object defining the position and dimentions of the text box
*       font: while 'font' is optional, it is required that the font use none other than px for its font size
* @argument {String} text
* @argument {Canvas Context Object} context
* @argument {Object} attr the text attributes (box, font, textAlign, color, textBaseline)
* @throws {TextBox Error} if the canvas parameter is not undefined or null.
* @throws {TextBox Error} if the font is using something other than px to define the size
* @throws {TextBox Error} if the box property is missing from the attr object
*/
var CanvasText = Class.create({
    initialize: function(text, context, attr){
        if(context === undefined || context === null) throw new Error('TextBox Error: Please provide a canvas parameter');
        this._context = context;
        // check the font for px, somthing other than px is used, this will throw an error
        this._font = attr.font||'20px serif';
        if(this._font.search(/\d*(pt|em|%)/) > -1) throw new Error('TextBox Error: Please use px for font size');
        this._fontSize = this._font.substring(this._font.search(/\d*px/), this._font.search(/px/));
        // check for a box attribute. If there is no box, this will throw an error
        if(attr.box === undefined) throw new Error('TextBox Error: Please provide a box attribute')
        else this._box = attr.box;
        // call the setText method to arrange the text with word wrapping
        this.setText(text);
        this._box.height = this._text.length * this._fontSize;
        // check for a color attribute
        if(attr.color) this._color = attr.color;
        // check for textAlign and make necessary re-positioning
        if(attr.textAlign) this._textAlign = attr.textAlign;
        if(this._textAlign == 'center') this._box.x += this._box.width/2;
        if(this._textAlign == 'right') this._box.x += this._box.width;
        if(attr.textBaseline) this._textBaseline = attr.textBaseline;
    },
    draw: function(){
            this._context.textBaseline = this._textBaseline||'top';
            this._context.textAlign = this._textAlign||'left'
            this._context.fillStyle = this._color?this._color.rgb():'rgb(0,0,0)';
            this._context.font = this._font;
            for(var i =0; i < this._text.length;i++){
                this._context.fillText(this._text[i], this._box.x,
                    this._box.y + (i * this._fontSize));
            }
    },
    stroke: function(color){
	this._context.textBaseline = this._textBaseline||'top';
	this._context.textAlign = this._textAlign||'left'
	this._context.fillStyle = color.rgb();
	this._context.font = this._font;
	for(var i =0; i < this._text.length;i++){
	    this._context.strokeText(this._text[i], this._box.x,
		this._box.y + (i * this._fontSize));
	}
    },
    setText:function(text){
        // set font first, context.measureText() needs this to work correctly
        this._context.font = this._font;
        // split strings by new lines
        this._text = text.split('\n');
        // Handle word wrapping
        for(var i =0; i < this._text.length; i++){
            var textWidth = this._context.measureText(this._text[i]).width;
            if(textWidth > this._box.width){
                //find minimum string length
                var strings = trimString(this._text[i]).split(' ');
                var sub = strings[0];
                var oldSub = sub;
                
                // check first string
                textWidth = this._context.measureText(sub).width;
                if(textWidth > this._box.width){
                    var newString = findMaxString(sub, this._box.width, this._context);   
                    // insert new string into array right after current string
                    var temp = this._text[i];
                    this._text[i] = newString;
                    this._text.splice(i+1,0, trimString(temp.substring(this._text[i].length, temp.length)));
                    continue;
                }
                // check strings attached by spaces
                for(var j = 1; j < strings.length; j++){
                    sub += ' ' + strings[j];
                    textWidth = this._context.measureText(sub).width;
                    if(textWidth > this._box.width){
                        // insert new string into array right after current string
                        var tempStr = this._text[i].substring(oldSub.length+1, this._text[i].length);                        
                        this._text.splice(i+1,0,trimString(tempStr));
                        this._text[i] = trimString(oldSub);
                        break;
                    }
                    oldSub = sub;
                }
            }
        }
        // helper functions
        function findMaxString(string, maxWidth, context){
            // itterate through each character until we find the min length
            for(var i = 0; i <= string.length; i++){
                var sub = string.substring(0, i);
                var textWidth = context.measureText(sub).width;
                if(textWidth > maxWidth){
                    return sub;
                }
            }
            return null;
        }
        function trimString(string){
            // remove any whitespace from the begining of the string
            return string.substring(string.search(/\S/), string.length);
        }
    },
    setBox:function(box){
        this._box = box;
    },
    setColor: function(color){
	if(typeof color == 'object'){
	    this._color = color;
	} else throw new Error('CanvasText Error: invalid parameter for setColor()');
    },
    getBox: function(){
	return this._box;
    }
});

// Helper functions
function distance(point1, point2){
    return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
}
function degToRad(deg){
    return (Math.PI/180)*deg;
}
function slide(shape, dest, timePassed, speed){
    if(shape.x === undefined || shape.y === undefined
       || dest.x === undefined || dest.y === undefined)
        throw new Error('slide() Error: invalid shape and dest parameters');
    var displacement = (dest.x - shape.x) * timePassed/speed;
    if(displacement){
        if(displacement < 0.0005 && displacement > -0.0005){
            shape.x = dest.x;
        } else shape.x += displacement;
    }
    displacement = (dest.y - shape.y) * timePassed/speed;
    if(displacement){
        if(displacement < 0.0005 && displacement > -0.0005){
            shape.y = dest.y;
        } else shape.y += displacement;
    }
}
function atPos(pos1, pos2){
    return (pos1.x == pos2.x && pos1.y == pos2.y);
}
/** Button: A shape which when clicked switches states.
When creating a button, it requires a type, button types can be access through: Button.types
 * @argument {Shape Object} shape
 * @argument {Canvas Object} canvas
 * @argument {String} type
*/
var Button = Class.create({
    initialize: function(shape, canvas, type){
	if(shape) this._shape = shape;
	else throw new Error('Button Error: illegal shape parameter');
	if(canvas) this._canvas = canvas;
	else throw new Error('Button Error: illegal canvas parameter');
	if(type)
	    this._type = type;
	else
	    this._type = this.types.push; // by default the button will be a push button
	this._state = false;
	this._selected = false;
	this._oldState = false;
	this.color = new Color();
	this._clickFunc = null;
	this.clickContext = null;
    },
    types: {push:'push', toggle:'toggle'},
    update: function(){
	this._oldState = this._state;
	// if mouse is currently positioned withing this rect
	if(this._shape.inside(mouse.getOldPos(this._canvas))){
	    // if mouse click is currently being held down
	    if(mouse.down && !this._selected)
	    {
	       this._selected = true;
	       if(this._type == this.types.push)
		   this._state = true;
	    }
	}
	// if mouse click is released update this._selected
	if(!mouse.down){
	    if(this._selected){
	       switch(this._type){
		case this.types.push:
		    this._state = false;
		    break;
		case this.types.toggle:
		    this._state = !this._state;
		    break;
	       }
	    }
	    this._selected = false;
	}
	// if mouse goes outside of button undo selection
	if(!this._shape.inside(mouse.getPos(this._canvas))){
	    this._state = false;
	}
	// execute callback function if it exsists
	if(this._oldState != this._state && this._state == false && !mouse.down){
	    if(this._clickFunc){
		if(this._clickContext){
		    this._clickFunc.call(this._clickContext);
		}
		this._clickFunc.call();
	    }
	}
    },
    draw: function(){
	var context = this._canvas.getContext('2d');
	if(this._state){
	    context.fillStyle = this.color.rgb();
	}
	else{
	    context.fillStyle = this.color.rgba();
	}
	this._shape.fill(context);
	this._shape.stroke(context, 3);
    },
    getState: function(){return this._state;},
    getShape: function(){return this._shape;},
    isSelected: function(){return this._selected;},
    click: function(func, context){
	this._clickFunc = func;
	if(context){
	    this._clickContext = context;
	}
    }
});

/** TextButton: creates a button with text, using the CanvasText object
for word wrapping.
* @argument {Shape Object} shape
* @argument {Canvas Object} canvas the canvas object on which to draw on
* @argument {String} type
* @argument {String} text
* @argument {Object} [attr] optional text attributes (box, font, textAlign, color, textBaseline)
* @throws {TextButton Error} the text is too big, and should be resized (or a smaller string)
*/
var TextButton = Class.create(Button, {
    initialize: function($super, shape, canvas, type, text, attr){
	$super(shape, canvas, type);
	// if shape is a cirlcle re-align box
	attr = attr||new Object;
	if(!shape.width){
	    attr.box = attr.box||new Rect(shape.x, shape.y, shape.radius, shape.radius);
	} // else just use shape, assuming it is a Rect
	else attr.box = attr.box||new Rect(shape.x, shape.y, shape.width, shape.height);
	text = text||'';
	attr.textAlign = attr.textAlign||'center';
	this._text = new CanvasText(text, canvas.getContext('2d'), attr);
	// attempt to center the text, if the text is too big, this will throw an error
	if(this._text._box.height > (shape.height||(shape.radius*2))) throw new Error('TextButton Error: Text does not fit');
	else this._text._box.y += shape.height/2 - (this._text._text.length * (this._text._fontSize/2));
    },
    draw: function($super){
	$super();
	this._text.draw();
    },
    setText: function(text){
	this._text.setText(text);
    }
});

/** ImageButton: A button based on images. When clicked the the images swap,
based on the button type
* @argument {Shape Object} shape
* @argument {Canvas Object} canvas the canvas object on which to draw on
* @argument {String} type
* @argument {String} upImg the image to display when button is 'up'
* @argument {String} downImg the image to display when the button is 'down'
*/
var ImageButton = Class.create(Button, {
    initialize: function($super, rect, canvas, type, upImg, downImg){
	// load image data for up state
	if(typeof upImg.src !== "undefined"){
	    this._up = upImg;
	} else{
	    this._up = new Image();
	    this._up.loaded = false;
	    Event.observe(this._up, 'load', function(){this.loaded = true;})
	    this._up.src = upImg;
	}
	// load image data for down state
	if(typeof downImg.src !== "undefined"){
	    this._down = downImg;
	} else{
	    this._down = new Image();
	    this._down.loaded = false;
	    Event.observe(this._down, 'load', function(){this.loaded = true;})
	    this._down.src = downImg;
	}
	this.loaded = false;
	$super(rect, canvas, type);
    },
    update: function($super){
	$super();
	if(!this.loaded){
	    if(this._up.loaded && this._down.loaded) this.loaded = true;
	}
    },
    draw: function(){
	if(this.loaded){
	    var context = this._canvas.getContext('2d');
	    if(this._state){
		context.drawImage(this._down, this._shape.x, this._shape.y, this._shape.width, this._shape.height);
	    }
	    else{
		context.drawImage(this._up, this._shape.x, this._shape.y, this._shape.width, this._shape.height);
	    }
	}
    }
});
/** Draggable: a shape that can be dragged around the screen by the mouse
To use a stand alone Draggable object, you need to call the update and draw methods inside
the game loop. To use a collection of Draggable objects, which draw in the correct order
according to stack order, create a Draggables object. Scroll down to the Draggables class
for more information.

 * @argument {Object} shape Reference to the shape which will be dragged
 * @argument {Object} canvas Reference to the canvas element in which the shape is located in
*/
var Draggable = Class.create({
    initialize: function(shape, canvas){
	if(shape) this._shape = shape;
	else throw new Error('Moveable requires a shape object');
	if(canvas) this._canvas = canvas;
	else throw new Error('Moveable requires a canvas object');
	this._selected = false; // keeps track of selection status
	this._oldPos = {x:shape.x, y:shape.y}; // keeps track of its old position before being dragged to offset it from the mouse while dragging
	this._lock = false;
    },
    _move: function(){
	if(!this._lock){
	    if(this._selected){
		this._shape.x = mouse.getPos(this._canvas).x + (this._oldPos.x - mouse.getOldPos(this._canvas).x);
		this._shape.y = mouse.getPos(this._canvas).y + (this._oldPos.y - mouse.getOldPos(this._canvas).y);
		// bound the shape the the confines of the canvas
		this._shape.bound({x:0, y:0, width: this._canvas.width, height: this._canvas.height});
	    }
	}
    },
    _check: function(){
	if(!this._lock){
	    // if mouse is currently positioned withing this rect
	    var mousePos = mouse.getOldPos(this._canvas);
	    var mouseHovering = this._shape.inside(mousePos);
	    if(mouseHovering){
		// if mouse click is currently being held down
		if(mouse.down && !this._selected){
		    this._selected = true;
		    // update this._oldPos data for offseting while dragging
		    this._oldPos.x = this._shape.x;
		    this._oldPos.y = this._shape.y;
		}
	    }
	    // if mouse click is released update this._selected
	    if(!mouse.down){
		this._selected = false;
	    }
	    return mouseHovering;
	}
	return false;
    },
    update: function(){
	var mouseHovering = this._check();
	this._move();
	return mouseHovering;
    },
    draw: function(){
	if(this._canvas){
	    var context = this._canvas.getContext('2d')
	    if(this.color){
		if(this._selected) context.fillStyle = this.color.rgb();
		else context.fillStyle = this.color.rgba();
	    }
	    this._shape.fill(context);
	}
    },
    getShape: function(){
	return this._shape;
    },
    setLock: function(lock){
	if(lock === true || lock === false)
	    this._lock = lock;
	else throw new Error('Draggable Error: incorrect lock parameter');
    }
});

/** Draggable: A collection of Draggable objects. It is recomended to use a Draggables
object to keep track of draw order for multiple Draggable objects. You must call the update
and draw methods within your game loop for this object to work.
* @argument {Array} [draggable]
*/
var Draggables = Class.create({
    initialize: function(draggable){
	this._shapes = draggable?draggable: new Array();
    },
    update: function(){
	var mouseHovering = false;
	// update all shapes
	for(var i = 0; i < this._shapes.length; i++){
	    var temp = this._shapes[i]._check();
	    if(!mouseHovering) mouseHovering = temp;
	}
	// select the top most shape (near the end of the array) and move only that one
	if(mouse.down){ 
	    for(var i = this._shapes.length-1; i >= 0; i--){ // traverse list backwards
		if(this._shapes[i]._selected){ // the last shape in the array is the top most, and so will be selected first
		    // move shape to the end of the list
		    this._shapes.push(this._shapes.splice(i,1)[0]);
		    // move and update selected shape
		    this._shapes[this._shapes.length-1]._move();
		    this._shapes[this._shapes.length-1]._check();
		    break; // and break out of loop
		}
	    }
	}
	return mouseHovering;
    },
    draw: function(){
	for(var i = 0; i < this._shapes.length; i++){this._shapes[i].draw();}
    },
    push: function(){
	    for(var i = 0; i < arguments.length; i++){this._shapes.push(arguments[i]);}
    },
    forEach: function(func){
	for(var i = 0; i < this._shapes.length; i++){
	    func(this._shapes[i]);
	}
    },
    remove: function(obj){
	this._shapes.splice(this._shapes.indexOf(obj), 1);
    },
    indexOf: function(obj){return this._shapes.indexOf(obj);}
});

/** DraggableImage: Extends Draggable for images
 * @argument $super Do not pass an argument here, it is for inheritance purposes
 * @argument {String} src Path to the image
 * @argument {Object} shape Reference to the shape which will be dragged
 * @argument {Object} canvas Reference to the canvas element in which the shape is located in
*/
var DraggableImage = Class.create(Draggable, {
    initialize: function($super, img, rect, canvas){
	$super(rect, canvas);
	if(typeof img.src !== "undefined"){
	    this._img = img;
	} else{
	    this._img = new Image();
	    this._img.loaded = false;
	    Event.observe(this._img, 'load', function(){this.loaded = true;});
	    this._img.src = img;
	}
    },
    draw: function(){
	if(this._img.loaded){
	    var context = this._canvas.getContext('2d');
	    context.drawImage(this._img, this._shape.x, this._shape.y, this._shape.width, this._shape.height);
	}
    },
    loaded: function(){return this._img.loaded;},
    setImage:function(image){
	this._img = image;
    }
});

/** Table: A 2-dimensional array of cells
* @argument {Number} rows
* @argument {Number} columns
* @argument {Number} cellSize
*/
var Table = Class.create({
    initialize: function(rows, columns, cellSize){
        // make sure there is at least a minimum cellSize of 1
        cellSize = cellSize||1;
        rows = rows||1; // minumum of 1 rows
        columns = columns||1; // and minumum of 1 columns
        this._rect = new Rect(0,0,cellSize*columns, cellSize*rows);
        //first create rows
        this._cells = new Array(rows);
        // then create columns
        for(var i = 0; i < this._cells.length; i++){
            this._cells[i] = new Array(columns);
            for(var j = 0; j < this._cells[i].length; j++){
                this._cells[i][j] = new Cell(new Rect(j*cellSize, i*cellSize, cellSize, cellSize));
            }
        }
    },
    setPos: function(x, y)
    {
        // make sure pos contains x and y data
        if(x != undefined && y != undefined){
            this._rect.x = x;
            this._rect.y = y;
	    this._cells.each(function(cells, row){
		cells.each(function(cell, column){
		    cell.rect.x = this._rect.x + column * cell.rect.width;
		    cell.rect.y = this._rect.y + row * cell.rect.height;
		}, this);
	    }, this);
        }
        else throw new Error('Table Error: invalid position data passed into setPos\(\)');
    },
    fill: function(context){
        if(!context) throw new Error('Table Error: invalid context passed into fill()');
	this._cells.each(function(cells){
	    cells.each(function(cell){
		context.fillRect(cell.rect.x, cell.rect.y, cell.rect.width, cell.rect.height);
	    }, this);
	}, this);
    },
    stroke: function(context){
        if(!context) throw new Error('Table Error: invalid context passed into stroke()');
	this._cells.each(function(cells){
	    cells.each(function(cell){
		context.strokeRect(cell.rect.x, cell.rect.y, cell.rect.width, cell.rect.height);
	    }, this);
	}, this);
    },
    cellsColliding: function(rect){
	var colliding = new Array();
	this._cells.each(function(cells){
	    cells.each(function(cell){
		if(rect.colliding(cell.rect)) colliding.push(cell);
	    }, this);
	}, this);
	return colliding;
    },
    colliding: function(rect){
	return this._rect.colliding(rect);
    },
    forEach: function(func){
	this._cells.each(function(cells){
	    cells.each(function(cell){
		func(cell);
	    }, this);
	}, this);
    },
    getShape: function(){return this._rect;}
});

/** Cell: A container for a rect and value
* @argument {Number} rect
* @argument {Number} value
*/
var Cell = Class.create({
    initialize: function(rect, value){
       if(typeof(rect) == 'object')
        this.rect = rect;
        else this.rect = null;
        this.value = value||null; 
    }
});

/** ResourceManager: loads all images and sounds
* @argument {Object} imagePaths an object containing the image paths for loading
* @argument {Object} soundPaths an object containing the sound paths for loading
*/
var ResourceManager = Class.create({
    initialize: function(imagePaths, soundPaths){
	this._images = new Object();
	this._sounds = new Object();
	this.imagePaths = imagePaths;
	this.soundPaths = soundPaths;
    },
    load: function(){
	for(var i in this.imagePaths){
	    this._images[i] = new Image();
	    this._images[i].src = this.imagePaths[i];
	    this._images[i].loaded = false;
	    Event.observe(this._images[i], "load", function(){
		this.loaded = true;
	    });
	}
	for(var i in this.soundPaths){
	    // TODO fill this in with cross browser compatible sound stuff
	}
    },
    getImage: function(image){
	if(this._images[image]) return this._images[image];
	else throw new Error('Resource Manager Error: invalid image request');
    },
    getSound: function(sound){
	return this._sounds[sound];
    },
    progress: function(){
	var progress = 0, total = 0;
	for(var i in this._images){
	    if(this._images[i].loaded) progress++;
	    total++;
	}
	for(var i in this._sounds){
	    if(this._sounds[i].loaded) progress++;
	    total++;
	}
	return isNaN(progress/total)?0:progress/total;
    }
});
/** LoadingBar: draws two images, an outer image, and an inner image. The inner image will
grow to fill the outer image as it is updated with a progress (a number between 0 and 1).
* @argument {String} innerSrc a string containing the image path for the inner image
* @argument {String} outerSrc a string containing the image path for the outer image
* @argument {Object} rect a rectangle object for drawing the outer object
* @argument {Number} inset the number of pixels the inner image inset inside the outer image
*/
var LoadingBar = Class.create({
    initialize: function(innerSrc, outerSrc, rect, inset){
	// load images
	this.inner = new Image();
	this.inner.src = innerSrc;
	this.inner.loaded = false;
	Event.observe(this.inner, "load", function(){
	    this.loaded = true;
	});
	this.outer = new Image();
	this.outer.src = outerSrc;
	this.outer.loaded = false;
	Event.observe(this.outer, "load", function(){
	    this.loaded = true;
	});
	// create rects
	if(rect == undefined) throw new Error('LoadingBar Error: missing rect argument');
	if(inset == undefined) throw new Error('LoadingBar Error: inset argument');
	this.outerRect = new Rect(rect.x, rect.y, rect.width, rect.height);
	// inner rect does not initialy have a width
	this.innerRect = new Rect(rect.x + inset, rect.y + inset, 0, rect.height - inset);
	this.innerWidthFull = rect.width - inset;
	this.loaded = false
    },
    update: function(progress){
	// check if images have loaded
	if(this.inner.loaded && this.outer.loaded) this.loaded = true;
	if(progress <= 1 && progress >= 0)
	    this.innerRect.width = this.innerWidthFull * progress;
	else throw new Error('LoadingBar Error: invalid progress');
    },
    draw: function(context){
	if(this.loaded){
	    // draw outer image
	    context.drawImage(this.outer, this.outerRect.x, this.outerRect.y, this.outerRect.width, this.outerRect.height);
	    // draw inner image
	    context.drawImage(this.inner, this.innerRect.x, this.innerRect.y, this.innerRect.width, this.innerRect.height);
	}
    }
});
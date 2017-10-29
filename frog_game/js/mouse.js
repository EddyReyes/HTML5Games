/* The mouse object keeps track of mouse's position and state in the current
  window, while taking into account the left and top offsets due to scrolling*/

function Mouse()
{
    this.pos = new Position();
    this.oldPos = new Position();
    this.down = false;
    
    if(typeof(_Mouse_prototype_called) == 'undefined')
    {
        _Mouse_prototype_called = true;
        Mouse.prototype.update = update;
        Mouse.prototype.init = init;
        Mouse.prototype.getPos = getPos;
        Mouse.prototype.getOldPos = getOldPos;
    }
    
    function init()
    {
        /* if mouse object is named somthing besides mouse, the window will
        be still be able to access it through the window.mouse referece,
        thus eliminating the restrictive need to name the mouse object 'mouse'*/
        window.mouse = this;
        // Set-up to use getMouseXY function onMouseMove
        document.onmousemove = getMouseXY;
        document.onmousedown = mouseDown;
        document.onmouseup = mouseUp;
       
        function getMouseXY(e)
        {
            // using e.pageX instead of e.clientX because e.clientX does not account for page scrolling
            if (e.pageX) window.mouse.pos.x = e.pageX;
            else if (e.clientX) // however if e.pageX isn't available we can use e.clientX in conjuntion with the scroll offsets
               window.mouse.pos.x = e.clientX + (document.documentElement.scrollLeft ?
               document.documentElement.scrollLeft :
               document.body.scrollLeft);
               
            // do the same for the Y coordinate
            if (e.pageY) window.mouse.pos.y = e.pageY;
            else if (e.clientY)
               window.mouse.pos.y  = e.clientY + (document.documentElement.scrollTop ?
               document.documentElement.scrollTop :
               document.body.scrollTop);
            
            return true;
        }
        
        function mouseDown(e)
        {
            mouse.down = true;
            return true;
        }
        function mouseUp(e)
        {
            mouse.down = false;
            return true;
        }
    }
    
    // update(): updates old Position data, for offseting when dragging stuff
    function update()
    {
        if(!this.down)
        {
            this.oldPos.x = this.pos.x;
            this.oldPos.y = this.pos.y;
        }
    }
    
    // getPos(): returns the position of the mouse, if an element is passed in
    // ie: canvas, it instead checks its position relative to that element
    function getPos(element)
    {
        if(element)
        {
            // create new position data
            var pos = new Position();
            
            pos.x = this.pos.x - element.offsetLeft;
            pos.y = this.pos.y - element.offsetTop;
            return pos;
        }
        else
            return this.pos;
    }
    
    // getOldPos(): returns the position of the mouse, if an element is passed in
    // ie: canvas, it instead checks its old position relative to that element
    function getOldPos(element)
    {
        if(element)
        {
            // create new position data
            var pos = new Position();
            pos.x = this.oldPos.x - element.offsetLeft;
            pos.y = this.oldPos.y - element.offsetTop;
            return pos;
        }
        else
            return this.oldPos;
    }
}
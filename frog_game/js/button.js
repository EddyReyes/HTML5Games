var buttonConstants = {
    width:80,
    height:40,
    defaultX:75,
    defaultY:85
    };

var buttonType = {
    push:'push',
    toggle:'toggle'
    };

// button class
function Button(canvas, type, text)
{
    this.state = false;
    this.selected = false;
    this.rect = new Rect(canvas.width/2 - buttonConstants.width/2, buttonConstants.defaultY,
                         buttonConstants.width, buttonConstants.height);
    this.canvas = canvas;
    if(type)
        this.type = type;
    else
        this.type = buttonType.push; // by default the button will be a push button
    if(text)
    {
        this.text = text;
    }
    
    this.color = new Color();
    this.color.g = 200;
    
    
    if(typeof(_Button_prototype_called) == 'undefined')
    {
        Button.prototype.update = update;
        Button.prototype.draw = draw;
    }
    
    function update()
    {
        // if mouse is currently positioned withing this rect
        if(mouse.getOldPos(this.canvas).x >= this.rect.pos.x && mouse.getOldPos(this.canvas).x <= this.rect.pos.x + this.rect.dim.width
             && mouse.getOldPos(this.canvas).y >= this.rect.pos.y && mouse.getOldPos(this.canvas).y <= this.rect.pos.y + this.rect.dim.height)
        {
             // if mouse click is currently being held down
             if(mouse.down && !this.selected)
             {
                  this.selected = true;
                  if(this.type == buttonType.push)
                    this.state = true;
             }
        }
        // if mouse click is released update this.selected
    
        if(!mouse.down)
        {
            if(this.selected)
            {
               switch(this.type)
               {
                case buttonType.push:
                    this.state = false;
                    break;
                case buttonType.toggle:
                    this.state = !this.state;
                    break;
               }
            }
            this.selected = false;
        }
        return this.state;
    }
    
    function draw()
    {
        var context = this.canvas.getContext('2d');
        
        if(this.state)
               context.fillStyle = this.color.rgb();
          else
               context.fillStyle = this.color.rgba();
               
        context.fillRect(this.rect.pos.x, this.rect.pos.y, this.rect.dim.width, this.rect.dim.height);
        context.strokeRect(this.rect.pos.x, this.rect.pos.y, this.rect.dim.width, this.rect.dim.height);
        
        if(this.text)
        {
            context.font = "bold 17px 'Palatino Linotype', 'Book Antiqua', Palatino, serif"
            context.fillStyle = 'rgb(255,255,255)';
            var textParam = context.measureText(this.text);
            context.fillText(this.text, this.rect.pos.x + this.rect.dim.width/2 - (textParam.width)/2, this.rect.pos.y + this.rect.dim.height/2 + 5);
            context.strokeStyle = "rgb(0,0,0)";
        }
    }
}
function Game()
{
    if(typeof(_Game_prototype_called) == 'undefined')
    {
        _Game_prototype_called = true;
        Game.prototype.init = init;
        Game.prototype.update = update;
        Game.prototype.draw = draw;
        Game.prototype.handleInput = handleInput;
    }
    
    function init()
    {
        // make sure tab is active
        this.isActive = true;
        
        // create game objects
        this.time = new updateSpeed();
        this.player = new Player();
        this.liliPads = new pads();
        this.sound = new Sound();
        this.canvas = document.getElementById('canvas');
        this.restartButton = new Button(this.canvas, buttonType.push, 'restart?');
        this.mouse = new Mouse();
        
        // initialize objects
        this.mouse.init();
        this.liliPads.init();
        this.player.init(this.liliPads);
        this.player.rect.pos.x = this.liliPads.pads[0].rect.pos.x;
        this.player.rect.pos.y = this.liliPads.pads[0].rect.pos.y;
        this.time.update();
    }
    
    function update()
    {
        if(this.isActive) // update only if the window/tab is active
        {
            this.time.update();
            this.liliPads.update(this.time.speed)
            this.player.update(this.time.speed);
            this.mouse.update();
            if(this.player.lifeBar.lives == 0)
            {
                    var oldstate = this.restartButton.state;
                    var newState = this.restartButton.update();
                    if(oldstate!= newState && newState == false)
                    {
                        this.init();
                        clearInterval(window.interval);
                    }
            }
            this.draw();
        }
        else
        {
            this.time.update();
        }
    }
    
    
    function draw()
    {
        // retreive canvas data from HTML
        if(this.canvas.getContext)
        {	
                var context = this.canvas.getContext('2d');
                // clear canvas for redrawing
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                var w = this.canvas.width;
                this.canvas.width = 1;
                this.canvas.width = w;
                
                // draw fake water
                context.fillStyle= "rgb(0,100,200)";
                context.fillRect(0,0,this.canvas.width,this.canvas.height);
                
                // draw lili pads
                context.fillStyle = "rgb(50,255,50)";
                this.liliPads.draw();	
                
                // draw player
                this.player.draw();
                
                // draw score
                context.font = "bold 15px 'Palatino Linotype', 'Book Antiqua', Palatino, serif"
                context.fillStyle= "rgb(0,200,0)"; // set fillStyle to dark green
                context.fillText('score: ' + this.player.score, this.canvas.width - 100, 20);
                
                if(this.player.lifeBar.lives == 0)
                {
                        var lose = 'Score: ' + this.player.score;
                        context.font = "bold 50px 'Palatino Linotype', 'Book Antiqua', Palatino, serif"
                        var textParam = context.measureText(lose);
                        context.fillText(lose, this.canvas.width/2 - (textParam.width)/2, this.canvas.height/2);
                        context.strokeStyle= "rgb(0,0,0)";
                        context.strokeText(lose, this.canvas.width/2 - (textParam.width)/2, this.canvas.height/2);
                        this.restartButton.draw();
                }
        }
        else canvas.innerHTML = 'This browser does not support the canvas element.';
    }
    
    
    function handleInput(e)
    {
        var ev = e||event;
        var key = ev.which||ev.keyCode;

        switch(key)
        {
        // up, left, and down are disabled for this game
        // up
        case 'W'.charCodeAt(0):
        case 38:
        break; // 38 is charCode for up key
        
        // left
        case 'A'.charCodeAt(0):
        case 37: break;// 37 is charCode for left key
        
        // down
        case 'S'.charCodeAt(0):
        case 40:
        break; // 40 is charCode fo down key
        
        
        // right
        case 'D'.charCodeAt(0):
        case 39: // 39 is charcode for right key
                 this.player.jump();
        break;
        
        // spacebar
        case 32: this.player.jump();
                 break;
        default: break;
        }
    }
}
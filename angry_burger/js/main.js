Event.observe(window, 'load', init);
Event.observe(window, 'blur', function(){clearInterval(this.gameLoop)});
Event.observe(window, 'focus', function(){
    if(this.game)
        if(this.game.time)
            this.game.time.update();    
    this.gameLoop = setInterval(update, 16);
});
function init(){
    // use supplied canvas element
    $('canvas').writeAttribute({
        width: R.canvas.width,
        height: R.canvas.height,
        style:"border:thin #000 solid;"
    });
    // create canvas element
    //$$('body').first().appendChild(Element('canvas',
    //                                       {id:'canvas', width: R.canvas.width,
    //                                       height:R.canvas.height,
    //                                       style:"border:thin #000 solid;"}));
    // create game object
    this.game = new Game();
    // call update at around 60 fps
    this.gameLoop = setInterval(update, 16);
}
function update(){
    this.game.update();
    draw();
}
function draw(){
    var context = $('canvas').getContext('2d');
    // clear context for redraw
    context.clearRect(0, 0, $('canvas').width, $('canvas').height);
    var w = $('canvas').width;
    $('canvas').width = 1;
    $('canvas').width = w;
    // draw game
    this.game.draw();
}

var Game = Class.create({
    initialize: function(){
        this.time = new Timer();
        this.canvas = $('canvas');
        this.res = new ResourceManager(R.images, R.sounds);
        this.mainMenu = new MainMenu(this);
        this.tutorial = null;
        this.highScore = new HighScore();
        this.state = R.game.state.loading;
    },
    update: function(){
        // update mouse and time
        mouse.update();
        this.time.update();
        // game state features
        switch(this.state){
        case R.game.state.loading:
            this.mainMenu.update(this);
            break;
        case R.game.state.play:
            this.drawList.draggables.update();
            this.buttons.update(this);
            this.trash.update(this);
            this.deliver.update(this);
            this.patties.update(this);
            this.grill.update(this);
            this.trays.update(this);
            this.condiments.update(this);
            this.soda.update(this);
            this.fries.update(this);
            this.wave.update(this);
            this.orders.update(this);
            this.score.update(this);
            break;
        case R.game.state.paused:
            this.pauseScreen.update(this);
            break;
        case R.game.state.tutorial:
            this.tutorial.update(this);
            break;
        case R.game.state.over:
            this.gameOver.update(this);
            break;
        }
    },
    draw: function(){
        // game state features
        var context = this.canvas.getContext('2d');
        switch(this.state){
        case R.game.state.loading:
            this.mainMenu.draw(context);
            break;
        case R.game.state.play:
            //draw fixed objects
            this.drawList.fixed.each(function(obj){
                obj.draw(context);
            },this);
             this.drawList.draggables.draw();
            break;
        case R.game.state.paused:
            this.drawList.fixed.each(function(obj){
                obj.draw(context);
            },this);
            this.drawList.draggables.draw();
            this.pauseScreen.draw(context);
            break;
        case R.game.state.tutorial:
            this.drawList.fixed.each(function(obj){
                obj.draw(context);
            },this);
            this.drawList.draggables.draw();
            this.tutorial.draw(context);
            break;
        case R.game.state.over:
            this.drawList.fixed.each(function(obj){
                obj.draw(context);
            },this);
            this.drawList.draggables.draw();
            this.gameOver.draw(context);
            break;
        }
    },
    newGame: function(){
        // reset draw list
        this.drawList = {draggables: new Draggables(), fixed: new Array()};
        // game components
        this.gameOver = new GameOver(this);
        this.pauseScreen = new PauseScreen(this);
        this.background = new Background(this);
        this.buttons = new GameButtons(this);
        this.patties = new PattyStack(this);
        this.grill = new Grill(this);
        this.trays = new Trays(this);
        this.condiments = new Condiments(this);
        this.soda = new SodaMachine(this);
        this.fries = new Fries(this);
        this.orders = new OrderPanel(this);
        this.trash = new Trash(this);
        this.deliver = new Deliver(this);
        this.score = new Score(this);
        this.wave = new Wave(this);
        
        // upate some game components at least once for buttons to show up
        this.buttons.update(this);
        this.soda.update(this);
        this.time.update();
    }
});
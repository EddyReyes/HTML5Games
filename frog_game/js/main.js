    // create event listener for the keydown function
if (window.addEventListener)
    window.addEventListener('keydown', handleInput, false);// good browsers
/* // event listener for internet explorer is faulty
if(document.body && document.body.attachEvent)
        document.body.attachEvent('onkeydown' handleInput);// IE*/
window.onunload = function(){} // clear browser cache
window.onfocus = function(){game.isActive = true;}
window.onblur = function(){game.isActive = false;}

this.game = new Game();

function init()
{
    this.game.init();
    this.inteval = setInterval(update, 16); // udpates at almost 60fps
}

function update(){game.update();}
function handleInput(e){game.handleInput(e);}
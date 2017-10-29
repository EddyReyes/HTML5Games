/** Patty: meat.. for cheese burgers
*/
var Patty = Class.create(DraggableImage, {
    initialize: function($super, game){
        $super(game.res.getImage('patty_raw'),
	       new Rect(R.patty.spawnX, R.patty.spawnY, R.patty.width, R.patty.height),
	       game.canvas);
        this._state = R.patty.state.idle;
	this._loc = R.patty.location.stack;
	this._slot = null;
	this._cookingTime = 0;
    },
    update: function(game){
	this._cookingTime += game.time.passed;
	if(this._cookingTime >= R.patty.cooking.rare && this._state == R.patty.state.grilling){
	    this._state = R.patty.state.rare;
	} else if(this._cookingTime >= R.patty.cooking.cooked && this._state == R.patty.state.rare){
	    this._state = R.patty.state.cooked;
	} else if(this._cookingTime >= R.patty.cooking.burned && this._state == R.patty.state.cooked){
	    this._state = R.patty.state.burned;
	}
	switch(this._state){
	    case R.patty.state.rare: this.setImage(game.res.getImage('patty_rare'));
		break;
	    case R.patty.state.cooked: this.setImage(game.res.getImage('patty_cooked'));
		break;
	    case R.patty.state.burned: this.setImage(game.res.getImage('patty_burned'));
		break;
	    default:break;
	}
    },
    toIngredient: function(game){
	var name;
	switch(this._state){
	    case R.patty.state.rare: name = R.ingredients.patty_rare;
		break;
	    case R.patty.state.cooked: name = R.ingredients.patty_cooked;
		break;
	    case R.patty.state.burned: name = R.ingredients.patty_burned;
		break;
	    default: name = R.ingredients.patty_raw;
		break;
	}
	return new Ingredient(name, this.getShape().x, this.getShape().y, game);
    },
    slide: function(pos, game){
	slide(this.getShape(), pos, game.time.passed, R.patty.speed);
    }
});
/** PattyStack: a stack of pattys
 * Keeps track of which one is on top, and when new patties are needed
*/
var PattyStack = Class.create({
    initialize: function(game){
	verifyGame(game);
	// initialization
        this.reUp(game);
    },
    update: function(game){
	if(this._state == R.pattyStack.state.serving){
	    // get top most patty
	    var top = this.patties[this.patties.length-1];
	    // check if the patty has been dragged off the stack
	    if(top.getShape().x != top._stackPos.x){
		// if onGrill flag set and is no longer selected drag to grill
		if(top._loc == R.patty.location.grill && !top._selected){
		    // check for open slots
		    var slots = game.grill.openSlots(top.getShape());
		    // choose the closest slot
		    var closest = {index:null, distance:Infinity};
		    // find the closest slot
		    for(var i = 0; i < slots.length; i++){
			var dist = distance(top.getShape().getCenter(), slots[i].rect.getCenter());
			if(dist <= closest.distance && slots[i].value == null){
			    closest.index = slots[i];
			    closest.distance = dist;
			}
		    }
		    top._slot = closest.index;
		    if(top._slot != null){
			top._state = R.patty.state.grilling;
			top._slot.value = top;
			this.patties.pop();
			// if pattys run out send in a fresh batch
			if(this.patties.length == 0){
			    this.reUp(game);
			}
			// push top most patty onto drag list if game didn't reUp
			else game.drawList.draggables.push(this.patties[this.patties.length-1]);
			// if patty is in fixed draw list remove it from that list
			var fixedIndex = game.drawList.fixed.indexOf(this.patties[this.patties.length-1]);
			if(fixedIndex != -1){
			    game.drawList.fixed.splice(fixedIndex, 1);
			}
		    }
		}
		// if onGrill flag is not set drag back to stack	    
		else if(top._state != R.patty.state.grilling && !top._selected){
		    slide(top.getShape(), top._stackPos, game.time.passed, R.patty.speed);
		}
		 // check if patty is selected and over grill and set flag accordingly
		if(game.grill.over(top.getShape()) && top._selected){
		    top._loc = R.patty.location.grill;
		} else top._loc = R.patty.location.stack;
	    }
	}
	// check to see if patties are down spawning
	if(this.patties[0].getShape().x == R.patty.x) this._state = R.pattyStack.state.serving;
	// slide pattys in if they are in spawning state
	if(this._state == R.pattyStack.state.spawning){
	    // slide patties down
	    for(var i = 0; i < this.patties.length; i++){
		var pos = {x:R.patty.x, y:R.patty.y + (-i * R.patty.spacing)};
		if(!this.patties[i]._selected)
		    slide(this.patties[i].getShape(), pos, game.time.passed, R.patty.speed);
	    }
	}
    },
    reUp: function(game){
        this.patties = new Array(R.pattyStack.amount);
	for(var i = 0; i < this.patties.length; i++){
            this.patties[i] = new Patty(game);
            this.patties[i].getShape().y += (-i * R.patty.spacing);
            this.patties[i]._stackPos = {x:R.patty.x, y:R.patty.y + (-i * R.patty.spacing)};
        }
        // push top most patty onto drag list
        game.drawList.draggables.push(this.patties[this.patties.length-1]);
        // push all other items into fixed drawing list
        for(var i = 0; i < this.patties.length-1; i++){
            game.drawList.fixed.push(this.patties[i]);
        }
	this._state = R.pattyStack.state.spawning;
    }
});

/** Grill: cooks the patties, as well as handles the transfering of the
 * patties to either a tray of the trash
*/
var Grill = Class.create({
    initialize: function(game){
	verifyGame(game);
        this._slots = new Table(R.grill.rows, R.grill.columns, R.grill.cellSize);
	this._slots.setPos(R.grill.x, R.grill.y);
	this.img = game.res.getImage(R.grill.image);
	this.imgRect = new Rect(this._slots.getShape().x - R.grill.offsetX,
				this._slots.getShape().y - R.grill.offsetY,
				this._slots.getShape().width + R.grill.offsetX, R.grill.imgHeight);
	game.drawList.fixed.push(this);
    },
    update: function(game){
	this._slots.forEach(function(cell){
	    if(cell.value != null){
		if(cell.value._loc == R.patty.location.tray && !cell.value._selected){
		    // find the trays that patty is over
		    var tray = game.trays.overBurger(cell.value.getShape());
		    if(tray.overBurger(cell.value.getShape())){
			tray.getBurger().add(cell.value.toIngredient(game));
			// remove patty from draggable list
			game.drawList.draggables.remove(cell.value);
			// remove patty from grill
			cell.value  = null;
		    }
		} else if(cell.value._loc == R.patty.location.trash && !cell.value._selected){
		    game.trash.push(cell.value);
		    cell.value  = null;
		} else if(cell.value != null){
		    // slide value/patty toward center of slot
		    var position = cell.rect.getCenter();
		    position.x -= cell.value.getShape().width/2;
		    position.y -= cell.value.getShape().height/2;
		    if(!cell.value._selected){
			slide(cell.value.getShape(), position, game.time.passed, R.patty.speed);
			cell.value.update(game);
		    }else if(game.trays.overBurger(cell.value.getShape())){
			cell.value._loc = R.patty.location.tray;
		    } else if(game.trash.icon.hovering(cell.value.getShape())){
			cell.value._loc = R.patty.location.trash;
		    } else cell.value._loc = R.patty.location.grill;
		}
	    }
	});
    },
    draw: function(context){
	context.drawImage(this.img, this.imgRect.x, this.imgRect.y, this.imgRect.width, this.imgRect.height);
    },
    over: function(rect){
	return this._slots.colliding(rect);
    },
    openSlots: function(rect){
	return this._slots.cellsColliding(rect);
    }
});

/** Tray: Contins a main section for the burger, and to side sections
*/
var Tray = Class.create({
    initialize: function(game){
	game.drawList.fixed.push(this);
	this.img = game.res.getImage(R.tray.img);
	// set up cells
	this.cells = {
	    main: new Cell(new Rect(R.tray.spawnX, R.tray.spawnY, R.tray.cellWidth, R.tray.cellHeight)),
	    left: new Cell(new Rect(R.tray.spawnX + R.tray.cellWidth, R.tray.spawnY, R.tray.cellWidth, R.tray.cellHeight)),
	    right:new Cell(new Rect(R.tray.spawnX + R.tray.cellWidth*2, R.tray.spawnY, R.tray.cellWidth, R.tray.cellHeight))
	}
	// tray Rect
	this.rect = new Rect(R.tray.spawnX, R.tray.spawnY, R.tray.cellWidth * 3, R.tray.cellHeight);
	// buttons
	this.buttons = {no: new ImageButton(new Rect(this.rect.getCenter().x - (this.rect.width/4) - R.tray.buttons.width/2,
						     this.rect.y + this.rect.height + R.tray.buttons.spacing, R.tray.buttons.width,
						     R.tray.buttons.height), game.canvas, 'push', game.res.getImage(R.tray.buttons.no_up),
						     game.res.getImage(R.tray.buttons.no_down)),
	yes: new ImageButton(new Rect(this.rect.getCenter().x + this.rect.width/4 - R.tray.buttons.width/2,
						     this.rect.y + this.rect.height + R.tray.buttons.spacing, R.tray.buttons.width,
						     R.tray.buttons.height), game.canvas, 'push', game.res.getImage(R.tray.buttons.yes_up),
						     game.res.getImage(R.tray.buttons.yes_down))};
	// set up button callbacks
	this.buttons.no.click(function(){
	    this.state = R.tray.state.remove;
	}, this);
	this.buttons.yes.click(function(){
	    this.state = R.tray.state.deliver;
	}, this);
	// new trays always have a bun
	var pos = {x: this.cells.main.rect.x + this.cells.main.rect.width/2 - R.ingredients.width/2,
	    y: this.cells.main.rect.y + this.cells.main.rect.height - R.ingredients.height - R.tray.padding};
	this.cells.main.value = new Burger(pos, game);
	this.state = R.tray.state.idle;
	this.waitTime = R.tray.waitTime;
    },
    update: function(game){
	// update the position of the ingredients in the cells
	for(var i in this.cells){
	    if(this.cells[i].value){
		this.cells[i].value.update(game);
		if(i != 'main'){
		    var pos = this.cells[i].rect.getCenter();
		    pos.x -= this.cells[i].value.getShape().width/2;
		    pos.y -= this.cells[i].value.getShape().height/2;
		    if(this.cells[i].value.getShape().x != pos.x && this.cells[i].value.getShape().y != pos.y){
			this.cells[i].value.slide(pos, game);
		    }
		}
	    }
	}
	// move buttons
	// move no button
	this.buttons.no.getShape().x = this.rect.getCenter().x - (this.rect.width/4) - R.tray.buttons.width/2;
	this.buttons.no.getShape().y = this.rect.y + this.rect.height + R.tray.buttons.spacing;
	// move yes button
	this.buttons.yes.getShape().x = this.rect.getCenter().x + this.rect.width/4 - R.tray.buttons.width/2;
	this.buttons.yes.getShape().y = this.rect.y + this.rect.height + R.tray.buttons.spacing;
    	// update buttons
	for(var i in this.buttons){
	    this.buttons[i].update();
	}
    },
    draw: function(context){
	// draw image
	context.drawImage(this.img, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
	// draw tray cells and contents (if any)
	for(var i in this.cells){
	    //this.cells[i].rect.stroke(context);
	    if(this.cells[i].value) this.cells[i].value.draw(context);
	}
	// draw buttons
	if(this.state == R.tray.state.idle){
	    for(var i in this.buttons){
		this.buttons[i].draw();
	    }
	}
    },
    over: function(rect){
	return this.rect.colliding(rect);
    },
    overSide: function(rect){
	var colliding = new Array();
	// find out which sides a rect is over
	if(this.cells['right'].rect.colliding(rect)) colliding.push(this.cells['right']);
	if(this.cells['left'].rect.colliding(rect)) colliding.push(this.cells['left']);
	if(colliding.length > 1){
	    var dist = distance(rect, colliding[0].rect);
	    if(dist < distance(rect, colliding[1].rect)) return colliding[0];
	    else return colliding[1];
	}else if(colliding.length == 1){
	    return colliding[0];
	} else return null;
    },
    overBurger: function(rect){
	return this.cells.main.value.over(rect);
    },
    getBurger: function(){return this.cells.main.value;},
    getSides: function(){
	var sides = new Array();
	if(this.cells.right.value) sides.push(this.cells.right.value);
	if(this.cells.left.value) sides.push(this.cells.left.value);
	return sides;
    },
    slide: function(pos, game){
	for(var i in this.cells){
	    var cellPos = {x:pos.x, y:pos.y};   
	    switch(i){
	    case 'main': // stay in place
		cellValuePos = {x: this.cells.main.rect.x + this.cells.main.rect.width/2 - R.ingredients.width/2,
		    y: this.cells.main.rect.y + this.cells.main.rect.height - R.ingredients.height - R.tray.padding};
		break;
	    case 'left': // move to the right of main
		cellPos.x += R.tray.cellWidth;
		var cellValuePos = this.cells[i].rect.getCenter();
		if(this.cells[i].value != null){
		    cellValuePos.x -= this.cells[i].value.getShape().width/2;
		    cellValuePos.y -= this.cells[i].value.getShape().height/2;
		}
		break;
	    case 'right': // move to the right of left
		cellPos.x += R.tray.cellWidth*2;
		var cellValuePos = this.cells[i].rect.getCenter();
		if(this.cells[i].value != null){
		    cellValuePos.x -= this.cells[i].value.getShape().width/2;
		    cellValuePos.y -= this.cells[i].value.getShape().height/2;
		}
		break;
	    default: break;
	    }
	    slide(this.cells[i].rect, cellPos, game.time.passed, R.tray.speed);
	    if(this.cells[i].value){
		this.cells[i].value.slide(cellValuePos, game);
	    }
	}
	slide(this.rect, pos, game.time.passed, R.tray.speed);
    },
    getShape: function(){return this.rect;}
});

/** Trays: handles multiple trays, as well as the transfer of the trays between the trash
 * and the delivery point
*/
var Trays = Class.create({
    initialize: function(game){
	verifyGame(game);
	this.trays = new Array();
    },
    update: function(game){
	// if there are less then 3 trays add one
	while(this.trays.length < R.tray.minTrays){
	    // add a tray
	    this.addTray(game);
	}
	
	for(var i = 0; i < this.trays.length; i++){
	    // slide tray's down
	    if(this.trays[i].rect.x != this.trays[i].queuePos.x || this.trays[i].rect.y != this.trays[i].queuePos.y)
		this.trays[i].slide(this.trays[i].queuePos, game);
	    this.trays[i].update(game);
	    // check the state of each tray for either delivery or removal
	    switch(this.trays[i].state){
		case R.tray.state.remove: // trash the tray
		    game.trash.push(this.trays.splice(i, 1)[0]);
		    this.reset();
		    this.addTray(game);
		    break;
		case R.tray.state.deliver: // deliver the tray
		    if(!this.trays[i].getBurger().done) this.trays[i].getBurger().topBun(game);
		    if(this.trays[i].waitTime > 0) this.trays[i].waitTime -= game.time.passed;
		    else{
			game.deliver.add(game.orders.take(), this.trays.splice(i, 1)[0]);
			this.reset();
		    }
		    break;
		case R.tray.state.idle: // do nothing
		    break;
	    }
	}
    },
    addTray: function(game){
	// add tray to the begining of the list
	this.trays.unshift(new Tray(game));
	// set queuePos
	this.reset();
    },
    removeEndTray: function(){
	return this.trays.shift();
    },
    over: function(rect){
	var colliding = new Array();
	for(var i = 0; i < this.trays.length; i++){
	    if(this.trays[i].over(rect)) colliding.push(this.trays[i]);
	}
	return colliding;
    },
    overBurger: function(rect){
	for(var i = 0; i < this.trays.length; i++){
	    if(this.trays[i].overBurger(rect)) return this.trays[i];
	}
	return null;
    },
    overSide: function(rect){
	for(var i = 0; i < this.trays.length; i++){
	    if(this.trays[i].overSide(rect)) return this.trays[i];
	}
	return null;
    },
    reset: function(){
	for(var i =0; i < this.trays.length; i++){
	    this.trays[i].queuePos = {x: R.tray.x + (R.tray.spacing + R.tray.cellWidth*3) * i, y:R.tray.y};
	}
    }
});

/** Burger: contains a collection of ingredients, and keeps them positioned on top of itself
*/
var Burger = Class.create({
    initialize: function(pos, game){
	this.stuff = new Array();
	this.stuff.push(new Ingredient(R.ingredients.bottomBun, pos.x, pos.y, game));
	this.done = false;
    },
    draw: function(context){
	for(var i = 0; i < this.stuff.length; i++){
	    this.stuff[i].draw(context);
	}
    },
    add:function(ingredient){
	this.stuff.push(ingredient);
    },
    addNew: function(name, game){
	// get position for new ingredient
	var pos = this.getTop();
	// adjust position
	pos.y -= R.burger.spacing;
	var newIng = new Ingredient(name, pos.x, pos.y, game);
	this.stuff.push(newIng);
    },
    update: function(game){
	for(var i = 1; i < this.stuff.length; i++){
	    var pos = {x:this.stuff[0].x, y:this.stuff[0].y - (R.burger.spacing * i)};
	    if(!this.stuff[i].locked){
		this.stuff[i].slide(pos, game);
		if(this.stuff[i].x == pos.x && this.stuff[i].y == pos.y)
		    this.stuff[i].locked = true;
	    }
	    else{
		this.stuff[i].x = pos.x;
		this.stuff[i].y = pos.y;
	    }
	}
    },
    checkOrder: function(){
	var order = '';
	for(var i = 0; i < this.stuff.length; i++){
	    order += this.stuff[i].name;
	    if(i != this.stuff.length - 1) order += ' ';
	}
	return order;
    },
    over: function(rect){
	// check only if it is colliding with the top most ingredient
	return this.stuff[this.stuff.length - 1].colliding(rect);
    },
    slide: function(pos, game){
	// slide only the bottom bun, then move anything on top
	this.stuff[0].slide(pos, game);
	for(var i = 1; i < this.stuff.length; i++){
	    var newPos = {x:this.stuff[0].x, y:this.stuff[0].y - (R.burger.spacing * i)};
	    if(this.stuff[i].locked){
		this.stuff[i].x = newPos.x;
		this.stuff[i].y = newPos.y;
	    }
	    else this.stuff[i].slide(newPos, game);
	}
    },
    getShape: function(){return this.stuff[0];},
    getTop: function(){return this.stuff[this.stuff.length - 1];},
    topBun: function(game){
	this.addNew(R.ingredients.topBun, game);
	this.done = true;
    },
    /* this function for the purposes of limiting the number of ingredients
     on top of the bottom bun and dones not account for the bottom bun*/
    numIngredients: function(){return this.stuff.length - 1;}
});

/** Ingredient: A rectangle with image and name data
*/
var Ingredient = Class.create(Rect, {
    initialize: function($super, name, x, y, game){
	$super(x, y, R.ingredients.width, R.ingredients.height);
	this.name = name;
	this.img = game.res.getImage(name);
	this.locked = false;
    },
    draw: function(context){
	context.drawImage(this.img, this.x, this.y, this.width, this.height);
    },
    slide: function(pos, game){
	slide(this, pos, game.time.passed, R.ingredients.speed);
    },
    getShape: function(){return this;},
    getName: function(){return this.name;}
});
/** Condiments: a collection of ingredients
*/
var Condiments = Class.create({
    initialize: function(game){
	game.drawList.fixed.push(this);
	this._slots = new Table(R.condiments.rows, R.condiments.columns, R.condiments.cellSize);
	this._slots.setPos(R.condiments.x, R.condiments.y);
	// fill in slots with ingredients
	var index = 0;
	this._slots.forEach(function(cell){
	    var pos = cell.rect.getCenter();
	    pos.x -= R.ingredients.width/2;
	    pos.y -= R.ingredients.height/2;
	    cell.value = new Ingredient(R.ingredients.condiments[index], pos.x, pos.y, game);
	    // push an image of the ingredient both into the fixed and draggable draw lists
	    game.drawList.fixed.push(cell.value);
	    var img = game.res.getImage(R.ingredients.condiments[index]);
	    cell.draggable = new DraggableImage(img, cell.value.getNew(cell.value), game.canvas);
	    cell.draggable.burgerFlag = false;
	    game.drawList.draggables.push(cell.draggable);
	    index++;
	});
	this.img = game.res.getImage(R.condiments.img);
	this.imgRect = new Rect(this._slots.getShape().x, this._slots.getShape().y,
			  this._slots.getShape().width, R.condiments.imgHeight);
    },
    update: function(game){
	this._slots.forEach(function(cell){
	    // if a condiment is over a burger add it to a burger
	    // if it is not drag it back to it's pile
	    if(cell.value != null){
		if(cell.draggable.burgerFlag && !cell.draggable._selected){
		    // find the trays that patty is over
		    var tray = game.trays.overBurger(cell.draggable.getShape());
		    // check if the ingredient is over the burger's top-most ingredient and if it is not over the ingredient limit
		    if(tray.overBurger(cell.draggable.getShape()) && tray.getBurger().numIngredients() < R.burger.maxIngredients){
			tray.getBurger().add(new Ingredient(cell.value.name,
							    cell.draggable.getShape().x,
							    cell.draggable.getShape().y,
							    game));
			// move draggable back to condiment pile
			cell.draggable.getShape().x = cell.value.x;
			cell.draggable.getShape().y = cell.value.y;
		    }
		    cell.draggable.burgerFlag = false;
		} else if(cell.value != null){
		    // slide value/patty toward center of slot
		    var position = cell.rect.getCenter();
		    position.x -= cell.draggable.getShape().width/2;
		    position.y -= cell.draggable.getShape().height/2;
		    if(!cell.draggable._selected)
			slide(cell.draggable.getShape(), position, game.time.passed, R.patty.speed);
		    else if(game.trays.overBurger(cell.draggable.getShape())){
			cell.draggable.burgerFlag = true;
		    } else cell.draggable.burgerFlag = false;
		}
	    }
	});
    },
    draw: function(context){
	context.drawImage(this.img, this.imgRect.x, this.imgRect.y, this.imgRect.width, this.imgRect.height);
	//this._slots.stroke(context);
    }
});

/** Soda: A cup, with a back, and soda inside of it
*/
var Soda = Class.create(DraggableImage, {
    initialize: function($super, game, nozzle){
	$super(game.res.getImage('soda'),
	       new Rect(R.soda.spawn.x, R.soda.spawn.y, R.soda.cup.width, R.soda.cup.height),
	       game.canvas);
	this.drink = null;
	this.name = null;
	this.back = game.res.getImage('soda_back');
	this.pieces = {	drink: new Rect(this.getShape().x, this.getShape().y - this.getShape().width/2,
				       this.getShape().width, this.getShape().height/2),
			back: new Rect(this.getShape().x, this.getShape().y, this.getShape().width, this.getShape().height)};
	this.progress = 0;
	this.onTray = false;
	this._lock = true;
	this.nozzle = nozzle;
    },
    update:function($super, game){
	// move back and drink to same position as soda
	for(var i in this.pieces){
	    this.pieces[i].x = this.getShape().x;
	    this.pieces[i].y = this.getShape().y;
	}
	// set position of drink relative to fill progress
	if(this.drink != null){
	    this.addProgress(game.time.passed/R.soda.refillSpeed);
	    this.pieces['drink'].x += this.getShape().width/2 - (this.getShape().width/2) * this.progress/100;
	    this.pieces['drink'].y += this.getShape().height/2 - (this.getShape().height/2) * this.progress/100;
	    this.pieces['drink'].width = R.soda.cup.width * this.progress/100;
	}
    },
    draw: function($super){
	// draw back
	var context = this._canvas.getContext('2d');
	context.drawImage(this.back, this.pieces['back'].x, this.pieces['back'].y,
			      this.pieces['back'].width, this.pieces['back'].height);
	// draw drink
	if(this.drink != null){
	    context.drawImage(this.drink, this.pieces['drink'].x, this.pieces['drink'].y,
			      this.pieces['drink'].width, this.pieces['drink'].height);
	}
	// draw nozzle spray
	if(!this.onTray && this.progress < 100){
	    this.nozzle.draw(context);
	}
	// draw actual drink
	$super();
    },
    addProgress: function(prog){
	this.progress += prog;
	if(this.progress < 0) this.progress = 0;
	if(this.progress > 100) this.progress = 100;
    },
    setDrink: function(drink, game){
	this.drink = game.res.getImage(R.soda.images[drink].cup);
	this.name = drink;
	this.progress = 0;
    },
    slide: function(pos, game){
	slide(this.getShape(), pos, game.time.passed, R.ingredients.speed);
    },
    getName: function(){return this.name;}
});

/** A button, for selecting soda
*/
var SodaButton = Class.create(ImageButton, {
    initialize: function($super, name, pos, game){
	this.name = name;
	var rect = new Rect(pos.x, pos.y, R.soda.buttons.buttonSize, R.soda.buttons.buttonSize);
	$super(rect, game.canvas, 'push', game.res.getImage(R.soda.images[name].up),
	       game.res.getImage(R.soda.images[name].down));
    },
    getName: function(){return this.name;}
});

var SodaNozzle = Class.create({
    initialize: function(game, pos){
	this.choice = null;
	this.index = R.soda.nozzleData.indexes[0];
	this.images = new Object();
	// populate object
	for(var i in R.soda.nozzle){
	    this.images[i] = new Object();
	    for(var j in R.soda.nozzle[i]){
		this.images[i][j] = game.res.getImage(R.soda.nozzle[i][j]);
	    }
	}
	this.rect = new Rect(pos.x, pos.y, R.soda.nozzleData.width, R.soda.nozzleData.height);
	this.timer = R.soda.nozzleData.timer;
	this.pour = false;
    },
    update: function(game){
	if(this.pour == true){
	    this.timer -= game.time.passed;
	    if(this.timer <= 0){
		// choose next image
		this.index++;
		// reset currentImg if it passed 3
		if(this.index > R.soda.nozzleData.indexes.length)
		    this.index = R.soda.nozzleData.indexes[0];
		// reset timer
		this.timer = R.soda.nozzleData.timer;
	    }
	}
    },
    draw: function(context){
	if(this.choice != null && this.pour == true){
	    var img = this.images[this.choice][this.index];
	    context.drawImage(img, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
	}
    },
    setChoice: function(choice){
	this.choice = choice;
	this.pour = true;
    },
    stop: function(){this.pour = false;}
});
/** SodaMachine: A machine containing a cup, and three different choices of soda
*/
var SodaMachine = Class.create({
    initialize: function(game){
	this.machine = {img:game.res.getImage('soda_machine'),
	    rect: new Rect(R.soda.machine.x, R.soda.machine.y, R.soda.machine.width, R.soda.machine.height)};
	this.buttons = new Table(1, R.soda.options.length, R.soda.buttons.cellSize);
	var buttonPos = {x: this.machine.rect.getCenter().x - this.buttons._rect.width/2,
	    y:this.machine.rect.y + R.soda.buttons.offset};
	this.buttons.setPos(buttonPos.x, buttonPos.y);
	var index = 0;
	this.buttons.forEach(function(cell){
	    var pos = cell.rect.getCenter();
	    pos.x -= R.soda.buttons.buttonSize/2;
	    pos.y -= R.soda.buttons.buttonSize/2;
	    cell.value = new SodaButton(R.soda.options[index], pos, game);
	    index++;
	});
	// nozzle
	this.nozzle = new SodaNozzle(game, {x: this.machine.rect.getCenter().x - R.soda.nozzleData.width/2,
				     y: this.machine.rect.y + R.soda.nozzleData.offsetY});
	// soda
	this.soda = new Soda(game, this.nozzle);
	this.sodaPos = {x:this.machine.rect.getCenter().x - this.soda.getShape().width/2, y:this.machine.rect.getCenter().y};

	game.drawList.fixed.push(this);
	game.drawList.draggables.push(this.soda);
	this.ready = false;
    },
    update: function(game){
	// move soda
	if(this.ready && !mouse.down){
	    this.soda.setLock(false);
	    this.ready = false;
	}
	if(this.soda.getShape().x != this.sodaPos.x || this.soda.getShape().y != this.sodaPos.y){
	    if(this.soda.onTray && !this.soda._selected){
		// add soda to tray
		var tray = game.trays.overSide(this.soda.getShape());
		var cell = tray.overSide(this.soda.getShape());
		if(cell.value == null){
		    cell.value = this.soda;
		    game.drawList.draggables.remove(this.soda);
		    this.soda = new Soda(game, this.nozzle);
		    game.drawList.draggables.push(this.soda);
		}
	    }
	    // if onGrill flag is not set drag back to stack	    
	    else if(!this.soda.onTray && !this.soda._selected){
		slide(this.soda.getShape(), this.sodaPos, game.time.passed, R.soda.speed);
	    }
	     // check if patty is selected and over grill and set flag accordingly
	    if(game.trays.overSide(this.soda.getShape()) != null && this.soda._selected){
		var tray = game.trays.overSide(this.soda.getShape());
		var cell = tray.overSide(this.soda.getShape());
		if(cell.value == null)
		    this.soda.onTray = true;
	    } else this.soda.onTray = false;
	}
	// update the buttons
	var selection = null;
	this.buttons.forEach(function(cell){
	    cell.value.update();
	    if(cell.value.getState())
		selection = cell.value.getName();
	});
	// add pouring soda effect
	if(selection != null && (this.soda.getShape().x == this.sodaPos.x || this.soda.getShape().y == this.sodaPos.y)){
	    this.soda.setDrink(selection, game);
	    this.nozzle.setChoice(selection);
	}
	var oldProgress = this.soda.progress;
	this.soda.update(game);
	this.nozzle.update(game);
	if(this.soda.progress != oldProgress && this.soda.progress == 100 && !this.ready){
	    this.ready = true;
	    this.nozzle.stop();
	}
    },
    draw: function(context){
	context.drawImage(this.machine.img, this.machine.rect.x, this.machine.rect.y,
			  this.machine.rect.width, this.machine.rect.height);
	//this.buttons.stroke(context);
	this.buttons.forEach(function(cell){
	    cell.value.draw();
	});
	this.nozzle.draw(context);
    }
});
/** Fry: Some fries
*/
var Fry = Class.create(Rect, {
    initialize: function($super, name, x, y, game){
	$super(x, y, R.fries.dimensions[name].width, R.fries.dimensions[name].height);
	this.name = name;
	this.img = game.res.getImage(R.fries.images[name]);
	this.onTray = false;
    },
    draw: function(context){
	context.drawImage(this.img, this.x, this.y, this.width, this.height);
    },
    slide: function(pos, game){
	slide(this, pos, game.time.passed, R.ingredients.speed);
    },
    update: function(){},
    getShape: function(){return this;},
    getName: function(){return this.name;}
});

/** Fries: A collection of three different sizes of fries
*/
var Fries = Class.create({
    initialize: function(game){
	game.drawList.fixed.push(this);
	this._slots = new Table(R.fries.rows, R.fries.columns, R.fries.cellSize);
	this._slots.setPos(R.fries.x, R.fries.y);
	// fill in slots with fries
	var index = 0;
	this._slots.forEach(function(cell){
	    var pos = cell.rect.getCenter();
	    pos.x -= R.fries.dimensions[R.fries.types[index]].width/2;
	    //pos.y -= R.fries.dimensions[R.fries.types[index]].height/2;
	    pos.y = cell.rect.y + cell.rect.height - R.fries.verticalOffset - R.fries.dimensions[R.fries.types[index]].height;
	    cell.value = new Fry(R.fries.types[index], pos.x, pos.y, game);
	    // push an image of the ingredient both into the fixed and draggable draw lists
	    game.drawList.fixed.push(cell.value);
	    var img = game.res.getImage(R.fries.images[R.fries.types[index]]);
	    cell.draggable = new DraggableImage(img, cell.value.getNew(cell.value), game.canvas);
	    game.drawList.draggables.push(cell.draggable);
	    index++;
	});
	this.img = game.res.getImage(R.fries.images.holder);
	this.imgRect = new Rect(this._slots.getShape().x, this._slots.getShape().y, this._slots.getShape().width, this._slots.getShape().height);
    },
    update: function(game){
	// move fries
	this._slots.forEach(function(cell){
	    // if a condiment is over a burger add it to a burger
	    // if it is not drag it back to it's pile
	    if(cell.value != null){
		if(cell.value.onTray && !cell.draggable._selected){
		    // find the tray that fries are over
		    var tray = game.trays.overSide(cell.draggable.getShape());
		    var traySide = tray.overSide(cell.draggable.getShape());
		    if(traySide.value == null){
			traySide.value = new Fry(cell.value.name,
						 cell.draggable.getShape().x,
						 cell.draggable.getShape().y,
						 game);
			// move draggable back to condiment pile
			cell.draggable.getShape().x = cell.value.x;
			cell.draggable.getShape().y = cell.value.y;
		    }
		    cell.draggable.onTray = false;
		} else if(!cell.value.onTray && !cell.draggable._selected){
		    // move fries back to respective positions
		    var position = cell.rect.getCenter();
		    position.x -= cell.draggable.getShape().width/2;
		    //position.y -= cell.draggable.getShape().height/2;
		    position.y = cell.rect.y + cell.rect.height - R.fries.verticalOffset - R.fries.dimensions[cell.value.name].height;
		    if(!cell.draggable._selected)
			slide(cell.draggable.getShape(), position, game.time.passed, R.patty.speed);
		}
		if(game.trays.overSide(cell.draggable.getShape()) != null && cell.draggable._selected){
		    var tray = game.trays.overSide(cell.draggable.getShape());
		    var traySide = tray.overSide(cell.draggable.getShape());
		    if(traySide.value == null) cell.value.onTray = true;
		    else cell.value.onTray = false;
		}else cell.value.onTray = false;
	    }
	});
    },
    draw: function(context){
	context.drawImage(this.img, this.imgRect.x, this.imgRect.y, this.imgRect.width, this.imgRect.height);
	//this._slots.stroke(context);
    }
});

var Order = Class.create({
    initialize: function(game){
	// completion time
	this.completionTime = 0;
	// create a container for order
	var pos = game.orders.orderSpawn();
	this.container = {img: game.res.getImage(R.order.containerImg),rect:new Rect(pos.x, pos.y, R.order.width, R.order.height)};
	// find the position of the burger within the container
	var burgerPos = {x: this.container.rect.x + R.order.spacing,
			 y: this.container.rect.y + this.container.rect.height - R.order.spacing - R.ingredients.height};
	// every order contains a burger
	this.burger = new Burger(burgerPos, game);
	// create ingredients
	this.ing = new Array();
	// add one patty (every order has at least one patty)
	this.hasFirstPatty = false;
	this.addPatty();
	this.soda = null;
	this.fries = null;
	// adjust the width of the container to fit all peices properly
	this.resetContainer();
    },
    update: function(game){
	// move burger, soda, and fries relative to the container
	this.burger.getShape().x = this.container.rect.x + R.order.spacing;
	this.burger.getShape().y = this.container.rect.y + this.container.rect.height - R.order.spacing - R.ingredients.height;
	// move soda
	if(this.soda){
	    this.soda.rect.x = this.burger.getShape().x + this.burger.getShape().width + R.order.spacing;
	    this.soda.rect.y = this.container.rect.getCenter().y - R.soda.cup.height/2;
	}
	// move fries
	if(this.fries){
	    if(this.soda){
		this.fries.rect.x = this.soda.rect.x + this.soda.rect.width + R.order.spacing;
	    }
	    else{
		this.fries.rect.x = this.burger.getShape().x + this.burger.getShape().width + R.order.spacing;
	    }
	    this.fries.rect.y = this.container.rect.getCenter().y - R.fries.dimensions[this.fries.name].height/2;
	}
	// update burger
	this.burger.update(game);
    },
    draw: function(context){
	// draw container
	context.drawImage(this.container.img, this.container.rect.x,
			  this.container.rect.y, this.container.rect.width,
			  this.container.rect.height);
	// draw burger
	this.burger.draw(context);
	// draw soda
	if(this.soda){
	    context.drawImage(this.soda.img, this.soda.rect.x,
			      this.soda.rect.y, this.soda.rect.width,
			      this.soda.rect.height);
	}
	// draw fries
	if(this.fries){
	    context.drawImage(this.fries.img, this.fries.rect.x,
			      this.fries.rect.y, this.fries.rect.width,
			  this.fries.rect.height);
	}
    },
    addPatty: function(){
	this.ing.push(R.ingredients.patty_cooked);
	if(!this.hasFirstPatty){
	    this.completionTime += R.wave.timePerPatty;
	    this.hasFirstPatty = true;
	}
	else {
	    this.completionTime += R.wave.timerPerConsecutivePatty;
	}
    },
    addIngredient: function(){
	var rand = Math.floor(Math.random() * (R.ingredients.condiments.length));
	this.ing.push(R.ingredients.condiments[rand]);
	this.completionTime += R.wave.timePerIngredient;
    },
    numIngredients: function(){return this.ing.length;},
    addSoda: function(game){
	// choose random soda
	var sodaChoice = R.soda.options[Math.floor(Math.random() * 3)];
	this.soda = {img: game.res.getImage(R.soda.images[sodaChoice].order),
	    name: sodaChoice,
	    rect: new Rect(this.burger.getShape().x + this.burger.getShape().width + R.order.spacing,
			   this.container.rect.getCenter().y - R.soda.cup.height/2,
			   R.soda.cup.width, R.soda.cup.height)
	};
	this.resetContainer();
	this.completionTime += R.wave.timePerSoda;
    },
    addFries: function(game){
	var fryChoice = Math.floor(Math.random() * 5);
	var fryName;
	switch(fryChoice){
	    // if 0 choose large fries
	    case 0: fryName = R.fries.types[0];
		break;
	    // if 1 or 2 choose extra large fries
	    case 1:
	    case 2: fryName = R.fries.types[1];
		break;
	    // if 3, 4, or 5 choose obese fries
	    case 3:
	    case 4:
	    case 5: fryName = R.fries.types[2];
		break;
	}
	var fryRect = new Rect(null,
			   this.container.rect.getCenter().y - R.fries.dimensions[fryName].height/2,
			   R.fries.dimensions[fryName].width, R.fries.dimensions[fryName].height);
	if(this.soda){
	    fryRect.x = this.soda.rect.x + this.soda.rect.width + R.order.spacing;
	}
	else{
	    fryRect.x = this.burger.getShape().x + this.burger.getShape().width + R.order.spacing;
	}
	this.fries = {img: game.res.getImage(R.fries.images[fryName]), name: fryName, rect: fryRect};
	this.resetContainer();
	this.completionTime += R.wave.timePerFry;
    },
    resetContainer: function(){
	// adjust the width of the container to fit all peices properly
	var width = R.order.spacing + this.burger.getShape().width;
	if(this.soda) width += R.order.spacing + this.soda.rect.width;
	if(this.fries) width += R.order.spacing + this.fries.rect.width;
	width += R.order.spacing;
	this.container.rect.width = width;
    },
    complete: function(game){
	// shuffle ingredients
	this.ing = shuffleArray(this.ing);
	// push ingredients to burger
	for(var i = 0; i < this.ing.length; i++) this.burger.addNew(this.ing[i], game);
	// add top bun
	this.burger.topBun(game);
    },
    getShape: function(){
	return this.container.rect;
    },
    slide: function(pos, game){
	slide(this.getShape(), pos, game.time.passed, R.order.speed);
    },
    compare: function(tray){
	var quality = 0;
	// compare burgers
	var thisBurger = this.burger.checkOrder().split(' ');
	var trayBurger = tray.getBurger().checkOrder().split(' ');
	// compare ingredients based on which burger is bigger
	if(thisBurger.length < trayBurger.length){
	    thisBurger.each(function(ing, i){
		if(ing != trayBurger[i]) quality++;
		if(ing == R.ingredients.patty_burned || ing == R.ingredients.patty_raw)
		    quality++;
	    }, this);
	    // account for extra ingredients
	    quality += trayBurger.length - thisBurger.length;
	} else{
	    trayBurger.each(function(ing, i){
		if(ing != thisBurger[i]) quality++;
		if(ing == R.ingredients.patty_burned || ing == R.ingredients.patty_raw)
		    quality++;
	    }, this);
	    // account for extra ingredients
	    quality += thisBurger.length - trayBurger.length;
	}
	// compare sides
	var sides = tray.getSides();
	// test for fries
	if(this.fries){
	    quality++;
	    pops = new Array();
	    sides.each(function(side, index){
		if(side.getName() == this.fries.name){
		    quality--;
		    pops.push(index);
		    throw $break;
		}
	    }, this);
	    // remove found fries
	    pops.each(function(index){
		sides.splice(index, 1);
	    },this)
	}	
	// check if there are any stray fries
	sides.each(function(side, index){
	    R.fries.types.each(function(name){
		// if a side is any type of fries it shouldnt be there
		// and therefore costs the player a point
		if(name == side.getName()) quality++;
	    },this);
	}, this);
	// test for soda
	if(this.soda){
	    quality++;
	    pops = new Array();
	    sides.each(function(side, index){
		if(side.getName() == this.soda.name){
		    quality--;
		    pops.push(index);
		    throw $break;
		}
	    }, this);
	    // remove found sodas
	    pops.each(function(index){
		sides.splice(index, 1);
	    },this)
	}
	// check if there are any stray soda's
	sides.each(function(side, index){
	    R.soda.options.each(function(name){
		// if a side is any type of soda it shouldnt be there
		// and therefore costs the player a point
		if(name == side.getName()) quality++;
	    },this);
	}, this);
	return quality;
    }
});

var OrderPanel = Class.create({
    initialize: function(game){
	this.container = {img: game.res.getImage(R.orderPanel.img),
	    rect: new Rect(R.orderPanel.x, R.orderPanel.y, R.orderPanel.width, R.orderPanel.height)};
	this.orders = new Array();
	game.drawList.fixed.push(this);
    },
    update: function(game){
	// slide all orders to thier respective positions
	for(var i = 0; i < this.orders.length; i++){
	    // find the position of the first order
	    var pos;
	    if(i == 0){
		pos = {x: this.container.rect.x + this.container.rect.width - (this.orders[i].getShape().width + R.orderPanel.spacing),
		    y:this.container.rect.getCenter().y - R.order.height/2};
	    } else {
		pos = {x: this.orders[i-1].getShape().x - (this.orders[i].getShape().width + R.orderPanel.spacing),
		    y: this.container.rect.getCenter().y - R.order.height/2};
	    }
	    this.orders[i].slide(pos, game);
	    this.orders[i].update(game);
	}
    },
    draw: function(context){
	// draw container
	context.drawImage(this.container.img, this.container.rect.x,
			  this.container.rect.y, this.container.rect.width,
			  this.container.rect.height);
	// draw orders
	for(var i = 0; i < this.orders.length; i++){
	    this.orders[i].draw(context);
	}
    },
    take: function(){
	return this.orders.shift();
    },
    add: function(order){
	this.orders.push(order);
    },
    orderSpawn: function(){
	return {x: R.order.spawnX, y: this.container.rect.getCenter().y - R.order.height/2};
    },
    noOrders: function(){
	if(this.orders.length == 0) return true;
	else return false;
    }
});

var Deliver = Class.create({
    initialize: function(game){
	this.orders = new Array();
	this.pos = {x:R.deliver.x, y:R.deliver.y};
	game.drawList.fixed.push(this);
    },
    update: function(game){
	this.orders.each(function(order, index){
	    // move orders toward order pos
	    var flag = true;
	    for(var i in order){
		order[i].slide(this.pos, game);
		order[i].update(game);
		if(order[i].getShape().x == this.pos.x && order[i].getShape().y == this.pos.y)
		    order[i].flag = true;
		if(!order[i].flag)
		    flag = false;
	    }
	    if(flag){
		// compare order to tray
		var quality = order.order.compare(order.tray);
		game.score.process(game, quality, order.order.completionTime);
		// remove orders from draw list
		for(var i in order){
		    if(game.drawList.fixed.indexOf(order[i]) != -1){
		       game.drawList.fixed.splice(game.drawList.fixed.indexOf(order[i]), 1);
		    }
		    else if(game.drawList.draggables.indexOf(order[i]) != -1){
			game.drawList.draggables.remove(order[i]);
		    }
		    order[i] = null; // remove from memory
		}
		// remove orders from this list
		this.orders.splice(index, 1);
	    }
	}, this);
    },
    add: function(order, tray){
	this.orders.push({order: order, tray: tray});
	// set flag for checking the position
	for(var i in this.orders[this.orders.length -1]){
	    i.flag = false;
	}
    },
    draw: function(context){
	this.orders.each(function(order, index){
	    order['order'].draw(context);
	}, this);
    }
});

var TrashIcon = Class.create({
    initialize: function(game){
	this.rect = new Rect(R.trash.icon.x, R.trash.icon.y, R.trash.icon.width, R.trash.icon.height); // fill in specs
	this.up = game.res.getImage(R.trash.icon.up);
	this.down = game.res.getImage(R.trash.icon.down);
	this.state = false;
	game.drawList.fixed.push(this);
    },
    reset: function(){this.state = false},
    draw: function(context){
	if(this.state){
	    context.drawImage(this.down, this.rect.x, this.rect.y,
			      this.rect.width, this.rect.height);
	} else{
	    context.drawImage(this.up, this.rect.x, this.rect.y,
			      this.rect.width, this.rect.height);
	}
    },
    hovering: function(rect){
	if(this.rect.colliding(rect)){
	    this.state = true;
	    return true;
	}
	return false;
    }
});

var Trash = new Class.create({
    initialize: function(game){
	this.pos = {x:R.trash.x, y:R.trash.y};
	this.stuff = new Array();
	this.icon = new TrashIcon(game);
    },
    update: function(game){
	for(var i = 0; i < this.stuff.length; i++){
	    //slide(this.stuff[i].getShape(), this.pos, game.time.passed, R.trash.speed);
	    this.stuff[i].slide(this.pos, game);
	    this.stuff[i].update(game);
	    if(this.stuff[i].getShape().x == this.pos.x && this.stuff[i].getShape().y == this.pos.y){
		// remove from draw list
		if(game.drawList.fixed.indexOf(this.stuff[i]) != -1){
		   game.drawList.fixed.splice(game.drawList.fixed.indexOf(this.stuff[i]), 1);
		}
		else if(game.drawList.draggables.indexOf(this.stuff[i]) != -1){
		    game.drawList.draggables.remove(this.stuff[i]);
		}
		this.stuff[i] = null; // remove from memory
		this.stuff.splice(i, 1); // remove from list
	    }
	}
	this.icon.reset();
    },
    push: function(trash){this.stuff.push(trash);}
});

var Score = Class.create({
    initialize: function(game){
	this.score = 0;
	this.countDown = R.score.time;
	var str = "Score: " + String(this.score);
	this.text = new CanvasText(str, game.canvas.getContext('2d'),
			    {box: R.score.rect,
			    font: R.score.font,
			    textAlign: R.score.textAlign});
	this.timerText = new CanvasText('Time: ' + String((this.countDown/1000).toFixed(0)) + 's', game.canvas.getContext('2d'),
			    {box: R.score.timerText.rect,
			    font: R.score.font,
			    textAlign: R.score.textAlign,
			    color: R.score.timerText.color});
	this.messages = new Array();
	this.img = game.res.getImage(R.score.img);
	this.scoreRect = new Rect(R.score.timerText.rect.x + R.score.backGroundOffset, R.score.timerText.rect.y + R.score.backGroundOffset,
				  R.score.rect.width - (R.score.backGroundOffset*2),
				  R.score.timerText.rect.height + R.score.rect.height - (R.score.backGroundOffset*2));
	game.drawList.fixed.push(this);
    },
    update: function(game){
	this.countDown -= game.time.passed;
	if(this.countDown <= 0){
	    // game over
	    this.countDown = 0;
	    game.state = R.game.state.over;
	    game.highScore.update(game);
	    game.gameOver.setHighScore(game);
	}
	// update messages
	this.messages.each(function(message, index){
	    message.update(game);
	    if(!message.good)
		this.messages.splice(index, 1);
	}, this);
	// update text
	// score
	var str = "Score: " + String(this.score);
	this.text.setText(str);
	this.timerText.setText('Time: ' + String((this.countDown/1000).toFixed(0)) + 's');
	if((this.countDown/1000).toFixed(0) <= R.score.minTime){
	    this.timerText.setColor(R.score.timerText.emergencyColor);
	}else{
	    this.timerText.setColor(R.score.timerText.color);
	}
    },
    draw: function(context){
	// draw background img
	context.drawImage(this.img, this.scoreRect.x, this.scoreRect.y, this.scoreRect.width, this.scoreRect.height);
	this.text.draw();
	this.timerText.draw();
	this.messages.each(function(message){
	    message.draw(context);
	}, this);
    },
    process: function(game, quality, time){
	var message = null;
	var bonusTime = 0;
	var newScore = 0;
	switch(quality){
	    case R.score.type.perfect:
		bonusTime = time;
		message = new ScoreMessage(game, R.score.types.perfect);
		break;
	    case R.score.type.good:
		bonusTime = time * 0.75;
		message = new ScoreMessage(game, R.score.types.good);
		break;
	    case R.score.type.ok:
		bonusTime = time * 0.5;
		message = new ScoreMessage(game, R.score.types.ok);
		break;
	    case R.score.type.bad:
	    default:
		bonusTime = time * -0.75;
		message = new ScoreMessage(game, R.score.types.bad);
		break;
	}
	newScore = toScore(bonusTime);
	this.messages.push(message);
	this.countDown += bonusTime;
	// add score but only if it is not negative
	this.score += newScore;
	function toScore(bonusTime){
	    return Number((bonusTime/100).toFixed(0))>0?Number((bonusTime/100).toFixed(0)):0;
	}
    },
    reset: function(){
	this.score = 0;
    }
});

var ScoreMessage = Class.create({
    initialize: function(game, name){
	var rect = new Rect(R.score.message.x, R.score.message.y, R.score.message.width, R.score.message.heigth);
	var str = R.score.message.str[name];
	this.text = new CanvasText(str, game.canvas.getContext('2d'),
			    {box: rect,
			    font: R.score.message.font,
			    textAlign: R.score.message.textAlign,
			    color: R.score.message.color[name]});
	this.timer = R.score.message.time;
	this.good = true;
	this.strokeColor = new Color(0,0,0);
    },
    update: function(game){
	this.timer -= game.time.passed;
	if(this.timer <= 0){
	    this.good = false;
	}
	// move
	this.text.getBox().y -= R.score.message.speed/game.time.passed;
    },
    draw: function(){
	this.text.draw();
	this.text.stroke(this.strokeColor);
    }
});

var Background = Class.create({
    initialize: function(game){
	this.img = game.res.getImage(R.background.img);
	game.drawList.fixed.push(this);
    },
    draw: function(context){
	context.drawImage(this.img, R.background.x, R.background.y, R.background.width, R.background.heigth);
    }
});
/** Wave: a wave generates a random set of orders according to its wave number
*/
var Wave = Class.create({
    initialize: function(game){
	// start waves off at wave 1
	this.number = 1;
	this.orders = null;
	this.nextOrderIn = 0;
	this.state = R.wave.state.play;
	this.generate(game);
    },
    generate: function(game){
	// the number of patties corresponds to the wave number
	var numPatties = this.number;
	// generate number of ingredients
	var numIngredients = (this.number -1) * R.wave.ingredientMultiplier;
	// generate number of sodas
	var numSodas = Math.floor((this.number - 1) * R.wave.sodaMultiplier);
	// generate number fries
	var numFries = Math.floor((this.number -1) * R.wave.fryMultiplier);
	// generate orders
	var numOrders = numSodas + Math.floor(Math.random() * (numPatties - numSodas) + 1) ;
	// create orders
	this.orders = new Array();
	for(var i = 0; i < numOrders; i++){
	    this.orders.push(new Order(game));
	}
	// calculate extra patties
	var extraPatties = numPatties - numOrders;
	for(var i = 0; i < extraPatties; i++){
	    var rand = Math.floor(Math.random() * this.orders.length);
	    this.orders[rand].addPatty();
	}
	// add ingredients
	for(var i = 0; i < numIngredients; i++){
	    var flag = false;
	    do{
	    var randIndex = Math.floor(Math.random() * this.orders.length);
	    if(this.orders[randIndex].numIngredients() < R.burger.maxIngredients){
		this.orders[randIndex].addIngredient();
		flag = true;
	    }
	    }while(!flag);
	}
	// shuffle orders
	this.orders = shuffleArray(this.orders);
	// add sodas
	for(var i = 0; i < numSodas; i++){
	    this.orders[i].addSoda(game);
	}
	// shuffle orders
	this.orders = shuffleArray(this.orders);
	// add fries
	for(var i = 0; i < numFries; i++){
	    this.orders[i].addFries(game);
	}
	// complete orders
	for(var i= 0; i < this.orders.length; i++){
	    this.orders[i].complete(game);
	}
	// shuffle orders just one last time
	this.orders = shuffleArray(this.orders);
	// reset next order
	this.nextOrderIn = 0;
	this.state = R.wave.state.play;
    },
    update: function(game){
	// update timer
	this.nextOrderIn -= game.time.passed;
	// inject orders
	if(this.state == R.wave.state.play){
	    if(this.nextOrderIn <= 0 || game.orders.noOrders()){
		game.orders.add(this.orders.shift());
		if(this.orders.length > 0){
		    this.nextOrderIn = this.orders.first().completionTime - R.wave.nextOrderGrace;
		}
		else{
		    this.state = R.wave.state.out;
		}
	    }
	}
	// once both the wave and the order panel are exhausted start the next wave
	if(this.state == R.wave.state.out && game.orders.noOrders())
	    this.next(game);
    },
    next: function(game){
	this.number++;
	this.generate(game);
    }
});

var GameOver = Class.create({
    initialize: function(game){
	// measure canvas for a button rect
	var rect = new Rect(game.canvas.width/2 - R.game.gameOver.button.width/2,
			    game.canvas.height/2 - R.game.gameOver.button.height/2,
			    R.game.gameOver.button.width, R.game.gameOver.button.height);
	this.restartButton = new ImageButton(rect, game.canvas, 'push', game.res.getImage(R.game.gameOver.button.imgUp),
					     game.res.getImage(R.game.gameOver.button.imgDown));
	// set restart button callback
	this.restartButton.click(function(){
	    game.state = R.game.state.play;
	    game.newGame();
	},this);
	// game over text
	var textRect = new Rect(game.canvas.width/2 - R.game.gameOver.text.width/2,
			    game.canvas.height/2 - R.game.gameOver.text.height - R.game.gameOver.text.offsetY,
			    R.game.gameOver.text.width, R.game.gameOver.text.height);
	this.text = new CanvasText(R.game.gameOver.text.str, game.canvas.getContext('2d'),
			    {box: textRect,
			    font: R.game.gameOver.text.font,
			    textAlign: R.game.gameOver.text.textAlign,
			    color: R.game.gameOver.text.color});
	var scoreTextRect = new Rect(game.canvas.width/2 - R.game.gameOver.scoreText.width/2,
			    rect.y + rect.height + R.game.gameOver.scoreText.offsetY,
			    R.game.gameOver.scoreText.width, R.game.gameOver.scoreText.height);
	this.scoreText = new CanvasText('', game.canvas.getContext('2d'),
			    {box: scoreTextRect,
			    font: R.game.gameOver.scoreText.font,
			    textAlign: R.game.gameOver.text.textAlign,
			    color: R.game.gameOver.text.color});
	this.opaqueRect = new Rect(0,0,game.canvas.width, game.canvas.height);
	this.opaqueColor = new Color(0,0,0,0.5);
    },
    update: function(game){
	// record old button state
	if(game.state == R.game.state.over){
	    this.restartButton.update();
	}
    },
    setHighScore: function(game){
	var str = '';
	if(game.score.score == game.highScore.score){
	    // Dislpay only the high score
	    str = R.game.gameOver.scoreText.highScore;
	    str += String(game.highScore.score);
	} else{ // Display the players score and the high score
	    // your score
	    str = R.game.gameOver.scoreText.playerScore;
	    str += String(game.score.score);
	    // high score
	    str += '\n' + R.game.gameOver.scoreText.highScore;
	    str += String(game.highScore.score);
	}
	this.scoreText.setText(str);
    },
    draw: function(context){
	// draw opaque rect in background
	context.fillStyle = this.opaqueColor.rgba();
	context.fillRect(this.opaqueRect.x, this.opaqueRect.y, this.opaqueRect.width, this.opaqueRect.height);
	this.text.draw();
	this.restartButton.draw();
	this.scoreText.draw();
    }
});

var HighScore = Class.create({
    initialize: function(){
	this.score = 0;
    },
    update: function(game){
	if(game.score.score > this.score){
	    this.score = game.score.score;
	}
    }
});

var MainMenu = Class.create({
    initialize: function(game){
	this.logo = new Image();
	this.logo.src = R.game.mainMenu.logo.img;
	this.logo.loaded = false;
	Event.observe(this.logo, "load", function(){
	    this.loaded = true;
	});
	this.logoRect = new Rect(game.canvas.width/2 - R.game.mainMenu.logo.width/2,
			    R.game.mainMenu.logo.y, R.game.mainMenu.logo.width, R.game.mainMenu.logo.height);
	// measure canvas for a button rect
	var rect = new Rect(game.canvas.width/2 - R.game.mainMenu.button.width/2,
			    (R.game.mainMenu.logo.y + R.game.mainMenu.logo.height + R.game.mainMenu.button.offsetY),
			    R.game.mainMenu.button.width, R.game.mainMenu.button.height);
	this.button = new ImageButton(rect, game.canvas, 'push', R.game.mainMenu.button.imgUp, R.game.mainMenu.button.imgDown);
	var tutorialRect = new Rect(game.canvas.width/2 - R.game.mainMenu.tutorialButton.width/2,
			    (R.game.mainMenu.logo.y + R.game.mainMenu.logo.height + R.game.mainMenu.tutorialButton.offsetY),
			    R.game.mainMenu.tutorialButton.width, R.game.mainMenu.tutorialButton.height);
	this.tutorialButton = new ImageButton(tutorialRect, game.canvas, 'push', R.game.mainMenu.tutorialButton.imgUp, R.game.mainMenu.tutorialButton.imgDown);
	// loading bar
	var loadingRect = new Rect(game.canvas.width/2 - R.game.mainMenu.loadingBar.width/2,
			    (R.game.mainMenu.logo.y + R.game.mainMenu.logo.height + R.game.mainMenu.button.offsetY),
			    R.game.mainMenu.loadingBar.width, R.game.mainMenu.loadingBar.height);
	this.bar = new LoadingBar(R.game.mainMenu.loadingBar.inner, R.game.mainMenu.loadingBar.outer, loadingRect, R.game.mainMenu.loadingBar.inset);
	// set up button callbacks
	this.button.click(function(){
	    if(this.ready){
		game.state = R.game.state.play;
	    }
	}, this);
	this.tutorialButton.click(function(){
	    if(this.ready){
		game.state = R.game.state.tutorial;
	    }
	},this);
	this.ready = false;
	this.loading = false;
    },
    update: function(game){
	if(this.bar.loaded && !this.loading){
	    game.res.load();
	    this.loading = true;
	}
	// check game progress
	var progress = game.res.progress();
	// set ready flag if game loaded
	if(!this.ready && game.res.progress() == 1){
	    this.ready = true;   
	}
	// record old button state
	if(game.state == R.game.state.loading){
	    this.bar.update(progress);
	    this.button.update();
	    this.tutorialButton.update();
	}
	// if game is ready take button input
	if(this.ready){
	    game.newGame();
	    // load in tutorial if it hasnt been insansiated yet
	    if(game.tutorial == null){
		game.tutorial = new Tutorial(game);
	    }
	}
    },
    draw: function(context){
	// draw logo
	if(this.logo.loaded){
	    context.drawImage(this.logo, this.logoRect.x, this.logoRect.y, this.logoRect.width, this.logoRect.height);
	} 
	if(this.ready){
	    if(this.button.loaded){
		this.button.draw();
	    }
	    if(this.tutorialButton.loaded){
		this.tutorialButton.draw();
	    }
	}
	else{
	    if(this.bar.loaded){
		this.bar.draw(context);
	    }
	}
    }
});

var PauseScreen = Class.create({
    initialize: function(game){
	// measure canvas for a button rect
	var rect = new Rect(game.canvas.width/2 - R.game.paused.button.width/2,
			    game.canvas.height/2 - R.game.paused.button.height/2,
			    R.game.paused.button.width, R.game.paused.button.height);
	this.playButton = new ImageButton(rect, game.canvas, 'push', game.res.getImage(R.game.paused.button.imgUp),
					     game.res.getImage(R.game.paused.button.imgDown));
	// set up callback function
	this.playButton.click(function(){
		game.state = R.game.state.play;
	});
	// game over text
	var textRect = new Rect(game.canvas.width/2 - R.game.paused.text.width/2,
			    game.canvas.height/2 - R.game.paused.text.height - R.game.paused.text.offsetY,
			    R.game.paused.text.width, R.game.paused.text.height);
	this.text = new CanvasText(R.game.paused.text.str, game.canvas.getContext('2d'),
			    {box: textRect,
			    font: R.game.paused.text.font,
			    textAlign: R.game.paused.text.textAlign,
			    color: R.game.paused.text.color});
	this.opaqueRect = new Rect(0,0,game.canvas.width, game.canvas.height);
	this.opaqueColor = new Color(0,0,0,0.5);
    },
    update: function(game){
	this.playButton.update();
    },
    draw: function(context){
		// draw opaque rect in background
	context.fillStyle = this.opaqueColor.rgba();
	context.fillRect(this.opaqueRect.x, this.opaqueRect.y, this.opaqueRect.width, this.opaqueRect.height);
	this.text.draw();
	this.playButton.draw();
    }
});

var Tutorial = Class.create({
    initialize: function(game){
	this.images = new Array();
	// fill array with images from game.res
	// keep images in thier native sizes
	for(var i = 0; i < R.tutorial.images.length; i++){
	    var img = game.res.getImage(R.tutorial.images[i])
	    this.images[i] = {img:img,
		rect: new Rect(game.canvas.width/2 - img.width/2, game.canvas.height/2 - img.height/2,
			       img.width, img.height)};
	}
	this.index = 0; // always starts on first image
	
	// left and right rects for drawing buttons
	var rightButtonRect = new Rect(game.canvas.width/2 + R.tutorial.buttons.centerOffsetX,
					game.canvas.height/2 + R.tutorial.buttons.centerOffsetY,
					R.tutorial.buttons.width, R.tutorial.buttons.height);
	var leftButtonRect = new Rect(game.canvas.width/2 - R.tutorial.buttons.centerOffsetX - R.tutorial.buttons.width,
					game.canvas.height/2 + R.tutorial.buttons.centerOffsetY,
					R.tutorial.buttons.width, R.tutorial.buttons.height);
	this.nextButton = new ImageButton(rightButtonRect, game.canvas, 'push',
					  game.res.getImage(R.tutorial.nextButton.up), game.res.getImage(R.tutorial.nextButton.down));
	this.backButton = new ImageButton(leftButtonRect, game.canvas, 'push',
					  game.res.getImage(R.tutorial.backButton.up), game.res.getImage(R.tutorial.backButton.down));
	this.okButton = new ImageButton(rightButtonRect, game.canvas, 'push',
					game.res.getImage(R.tutorial.okButton.up), game.res.getImage(R.tutorial.okButton.down));
	// set up callback functions
	this.nextButton.click(function(){
	    this.index++;
	}, this);
	this.backButton.click(function(){
	    this.index--;
	},this);
	this.okButton.click(function(){
	    this.end(game);
	}, this);
	game.drawList.fixed.push(this);
    },
    update: function(game){
	switch(this.index){
	    case 0:
		// update next button
		this.nextButton.update();
		break;
	    case 1:
		// update next button
		this.nextButton.update();
		// update back button
		this.backButton.update();
		break;
	    case 2:
		// update ok button
		this.okButton.update();
		// update back button
		this.backButton.update();
		break;
	    default: break;
	}
    },
    draw: function(context){
	// draw screen
        context.drawImage(this.images[this.index].img, this.images[this.index].rect.x, this.images[this.index].rect.y,
			      this.images[this.index].rect.width, this.images[this.index].rect.height);
	switch(this.index){
	    case 0:
		// update only next button
		this.nextButton.draw();
		break;
	    case 1:
		// update both back and next button
		this.nextButton.draw();
		this.backButton.draw();
		break;
	    case 2:
		// update back button
		this.backButton.draw();
		// update OK button
		this.okButton.draw();
		break;
	    default: break;
	}
    },
    end: function(game){
	// end tutorial
	this.index = 0;
	game.state = R.game.state.play;
    }
});

var GameButtons = Class.create({
    initialize: function(game){
	var pauseRect = new Rect(R.game.buttons.spacing, game.canvas.height - R.game.buttons.height - R.game.buttons.spacing,
			    R.game.buttons.width, R.game.buttons.height);
	this.pause = new ImageButton(pauseRect, game.canvas, 'push',
					game.res.getImage(R.game.buttons.pause.imgUp), game.res.getImage(R.game.buttons.pause.imgDown));
	var helpRect = new Rect(pauseRect.x + R.game.buttons.spacing + R.game.buttons.width,
				game.canvas.height - R.game.buttons.height - R.game.buttons.spacing,
				R.game.buttons.width, R.game.buttons.height);
	this.help = new ImageButton(helpRect, game.canvas, 'push',
					game.res.getImage(R.game.buttons.help.imgUp), game.res.getImage(R.game.buttons.help.imgDown));
	// set up button callbacks
	this.pause.click(function(){
	    game.state = R.game.state.paused;
	}, this);
	this.help.click(function(){
	    game.state = R.game.state.tutorial;
	});
	game.drawList.fixed.push(this);
    },
    update: function(game){
	this.pause.update();
	this.help.update();
    },
    draw: function(){
	this.pause.draw();
	this.help.draw();
    }
});

function verifyGame(game){
    if(game === undefined) throw new Error('Game Error: invalid game argument');
    if(!game.hasOwnProperty('canvas')) throw new Error('Game Error: missing canvas object');
    if(game.hasOwnProperty('drawList')){
	if(!game.drawList.hasOwnProperty('draggables') || !game.drawList.hasOwnProperty('fixed'))
	    throw new Error('Game Error: game.drawList is invlalid');
    } else throw new Error('Game Error: game missing drawList object');
    if(!game.hasOwnProperty('res')) throw new Error('Game Error: missing res (ResourceManager) object');
    if(!game.hasOwnProperty('time')) throw new Error('Game Error: missing time object');
    return true;
}
function shuffleArray(o){
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};
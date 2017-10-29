// Game Resources and constants
var R = {
    canvas:{
        width: 1024,
        height: 512
    },
    game:{
        state:{loading:0, play:1, tutorial:2, paused:3, over:4},
        buttons:{
            width: 30,
            height: 30,
            spacing: 20,
            pause:{imgUp:'pauseButton_up', imgDown:'pauseButton_down'},
            help:{imgUp:'helpButton_up', imgDown:'helpButton_down'},
        },
        mainMenu:{
            logo:{
                img:'res/Angry_Burger_Logo.png',
                width:400,
                height:300,
                y: 50 
            },
            tutorialButton:{width:200, height:50,
                imgUp:'res/tutorialButton_up.png', imgDown:'res/tutorialButton_down.png',
                offsetY:100},
            button:{width:200, height:50,
                imgUp:'res/playButton_up.png', imgDown:'res/playButton_down.png',
                offsetY:40},
            loadingBar:{
                inner:'res/loading_bar_inner.png',
                outer:'res/loading_bar_outer.png',
                width: 200,
                height: 20,
                inset:2
            }
        },
        gameOver:{
            button:{width:200, height:50,
                imgUp:'restartButtonUp', imgDown:'restartButtonDown'},
            text: {
                str:"Game Over", width:600, height:100,
                font:"100px 'SnicklesRegular', Arial, sans-serif", textAlign: 'center',
                color: new Color(255,255,255), offsetY: 100
            },
            scoreText:{
                width: 300,
                height: 100,
                offsetY: 20,
                font:"60px 'SnicklesRegular', Arial, sans-serif", textAlign: 'center',
                playerScore: "Your Score: ",
                highScore: "High Score: "
            }
        },
        paused:{
            button:{width:200, height:50, imgUp:'playButton_up', imgDown:'playButton_down'},
            text: {
                str:"Paused", width:600, height:100,
                font:"100px 'SnicklesRegular', Arial, sans-serif", textAlign: 'center',
                color: new Color(255,255,255), offsetY: 100
            }
        },
    },
    background:{
        img:'background',
        x:0,
        y:0,
        width: 1024,
        heigth: 512
    },
    tutorial:{
        buttons:{width:200, height:50, centerOffsetX:200, centerOffsetY:200},
        images:["tutorial1", "tutorial2", "tutorial3"],
        nextButton:{up:"nextButton_up", down:"nextButton_down"},
        backButton:{up:"backButton_up", down:"backButton_down"},
        okButton:{up:"okButton_up", down:"okButton_down"}
    },
    patty:{
        x:50,
        y:400,
        width:50,
        height:50,
        spacing:20,
        state:{idle:0, grilling:1, rare:3, cooked:4, burned:5},
        speed:100,
        spawnX:-100,
        spawnY:400,
        cooking:{rare:5000, cooked:10000, burned:15000},
        location:{stack:0, grill:1, tray:2, trash:3}
    },
    grill:{
        x:140,
        y:320,
        rows:2,
        columns:3,
        cellSize: 60,
        image: 'grill',
        offsetX: 5,
        offsetY: 15,
        imgHeight:190
    },
    pattyStack:{
        amount:6,
        state:{spawning:0, serving:1}
    },
    tray:{
        x:420,
        y:365,
        spawnX:450,
        spawnY:600,
        cellWidth:55,
        cellHeight:100,
        spacing:20,
        padding:5,
        state:{idle:0, remove:1, deliver:2},
        speed:100,
        buttons:{width: 30, height:30, spacing:10, yes_up:'button_yes_up', yes_down:'button_yes_down',
            no_up:'button_no_up', no_down:'button_no_down'},
        waitTime: 250,
        img:'tray',
        minTrays: 3
    },
    condiments:{
        x:410,
        y:273,
        rows:1,
        columns:6,
        cellSize:60,
        img:'condiment_tray',
        imgHeight: 85
    },
    ingredients:{
        bottomBun:'bun_bottom',
        topBun:'bun_top',
        patty_raw:'patty_raw',
        patty_rare:'patty_rare',
        patty_cooked:'patty_cooked',
        patty_burned:'patty_burned',
        condiments:['cheese', 'lettuce', 'tomato', 'bacon', 'pickles', 'ketchup'],
        width:50,
        height:50,
        speed:50,
    },
    burger:{
        spacing:10,
        maxIngredients:5
    },
    soda:{
        options:['SyrupCola', 'Spite', 'DrPimples'],
        images:{
            SyrupCola:{up:'SyrupCola_up', down:'SyrupCola_down',cup:'SyrupCola_cup', order:'SyrupCola_order'},
            Spite:{up:'Spite_up', down:'Spite_down', cup:'Spite_cup', order:'Spite_order'},
            DrPimples:{up: 'DrPimples_up',down: 'DrPimples_down', cup: 'DrPimples_cup', order:'DrPimples_order'}
        },
        nozzle:{
            SyrupCola:{1:'Carbonated_pour1', 2:'Carbonated_pour2', 3:'Carbonated_pour3'},
            Spite:{1:'Spite_pour1', 2:'Spite_pour2', 3:'Spite_pour3'},
            DrPimples:{1: 'DrPimples_pour1', 2: 'DrPimples_pour2', 3: 'DrPimples_pour3'}
        },
        nozzleData:{
            width:15,
            height:50,
            offsetY: 86,
            timer:50,
            indexes: [1,2,3]
        },
        buttons:{cellSize:75, buttonSize:60, offset:0},
        machine:{x:774, y:158, width:250, height:200},
        spawn:{x:1050, y:150},
        cup:{width: 60, height:90},
        state:{spawning:0, idle:1},
        speed:150,
        refillSpeed:10
    },
    fries:{
        x:490,
        y:204,
        rows:1,
        columns:3,
        cellSize:70,
        verticalOffset: 16,
        types:['large','extra_large','obese'],
        images:{large:'fries_large', extra_large:'fries_extra_large', obese:'fries_obese', holder:'fry_holder'},
        dimensions:{large:{width:40, height:50}, extra_large:{width:50, height:60}, obese:{width:60, height:70}}
    },
    order:{
        width: 100,
        height: 100,
        containerImg:'tray',
        spacing: 5,
        speed: 150,
        spawnX: -100
    },
    orderPanel:{
        x: 0,
        y: 0,
        spacing:10,
        maxTime: 15000,
        minTime: 10000,
        maxOrders: 5,
        img: 'order_panel',
        width: 1024,
        height: 140
    },
    trash:{
        x:600,
        y:520,
        speed: 150,
        icon: {up:'trash_up', down:'trash_down', x: 340, y: 445, width:50, height:50}
    },
    deliver:{
        x: 1050,
        y: 380
    },
    score:{
        type:{perfect:0, good:1, ok:2, bad:3},
        types:{perfect:'perfect', good:'good', ok:'ok', bad:'bad'},
        time:30000,
        rect:{x:60, y: 190, width:200, height:100},
        font: "40px 'SnicklesRegular', Arial, sans-serif",
        textAlign:'left',
        message:{
            x: 280, y: 200, width: 200, height:50, speed: 10, time: 1000,
            str:{perfect:"Perfect", good:"Good", ok:"Ok", bad:"bad"},
            font:"70px 'SnicklesRegular', Arial, sans-serif", textAlign: 'center',
            color:{perfect:new Color(0,255,0), good:new Color(100,255,0), ok:new Color(255,255,0), bad:new Color(255,0,0)}
        },
        timerText:{
            rect: {x:60, y: 150, width:200, height:100},
            color: new Color(0,0,0,0),
            emergencyColor: new Color(255,0,0,0)
        },
        minTime:10,
        img:'scoreBoard',
        backGroundOffset: -10
    },
    wave:{
        ingredientMultiplier: 2,
        fryMultiplier: .75,
        sodaMultiplier: .75,
        timePerPatty: 10000, // 10 seconds
        timerPerConsecutivePatty:5000, // 5 seconds per consecutive patty
        timePerSoda: 3000, // 3 seconds
        timePerFry: 1000, // 1 seconds
        timePerIngredient: 1000, // 1 second
        state: {play:0, out:1},
        nextOrderGrace: 5000
    },
    images:{
        grill:'res/grill.png',
        tray:'res/tray.png',
        patty_raw:'res/patty_raw.png',
        patty_rare:'res/patty_rare.png',
        patty_cooked:'res/patty_cooked.png',
        patty_burned:'res/patty_burned.png',
        bun_bottom:'res/bun_bottom.png',
        bun_top:'res/bun_top.png',
        cheese:'res/cheese.png',
        lettuce:'res/lettuce.png',
        tomato:'res/tomato.png',
        bacon:'res/bacon.png',
        pickles:'res/pickles.png',
        ketchup:'res/ketchup.png',
        soda:'res/soda.png',
        soda_back:'res/soda_back.png',
        SyrupCola_up: 'res/CarbonatedSyrup_up.png',
        SyrupCola_down:'res/CarbonatedSyrup_down.png',
        SyrupCola_cup:'res/CarbonatedSyrup_in_cup.png',
        Carbonated_pour1:'res/Carbonated_pour1.png',
        Carbonated_pour2:'res/Carbonated_pour2.png',
        Carbonated_pour3:'res/Carbonated_pour3.png',
        SyrupCola_order:'res/Carbonated_order.png',
        Spite_up:'res/Sprizzle_up.png',
        Spite_down:'res/Sprizzle_down.png',
        Spite_cup:'res/Sprizzle_in_cup.png',
        Spite_pour1:'res/Sprizzle_pour1.png',
        Spite_pour2:'res/Sprizzle_pour2.png',
        Spite_pour3:'res/Sprizzle_pour3.png',
        Spite_order:'res/Sprizzle_order.png',
        DrPimples_up:'res/DrPimples_up.png',
        DrPimples_down:'res/DrPimples_down.png',
        DrPimples_cup:'res/DrPimples_in_cup.png',
        DrPimples_pour1:'res/DrPimples_pour1.png',
        DrPimples_pour2:'res/DrPimples_pour2.png',
        DrPimples_pour3:'res/DrPimples_pour3.png',
        DrPimples_order:'res/DrPimples_order.png',
        soda_machine:'res/soda_machine.png',
        fries_large:'res/fries_large.png',
        fries_extra_large:'res/fries_extra_large.png',
        fries_obese:'res/fries_obese.png',
        fry_holder:'res/fry_holder.png',
        order_panel:'res/order_panel.png',
        button_yes_up:'res/button_yes_up.png',
        button_yes_down:'res/button_yes_down.png',
        button_no_up:'res/button_no_up.png',
        button_no_down:'res/button_no_down.png',
        trash_up:'res/trash_up.png',
        trash_down:'res/trash_down.png',
        //score_perfect:'res/score_perfect.png',
        //score_good:'res/score_good.png',
        //score_ok:'res/score_ok.png',
        //score_bad:'res/score_bad.png',
        condiment_tray:'res/condiment_tray.png',
        background:'res/kitchen.png',
        restartButtonUp:'res/restartButtonUp.png',
        restartButtonDown:'res/restartButtonDown.png',
        playButton_up:'res/playButton_up.png',
        playButton_down:'res/playButton_down.png',
        pauseButton_up:'res/pause_up.png',
        pauseButton_down:'res/pause_down.png',
        helpButton_up:'res/help_up.png',
        helpButton_down:'res/help_down.png',
        scoreBoard:'res/scoreBoard.png',
        tutorial1:"res/tutorial1.png",
        tutorial2:"res/tutorial2.png",
        tutorial3:"res/tutorial3.png",
        nextButton_up:"res/nextButton_up.png",
        nextButton_down:"res/nextButton_down.png",
        backButton_up:"res/backButton_up.png",
        backButton_down:"res/backButton_down.png",
        okButton_up:"res/okButton_up.png",
        okButton_down:"res/okButton_down.png"
    },
    sounds:{}
};
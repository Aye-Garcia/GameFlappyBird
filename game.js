//alt + z para ajustar codigo a pantalla

//background
let stage, loader, flappy, jumpListener, pipeCreator; //donde se agregan los elementos
let started;
//let polygon;

function init() {
    stage = new createjs.Stage("gameCanvas");

    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", stage);
    //el ticker es el que se encarga de actualizar el juego

    let background = new createjs.Shape();
    background.graphics.beginLinearGradientFill(["#2573BB", "#6CB8DA", "#567A32"], [0, 0.85, 1], 0, 0, 0, 480).drawRect(0, 0, 320, 480);
    background.x = 0;
    background.y = 0;
    background.name = "background";
    background.cache(0, 0, 320, 480);

    stage.addChild(background);

   // stage.update(); reemplazado por lineas 9 y 10

    // load img
    let manifest = [ 
        { "src": "cloud.png", id: "cloud" },
        { "src": "flappy.png", id: "flappy" },
        { "src": "pipe.png", id: "pipe" },
    ];


loader = new createjs.LoadQueue(true);
loader.addEventListener("complete", handleComplete);
loader.loadManifest(manifest, true, "./img/");


function handleComplete() {
    started = false;
    createClouds();
    createFlappy();
    createScore();
    jumpListener = stage.on("stagemousedown", jumpFlappy);
    createjs.Ticker.addEventListener("tick", checkCollision);
    //polygon = new createjs.Shape();
    //stage.addChild(polygon);
}

function createClouds() {
    let clouds = [];
    for (let i = 0; i < 3; i++) {
        clouds.push(new createjs.Bitmap(loader.getResult("cloud")));
    }
        clouds[0].x = 0;
        clouds[0].y = 0;
        clouds[1].x = 140;
        clouds[1].y = 70;
        clouds[2].x = 80;
        clouds[2].y = 130;

    for (let i = 0; i < 3; i++) {
            // animación
        let directionMultiplier = i % 2 == 0 ? 1 : -1;
        createjs.Tween.get(clouds[i], { loop: true }).to({ x: clouds[i].x - (200 * directionMultiplier)}, 2000).to({ x: clouds[i].x  }, 2000);
        stage.addChild(clouds[i]);
        }
               // stage.update(); reemplazado por lineas 9 y 10
    }

    function createFlappy() {
        flappy = new createjs.Bitmap(loader.getResult("flappy"));
        flappy.regX = flappy.image.width / 2;
        flappy.regY = flappy.image.height / 2;
        flappy.x = stage.canvas.width / 2;
        flappy.y = stage.canvas.height / 2;
        stage.addChild(flappy);
        
    }

    function jumpFlappy() {
        if (!started) {
            startGame();
        }
        createjs.Tween.get(flappy, { override: true }).to({ y: flappy.y - 60, rotation: -20 }, 500, createjs.Ease.getPowOut(2)).to({ y: stage.canvas.height + (flappy.image.width / 2), rotation: 60 }, 1500, createjs.Ease.getPowIn(2)).call(gameOver);
    }

    function createPipes() {
        let topPipe, bottomPipe;
        let position = Math.floor(Math.random() * 280 + 100 ); // minimo 100px de la base

        topPipe = new createjs.Bitmap(loader.getResult("pipe"));
        topPipe.y = position - 75; //gap
        topPipe.x = stage.canvas.width + (topPipe.image.width / 2);
        topPipe.rotation = 180;
        topPipe.name = "pipe";

        bottomPipe = new createjs.Bitmap(loader.getResult("pipe"));
        bottomPipe.y = position + 75;
        bottomPipe.x = stage.canvas.width + (bottomPipe.image.width / 2);
        bottomPipe.skewY = 180; //rotacion para que coincida la iluminacion de la imagen
        bottomPipe.name = "pipe";

        topPipe.regX = bottomPipe.regX = topPipe.image.width / 2;

        createjs.Tween.get(topPipe).to({ x: 0 - topPipe.image.width }, 10000).call(function() { removePipe(topPipe); })
        .addEventListener("change", updatePipe);
        createjs.Tween.get(bottomPipe).to( { x: 0 - bottomPipe.image.width }, 10000).call(function() { removePipe(bottomPipe); });
 
        let scoreIndex = stage.getChildIndex(scoreText);
 
        stage.addChildAt(bottomPipe, topPipe, scoreIndex);
    }

    function removePipe(pipe) {
        stage.removeChild(pipe);
    }

    function updatePipe(event) {
        var pipeUpdated = event.target.target;
        if ((pipeUpdated.x - pipeUpdated.regX + pipeUpdated.image.width) < (flappy.x - flappy.regX)) {
          event.target.removeEventListener("change", updatePipe);
          incrementScore();
        }
      }

      function createScore() {
        score = 0;
        scoreText = new createjs.Text(score, "bold 48px Arial", "#FFFFFF");
        scoreText.textAlign = "center";
        scoreText.textBaseline = "middle";
        scoreText.x = 40;
        scoreText.y = 40;
        let bounds = scoreText.getBounds();
        scoreText.cache(-40, -40, bounds.width*3 + Math.abs(bounds.x), bounds.height + Math.abs(bounds.y));
       
        scoreTextOutline = scoreText.clone();
        scoreTextOutline.color = "#000000";
        scoreTextOutline.outline = 2;
        bounds = scoreTextOutline.getBounds();
        scoreTextOutline.cache(-40, -40, bounds.width*3 + Math.abs(bounds.x), bounds.height + Math.abs(bounds.y));
       
        stage.addChild(scoreText, scoreTextOutline);
      }

    function incrementScore() {
        score++;
        scoreText.text = scoreTextOutline.text = score;
        scoreText.updateCache();
        scoreTextOutline.updateCache();
    }


    function checkCollision() {
    let leftX = flappy.x - flappy.regX + 5; //margen de 5px
    let leftY = flappy.y - flappy.regY + 5; 
    let points = [ //chequea las esquinas de flapy
        new createjs.Point(leftX, leftY),
        new createjs.Point(leftX + flappy.image.width - 10, leftY),
        new createjs.Point(leftX, leftY + flappy.image.height - 10),
        new createjs.Point(leftX + flappy.image.width - 10, leftY + flappy.image.height - 10)
    ];

    // polygon.graphics.clear().beginStroke("black");
    // polygon.graphics.moveTo(points[0].x, points[0].y).lineTo(points[2].x, points[2].y).lineTo(points[3].x, points[3].y).lineTo(points[1].x, points[1].y).lineTo(points[0].x, points[0].y);


    for (let i = 0; i < points.length; i++) {
    let objects = stage.getObjectsUnderPoint(points[i].x, points[i].y);
    if (objects.filter((object) => object.name == "pipe").length > 0) {
      gameOver();
      return;
    }
    }}
    
    function startGame() {
        started = true;
        createPipes();
        pipeCreator = setInterval(createPipes, 6000);

    }

    function gameOver() {
        createjs.Tween.removeAllTweens();
        stage.off("stagemousedown", jumpListener);
        clearInterval(pipeCreator);
        createjs.Ticker.removeEventListener("tick", checkCollision);
        setTimeout(function () {
          stage.on("stagemousedown", resetGame, null, true);
        }, 2000);
      }

    function resetGame() {
    let childrenToRemove = stage.children.filter((child) => child.name != "background");
    for (let i = 0; i < childrenToRemove.length; i++) {
        stage.removeChild(childrenToRemove[i]);
    }
    handleComplete();
    }
}

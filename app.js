var boxSize = 560;
const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");
const scoreFinal = document.getElementById("score-final");
const highScoreFinal = document.getElementById("high-score-final");
const gameOverScreen = document.getElementById("game-over-screen");
document.addEventListener("keydown", handleKeyDown);
var loadingScreen = document.getElementById("loading");
var currentDirection = "up";
var starter = document.getElementById("starter");

var awardScreen = document.getElementById("award-screen");

var multiplyFactor;
function resizeStuff(){
    multiplyFactor = (window.innerHeight - 20) / 560;
    multiplyFactor = Math.min(multiplyFactor, 1.3333);
    cvs.width = boxSize * multiplyFactor;
    cvs.height = boxSize * multiplyFactor;
    gameOverScreen.style.width = cvs.width + "px";
    gameOverScreen.style.height = cvs.height + "px";
    ctx.scale(multiplyFactor, multiplyFactor);
    loadingScreen.style.width = cvs.width + "px";
    loadingScreen.style.height = cvs.height + "px";
    starter.style.width = cvs.width + "px";
    starter.style.height = cvs.height + "px";
    awardScreen.style.width = cvs.width + "px";
    awardScreen.style.height = cvs.height + "px";

}

resizeStuff();




var gameIsOver = false;
var targetPos = {x: boxSize/2, y: boxSize/2};
var canPlay = false;

function gameOver(){
    if(won)
    return;
    playSfx(gameOverSound, 1);
    gameIsOver = true;
    spawnParticles(100, player.position.x, player.position.y, player.color);
    localStorage.setItem("HighScore", Math.max(score, localStorage.getItem("HighScore")));
    setTimeout(() => {
        
        gameOverScreen.classList.add("visible");
    }, 800);
    scoreFinal.textContent = `Score: ${score}`;
    highScoreFinal.textContent = `High Score: ${localStorage.getItem("HighScore")}`;
    score = -1;
    updateSoundsVolume();

}

var scoreNumberTextAlfa = 1;
function scoreNumberTextOnCanvasLifeCycle(){
    scoreNumberTextAlfa *= 0.95;
    if(scoreNumberTextAlfa > 0.1){
        setTimeout(() => {
            scoreNumberTextOnCanvasLifeCycle();
        }, 30);
    }
    else{
        scoreNumberTextAlfa = 0;
    }
}



function paintBoxes(direction, x, y){

    if(direction == "horizontal")
    var p = new paintedBoxes(0, y, boxSize, player.width, "rgba(40, 0, 10)");
    else if(direction == "vertical")
    var p = new paintedBoxes(x, 0, player.width, boxSize, "rgba(40, 0, 10)");
}

var paintedBoxesArray = [];
class paintedBoxes{
    constructor(x, y, width, height, color){
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = width;
        this.height = height;
        paintedBoxesArray.push(this);
        // setTimeout(() => {
        //     this.killMe();
        // }, 500);
    }

    killMe(){
        paintedBoxesArray.splice(paintedBoxesArray.indexOf(this));
    }

}

class food {

    //position = {x: 0, y: 0};

    constructor(foodX, foodY, foodType){
        this.foodType = foodType;
        this.color =  this.foodType == 0 ? "rgb(30, 200, 60)"
        :
        this.foodType == 1 ? "rgb(180, 230, 30)" : "rgb(13, 160, 167)";
        this.position = {x: 0, y: 0};
        this.strokeThickness = this.foodType;
        this.radius = 7;
        this.width = 14;
        this.height = 14;
        this.position.x = (foodX * player.width) + (player.width/2 - Math.floor(this.width/2));
        this.position.y = (foodY * player.height) + (player.height/2- Math.floor(this.height/2));
    }

    checkPlayerCollection(){
        if(!gameIsOver){

            if(Math.abs(this.position.x - player.position.x) < player.width 
            && Math.abs(this.position.y - player.position.y) < player.height ){
                //colidiu com o player!
                this.beCollected();
            }
        }
    }

    beCollected(){

        scoreNumberTextAlfa = 1;
        scoreNumberTextOnCanvasLifeCycle();
        if(this.foodType < 2){
        switch(player.angle){
            case 0:
            case Math.PI:
                paintBoxes("vertical", this.position.x, boxSize/2);
                break;
            default:
                paintBoxes("horizontal", boxSize/2, this.position.y);
                break;

        }
    }
    else{

        paintBoxes("horizontal", boxSize/2, this.position.y);
        paintBoxes("vertical", this.position.x, boxSize/2);
    }

        spawnParticles(15, this.position.x, this.position.y, this.color);
        updateSoundsVolume();
        //console.log("collected food");
        score++;
        shootNewBullet(this);
        player.shootingSpeed *= 1.04;
        spawnFood();
    }

}

var currentFood;

function spawnFood(){
    var foodType = 0;
    if(score >= 3)
    foodType = randomRange(0,2);
    if(score>=6)
    foodType = randomRange(0,3);

    currentFood = new food(randomRange(0, boxSize/player.width), randomRange(0, boxSize/player.height), foodType);

}

function randomRange(min, max){
    return Math.floor((Math.random() * max) + min); 
}

var player = {
    position: {x: boxSize/2 , y: boxSize/2 },
    angle: 1,
    shootingSpeed: 3,
    width: 14,
    height: 14,
    color: "rgb(91, 110, 225)"
}

var grid = {
    color: "rgba(30,30,30,1)",
    thickness: 1
}
function restartGame(){
    
            if(!gameIsOver)
            return;
    playSfx(replaySound, 1);
    particlesArray =[];
    paintedBoxesArray = [];

    gameOverScreen.classList.remove("visible");

   // boxSize-=player.width*2;
 cvs.width = boxSize * multiplyFactor;
 cvs.height = boxSize * multiplyFactor;
 player.position = {x: boxSize/2, y: boxSize/2},
 bullets = [];
 player.shootingSpeed = 4;
 currentFood = null;
 score = 0;
 gameIsOver = false;
 targetPos = {x: boxSize/2, y: boxSize/2};
 setup();

}

var moveInterval = null;
function handleKeyDown(e, fake){
    if(!canPlay)
        return;
    if(fake == undefined)
    fake = false;

    if(e.repeat){return;}


    switch(e.keyCode){

        case 37:
            if(player.angle == 3 * Math.PI / 2 && !fake){
                break;
            }
            targetPos.y = closestBox(player.position.y);
            currentDirection = "left";
    
            rotatePlayer("left");
            break;
        case 38:
            if(player.angle == 0 && !fake){
                break;
            }
            targetPos.x = closestBox(player.position.x);
            currentDirection = "up";
 
            rotatePlayer("up");
            break;
        case 39:
            if(player.angle == Math.PI / 2 && !fake){
                break;
            }
            targetPos.y = closestBox(player.position.y);
            currentDirection = "right";

            rotatePlayer("right");
            break;
        case 40:
            if(player.angle == Math.PI && !fake){
                break;
            }
            targetPos.x = closestBox(player.position.x);
            currentDirection = "down";
    
            rotatePlayer("down");
            break;
        case 82:
            restartGame();
            break;

    }

}

function shootSpecialBulletBiDirectional(food){
    var secondBulletAngle;
    switch(player.angle){
        case 0:
            secondBulletAngle = Math.PI;
            break;
        case Math.PI / 2:
            secondBulletAngle = 3 * Math.PI / 2;
            break;
        case Math.PI:
            secondBulletAngle = 0;
            break;
        case 3 * Math.PI / 2:
            secondBulletAngle = Math.PI / 2;
            break;

    }


    var bul1 = new bullet(food.position.x + player.width/2 - 6, 
        food.position.y + player.height/2 - 6, player.angle, player.shootingSpeed, 12, 12);
    var bul2 = new bullet(food.position.x + player.width/2 - 6, 
        food.position.y + player.height/2 - 6, secondBulletAngle, player.shootingSpeed, 12, 12);
   
    }

    function shootSpecialBulletAllDirections(food){
        var bul1 = new bullet(food.position.x + player.width/2 - 6, 
            food.position.y + player.height/2 - 6, 0, player.shootingSpeed, 12, 12);
        var bul2 = new bullet(food.position.x + player.width/2 - 6, 
            food.position.y + player.height/2 - 6, Math.PI / 2, player.shootingSpeed, 12, 12);
        var bul3 = new bullet(food.position.x + player.width/2 - 6, 
            food.position.y + player.height/2 - 6, Math.PI, player.shootingSpeed, 12, 12);
        var bul4 = new bullet(food.position.x + player.width/2 - 6, 
            food.position.y + player.height/2 - 6, 3 * Math.PI / 2, player.shootingSpeed, 12, 12);
        }

function changeTargetPos(x, y) {  

    switch(currentDirection){
        case "up": 
        if(player.position.y == targetPos.y)
        targetPos.y = targetPos.y + (y * player.height);
        break;
    case "right": 
        if(player.position.x == targetPos.x)
        targetPos.x = targetPos.x + (x * player.width);   
        break;
    case "down": 
    if(player.position.y == targetPos.y)
    targetPos.y = targetPos.y + y * (player.height);
        break;
    case "left":    
    if(player.position.x == targetPos.x)
    targetPos.x = targetPos.x + x * (player.width);   
        break;
    }
 
}

function closestBox(playerValue){

var valueToReturn;
var toSum;
playerValue % 14 > 7 ? toSum = 1 : toSum = 0;
valueToReturn = (Math.floor(playerValue / 14) + toSum) * 14;
return valueToReturn;

}

function rotatePlayer(dir){
    switch(dir){
    case "up": 
        player.angle = 0;
        break;
    case "right": 
        player.angle = Math.PI / 2;
        break;
    case "down": 
        player.angle = Math.PI;
        break;
    case "left":    
        player.angle = 3 * Math.PI / 2;
        break;
    default: 
        player.angle = 0;
        break;
    }
}

function movePlayer(){

    if(player.position.x >= boxSize){
        player.position.x = -player.width;
        targetPos.x = player.position.x + player.width;
    }

    else if(player.position.x <= -player.width){
        player.position.x = boxSize;
        targetPos.x = player.position.x - player.width;
    }

    else if(player.position.y >= boxSize){
        player.position.y = 0;
        targetPos.y = player.position.y;

    }

    else if(player.position.y <= -player.height){
        player.position.y = boxSize;
        targetPos.y = player.position.y - player.height;

    }

    if(player.position.x > targetPos.x){
        player.position.x -= 2;
        
    }
    if(player.position.x < targetPos.x){
        player.position.x += 2;

    }
    if(player.position.y > targetPos.y){
        player.position.y -= 2;
    }

    if(player.position.y < targetPos.y){
        player.position.y += 2;
    }
}

class bullet { 


    constructor(posX,posY,angle,speed,width,height){
        this.position = {x: posX, y:posY};
        this.canKill = false;
        this.color = "rgb(200, 30, 60)";
        this.angle = angle;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.canReturn = true;
        this.addBulletToArray();
        setTimeout(() => {
            this.canKill = true;
        }, 500);
    }

    addBulletToArray(){
        bullets.push(this);
    }

    killBullet(){
        bullets.splice(bullets.indexOf(this), 1);
    }

    checkPlayerDeath(){
        if(!this.canKill || gameIsOver || won)
            return;

        if(boxesCollide(this, player)){
            this.killBullet();
            spawnParticles(50, this.position.x, this.position.y, this.color);
            gameOver();
        }
    }

    moveMe(){
        this.checkPlayerDeath();
        var dirToGo = {x:0, y:0};
        switch(this.angle){
            case 0:
                dirToGo = {x: 0, y: -1}
                break;
            case Math.PI / 2:
                dirToGo = {x: 1, y: 0}
                break;
            case Math.PI:
                dirToGo = {x: 0, y: 1}
                break;
            case 3 * Math.PI / 2:
                dirToGo = {x: -1, y: 0}
                break;

        }

        if(gameIsOver | won)
        return;

        this.position.x += dirToGo.x * this.speed;
        this.position.y += dirToGo.y * this.speed;
    }

    handleMyBorderCollision(){


        if(this.position.x > boxSize){

            if(!this.canReturn){
                this.killBullet();
                return;
            }

            this.position.x = 0;
        }

        else if(this.position.x < 0){
            if(!this.canReturn){
                this.killBullet();
                return;
            }
            this.position.x = boxSize;
        }

        else if(this.position.y > boxSize){
            if(!this.canReturn){
                this.killBullet();
                return;
            }
            this.position.y = 0;
        }

        else if(this.position.y < 0){
            if(!this.canReturn){
                this.killBullet();
                return;
            }
            this.position.y = boxSize;
        }
        

    }

}


function shootNewBullet(food){
    if(food.foodType == 1){
        shootSpecialBulletBiDirectional(food);
        playSfx(food2sound, 1);
        return;
    }
    if(food.foodType == 2){
        shootSpecialBulletAllDirections(food);
        playSfx(food3sound, 1);

        return;
    }
    playSfx(food1sound, 1);

    var bul = new bullet(food.position.x + player.width/2 - 6, 
        food.position.y + player.height/2 - 6, player.angle, player.shootingSpeed, 12, 12);

}

var bullets = [];

var updateId, delta = 16,
    previousDelta = 0


function update(currentDelta){


    
        
        delta = currentDelta - previousDelta;

        
    if(won)
    return;
        
   updateParticles();
   
bullets.forEach(b => {
    b.moveMe();
    b.handleMyBorderCollision();
});

currentFood.checkPlayerCollection();

var dir = {x: 0, y: 0};
switch(currentDirection){
    case "up":
        dir = {x: 0, y: -1};
        break;
    case "down":
        dir = {x: 0, y: 1};
        break;
    case "right":
        dir = {x: 1, y: 0};
        break;
    case "left":
        dir = {x: -1, y: 0};
        break;
    
}

changeTargetPos(dir.x, dir.y)
movePlayer();



draw();
previousDelta = currentDelta;

updateId = requestAnimationFrame(update);


}



function draw(){

ctx.imageSmoothingEnabled = false;


//clear everything
ctx.clearRect(0,0,boxSize,boxSize);
    
//draw background
ctx.fillStyle = "rgb(5,5,5)";
ctx.fillRect(0,0,boxSize,boxSize);


//draw painted boxes
paintedBoxesArray.forEach(pb => {

    ctx.fillStyle = pb.color;
    ctx.fillRect(pb.x,pb.y,pb.width, pb.height);  
    
});



//draw grid
ctx.strokeStyle = grid.color;
if(scoreNumberTextAlfa > 0.5 && score > 0)
    ctx.strokeStyle = "rgba(50, 50, 50, " + Math.max(scoreNumberTextAlfa, 0.5) + ")";
ctx.strokeWidth = grid.thickness;
for(let i=0; i < boxSize/player.width; i++){
    for(let j=0; j < boxSize/player.height; j++){

        ctx.strokeRect(i*player.width, j*player.height, player.width, player.height);
        
    }
}



var charImage = new Image();
charImage.src= "./images/char2.png";
var bulletImage = new Image();
bulletImage.src= "./images/bullet.png";
var food0Image = new Image();
food0Image.src = "./images/food0.png"
var food1Image = new Image();
food1Image.src = "./images/food1.png"
var food2Image = new Image();
food2Image.src = "./images/food2.png"

foodImages = [food0Image, food1Image, food2Image];



//draw food
ctx.strokeStyle = "white";
ctx.strokeWidth = currentFood.strokeThickness;
ctx.fillStyle = currentFood.color;
ctx.drawImage(foodImages[currentFood.foodType], currentFood.position.x, currentFood.position.y);


if(!gameIsOver){
ctx.save(); // save current state
//ctImage(playerImg, player.position.x, player.position.y, player.width, player.height);
ctx.fillStyle = /*player.color;*/ "white";
//ctx.filte certo!
ctx.drawImage(charImage, charSprite().sx, charSprite().sy, 14, 14, /*aqui as coords de cada sprite no atlas da image */
    player.position.x, player.position.y, player.width, player.height /* aqui as coords de desenhar no canvas*/)
ctx.restore(); // restore original states (no rotation etc)
}


drawParticles();





bullets.forEach(b => {
    ctx.save(); 
    ctx.fillStyle = b.color;

    
    ctx.drawImage(bulletImage, b.position.x, b.position.y);
    ctx.restore(); 
});


//draw text of collection with score on canvas
if(scoreNumberTextAlfa > 0 && score > 0){
    ctx.font = (20 * scoreNumberTextAlfa) + "px Verdana";
    ctx.fillStyle = "rgba(255, 255, 255, " + scoreNumberTextAlfa + ")"
    ctx.fillText(score + "", player.position.x + 2, player.position.y - 30);
}




}

function boxesCollide(rect1, rect2){
    return (rect1.position.x < rect2.position.x + rect2.width &&
        rect1.position.x + rect1.width > rect2.position.x &&
        rect1.position.y < rect2.position.y + rect2.height &&
        rect1.position.y + rect1.height > rect2.position.y);

}


function setup(){
    resizeStuff();
    spawnFood();
    
}

var won = false;

function youWon(){
    localStorage.setItem("HighScore", 20);
    playSfx(wonSound, 1);
    won = true;
    cvs.classList.add("invisible");
    gameOverScreen.classList.add("invisible");
    awardScreen.classList.remove("invisible");
}

function startEverything(){
    loadingScreen.classList.add("invisible");

    starter.classList.remove("invisible");

}

function startGame(){
    
    document.getElementById("content").classList.remove("invisible");
    setup();
    playSfx(replaySound, 1);
    startPlayingMusic();
    update(0);
    canPlay = true;

}



function charSprite(){
        if (player.position.x > currentFood.position.x){
                //olhar pra esquerda
            if(player.position.y > currentFood.position.y){
                //olhar pra cima e pra esquerda
                sx = 28;
                sy = 0;
                fx = 42;
                fy = 14;
            }
            else{
                //olhar pra baixo e pra esquerda
                sx = 14;
                sy = 0;
                fx = 28;
                fy = 14;
            }
        }

            else{
                //olhar pra direita
            if(player.position.y > currentFood.position.y){
                //olhar pra cima e pra direita
                sx = 42;
                sy = 0;
                fx = 56;
                fy = 14;
            }
            else{
                //olhar pra baixo e pra direita
                sx = 0;
                sy = 0;
                fx = 14;
                fy = 14;
            }
    }


var sx, sy, fx, fy;
return {sx, sy, fx, fy};


}




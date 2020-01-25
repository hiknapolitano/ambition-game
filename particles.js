var particlesArray = [];




class particle {

    constructor(x, y, color, sizeFactor){
        this.x = x;
        this.y = y;
        this.sizeFactor = sizeFactor || 1;
        this.size = randomRange(3, 10) * this.sizeFactor;
        this.speedX = randomRange(1, 3);
        this.speedY = randomRange(1, 3);
        this.color = color;
        particlesArray.push(this);
        setTimeout(() => {
            this.destroyParticle()
        }, 1000 * this.sizeFactor);
    }

    destroyParticle(){
        particlesArray.splice(particlesArray.indexOf(this), 1);
    }


}



function spawnParticles(amount, x, y, color, sizeFactor){

    for (let i = 0; i < amount; i++) {
        var newParticle = new particle(x, y, color, sizeFactor);
    }


}

function updateParticles(){
    if(gameIsOver || particlesArray.length > 0){
        particlesArray.forEach(p => {

            if(randomRange(0, 2) == 0)
            p.speedX *= -1;
            if(randomRange(0, 2) == 0)
            p.speedY *= -1;
            
            p.x += p.speedX;
            p.y += p.speedY;
            p.size *= 0.95;
        });
    }
}


function drawParticles(){
    
    if(gameIsOver || particlesArray.length > 0){
        particlesArray.forEach(p => {
            
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
    }
}












//var deathSound = new Audio("./sounds/death.ogg");
//var food0Sound = new Audio("./sounds/food0.ogg");
var canStartAudio = true;
var musicFilesArray = [];
var score = 0;

var food1sound = new Audio("./sounds/sfx--02.ogg");  
var food2sound = new Audio("./sounds/sfx--03.ogg");  
var food3sound = new Audio("./sounds/sfx--06.ogg");  
var gameOverSound = new Audio("./sounds/sfx--10.ogg");
var replaySound =   new Audio("./sounds/sfx--07.ogg");
var wonSound =  new Audio("./sounds/sfx--09.ogg");

var srcNodes = [];
//var music = new Audio("./sounds/music.mp3");


function playSound(sound, volume){
    sound.volume = volume;
    sound.play();
}

function updateSoundsVolume(){

    gainNodesArray.sort(function(a, b) {
        return a.index - b.index;
    });

    if(score + 1 >= gainNodesArray.length - 1 && score + 1 == 20){
        youWon();
        
        for (let i = 0; i < gainNodesArray.length; i++) {
        gainNodesArray[i].node.gain.setValueAtTime(0, actx.currentTime);
        }
        gainNodesArray[gainNodesArray.length-1].node.gain.setValueAtTime(0.33, actx.currentTime);

        return;
    }

for (let i = 0; i < gainNodesArray.length; i++) {
    if(gainNodesArray[i].index>score+1)
   gainNodesArray[i].node.gain.setValueAtTime(0, actx.currentTime);
    else
   gainNodesArray[i].node.gain.setValueAtTime(0.3, actx.currentTime);

}

}

var actx;


var gainNodesArray = [];
var when;
function loadSounds(e){

    if(!canStartAudio)
    return;

    canStartAudio = false;
    actx = new (AudioContext || webkitAudioContext)();
    
    for(let i=0; i< 21; i++){


        var src = ("./sounds/music/"+ (1+i) + ".mp3"),
            audioData, srcNode;  // global so we can access them from handlers
            
        // Load some audio (CORS need to be allowed or we won't be able to decode the data)
        fetch(src, {mode: "cors"}).then(function(resp) {return resp.arrayBuffer()}).then(decode);
        
        // Decode the audio file, then start the show
        function decode(buffer) {
        actx.decodeAudioData(buffer, playLoop);
        
    }
    
   
    // Sets up a new source node as needed as stopping will render current invalid
    function playLoop(abuffer) {
        
        if (!audioData) audioData = abuffer;  // create a reference for control buttons
        srcNode = actx.createBufferSource();  // create audio source
        var gainNode = actx.createGain();
        srcNode.connect(gainNode);
        if(!gainNodesArray.includes(gainNode))
            gainNodesArray.push({node: gainNode, index: i});
        if(i>0)
            gainNode.gain.setValueAtTime(0, actx.currentTime)
        else
            gainNode.gain.setValueAtTime(0.3, actx.currentTime)

        srcNode.buffer = abuffer;             // use decoded buffer
        gainNode.connect(actx.destination);    // create output
        srcNode.loop = true;
        srcNodes.push(srcNode);
        if(srcNodes.length >= 21)
        startEverything();        
        }
    }

        updateSoundsVolume();

}


function startPlayingMusic(){
    srcNodes.forEach(s => {
        s.start(0);
    });
}






function playSfx(which, volume){
    which.volume = volume;
    which.play()
}

window.onload = () => {
   loadSounds();

};

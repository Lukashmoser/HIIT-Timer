let numSets = 6; // number of sets
let highDuration = 30; // duration of high intensity period
let restDuration = 30; // duration of rest/ low intensity period
let warmup = false; // boolean as to whether or not to include warmup
let cooldown = false; // boolean as to whether or not to include cooldown
let originalHTML = []; // array that stores orginal html of each set
let settings = []; // store settings
let currentIntervalCounter = 0; // used to countdown current interval
let currentInterval = 0; // interval currently in use
let totalTime = 0;  // sum of all times
let savedTime = 0;
let time = []; // sequence of times to be counted down in correct order
let countDownTimerVariable;
let exercises = [];
let setsRun = 1;
let exerciseNum = 0;
let currentPhase;


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}

//initialize your timer section
window.onload = applySettings;

function show(id){
    document.getElementById(id).style.display = "block";
}

function hide(id){
    document.getElementById(id).style.display = "none";
}

function toggle(type, action){
    if(type == 'warmup'){
        if(action == 'on'){
            warmup = true;
        }
        if(action == 'off'){
            warmup = false;
        }
    }
    if(type == 'cooldown'){
        if(action == 'on'){
            cooldown = true;
        }
        if(action == 'off'){
            cooldown = false;
        }
    }
}

function applySettings(){
    //if warmup is chosen add warmup and display else don't display
    if(warmup){
        document.getElementById("current-warmup").style.display = "block";
        document.getElementById("warmup-time").innerHTML = document.getElementById("duration-warmup").value + "s";
    } else {
        document.getElementById("current-warmup").style.display = "none";
    }

    //if cooldown is chosen add cooldown and display else don't display
    if(cooldown){
        document.getElementById("current-cooldown").style.display = "block";
        document.getElementById("cooldown-time").innerHTML = document.getElementById("duration-cooldown").value + "s";
    } else {
        document.getElementById("current-cooldown").style.display = "none";
    }

    //clear previous sets and get input values
    document.getElementById("current-sets").innerHTML = "";
    numSets = document.getElementById("num-sets").value;
    highDuration = document.getElementById("duration-high").value;
    restDuration = document.getElementById("duration-rest").value;

    //for each set get its duration of high intensiy and rest then display
    for(let i = 0; i < numSets; i++){
        document.getElementById("current-sets").innerHTML += 
        "<div class='set' id='set" + (i+1) + "'><h2 class='options'>Exercise " + (i+1) + " <button class='button2' onclick='editSet(" + (i+1) + ")'>Edit</button></h2><p class='durations' id='contentSet" + (i+1) + "'>Exercise : <span id='name" + (i+1) + "'>Running</span><br>High Intensity Duration : <span id='highDuration" + (i+1) + "'>" + highDuration + "</span>s<br>Low Intensity/Rest Duration : <span id='restDuration" + (i+1) + "'>" + restDuration + "</span>s</p></div>";
    }

    updateSettings();
    updateTimer();
}

function editSet(set){
    let contentSet = "contentSet" + set;
    let location = document.getElementById(contentSet);
    originalHTML[set] = location.innerHTML;

    location.innerHTML = "Exercise Type<br><input class='input' type='text' min='1' id='editName" + set + "'><br>High Intensity Duration<br><input class='input' type='number' min='1' id='editHigh" + set + "' value='30'><br>Low Intensity/Rest Duration<br><input class='input' type='number' min='1' id='editLow" + set + "' value='30'><br><button class='button' onclick='save(" + set + ")'>Save</button>  <button class='button' onclick='cancel("+ set +")'>Cancel</button>";
}

function save(setNum){
    let id = "contentSet" + setNum;
    let newNameID = "editName" + setNum;
    let newHighID = "editHigh" + setNum;
    let newLowID = "editLow" + setNum;
    let newName = document.getElementById(newNameID).value;
    let newHigh = document.getElementById(newHighID).value;
    let newLow = document.getElementById(newLowID).value;
    document.getElementById(id).innerHTML = "Exercise : <span id='name" + setNum + "'>" + newName + "</span><br>High Intensity Duration : <span id='highDuration" + setNum + "'>" + newHigh + "</span>s<br>Low Intensity/Rest Duration : <span id='restDuration" + setNum + "'>" + newLow + "</span>s";

    updateSettings();
    updateTimer();
}

function cancel(setNum){
    let id = "contentSet" + setNum;
    document.getElementById(id).innerHTML = originalHTML[setNum];
}

function updateSettings(){
    //reset settings
    settings = [];

    // get num sets
    settings.numSets = document.getElementById("num-repeats").value;
    if(warmup){
        settings.warmup = document.getElementById("duration-warmup").value;
    } else {
        settings.warmup = "none";
    }

    if(cooldown){
        settings.cooldown = document.getElementById("duration-cooldown").value;
    } else {
        settings.cooldown = "none";
    }
    // get each exercise
    for(let i = 0; i < document.getElementById("num-sets").value; i++){
        let info = {exercise: document.getElementById("name" + (i+1)).innerHTML, highDuration: document.getElementById("highDuration" + (i+1)).innerHTML, restDuration: document.getElementById("restDuration" + (i+1)).innerHTML};
        settings[i] = info;
    }
    console.log(settings);
}

function updateTimer(){
    if(warmup){
        document.getElementById("exercise").innerHTML = "Warmup";
        document.getElementById("countdown-time").innerHTML = settings.warmup;
    } else {
        document.getElementById("exercise").innerHTML = settings[0].exercise;
        document.getElementById("countdown-time").innerHTML = settings[0].highDuration;
    }

    document.getElementById("set").innerHTML = "Set 1 / " + settings.numSets;
    document.getElementById("exercise-num").innerHTML = "Exercise 1 / " + settings.length;
}

function startTimer(){
    // change start button to pause button
    document.getElementById("start-stop").innerHTML = "<button class='button3' onclick='pauseTimer()'>Pause <i class='fas fa-pause'></i></button>";
    let j = 0;
    for(let i = 0; i < settings.length; i++){
        totalTime += parseInt(settings[i].highDuration);
        totalTime += parseInt(settings[i].restDuration);
        time[j] = settings[i].highDuration;
        time[(j+1)] = settings[i].restDuration;
        exercises[j] = settings[i].exercise;
        exercises[(j+1)] = "Rest";
        j += 2;
    }
    savedTime = totalTime;

    currentInterval = 0;
    if(warmup){
        currentPhase = "warmup";
        currentIntervalCounter = settings.warmup;
        countDownTimerVariable = setInterval(warmLoop, 1000);
        exerciseNum = 0;
    } else {
        currentPhase = "main";
        currentIntervalCounter = time[currentInterval];
        countDownTimerVariable = setInterval(timerLoop, 1000);
        exerciseNum = 1;
    }
}

function warmLoop(){
    currentIntervalCounter--;
   
    // move forward 1 interval
    if (currentIntervalCounter <= 0) {
          currentInterval = -1;
    }
    document.getElementById("countdown-time").innerHTML = currentIntervalCounter;

    if (currentInterval == -1) {
        clearInterval(countDownTimerVariable);
        currentPhase = "main";
        countDownTimerVariable = setInterval(timerLoop, 1000);
    }
}

function timerLoop(){
    currentIntervalCounter--;
   
    // move forward 1 interval
    if (currentIntervalCounter <= 0) {
        currentInterval++;
	    if (currentInterval < time.length) {
	        currentIntervalCounter = time[currentInterval];
            document.getElementById("exercise").innerHTML = exercises[currentInterval];
            if(exercises[currentInterval] != "Rest"){
                exerciseNum++;
                document.getElementById("exercise-num").innerHTML = "Exercise " + exerciseNum + " / " + settings.length;
            }
	    } else {
	        currentInterval = -1;
	    }
    }
    document.getElementById("countdown-time").innerHTML = currentIntervalCounter;
    totalTime--;
   
    if (totalTime <= 0 || currentInterval == -1) {
        clearInterval(countDownTimerVariable);
        if(setsRun < parseInt(settings.numSets)){
            exerciseNum = 1;
            document.getElementById("exercise").innerHTML = exercises[0];
            document.getElementById("exercise-num").innerHTML = "Exercise 1 / " + settings.length;
            document.getElementById("set").innerHTML = "Set " + (setsRun + 1) + " / " + settings.numSets;
            setsRun++;
            currentInterval = 0;
            currentIntervalCounter = time[currentInterval];
            totalTime = savedTime;
            countDownTimerVariable = setInterval(timerLoop, 1000);
        } else {
            if(cooldown){
                currentPhase = "cooldown";
                document.getElementById("exercise").innerHTML = "Cooldown";
                currentInterval = 0;
                currentIntervalCounter = settings.cooldown;
                countDownTimerVariable = setInterval(coolLoop, 1000);
            } else {
                endTimer();
            }
        }
    }
}

function coolLoop(){
    currentIntervalCounter--;
   
    // move forward 1 interval
    if (currentIntervalCounter <= 0) {
        currentInterval = -1;
    }
    document.getElementById("countdown-time").innerHTML = currentIntervalCounter;

    if (currentInterval == -1) {
        clearInterval(countDownTimerVariable);
        endTimer();
    }
}

function pauseTimer(){
    // change pause button to start play button
    document.getElementById("start-stop").innerHTML = "<button class='button3' onclick='continueTimer()'>Play <i class='fas fa-play'></i></button>";
    clearInterval(countDownTimerVariable);
}

function continueTimer(){
    // change playe button to pause button
    document.getElementById("start-stop").innerHTML = "<button class='button3' onclick='pauseTimer()'>Pause <i class='fas fa-pause'></i></button>";
    if(currentPhase == "main"){
        countDownTimerVariable = setInterval(timerLoop, 1000);
    }
    if(currentPhase == "warmup"){
        countDownTimerVariable = setInterval(warmLoop, 1000);
    }
    if(currentPhase == "cooldown"){
        countDownTimerVariable = setInterval(coolLoop, 1000);
    }
    
}

function resetTimer(){
    clearInterval(countDownTimerVariable);
    currentInterval = 0;
    setsRun = 1;
    exerciseNum = 0;
    currentIntervalCounter = 0;
    updateTimer();
    document.getElementById("start-stop").innerHTML = "<button class='button3' onclick='startTimer()'>Start <i class='fas fa-play'></i></button>";
}

function endTimer(){
    document.getElementById("exercise").innerHTML = "End Of Timer";
}
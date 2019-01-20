//--------------------VARIABLES--------------------\\

//VISUAL MAZE:
var canv;
var canv2;
var pg;
var pg2;

var fieldsize = 40;
var fieldxdimension = fieldsize * xcolumn;
var fieldydimension = fieldsize * yrow;
var distance = 150; //Abstand zwischen den Graphics
var offset = fieldxdimension + distance; //Offsets des 2. Maze nach Ende des 1.

//INTERN MAZES
var field = [];                         //1. Labyrinth Array
var field2 = [];                        //2. Labyrinth Array
var chooseField = [];                   //Wählbares Labyrinth Array
var wsk = 0.3;
var rnd = [true, true, true, false, false, false, false, false, false, false];
var xcolumn = 10;
var yrow = 10;
var units = yrow * xcolumn;
var xstart = 1;
var ystart = 1;
var startfield = xstart * ystart + ((xcolumn - xstart) * (ystart -1)); //Arraynummer des Startes
var xgoal = 10;
var ygoal = 10;
var goalfield = xgoal * ygoal + ((xcolumn - xgoal) * (ygoal -1)); //Arraynummer des Ziels


//WALKER
var walker = new Walker(startfield);    //Labyrinthgänger des 1. Labyrinthes
var walker2 = new Walker(startfield);   //Labyrinthgänger des 2. Labyrinthes
var smartMode = true;
var firmWaitingTime = 100;                //feste Wartezeit des Labyrinthgängers
var waitingTime = firmWaitingTime;      //aktuelle Wartezeit des Labyrinthgängers
var showTrace = true;                   //Bool für Anzeige der Anzahl der Besuche eines Feldes

//STATISTICS
var steps = [0, 0, 0, 0];               //aktuelle Steps, rechte Hand, linke Hand, least Visited
var steps2 = [0];                        //aktuelle Steps des rechten Arrays
var visitedCount = [[units - 1, 1], [units - 1, 1], [units - 1, 1], [units - 1, 1]];     //Anzahl der Felder mit 0, 1, 2... besuchen: aktuell, rechts, links, least
var visitedCount2 = [[units - 1, 1]];
var wWorker; //Web Worker
var time = 0;
var time1 = time;
var time2 = time;

//GENERATION
var mode = "rightHand";                 //Mode des 1. Labyrinths
var mode2 = "user";                     //Mode des 2. Labyrinths
var genMode = "gen";
var timeOutArrayGenReady = false;
var timeOutStop;
var changedValues = false;

//SOLVING
var solverRunning = false;
var mazeFinished = false;
var mazeFinished2 = false;

//--------------------VARIABLES--------------------\\





//--------------------FUNCTIONS--------------------\\

/*
 * setup: p5 Funktion welche zur Initialisierung aufgerufen wird
 *
*/
function setup() {
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  fieldsize = Math.round((0.9 * w - distance) / 2 / xcolumn);
  if (fieldsize > Math.round((0.7 * h - 5) / yrow)) {
    fieldsize = Math.round((0.7 * h - 5) / yrow);
  }

  units = yrow * xcolumn;
  goalfield = xgoal * ygoal + ((xcolumn - xgoal) * (ygoal - 1));
  startfield = xstart * ystart + ((xcolumn - xstart) * (ystart -1));
  walker = new Walker(startfield);
  walker2 = new Walker(startfield);
  waitingTime = firmWaitingTime;

  fieldxdimension = fieldsize * xcolumn;
  fieldydimension = fieldsize * yrow;
  offset = fieldxdimension + distance;
  resetStatistics();

  canv = createCanvas(2 * fieldxdimension + distance, fieldydimension);
  canv.parent("maze-container");
  canv.id("mazeId");

  pg = createGraphics(fieldxdimension, fieldydimension);
  pg2 = createGraphics(fieldxdimension, fieldydimension);
  pg2.position(offset, 0);
  
  if (genMode == "self") {
    if (changedValues){
        createChooseMaze("rand");
        changedValues = false;
    }
    field = copyField(chooseField);
  } else {
    field = generatorSupervisor(fieldsize, yrow, xcolumn, goalfield, genMode, rnd);
  }
  
  if (genMode != "gen"){
    field2 = copyField(field);
    resetGenButton();
  }
}

/*
 * Callback Funktion für asynchrone Generierung
 *
 * @params localField Fields
 *
*/
function generatingFieldReady(localField) {
  field = copyField(localField);
  timeOutArrayGenReady = true;
  createChooseMaze("copy");
  resetGenButton();
  if (genMode == "self") {
    field = copyField(chooseField);
  }
}

/*
 * Erstellt Kopie von einem Array aus Fields
 *
 * @params outarr Fields[]
 * @return inarr Fields[]
 *
*/
function copyField(outarr){
  var inarr = [];
  for (var i = 0; i < outarr.length; i++) {
      inarr[i] = new Fields(outarr[i].north, outarr[i].east, outarr[i].south, outarr[i].west, outarr[i].p1, outarr[i].p2, outarr[i].title)
    }
  return inarr;
}

/*
 * DOM Manipulation für das Selbstgewählte Labyrinthlayout
 * preSetup definiert dabei das Ausgangslabyrinth
 *
 * @params preSetup String
 * 
*/
//(parseInt($('#xInputGoal').val()) * parseInt($('#yInputGoal').val()) + ((parseInt($('#widthInput').val()) - parseInt($('#xInputGoal').val())) * (parseInt($('#yInputGoal').val()) - 1)))
//($('#xInputStart').val() * $('#yInputStart').val() + (($('#widthInput').val() - $('#xInputStart').val()) * ($('#yInputStart').val() - 1)))
function createChooseMaze(preSetup, localYrow = parseInt($("#heightInput").val()), localXcolumn = parseInt($("#widthInput").val()), localRnd = parseInt($("#wskrange").val()), localStartfield = ($('#xInputStart').val() * $('#yInputStart').val() + (($('#widthInput').val() - $('#xInputStart').val()) * ($('#yInputStart').val() - 1))), localGoalfield = (parseInt($('#xInputGoal').val()) * parseInt($('#yInputGoal').val()) + ((parseInt($('#widthInput').val()) - parseInt($('#xInputGoal').val())) * (parseInt($('#yInputGoal').val()) - 1)))) {
  localFieldsize = fieldsize;
  var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  localFieldsize = Math.round((0.9 * w - distance) / 2 / localXcolumn);
  if (localFieldsize > Math.round((0.7 * h - 5) / localYrow)) {
    localFieldsize = Math.round((0.7 * h - 5) / localYrow);
  }

  if (typeof(localRnd) == "number") {
    localRnd = genRandArray(localRnd);
  }
  switch (preSetup) {
    case "copy": chooseField = copyField(field);
    break;
    case "rand": chooseField = generatorSupervisor(localFieldsize, localYrow, localXcolumn, localGoalfield, "random", localRnd);
    break;
    case "fill": chooseField = generatorSupervisor(localFieldsize, localYrow, localXcolumn, localGoalfield, "random", [true]);
    break;
    case "clear": chooseField = generatorSupervisor(localFieldsize, localYrow, localXcolumn, localGoalfield, "random", [false]);
    break;
  }

  var chooseMazeDiv = document.getElementById("choosemaze");
  chooseMazeDiv.innerHTML = "";
  var newTable = document.createElement("table");
  newTable.classList.add("boderSpacing");
  //newTable.id = "boderSpacingId";
  chooseMazeDiv.appendChild(newTable);

  var index = 0;
  for (var i = 0; i < localYrow; i++) {
    var newRow = document.createElement("tr");
    newTable.appendChild(newRow);
    for (var j = 0; j < localXcolumn; j++) {
      var newCol = document.createElement("td");
      newCol.id = "boderSpacingId";
      if (index == localStartfield - 1){
        newCol.classList.add("startField");
      }
      if (index == localGoalfield - 1){
        newCol.classList.add("goalField");
      }
      newRow.appendChild(newCol);
      var newHorButton = document.createElement("div");
      if (i < localYrow - 1) {
        newHorButton.classList.add("mazeButton");
        newHorButton.classList.add("horizontalButton");
      } else {
        newHorButton.classList.add("placeholderButton");
      }

      newHorButton.setAttribute("id", String(index + localXcolumn));
      if (chooseField[parseInt(newHorButton.id) - localXcolumn].south || chooseField[parseInt(newHorButton.id)].north) {
        newHorButton.classList.add("buttonChoosen");
      }
      
      newHorButton.onclick = function() {
        if (chooseField[parseInt(this.id) - localXcolumn].south || chooseField[parseInt(this.id)].north) {
          this.classList.remove("buttonChoosen");
          chooseField[parseInt(this.id) - localXcolumn].south = false;
          chooseField[parseInt(this.id)].north = false;
        } else {
          this.classList.add("buttonChoosen");
          chooseField[parseInt(this.id) - localXcolumn].south = true;
          chooseField[parseInt(this.id)].north = true;
        }
      }
      newCol.appendChild(newHorButton);

      if (j < localXcolumn - 1) {
        var newCol2 = document.createElement("td");
        newRow.appendChild(newCol2);
        var newVertButton = document.createElement("div");
        newVertButton.classList.add("mazeButton");
        newVertButton.classList.add("verticalButton");
        newVertButton.setAttribute("id", String(index));

        if (chooseField[parseInt(newVertButton.id)].east || chooseField[parseInt(newVertButton.id) + 1].west) {
          newVertButton.classList.add("buttonChoosen");
        }
        newVertButton.onclick = function() {
          if (chooseField[parseInt(this.id)].east || chooseField[parseInt(this.id) + 1].west) {
            this.classList.remove("buttonChoosen");
            chooseField[parseInt(this.id)].east = false;
            chooseField[parseInt(this.id) + 1].west = false;
          } else {
            this.classList.add("buttonChoosen");
            chooseField[parseInt(this.id)].east = true;
            chooseField[parseInt(this.id) + 1].west = true;
          }
        }
        newCol2.appendChild(newVertButton);
      }
      index++;
    }
  }
}

/*
 * Holen der Modes aus dem Selekt
 * Löschen des Fortschritts der Läufer
 * 
*/
function setSettings() {
  //Holen der Modes aus dem Selekt
  setDropBoxesDisabled(false);
  document.getElementById("startbutton").disabled = false;
  document.getElementById("restartbutton").disabled = true;
  mode = document.getElementById('dropbox1').value;
  mode2 = document.getElementById('dropbox2').value;
  solverRunning = false;

  //Löschen des Fortschritts der Läufer
  if (field.length == units) {
    field = clearTrace(field, walker)[0];
    walker = clearTrace(field, walker)[1];
    field2 = clearTrace(field2, walker2)[0];
    walker2 = clearTrace(field2, walker2)[1];
  }
  resetStatistics();
  document.getElementById("startbutton").innerHTML = "Start!";
}

/*
 * Löschen der Spur des Walkers und setzt ihn auf das Startfeld
 *
 * @return [Field[], Walker]
 * 
*/
function clearTrace(localField, localWalker) {
  solverRunning = false;
  localWalker = new Walker(startfield);
  for (var i = 0; i < units; i++) {
    localField[i].visited = 0;
  }
  return [localField, localWalker];
}

/*
 * Holen der Einstellungen für das MAZE aus dem Modal
 * 
*/
function setMazeSettings(){
  if ($('#genbutton').val() == "Abbrechen") {
    clearTimeout(timeOutStop);
    resetGenButton();
  } else {

    setLocalStorage(); //setzt localStorage @ backend.js

    setSettings();
    $('#genbutton').val("Abbrechen");
    $("#dcircle").css("display","flex");

    //MAZE
    yrow = parseInt(document.getElementById('heightInput').value);
    xcolumn = parseInt(document.getElementById('widthInput').value);
    ystart = parseInt(document.getElementById('yInputStart').value);
    xstart = parseInt(document.getElementById('xInputStart').value);
    ygoal = parseInt(document.getElementById('yInputGoal').value);
    xgoal = parseInt(document.getElementById('xInputGoal').value);

    wsk = Math.round((1 - sqrt(1 - (parseInt(document.getElementById('wskrange').value) / 100)))*100);
    rnd = genRandArray(wsk);

    //WALKER
    setRunnerSettings();

    //GENERATION
    genMode = $("input[name='methode']:checked").val();
    setup();
  }
}


/*
 * Generiert ein Array mit WSK*TRUE und (100-WSK)*FALSE 
 *
 * @param wsk int
 * @return Array[boolean]
 * 
*/
function genRandArray(wsk) {
  localRnd = [];
  for (var i = 0; i < 100; i++){
    if (i < wsk){
      localRnd.push(true);
    } else {
      localRnd.push(false);
    }
  }
  return localRnd;
}

/*
 * Holen der Einstellungen für den WALKER aus dem Modal
 * 
*/
function setRunnerSettings() {
    firmWaitingTime = 1000 / parseFloat(document.getElementById('stepsPerSecond').value);
    waitingTime = firmWaitingTime;
    showTrace = document.getElementById('line').checked;
    smartMode = document.getElementById('smartMode').checked;
}

/*
 * draw(): p5 Funktion welche mehrfach in der Sekunde ausgeführt und zum Zeichnen der Objekte verwendet wird
 * 
*/
function draw() {
  //Zeit stoppen
  if (!mazeFinished) {
    time1 = time;
  }
  if (!mazeFinished2) {
    time2 = time;
  }
  //Löschen des Canvas
  clear();

  //Zeichnen von Start und Ziel Marker des linken/rechten Canvas
  drawStartGoal(pg, 0);
  drawStartGoal(pg2, offset);

  //Zeichnen des linken Arrays mit Fields
  if (field.length == units){
    for (var i = 0; i < units; i++) {
      field[i].draw(0);
    }
  }
  //Zeichnen des rechten Arrays mit Fields
  if (field2.length == units){
    for (var i = 0; i < units; i++) {
      field2[i].draw(offset);
    }
  }
  //Einmaliges Kopieren des 1. Feldes wenn es fertig generiert wurde
  if (timeOutArrayGenReady) {
    timeOutArrayGenReady = false;
    field2 = copyField(field);
  }

  //zeichnen von Walker1 Walker2
  walker.draw(0);
  walker2.draw(offset);

  //Labyrinth Caption
  textSize(20);
  textFont('Veranda');
  text("Zeit:       " + time + "s", fieldxdimension + 10,  -30 + (fieldydimension / 3));

  text("Zeit:       " + time1 + "s", fieldxdimension + 10,  0 + (fieldydimension / 3));
  text("Schritte: " + steps[0], fieldxdimension + 10, 15 + (fieldydimension / 3));
  text("Rechts:   " + steps[1], fieldxdimension + 10, 30 + (fieldydimension / 3));
  text("Links:     " + steps[2], fieldxdimension + 10, 45 + (fieldydimension / 3));
  text("LeastV:   " + steps[3], fieldxdimension + 10, 60 + (fieldydimension / 3));

  text("Zeit:   " + time2 + "s", fieldxdimension + 10 , 100 + fieldydimension / 3);
  text("Steps: " + steps2[0], fieldxdimension + 10 , 120 + fieldydimension / 3);
  //textSize(50);
  //text("# " + walker.currentPos, 200, 50 + fieldydimension);
  //text("# " + walker2.currentPos, 200 + offset, 50 + fieldydimension);
}

/*
 * Outsource für Start- und Zielmarker
 * 
*/
function drawStartGoal(graphicsObject, localOffset) {
  var xCoord = fieldxdimension - fieldsize;
  var yCoord = fieldydimension - fieldsize;
  if (goalfield % xcolumn == 0) {
   	xCoord = xcolumn * fieldsize - fieldsize;
  } else {
  	xCoord = (goalfield % xcolumn) * fieldsize - fieldsize;
  }
  yCoord = fieldsize * Math.ceil(goalfield / xcolumn) - fieldsize;


  graphicsObject.background(220);
  push();
  graphicsObject.noStroke();
  //startmarker
  graphicsObject.fill(color(0, 250, 0));
  graphicsObject.rect((xstart - 1) * fieldsize , (ystart - 1) * fieldsize, fieldsize, fieldsize);
  //zielmarker
  graphicsObject.fill(color(200, 0, 0));
  graphicsObject.rect(xCoord, yCoord, fieldsize, fieldsize); //fieldxdimension - fieldsize
  image(graphicsObject, localOffset, 0);
  pop();
}

/*
 * Zurücksetzen der Statistiken
 * 
*/
function resetStatistics() {
  steps[0] = 0;
  switch (mode) {
    case "rightHand":
      steps[1] = 0;
      break;
    case "leftHand":
      steps[2] = 0;
      break;
    case "leastVisited":
      steps[3] = 0;
      break;
  }
  steps2[0] = 0;
  visitedCount = [[units - 1, 1], [units - 1, 1], [units - 1, 1], [units - 1, 1]];
  visitedCount2 = [[units - 1, 1]];
  stopWorker();
  time = 0;
  time1 = 0;
  time2 = 0;
  solverRunning = false;
  mazeFinished = false;
  mazeFinished2 = false;
}

/*
 * Erhöhen der Statistiken: 
 *    wenn position < 0:  für rechtes Maze
 *    sonst:              für linkes Maze entsprechened des verwendeten Algorithmus
 *
 * @params position int
 * 
*/
function increaseStatistics(position) {
  if (position < 0) {
    position = 0;
    steps2[0]++;
    var lastField = field2[walker2.lastPos - 1].visited;
    var currentField = field2[walker2.currentPos - 1].visited;
    if (visitedCount2[position][currentField + 1] == undefined) {
      visitedCount2[position][currentField + 1] = 0;
    }
    visitedCount2[position][currentField]--;
    visitedCount2[position][currentField + 1]++;
  } else {
    steps[0]++;
    steps[position]++;

    var lastField = field[walker.lastPos - 1].visited;
    var currentField = field[walker.currentPos - 1].visited;

    if (visitedCount[0][currentField + 1] == undefined) {
      visitedCount[0][currentField + 1] = 0;
    }
    visitedCount[0][currentField]--;
    visitedCount[0][currentField + 1]++;

    if (visitedCount[position][currentField + 1] == undefined) {
      visitedCount[position][currentField + 1] = 0;
    }
    visitedCount[position][currentField]--;
    visitedCount[position][currentField + 1]++;
  }
}

/*
 * Starten der Zeit ab einem gewissen Startwert initTime
 * mit einem WebWorker
 *
 * @params initTime int
 * 
*/
function startWorker(initTime) {
  if (typeof(wWorker) == "undefined") {
    wWorker = new Worker("js/worker.js");
  }
  wWorker.postMessage(time);
  wWorker.onmessage = function(event) {
    time = event.data;
  };
}

/*
 * Stoppen der Zeit
 * Löschen des Webworkers
 * 
*/
function stopWorker() { 
  if (typeof(wWorker) !== "undefined") {
    wWorker.terminate();
  }
  wWorker = undefined;
}

/*
 * Funktion zum Lösen und Statistik führen
 * 
*/
async function executeSolve() {
  if (solverRunning == true) {
    document.getElementById("startbutton").disabled = true;
    document.getElementById("restartbutton").disabled = false;

    solverRunning = false;
    //waitingTime = waitingTime / 2;
    stopWorker();
    setDropBoxesDisabled(false);

    await sleep(waitingTime);
    document.getElementById("startbutton").disabled = false;

  } else {
      document.getElementById("restartbutton").disabled = true;
      startWorker();
      setDropBoxesDisabled(true);
      solverRunning = true;
      while ((!mazeFinished || !mazeFinished2) && (solverRunning == true)) {
        if (!mazeFinished) {
          switch (mode) {
            case "rightHand":
              {
                walker = solverSupervisor(field, walker, goalfield, xcolumn, "right");
                increaseStatistics(1);
                checkReachableGoal("lsRechteHand", steps, visitedCount);
              }
              break;
            case "leftHand":
              {
                walker = solverSupervisor(field, walker, goalfield, xcolumn, "left");
                increaseStatistics(2);
                checkReachableGoal("lsLinkeHand", steps, visitedCount);
              }
              break;
            case "leastVisited":
              {
                walker = solverSupervisor(field, walker, goalfield, xcolumn, "least");
                increaseStatistics(3);
              }
              break;
          }
        if (walker.currentPos == goalfield){
          mazeFinished = true;
          time1 = time;
        }
      }

      if (!mazeFinished2 && (mode2 != "user")) {
        switch (mode2) {
          case "rightHand":
            {
              walker2 = solverSupervisor(field2, walker2, goalfield, xcolumn, "right");
              increaseStatistics(-1);
              checkReachableGoal("rsRechteHand", steps2, visitedCount2);
            }
            break;
          case "leftHand":
            {
              walker2 = solverSupervisor(field2, walker2, goalfield, xcolumn, "left");
              increaseStatistics(-1);
              checkReachableGoal("rsLinkeHand", steps2, visitedCount2);
            }
            break;
          case "leastVisited":
            {
              walker2 = solverSupervisor(field2, walker2, goalfield, xcolumn, "least");
              increaseStatistics(-1);
            }
            break;
        }
        if (walker2.currentPos == goalfield) {
          mazeFinished2 = true;
          time2 = time;
        }
      }

      if (mazeFinished && mazeFinished2) {
        finishedSolving();
      }

      if (solverRunning){
        await sleep(waitingTime);
      } else {
        break;
      }
    }
  }
}

/*
 * Wird aufgerufen wenn beide Labyrinthe fertig sind
 *
 *
*/
function finishedSolving() {
  mazeFinished = true;
  mazeFinished2 = true;
  document.getElementById("restartbutton").disabled = false;
  changeButtonText("neu");
  $("body").off("click", "#startbutton", setStartButton);
  $("#startbutton").off();
  $("body").on("click", "#startbutton", setReStartButton);
  if (wWorker !== undefined) {
    stopWorker();
  }
  user_request('setstats', steps[0], time1, true);
  if (mode2 == "user") {
    user_request('setstats', steps2[0], time2, false);
  } else {
    user_request('setstats', steps2[0], time2, true);
  }
}
function resetStartButtton() {
  $("body").off("click", "#startbutton", setReStartButton);
  $("#startbutton").off();
  $("body").on("click", "#startbutton", setStartButton);
  changeButtonText("res");
}
function setReStartButton() { //Restart Button
  setSettings();
  setDropBoxesDisabled(false);
  $("body").off("click", "#startbutton", setReStartButton);
  resetStartButtton();
}
function setStartButton() { //Normaler Start Button
  mode = $("#dropbox1").val();
  mode2 = $("#dropbox2").val();
  executeSolve();
  changeButtonText($("#startbutton").html());
}

/*
 * Warte Funktion nimmt Wartezeit in ms
 *
 * @params ms int
 * 
*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
 * p5 Funktion, welche Tastendrücke registriert
 * für User Interaktion verwendet
 * 
*/
function keyPressed() {
  var cond = false;
  var localWalker;
  if ((solverRunning == true) && (mode2 == "user") && !mazeFinished2) {
    switch (keyCode) {
      case 87: //w
      case 38: //up
        localWalker = walker2.move(field2, 'north');
        break;
      case 65: //a
      case 37: //left
        localWalker = walker2.move(field2, 'west');
        break;
      case 83: //s
      case 40: //down
        localWalker = walker2.move(field2, 'south');
        break;
      case 68: //d
      case 39: //right
        localWalker = walker2.move(field2, 'east');
        break;
    }
    if ((cond != localWalker) && !mazeFinished2){
      increaseStatistics(-1);
    }
    if (walker2.currentPos == goalfield) {
      mazeFinished2 = true;
      time2 = time;
    }
    if (mazeFinished && mazeFinished2) {
          finishedSolving();
    }
  }
}

/*
 * Überprüfen, ob das Ziel mit @method -Verfahren lösbar ist
 *
 * @params method String
 * @params LocalSteps []
 * @params localArray [][]
 * 
*/
function checkReachableGoal(method, LocalSteps, localArray) {
  var maxHandSteps = 2.5 * units; //worstcase Anzahl der besuche
  if (smartMode) {
    switch (method) {
      case "lsRechteHand":
      case "lsLinkeHand":
        if ((localArray[0][5] != undefined) || (LocalSteps[0] > maxHandSteps)) {
          alertTimeStop(method);
          mazeFinished = true;
        }
        break;
      case "rsRechteHand":
      case "rsLinkeHand":
        if (localArray[0][5] != undefined) {
          alertTimeStop(method);
          mazeFinished2 = true;
        }
        break;
    }
  }

}
function alertTimeStop(method) {
  var helpTime = time;
  stopWorker();
  alert("Achtung keine Zielfindung möglich mit dem " + method.substr(2, method.length).toUpperCase() + "-Verfahren!");
  startWorker(helpTime);
}

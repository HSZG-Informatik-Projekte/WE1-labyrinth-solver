function generatorSupervisor(localFieldsize, localYrow, localXcolumn, localGoalfield, controlWord, localWSK) {
  switch (controlWord) {
    case "random":
      return randomGen(localFieldsize, localYrow, localXcolumn, localWSK);
    case "firm":
      return firmSetup(localFieldsize);
    case "gen":
      {
      timeOutArrayGenReady = false;
      var bool = false;
      var myResult = [];
      var z = 0;
      timeOutGen(bool, myResult, z, localFieldsize, localYrow, localXcolumn, localGoalfield, localWSK);
      return field;
      }
  }
}

function timeOutGen(bool, myResult, z, localFieldsize, localYrow, localXcolumn, localGoalfield, localWSK){
    if (bool == false) {
    //while (bool == false) {
      var ar = generateMaze(localFieldsize, localYrow, localXcolumn, localGoalfield, localWSK);
      bool = ar[1];
      myResult = ar[0];
      z++;
      timeOutStop = setTimeout(timeOutGen, 0, bool, myResult, z, localFieldsize, localYrow, localXcolumn, localGoalfield, localWSK);
    } 
    else {
      generatingFieldReady(myResult);
    }
}

function generateMaze(localFieldsize, localYrow, localXcolumn, localGoalfield, localWSK) {
  var localField = randomGen(localFieldsize, localYrow, localXcolumn, localWSK);
  var localWalker = new Walker(startfield);
  var cancelCondition = false;
  var cancelNumber = 0;

  //if (!((localField[localWalker.currentPos - 1].east || localField[1].west) && (localField[0].south || localField[localXcolumn].north))) {
  if (!(checkWall(localField, localWalker, "north") &&
      (checkWall(localField, localWalker, "east")) &&
      (checkWall(localField, localWalker, "south")) && 
      (checkWall(localField, localWalker, "west")))) {
    while (cancelCondition == false && (cancelNumber < units)) {
      localWalker = solverSupervisor(localField, localWalker, localGoalfield, localXcolumn, "least", localWSK);
      if (localGoalfield == localWalker.currentPos) {
        cancelCondition = true;
      }
      cancelNumber++;
    }
  }
  if (cancelCondition == false) {
    return [localField, false]
  } else {
    var ar = clearTrace(localField, localWalker);
    localField = ar[0];
    localWalker = ar[1];
    return [localField, true];
  }
}


function randomGen(localFieldsize, localYrow, localXcolumn, localWSK) {
  var index = 0;
  var localField = [];
  for (var i = localFieldsize; i <= localFieldsize * localYrow; i += localFieldsize) { //zeilen
    for (var j = localFieldsize; j <= localFieldsize * localXcolumn; j += localFieldsize) { //spalten
      localField[index++] = new Fields(random(localWSK), random(localWSK), random(localWSK), random(localWSK), j - localFieldsize, i - localFieldsize, index, localXcolumn, localYrow);
    }
  }
  return localField;
}

function firmSetup(localFieldsize) {
  var localField = [];
  var firmnorth = [
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false]
  ];
  var firmeast = [ //1    2    3    4    5    6    7    8    9    10
    [false, false, true, true, false, false, false, true, false, true], //0
    [true, true, false, false, false, true, true, false, false, true], //1
    [false, true, true, false, false, true, true, true, true, true], //2
    [true, false, false, true, true, true, true, true, true, true], //3
    [false, true, false, true, false, true, false, false, true, true], //4
    [true, false, false, true, true, false, true, true, true, true], //5
    [false, true, true, false, false, true, true, false, true, true], //6
    [true, false, false, true, true, true, true, false, false, true], //7
    [true, true, true, true, true, true, true, true, true, true], //8
    [true, true, true, true, true, true, true, true, false, true]
  ]; //9
  var firmsouth = [ //1    2    3    4    5    6    7    8    9    10
    [true, false, true, false, false, true, true, false, true, false], //1
    [true, false, true, true, false, true, true, true, true, true], //2
    [true, false, true, false, true, true, true, true, true, true], //3
    [true, true, true, false, true, true, false, true, false, true], //4
    [false, false, true, false, true, false, false, true, false, true], //5
    [false, false, true, true, true, false, true, true, false, true], //6
    [false, false, true, false, true, true, true, false, true, true], //7
    [false, true, true, true, true, true, true, true, false, true], //8
    [true, true, true, true, true, true, true, true, false, true], //9
    [true, true, true, true, true, true, true, true, true, true]
  ]; //10;
  var firmwest = [
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false]
  ];
  var index = 0;
  for (var i = localFieldsize; i <= localFieldsize * 10; i += localFieldsize) {
    for (var j = localFieldsize; j <= localFieldsize * 10; j += localFieldsize) {
      var i2 = i / localFieldsize - 1;
      var j2 = j / localFieldsize - 1;
      localField[index++] = new Fields(firmnorth[i2][j2], firmeast[i2][j2], firmsouth[i2][j2], firmwest[i2][j2], j - localFieldsize, i - localFieldsize, index);
    }
  }
  return localField;
}

function changeWall(localField, localPosition, localDirection, localBool) {
  switch (localDirection) {
    case "north": localField[localPosition - xcolumn].south = localBool; localField[localPosition].north = localBool; 
    break;
  }
  return localField;
}

function checkWall(localField, localWalker, direction) {
  switch (direction) {
    case "north":
      if ((localField[localWalker.currentPos - 1].north == true) || (localField[localWalker.currentPos - xcolumn - 1].south == true)) {
        return true;
      } else {
        return false;
      }
      break;
    case "east":
      if ((localField[localWalker.currentPos - 1].east == true) || (localField[localWalker.currentPos].west == true)) {
        return true;
      } else {
        return false;
      }
      break;
    case "south":
      if ((localField[localWalker.currentPos - 1].south == true) || (localField[localWalker.currentPos + xcolumn - 1].north == true)) {
        return true;
      } else {
        return false;
      }
      break;
    case "west":
      if ((localField[localWalker.currentPos - 1].west == true) || (localField[localWalker.currentPos - 2].east == true)) {
        return true;
      } else {
        return false;
      }
      break;
  }
}

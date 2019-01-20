function solverSupervisor(localField, localWalker, localGoalfield, localXcolumn, controlWord) {
  switch (controlWord) {
    case "right":
      return xHand(localField, localWalker, localGoalfield, localXcolumn, "right");
    case "left":
      return xHand(localField, localWalker, localGoalfield, localXcolumn, "left");
    case "least":
      return leastVisited(localField, localWalker, localGoalfield, localXcolumn);
  }
}

function xHand(localField, localWalker, localGoalfield, localXcolumn, hand) {
  if (localWalker.currentPos == localGoalfield) {
    return localWalker;
  } else {
    /*if (!checkWall(localField, localWalker, "north") &&
      !checkWall(localField, localWalker, "east") &&
      !checkWall(localField, localWalker, "south") &&
      !checkWall(localField, localWalker, "west"))
    {
      console.log("keine Wand gefunden");
    }*/
    switch (localWalker.lastPos) {
      case (localWalker.currentPos - localXcolumn): //comming from north
        localWalker = tryMove(priorityQueue("north", hand), localField, localWalker);
        break;
      case (localWalker.currentPos + 1): //comming from east
        localWalker = tryMove(priorityQueue("east", hand), localField, localWalker);
        break;
      case (localWalker.currentPos + localXcolumn): //comming from south
        localWalker = tryMove(priorityQueue("south", hand), localField, localWalker);
        break;
      case (localWalker.currentPos - 1): //comming from west
        localWalker = tryMove(priorityQueue("west", hand), localField, localWalker);
        break;
    }
    return localWalker;
  }
}

function priorityQueue(direction, localHand) {
  if (localHand == "right") {
    switch (direction) {
      case "north":
        return ["west", "south", "east", "north"];
      case "east":
        return ["north", "west", "south", "east"];
      case "south":
        return ["east", "north", "west", "south"];
      case "west":
        return ["south", "east", "north", "west"];
    }
  } else {
    switch (direction) {
      case "north":
        return ["east", "south", "west", "north"];
      case "east":
        return ["south", "west", "north", "east"];
      case "south":
        return ["west", "north", "east", "south"];
      case "west":
        return ["north", "east", "south", "west"];
    }
  }
}

function tryMove(priority, localField, localWalker) {
  if (!localWalker.move(localField, priority[0])) {
    if (!localWalker.move(localField, priority[1])) {
      if (!localWalker.move(localField, priority[2])) {
        if (!localWalker.move(localField, priority[3])) {}
      }
    }
  }
  return localWalker;
}

function leastVisited(localField, localWalker, localGoalfield, localXcolumn) {
  if (localWalker.currentPos == localGoalfield) {
    return localWalker;
  } else {
    nextStep = [];
    visitedArray = [];
    var northVisited = -1;
    if (typeof localField[localWalker.currentPos - localXcolumn - 1] != "undefined" && (checkWall(localField, localWalker, "north") == false)) {
      northVisited = localField[localWalker.currentPos - localXcolumn - 1].visited;
      visitedArray.push(["north", northVisited]);
    }
    var eastVisited = -1;
    if (typeof localField[localWalker.currentPos] != "undefined" && (checkWall(localField, localWalker, "east") == false)) {
      eastVisited = localField[localWalker.currentPos].visited;
      visitedArray.push(["east", eastVisited]);
    }
    var southVisited = -1;
    if (typeof localField[localWalker.currentPos + localXcolumn - 1] != "undefined" && (checkWall(localField, localWalker, "south") == false)) {
      southVisited = localField[localWalker.currentPos + localXcolumn - 1].visited;
      visitedArray.push(["south", southVisited]);
    }
    var westVisited = -1;
    if (typeof localField[localWalker.currentPos - 2] != "undefined" && (checkWall(localField, localWalker, "west") == false)) {
      westVisited = localField[localWalker.currentPos - 2].visited;
      visitedArray.push(["west", westVisited]);
    }

    if (visitedArray.length == 0) {
      return localWalker;
    }
    visitedArray = leastVisitedField(visitedArray);
    localWalker = localWalker.move(localField, random(visitedArray));
    return localWalker;
  }
}

function leastVisitedField(visitedArray) {
  var minVisited = [];
  visitedArray.sort(function(a, b) {
    return (a[1] - b[1]);
  });
  var returnValue = [];
  returnValue.push(visitedArray[0][0]);

  for (var i = 1; i < visitedArray.length; i++) {
    if (visitedArray[0][1] == visitedArray[i][1]) {
      returnValue.push(visitedArray[i][0]);
    }
  }
  return returnValue;
}

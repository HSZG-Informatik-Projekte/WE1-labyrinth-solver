var fz12 = 20;
var fz14 = 10;
var fz18 = 5;

function Walker(localStartField) {
  fz12 = fieldsize / 2;
  fz14 = fieldsize / 4;
  fz18 = fieldsize / 8;
  this.currentPos = localStartField;
  this.lastPos = localStartField - xcolumn;
  this.ballx = (xstart - 1) * fieldsize + fz12;
  this.bally = (ystart - 1) * fieldsize + fz12;
  this.ballEyex1 = this.ballx + fz14;
  this.ballEyey1 = this.bally - fz18;
  this.ballEyex2 = this.ballx + fz14;
  this.ballEyey2 = this.bally + fz18;
}

Walker.prototype.draw = function(localOffset) {
  push();
  strokeWeight(1);
  fill(color(250, 100, 0));
  ellipse(this.ballx + localOffset, this.bally, (fieldsize*2/3), (fieldsize*2/3));
  fill(color(0, 150, 250));
  ellipse(this.ballEyex1 + localOffset, this.ballEyey1, fz18, fz18);
  ellipse(this.ballEyex2 + localOffset, this.ballEyey2, fz18, fz18);
  pop();
}

Walker.prototype.move = function(localField, direction) {
  switch (direction) {
    case 'north':
      if (this.bally > fieldsize && !checkWall(localField, this, "north")) {
        localField[this.currentPos - 1].visited += 1;
        this.lastPos = this.currentPos;

        this.currentPos -= xcolumn;
        this.bally -= fieldsize;
        this.ballEyex1 = this.ballx - fz18;
        this.ballEyey1 = this.bally - fz14;
        this.ballEyex2 = this.ballx + fz18;
        this.ballEyey2 = this.bally - fz14;
      } else {
        return false
      }
      break;
    case 'east':
      if (this.ballx < fieldxdimension & !checkWall(localField, this, "east")) {
        localField[this.currentPos - 1].visited += 1;
        this.lastPos = this.currentPos;

        this.currentPos += 1;
        this.ballx += fieldsize;
        this.ballEyex1 = this.ballx + fz14;
        this.ballEyey1 = this.bally - fz18;
        this.ballEyex2 = this.ballx + fz14;
        this.ballEyey2 = this.bally + fz18;
      } else {
        return false
      }
      break;
    case 'south':
      if (this.bally < fieldydimension & !checkWall(localField, this, "south")) {
        localField[this.currentPos - 1].visited += 1;
        this.lastPos = this.currentPos;

        this.currentPos += xcolumn;
        this.bally += fieldsize;
        this.ballEyex1 = this.ballx - fz18;
        this.ballEyey1 = this.bally + fz14;
        this.ballEyex2 = this.ballx + fz18;
        this.ballEyey2 = this.bally + fz14;
      } else {
        return false
      }
      break;
    case 'west':
      if (this.ballx > fieldsize & !checkWall(localField, this, "west")) {
        localField[this.currentPos - 1].visited += 1;
        this.lastPos = this.currentPos;

        this.currentPos -= 1;
        this.ballx -= fieldsize;
        this.ballEyex1 = this.ballx - fz14;
        this.ballEyey1 = this.bally + fz18;
        this.ballEyex2 = this.ballx - fz14;
        this.ballEyey2 = this.bally - fz18;
      } else {
        return false
      }
      break;
  }
  //walkerView(localField, this);
  return this;
}

/*
 * Debug Funktion
 *
 * console.log: zeigt direktes Umfeld des Walkers
 *
*/
function walkerView(localField, localWalker) {
  var north = false | 0;
  var east = false | 0;
  var south = false | 0;
  var west = false | 0;

  if (localWalker.currentPos <= xcolumn) {
    north = localField[localWalker.currentPos - 1].north | 0;
  } else {
    north = ((localField[localWalker.currentPos - 1].north) | (localField[localWalker.currentPos - xcolumn - 1].south))
  }
  if (((localWalker.currentPos) % xcolumn) == 0) {
    east = localField[localWalker.currentPos - 1].east | 0;
  } else {
    east = ((localField[localWalker.currentPos - 1].east) | (localField[localWalker.currentPos].west));
  }
  if (((localWalker.currentPos - 1) >= (xcolumn * yrow - xcolumn))) {
    south = localField[localWalker.currentPos - 1].south | 0;
  } else {
    south = ((localField[localWalker.currentPos - 1].south) | (localField[localWalker.currentPos + xcolumn - 1].north))
  }
  if (((localWalker.currentPos) % xcolumn) == 1) {
    west = localField[localWalker.currentPos - 1].west | 0;
  } else {
    west = ((localField[localWalker.currentPos - 1].west) | (localField[localWalker.currentPos - 2].east))
  }
  console.log("   " + north);
  console.log(west + "  " + localWalker.currentPos + "  " + east);
  console.log("   " + south);
}

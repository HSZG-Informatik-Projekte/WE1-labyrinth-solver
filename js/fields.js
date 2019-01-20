function Fields(_north, _east, _south, _west, _p1, _p2, _title, localXcolumn = xcolumn, localYrow = yrow) {
  this.north = _north; //boolean
  this.east = _east;
  this.south = _south;
  this.west = _west;

  if (_title < (localXcolumn + 1)) { //rand oben
    this.north = true;
  }
  if (_title > (((localYrow * localXcolumn) - localXcolumn))) { //rand unten
    this.south = true;
  }
  if ((_title % localXcolumn) == 0) { //rand rechts
    this.east = true;
  }
  if ((_title % localXcolumn) == 1) { //rand links
    this.west = true;
  }

  this.p1 = _p1; //Number: the x-coordinate of the first point
  this.p2 = _p2; //Number: the y-coordinate of the first point
  this.title = _title; //nummer des Feldes (im Feld)
  this.visited = 0;
  this.bgcolor = color(255, 204, 0)
}

Fields.prototype.draw = function(localOffset) {
  strokeWeight(fieldsize/10);
  if (this.north == true) {
    var lline = line(this.p1 + localOffset, this.p2, this.p1 + fieldsize + localOffset, this.p2); //oben
  } //x1, y1, x2, y2
  if (this.south == true) {
    line(this.p1 + localOffset, this.p2 + fieldsize, this.p1 + fieldsize + localOffset, this.p2 + fieldsize); //unten
  }
  if (this.west == true) {
    line(this.p1 + localOffset, this.p2 + fieldsize, this.p1 + localOffset, this.p2); //links
  }
  if (this.east == true) {
    line(this.p1 + fieldsize + localOffset, this.p2 + fieldsize, this.p1 + fieldsize + localOffset, this.p2); //rechts
  }
  //mazeInnerText2(this, localOffset);
  //color dot path
  if (showTrace){
    if (this.visited > 0) {
      push();
      noStroke(1);
      var colorArray = ["lime", "olive", "green", "yellow", "orange", "red", "maroon"];
      if (this.visited - 1 < colorArray.length) {
        fill(color(colorArray[this.visited - 1]));
      } else {
        fill(color("maroon"));
      }
      ellipse(this.p1 + (fieldsize / 2) + localOffset, this.p2 + (fieldsize / 2), fieldsize/2, fieldsize/2);
      pop();
      mazeInnerText(this, localOffset);
    }
  }
}

function mazeInnerText(localObject, localOffset) {
  push();
  textSize(fieldsize/3.333);
  textFont('Veranda');
  text(localObject.visited, localObject.p1 + fieldsize/2 - 4 + localOffset, localObject.p2 + fieldsize/2 + 4);
  pop();
}

function mazeInnerText2(localObject, localOffset) {
  push();
  textSize(fieldsize/3.333);
  textFont('Veranda');
  text(localObject.title, localObject.p1 + fieldsize/2 - 4 + localOffset, localObject.p2 + fieldsize/2 + 4);
  pop();
}

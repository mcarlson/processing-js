class ProcessingMain extends Processing {
var spots:SpinSpots;
var arm:SpinArm;

function setup() 
{
  #pragma 'withThis'
  this.size(200, 200);
  this.smooth();
  this.arm = new SpinArm(this.width/2, this.height/2, 0.01);
  this.spots = new SpinSpots(this.width/2, this.height/2, -0.02, 33.0);
}

function draw() 
{
  #pragma 'withThis'
  this.background(204);
  this.arm.update();
  this.arm.display();
  this.spots.update();
  this.spots.display();
}
}

class Spin extends Processing {
  var x:float = 0;
  var y = 0;
  var speed = 0;
  var angle:float = 0.0;
  function update () {
  #pragma 'withThis'
    angle += speed;
  }
  function Spin(xpos:float, ypos:float, s:float) {
  #pragma 'withThis'
    this.curContext = processingcontext.curContext;
    this.color = processingcontext.color;
    if ( arguments.length == 3 ) {

    x = xpos;
    y = ypos;
    speed = s;
  }
  

}}

class SpinArm extends Spin {
  function display () {
  #pragma 'withThis'
    strokeWeight(1);
    stroke(0);
    pushMatrix();
    translate(x, y);
    angle += speed;
    rotate(angle);
    line(0, 0, 66, 0);
    popMatrix();
  }
  function SpinArm(x:float, y:float, s:float) {
  #pragma 'withThis'
    if ( arguments.length == 3 ) {

    super(x, y, s);
  }
  

}}

class SpinSpots extends Spin {
  var dim:float = 0;
  function display () {
  #pragma 'withThis'
    noStroke();
    pushMatrix();
    translate(x, y);
    angle += speed;
    rotate(angle);
    ellipse(-dim/2, 0, dim, dim);
    ellipse(dim/2, 0, dim, dim);
    popMatrix();
  }
  function SpinSpots(x:float, y:float, s:float, d:float) {
  #pragma 'withThis'
    if ( arguments.length == 4 ) {

    super(x, y, s);
    dim = d;
  }
  

}}

var processingcontext = new ProcessingMain();

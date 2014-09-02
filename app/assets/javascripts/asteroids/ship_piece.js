(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var ShipPiece = Asteroids.ShipPiece = function(ship, game){
    Asteroids.MovingObject.call(this, ship.x, ship.y, 
      ship.vx * Math.random(), ship.vy * Math.random(), 
      2.5, Asteroids.Ship.COLOR, game);
    this.angle = ship.angle;
  };
  
  // var ShipPiece = ShipPieces.ShipPiece = function(shipa){
  //   MovingObjects.MovingObject.call(this, ship.x, ship.y,
  //     ship.vx * Math.random(), ship.vy * Math.random(),
  //     2.5, Ships.Ship.COLOR);
  //   this.angle = ship.angle;
  // };
  
  ShipPiece.inherits(Asteroids.MovingObject);

  ShipPiece.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    var angle = this.angle;
    var radius = 2 * this.radius;

    var startingX = Asteroids.Game.DIM_X / 2;
    var startingY = Asteroids.Game.DIM_Y / 2;
    
    ctx.moveTo(startingX + radius * Math.cos(angle), startingY + radius * Math.sin(angle));
    ctx.lineTo(startingX + radius * Math.cos(angle + (2.25 / 3) * Math.PI), startingY + radius * Math.sin(angle + (2.25 / 3) * Math.PI));
    ctx.lineTo(startingX + radius * Math.cos(angle + (3.75 / 3) * Math.PI), startingY + radius * Math.sin(angle + (3.75 / 3) * Math.PI));
    ctx.stroke();
    ctx.closePath();
    
    ctx.fill();
  };
})(this);

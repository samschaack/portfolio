(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Flame = Asteroids.Flame = function(ship, game){
    Asteroids.MovingObject.call(this, ship.x, ship.y,
      ship.vx, ship.vy,
      5, "yellow", game);
    this.angle = ship.angle;
    this.ship = ship;
    this.activated = false;
  };

  // var ShipPiece = ShipPieces.ShipPiece = function(shipa){
  //   MovingObjects.MovingObject.call(this, ship.x, ship.y,
  //     ship.vx * Math.random(), ship.vy * Math.random(),
  //     2.5, Ships.Ship.COLOR);
  //   this.angle = ship.angle;
  // };

  Flame.inherits(Asteroids.MovingObject);

  Flame.prototype.draw = function(ctx) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 0, .5)';

    var angle = this.ship.angle;
    var radius = 1.2 * this.ship.radius;

    var startingX = Asteroids.Game.DIM_X / 2;
    var startingY = Asteroids.Game.DIM_Y / 2;

    ctx.fillStyle =this.color;
    ctx.beginPath();

    ctx.moveTo(startingX + .35 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + .7 * radius * Math.cos(angle + (3.5 / 3) * Math.PI), startingY + .7 * radius * Math.sin(angle + (3.5 / 3) * Math.PI));
    ctx.lineTo(startingX + 1.4 * radius * Math.cos(angle + (3 / 3) * Math.PI), startingY + 1.4 * radius * Math.sin(angle + (3 / 3) * Math.PI));
    ctx.lineTo(startingX + .7 * radius * Math.cos(angle + (2.5 / 3) * Math.PI), startingY + .7 * radius * Math.sin(angle + (2.5 / 3) * Math.PI));
    ctx.closePath();
    ctx.stroke();
    
    ctx.fill();
    
    // ctx.fillStyle = "#FFD578";
    // ctx.beginPath();
    //
    // ctx.moveTo(startingX + .4 * radius * Math.cos(angle + Math.PI), startingY + .4 * radius * Math.sin(angle + Math.PI));
    //
    // ctx.lineTo(startingX + .6 * radius * Math.cos(angle + (3.2 / 3) * Math.PI), startingY + .6 * radius * Math.sin(angle + (3.2 / 3) * Math.PI));
    // ctx.lineTo(startingX + 1 * radius * Math.cos(angle + (3 / 3) * Math.PI), startingY + 1 * radius * Math.sin(angle + (3 / 3) * Math.PI));
    // ctx.lineTo(startingX + .6 * radius * Math.cos(angle + (2.8 / 3) * Math.PI), startingY + .6 * radius * Math.sin(angle + (2.8 / 3) * Math.PI));
    // ctx.closePath();
    // ctx.stroke();
    //
    // ctx.fill();
  };
})(this);
(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Waypoint = Asteroids.Waypoint = function(game, obj, ship){
    Asteroids.MovingObject.call(this, 0, 0, 0, 0, Waypoint.RADIUS, obj.color);
    this.obj = obj;
    this.game = game;
    this.ship = ship;
    this.visible = false;
    this.angle = 0;
    this.cornerOffset = 1.5;
    this.objectType = "waypoint";
    this.offset = 10;
  };

  Waypoint.inherits(Asteroids.MovingObject);

  Waypoint.RADIUS = 35;

  Waypoint.prototype.draw = function(ctx) {
    this.ctx = ctx;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    var distanceFromShip = Math.sqrt(Math.pow(this.obj.x - this.ship.x, 2) + Math.pow(this.obj.y - this.ship.y, 2));

    var angle = this.angle;

    var startingX = this.x;
    var startingY = this.y;

    var radius;
    if (this.corner !== null) {
      radius = 15;
    } else {
      radius = 50 * Asteroids.Game.DIM_Y / distanceFromShip;
      radius = (radius < 30 ? radius : 30);
      if (radius < 15) {
        radius = 15;
      }
      this.offset = radius - 25;
    }

    ctx.moveTo(startingX + radius * Math.cos(angle), startingY + radius * Math.sin(angle));
    ctx.lineTo(startingX + radius * Math.cos(angle + (2.25 / 3) * Math.PI), startingY + radius * Math.sin(angle + (2.25 / 3) * Math.PI));

    ctx.lineTo(startingX + .35 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + radius * Math.cos(angle + (3.75 / 3) * Math.PI), startingY + radius * Math.sin(angle + (3.75 / 3) * Math.PI));
    ctx.stroke();
    ctx.closePath();

    ctx.fill();
    this.corner = null;
  };

  Waypoint.prototype.move = function() {
    if (this.game.offScreen(this.obj)) {
      this.visible = true;
      if (this.obj.x > this.ship.x - Asteroids.Game.DIM_X / 2 && this.obj.x < this.ship.x + Asteroids.Game.DIM_X / 2){
        if (this.obj.y < this.ship.y) {
          //top side
          this.angle = 3 * Math.PI / 2;
          this.x = this.obj.x + this.game.xOffset;
          this.y = 0 + this.radius + this.offset;
          this.corner = null;
        } else {
          //bottom side
          this.angle = Math.PI / 2;
          this.x = this.obj.x + this.game.xOffset;
          this.y = Asteroids.Game.DIM_Y - this.radius - this.offset;
          this.corner = null;
        }
      } else if (this.obj.y > this.ship.y - Asteroids.Game.DIM_Y / 2 && this.obj.y < this.ship.y + Asteroids.Game.DIM_Y / 2){
        if (this.obj.x < this.ship.x) {
          //right side
          this.angle = Math.PI;
          this.y = this.obj.y + this.game.yOffset;
          this.x = 0 + this.radius + this.offset;
          this.corner = null;
        } else {
          //left side
          this.angle = 0;
          this.y = this.obj.y + this.game.yOffset;
          this.x = Asteroids.Game.DIM_X - this.radius - this.offset;
          this.corner = null;
        }
      } else if (this.obj.x < this.ship.x - Asteroids.Game.DIM_X / 2 && this.obj.y < this.ship.y - Asteroids.Game.DIM_Y / 2){
        //upper left
        this.corner = "uL";
        this.angle = -3 * Math.PI / 4;
        this.y = this.radius / this.cornerOffset;
        this.x = this.radius / this.cornerOffset;
      } else if (this.obj.x > this.ship.x + Asteroids.Game.DIM_X / 2 && this.obj.y < this.ship.y - Asteroids.Game.DIM_Y / 2){
        //upper right
        this.corner = "uR";
        this.angle = -1 * Math.PI / 4;
        this.y = this.radius / this.cornerOffset;
        this.x = Asteroids.Game.DIM_X - this.radius / this.cornerOffset;
      } else if (this.obj.x < this.ship.x - Asteroids.Game.DIM_X / 2 && this.obj.y > this.ship.y + Asteroids.Game.DIM_Y / 2){
        //bottom left
        this.corner = "bL";
        this.angle = 3 * Math.PI / 4;
        this.y = Asteroids.Game.DIM_Y - this.radius / this.cornerOffset;
        this.x = this.radius / this.cornerOffset;
      } else if (this.obj.x > this.ship.x + Asteroids.Game.DIM_X / 2 && this.obj.y > this.ship.y + Asteroids.Game.DIM_Y / 2){
        //bottom right
        this.corner = "bR";
        this.angle = 1 * Math.PI / 4;
        this.y = Asteroids.Game.DIM_Y - this.radius / this.cornerOffset;
        this.x = Asteroids.Game.DIM_X - this.radius / this.cornerOffset;
      }
      if (this.corner !== null) {
        this.game.waypointCorners[this.corner].push(this);
      } else {
        this.game.sideWaypoints.push(this);
      }
    } else {
      this.visible = false;
    }
  }
})(this);
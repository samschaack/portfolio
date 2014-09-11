(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Bullet = Asteroids.Bullet = function(x, y, vx, vy, game, color, ship){
    Asteroids.MovingObject.call(this, x, y, vx, vy, Bullet.RADIUS, color);
    this.game = game;
    this.objectType = "bullet";
    this.mass = .1;
    this.ship = ship;
  };

  Bullet.inherits(Asteroids.MovingObject);

  Bullet.BULLETSPEED = 25;
  Bullet.RADIUS = 2;
  Bullet.COLOR = "red";

  Bullet.prototype.move = function() {
    this.x = (this.x + this.vx);
    this.y = (this.y + this.vy);
  }

  Bullet.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    ctx.arc(
      this.game.xOffset + this.x,
      this.game.yOffset + this.y,
      this.radius,
      0,
      2 * Math.PI,
      false
    );

    ctx.fill();
    ctx.closePath();
  };
})(this);

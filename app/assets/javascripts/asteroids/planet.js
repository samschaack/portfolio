(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Planet = Asteroids.Planet = function(x, y, vx, vy, radius, color, mass, game){
    Asteroids.MovingObject.call(this, x, y, vx, vy, radius, color);
    this.mass = mass;
    this.onScreen = false;
    this.game = game;
    this.objectType = "planet";
  };

  Planet.inherits(Asteroids.MovingObject);

  Planet.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 75;
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

(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var MovingObject = Asteroids.MovingObject =
    function(x, y, vx, vy, radius, color, game) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.game = game;
  };

  MovingObject.prototype.move = function() {
    this.x = (this.x + this.vx);
    this.y = (this.y + this.vy);
  };

  MovingObject.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    if (this.charge && this.charge === -1) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    } else {
      ctx.shadowBlur = 0;
      ctx.shadowColor = this.color;
    }

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

  MovingObject.prototype.isCollidedWith = function(otherObject) {
    var d = Math.sqrt(Math.pow((this.x - otherObject.x), 2) + Math.pow((this.y - otherObject.y), 2));
    if (d < (this.radius + otherObject.radius)){
      return true;
    } else {
      return false;
    }
  };
})(this);

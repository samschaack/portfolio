(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Shield = Asteroids.Shield = function(game) {
    Asteroids.MovingObject.call(this, game.ship.x, game.ship.y, 0, 0, Shield.SHIELD_RADIUS, "#001DFF");
    this.game = game;
    this.onScreen = false;
  };

  Shield.inherits(Asteroids.MovingObject);
  Shield.SHIELD_RADIUS = 50;

  Shield.prototype.draw = function(ctx) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();

    ctx.lineWidth = 3;

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    ctx.arc(
      Asteroids.Game.DIM_X / 2,
      Asteroids.Game.DIM_Y / 2,
      this.radius,
      0,
      2 * Math.PI,
      false
    );

    ctx.stroke();

    ctx.strokeStyle = 'white';

    ctx.lineWidth = .5;

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    ctx.arc(
      Asteroids.Game.DIM_X / 2,
      Asteroids.Game.DIM_Y / 2,
      this.radius + 1,
      0,
      2 * Math.PI,
      false
    );

    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0)";
    ctx.closePath();
  }
})(this);
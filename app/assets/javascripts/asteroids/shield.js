(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Shield = Asteroids.Shield = function(game, options) {
    this.type = options.type;
    if (this.type === "player") {
      Asteroids.MovingObject.call(this, game.ship.x, game.ship.y, 0, 0, Shield.SHIELD_RADIUS, "#001DFF");
    } else if (this.type === "planet") {
      Asteroids.MovingObject.call(
        this,
        options.planet.x + options.xModifier,
        options.planet.y + options.yModifier,
        0, 0,
        Shield.PLANETARY_SHIELD_RADIUS,
        "#00F815"
      );
      this.shieldOn = true;
    }
    this.game = game;
    this.objectType = "shield";
    this.onScreen = false;
    if (options.planet !== false) {
      this.planet = options.planet;
      this.xModifier = options.xModifier;
      this.yModifier = options.yModifier;
    } else {
      this.planet = false;
    }
  }

  Shield.inherits(Asteroids.MovingObject);
  Shield.SHIELD_RADIUS = 50;
  Shield.PLANETARY_SHIELD_RADIUS = 300;

  Shield.prototype.move = function() {
    if (this.planet) {
      this.x = this.planet.x + this.xModifier;
      this.y = this.planet.y + this.yModifier;
    }
  }

  Shield.prototype.draw = function(ctx) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();

    ctx.lineWidth = 15;

    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;

    if (this.type === "player") {
      var xInit = Asteroids.Game.DIM_X / 2,
          yInit = Asteroids.Game.DIM_Y / 2;
    } else if (this.type === "planet") {
      var xInit = this.game.xOffset + this.x,
          yInit = this.game.yOffset + this.y;
    }
    ctx.arc(
      xInit,
      yInit,
      this.radius,
      0,
      2 * Math.PI,
      false
    );

    ctx.stroke();

    ctx.strokeStyle = 'white';

    ctx.lineWidth = 1;

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    ctx.arc(
      xInit,
      yInit,
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
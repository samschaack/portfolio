(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Flame = Asteroids.Flame = function(ship, game){
    Asteroids.MovingObject.call(this, ship.x, ship.y,
      ship.vx, ship.vy,
      5, "yellow", game);
    this.angle = ship.angle;
    this.ship = ship;
    this.activated = false;
    this.game = game;
  };

  Flame.inherits(Asteroids.MovingObject);

  Flame.prototype.draw = function(ctx) {
    if (!this.ship.afterburner) { ctx.shadowBlur = 3 }
    else { ctx.shadowBlur = 15 }
    ctx.shadowColor = 'rgba(255, 255, 0, .9)';

    var angle = this.ship.angle;
    var radius = 1.2 * this.ship.radius;

    var startingX = Asteroids.Game.DIM_X / 2;
    var startingY = Asteroids.Game.DIM_Y / 2;

    if (this.ship.afterburner === true) {
      ctx.fillStyle = this.color;
      ctx.beginPath();

      ctx.moveTo(startingX + .35 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

      ctx.lineTo(startingX + .7 * radius * Math.cos(angle + (3.5 / 3) * Math.PI), startingY + .7 * radius * Math.sin(angle + (3.5 / 3) * Math.PI));
      ctx.lineTo(startingX + 1.4 * radius * Math.cos(angle + (3 / 3) * Math.PI), startingY + 1.4 * radius * Math.sin(angle + (3 / 3) * Math.PI));
      ctx.lineTo(startingX + .7 * radius * Math.cos(angle + (2.5 / 3) * Math.PI), startingY + .7 * radius * Math.sin(angle + (2.5 / 3) * Math.PI));

      ctx.fill();
      ctx.closePath();
    }

    if (this.ship.afterburner === false) {
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#FFD31E";
    } else {
      ctx.shadowBlur = 5;
      ctx.fillStyle = "#FFC20D";
    }

    ctx.beginPath();
    ctx.moveTo(startingX + .3 * radius * Math.cos(angle + Math.PI), startingY + .3 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + .6 * radius * Math.cos(angle + (3.5 / 3) * Math.PI), startingY + .6 * radius * Math.sin(angle + (3.5 / 3) * Math.PI));
    ctx.lineTo(startingX + 1 * radius * Math.cos(angle + (3 / 3) * Math.PI), startingY + 1 * radius * Math.sin(angle + (3 / 3) * Math.PI));
    ctx.lineTo(startingX + .6 * radius * Math.cos(angle + (2.5 / 3) * Math.PI), startingY + .6 * radius * Math.sin(angle + (2.5 / 3) * Math.PI));
    ctx.fill();
    ctx.closePath();
  }

  Flame.prototype.drawIdle = function(ctx, brightness) {
    var angle = this.ship.angle;
    var radius = 1.2 * this.ship.radius;
    var startingX = Asteroids.Game.DIM_X / 2;
    var startingY = Asteroids.Game.DIM_Y / 2;
    ctx.shadowBlur = 10;
    if (brightness === "light") {
      ctx.shadowColor = 'rgba(255, 255, 0, .75)';
      ctx.fillStyle = 'rgba(240, 130, 0, .75)';
    } else if (brightness === "medium") {
      ctx.shadowColor = 'rgba(255, 255, 0, .65)';
      ctx.fillStyle = 'rgba(240, 130, 0, .45)';
    } else {
      ctx.shadowColor = 'rgba(255, 0, 0, .25)';
      ctx.fillStyle = 'rgba(255, 0, 0, .25)';
    }
    ctx.beginPath();
    ctx.moveTo(startingX + .25 * radius * Math.cos(angle + Math.PI), startingY + .25 * radius * Math.sin(angle + Math.PI));
    ctx.lineTo(startingX + .45 * radius * Math.cos(angle + (3.5 / 3) * Math.PI), startingY + .45 * radius * Math.sin(angle + (3.5 / 3) * Math.PI));
    ctx.lineTo(startingX + .68 * radius * Math.cos(angle + (3 / 3) * Math.PI), startingY + .68 * radius * Math.sin(angle + (3 / 3) * Math.PI));
    ctx.lineTo(startingX + .45 * radius * Math.cos(angle + (2.5 / 3) * Math.PI), startingY + .45 * radius * Math.sin(angle + (2.5 / 3) * Math.PI));
    ctx.fill();
    ctx.closePath();
  }
})(this);
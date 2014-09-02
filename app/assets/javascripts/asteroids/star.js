(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Star = Asteroids.Star = function(x, y, color, game){
    Asteroids.MovingObject.call(this, x, y, 0, 0, Star.radius(), color);
    this.game = game;
    this.onScreen = false
  };

  Star.inherits(Asteroids.MovingObject);

  Star.radius = function() {
    return (2 * Math.random());
  }

  Star.randomStar = function(game){
    // var x = 10 * Games.Game.DIM_X * Math.random();
    // var y = 10 * Games.Game.DIM_Y * Math.random();

    var x = Asteroids.Game.MAP_SIZE * Math.random();
    var y = Asteroids.Game.MAP_SIZE * Math.random();

    var yellowOrBlue = 0; //parseInt(2 * Math.random());

    var color = Star.randomColor(yellowOrBlue);

    return new Star(x, y, color, game);
  }

  Star.randomColor = function(yellowOrBlue) {
    if (yellowOrBlue === 0) {
      var color = "#fff"
      for (var i = 0; i < 3; i++) {
        hexNum = parseInt(10 * Math.random() + 1);

        if (hexNum === 10) {
          hexNum = "a";
        } else {
          hexNum = hexNum.toString();
        }

        color += hexNum;
      }
    } else {
      var color = "#000";
      for (var i = 0; i < 3; i++) {
        hexNum = parseInt(10 * Math.random() + 1);

        if (hexNum === 10) {
          hexNum = "a";
        } else {
          hexNum = hexNum.toString();
        }

        color += hexNum;
      }
    }
    return color;
  }

  Star.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 5;
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

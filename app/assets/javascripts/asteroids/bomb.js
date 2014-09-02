(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Bomb = Asteroids.Bomb = function(x, y, vx, vy, game, power, isTimed){
    if (isTimed === false) {
      Asteroids.MovingObject.call(this, x, y, 0, 0, Bomb.INIT_RADIUS, Bomb.COLOR);
    } else {
      var normvx = Math.cos(game.ship.angle);
      var normvy = Math.sin(game.ship.angle);
      Asteroids.MovingObject.call(this, x, y, Bomb.BOMB_SPEED * normvx, Bomb.BOMB_SPEED * normvy, Bomb.INIT_RADIUS, Bomb.COLOR);
    }
    this.game = game;
    this.power = power;
    this.mass = 1;
    this.isTimed = isTimed;
    this.explode(power);
  };
  
  Bomb.inherits(Asteroids.MovingObject);
  
  Bomb.INIT_RADIUS = 2;
  Bomb.COLOR = "#FFD119";
  Bomb.BOMB_SPEED = 6;
  
  Bomb.prototype.explode = function(power) {
    curBomb = this;
    //power is timer length (explosion radius)
    var p = 0;
    var count = 0;
    if (!curBomb.isTimed) {
      var explodeInterval = setInterval(function() {
        p += 1;
        if (p === power) {
          curBomb.game.bombs = [];
          clearInterval(explodeInterval);
        } else {
          curBomb.radius += 3;
        }
      }, 30);
    } else {
      var explodeTimeout = setTimeout(function() {
        var explodeInterval = setInterval(function() {
          p += 1;
          if (p === power) {
            curBomb.game.bombs = [];
            clearInterval(explodeInterval);
          } else {
            curBomb.radius += 3;
          }
        }, 30);
      }, 1000)
    }
  }
  
  Bomb.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    ctx.arc(
      this.game.xOffset + this.x,
      this.game.yOffset + this.y,
      this.radius,
      0,
      2 * Math.PI,
      false
    );
    
    ctx.lineWidth = 3;
    
    ctx.strokeStyle = Bomb.COLOR;
    ctx.stroke();
    
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    //ctx.fill();
  };
})(this);

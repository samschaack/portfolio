(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Moon = Asteroids.Moon = function(x, y, vx, vy, radius, color, mass, game, planet){
    Asteroids.MovingObject.call(this, x, y, vx, vy, radius, color);
    this.mass = mass;
    this.onScreen = false;
    this.game = game;
    this.planet = planet;
  }

  Moon.inherits(Asteroids.MovingObject);

  Moon.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 25;
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
  }

  Moon.prototype.getBins = function() {
    var mapSize = Asteroids.Game.MAP_SIZE,
        binSize = Asteroids.Game.BIN_SIZE,
        numRows = mapSize / binSize,
        binsPerRow = mapSize / binSize;

    this.bin = Math.floor(this.x / binSize) + Math.floor(this.y / binSize) * numRows;
    var curBin = this.bin;
    this.bins = [curBin];

    //left adjacent bin
    if (curBin % binsPerRow !== 0) {
      this.bins.push(curBin - 1);
    }

    //right adjacent bin
    if ((curBin + 1) % binsPerRow !== 0) {
      this.bins.push(curBin + 1);
    }

    //above adjacent bin
    if (curBin > binsPerRow - 1) {
      this.bins.push(curBin - binsPerRow);

      //above left and right corners
      if (curBin % binsPerRow !== 0) {
        this.bins.push(curBin - binsPerRow - 1);
      }
      if ((curBin + 1) % binsPerRow !== 0) {
        this.bins.push(curBin - binsPerRow + 1);
      }
    }

    //below adjacent bin
    if (curBin < binsPerRow * binsPerRow - binsPerRow) {
      this.bins.push(curBin + binsPerRow);
      //bottom left and right corners
      if (curBin % binsPerRow !== 0) {
        this.bins.push(curBin + binsPerRow - 1);
      }
      if ((curBin + 1) % binsPerRow !== 0) {
        this.bins.push(curBin + binsPerRow + 1);
      }
    }
  }

  Moon.prototype.applyForces = function() {
    this.gravity();
  }

  Moon.prototype.gravity = function() {
    var thisMoon = this;
    // if (thisMoon.planet) {
    //   var thisPlanet = thisMoon.planet;

      var fgx = 0;
      var fgy = 0;

    //   var dx = thisPlanet.x - thisMoon.x;
    //   var dy = thisPlanet.y - thisMoon.y;

    //   var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    //   var fg = Asteroids.Game.GRAV_CONST * thisMoon.mass * thisPlanet.mass / Math.pow(d, 2);

    //   fgx += (dx / d) * fg;
    //   fgy += (dy / d) * fg;

    //   thisMoon.vx += fgx;
    //   thisMoon.vy += fgy;
    // }
    this.game.planets.forEach(function(planet) {
      var dx = planet.x - thisMoon.x;
      var dy = planet.y - thisMoon.y;

      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var fg = Asteroids.Game.GRAV_CONST * thisMoon.mass * planet.mass / Math.pow(d, 2);

      if (!thisMoon.isCollidedWith(planet)) {
        fgx += (dx / d) * fg;
        fgy += (dy / d) * fg;
      }
    });
    // this.game.asteroids.forEach(function(asteroid) {
    //   var dx = asteroid.x - thisMoon.x;
    //   var dy = asteroid.y - thisMoon.y;

    //   var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    //   var fg = Asteroids.Game.GRAV_CONST * thisMoon.mass * asteroid.mass / Math.pow(d, 2);

    //   if (!thisMoon.isCollidedWith(asteroid)) {
    //     fgx += .1 * (dx / d) * fg;
    //     fgy += .1 * (dy / d) * fg;
    //   }
    // });
    thisMoon.vx += fgx;
    thisMoon.vy += fgy;
  }
})(this);
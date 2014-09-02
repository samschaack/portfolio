(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Asteroid = Asteroids.Asteroid = function(x, y, vx, vy, radius, color, game, mass, charge){
    var color = randomColor();
    Asteroids.MovingObject.call(this, x, y, vx, vy, radius, color);
    this.onScreen = false;
    this.game = game;
    this.mass = mass;
    var random = Math.random();
    // if (!charge) {
      if (random < .9) { this.charge = 1 }
      else { this.charge = -1 }
    // } else {
    //   this.charge = charge;
    // }
  };

  Asteroid.inherits(Asteroids.MovingObject);
  Asteroid.COLOR = '#000000';
  Asteroid.RADIUS = 10;
  Asteroid.MAXV = 5;
  Asteroid.NUM_ASTEROIDS = 1000;

  Asteroid.prototype.applyForces = function() {
    //this.friction();
    this.gravity();
  }

  Asteroid.prototype.gravity = function() {
    var thisAsteroid = this;

    thisAsteroid.v = Math.sqrt(Math.pow(thisAsteroid.vx, 2) + Math.pow(thisAsteroid.vy, 2));

    var fgx = 0;
    var fgy = 0;

    thisAsteroid.game.planets.forEach(function(planet) {
      var dx = planet.x - thisAsteroid.x;
      var dy = planet.y - thisAsteroid.y;

      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var fg = Asteroids.Game.GRAV_CONST * thisAsteroid.mass * planet.mass / Math.pow(d, 2);

      if (!thisAsteroid.isCollidedWith(planet)) {
        fgx += (dx / d) * fg;
        fgy += (dy / d) * fg;
      }
    })

    thisAsteroid.game.moons.forEach(function(moon) {
      var dx = moon.x - thisAsteroid.x;
      var dy = moon.y - thisAsteroid.y;

      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var fg = Asteroids.Game.GRAV_CONST * thisAsteroid.mass * moon.mass / Math.pow(d, 2);

      if (!thisAsteroid.isCollidedWith(moon)) {
        fgx += (dx / d) * fg;
        fgy += (dy / d) * fg;
      }
    })

    thisAsteroid.game.asteroidBins[thisAsteroid.bin].forEach(function(asteroid) {
      if (asteroid.x !== thisAsteroid.x) {
        var dx = asteroid.x - thisAsteroid.x;
        var dy = asteroid.y - thisAsteroid.y;

        var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        var fg = thisAsteroid.charge * asteroid.charge * Asteroids.Game.GRAV_CONST * thisAsteroid.mass * asteroid.mass / Math.pow(d, 2);

        if (!thisAsteroid.isCollidedWith(asteroid)) {
          fgx += (dx / d) * fg;
          fgy += (dy / d) * fg;
        }
      }
    })

      var dx = thisAsteroid.game.ship.x - thisAsteroid.x;
      var dy = thisAsteroid.game.ship.y - thisAsteroid.y;

      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var fg = Asteroids.Game.GRAV_CONST * thisAsteroid.mass * thisAsteroid.game.ship.mass / Math.pow(d, 2);

      if (!thisAsteroid.isCollidedWith(thisAsteroid.game.ship)) {
        fgx += (dx / d) * fg;
        fgy += (dy / d) * fg;
      }

    thisAsteroid.vx += fgx;
    thisAsteroid.vy += fgy;
  }

  var randomColor = function() {
    var colorHex = "#";

    for (var i = 0; i < 6; i++) {
      var randomNum = parseInt(Math.random() * 15);

      if (randomNum === 10) {
        randomNum = "a";
      } else if (randomNum === 11) {
        randomNum = "b";
      } else if (randomNum === 12) {
        randomNum = "c";
      } else if (randomNum === 13) {
        randomNum = "d";
      } else if (randomNum === 14) {
        randomNum = "e";
      } else if (randomNum === 15) {
        randomNum = "f";
      } else {
        randomNum = randomNum.toString();
      }

      colorHex = colorHex + randomNum;
    }

    return colorHex;
  }

  Asteroid.randomAsteroid = function(dimX, dimY, game){
    var x = Asteroids.Game.MAP_SIZE * Math.random();
    var y = Asteroids.Game.MAP_SIZE * Math.random();

    //make sure no asteroids spawn too close to player
    while (x > game.ship.x - Asteroids.Game.DIM_X / 4 && x < game.ship.x + Asteroids.Game.DIM_X / 4
      || y > game.ship.y - Asteroids.Game.DIM_Y / 4 && y < game.ship.y + Asteroids.Game.DIM_Y / 4) {
      x = Asteroids.Game.MAP_SIZE * Math.random();
      y = Asteroids.Game.MAP_SIZE * Math.random();
    }

    var upOrDown = parseInt(Math.random());

    if (upOrDown === 0) {
      var vx = (this.MAXV * Math.random()) - 1;
      var vy = (this.MAXV * Math.random()) - 1;
    } else {
      var vx = (this.MAXV * Math.random()) + 1;
      var vy = (this.MAXV * Math.random()) + 1;
    }

    var color = randomColor();

    return new Asteroid(x, y, vx, vy, this.RADIUS, color, game);
  }

  Asteroid.asteroidWithRadius = function(dimX, dimY, radius, asteroid, game){
    var x = asteroid.x;
    var y = asteroid.y;

    var upOrDown = parseInt(Math.random());

    if (upOrDown === 0) {
      var vx = (this.MAXV * Math.random()) - 1;
      var vy = (this.MAXV * Math.random()) - 1;
    } else {
      var vx = (this.MAXV * Math.random()) + 1;
      var vy = (this.MAXV * Math.random()) + 1;
    }

    var color = randomColor();

    return new Asteroid(x, y, vx, vy, radius, color, game);
  }

  Asteroid.asteroidWithinRadius = function(x, y, spawnRadius, radius, game, velocityX, velocityY, mass){
    var xA = spawnRadius * Math.random() + x;
    var yA = spawnRadius * Math.random() + y;

    var upOrDown = parseInt(Math.random());

    if (upOrDown === 0) {
      var vx = (velocityX * Math.random()) - 1;
      var vy = (velocityY * Math.random()) - 1;
    } else {
      var vx = (velocityX * Math.random()) + 1;
      var vy = (velocityY * Math.random()) + 1;
    }

    var color = randomColor();

    return new Asteroid(x, y, vx, vy, radius, color, game, mass);
  }

})(this);
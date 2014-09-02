(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Game = Asteroids.Game = function(canvas){
    this.ctx = canvas.getContext("2d");
    this.asteroids = [];
    this.ship = new Asteroids.Ship(this);
    this.bullets = [];
    this.crazy = false;
    this.stars = Game.genStars(this);
    this.lives = Game.DEFAULT_LIVES;
    this.xOffset = -Asteroids.Ship.SPAWN_X;
    this.yOffset = -Asteroids.Ship.SPAWN_Y;
    this.invincible = false;
    this.spawnAsteroidCluster(50, 10150, 10150, 200, 12, this, 1, 1, .8);
    this.spawnAsteroidCluster(50, 11000, 10500, 200, 12, this, 0, 5, .8);
    this.spawnAsteroidCluster(70, 9000, 10000, 200, 12, this, 0, 5, .8);
    this.spawnAsteroidCluster(150, 11500, 11500, 200, 12, this, 0, 5, .8);
    this.spawnAsteroids();
    this.waypoints = [];
    this.planets = [];
    this.planets.push(new Asteroids.Planet(11000, 11000, 0, 0, 200, "green", 200, this));
    this.planets.push(new Asteroids.Planet(9000, 9000, 0, 0, 800, "darkred", 1600, this));
    this.planets.push(new Asteroids.Planet(18000, 3500, 0, 0, 400, "blue", 1600, this));
    this.moons = [];
    this.moons.push(new Asteroids.Moon(11800, 11000, 0, -5, 50, "gray", 5, this, this.planets[0]));
    this.moons.push(new Asteroids.Moon(12800, 11000, 0, 9, 30, "white", 30, this, this.planets[0]));
    this.points = 0;
    //this.zoom = 1;
    this.addPlanetWaypoints();
    this.bombs = [];
    this.recCol = false;
    this.colCount = 0;
    setupHandlers.call(this);
  };

  Game.DIM_X = 1050;
  Game.DIM_Y = 750;
  Game.FPS = 30;
  Game.NUM_STARS = 25000;
  Game.MAP_SIZE = 20000;
  Game.GRAV_CONST = 20;
  Game.DEFAULT_LIVES = 5;
  Game.BIN_SIZE = 500;

  function setupHandlers() {
    var curGame = this;

    $('#game-screen').on('mousedown', function(event) {
      event.stopImmediatePropagation();
      event.preventDefault();

      var $screen = $(this);
      var offset = $screen.offset();

      var clickX = parseInt(event.pageX - offset.left - $screen.width() / 2);
      var clickY = parseInt(event.pageY - offset.top - $screen.height() / 2);

      curGame.ship.handleClick([clickX, clickY]);
    });

    $('html').keypress(function(e) {
      if (e.which == 32) {
        e.preventDefault();
      }
    });
  }

  Game.prototype.addPlanetWaypoints = function() {
    var curGame = this;
    this.planets.forEach(function(planet) {
      curGame.addWaypoint(planet, curGame.ship);
    });
  }

  Game.prototype.addWaypoint = function(obj, ship) {
    this.waypoints.push(new Asteroids.Waypoint(this, obj, ship))
  }

  Game.prototype.addAsteroids = function(numAsteroids, game) {
    for (var i = 0; i < numAsteroids; i++) {
      this.asteroids.push(Asteroids.Asteroid.randomAsteroid(Game.DIM_X, Game.DIM_Y, this));
    }
  }

  Game.prototype.addAsteroidsWithRadius = function(numAsteroids, radius, asteroid, game) {
    for (var i = 0; i < numAsteroids; i++) {
      this.asteroids.push(Asteroids.Asteroid.asteroidWithRadius(Game.DIM_X, Game.DIM_Y, radius, asteroid, this));
    }
  }

  Game.prototype.spawnAsteroidCluster = function(numAsteroids, x, y, spawnRadius, radius, game, velocityX, velocityY, mass) {
    for (var i = 0; i < numAsteroids; i++) {
      this.asteroids.push(Asteroids.Asteroid.asteroidWithinRadius(x, y, spawnRadius, radius, this, velocityX, velocityY, mass));
    }
  }

  Game.genStars = function(game) {
    stars = [];

    for (var i = 0; i < Game.NUM_STARS; i++) {
      stars.push(Asteroids.Star.randomStar(game));
    }

    return stars;
  }

  Game.prototype.draw = function() {
    var curGame = this;

    if (!this.crazy) {
      // this.ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
      this.ctx.fillStyle = 'black';
      // this.ctx.fillRect(this.xOffset, this.yOffset, this.xOffset + Game.DIM_X, this.yOffset + Game.DIM_Y);
      this.ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);
    }
    //stars
    this.stars.forEach(function(star) {
      if (star.onScreen) {
        star.draw(curGame.ctx);
      }
    });

    //bombs
    this.bombs.forEach(function(bomb) {
      bomb.draw(curGame.ctx);
    });

    //Asteroids
    this.asteroids.forEach(function(asteroid) {
      if (asteroid.onScreen) {
        asteroid.draw(curGame.ctx);
      }
    });

    //Ship
    if (!this.invincible) {
      this.ship.draw(curGame.ctx);
    } else {
      if (this.ticker % 5 === 0) {
        this.ship.draw(curGame.ctx);
      }
    }

    //Bullets
    this.bullets.forEach(function(bullet) {
      bullet.draw(curGame.ctx);
    });

    //planets
    this.planets.forEach(function(planet) {
      if (planet.onScreen) {
        planet.draw(curGame.ctx);
      }
    });

    //moons
    this.moons.forEach(function(moon) {
      if (moon.onScreen) {
        moon.draw(curGame.ctx);
      }
    });

    //lives
    for (var l = 0; l < curGame.lives; l++) {
      Asteroids.Ship.draw(curGame.ctx, -Math.PI / 2, 20 * l + 20, 21)
    }

    //flame
    if (curGame.flame.activated === true) {
      if (!this.invincible) {
        curGame.flame.draw(curGame.ctx);
      } else {
        if (this.ticker % 5 === 0) {
          curGame.flame.draw(curGame.ctx);
        }
      }
    }

    //waypoints
    this.waypoints.forEach(function(waypoint) {
      if (waypoint.visible) {
        waypoint.draw(curGame.ctx);
      }
    });
  }

  Game.prototype.move = function() {
    this.asteroids.forEach(function(asteroid) {
      asteroid.move();
    });

    this.ship.move();

    this.bullets.forEach(function(bullet) {
      bullet.move();
    });

    // this.hitAsteroids();

    this.moons.forEach(function(moon) {
      moon.move();
    });

    this.waypoints.forEach(function(waypoint) {
      waypoint.move();
    });

    this.bombs.forEach(function(bomb) {
      bomb.move();
    });
  }

  Game.prototype.removeOffScreenBullets = function(){
    var curGame = this;
    this.bullets.forEach(function(bullet){
      if (curGame.offScreen(bullet)) {
        curGame.removeBullet(bullet);
      }
    });
  }

  Game.prototype.offScreen = function(obj){
    if ((obj.x + obj.radius) < -this.xOffset) {
      return true;
    }
    if ((obj.x - obj.radius) > -this.xOffset + Game.DIM_X) {
      return true;
    }
    if ((obj.y + obj.radius) < -this.yOffset) {
      return true;
    }
    if ((obj.y - obj.radius) > -this.yOffset + Game.DIM_Y) {
      return true;
    }
    return false;
  }

  Game.prototype.binAsteroids = function() {
    this.asteroidBins = {};
    this.asteroids.forEach(function(asteroid) {
      asteroid.bin = Math.floor((asteroid.x + asteroid.y) / Game.BIN_SIZE);
      if (!this.asteroidBins[asteroid.bin]) {
        this.asteroidBins[asteroid.bin] = [];
      } else {
        this.asteroidBins[asteroid.bin].push(asteroid);
      }
    }.bind(this));
  }

  Game.prototype.renderOuterInterface = function() {
    var score = this.asteroids.length + " Asteroids Left!";
    document.getElementById('lblScore').innerHTML = score;
    document.getElementById('lblCoords').innerHTML = "X: " + parseInt(this.ship.x)
    + " Y: " + parseInt(this.ship.y) + " Velocity: " + parseInt(this.ship.v)
    + " Resources: " + this.points;
  }

  Game.prototype.step = function() {
    curGame = this;

    this.stars.forEach(function(star) {
      if (!curGame.offScreen(star)) {
        star.onScreen = true;
      } else {
        star.onScreen = false;
      }
    });

    var onScreenAsteroids = [];
    this.asteroids.forEach(function(asteroid) {
      if (!curGame.offScreen(asteroid)) {
        asteroid.onScreen = true;
        onScreenAsteroids.push(asteroid);
      } else {
        asteroid.onScreen = false;
      }
    });

    this.planets.forEach(function(planet) {
      if (!curGame.offScreen(planet)) {
        planet.onScreen = true;
      } else {
        planet.onScreen = false;
      }
    });

    this.moons.forEach(function(moon) {
      if (!curGame.offScreen(moon)) {
        moon.onScreen = true;
      } else {
        moon.onScreen = false;
      }
    });

    //apply forces
    this.ship.applyForces();
    this.moons.forEach(function(moon) {
      moon.gravity();
    })
    this.binAsteroids();
    this.asteroids.forEach(function(asteroid) {
     asteroid.applyForces();
    });

    this.checkKeys();
    this.move();
    this.draw();
    this.removeOffScreenBullets();
    this.renderOuterInterface();

    this.planets.forEach(function(planet) {
      if (curGame.ship.isCollidedWith(planet)) {
        this.recCollided = true;
        var ship = curGame.ship;
        var theta = Math.atan((ship.y - planet.y) / (ship.x - planet.x));
        var normX = ship.vx / ship.v;
        var normY = ship.vy / ship.v;

        var alphaTop = Math.abs(normX * normY + Math.sin(theta) * Math.cos(theta));
        var alphaBottomLeft = Math.sqrt((normX * normX) + (Math.sin(theta) * Math.sin(theta)));
        var alphaBottomRight = Math.sqrt((normY * normY) + (Math.cos(theta) * Math.cos(theta)));

        var alpha = Math.acos(alphaTop / (alphaBottomLeft + alphaBottomRight));

        var vdotn = ship.vx * Math.cos(theta) + ship.vy * Math.sin(theta);

        ship.vx = 1 * -2 * (vdotn) * Math.cos(theta) + ship.vx;
        ship.vy = 1 * -2 * (vdotn) * Math.sin(theta) + ship.vy;
      }

      curGame.asteroids.forEach(function(asteroid) {
        if (asteroid.isCollidedWith(planet)) {
          var v = Math.sqrt(asteroid.vx * asteroid.vx + asteroid.vy * asteroid.vy)
          if (v > .1) {
            var theta = Math.atan((asteroid.y - planet.y) / (asteroid.x - planet.x));
            var vdotn = asteroid.vx * Math.cos(theta) + asteroid.vy * Math.sin(theta);
            asteroid.vx = 1 * -2 * (vdotn) * Math.cos(theta) + asteroid.vx;
            asteroid.vy = 1 * -2 * (vdotn) * Math.sin(theta) + asteroid.vy;
          } else {
            asteroid.vx = 0;
            asteroid.vy = 0;
          }
        }
      });

      curGame.bombs.forEach(function(bomb) {
        if (bomb.isCollidedWith(planet)) {
          var v = Math.sqrt(bomb.vx * bomb.vx + bomb.vy * bomb.vy)
          if (v > .1) {
            var theta = Math.atan((bomb.y - planet.y) / (bomb.x - planet.x));
            var vdotn = bomb.vx * Math.cos(theta) + bomb.vy * Math.sin(theta);
            bomb.vx = 1 * -2 * (vdotn) * Math.cos(theta) + bomb.vx;
            bomb.vy = 1 * -2 * (vdotn) * Math.sin(theta) + bomb.vy;
          } else {
            bomb.vx = 0;
            bomb.vy = 0;
          }
        }
      });
    });

    this.moons.forEach(function(moon) {
      if (curGame.ship.isCollidedWith(moon) && curGame.recCol === false) {
        curGame.recCol = true;
        var moonV = Math.sqrt(Math.pow(moon.vx, 2) + Math.pow(moon.vy, 2));
        var moonAngle = Math.acos(moon.vx / moonV);
        var ship = curGame.ship;
        var theta = Math.atan((ship.y - moon.y) / (ship.x - moon.x));
        var distance = Math.sqrt(Math.pow(ship.x - moon.x, 2) + Math.pow(ship.y - moon.y, 2));
        // var deltaVx = moon.vx - ship.vx;
        // var deltaVy = moon.vy - ship.vy;
        // var deltaV = Math.sqrt(deltaVx * deltaVx + deltaVy * deltaVy);
        var shipV = Math.sqrt(Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2));
        var shipAngle = Math.acos(ship.vx / shipV);

        theta = Math.PI - theta;
        if (ship.x - moon.x > 0 && ship.y - moon.y > 0) {
          theta += Math.PI;
        } else if (ship.x - moon.x > 0 && ship.y - moon.y < 0) {
          theta -= Math.PI;
        }

        var diffX = ship.x - (moon.x + (ship.radius + moon.radius * Math.cos(theta)));
        var diffY = ship.y - (moon.y - (ship.radius + moon.radius) * Math.sin(theta));

        if (theta > 0 && theta <= Math.PI) {
          ship.vx = Math.cos(theta) * (shipV * Math.cos(shipAngle - theta) * (ship.mass - moon.mass) + 2 * moon.mass * moonV * Math.cos(moonAngle - theta)) / (ship.mass + moon.mass) + shipV * Math.sin(shipAngle - theta) * Math.cos(theta + Math.PI / 2);
          ship.vy = -Math.sin(theta) * (shipV * Math.cos(shipAngle - theta) * (ship.mass - moon.mass) + 2 * moon.mass * moonV * Math.cos(moonAngle - theta)) / (ship.mass + moon.mass) + shipV * Math.sin(shipAngle - theta) * Math.sin(theta + Math.PI / 2);
        } else {
          ship.vx = -Math.cos(theta) * (shipV * Math.cos(shipAngle - theta) * (ship.mass - moon.mass) + 2 * moon.mass * moonV * Math.cos(moonAngle - theta)) / (ship.mass + moon.mass) + shipV * Math.sin(shipAngle - theta) * Math.cos(theta + Math.PI / 2);
          ship.vy = Math.sin(theta) * (shipV * Math.cos(shipAngle - theta) * (ship.mass - moon.mass) + 2 * moon.mass * moonV * Math.cos(moonAngle - theta)) / (ship.mass + moon.mass) + shipV * Math.sin(shipAngle - theta) * Math.sin(theta + Math.PI / 2);
        }
      } else {
        if (curGame.recCol === true && curGame.colCount < 20) {
          curGame.colCount += 1;
        } else if (curGame.recCol === true && curGame.colCount === 20) {
          curGame.colCount = 0;
          curGame.recCol = false;
        }
      }
    });

    //collisions
    //ship-asteroid collisions
    this.asteroidsToBreak = [];

    var collision = this.checkCollisions();

    //bullet-asteroid collisions
    this.hitAsteroids();

    this.breakAsteroids(this.asteroidsToBreak);

    if (collision === 1) {
      this.points += 10;
    } else if (collision === true && this.invincible === false) {
      //this.lives -= 1;
      this.invincible = true;
      this.ticker = 0;
      var blinkInterval = setInterval(function() {
        curGame.ticker += 1;
      }, 50)
      var deathInterval = setInterval(function() {
        curGame.invincible = false;
        clearInterval(deathInterval); 
        clearInterval(blinkInterval);
      }, 5000);

      if (this.lives == 0) {
        this.ship.blowUpAndEndGame(this);
        this.ship.radius = 0;
        this.draw();
        this.stop();
      }
    } else {
    }

    if (this.asteroids.length === 0) {
      alert('You Win!')
      this.stop();
    }
  }

  Game.prototype.start = function() {
    this.timer = setInterval(this.step.bind(this), Game.FPS);
  }

  Game.prototype.checkCollisions = function() {
    var curGame = this;
    var collided = false;
    var pickup = false;
    var deleteIndices = [];

    this.asteroids.forEach(function(asteroid, index){
      if (asteroid.onScreen) {
        if (curGame.ship.isCollidedWith(asteroid)) {
          deleteIndices.push(index);
          curGame.asteroidsToBreak.push(asteroid);
          if (asteroid.mass === .2) {
            pickup = true;
          }
          collided = true;
        }
      }
      if (asteroid.x < 0 || asteroid.y < 0 || asteroid.x > Game.MAP_SIZE || asteroid.y > Game.MAP_SIZE) {
        if (asteroid.x < 0 || asteroid.x > Game.MAP_SIZE) { asteroid.vx *= -1 }
        if (asteroid.y < 0 || asteroid.y > Game.MAP_SIZE) { asteroid.vy *= -1 }
      }
    });

    deleteIndices.forEach(function(index) {
      curGame.removeAsteroid(curGame.asteroids[index]);
    });

    if (pickup === true) {
      return 1;
    } else {
      return collided;
    }
  }

  Game.prototype.stop = function() {
    clearInterval(this.timer);
  }

  Game.prototype.checkKeys = function(){
    var curGame = this;

    if (key.isPressed('w')) {
      curGame.ship.power();
    } else {
      this.flame.activated = false;
    }

    if (key.isPressed('a')) {
      curGame.ship.angle -= .15;
    }

    if (key.isPressed('s')) {
      curGame.ship.reverseThruster(.145);
    }

    if (key.isPressed('d')) {
      curGame.ship.angle += .15;
    }

    if (key.isPressed('space')) {
      curGame.ship.activeWeapon = 'single';

      $('#game-screen').css("border", "2px solid red");
      $('#game-screen').css("box-shadow", "0 0 2em red");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('m')) {
      curGame.ship.activeWeapon = 'multi';

      $('#game-screen').css("border", "2px solid #00F815");
      $('#game-screen').css("box-shadow", "0 0 2em #00F815");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('v')) {
      curGame.ship.activeWeapon = 'circle';

      $('#game-screen').css("border", "2px solid #FF0DFF");
      $('#game-screen').css("box-shadow", "0 0 2em #FF0DFF");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    // if (key.isPressed('b')) {
    //   curGame.bombs.push(new Asteroids.Bomb(curGame.ship.x, curGame.ship.y, curGame.ship.vx, curGame.ship.vy, curGame, 20, false));
    // }

    // if (key.isPressed('l')) {
    //   curGame.bombs.push(new Asteroids.Bomb(curGame.ship.x, curGame.ship.y, curGame.ship.vx, curGame.ship.vy, curGame, 20, true));
    // }
  }

  Game.prototype.hitAsteroids = function(){
    var curGame = this;
    var deleteAsteroidIndices = [];
    var deleteBulletIndices = [];

    curGame.bullets.forEach(function(bullet, bIndex) {
      curGame.asteroids.forEach(function(asteroid, aIndex) {
        if (asteroid.onScreen) {
          if (bullet.isCollidedWith(asteroid)) {
            // curGame.removeBullet(bullet);
            // curGame.removeAsteroid(asteroid);
            if (deleteBulletIndices.indexOf(bIndex) === -1) { deleteBulletIndices.push(bIndex) }
            if (deleteAsteroidIndices.indexOf(aIndex) === -1) { deleteAsteroidIndices.push(aIndex) }
            if (curGame.asteroidsToBreak.indexOf(aIndex) === -1) { curGame.asteroidsToBreak.push(asteroid) }
          }
        }
      });
    });

    // curGame.bombs.forEach(function(bomb) {
    //   curGame.asteroids.forEach(function(asteroid) {
    //     if (bomb.isCollidedWith(asteroid)) {
    //       curGame.removeAsteroid(asteroid);
    //     }
    //   });
    // });

    deleteBulletIndices.forEach(function(index) {
      curGame.removeBullet(curGame.bullets[index]);
    });

    deleteAsteroidIndices.forEach(function(index) {
      curGame.removeAsteroid(curGame.asteroids[index]);
    });
  }

  Game.prototype.spawnAsteroids = function() {
    curGame = this;

    for (var i = 0; i < Asteroids.Asteroid.NUM_ASTEROIDS; i++) {
      var x = Game.MAP_SIZE * Math.random();
      var y = Game.MAP_SIZE * Math.random();

      //make sure no asteroids spawn too close to player
      while (x > curGame.ship.x - Game.DIM_X / 4 && x < curGame.ship.x + Game.DIM_X / 4
        || y > curGame.ship.y - Game.DIM_Y / 4 && y < curGame.ship.y + Game.DIM_Y / 4) {
        x = Game.MAP_SIZE * Math.random();
        y = Game.MAP_SIZE * Math.random();
      }

      var upOrDown = parseInt(Math.random());

      if (upOrDown === 0) {
        var vx = (Asteroids.Asteroid.MAXV * Math.random()) - 1;
        var vy = (Asteroids.Asteroid.MAXV * Math.random()) - 1;
      } else {
        var vx = (Asteroids.Asteroid.MAXV * Math.random()) + 1;
        var vy = (Asteroids.Asteroid.MAXV * Math.random()) + 1;
      }

      var mass;
      var radius;
      var chooseMass = parseInt(3 * Math.random());

      if (chooseMass === 0) {
        mass = .8;
        radius = 12;
      } else if (chooseMass === 1) {
        mass = .6;
        radius = 9;
      } else if (chooseMass === 2) {
        mass = .4;
        radius = 6;
      }

      this.asteroids.push(new Asteroids.Asteroid(x, y, vx, vy, radius, null, curGame, mass));
    }
  }

  //asteroid breaking with conservation of momentum

  Game.prototype.breakAsteroid = function(asteroid) {
    var curGame = this;
    var v = Math.sqrt(Math.pow(asteroid.vx, 2) + Math.pow(asteroid.vy, 2));
    var momentum = v * asteroid.mass;
    var x = asteroid.x;
    var y = asteroid.y;
    var charge = asteroid.charge;

    if (asteroid.mass === .8) {
      var randA = parseInt(4 * Math.random());

      if (randA === 0) {
        var vx1 = asteroid.vx * Math.random();
        var vx2 = asteroid.vx * Math.random();

        var difference = vx1 + vx2 - asteroid.vx;

        vx1 -= difference / 2;
        vx2 -= difference / 2;

        var vy1 = asteroid.vy * Math.random();
        var vy2 = asteroid.vy * Math.random();

        difference = vy1 + vy2 - asteroid.vy;

        vy1 -= difference / 2;
        vy2 -= difference / 2;

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 9, null, curGame, .6, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, curGame, .2, charge));
      } else if (randA === 1) {
        var vx1 = asteroid.vx * Math.random();
        var vx2 = asteroid.vx * Math.random();
        var vx3 = asteroid.vx * Math.random();
        var vx4 = asteroid.vx * Math.random();

        var difference = vx1 + vx2 + vx3 + vx4 - asteroid.vx;

        vx1 -= difference / 4;
        vx2 -= difference / 4;
        vx3 -= difference / 4;
        vx4 -= difference / 4;

        var vy1 = asteroid.vy * Math.random();
        var vy2 = asteroid.vy * Math.random();
        var vy3 = asteroid.vy * Math.random();
        var vy4 = asteroid.vy * Math.random();

        var difference = vy1 + vy2 + vy3 + vy4 - asteroid.vy;

        vy1 -= difference / 4;
        vy2 -= difference / 4;
        vy3 -= difference / 4;
        vy4 -= difference / 4;

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 3, null, curGame, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, curGame, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx3, vy3, 3, null, curGame, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx4, vy4, 3, null, curGame, .2, charge));
      } else if (randA === 2) {
        var vx1 = asteroid.vx * Math.random();
        var vx2 = asteroid.vx * Math.random();
        var vx3 = asteroid.vx * Math.random();

        var difference = vx1 + vx2 + vx3 - asteroid.vx;

        vx1 -= difference / 3;
        vx2 -= difference / 3;
        vx3 -= difference / 3;

        var vy1 = asteroid.vy * Math.random();
        var vy2 = asteroid.vy * Math.random();
        var vy3 = asteroid.vy * Math.random();

        var difference = vy1 + vy2 + vy3 - asteroid.vy;

        vy1 -= difference / 3;
        vy2 -= difference / 3;
        vy3 -= difference / 3;

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 6, null, curGame, .4, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, curGame, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx3, vy3, 3, null, curGame, .2, charge));
      } else {
        var vx1 = asteroid.vx * Math.random();
        var vx2 = asteroid.vx * Math.random();

        var difference = vx1 + vx2 - asteroid.vx;

        vx1 -= difference / 2;
        vx2 -= difference / 2;

        var vy1 = asteroid.vy * Math.random();
        var vy2 = asteroid.vy * Math.random();

        difference = vy1 + vy2 - asteroid.vy;

        vy1 -= difference / 2;
        vy2 -= difference / 2;

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 6, null, curGame, .4, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 6, null, curGame, .4, charge));
      }
    } else if (asteroid.mass === .6) {
      var randA = parseInt(2 * Math.random());

      if (randA === 0) {
        var vx1 = asteroid.vx * Math.random();
        var vx2 = asteroid.vx * Math.random();

        var difference = vx1 + vx2 - asteroid.vx;

        vx1 -= difference / 2;
        vx2 -= difference / 2;

        var vy1 = asteroid.vy * Math.random();
        var vy2 = asteroid.vy * Math.random();

        difference = vy1 + vy2 - asteroid.vy;

        vy1 -= difference / 2;
        vy2 -= difference / 2;

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 6, null, curGame, .4, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, curGame, .2, charge));
      } else {
        var vx1 = asteroid.vx * Math.random();
        var vx2 = asteroid.vx * Math.random();
        var vx3 = asteroid.vx * Math.random();

        var difference = vx1 + vx2 + vx3 - asteroid.vx;

        vx1 -= difference / 3;
        vx2 -= difference / 3;
        vx3 -= difference / 3;

        var vy1 = asteroid.vy * Math.random();
        var vy2 = asteroid.vy * Math.random();
        var vy3 = asteroid.vy * Math.random();

        var difference = vy1 + vy2 + vy3 - asteroid.vy;

        vy1 -= difference / 2;
        vy2 -= difference / 2;
        vy3 -= difference / 2;

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 3, null, curGame, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, curGame, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx3, vy3, 3, null, curGame, .2, charge));
      }
    } else if (asteroid.mass === .4) {
      var vx1 = asteroid.vx * Math.random();
      var vx2 = asteroid.vx * Math.random();

      var difference = vx1 + vx2 - asteroid.vx;

      vx1 -= difference / 2;
      vx2 -= difference / 2;

      var vy1 = asteroid.vy * Math.random();
      var vy2 = asteroid.vy * Math.random();

      difference = vy1 + vy2 - asteroid.vy;

      vy1 -= difference / 2;
      vy2 -= difference / 2;

      this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 3, null, curGame, .2, charge));
      this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, curGame, .2, charge));
    } else if (asteroid.mass === .3) {
      //give resources if broken with ship (tractor beam??);
    }
  }

  Game.prototype.removeAsteroid = function(asteroid) {
    var index = this.asteroids.indexOf(asteroid);

    this.asteroids.splice(index, 1);
    // this.breakAsteroid(asteroid);
  }

  Game.prototype.breakAsteroids = function(asteroids) {
    asteroids.forEach(function(asteroid) {
      this.breakAsteroid(asteroid);
    }.bind(this));
  }

  Game.prototype.removeAsteroidNoBreak = function(asteroid) {
    var index = this.asteroids.indexOf(asteroid);

    this.asteroids.splice(index, 1);
  }

  Game.prototype.removeBullet = function(bullet) {
    var index = this.bullets.indexOf(bullet);
    this.bullets.splice(index, 1);
  }

})(this);
(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Game = Asteroids.Game = function(canvas){
    this.ctx = canvas.getContext("2d");
    this.asteroids = [];
    this.ship = new Asteroids.Ship(this);
    this.shield = new Asteroids.Shield(this);
    this.bullets = [];
    this.enemyBullets = [];
    this.crazy = false;
    this.stars = Game.genStars(this);
    this.lives = Game.DEFAULT_LIVES;
    this.xOffset = -Asteroids.Ship.SPAWN_X;
    this.yOffset = -Asteroids.Ship.SPAWN_Y;
    this.invincible = false;
    // this.spawnAsteroidCluster(200, 10650, 10400, 300, 12, this, 0, -10.4, .8);
    ticker = 0;
    //orbiting clusters
    // this.spawnAsteroidCluster(50, 10450, 10400, 30, 12, this, 0, 2.4, .8);
    // this.spawnAsteroidCluster(50, 10650, 10400, 30, 12, this, 0, -2.4, .8);
    //default
    this.spawnAsteroidCluster(60, 10150, 10150, 50, 12, this, 1, 1, .8);
    this.spawnAsteroidCluster(50, 11000, 10500, 20, 12, this, 0, 5, .8);
    this.spawnAsteroidCluster(70, 9000, 10000, 100, 12, this, 0, 5, .8);
    this.spawnAsteroidCluster(100, 11500, 11500, 5, 12, this, 0, 5, .8);
    //rings
    // this.spawnAsteroidCluster(50, 10100, 10050, 50, 12, this, 6, 0, .8);
    this.spawnAsteroids();
    this.waypoints = [];
    this.planets = [];
    // this.planets.push(new Asteroids.Planet(11000, 11000, 0, 0, 200, "green", 200, this));
    this.planets.push(new Asteroids.Planet(9000, 9000, 0, 0, 800, "darkred", 1600, this));
    this.planets.push(new Asteroids.Planet(18000, 3500, 0, 0, 400, "blue", 1600, this));
    this.enemyPlanet = new Asteroids.Planet(3500, 3500, 0, 0, 600, "darkgreen", 1000, this);
    this.enemyPlanetHealth = 200000;
    this.planets.push(this.enemyPlanet);
    this.moons = [];
    this.moons.push(new Asteroids.Moon(10600, 10600, 0, 0, 45, "gray", 20, this, this.planets[0]));
    // this.moons.push(new Asteroids.Moon(7600, 7600, 0, 9, 50, "white", 30, this, this.planets[0]));
    // this.moons.push(new Asteroids.Moon(11800, 11000, 0, -5, 50, "gray", 5, this, this.planets[0]));
    // this.moons.push(new Asteroids.Moon(11800, 11000, 0, -10, 50, "gray", 25, this, this.planets[0]));
    //test moon
    // this.moons.push(new Asteroids.Moon(11800, 11000, 0, 1, 50, "gray", 25, this, undefined));
    this.enemies = [];
    this.genEnemyAttackers();
    this.genEnemyTurrets();
    this.genEnemyDefenders();
    this.genEnemyPatrollers();
    // this.moons.push(new Asteroids.Moon(12800, 11000, 0, 9, 30, "white", 30, this, this.planets[0]));
    this.points = 0;
    //this.zoom = 1;
    this.addPlanetWaypoints();
    this.addMoonWaypoints();
    this.bombs = [];
    this.recCol = false;
    this.colCount = 0;
    this.smallerBins = false;
    this.maxHealth = 1000;
    this.maxMulti = 1000;
    this.maxShieldEnergy = 1000;
    this.health = 1000;
    this.multi = 1000;
    this.shieldEnergy = 1000;
    setupHandlers.call(this);
    maxBin = [0, [0, 0]];
  };

  // Game.DIM_X = 1050;
  // Game.DIM_Y = 750;
  Game.DIM_X = 1350;
  Game.DIM_Y = 850;
  Game.FPS = 30;
  Game.NUM_STARS = 25000;
  Game.MAP_SIZE = 20000;
  Game.GRAV_CONST = 20;
  Game.DEFAULT_LIVES = 5;
  Game.BIN_SIZE = 250;

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

  Game.prototype.addMoonWaypoints = function() {
    var curGame = this;
    this.moons.forEach(function(moon) {
      curGame.addWaypoint(moon, curGame.ship);
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
      this.asteroids.push(Asteroids.Asteroid.asteroidWithinRadius({
        x: x, y: y,
        spawnRadius: spawnRadius, radius: radius,
        game: this,
        velocityX: velocityX, velocityY: velocityY,
        mass: mass
      }));
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
    this.onScreenStars.forEach(function(star) {
      star.draw(curGame.ctx);
    });

    //Asteroids
    this.onScreenAsteroids.forEach(function(asteroid) {
      asteroid.draw(curGame.ctx);
    });

    //Ship
    if (!this.invincible) {
      this.ship.draw(curGame.ctx);
    } else {
      if (this.ticker % 5 === 0) {
        this.ship.draw(curGame.ctx);
      }
    }

    if (this.shieldOn) {
      this.shield.draw(curGame.ctx);
    }

    this.onScreenEnemies.forEach(function(enemyShip) {
      enemyShip.draw(curGame.ctx);
    });

    //Bullets
    this.bullets.forEach(function(bullet) {
      bullet.draw(curGame.ctx);
    });

    //Enemy Bullets
    this.enemyBullets.forEach(function(bullet) {
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
      Asteroids.Ship.draw(curGame.ctx, -Math.PI / 2, (Game.DIM_X / 2) - 10 - (l - curGame.lives / 2) * 22.75, 21);
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

    this.enemies.forEach(function(enemyShip) {
      enemyShip.step();
    });

    this.bullets.forEach(function(bullet) {
      bullet.move();
    });

    this.enemyBullets.forEach(function(bullet) {
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
    this.enemyBullets.forEach(function(bullet){
      if (curGame.offScreen(bullet)) {
        curGame.removeEnemyBullet(bullet);
      }
    });
  }

  Game.prototype.offScreen = function(obj){
    if ((obj.x + obj.radius) < -this.xOffset - 400) {
      return true;
    }
    if ((obj.x - obj.radius) > -this.xOffset + Game.DIM_X + 400) {
      return true;
    }
    if ((obj.y + obj.radius) < -this.yOffset - 400) {
      return true;
    }
    if ((obj.y - obj.radius) > -this.yOffset + Game.DIM_Y + 400) {
      return true;
    }
    return false;
  }

  Game.prototype.binAsteroids = function() {
    var binSize = Game.BIN_SIZE,
        numRows = Game.MAP_SIZE / binSize;
    this.asteroidBins = {};
    this.asteroids.forEach(function(asteroid) {
      asteroid.bin = Math.floor(asteroid.x / binSize) + Math.floor(asteroid.y / binSize) * numRows;
      if (!this.asteroidBins[asteroid.bin]) {
        this.asteroidBins[asteroid.bin] = [];
      } else {
        this.asteroidBins[asteroid.bin].push(asteroid);
      }
    }.bind(this));
  }

  Game.prototype.binMoons = function() {
    this.moons.forEach(function(moon) {
      moon.getBins();
    });
  }

  Game.prototype.renderOuterInterface = function() {
    document.getElementById('lblScore').innerHTML = "Resources: " + this.points + " Kills: " + this.ship.kills;
  }

  Game.prototype.step = function() {
    curGame = this;

    var t = new Date();

    this.onScreenStars = [];
    this.stars.forEach(function(star) {
      if (!curGame.offScreen(star)) {
        star.onScreen = true;
        curGame.onScreenStars.push(star);
      } else {
        star.onScreen = false;
      }
    });

    this.onScreenAsteroids = [];
    this.asteroids.forEach(function(asteroid) {
      if (!curGame.offScreen(asteroid)) {
        asteroid.onScreen = true;
        curGame.onScreenAsteroids.push(asteroid);
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

    this.onScreenEnemies = [];
    this.enemies.forEach(function(enemyShip) {
      if (!curGame.offScreen(enemyShip)) {
        enemyShip.onScreen = true;
        curGame.onScreenEnemies.push(enemyShip);
      } else {
        enemyShip.onScreen = false;
      }
    });

    this.binAsteroids();
    this.binMoons();

    var aT = new Date();
    this.asteroids.forEach(function(asteroid) {
     asteroid.applyForces();
    });
    aT = new Date() - aT;

    if (aT > 20) {
      Game.BIN_SIZE = 100;
    } else {
      Game.BIN_SIZE = 250;
    }

    if (aT > 100) {
      this.moons = [];
    }

    this.moons.forEach(function(moon) {
      // moon.bins.forEach(function(bin) {
      //   if (curGame.asteroidBins[bin]) {
      //     curGame.asteroidBins[bin].forEach(function(asteroid) {
      //       curGame.checkTwoBodyCollision(moon, asteroid);
      //     });
      //   }
      // });
      curGame.asteroids.forEach(function(asteroid) {
          curGame.checkTwoBodyCollision(moon, asteroid);
      });
      if (curGame.ship.isCollidedWith(moon)) {
        var ship = curGame.ship;
        var dx = moon.x - curGame.ship.x,
            dy = moon.y - curGame.ship.y;
        var moonV = Math.sqrt(Math.pow(moon.vx, 2) + Math.pow(moon.vy, 2));
        var shipV = Math.sqrt(Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2));
        var theta;
        // if (dx === 0) {
          // theta = Math.PI / 2;
        // } else {
          theta = Math.atan(dy / dx);
        // }
        theta = Math.PI - theta;
        if (ship.x - moon.x > 0 && ship.y - moon.y > 0) {
          theta += Math.PI;
        } else if (ship.x - moon.x > 0 && ship.y - moon.y < 0) {
          theta -= Math.PI;
        }

        var shipVRatio = shipV / (shipV + moonV);
        var moonVRatio = moonV / (shipV + moonV);
        var diff = moon.radius + ship.radius - (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

        ship.x += 1.05 * diff * shipVRatio * Math.cos(theta);
        ship.y += (1.05 * diff * shipVRatio * Math.sin(theta));
        curGame.xOffset -= 1.05 * diff * shipVRatio * Math.cos(theta);
        curGame.yOffset -= (1.05 * diff * shipVRatio * Math.sin(theta));
        curGame.shield.x = ship.x;
        curGame.shield.y = ship.y;

        moon.x -= 1.05 * diff * moonVRatio * Math.cos(theta);
        moon.y -= -(1.05 * diff * moonVRatio * Math.sin(theta));

        //recalculate stuff
        dx = moon.x - curGame.ship.x;
        dy = moon.y - curGame.ship.y;
        moonV = Math.sqrt(Math.pow(moon.vx, 2) + Math.pow(moon.vy, 2));
        var moonAngle = Math.acos(moon.vx / moonV);
        shipV = Math.sqrt(Math.pow(ship.vx, 2) + Math.pow(ship.vy, 2));
        var shipAngle = Math.acos(ship.vx / shipV);

        theta = Math.atan(dy / dx);

        theta = Math.PI - theta;
        if (ship.x - moon.x > 0 && ship.y - moon.y > 0) {
          theta += Math.PI;
        } else if (ship.x - moon.x > 0 && ship.y - moon.y < 0) {
          theta -= Math.PI;
        }

        if (ship.vy > 0) {
          shipAngle += Math.PI;
        }

        if (moon.vy > 0) {
          moonAngle += Math.PI;
        }

        ship.vx = Math.cos(theta) * (shipV * Math.cos(shipAngle - theta) * (5 * ship.mass - moon.mass) + 2 * moon.mass * moonV * Math.cos(moonAngle - theta)) / (5 * ship.mass + moon.mass) + shipV * Math.sin(shipAngle - theta) * Math.cos(theta + Math.PI / 2);
        ship.vy = -(Math.sin(theta) * (shipV * Math.cos(shipAngle - theta) * (5 * ship.mass - moon.mass) + 2 * moon.mass * moonV * Math.cos(moonAngle - theta)) / (5 * ship.mass + moon.mass) + shipV * Math.sin(shipAngle - theta) * Math.sin(theta + Math.PI / 2));

        moon.vx = Math.cos(theta) * (moonV * Math.cos(moonAngle - theta) * (moon.mass - 5 * ship.mass) + 2 * 5 * ship.mass * shipV * Math.cos(shipAngle - theta)) / (moon.mass + 5 * ship.mass) + moonV * Math.sin(moonAngle - theta) * Math.cos(theta + Math.PI / 2);
        moon.vy = -(Math.sin(theta) * (moonV * Math.cos(moonAngle - theta) * (moon.mass - 5 * ship.mass) + 2 * 5 * ship.mass * shipV * Math.cos(shipAngle - theta)) / (moon.mass + 5 * ship.mass) + moonV * Math.sin(moonAngle - theta) * Math.sin(theta + Math.PI / 2));
      }
      curGame.onScreenEnemies.forEach(function(enemyShip) {
        curGame.checkTwoBodyCollision(moon, enemyShip);
      });
    });

    //apply forces
    this.ship.applyForces();

    this.enemies.forEach(function(enemyShip) {
      enemyShip.applyForces();
    });

    this.moons.forEach(function(moon) {
      moon.gravity();
    });

    this.checkKeys();
    this.move();
    this.draw();
    this.removeOffScreenBullets();
    this.renderOuterInterface();

    var numStroids = 0;
        binsPerRow = Game.MAP_SIZE / Game.BIN_SIZE;
    Object.keys(this.asteroidBins).forEach(function(bin) {
      if (curGame.asteroidBins[bin].length > numStroids) {
        numStroids = curGame.asteroidBins[bin].length;
        maxBin = [numStroids, [(bin % binsPerRow) * Game.BIN_SIZE + Game.BIN_SIZE / 2, Math.floor(bin / binsPerRow) * Game.BIN_SIZE + Game.BIN_SIZE / 2]];
      }
    });

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

      curGame.moons.forEach(function(moon) {
        if (moon.isCollidedWith(planet)) {
          var dx = planet.x - moon.x,
              dy = planet.y - moon.y,
              diff = moon.radius + planet.radius - (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))),
              v = Math.sqrt(moon.vx * moon.vx + moon.vy * moon.vy);

          var theta;
          if (dx === 0) {
            theta = Math.PI / 2;
          } else {
            theta = Math.atan(dy / dx);
          }
          theta = Math.PI - theta;
          if (moon.x - planet.x > 0 && moon.y - planet.y > 0) {
            theta += Math.PI;
          } else if (moon.x - planet.x > 0 && moon.y - planet.y < 0) {
            theta -= Math.PI;
          }
          moon.x += 1.005 * diff * Math.cos(theta);
          moon.y += -(1.005 * diff * Math.sin(theta));
          // moon.vx *= .99;
          // moon.vy *= .99;

          if (v > .1) {
            var theta = Math.atan((moon.y - planet.y) / (moon.x - planet.x));
            var vdotn = moon.vx * Math.cos(theta) + moon.vy * Math.sin(theta);
            moon.vx = 1 * -2 * (vdotn) * Math.cos(theta) + moon.vx;
            moon.vy = 1 * -2 * (vdotn) * Math.sin(theta) + moon.vy;
          } else {
            moon.vx = 0;
            moon.vy = 0;
          }
        }
      });

      curGame.enemies.forEach(function(enemyShip) {
        if (enemyShip.isCollidedWith(planet)) {
          var v = Math.sqrt(enemyShip.vx * enemyShip.vx + enemyShip.vy * enemyShip.vy)
          if (v > .1) {
            var theta = Math.atan((enemyShip.y - planet.y) / (enemyShip.x - planet.x));
            var vdotn = enemyShip.vx * Math.cos(theta) + enemyShip.vy * Math.sin(theta);
            enemyShip.vx = 1 * -2 * (vdotn) * Math.cos(theta) + enemyShip.vx;
            enemyShip.vy = 1 * -2 * (vdotn) * Math.sin(theta) + enemyShip.vy;
          } else {
            enemyShip.vx = 0;
            enemyShip.vy = 0;
          }
        }
      });
    });

    //collisions
    //ship-asteroid collisions
    this.asteroidsToBreak = [];

    var collision = this.checkCollisions();

    //bullet-asteroid collisions
    this.hitAsteroids();

    this.breakAsteroids(this.asteroidsToBreak);

    if (this.health <= 0 && this.invincible === false) {
      this.health = this.maxHealth;
      this.death();
    }

    this.drawHealth();
    this.drawMultiShotStam();
    this.drawShieldEnergy();
    if (this.multi < this.maxMulti) {
      this.multi += 3;
    }
    if (this.shieldEnergy < this.maxShieldEnergy) {
      this.shieldEnergy += 1;
    }

    // $('h1').html("ast_grav_time: " + aT + " rest_time: " + (new Date() - t - aT) + " " + maxBin[0] + " x: " + maxBin[1][0] + " y: " + maxBin[1][1]);

    if (ticker < 100000) {
      ticker++;
    } else {
      ticker = 0;
    }
  }

  Game.prototype.start = function() {
    this.timer = setInterval(this.step.bind(this), Game.FPS);
  }

  Game.prototype.checkCollisions = function() {
    var curGame = this;
    var pickup = false;
    var deleteIndices = [];

    this.asteroids.forEach(function(asteroid, index){
      if (asteroid.onScreen) {
        if (curGame.ship.isCollidedWith(asteroid) && curGame.invincible === false) {
          deleteIndices.push(index);
          curGame.asteroidsToBreak.push(asteroid);
          if (asteroid.mass === .2 && asteroid.charge === -1) {
            pickup = true;
            curGame.points += 20;
          } else if (asteroid.mass === .2 && asteroid.charge === 1) {
            pickup = true;
            curGame.points += 10;
          } else {
            if (!curGame.invincible) {
              curGame.health -= 150;

              $('#game-screen').css("border", "2px solid red");
              $('#game-screen').css("box-shadow", "0 0 2em red");

              setTimeout(function() {
                $('#game-screen').css("border", "2px solid orange");
                $('#game-screen').css("box-shadow", "0 0 .5em orange");
              }, 500);
            }
          }
        }
        if (curGame.shieldOn && curGame.shield.isCollidedWith(asteroid)) {
          deleteIndices.push(index);
          curGame.asteroidsToBreak.push(asteroid);
        }
      }
      if (asteroid.x < 0 || asteroid.y < 0 || asteroid.x > Game.MAP_SIZE || asteroid.y > Game.MAP_SIZE) {
        if (asteroid.x < 0 || asteroid.x > Game.MAP_SIZE) { asteroid.vx *= -1 }
        if (asteroid.y < 0 || asteroid.y > Game.MAP_SIZE) { asteroid.vy *= -1 }
      }
    });

    var deadBullets = 0;
    for (var b = 0; b < this.enemyBullets.length - deadBullets; b++) {
      var bullet = this.enemyBullets[b];
      if (this.shieldOn && this.shield.isCollidedWith(bullet)) {
        this.removeEnemyBullet(bullet);
        deadBullets++;
        b--;
      } else if (curGame.ship.isCollidedWith(bullet) && !curGame.invincible) {
        curGame.health -= 100;
        $('#game-screen').css("border", "2px solid red");
        $('#game-screen').css("box-shadow", "0 0 2em red");

        setTimeout(function() {
          $('#game-screen').css("border", "2px solid orange");
          $('#game-screen').css("box-shadow", "0 0 .5em orange");
        }, 500);
        curGame.removeEnemyBullet(bullet);
        deadBullets++;
        b--;
      }
    }

    // var numDestroyedEnemies = 0;
    // for (var e = 0; e < this.enemies.length - numDestroyedEnemies; e++) {
    //   var enemyShip = this.enemies[e];
    //   if (this.shieldOn && this.shield.isCollidedWith(enemyShip)) {
    //     this.destroyEnemyShip(enemyShip);
    //     numDestroyedEnemies++;
    //     e--;
    //   }
    // }

    deleteIndices.forEach(function(index) {
      curGame.removeAsteroid(curGame.asteroids[index]);
    });

    if (pickup === true) {
      return 1;
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
      curGame.ship.angle -= .225;
    }

    if (key.isPressed('s')) {
      curGame.ship.reverseThruster(.145);
    }

    if (key.isPressed('d')) {
      curGame.ship.angle += .225;
    }

    if (key.isPressed('2')) {
      curGame.ship.activeWeapon = 'single';

      $('#game-screen').css("border", "2px solid red");
      $('#game-screen').css("box-shadow", "0 0 2em red");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('e')) {
      curGame.ship.activeWeapon = 'multi';

      $('#game-screen').css("border", "2px solid #00F815");
      $('#game-screen').css("box-shadow", "0 0 2em #00F815");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('q')) {
      curGame.ship.activeWeapon = 'circle';

      $('#game-screen').css("border", "2px solid #FF0DFF");
      $('#game-screen').css("box-shadow", "0 0 2em #FF0DFF");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('space')) {
      if (this.shieldEnergy > 0) {
        this.shieldOn = true;
        this.shieldEnergy -= 5;
      } else {
        this.shieldOn = false;
      }
    } else {
      this.shieldOn = false;
    }
  }

  Game.prototype.hitAsteroids = function(){
    var curGame = this,
        deleteAsteroidIndices = [],
        numDestroyedBullets = 0;

    for (var b = 0; b < this.bullets.length - numDestroyedBullets; b++) {
      for (var a = 0; a < this.asteroids.length; a++) {
        var bullet = this.bullets[b],
            asteroid = this.asteroids[a];
        if (asteroid.onScreen) {
          if (bullet.isCollidedWith(asteroid)) {
            this.removeBullet(bullet);
            if (deleteAsteroidIndices.indexOf(a) === -1) { deleteAsteroidIndices.push(a) }
            if (this.asteroidsToBreak.indexOf(asteroid) === -1) { this.asteroidsToBreak.push(asteroid) }
            //skip remaining asteroids for this bullet, decrement bullet index to accomodate for splice
            a = this.asteroids.length;
            b--;
            numDestroyedBullets++;
          }
        }
      }
    }

    numDestroyedBullets = 0;
    for (var b = 0; b < this.enemyBullets.length - numDestroyedBullets; b++) {
      for (var a = 0; a < this.asteroids.length; a++) {
        var bullet = this.enemyBullets[b],
            asteroid = this.asteroids[a];
        if (asteroid.onScreen) {
          if (bullet.isCollidedWith(asteroid)) {
            this.removeBullet(bullet);
            if (deleteAsteroidIndices.indexOf(a) === -1) { deleteAsteroidIndices.push(a) }
            if (this.asteroidsToBreak.indexOf(asteroid) === -1) { this.asteroidsToBreak.push(asteroid) }
            //skip remaining asteroids for this bullet, decrement bullet index to accomodate for splice
            a = this.asteroids.length;
            b--;
            numDestroyedBullets++;
          }
        }
      }
    }

    var numDestroyedEnemies = 0;
    numDestroyedBullets = 0;

    for (var b = 0; b < this.bullets.length - numDestroyedBullets; b++) {
      var bullet = this.bullets[b];
      for (var e = 0; e < this.enemies.length - numDestroyedEnemies; e++) {
        var enemyShip = this.enemies[e];
        if (enemyShip.onScreen) {
          if (bullet.isCollidedWith(enemyShip)) {
            this.removeBullet(bullet);
            b--;
            enemyShip.health -= 200;
            if (enemyShip.health < 0) {
              this.destroyEnemyShip(enemyShip);
              e--;
            }
            numDestroyedBullets++;
            numDestroyedEnemies++;
          }
        }
      }
      if (bullet.isCollidedWith(this.enemyPlanet)) {
        this.enemyPlanetHealth -= 100;
      }
    }

    // this.bullets.forEach(function(bullet) {
    //   curGame.enemies.forEach(function(enemyShip) {
    //     if (enemyShip.onScreen) {
    //       if (curGame.shieldOn && curGame.shield.isCollidedWith(enemyShip)) {
    //         curGame.destroyEnemyShip(enemyShip);
    //       } else if (bullet.isCollidedWith(enemyShip)) {
    //         enemyShip.health -= 200;
    //         if (enemyShip.health < 0) {
    //           curGame.destroyEnemyShip(enemyShip);
    //           curGame.removeBullet(bullet);
    //         }
    //       }
    //     }
    //   });
    //   if (bullet.isCollidedWith(curGame.enemyPlanet)) {
    //     this.enemyPlanetHealth -= 100;
    //   }
    // });

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

  Game.prototype.removeEnemyBullet = function(bullet) {
    var index = this.enemyBullets.indexOf(bullet);
    this.enemyBullets.splice(index, 1);
  }

  Game.prototype.destroyEnemyShip = function(enemyShip) {
    var index = this.enemies.indexOf(enemyShip);
    this.enemies[index].blowUp();
    this.enemies.splice(index, 1);
  }

  Game.prototype.drawHealth = function() {
    var width = Game.DIM_X;
    var height = Game.DIM_Y;

    this.ctx.fillStyle = "rgba(255, 0, 0, .5)";
    this.ctx.beginPath();
    this.ctx.rect((width - (this.health / 3)) / 2, height - 31, (this.health / 3), 6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fill();
  }

  Game.prototype.drawMultiShotStam = function() {
    var width = Game.DIM_X;
    var height = Game.DIM_Y;

    this.ctx.fillStyle = "rgba(0, 248, 21, .5)";
    this.ctx.beginPath();
    this.ctx.rect((width - (this.multi / 3)) / 2, height - 21, (this.multi / 3), 6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fill();
  }

  Game.prototype.drawShieldEnergy = function() {
    var width = Game.DIM_X;
    var height = Game.DIM_Y;

    // this.ctx.fillStyle = "rgba(255, 13, 255, .3)";
    this.ctx.fillStyle = "rgba(0, 0, 255, .5)";
    this.ctx.beginPath();
    this.ctx.rect((width - (this.shieldEnergy / 3)) / 2, height - 11, (this.shieldEnergy / 3), 6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fill();
  }

  Game.prototype.death = function() {
    this.lives -= 1;
    this.invincible = true;
    this.ticker = 0;
    var blinkInterval = setInterval(function() {
      this.ticker += 1;
    }.bind(this), 50)
    var deathInterval = setInterval(function() {
      this.invincible = false;
      clearInterval(deathInterval);
      clearInterval(blinkInterval);
    }.bind(this), 5000);

    if (this.lives === 0) {
      this.lives = 5;
      // this.ship.blowUpAndEndGame(this);
      // this.ship.radius = 0;
      // this.draw();
      // this.stop();
    }
  }

  Game.prototype.genEnemyTurrets = function() {
    for (var i = 0; i < 20; i++) {
      var angle = i / 20 * 2 * Math.PI;

      var x = 3500 + 605 * Math.cos(angle),
          y = 3500 + 605 * Math.sin(angle);

      this.enemies.push(new Asteroids.EnemyShip({
        x: x, y: y,
        vx: 0, vy: 0,
        radius: 5,
        game: this,
        color: "white",
        enemyType: "turret",
        angle: angle,
        health: 300,
        resourceValue: 50
      }));
    }
  }

  Game.prototype.genEnemyAttackers = function() {
    this.enemies.push(new Asteroids.EnemyShip({
      x: 10000, y: 13000,
      vx: 0, vy: 0,
      radius: 8,
      game: this,
      color: "darkred",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 500,
      resourceValue: 80
    }));
    this.enemies.push(new Asteroids.EnemyShip({
      x: 13500, y: 10500,
      vx: 0, vy: 0,
      radius: 8,
      game: this,
      color: "darkred",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 500,
      resourceValue: 80
    }));
  }

  Game.prototype.genEnemyDefenders = function() {
    for (var i = 0; i < 15; i++) {
      var angle = i / 15 * 2 * Math.PI;

      var x = 3500 + 1000 * Math.cos(angle),
          y = 3500 + 1000 * Math.sin(angle);

      this.enemies.push(new Asteroids.EnemyShip({
        x: x, y: y,
        vx: -4.5 * Math.sin(angle), vy: 4.5 * Math.cos(angle),
        radius: 9,
        game: this,
        color: "orange",
        enemyType: "defender",
        angle: angle + Math.PI / 2,
        health: 600,
        resourceValue: 150
      }));
    }
  }

  Game.prototype.genEnemyPatrollers = function() {
    for (var i = 0; i < 10; i++) {
      var x = (i + 1) * 1800,
          y = (i + 1) * 1800;
      this.enemies.push(new Asteroids.EnemyShip({
        x: x, y: y,
        vx: 0, vy: 0,
        radius: 8,
        game: this,
        color: "orange",
        enemyType: "patroller",
        angle: Math.PI / 2,
        health: 400,
        resourceValue: 60
      }));
    }
  }

  Game.prototype.checkTwoBodyCollision = function(object1, object2) {
    if (object1.isCollidedWith(object2)) {
      var dx = object2.x - object1.x,
          dy = object2.y - object1.y;
      var diff = object2.radius + object1.radius - (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
      var object2V = Math.sqrt(Math.pow(object2.vx, 2) + Math.pow(object2.vy, 2));
      var object1V = Math.sqrt(Math.pow(object1.vx, 2) + Math.pow(object1.vy, 2));
      var theta;

      theta = Math.atan(dy / dx);
      theta = Math.PI - theta;
      if (object1.x - object2.x > 0 && object1.y - object2.y > 0) {
        theta += Math.PI;
      } else if (object1.x - object2.x > 0 && object1.y - object2.y < 0) {
        theta -= Math.PI;
      }
      var object1VRatio = object1V / (object1V + object2V);
      var object2VRatio = object2V / (object1V + object2V);

      object1.x += 1.005 * diff * object1VRatio * Math.cos(theta);
      object1.y += -(1.005 * diff * object1VRatio * Math.sin(theta));

      object2.x -= 1.005 * diff * object2VRatio * Math.cos(theta);
      object2.y -= -(1.005 * diff * object2VRatio * Math.sin(theta));

      var dx = object2.x - object1.x,
          dy = object2.y - object1.y;
      var diff = object2.radius + object1.radius - (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
      var object2V = Math.sqrt(Math.pow(object2.vx, 2) + Math.pow(object2.vy, 2));
      var object2Angle = Math.acos(object2.vx / object2V);
      var object1V = Math.sqrt(Math.pow(object1.vx, 2) + Math.pow(object1.vy, 2));
      var object1Angle = Math.acos(object1.vx / object1V);
      var theta;
      theta = Math.atan(dy / dx);
      theta = Math.PI - theta;
      if (object1.x - object2.x > 0 && object1.y - object2.y > 0) {
        theta += Math.PI;
      } else if (object1.x - object2.x > 0 && object1.y - object2.y < 0) {
        theta -= Math.PI;
      }

      if (object1.vy > 0) {
        object1Angle += Math.PI;
      }

      if (object2.vy > 0) {
        object2Angle += Math.PI;
      }

      object1.vx = Math.cos(theta) * (object1V * Math.cos(object1Angle - theta) * (object1.mass - object2.mass) + 2 * object2.mass * object2V * Math.cos(object2Angle - theta)) / (object1.mass + object2.mass) + object1V * Math.sin(object1Angle - theta) * Math.cos(theta + Math.PI / 2);
      object1.vy = -(Math.sin(theta) * (object1V * Math.cos(object1Angle - theta) * (object1.mass - object2.mass) + 2 * object2.mass * object2V * Math.cos(object2Angle - theta)) / (object1.mass + object2.mass) + object1V * Math.sin(object1Angle - theta) * Math.sin(theta + Math.PI / 2));

      object2.vx = Math.cos(theta) * (object2V * Math.cos(object2Angle - theta) * (object2.mass - object1.mass) + 2 * object1.mass * object1V * Math.cos(object1Angle - theta)) / (object2.mass + object1.mass) + object2V * Math.sin(object2Angle - theta) * Math.cos(theta + Math.PI / 2);
      object2.vy = -(Math.sin(theta) * (object2V * Math.cos(object2Angle - theta) * (object2.mass - object1.mass) + 2 * object1.mass * object1V * Math.cos(object1Angle - theta)) / (object2.mass + object1.mass) + object2V * Math.sin(object2Angle - theta) * Math.sin(theta + Math.PI / 2));
    }
  }
})(this);
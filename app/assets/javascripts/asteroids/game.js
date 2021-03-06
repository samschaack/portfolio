(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Game = Asteroids.Game = function(canvas){
    objIdCount = 1;
    ticker = 0;
    this.ctx = canvas.getContext("2d");
    this.showControls = false;
    this.asteroids = [];
    this.ship = new Asteroids.Ship(this);
    this.bullets = [];
    this.enemyBullets = [];
    this.crazy = false;
    this.stars = Game.genStars(this);
    this.lives = Game.DEFAULT_LIVES;
    this.xOffset = -Asteroids.Ship.SPAWN_X;
    this.yOffset = -Asteroids.Ship.SPAWN_Y;
    this.invincible = false;
    this.syncPlanet = false;
    this.sawControls = false;
    this.pDebounce = false;
    this.citizens = 1;
    // function(numAsteroids, x, y, spawnRadius, radius, game, velocityX, velocityY, mass)
    // this.spawnAsteroidCluster(200, 10650, 10400, 300, 12, this, 0, -10.4, .8, .5);
    //orbiting clusters
    // this.spawnAsteroidCluster(50, 10450, 10400, 30, 12, this, 0, 2.4, .8, .5);
    // this.spawnAsteroidCluster(50, 10650, 10400, 30, 12, this, 0, -2.4, .8, .5);
    //default
    // this.spawnAsteroidCluster(60, 10150, 10150, 50, 12, this, 1, 1, .8, .5);
    this.spawnAsteroidCluster(30, 8200, 7850, 50, 12, this, 5, 1, .8, 0);
    this.spawnAsteroidCluster(25, 11000, 10500, 20, 12, this, 0, 5, .8, .5);
    this.spawnAsteroidCluster(35, 9000, 10000, 100, 12, this, 0, 5, .8, .5);
    this.spawnAsteroidCluster(35, 11500, 11500, 5, 12, this, 0, 5, .8, .5);
    //rings
    // this.spawnAsteroidCluster(50, 10100, 10050, 50, 12, this, 6, 0, .8, .5);
    this.spawnAsteroids();
    this.waypoints = [];
    this.planets = [];
    this.planets.push(new Asteroids.Planet(11000, 11000, 0, 0, 200, "green", 200, this));
    // this.planets.push(new Asteroids.Planet(11000, 11000, 0, 0, 200, "pink", 200, this));

    //waypoint blinking test planets
    this.planets.push(new Asteroids.Planet(19000, 19000, 0, 0, 150, "red", 35, this));
    // this.planets.push(new Asteroids.Planet(19100, 19100, 0, 0, 150, "orange", 5, this));
    // this.planets.push(new Asteroids.Planet(19200, 19200, 0, 0, 150, "yellow", 5, this));
    // this.planets.push(new Asteroids.Planet(19300, 19300, 0, 0, 150, "purple", 5, this));
    // this.planets.push(new Asteroids.Planet(19400, 19400, 0, 0, 150, "white", 5, this));
    // this.planets.push(new Asteroids.Planet(19500, 19500, 0, 0, 150, "magenta", 5, this));
    // this.planets.push(new Asteroids.Planet(19600, 19600, 0, 0, 150, "darkred", 5, this));
    this.planets.push(new Asteroids.Planet(19700, 19700, 0, 0, 150, "violet", 35, this));
    // this.planets.push(new Asteroids.Planet(19800, 19800, 0, 0, 150, "#444", 5, this));

    // this.homePlanet = new Asteroids.Planet(9000, 9000, 0, 0, 800, "#0F20FF", 1600, this);
    this.homePlanet = new Asteroids.Planet(9000, 9000, 0, 0, 800, "#046300", 1600, this);
    this.planets.push(this.homePlanet);
    this.planets.push(new Asteroids.Planet(18000, 3500, 0, 0, 400, "blue", 1600, this));
    this.enemyPlanet = new Asteroids.Planet(3500, 3500, 0, 0, 600, "darkgreen", 1000, this);
    this.enemyPlanetHealth = 200000;
    this.planets.push(this.enemyPlanet);
    this.moons = [];
    // this.moons.push(new Asteroids.Moon(9900, 10500, 0, -10, 40, "gray", 15, this, this.planets[0]));
    // this.moons.push(new Asteroids.Moon(7600, 7600, 0, 9, 50, "white", 30, this, this.planets[0]));
    // this.moons.push(new Asteroids.Moon(11800, 11000, 0, -5, 50, "gray", 5, this, this.planets[0]));
    // this.moons.push(new Asteroids.Moon(11800, 11000, 0, -10, 50, "gray", 25, this, this.planets[0]));
    this.shield = new Asteroids.Shield(this, { type: "player", planet: false });
    this.shields = [];
    this.shields.push(new Asteroids.Shield(this, {
      type: "planet",
      planet: this.homePlanet,
      xModifier: 0,
      yModifier: -this.homePlanet.radius
    }));
    this.enemies = [];
    this.genEnemyAttackers();
    this.genEnemyTurrets();
    this.genEnemyDefenders();
    // this.genEnemyPatrollers();
    // this.genEnemyDestroyers();
    // this.moons.push(new Asteroids.Moon(12800, 11000, 0, 9, 30, "white", 30, this, this.planets[0]));
    this.resources = 0;
    //this.zoom = 1;
    this.addPlanetWaypoints();
    this.addMoonWaypoints();
    this.bombs = [];
    this.recCol = false;
    this.colCount = 0;
    this.smallerBins = false;

    this.maxHealth = 1000;
    this.health = this.maxHealth;

    this.maxMulti = 1000;
    this.multi = this.maxMulti;
    this.multiRechargeRate = 3;
    this.multiRecharging = false;

    this.maxShieldEnergy = 1000;
    this.shieldEnergy = this.maxShieldEnergy;
    this.shieldRechargeRate = 1;
    this.shieldRecharging = false;

    this.maxFuel = 2000;
    this.fuel = this.maxFuel;
    this.fuelRecharging = false;
    this.fuelInjectionRate = 3;

    this.maxEnergy = 5000;
    this.energy = this.maxEnergy;

    setupHandlers.call(this);
    this.messages = [];
    this.generateBorderBins();
    this.binStars();

    this.weaponPower = 200;
    this.healingPower = 200;
  }

  CHAR_OFFSET = 9.875;
  SYS_MESSAGE_COLOR = "pink";
  Game.DIM_X = 1900;
  Game.DIM_Y = 1025;
  Game.FPS = 30;
  Game.NUM_STARS = 20000;
  Game.MAP_SIZE = 20000;
  Game.GRAV_CONST = 20;
  Game.DEFAULT_LIVES = 5;
  Game.BIN_SIZE = 200;
  Game.STAR_BIN_SIZE = 1000;

  function setupHandlers() {
    $('#game-screen').on('mousedown', function(event) {
      event.stopImmediatePropagation();
      event.preventDefault();

      var $screen = $('#game-screen');

      var offset = $screen.offset();

      var clickX = parseInt(event.pageX - offset.left - $screen.width() / 2);
      var clickY = parseInt(event.pageY - offset.top - $screen.height() / 2);

      this.ship.handleClick([clickX, clickY]);
    }.bind(this));

    $('html').keypress(function(e) {
      if (e.which == 32) {
        e.preventDefault();
      }
    });
  }

  Game.prototype.generateBorderBins = function() {
    this.borderBins = [];
    var binsPerRow = Math.floor(Game.MAP_SIZE / Game.BIN_SIZE);
    for (var i = 0; i < binsPerRow; i++) {
      this.borderBins.push(i);
      if (i !== 0 && i !== binsPerRow - 1) {
        this.borderBins.push(binsPerRow * i);
        this.borderBins.push(binsPerRow * i + binsPerRow - 1);
      }
    }
    for (var i = binsPerRow * binsPerRow - binsPerRow; i < binsPerRow * binsPerRow; i++) {
      this.borderBins.push(binsPerRow * binsPerRow - binsPerRow + i);
    }
  }

  Game.prototype.addPlanetWaypoints = function() {
    this.planets.forEach(function(planet) {
      this.addWaypoint(planet, this.ship);
    }.bind(this));
  }

  Game.prototype.addMoonWaypoints = function() {
    this.moons.forEach(function(moon) {
      this.addWaypoint(moon, this.ship);
    }.bind(this));
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

  Game.prototype.spawnAsteroidCluster = function(numAsteroids, x, y, spawnRadius, radius, game, velocityX, velocityY, mass, velSpread) {
    for (var i = 0; i < numAsteroids; i++) {
      this.asteroids.push(Asteroids.Asteroid.asteroidWithinRadius({
        x: x, y: y,
        spawnRadius: spawnRadius, radius: radius,
        game: this,
        velocityX: velocityX, velocityY: velocityY,
        mass: mass,
        velSpread: velSpread
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
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);
    }

    this.onScreenStars.forEach(function(star) {
      star.draw(curGame.ctx);
    });

    this.onScreenAsteroids.forEach(function(asteroid) {
      asteroid.draw(curGame.ctx);
    });

    this.shields.forEach(function(shield) {
      if (shield.shieldOn === true) {
        shield.draw(this.ctx);
      }
    }.bind(this));

    this.onScreenEnemies.forEach(function(enemyShip) {
      enemyShip.draw(curGame.ctx);
    });

    this.bullets.forEach(function(bullet) {
      bullet.draw(curGame.ctx);
    });

    this.enemyBullets.forEach(function(bullet) {
      bullet.draw(curGame.ctx);
    });

    this.planets.forEach(function(planet) {
      if (planet.onScreen) {
        planet.draw(curGame.ctx);
      }
    });

    this.moons.forEach(function(moon) {
      if (moon.onScreen) {
        moon.draw(curGame.ctx);
      }
    });

    this.ctx.shadowBlur = 0;
    this.ctx.lineWidth = .5;

    if (!this.invincible) {
      this.ship.draw(this.ctx);
    } else {
      if (this.ticker % 5 === 0) {
        this.ship.draw(this.ctx);
      }
    }

    if (this.shieldOn) {
      this.shield.draw(this.ctx);
    }

    if (this.flame.activated === true) {
      if (!this.invincible) {
        this.flame.draw(this.ctx);
      } else {
        if (this.ticker % 5 === 0) {
          this.flame.draw(this.ctx);
        }
      }
    } else if (this.flame.activated === false && this.syncPlanet === false) {
      var num = 25 * Math.random();
      if (num >= 0 && num < 8)  {
        this.flame.drawIdle(this.ctx, "light");
      } else if (num >= 8 && num < 16) {
        this.flame.drawIdle(this.ctx, "medium");
      } else if (num >= 16 && num < 25) {
        this.flame.drawIdle(this.ctx, "dark");
      }
    }

    this.ctx.shadowBlur = 0;

    this.drawHealth();
    this.drawMultiShotStam();
    this.drawShieldEnergy();

    this.ctx.shadowBlur = 1;
    this.ctx.shadowColor = "rgba(255, 255, 0, .5)";
    this.drawAfterburnerFuel();

    this.ctx.shadowBlur = 0;
    // this.displayStats();
    this.displayGameInfo();
    if (this.sawControls === false) {
      this.displayMessage(
        "hold c to bring up a list of keyboard mappings. this message won't go away until you do.",
        SYS_MESSAGE_COLOR
      );
      this.displayedMessages++;
    }

    if (this.showControls === true) {
      this.displayMessage(
        "wasd to move : click to shoot : q, e, 2, f to change weapon : shift to boost : space for shield : l to land",
        SYS_MESSAGE_COLOR
      );
      this.displayedMessages++;
    }

    if (this.syncPlanet === true) {
      this.displayMessage(
        "velocity synced with planet",
        SYS_MESSAGE_COLOR
      );
      this.displayedMessages++;
    }

    this.displayMessages();

    this.sideWaypoints.forEach(function(waypoint) {
      if (waypoint.visible) {
        waypoint.draw(curGame.ctx);
      }
    });

    Object.keys(this.waypointCorners).forEach(function(corner) {
      if (this.waypointCorners[corner].length > 0) {
        var cornerWaypoints = this.waypointCorners[corner],
            numWPs = cornerWaypoints.length;
        if (numWPs > 1) {
          var tickerAdd = 100,
              digits = 3;

          var thisTicker = (ticker + tickerAdd).toString(),
              len = thisTicker.length,
              number = parseInt(thisTicker.slice(len - (digits - 1), len)),
              binSize = tickerAdd / cornerWaypoints.length;
          for (var w = 0; w < cornerWaypoints.length; w++) {
            if (number >= w * binSize && number < (w + 1) * binSize) {
              cornerWaypoints[w].draw(this.ctx);
            }
          }
        } else {
          cornerWaypoints[0].draw(this.ctx);
        }
      }
    }.bind(this));
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

    this.moons.forEach(function(moon) {
      moon.move();
    });

    this.planets.forEach(function(planet) {
      planet.move();
    });

    this.shields.forEach(function(shield) {
      shield.move();
    });

    this.waypoints.forEach(function(waypoint) {
      waypoint.move();
    });
  }

  Game.prototype.offScreen = function(obj){
    if ((obj.x + obj.radius) < -this.xOffset - 200) {
      return true;
    }
    if ((obj.x - obj.radius) > -this.xOffset + Game.DIM_X + 200) {
      return true;
    }
    if ((obj.y + obj.radius) < -this.yOffset - 200) {
      return true;
    }
    if ((obj.y - obj.radius) > -this.yOffset + Game.DIM_Y + 200) {
      return true;
    }
    return false;
  }

  Game.prototype.binAsteroids = function() {
    var binSize = Game.BIN_SIZE,
        numRows = Game.MAP_SIZE / binSize;
    this.asteroidBins = {};
    this.outsideAsteroids = [];
    this.asteroids.forEach(function(asteroid) {
      asteroid.bin = Math.floor(asteroid.x / binSize) + Math.floor(asteroid.y / binSize) * numRows;
      if (!this.asteroidBins[asteroid.bin]) {
        this.asteroidBins[asteroid.bin] = [asteroid];
      } else {
        this.asteroidBins[asteroid.bin].push(asteroid);
      }
      if (asteroid.x < Game.MAP_SIZE * .1 || asteroid.x > Game.MAP_SIZE * .99 || asteroid.y < Game.MAP_SIZE * .1 || asteroid.y > Game.MAP_SIZE * .99) {
        this.outsideAsteroids.push(asteroid);
      }
    }.bind(this));
  }

  Game.prototype.binStars = function() {
    var binSize = Game.STAR_BIN_SIZE,
        numRows = Game.MAP_SIZE / binSize;
    this.starBins = {};
    this.stars.forEach(function(star) {
      star.bin = Math.floor(star.x / binSize) + Math.floor(star.y / binSize) * numRows;
      if (!this.starBins[star.bin]) {
        this.starBins[star.bin] = [star];
      } else {
        this.starBins[star.bin].push(star);
      }
    }.bind(this));
  }

  Game.prototype.binMoons = function() {
    this.moons.forEach(function(moon) {
      moon.getBins();
    });
  }

  Game.prototype.step = function() {
    this.initT = new Date();

    this.insideBase = false;
    this.displayedMessages = 0;

    this.sideWaypoints = [];
    this.waypointCorners = {
      "uL": [],
      "bL": [],
      "uR": [],
      "bR": []
    }

    this.determineAttackValidity();

    this.inBinStars = this.getStars();
    this.binAsteroids();
    this.binMoons();

    this.onScreenStars = [];
    this.inBinStars.forEach(function(star) {
      if (this.offScreen(star)) {
        star.onScreen = false;
      } else {
        star.onScreen = true;
        this.onScreenStars.push(star);
      }
    }.bind(this));

    this.shields.forEach(function(shield) {
      if (this.offScreen(shield)) {
        shield.onScreen = false;
      } else {
        shield.onScreen = true;
      }
    }.bind(this));

    this.onScreenAsteroids = [];
    this.asteroids.forEach(function(asteroid) {
      if (this.offScreen(asteroid)) {
        asteroid.onScreen = false;
      } else {
        asteroid.onScreen = true;
        this.onScreenAsteroids.push(asteroid);
      }
    }.bind(this));

    this.planets.forEach(function(planet) {
      if (this.offScreen(planet)) {
        planet.onScreen = false;
      } else {
        planet.onScreen = true;
      }
    }.bind(this));

    this.moons.forEach(function(moon) {
      if (this.offScreen(moon)) {
        moon.onScreen = false;
      } else {
        moon.onScreen = true;
      }
    }.bind(this));

    this.onScreenEnemies = [];
    this.enemies.forEach(function(enemyShip) {
      if (this.offScreen(enemyShip)) {
        enemyShip.onScreen = false;
      } else {
        enemyShip.onScreen = true;
        this.onScreenEnemies.push(enemyShip);
      }
    }.bind(this));

    this.checkCollisions();

    this.aT = new Date();
    this.asteroids.forEach(function(asteroid) {
     asteroid.applyForces();
    });
    this.aT = new Date() - this.aT;

    this.ship.applyForces();

    this.enemies.forEach(function(enemyShip) {
      enemyShip.applyForces();
    });

    this.moons.forEach(function(moon) {
      moon.applyForces();
    });

    this.adaptBinSizing();
    this.reboundExitingObjects();
    this.checkKeys();

    this.move();
    this.draw();

    if (this.health <= 0 && this.invincible === false) {
      this.death();
    }

    this.updateStatusBars();

    if (ticker < 100000) {
      ticker++;
    } else {
      ticker = 0;
    }
    if (ticker % 10000 === 0) {
      this.genEnemyPatrollers();
      this.setSystemMessage("new enemy patrollers entering the area");
    }
    if (ticker % 10000 === 0 && this.asteroids.length < 750) {
      this.spawnAsteroids({ numAsteroids: 250 });
    }
  }

  Game.prototype.updateStatusBars = function() {
    if (this.multi < this.maxMulti) {
      if (this.multi < 50) {
        this.multiRecharging = true;
        setTimeout(function() {
          this.multiRecharging = false;
        }.bind(this), 2000);
        this.multi += this.multiRechargeRate;
      } else {
        this.multi += this.multiRechargeRate;
      }
    }

    if (this.shieldEnergy < this.maxShieldEnergy) {
      if (this.shieldEnergy < 5) {
        this.shieldRecharging = true;
        setTimeout(function() {
          this.shieldRecharging = false;
        }.bind(this), 5000);
        this.shieldEnergy += this.shieldRechargeRate;
      } else {
        this.shieldEnergy += this.shieldRechargeRate;
      }
    }

    if (this.fuel < this.maxFuel) {
      if (this.fuel < 5) {
        this.fuelRecharging = true;
        setTimeout(function() {
          this.fuelRecharging = false;
        }.bind(this), 5000);
        this.fuel += this.fuelInjectionRate;
      } else {
        this.fuel += this.fuelInjectionRate;
      }
    }
  }

  Game.prototype.start = function() {
    this.timer = setInterval(this.step.bind(this), Game.FPS);
  }

  Game.prototype.adaptBinSizing = function() {
    if (this.aT < 20) {
      Game.BIN_SIZE = 250;
    } else if (this.aT >= 20 && this.aT < 40) {
      Game.BIN_SIZE = 100;
    } else if (this.aT >= 40 && this.aT < 100) {
      Game.BIN_SIZE = 75;
    } else {
      Game.BIN_SIZE = 25;
    }
  }

  Game.prototype.determineAttackValidity = function() {
    this.canAttack = true;
    if (this.shieldOn) {
      this.canAttack = false;
    }
    this.shields.forEach(function(shield) {
      if (this.ship.isCollidedWith(shield)) {
        this.canAttack = false;
        this.insideBase = true;
      }
    }.bind(this));
  }

  Game.prototype.shipAsteroidCollisions = function() {
    this.onScreenAsteroids.forEach(function(asteroid) {
      this.checkTwoBodyCollision(this.ship, asteroid, { ship: true, asteroid: true });

      this.onScreenEnemies.forEach(function(enemyShip) {
        this.checkTwoBodyCollision(enemyShip, asteroid, { enemy: true, asteroid: true });
      }.bind(this));

    }.bind(this));

    // this.shipAsteroidRemovalIndices.forEach(function(index) {
    //   this.asteroidsToBreak.push(this.asteroids[index]);
    //   this.removeAsteroid(this.asteroids[index]);
    // }.bind(this));
  }

  Game.prototype.getStars = function() {
    var binSize = Game.STAR_BIN_SIZE,
        ship = this.ship,
        binsPerRow = Game.MAP_SIZE / binSize,
        shipBin = Math.floor(ship.x / binSize) + Math.floor(ship.y / binSize) * binsPerRow,
        bins = [shipBin];

    //left adjacent bin
    if (shipBin % binsPerRow !== 0) {
      bins.push(shipBin - 1);
    }

    //right adjacent bin
    if ((shipBin + 1) % binsPerRow !== 0) {
      bins.push(shipBin + 1);
    }

    //above adjacent bin
    if (shipBin > binsPerRow - 1) {
      bins.push(shipBin - binsPerRow);

      //above left and right corners
      if (shipBin % binsPerRow !== 0) {
        bins.push(shipBin - binsPerRow - 1);
      }
      if ((shipBin + 1) % binsPerRow !== 0) {
        bins.push(shipBin - binsPerRow + 1);
      }
    }

    //below adjacent bin
    if (shipBin < binsPerRow * binsPerRow - binsPerRow) {
      bins.push(shipBin + binsPerRow);
      //bottom left and right corners
      if (shipBin % binsPerRow !== 0) {
        bins.push(shipBin + binsPerRow - 1);
      }
      if ((shipBin + 1) % binsPerRow !== 0) {
        bins.push(shipBin + binsPerRow + 1);
      }
    }

    var stars = [];
    bins.forEach(function(bin) {
      if (!(this.starBins[bin] === undefined)) {
        this.starBins[bin].forEach(function(star) {
          stars.push(star);
        });
      }
    }.bind(this));
    return stars;
  }

  Game.prototype.reboundExitingObjects = function() {
    this.outsideAsteroids.forEach(function(asteroid) {
      if (asteroid.x + asteroid.vx > Game.MAP_SIZE || asteroid.x + asteroid.vx < 0) {
        asteroid.vx *= -1;
      }
      if (asteroid.y + asteroid.vy > Game.MAP_SIZE || asteroid.y + asteroid.vy < 0) {
        asteroid.vy *= -1;
      }
    });
    this.planets.forEach(function(planet) {
      if (planet.x + planet.vx > Game.MAP_SIZE || planet.x + planet.vx < 0) {
        planet.vx *= -1;
      }
      if (planet.y + planet.vy > Game.MAP_SIZE || planet.y + planet.vy < 0) {
        planet.vy *= -1;
      }
    });
    this.moons.forEach(function(moon) {
      if (moon.x + moon.vx > Game.MAP_SIZE || moon.x + moon.vx < 0) {
        moon.vx *= -1;
      }
      if (moon.y + moon.vy > Game.MAP_SIZE || moon.y + moon.vy < 0) {
        moon.vy *= -1;
      }
    });
  }

  Game.prototype.stop = function() {
    clearInterval(this.timer);
  }

  Game.prototype.checkCollisions = function() {
    var asteroidsToBreak = [],
        survivingAsteroids = [],
        survivingBullets = [],
        survivingEnemyBullets = [],
        survivingEnemies = [];

    var nullObjects = {};

    // ON-SCREEN-ASTEROIDS
    //-----------------------------------------------------------
    var asteroid;
    for (var a = 0; a < this.onScreenAsteroids.length; a++) {
      asteroid = this.onScreenAsteroids[a];

      var bullet;
      for (var b = 0; b < this.bullets.length; b++) {
        bullet = this.bullets[b];
        if (this.offScreen(bullet)) { nullObjects[bullet.objId] = true }
        if (!nullObjects[bullet.objId] && !nullObjects[asteroid.objId]) {
          if (bullet.willBeCollidedWith(asteroid)) {
            nullObjects[bullet.objId] = true;
            nullObjects[asteroid.objId] = true;
          }
        }
      }

      var enemyBullet;
      for (b = 0; b < this.enemyBullets.length; b++) {
        enemyBullet = this.enemyBullets[b];
        if (this.offScreen(enemyBullet)) { nullObjects[enemyBullet.objId] = true }
        if (!nullObjects[enemyBullet.objId] && !nullObjects[asteroid.objId]) {
          if (enemyBullet.willBeCollidedWith(asteroid)) {
            nullObjects[enemyBullet.objId] = true;
            nullObjects[asteroid.objId] = true;
          }
        }
      }

      if (!nullObjects[asteroid.objId] && this.health > 0) {
        if (this.ship.willBeCollidedWith(asteroid)) {
          if (asteroid.mass !== .2) {
            this.checkTwoBodyCollision(this.ship, asteroid);
          }
          if (netVelocity(this.ship, asteroid) > 13 || asteroid.mass === .2) {
            nullObjects[asteroid.objId] = true;
            asteroid.mined = true;
          }
        }
      }

      var enemy;
      for (var e = 0; e < this.onScreenEnemies.length; e++) {
        enemy = this.onScreenEnemies[e];
        if (!nullObjects[enemy.objId] && !nullObjects[asteroid.objId]) {
          if (this.checkTwoBodyCollision(enemy, asteroid)) {
            if (netVelocity(enemy, asteroid) > 10) {
              nullObjects[asteroid.objId] = true;
            }
          }
        }
      }

      var shield;
      for (var s = 0; s < this.shields.length + 1; s++) {
        shield = this.shields[s];
        if (s < this.shields.length) {
          if (this.checkOnePFiveBodyCollision(shield, asteroid) && shield.shieldOn === true) {
            if (asteroid.mass !== .2) {
              nullObjects[asteroid.objId] = true;
            }
          }
        } else {
          if (this.shieldOn) {
            this.checkOnePFiveBodyCollision(this.shield, asteroid);
          }
        }
      }

      var otherAsteroid;
      for (var oA = 0; oA < this.asteroidBins[asteroid.bin].length; oA++) {
        otherAsteroid = this.asteroidBins[asteroid.bin][oA];
        if (asteroid.mass < otherAsteroid.mass - .01
          || asteroid.mass > otherAsteroid.mass + .01
          || asteroid.charge !== otherAsteroid.charge) {
          if (this.checkTwoBodyCollision(otherAsteroid, asteroid) && netVelocity(asteroid, otherAsteroid) > 25) {
            if (asteroid.mass !== .2) {
              nullObjects[asteroid.objId] = true;
            }
            if (otherAsteroid.mass !== .2) {
              nullObjects[otherAsteroid.objId] = true;
            }
          }
        }
      }
    }
    //-----------------------------------------------------------

    // ALL-ASTEROIDS
    //-----------------------------------------------------------
    for (a = 0; a < this.asteroids.length; a++) {
      asteroid = this.asteroids[a];

      if (!nullObjects[asteroid.objId]) {

        var moon;
        for (var m = 0; m < this.moons.length; m++) {
          moon = this.moons[m];
          if (this.checkTwoBodyCollision(moon, asteroid) && netVelocity(moon, asteroid) > 25) {
            if (asteroid.mass !== .2) {
              nullObjects[asteroid.objId] = true;
            }
          }
        }

        var planet;
        for (var p = 0; p < this.planets.length; p++) {
          planet = this.planets[p];
          // this.checkOnePFiveBodyCollision(planet, asteroid);
          if (this.checkTwoBodyCollision(planet, asteroid) && netVelocity(planet, asteroid) > 10) {
            if (asteroid.mass !== .2) {
              nullObjects[asteroid.objId] = true;
            }
          }
        }
      }
    }
    //-----------------------------------------------------------

    // BULLETS (don't need to check against asteroids)
    //-----------------------------------------------------------
    for (b = 0; b < this.bullets.length; b++) {
      bullet = this.bullets[b];

      if (!nullObjects[bullet.objId]) {
        for (m = 0; m < this.moons.length; m++) {
          moon = this.moons[m];
          this.checkTwoBodyCollision(moon, bullet);
        }

        for (p = 0; p < this.planets.length; p++) {
          planet = this.planets[p];
          // this.checkOnePFiveBodyCollision(planet, asteroid);
          this.checkTwoBodyCollision(planet, bullet);
        }

        for (s = 0; s < this.shields.length; s++) {
          shield = this.shields[s];
          this.checkOnePFiveBodyCollision(shield, bullet);
        }

        for (e = 0; e < this.onScreenEnemies.length; e++) {
          enemy = this.onScreenEnemies[e];
          if (!nullObjects[enemy.objId]) {
            if (enemy.willBeCollidedWith(bullet)) {

              var crit = Math.random() < this.ship.critChance ? 2 : 1;
                  crit = Math.random() < this.ship.critChance / 3 ? 3 : crit;
                  damage = Math.floor(crit * this.ship.weaponPower * Math.random());
              this.setMessage("-" + damage, {
                type: "enemy-damage",
                color: "rgba(0, 248, 21, .7)",
                xPos: Game.DIM_X / 2 + (enemy.x - this.ship.x),
                yPos: Game.DIM_Y / 2 + (enemy.y - this.ship.y)
              });

              nullObjects[bullet.objId] = true;
              enemy.health -= damage;
              if (enemy.health < 0) {
                nullObjects[enemy.objId] = true;
                enemy.blowUp();
              } else {
                enemy.aggroed = true;
              }
            }
          }
        }
        if (this.ship.willBeCollidedWith(bullet)) {
          damage = Math.floor(this.ship.weaponPower * Math.random());
          this.health -= damage;
          this.setAlert("-" + damage + " [friendly]", { type: "scale", xPos: Game.DIM_X / 2, yPos: Game.DIM_Y / 2 });
          flashScreenColor('red');
          nullObjects[bullet.objId] = true;
        }
      }
    }
    //-----------------------------------------------------------

    // ENEMY-BULLETS
    //-----------------------------------------------------------
    for (b = 0; b < this.enemyBullets.length; b++) {
      bullet = this.enemyBullets[b];

      if (!nullObjects[bullet.objId]) {
        for (m = 0; m < this.moons.length; m++) {
          moon = this.moons[m];
          this.checkTwoBodyCollision(moon, bullet);
        }

        for (p = 0; p < this.planets.length; p++) {
          planet = this.planets[p];
          // this.checkOnePFiveBodyCollision(planet, asteroid);
          this.checkTwoBodyCollision(planet, bullet);
        }

        for (s = 0; s < this.shields.length + 1; s++) {
          if (s < this.shields.length) {
            shield = this.shields[s];
            this.checkOnePFiveBodyCollision(shield, bullet);
          } else {
            if (this.shieldOn) {
              this.checkOnePFiveBodyCollision(this.shield, bullet);
            }
          }
        }

        if (this.ship.willBeCollidedWith(bullet)) {
          var damage = Math.floor(bullet.ship.weaponPower * Math.random() + 25);
          this.health -= damage;
          this.setAlert("-" + damage, { type: "scale", xPos: Game.DIM_X / 2, yPos: Game.DIM_Y / 2 });
          flashScreenColor('red');
          nullObjects[bullet.objId] = true;
        }

        for (e = 0; e < this.onScreenEnemies.length; e++) {
          enemy = this.onScreenEnemies[e];
          if (!nullObjects[enemy.objId]) {
            if (enemy.willBeCollidedWith(bullet)) {
              var damage = Math.floor(bullet.ship.weaponPower * Math.random() + 25);
              this.setMessage("-" + damage + " [self]", {
                type: "enemy-damage",
                color: "rgba(0, 248, 21, .7)",
                xPos: Game.DIM_X / 2 + (enemy.x - this.ship.x),
                yPos: Game.DIM_Y / 2 + (enemy.y - this.ship.y)
              });

              nullObjects[bullet.objId] = true;
              enemy.health -= damage;
              if (enemy.health < 0) {
                nullObjects[enemy.objId] = true;
                enemy.blowUp();
              }
            }
          }
        }
      }
    }
    //-----------------------------------------------------------

    // ENEMYSHIPS (ship, shields)
    //-----------------------------------------------------------
    for (e = 0; e < this.onScreenEnemies.length; e++) {
      enemy = this.onScreenEnemies[e];
      if (!nullObjects[enemy.objId]) {
        if (this.checkTwoBodyCollision(this.ship, enemy)) {
          var damageToEnemy = Math.floor(50 * Math.random());
          enemy.health -= damageToEnemy;
          this.setMessage("-" + damageToEnemy, {
            type: "enemy-damage",
            color: "rgba(0, 248, 21, .7)",
            xPos: Game.DIM_X / 2 + (enemy.x - this.ship.x),
            yPos: Game.DIM_Y / 2 + (enemy.y - this.ship.y)
          });
          if (enemy.health < 0) {
            nullObjects[enemy.objId] = true;
            enemy.blowUp();
          }
          var damage = Math.floor(50 * Math.random());
          this.health -= damage;
          this.setAlert("-" + damage, { type: "scale", xPos: Game.DIM_X / 2, yPos: Game.DIM_Y / 2 });
          flashScreenColor('red');
        }
      }
      for (s = 0; s < this.shields.length + 1; s++) {
        if (s < this.shields.length) {
          shield = this.shields[s];
          this.checkOnePFiveBodyCollision(shield, enemy);
        } else {
          if (this.shieldOn) {
            this.checkOnePFiveBodyCollision(this.shield, enemy);
          }
        }
      }
    }
    //-----------------------------------------------------------

    // PLANETS
    //-----------------------------------------------------------
    for (p = 0; p < this.planets.length; p++) {
      planet = this.planets[p];

      for (pO = 0; pO < this.planets.length; pO++) {
        if (pO !== p) {
          var otherPlanet = this.planets[pO];
          this.checkTwoBodyCollision(otherPlanet, planet);
        }
      }

      for (m = 0; m < this.moons.length; m++) {
        moon = this.moons[m];
        this.checkTwoBodyCollision(moon, planet);
      }

      for (e = 0; e < this.enemies.length; e++) {
        enemy = this.enemies[e];
        if (!nullObjects[enemy.objId]) {
          this.checkTwoBodyCollision(enemy, planet);
        }
      }

      this.checkTwoBodyCollision(this.ship, planet);
    }
    //-----------------------------------------------------------

    // MOONS
    //-----------------------------------------------------------
    for (m = 0; m < this.moons.length; m++) {
      moon = this.moons[m];

      for (p = 0; p < this.planets.length; p++) {
        planet = this.planets[p];
        this.checkTwoBodyCollision(planet, moon);
      }

      for (e = 0; e < this.enemies.length; e++) {
        enemy = this.enemies[e];
        if (!nullObjects[enemy.objId]) {
          this.checkTwoBodyCollision(enemy, moon);
        }
      }

      this.checkTwoBodyCollision(this.ship, moon);
    }
    //-----------------------------------------------------------

    //destroy asteroids and bullets that died in collisions

    this.asteroids.forEach(function(asteroid) {
      if (!nullObjects[asteroid.objId]) {
        survivingAsteroids.push(asteroid);
      } else {
        asteroidsToBreak.push(asteroid);
      }
    });
    this.asteroids = survivingAsteroids;
    this.breakAsteroids(asteroidsToBreak);

    this.bullets.forEach(function(bullet) {
      if (!nullObjects[bullet.objId]) {
        survivingBullets.push(bullet);
      }
    });
    this.bullets = survivingBullets;

    this.enemyBullets.forEach(function(enemyBullet) {
      if (!nullObjects[enemyBullet.objId]) {
        survivingEnemyBullets.push(enemyBullet);
      }
    });
    this.enemyBullets = survivingEnemyBullets;

    this.enemies.forEach(function(enemy) {
      if (!nullObjects[enemy.objId]) {
        survivingEnemies.push(enemy);
      }
    });
    this.enemies = survivingEnemies;
  }

    Game.prototype.checkTwoBodyCollision = function(object1, object2) {
    if (object1.willBeCollidedWith(object2)) {
      var relativeVelocity = Math.sqrt(Math.pow(object1.vx - object2.vx, 2) + Math.pow(object1.vy - object2.vy, 2));
      var dx = object2.x - object1.x,
          dy = object2.y - object1.y;
      var diff = object2.radius + object1.radius - (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
      var object2V = Math.sqrt(Math.pow(object2.vx, 2) + Math.pow(object2.vy, 2));
      var object1V = Math.sqrt(Math.pow(object1.vx, 2) + Math.pow(object1.vy, 2));
      var theta;

      if (dx === 0) {
        theta = Math.PI / 2;
      } else {
        theta = Math.atan(dy / dx);
      }
      theta = Math.PI - theta;
      if (object1.x - object2.x > 0 && object1.y - object2.y > 0) {
        theta += Math.PI;
      } else if (object1.x - object2.x > 0 && object1.y - object2.y < 0) {
        theta -= Math.PI;
      }
      var totalV = object1V + object2V;
      if (totalV === 0) {
        totalV = .0000000001;
      }
      var object1VRatio = object1V / totalV;
      var object2VRatio = object2V / totalV;

      object1.x += 1.005 * diff * object1VRatio * Math.cos(theta);
      object1.y += -(1.005 * diff * object1VRatio * Math.sin(theta));

      if (object1.objectType === "ship" || object2.objectType === "ship") {
        this.xOffset -= 1.005 * diff * object1VRatio * Math.cos(theta);
        this.yOffset -= -(1.005 * diff * object1VRatio * Math.sin(theta));
        this.shield.x = object1.x;
        this.shield.y = object1.y;
      }

      object2.x -= 1.005 * diff * object2VRatio * Math.cos(theta);
      object2.y -= -(1.005 * diff * object2VRatio * Math.sin(theta));

      var dx = object2.x - object1.x,
          dy = object2.y - object1.y;
      var diff = object2.radius + object1.radius - (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
      var object2V = Math.sqrt(Math.pow(object2.vx, 2) + Math.pow(object2.vy, 2));
      if (object2V === 0) { object2V = .0000000001 }
      var val = object2.vx / object2V;
      if (val > 1) { val = 1 }
      if (val < -1) { val = -1 }
      var object2Angle = Math.acos(val);
      var object1V = Math.sqrt(Math.pow(object1.vx, 2) + Math.pow(object1.vy, 2));
      if (object1V === 0) { object1V = .0000000001 }
      var val = object1.vx / object1V;
      if (val > 1) { val = 1 }
      if (val < -1) { val = -1 }
      var object1Angle = Math.acos(val);
      var theta;
      if (dx === 0) {
        theta = Math.PI / 2;
      } else {
        theta = Math.atan(dy / dx);
      }
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

      return true;
    } else {
      return false;
    }
  }

  Game.prototype.checkOnePFiveBodyCollision = function(object1, object2) {
    if (object2.willBeCollidedWith(object1)) {
      var dx = object1.x - object2.x,
          dy = object1.y - object2.y,
          diff = object2.radius + object1.radius - (Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))),
          v = Math.sqrt(object2.vx * object2.vx + object2.vy * object2.vy);

      var theta;
      if (dx === 0) {
        theta = Math.PI / 2;
      } else {
        theta = Math.atan(dy / dx);
      }
      theta = Math.PI - theta;
      if (object2.x - object1.x > 0 && object2.y - object1.y > 0) {
        theta += Math.PI;
      } else if (object2.x - object1.x > 0 && object2.y - object1.y < 0) {
        theta -= Math.PI;
      }
      object2.x += 1.005 * diff * Math.cos(theta);
      object2.y += -(1.005 * diff * Math.sin(theta));

      if (object1.objectType === "ship" || object2.objectType === "ship") {
        this.xOffset -= 1.005 * diff * Math.cos(theta);
        this.yOffset -= -(1.005 * diff * Math.sin(theta));
        this.shield.x = object2.x;
        this.shield.y = object2.y;
      }

      if (v > .1) {
        var theta = Math.atan((object2.y - object1.y) / (object2.x - object1.x));
        var vdotn = object2.vx * Math.cos(theta) + object2.vy * Math.sin(theta);
        object2.vx = 1 * -2 * (vdotn) * Math.cos(theta) + object2.vx;
        object2.vy = 1 * -2 * (vdotn) * Math.sin(theta) + object2.vy;
      } else {
        object2.vx = 0;
        object2.vy = 0;
      }
      return true;
    } else {
      return false;
    }
  }

  Game.prototype.spawnAsteroids = function(options) {
    var numAsteroids;
    if (options && options.numAsteroids) {
      numAsteroids = options.numAsteroids
    } else {
      numAsteroids = Asteroids.Asteroid.NUM_ASTEROIDS;
    }
    for (var i = 0; i < numAsteroids; i++) {
      var x = Game.MAP_SIZE * Math.random();
      var y = Game.MAP_SIZE * Math.random();

      //make sure no asteroids spawn too close to player
      while (x > this.ship.x - Game.DIM_X / 4 && x < this.ship.x + Game.DIM_X / 4
        || y > this.ship.y - Game.DIM_Y / 4 && y < this.ship.y + Game.DIM_Y / 4) {
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

      this.asteroids.push(new Asteroids.Asteroid(x, y, vx, vy, radius, null, this, mass));
    }
  }

  //asteroid breaking with conservation of momentum
  Game.prototype.breakAsteroid = function(asteroid) {
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

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 9, null, this, .6, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, this, .2, charge));
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

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 3, null, this, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, this, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx3, vy3, 3, null, this, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx4, vy4, 3, null, this, .2, charge));
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

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 6, null, this, .4, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, this, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx3, vy3, 3, null, this, .2, charge));
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

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 6, null, this, .4, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 6, null, this, .4, charge));
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

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 6, null, this, .4, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, this, .2, charge));
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

        this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 3, null, this, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, this, .2, charge));
        this.asteroids.push(new Asteroids.Asteroid(x, y, vx3, vy3, 3, null, this, .2, charge));
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

      this.asteroids.push(new Asteroids.Asteroid(x, y, vx1, vy1, 3, null, this, .2, charge));
      this.asteroids.push(new Asteroids.Asteroid(x, y, vx2, vy2, 3, null, this, .2, charge));
    } else if (asteroid.mass === .2 && asteroid.mined === true) {
      this.resources += asteroid.resourceValue;
      this.setMessage("+" + asteroid.resourceValue, {
        color: "orange",
        type: "default",
        xPos: Asteroids.Game.DIM_X / 2, yPos: Asteroids.Game.DIM_Y / 2
      });
    }
  }

  Game.prototype.breakAsteroids = function(asteroids) {
    asteroids.forEach(function(asteroid) {
      this.breakAsteroid(asteroid);
    }.bind(this));
  }

  Game.prototype.checkKeys = function() {
    if (key.isPressed('w')) {
      this.ship.power();
    } else {
      this.flame.activated = false;
    }

    if (key.isPressed('a')) {
      this.ship.rotateLeft(.175);
    }

    if (key.isPressed('d')) {
     this.ship.rotateRight(.175);
    }

    if (key.isPressed('s')) {
      this.ship.reverseThruster(.4);
    }

    if (key.isPressed('h')) {
      this.ship.repair();
    }

    if (key.isPressed('f')) {
      this.ship.activeWeapon = "asteroidCluster";
    }

    if (key.isPressed('t')) {
      if (this.energy >= 10) {
        this.ship.tractorBeam();
        this.energy -= 10;
      }
    }

    if (key.isPressed('c')) {
      this.sawControls = true;
      this.showControls = true;
    } else {
      this.showControls = false;
    }

    var ship = this.ship,
        planet = this.homePlanet;
    if (key.isPressed('l')) {
      if (this.pDebounce === false) {
        this.pDebounce = true;
        this.syncPlanet = (this.syncPlanet === false && distance(ship, planet) < planet.radius + 300 ? true : false);
        setTimeout(function() {
          this.pDebounce = false;
        }.bind(this), 100);
      }
    }

    if (key.isPressed(16)) {
      if (this.fuel >= 10 && this.fuelRecharging === false) {
        this.ship.afterburner = true;
        this.fuel -= 10;
      } else {
        this.ship.afterburner = false;
      }
    } else {
      this.ship.afterburner = false;
    }

    $(document).bind('contextmenu', function(e) {
      if (e.button == 2) { e.preventDefault() }
    });

    if (key.isPressed('2')) {
      this.ship.activeWeapon = 'single';

      $('#game-screen').css("border", "2px solid red");
      $('#game-screen').css("box-shadow", "0 0 2em red");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('e')) {
      this.ship.activeWeapon = 'multi';

      $('#game-screen').css("border", "2px solid #00F815");
      $('#game-screen').css("box-shadow", "0 0 2em #00F815");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('q')) {
      this.ship.activeWeapon = 'circle';

      $('#game-screen').css("border", "2px solid #FF0DFF");
      $('#game-screen').css("box-shadow", "0 0 2em #FF0DFF");

      setTimeout(function() {
        $('#game-screen').css("border", "2px solid orange");
        $('#game-screen').css("box-shadow", "0 0 .5em orange");
      }, 750);
    }

    if (key.isPressed('space')) {
      if (this.shieldEnergy > 0 && this.shieldRecharging === false) {
        this.shieldOn = true;
        this.shieldEnergy -= 5;
      } else {
        this.shieldOn = false;
      }
    } else {
      this.shieldOn = false;
    }
  }

  Game.prototype.collidedWithAnything = function(object) {
    this.planets.forEach(function(planet) {
      if (object.isCollidedWith(planet)) {
        return true;
      }
    });

    this.moons.forEach(function(moon) {
      if (object.isCollidedWith(moon)) {
        return true;
      }
    });

    this.enemies.forEach(function(enemyShip) {
      if (object.isCollidedWith(enemyShip)) {
        return true;
      }
    });

    if (object.isCollidedWith(this.ship)) {
      return true;
    }
    return false;
  }

  Game.prototype.death = function() {
    this.died = true;
    this.stop();
    var homePlanet = this.homePlanet;
    var homePlanetVtot = homePlanet.vx + homePlanet.vy;
    var vxPercentage = Math.abs(homePlanet.vx / homePlanetVtot);
    var vyPercentage = 1 - vxPercentage;
    var x = homePlanet.x - Game.DIM_X / 2 + 150 * vxPercentage * (homePlanet.vx < 0 ? -1 : 1);
    var y = homePlanet.y - Game.DIM_Y / 2 - homePlanet.radius + 150 * vyPercentage * (homePlanet.vy < 0 ? -1 : 1);

    setTimeout(function() {
      this.died = false;
      this.health = this.maxHealth;
      this.multi = this.maxMulti;
      this.shieldEnergy = this.maxShieldEnergy;
      this.fuel = this.maxFuel;
      this.messages = [];
      this.ship.angle = 3 * Math.PI / 2;
      this.ship.vx = 0;
      this.ship.vy = 0;
      this.ship.x = x + Game.DIM_X / 2;
      this.ship.y = y + Game.DIM_Y / 2;
      this.xOffset = -x;
      this.yOffset = -y;
      this.invincible = true;
      this.ticker = 0;
      this.start();
      if (this.resources >= 1000) {
        var loss = 1000;
        this.resources -= 1000;
      } else {
        var loss = this.resources;
        this.resources = 0;
      }
      this.setAlert("you died", {
        type: "system-message",
        xPos: Game.DIM_X / 2, yPos: Game.DIM_Y / 2
      });
      setTimeout(function() {
        this.setMessage("-" + loss + " resources", {
          color: "orange",
          type: "large",
          xPos: Game.DIM_X / 2, yPos: Game.DIM_Y / 2
        });
      }.bind(this), 3000);
      var blinkInterval = setInterval(function() {
        this.ticker += 1;
      }.bind(this), 50)
      var deathInterval = setInterval(function() {
        this.invincible = false;
        clearInterval(deathInterval);
        clearInterval(blinkInterval);
      }.bind(this), 5000);
    }.bind(this), 2500);
  }

  Game.prototype.setSystemMessage = function(message, options) {
    this.messages.push({
      time: 150,
      message: message,
      color: "rgba(255, 0, 0, .5)",
      randX: 0, randY: 0,
      type: "system-message",
      xPos: Game.DIM_X / 2 - message.length / 2, yPos: 50
    });
  }

  Game.prototype.setMessage = function(message, options) {
    if (options.type !== "enemy-damage") {
      var randomX = Math.random() < .5 ? Math.floor(100 * Math.random()) : -Math.floor(100 * Math.random());
      var randomY = -Math.floor(
        (this.messages.length - this.lastMessagesLength > 3 ? 75 * Math.random() : 125 * Math.random())
      );
    } else {
      var randomX = 0,
          randomY = 0;
    }
    this.messages.push({
      time: 50,
      message: message,
      color: options.color,
      randX: randomX, randY: randomY,
      type: options.type,
      xPos: options.xPos, yPos: options.yPos
    });
  }

  Game.prototype.setAlert = function(message, options) {
    if (options.type !== "enemy-damage") {
      var randomX = Math.random() < .5 ? Math.floor(100 * Math.random()) : -Math.floor(100 * Math.random());
      var randomY = -Math.floor(
        (this.messages.length - this.lastMessagesLength > 3 ? 75 * Math.random() : 125 * Math.random())
      );
    } else {
      var randomX = 0,
          randomY = 0;
    }
    this.messages.push({
      time: 50,
      message: message,
      color: "rgba(255, 0, 0, .75)",
      randX: randomX, randY: randomY,
      type: options.type,
      xPos: options.xPos, yPos: options.yPos
    });
  }

  Game.prototype.displayMessages = function() {
    var messagesToDelete = [];
    this.ctx.beginPath();
    this.messages.forEach(function(message, index) {
      var multipleMessageOffset = 4 * (this.messages.length - index),
          messageContent = message.message;
      if (message.type === "default") {
        this.ctx.font = "11pt monospace";
      } else if (message.type === "scale") {
        var messageInt = parseInt(messageContent * 1.1);
        if (messageInt < 12) { messageInt = 12 }
        this.ctx.font = messageInt + 'pt monospace';
      } else if (message.type === "enemy-kill") {
        var messageInt = parseInt(messageContent.slice(1, messageContent.length));
        this.ctx.font = messageInt + 'pt monospace';
      } else if (message.type === "large") {
        this.ctx.font = '25pt monospace';
      } else if (message.type === "enemy-damage") {
        var messageInt = parseInt(messageContent.slice(1, messageContent.length));
        if (messageInt < 90) { messageInt = 90 }
        this.ctx.font = messageInt / 8 + 'pt monospace';
      } else if (message.type === "huge-enemy-damage") {
        this.ctx.font = '75pt monospace';
      } else if (message.type === "system-message") {
        this.ctx.font = '23pt monospace';
      }
      this.ctx.fillStyle = message.color;
      if (message.time > 0) {
        var offset = 50 - message.time;
        message.time--;
        this.ctx.fillText(
          messageContent,
          message.xPos - messageContent.length * 8.5 + message.randX,
          message.yPos - 10 - offset * 3 + message.randY
        );
      } else {
        messagesToDelete.push(index);
      }
    }.bind(this));
    this.ctx.closePath();
    this.lastMessagesLength = this.messages.length;
    if (messagesToDelete.length > 0) { this.deleteMessages(messagesToDelete) }
  }

  Game.prototype.deleteMessages = function(messageIndices) {
    var deletedMessages = 0;
    for (var i = 0; i < this.messages.length - deletedMessages; i++) {
      this.messages.splice(i, 1);
      deletedMessages++;
      i--;
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
      radius: 9,
      game: this,
      color: "red",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 500,
      resourceValue: 80,
      maxSpeed: .35
    }));
    this.enemies.push(new Asteroids.EnemyShip({
      x: 13500, y: 10500,
      vx: 0, vy: 0,
      radius: 9,
      game: this,
      color: "red",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 500,
      resourceValue: 80,
      maxSpeed: .35
    }));

    this.enemies.push(new Asteroids.EnemyShip({
      x: 19000, y: 19000,
      vx: 0, vy: 0,
      radius: 9,
      game: this,
      color: "red",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 500,
      resourceValue: 80,
      maxSpeed: .35
    }));
    this.enemies.push(new Asteroids.EnemyShip({
      x: 16500, y: 19500,
      vx: 0, vy: 0,
      radius: 9,
      game: this,
      color: "red",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 500,
      resourceValue: 80,
      maxSpeed: .35
    }));

    this.enemies.push(new Asteroids.EnemyShip({
      x: 2500, y: 17500,
      vx: 0, vy: 0,
      radius: 12,
      game: this,
      color: "purple",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 1000,
      resourceValue: 160,
      maxSpeed: .5
    }));
    this.enemies.push(new Asteroids.EnemyShip({
      x: 520, y: 10000,
      vx: 0, vy: 0,
      radius: 12,
      game: this,
      color: "purple",
      enemyType: "attacker",
      angle: -Math.PI / 2,
      health: 1000,
      resourceValue: 160,
      maxSpeed: .5
    }));
  }

  Game.prototype.genEnemyDestroyers = function() {
    this.enemies.push(new Asteroids.EnemyShip({
      x: 11000, y: 13000,
      vx: 0, vy: 0,
      radius: 75,
      game: this,
      color: "silver",
      enemyType: "destroyer",
      angle: -Math.PI / 2,
      health: 5000,
      resourceValue: 80,
      maxSpeed: .05
    }));
    this.enemies.push(new Asteroids.EnemyShip({
      x: 11000, y: 11000,
      vx: 0, vy: 0,
      radius: 75,
      game: this,
      color: "silver",
      enemyType: "destroyer",
      angle: -Math.PI / 2,
      health: 5000,
      resourceValue: 80,
      maxSpeed: .05
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
        resourceValue: 150,
        maxSpeed: .2
      }));
    }
  }

  Game.prototype.genEnemyPatrollers = function() {
    for (var i = 0; i < 10; i++) {
      var x = Math.floor(1800 * Math.random()),
          y = Math.floor(1800 * Math.random());
      var enemy = new Asteroids.EnemyShip({
        x: 1000 + x, y: 1000 + y,
        vx: 0, vy: 0,
        radius: 8,
        game: this,
        color: "orange",
        enemyType: "patroller",
        angle: Math.PI / 2,
        health: 400,
        resourceValue: 60,
        maxSpeed: .25
      });

      while (this.collidedWithAnything(enemy)) {
        x = Math.floor(18000 * Math.random()),
        y = Math.floor(18000 * Math.random());
        enemy = new Asteroids.EnemyShip({
          x: 1000 + x, y: 1000 + y,
          vx: 0, vy: 0,
          radius: 8,
          game: this,
          color: "orange",
          enemyType: "patroller",
          angle: Math.PI / 2,
          health: 400,
          resourceValue: 60,
          maxSpeed: .25
        });
      }

      this.enemies.push(enemy);
    }
  }

  Game.prototype.drawHealth = function() {
    var width = Game.DIM_X;
    var height = Game.DIM_Y;

    if (this.health < 0) { this.health = 0 }
    this.ctx.fillStyle = "rgba(255, 0, 0, .65)";
    this.ctx.strokeStyle = "rgba(255, 0, 0, .65)";
    this.ctx.beginPath();
    // this.ctx.rect((width - (this.health / 3)) / 2, height - 31, (this.health / 3), 6);
    this.ctx.rect((width - (this.maxHealth / 3)) / 2, height - 33, (this.health / 3), 6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fill();
  }

  Game.prototype.drawMultiShotStam = function() {
    var width = Game.DIM_X;
    var height = Game.DIM_Y;

    this.ctx.fillStyle = "rgba(0, 248, 21, .65)";
    this.ctx.strokeStyle = "rgba(0, 248, 21, .65)";
    this.ctx.beginPath();
    this.ctx.rect((width - (this.maxMulti / 3)) / 2, height - 23, (this.multi / 3), 6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fill();
  }

  Game.prototype.drawShieldEnergy = function() {
    var width = Game.DIM_X;
    var height = Game.DIM_Y;

    this.ctx.fillStyle = "rgba(0, 0, 255, .65)";
    this.ctx.strokeStyle = "rgba(0, 0, 255, .65)";
    this.ctx.beginPath();
    this.ctx.rect((width - (this.maxShieldEnergy / 3)) / 2, height - 13, (this.shieldEnergy / 3), 6);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.fill();
  }

  Game.prototype.drawAfterburnerFuel = function() {
    var width = 12,
    height = Game.DIM_Y / 4,
    fuelHeight = .2 * this.fuel;
    if (this.ship.afterburner === true) {
      var opacity = .9;
      var blur = true;
    } else {
      var opacity = .6;
      var blur = false;
    }
    if (blur === true) {
      this.ctx.shadowBlur = 7;
      this.ctx.shadowColor = "rgba(255, 185, 0, .75)";
    }
    this.ctx.fillStyle = "rgba(223, 100, 3, " + opacity + ")";
    roundRect(this.ctx, 15, Game.DIM_Y - fuelHeight - 12.5, width * 1.25, fuelHeight, 5);
    this.ctx.fillStyle = "rgba(255, 255, 0, " + opacity + ")";
    roundRect(this.ctx, 19.5, Game.DIM_Y - fuelHeight - 10.5, width * .15, fuelHeight * .99, 5);
  }

  Game.prototype.displayStats = function() {
    this.ctx.beginPath();
    this.ctx.font = '10pt monospace';
    this.ctx.fillStyle = SYS_MESSAGE_COLOR;
    this.ctx.fillText(
      "ast_grav_time: " + this.aT + " rest_time: " + (new Date() - this.initT - this.aT)
      + " num stroids: " + this.asteroids.length + " x: " + Math.round(this.ship.x) + " y: "
      + Math.round(this.ship.y), 46, 28);
    this.ctx.closePath();
  }

  Game.prototype.displayGameInfo = function() {
    this.ctx.beginPath();
    this.ctx.font = '12pt monospace';
    this.ctx.fillStyle = SYS_MESSAGE_COLOR;
    var resourceMessage = "kills: " + this.ship.kills + " resources: " + this.resources;
    var civilizationMessage = "population of your civilization: " + this.citizens;
    this.ctx.fillText(
      resourceMessage, Game.DIM_X / 2 - (resourceMessage.length / 2) * CHAR_OFFSET, 25
    );
    // this.ctx.fillText(
    //   civilizationMessage, Game.DIM_X / 2 - (civilizationMessage.length / 2) * 9.7, 50
    // );
    this.ctx.closePath();
  }

  Game.prototype.displayMessage = function(message, color) {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.font = '12pt monospace';
    this.ctx.fillText(
      message, Game.DIM_X / 2 - (message.length / 2) * CHAR_OFFSET, 165 + 25 * this.displayedMessages
    );
    this.ctx.closePath();
  }

  Game.prototype.shipDamaged = function(damage) {
    this.setAlert(damage, { type: "scale", xPos: Game.DIM_X / 2, yPos: Game.DIM_Y / 2 });
    flashScreenColor('red');
  }

  function flashScreenColor(color) {
    $('#game-screen').css("border", "2px solid " + color);
    $('#game-screen').css("box-shadow", "0 0 2em " + color);

    setTimeout(function() {
      $('#game-screen').css("border", "2px solid orange");
      $('#game-screen').css("box-shadow", "0 0 .5em orange");
    }, 500);
  };

  function velocity(object) {
    return Math.sqrt(Math.pow(object.vx, 2) + Math.pow(object.vy, 2));
  };

  function netVelocity(object1, object2) {
    return Math.sqrt(Math.pow(object1.vx - object2.vx, 2) + Math.pow(object1.vy - object2.vy, 2));
  };

  function distance(object1, object2) {
    return Math.sqrt(Math.pow(object1.x - object2.x, 2) + Math.pow(object1.y - object2.y, 2));
  };

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined" ) {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  function lastTwoDigits(number) {
    if (number < 100) { return String(number) }
    else {
      var numberString = String(number),
          len = numberString.length,
          lastTwo = numberString.slice(len - 2, len);
      return parseInt(lastTwo);
    }
  };
})(this);
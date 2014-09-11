(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Ship = Asteroids.Ship = function(game) {
    Asteroids.MovingObject.call(this, Ship.SPAWN_X + Asteroids.Game.DIM_X / 2,
      Ship.SPAWN_Y + Asteroids.Game.DIM_Y / 2, 0, 0, Ship.RADIUS, Ship.COLOR);
    this.angle = 3 * Math.PI / 2;
    this.angularAcc = 0;
    this.game = game;
    this.flame = new Asteroids.Flame(this, this.game);
    this.game.flame = this.flame;
    this.mass = Ship.SHIP_MASS;
    this.fx;
    this.fy;
    this.v;
    this.thrust = .75;
    this.kills = 0;
    this.activeWeapon = 'single';
    this.weaponPower = 100;
    this.critChance = .10;
    this.afterburner = false;
    this.objectType = "ship";
  }

  Ship.inherits(Asteroids.MovingObject);

  Ship.RADIUS = 12.5;
  Ship.COLOR = "white";
  Ship.MAX_V = 15;
  Ship.MAX_AB_V = 20;
  Ship.FRICTION_COEFF = .015;
  Ship.SHIP_MASS = 2;
  Ship.SPAWN_X = 10000 - 1000 - Asteroids.Game.DIM_X / 2;
  Ship.SPAWN_Y = 10000 - 1810 - Asteroids.Game.DIM_Y / 2;
  // Ship.SPAWN_X = Asteroids.Game.MAP_SIZE / 2 - 1000 - Asteroids.Game.DIM_X / 2;
  // Ship.SPAWN_Y = Asteroids.Game.MAP_SIZE / 2 - 1810 - Asteroids.Game.DIM_Y / 2;
  // right side of red planet
  // Ship.SPAWN_X = Asteroids.Game.MAP_SIZE / 2 - 865;
  // Ship.SPAWN_Y = Asteroids.Game.MAP_SIZE / 2 - 1400;
  // Ship.SPAWN_X = 2000 //- 500;
  // Ship.SPAWN_Y = 2000;

  Ship.prototype.handleClick = function(position) {
    var angle = Math.atan(position[1] / position[0]);

    if (position[0] < 0) { angle += Math.PI }

    if (this.game.canAttack) {
      if (this.activeWeapon === 'single') {
        this.fireBullet(angle);
      } else if (this.activeWeapon === 'multi' && this.game.multi >= 30 && this.game.multiRecharging === false) {
        this.scatterShot(angle);
        this.game.multi -= 30;
      } else if (this.activeWeapon === 'circle') {
        this.fireCircleShot();
      } else if (this.activeWeapon === 'asteroidCluster') {
        this.fireAsteroidCluster(angle);
      }
    } else if (this.game.insideBase) {
      this.game.setSystemMessage("can't fire weapons inside your own base");
    }
  }

  Ship.prototype.repair = function() {
    if (this.game.points >= 200) {
      this.game.points -= 200;
      if (this.game.maxHealth - this.game.health <= 500) {
        this.game.health += 500
      } else {
        this.game.health = this.game.maxHealth;
      }
    }
  }

  Ship.prototype.applyForces = function() {
    this.gravity();
  }

  Ship.prototype.gravity = function() {
    var thisShip = this;

    thisShip.v = Math.sqrt(Math.pow(thisShip.vx, 2) + Math.pow(thisShip.vy, 2));

    var fgx = 0;
    var fgy = 0;

    thisShip.game.planets.forEach(function(planet) {
      var dx = planet.x - thisShip.x;
      var dy = planet.y - thisShip.y;

      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var fg = Asteroids.Game.GRAV_CONST * thisShip.mass * planet.mass / Math.pow(d, 2);

      if (!thisShip.isCollidedWith(planet)) {
       fgx += (dx / d) * fg;
       fgy += (dy / d) * fg;
      }
    });

    thisShip.game.moons.forEach(function(moon) {
      var dx = moon.x - thisShip.x;
      var dy = moon.y - thisShip.y;

      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var fg = Asteroids.Game.GRAV_CONST * thisShip.mass * moon.mass / Math.pow(d, 2);

      if (!thisShip.isCollidedWith(moon)) {
        fgx += (dx / d) * fg;
        fgy += (dy / d) * fg;
      }
    });
    thisShip.vx += fgx;
    thisShip.vy += fgy;
  }

  Ship.prototype.friction = function() {
    if (Math.abs(this.vx) > .015) {
      if (this.vx > 0) {
        this.vx -= Ship.FRICTION_COEFF;
      } else if (this.vx < 0) {
        this.vx += Ship.FRICTION_COEFF;
      }
    }

    if (Math.abs(this.vy) > .015) {
      if (this.vy > 0) {
        this.vy -= Ship.FRICTION_COEFF;
      } else if (this.vy < 0) {
        this.vy += Ship.FRICTION_COEFF;
      }
    }
  }

  Ship.prototype.reverseThruster = function(value) {
    if (Math.abs(this.vx) > .015) {
      if (this.vx > 0) {
        this.vx -= value;
      } else if (this.vx < 0) {
        this.vx += value;
      }
    }

    if (Math.abs(this.vy) > .015) {
      if (this.vy > 0) {
        this.vy -= value;
      } else if (this.vy < 0) {
        this.vy += value;
      }
    }
  }

  Ship.prototype.drawWindshield = function(ctx) {
    this.ctx = ctx;
    ctx.fillStyle = "rgba(0, 0, 125, .35)";
    ctx.strokeStyle = "rgba(150, 150, 150, .95)";
    ctx.lineWidth = 1;
    ctx.beginPath();

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    var angle = this.angle;
    var radius = this.radius * .5;

    var startingX = Asteroids.Game.DIM_X / 2 + 1.5 * Math.cos(angle);
    var startingY = Asteroids.Game.DIM_Y / 2 + 1.5 * Math.sin(angle);

    ctx.moveTo(startingX + .5 * radius * Math.cos(angle), startingY + .5 * radius * Math.sin(angle));
    ctx.lineTo(startingX + radius * Math.cos(angle + (2.25 / 3) * Math.PI), startingY + radius * Math.sin(angle + (2.25 / 3) * Math.PI));

    ctx.lineTo(startingX + .5 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + radius * Math.cos(angle + (3.75 / 3) * Math.PI), startingY + radius * Math.sin(angle + (3.75 / 3) * Math.PI));
    ctx.lineTo(startingX + .5 * radius * Math.cos(angle), startingY + .5 * radius * Math.sin(angle));
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }

  Ship.prototype.draw = function(ctx) {
    this.ctx = ctx;
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    var angle = this.angle;
    var radius = this.radius;

    var startingX = Asteroids.Game.DIM_X / 2;
    var startingY = Asteroids.Game.DIM_Y / 2;

    ctx.moveTo(startingX + radius * Math.cos(angle), startingY + radius * Math.sin(angle));
    ctx.lineTo(startingX + radius * Math.cos(angle + (2.25 / 3) * Math.PI), startingY + radius * Math.sin(angle + (2.25 / 3) * Math.PI));

    ctx.lineTo(startingX + .35 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + radius * Math.cos(angle + (3.75 / 3) * Math.PI), startingY + radius * Math.sin(angle + (3.75 / 3) * Math.PI));
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    this.drawWindshield(ctx);
  }

  Ship.prototype.renderPieces = function() {
    curShip = this;
    this.pieces.forEach(function(piece) {
      piece.draw(curShip.ctx);
      piece.move();
    })
  }

  Ship.prototype.move = function() {
    if (this.x + this.vx > Asteroids.Game.MAP_SIZE || this.x + this.vx < 0) {
      this.vx *= -1;
    }
    if (this.y + this.vy > Asteroids.Game.MAP_SIZE || this.y + this.vy < 0) {
      this.vy *= -1;
    }
    if (this.game.syncPlanet === true) {
      this.vx = this.game.homePlanet.vx;
      this.vy = this.game.homePlanet.vy;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.game.shield.x = this.x;
    this.game.shield.y = this.y;
    this.game.xOffset -= this.vx;
    this.game.yOffset -= this.vy;
  }

  Ship.prototype.rotateLeft = function(amount) {
    this.angle -= amount;
  }

  Ship.prototype.rotateRight = function(amount) {
    this.angle += amount;
  }

  Ship.prototype.power = function() {
    this.flame.activated = true;

    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));

    if (this.afterburner === false) {
      if (speed < Ship.MAX_V) {
        this.vx += this.thrust * Math.cos(this.angle);
        this.vy += this.thrust * Math.sin(this.angle);
      } else {
        var hypV = Math.sqrt(Math.pow(this.vx + this.thrust * Math.cos(this.angle), 2)
                 + Math.pow(this.vy + this.thrust * Math.sin(this.angle), 2));
        if (hypV < this.v) {
          this.vx += 1.4 * this.thrust * Math.cos(this.angle);
          this.vy += 1.4 * this.thrust * Math.sin(this.angle);
        }
      }
    } else if (this.afterburner === true) {
      if (speed < Ship.MAX_AB_V) {
        this.vx += 4 * this.thrust * Math.cos(this.angle);
        this.vy += 4 * this.thrust * Math.sin(this.angle);
      } else {
        var hypV = Math.sqrt(Math.pow(this.vx + this.thrust * Math.cos(this.angle), 2)
                 + Math.pow(this.vy + this.thrust * Math.sin(this.angle), 2));
        if (hypV < this.v) {
          this.vx += 5.5 * this.thrust * Math.cos(this.angle);
          this.vy += 5.5 * this.thrust * Math.sin(this.angle);
        }
      }
    }
  }

  function calcNormvx(angle) {
    return Math.cos(angle);
  };

  function calcNormvy(angle) {
    return Math.sin(angle);
  };

  Ship.prototype.fireBullet = function(angle){
    var thisShip = this;
    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    var normvx = Math.cos(angle);
    var normvy = Math.sin(angle);

    var bullet = new Asteroids.Bullet(this.x, this.y, normvx * Asteroids.Bullet.BULLETSPEED,
      normvy * Asteroids.Bullet.BULLETSPEED, thisShip.game, 'red', this);

    //kickback
    if (speed < Ship.MAX_V) {
      this.vx -= normvx * .025;
      this.vy -= normvy * .025;
    }

    this.game.bullets.push(bullet);
  }

  Ship.prototype.fireCircleShot = function() {
    var thisShip = this;
    var bullets = [];

    for (var i = 0; i < 10; i++) {
      bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(2 * i * Math.PI / 10) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(2 * i * Math.PI / 10) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#FF0DFF', this));
    }

    bullets.forEach(function(bullet) {
      thisShip.game.bullets.push(bullet);
    });
  }

  Ship.prototype.scatterShot = function(angle) {
    var thisShip = this;
    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    var normvx = Math.cos(angle);
    var normvy = Math.sin(angle);
    var bullets = [];

    bullets.push(new Asteroids.Bullet(this.x, this.y, normvx * Asteroids.Bullet.BULLETSPEED,
      normvy * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#00F815', this));

    bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#00F815', this));

    bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(angle + Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(angle + Math.PI / 30) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#00F815', this));

    //kickback
    if (speed < Ship.MAX_V) {
      this.vx -= normvx * .075;
      this.vy -= normvy * .075;
    }

    bullets.forEach(function(bullet) {
      thisShip.game.bullets.push(bullet);
    });
  }

  Ship.prototype.fireAsteroidCluster = function(angle) {
    for (var i = 0; i < 25; i++) {
      this.game.asteroids.push(Asteroids.Asteroid.asteroidWithinRadius({
        x: this.x, y: this.y,
        spawnRadius: 30, radius: 8,
        game: this.game,
        velocityX: calcNormvx(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
        velocityY: calcNormvy(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
        mass: 3
      }));
    }
  }
})(this);
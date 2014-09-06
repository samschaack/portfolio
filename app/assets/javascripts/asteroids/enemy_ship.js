(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var EnemyShip = Asteroids.EnemyShip = function(options){
    Asteroids.MovingObject.call(this, options.x,
      options.y, options.vx, options.vy, options.radius, options.color);
    this.angle = options.angle;
    this.angularAcc = 0;
    this.game = options.game;
    this.flame = new Asteroids.Flame(this, this.game);
    this.flame = this.flame;
    this.mass = EnemyShip.ENEMY_SHIP_MASS;
    this.health = options.health;
    // this.accuracy = options.accuracy;
    this.enemyType = options.enemyType;
    this.activeWeapon = 'single';
    this.resourceValue = options.resourceValue;
  };

  EnemyShip.inherits(Asteroids.MovingObject);

  EnemyShip.RADIUS = 10;
  EnemyShip.COLOR = "red";
  EnemyShip.MAX_V = 12.5;
  EnemyShip.ENEMY_SHIP_MASS = 1;

  EnemyShip.prototype.applyForces = function() {
    this.gravity();
  }

  EnemyShip.prototype.blowUp = function() {
    this.game.points += this.resourceValue;
  }

  EnemyShip.prototype.gravity = function() {
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

    thisShip.vx += fgx;
    thisShip.vy += fgy;
  }

  EnemyShip.prototype.reverseThruster = function(value) {
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

  EnemyShip.prototype.draw = function(ctx) {
    this.ctx = ctx;
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    var angle = this.angle;
    var radius = 1 * this.radius;

    var startingX = this.game.xOffset + this.x;
    var startingY = this.game.yOffset + this.y;

    ctx.moveTo(startingX + radius * Math.cos(angle), startingY + radius * Math.sin(angle));
    ctx.lineTo(startingX + radius * Math.cos(angle + (2.25 / 3) * Math.PI), startingY + radius * Math.sin(angle + (2.25 / 3) * Math.PI));

    ctx.lineTo(startingX + .35 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + radius * Math.cos(angle + (3.75 / 3) * Math.PI), startingY + radius * Math.sin(angle + (3.75 / 3) * Math.PI));
    ctx.stroke();
    ctx.closePath();

    ctx.fill();

    var width = 1050;
    var height = 750;

    ctx.fillStyle = "rgba(255, 0, 0, .5)";
    ctx.beginPath();
    ctx.rect(startingX - (this.health / 30), startingY - 25, (this.health / 15), 5);
    ctx.stroke();
    ctx.closePath();

    ctx.fill();
  };

  EnemyShip.prototype.renderPieces = function() {
    curShip = this;
    this.pieces.forEach(function(piece) {
      piece.draw(curShip.ctx);
      piece.move();
    })
  }

  EnemyShip.prototype.move = function() {
    if (this.enemyType === "attacker") {
      var dir = [0, 0];

      if (!(this.speed > EnemyShip.MAX_V)) {
        if (this.distance > 200) {
          if (this.xDiff > 0) {
            dir[0] = 1;
          } else {
            dir[0] = -1;
          }
          if (this.yDiff > 0) {
            dir[1] = 1;
          } else {
            dir[1] = -1;
          }
        } else {
          dir = "stop";
        }
      } else {
        dir = "stop";
      }

      this.power(dir);

      this.x += this.vx;
      this.y += this.vy;
    } else if (this.enemyType === "defender") {
      if (this.distance > 300) {
        var diffRadX = this.x - 3500,
            diffRadY = this.y - 3500,
            distance = Math.sqrt(Math.pow(diffRadX, 2) + Math.pow(diffRadY, 2));

        var angle = Math.atan(diffRadY / diffRadX);
        if (diffRadX < 0) {
          angle += Math.PI;
          this.angle = angle - Math.PI / 2;
        } else {
          this.angle = angle + Math.PI / 2;
        }

        if (distance > 1100) {
          this.vx -= 3 * Math.cos(angle);
          this.vy -= 3 * Math.sin(angle);
        } else if (distance < 900) {
          this.vx += 3 * Math.cos(angle);
          this.vy += 3 * Math.sin(angle);
        } else {
          this.vx = -4.5 * Math.sin(angle);
          this.vy = 4.5 * Math.cos(angle);
        }

        if (diffRadX < 0) {
          angle += Math.PI;
          this.angle -= Math.PI;
        }
      } else {
        var dir = [0, 0];

        if (!(this.speed > EnemyShip.MAX_V)) {
          if (this.distance > 200) {
            if (this.xDiff > 0) {
              dir[0] = 1;
            } else {
              dir[0] = -1;
            }
            if (this.yDiff > 0) {
              dir[1] = 1;
            } else {
              dir[1] = -1;
            }
          } else {
            dir = "stop";
          }
        } else {
          dir = "stop";
        }

        this.power(dir);

        if (ticker % 50 === 0) {
          this.attack();
        }
      }
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  EnemyShip.prototype.power = function(dir) {
    this.flame.activated = true;

    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));

    if (dir === "stop") {
      if (this.vx > 0) {
        this.vx -= .25;
      } else {
        this.vx += .25;
      }
      if (this.vy > 0) {
        this.vy -= .25;
      } else {
        this.vy += .25;
      }
    } else {
      this.vx += .25 * dir[0];
      this.vy += .25 * dir[1];
    }

    var angle = Math.atan(this.yDiff / this.xDiff);

    if (this.xDiff < 0) { angle += Math.PI }

    this.angle = angle;
  }

  EnemyShip.prototype.step = function() {
    this.xDiff = this.game.ship.x - this.x,
    this.yDiff = this.game.ship.y - this.y,
    this.distance = Math.sqrt(Math.pow(this.xDiff, 2) + Math.pow(this.yDiff, 2)),
    this.speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));

    if (this.enemyType === "attacker") {
      this.move();
      if (ticker % 20 === 0) {
        this.attack();
      }
    } else if (this.enemyType === "turret") {
      if (ticker % 50 === 0) {
        this.attack();
      }
    } else if (this.enemyType === "defender") {
      this.move();
    }
  }

  EnemyShip.prototype.attack = function() {
    if (!this.game.offScreen(this)) {
      if (this.enemyType === "attacker") {
        var randomX = Math.random();
        if (randomX < .5) { this.xDiff -= 100 * Math.random() }
        else { this.xDiff += 100 * Math.random() }

        var randomY = Math.random();
        if (randomY < .5) { this.yDiff -= 100 * Math.random() }
        else { this.yDiff += 100 * Math.random() }

        var angle = Math.atan(this.yDiff / this.xDiff);

        if (this.xDiff < 0) { angle += Math.PI }

        if (this.activeWeapon === 'single') {
          this.fireBullet(angle);
        } else if (this.activeWeapon === 'multi') {
          this.scatterShot(angle);
        } else if (this.activeWeapon === 'circle') {
          this.fireCircleShot();
        }
      } else if (this.enemyType === "turret") {
        var pCenterDist = Math.sqrt(Math.pow(this.game.ship.x - 3500, 2) + Math.pow(this.game.ship.y - 3500, 2));
        if (pCenterDist < 1000) {
          var randomX = Math.random();
          if (randomX < .5) { this.xDiff -= 10 * Math.random() }
          else { this.xDiff += 10 * Math.random() }

          var randomY = Math.random();
          if (randomY < .5) { this.yDiff -= 10 * Math.random() }
          else { this.yDiff += 10 * Math.random() }

          var angle = Math.atan(this.yDiff / this.xDiff);

          if (this.xDiff < 0) { angle += Math.PI }

          if (this.activeWeapon === 'single') {
            this.fireBullet(angle);
          } else if (this.activeWeapon === 'multi') {
            this.scatterShot(angle);
          } else if (this.activeWeapon === 'circle') {
            this.fireCircleShot();
          }
        }
      } else if (this.enemyType === "defender") {
        var randomX = Math.random();
        if (randomX < .5) { this.xDiff -= 15 * Math.random() }
        else { this.xDiff += 15 * Math.random() }

        var randomY = Math.random();
        if (randomY < .5) { this.yDiff -= 15 * Math.random() }
        else { this.yDiff += 15 * Math.random() }

        var angle = Math.atan(this.yDiff / this.xDiff);

        if (this.xDiff < 0) { angle += Math.PI }

        this.scatterShot(angle);
      }
    }
  }

  function calcNormvx(angle) {
    return Math.cos(angle);
  }

  function calcNormvy(angle) {
    return Math.sin(angle);
  }

  EnemyShip.prototype.fireBullet = function(angle){
    var thisShip = this;
    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    var normvx = Math.cos(angle);
    var normvy = Math.sin(angle);

    if (this.enemyType === "attacker") {
      var color = "red";
    } else if (this.enemyType === "turret") {
      var color = "yellow";
    }

    var bullet = new Asteroids.Bullet(this.x, this.y, normvx * Asteroids.Bullet.BULLETSPEED,
      normvy * Asteroids.Bullet.BULLETSPEED, thisShip.game, color);

    this.game.enemyBullets.push(bullet);
  }

  EnemyShip.prototype.fireCircleShot = function() {
    var thisShip = this;
    var bullets = [];

    for (var i = 0; i < 10; i++) {
      bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(2 * i * Math.PI / 10) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(2 * i * Math.PI / 10) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#FF0DFF'));
    }

    bullets.forEach(function(bullet) {
      thisShip.game.enemyBullets.push(bullet);
    });
  }

  EnemyShip.prototype.scatterShot = function(angle) {
    var thisShip = this;
    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    var normvx = Math.cos(angle);
    var normvy = Math.sin(angle);
    var bullets = [];

    bullets.push(new Asteroids.Bullet(this.x, this.y, normvx * Asteroids.Bullet.BULLETSPEED,
      normvy * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#F22'));

    bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#F22'));

    bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(angle + Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(angle + Math.PI / 30) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#F22'));

    //kickback
    if (speed < EnemyShip.MAX_V) {
      this.vx -= normvx * .075;
      this.vy -= normvy * .075;
    }

    bullets.forEach(function(bullet) {
      thisShip.game.enemyBullets.push(bullet);
    });
  }
})(this);
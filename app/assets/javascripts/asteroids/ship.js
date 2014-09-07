(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Ship = Asteroids.Ship = function(game){
    Asteroids.MovingObject.call(this, Ship.SPAWN_X + Asteroids.Game.DIM_X / 2,
      Ship.SPAWN_Y + Asteroids.Game.DIM_Y / 2, 0, 0, Ship.RADIUS, Ship.COLOR);
    this.angle = -Math.PI / 2;
    this.angularAcc = 0;
    this.game = game;
    this.flame = new Asteroids.Flame(this, this.game);
    this.game.flame = this.flame;
    this.mass = Ship.SHIP_MASS;
    this.fx;
    this.fy;
    this.v;
    this.health = 1000;
    this.kills = 0;
    this.activeWeapon = 'single';
  };

  Ship.inherits(Asteroids.MovingObject);

  Ship.RADIUS = 10;
  Ship.COLOR = "white";
  Ship.MAX_V = 12.5;
  Ship.FRICTION_COEFF = .015;
  Ship.SHIP_MASS = 2;
  Ship.SPAWN_X = Asteroids.Game.MAP_SIZE / 2 - 500;
  Ship.SPAWN_Y = Asteroids.Game.MAP_SIZE / 2 - 300;

  Ship.prototype.handleClick = function(position) {
    var angle = Math.atan(position[1] / position[0]);

    if (position[0] < 0) { angle += Math.PI }

    if (!this.game.shieldOn) {
      if (this.activeWeapon === 'single') {
        this.fireBullet(angle);
      } else if (this.activeWeapon === 'multi' && this.game.multi >= 50) {
        this.scatterShot(angle);
        this.game.multi -= 50;
      } else if (this.activeWeapon === 'circle') {
        this.fireCircleShot();
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

    thisShip.game.bombs.forEach(function(bomb) {
      var dx = bomb.x - thisShip.x;
      var dy = bomb.y - thisShip.y;

      var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      if (d < 2) {
        var rand = parseInt(2 * Math.random());

        if (rand === 0) {
          d = 2;
        } else {
          d = -2;
        }
      }

      var fg = -Asteroids.Game.GRAV_CONST * thisShip.mass * bomb.mass / Math.pow(d, 2);

      fgx += (dx / d) * fg;
      fgy += (dy / d) * fg;
    });

    //if (Math.abs(thisShip.v) < 20) {
      thisShip.vx += fgx;
      thisShip.vy += fgy;
      //}
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

  Ship.draw = function(ctx, angle, startingX, startingY) {
    //for rendering lives
    this.ctx = ctx;
    ctx.fillStyle = "rgba(255, 255, 255, .75)";
    ctx.beginPath();

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    var radius = 10;

    ctx.moveTo(startingX + radius * Math.cos(angle), startingY + radius * Math.sin(angle));
    ctx.lineTo(startingX + radius * Math.cos(angle + (2.25 / 3) * Math.PI), startingY + radius * Math.sin(angle + (2.25 / 3) * Math.PI));

    ctx.lineTo(startingX + .35 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + radius * Math.cos(angle + (3.75 / 3) * Math.PI), startingY + radius * Math.sin(angle + (3.75 / 3) * Math.PI));
    ctx.stroke();
    ctx.closePath();

    ctx.fill();
  };

  Ship.prototype.draw = function(ctx) {
    this.ctx = ctx;
    ctx.fillStyle = this.color;
    ctx.beginPath();

    ctx.shadowBlur = 0;
    ctx.shadowColor = this.color;

    var angle = this.angle;
    var radius = 1 * this.radius;

    var startingX = Asteroids.Game.DIM_X / 2;
    var startingY = Asteroids.Game.DIM_Y / 2;

    ctx.moveTo(startingX + radius * Math.cos(angle), startingY + radius * Math.sin(angle));
    ctx.lineTo(startingX + radius * Math.cos(angle + (2.25 / 3) * Math.PI), startingY + radius * Math.sin(angle + (2.25 / 3) * Math.PI));

    ctx.lineTo(startingX + .35 * radius * Math.cos(angle + Math.PI), startingY + .35 * radius * Math.sin(angle + Math.PI));

    ctx.lineTo(startingX + radius * Math.cos(angle + (3.75 / 3) * Math.PI), startingY + radius * Math.sin(angle + (3.75 / 3) * Math.PI));
    ctx.stroke();
    ctx.closePath();

    ctx.fill();
  };

  Ship.prototype.renderPieces = function() {
    curShip = this;
    this.pieces.forEach(function(piece) {
      piece.draw(curShip.ctx);
      piece.move();
    })
  }

  Ship.prototype.step = function() {
    if (this.counter < 100) {
      this.renderPieces();
      this.counter += 1;
    } else {
      //alert('Game Over!');
      clearInterval(this.timer);
    }
  }

  Ship.prototype.blowUpAndEndGame = function(game) {
    game.ship.radius = 0;

    this.pieces = [];
    var num_pieces = parseInt(4 * Math.random() + 3);
    for (var i = 0; i < num_pieces; i++) {
      this.pieces.push(new Asteroids.ShipPiece(this, game));
    }
    this.counter = 0;
    this.timer = setInterval(this.step.bind(this), Asteroids.Game.FPS);
  }

  Ship.prototype.move = function() {
    if (this.x + this.vx > Asteroids.Game.MAP_SIZE || this.x + this.vx < 0) {
      this.vx *= -1;
    }
    if (this.y + this.vy > Asteroids.Game.MAP_SIZE || this.y + this.vy < 0) {
      this.vy *= -1;
    }
    this.x = (this.x + this.vx)
    this.y = (this.y + this.vy)
    this.game.shield.x = this.x;
    this.game.shield.y = this.y;
    this.game.xOffset -= this.vx;
    this.game.yOffset -= this.vy;
  };

  Ship.prototype.power = function(){
    this.flame.activated = true;

    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));

    if (speed < Ship.MAX_V) {
      this.vx += .25 * Math.cos(this.angle);
      this.vy += .25 * Math.sin(this.angle);
    } else {
      var hypV = Math.sqrt(Math.pow(this.vx + .25 * Math.cos(this.angle), 2)
               + Math.pow(this.vy + .25 * Math.sin(this.angle), 2));
      if (hypV < this.v) {
        this.vx += .35 * Math.cos(this.angle);
        this.vy += .35 * Math.sin(this.angle);
      }
    }
  }

  function calcNormvx(angle) {
    return Math.cos(angle);
  }

  function calcNormvy(angle) {
    return Math.sin(angle);
  }

  Ship.prototype.fireBullet = function(angle){
    var thisShip = this;
    var speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    var normvx = Math.cos(angle);
    var normvy = Math.sin(angle);

    var bullet = new Asteroids.Bullet(this.x, this.y, normvx * Asteroids.Bullet.BULLETSPEED,
      normvy * Asteroids.Bullet.BULLETSPEED, thisShip.game, 'red');

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
      calcNormvy(2 * i * Math.PI / 10) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#FF0DFF'));
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
      normvy * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#00F815'));

    bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(angle - Math.PI / 30) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#00F815'));

    bullets.push(new Asteroids.Bullet(this.x, this.y, calcNormvx(angle + Math.PI / 30) * Asteroids.Bullet.BULLETSPEED,
      calcNormvy(angle + Math.PI / 30) * Asteroids.Bullet.BULLETSPEED, thisShip.game, '#00F815'));

    //kickback
    if (speed < Ship.MAX_V) {
      this.vx -= normvx * .075;
      this.vy -= normvy * .075;
    }

    bullets.forEach(function(bullet) {
      thisShip.game.bullets.push(bullet);
    });
  }
})(this);
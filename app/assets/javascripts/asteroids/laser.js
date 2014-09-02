(function(root){
  var Asteroids = root.Asteroids = (root.Asteroids || {});

  var Laser = Asteroids.Laser = function(x, y, vx, vy, game){
    Asteroids.MovingObject.call(this, x, y, vx, vy, Laser.RADIUS, Laser.COLOR);
    this.game = game;
  };
  
  Laser.inherits(Asteroids.MovingObject);
  
  Laser.RADIUS = 2;
  Laser.COLOR = "green";
  
  Laser.prototype.move = function() {
    this.x = (this.x + this.vx);
    this.y = (this.y + this.vy);
  }
})(this);

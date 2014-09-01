(function(root){
  var Visualizer = root.Visualizer = function(canvas){
    this.ctx = canvas.getContext("2d");
    buildObjects.call(this);
    this.baseAmp = 200;
    this.angleOffset = 0;
    this.ticker = 100;
  }

  root.setupTimer = function setupTimer(tempo) {
    tempo = tempo / 120;
    this.tempoTimer = setInterval(function() {
      this.baseAmp = 50 + this.volume / 225// + 100 * Math.sin(tempo * (this.ticker / 200) * 2 * Math.PI);;
      // console.log(this.volume)
      this.ticker++;
      if (this.volume < 20000) { this.angleOffset += .2 }
      else { this.angleOffset -= .2 }
    }.bind(this), 10);
  }
  //250 * Math.cos(tempo * (this.ticker / 100) * 2 * Math.PI) * Math.sin(tempo * (this.ticker / 200) * 2 * Math.PI);

  function Circle(options) {
    this.angle = 0;
    this.amplitude = 0;
    this.radius = options.radius;
    this.color = 'white';
  }

  Circle.prototype.draw = function(ctx, freqBin, options) {
    var x, y;

    xInit = 400 + options.baseAmp * Math.cos(this.angle);
    yInit = 400 + options.baseAmp * Math.sin(this.angle);

    var dominantRange = options.dominantRange;
    // console.log(dominantRange)
    var color = 'white';
    if (dominantRange === "bass") { color = 'rgba(' + freqBin + ', ' + 0 + ', ' + 0 + ', 1)' }
    else if (dominantRange === "lowMid") { color = 'rgba(' + 0 + ', ' + freqBin + ', ' + 255 + ', 1)' }
    else if (dominantRange === "highMid") { color = 'rgba(' + 0 + ', ' + 255 + ', ' + freqBin + ', 1)' }
    else if (dominantRange === "high") { color = 'rgba(' + 255 + ', ' + 255 + ', ' + 0 + ', 1)' }

    ctx.beginPath();

    if (options.drawStyle === "circle") {
      x = 400 + (options.baseAmp + this.amplitude) * Math.cos(this.angle + options.angleOffset);
      y = 400 + (options.baseAmp + this.amplitude) * Math.sin(this.angle + options.angleOffset);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
      ctx.fillStyle = color;
      ctx.arc(
        x,
        y,
        this.radius,
        0,
        2 * Math.PI,
        false
      );

      ctx.fill();
    } else if (options.drawStyle === "line") {
      x = 400 + (options.baseAmp + this.amplitude) * Math.cos(this.angle);
      y = 400 + (options.baseAmp + this.amplitude) * Math.sin(this.angle);
      ctx.shadowBlur = 0;
      ctx.shadowColor = "white";
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.moveTo(xInit, yInit);
      ctx.lineTo(x, y);

      ctx.stroke();
    }

    ctx.closePath();
  }

  function buildObjects() {
    this.levelOneObjects = [];
    this.circles = [];

    for (var i = 0; i < 256; i++) {
      this.levelOneObjects.push(new Circle({ radius: 2 }));
      this.circles.push(new Circle({ radius: 2 }));
    }
  };

  function buildCircles() {
    circles = [];

    for (var i = 0; i < 256; i++) {
      circles.push(new Circle({ radius: 2 }));
    }

    return circles;
  };

  function sumSection(array, options) {
    var max, min;
    var sum = 0;

    max = options.max;
    min = options.min;

    for (var i = min; i < max; i++) {
      sum += array[i];
    }

    return sum;
  }

  function animateCircles(circles) {
    var ticker = 0;

    var me = setInterval(function() {
      if (ticker < 200) {
        circles
      } else {
        clearInterval(me);
      }
    }, 30);
  }

  Visualizer.prototype.tick = function(array) {
    for (var i = 0; i < array.length; i++) {
      var value = array[i];
      var object = this.levelOneObjects[i];
      var circle = this.circles[i];

      this.bass = sumSection(array, { min: 0, max: 83 });
      this.lowMid = sumSection(array, { min: 84, max: 126 });
      this.highMid = sumSection(array, { min: 127, max: 167 });
      this.high = sumSection(array, { min: 168, max: 255 });
      this.volume = sumSection(array, { min: 0, max: 255 });

      var dominantRange;
      var bassDiff = this.bass - this.lastBass;
      var lowMidDiff = this.lowMid - this.lastLowMid;
      var highMidDiff = this.highMid - this.lastHighMid;
      var highDiff = this.high - this.lastHigh;
      if (bassDiff > lowMidDiff && bassDiff > highDiff && bassDiff > highMidDiff) { dominantRange = "bass" }
      else if (lowMidDiff > bassDiff && lowMidDiff > highDiff && lowMidDiff > highMidDiff) { dominantRange = "lowMid" }
      else if (highMidDiff > bassDiff && highMidDiff > highDiff && highMidDiff > lowMidDiff) { dominantRange = "highMid" }
      else if (highDiff > lowMidDiff && highDiff > bassDiff && highDiff > highMidDiff) { dominantRange = "high" }

      object.angle = (256 - i) / 256 * 2 * Math.PI - Math.PI / 2;
      object.amplitude = value / 2;

      if (i % 2 === 0) {
        // object.draw(this.ctx, i, { drawStyle: "line" });
        object.draw(this.ctx, i, {
          drawStyle: "circle", baseAmp: this.baseAmp, angleOffset: this.angleOffset, dominantRange: dominantRange
        });
      } else {
        object.draw(this.ctx, i, {
          drawStyle: "line", baseAmp: this.baseAmp, angleOffset: this.angleOffset, dominantRange: dominantRange
        });
        object.draw(this.ctx, i, {
          drawStyle: "circle", baseAmp: this.baseAmp, angleOffset: this.angleOffset, dominantRange: dominantRange
        });
      }

      if (this.ticker % 100 === 0) {
        // animateCircles(buildCircles());
      }

      if (this.ticker % 25 === 0) {
        this.lastBass = this.bass;
        this.lastLowMid = this.lowMid;
        this.lastHighMid = this.highMid;
        this.lastHigh = this.high;
      }

      circle.angle = (256 - i) / 256 * 2 * Math.PI - Math.PI / 2;
      circle.amplitude = 0;
      circle.draw(this.ctx, i, {
        drawStyle: "circle", baseAmp: this.baseAmp, angleOffset: this.angleOffset, dominantRange: dominantRange
      });
    }
  }
})(this);

/*
ideas:

cylinder going into distance, back to default
circles shooting off
make it much more modular
colors depend on which section (bass, mid, high) is dominating (red/black for bass, blue/green for mid, yellow/white for hi)
rays going off in all directions?
make average size of circle relate to volume
calculate average volume, bass direction off that
if volume goes a certain amount over average, shoot circles outwards
random single circles shooting outwards

*/

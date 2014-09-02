(function(root){
  var Visualizer = root.Visualizer = function(canvas){
    this.ctx = canvas.getContext("2d");
    buildObjects.call(this);
    this.baseAmp = 200;
    this.angleOffset = 0;
    this.ticker = 100;
    this.volumes = [];
    this.averageVolumes = [];
  }

  root.setupTimer = function setupTimer(tempo) {
    tempo = tempo / 120;
    this.tempoTimer = setInterval(function() {
      this.baseAmp = 50 + this.volume / 225;
      this.ticker++;
      if (this.volume > this.averageVolume * 1.2) {
        this.angleOffset -= .2;
      }
      else {
        this.angleOffset += .2;
      }
    }.bind(this), 10);
  }

  function VisualizerObject(options) {
    this.angle = 0;
    this.amplitude = 0;
    this.radius = options.radius;
    this.color = 'white';
  }

  VisualizerObject.prototype.draw = function(ctx, freqBin, options) {
    var x, y;

    var dominantRange = options.dominantRange;

    var color = options.color;
    var tilt = options.tilt;

    options.baseAmp *= .65;

    var mode;

    // if (options.ticker % 100 === 0) {
    //   $('#tick').text(options.ticker);
    // }

    if (options.ticker % 1000 === 0) {
      console.log(options.ticker)
    }

    // if (options.ticker >= 0 && options.ticker < 1100) {
    //   mode = "drum";
    // } else if (options.ticker >= 1100 && options.ticker < 1920) {
    //   mode = "globe";
    // } else if (options.ticker >= 1920 && options.ticker < 2200) {
    //   mode = "jellyfish";
    // } else if (options.ticker >= 2200 && options.ticker < 3700) {
    //   mode = "symmetry";
    // } else if (options.ticker >= 3700 && options.ticker < 4200) {
    //   mode = "jellyfish";
    // } else if (options.ticker >= 4200 && options.ticker < 7700) {
    //   mode = "symmetry";
    // }

    if (options.ticker >= 0 && options.ticker < 1200) {
      mode = "drum";
    } else if (options.ticker >= 1200 && options.ticker < 2020) {
      mode = "globe";
    } else if (options.ticker >= 2020 && options.ticker < 2300) {
      mode = "jellyfish";
    } else if (options.ticker >= 2300 && options.ticker < 3800) {
      mode = "symmetry";
    } else if (options.ticker >= 3800 && options.ticker < 4300) {
      mode = "jellyfish";
    } else if (options.ticker >= 4300 && options.ticker < 7800) {
      mode = "symmetry";
    }

    //5400 nifty breakdown in baby robot

    if (mode === "drum") {
      var centerOffset = 0;
      yInitO = 575 + centerOffset;
      yInitC = 575 + centerOffset;
      yInitCW = 575 + centerOffset;
      yInitOffset = 525;
    } else if (mode === "globe") {
      var centerOffset = -75;
      yInitO = 575 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 575;
    } else if (mode === "jellyfish") {
      var centerOffset = -50;
      yInitO = 575 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 575;
    } else if (mode === "symmetry") {
      tilt *= .8
      var centerOffset = 50;
      yInitO = 475 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 700;
    }

    var xInit = 400 + (options.baseAmp * Math.cos(this.angle));
    var yInit = yInitOffset + (options.baseAmp * Math.sin(this.angle));

    ctx.beginPath();

    if (options.drawStyle === "circle") {
      var yOffset = options.volume / 500,
          radiusOffset = Math.pow((yOffset / 32), 1.8);

      if (radiusOffset < 1) { radiusOffset = 1}

      x = 400 + (options.baseAmp + this.amplitude) * Math.cos(this.angle + options.angleOffset);
      y = yInitC - yOffset + (options.baseAmp + this.amplitude) * Math.sin(this.angle + options.angleOffset);

      ctx.fillStyle = color;
      ctx.arc(
        x,
        tilt * y,
        1 * this.radius * radiusOffset,
        0,
        2 * Math.PI,
        false
      );

      ctx.fill();
      ctx.closePath();
    } else if (options.drawStyle === "whiteCircle") {
        var yOffset = options.volume / 500,
            radiusOffset = Math.pow((yOffset / 32), 1.8);

        if (radiusOffset < 1) { radiusOffset = 1}

        x = 400 + (options.baseAmp + this.amplitude) * Math.cos(this.angle + options.angleOffset);
        y = yInitCW - yOffset + (options.baseAmp + this.amplitude) * Math.sin(this.angle + options.angleOffset);

        ctx.fillStyle = "rgba(255, 255, 255, .3)";
        ctx.arc(
          x,
          tilt * y,
          3 * this.radius * radiusOffset,
          0,
          2 * Math.PI,
          false
        );

        ctx.fill();
        ctx.closePath();
    } else if (options.drawStyle === "line") {
      x = 400 + 1 * ((options.baseAmp + this.amplitude) * Math.cos(this.angle));
      y = yInitO + 1 * ((options.baseAmp + this.amplitude) * Math.sin(this.angle));
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.moveTo(xInit, yInit);
      ctx.lineTo(x, y);

      ctx.stroke();
      ctx.closePath();
    } else if (options.drawStyle === "dotLine") {
      ctx.fillStyle = color;
      ctx.arc(
        xInit,
        (tilt + .075) * yInit,
        1.5 * this.radius,
        0,
        2 * Math.PI,
        false
      );

      ctx.fill();
      ctx.closePath();

      xInit = 400 + (options.baseAmp * Math.cos(this.angle + (2 * Math.PI) / 256));
      yInit = yInitO + (options.baseAmp * Math.sin(this.angle + (2 * Math.PI) / 256));

      ctx.arc(
        xInit,
        (tilt + .075) * yInit,
        .5 * this.radius,
        0,
        2 * Math.PI,
        false
      );

      ctx.fill();
      ctx.closePath();
    }
  }

  function buildObjects() {
    this.levelOneObjects = [];
    this.circles = [];

    for (var i = 0; i < 256; i++) {
      this.levelOneObjects.push(new VisualizerObject({ radius: 2 }));
      this.circles.push(new VisualizerObject({ radius: 2 }));
    }
  };

  function buildCircles() {
    circles = [];

    for (var i = 0; i < 256; i++) {
      circles.push(new VisualizerObject({ radius: 2 }));
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
  };

  function drawSquare(ctx, inset, color) {
    ctx.beginPath();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(inset, inset);
    ctx.lineTo(800 - inset, inset);
    ctx.lineTo(800 - inset, 800 - inset);
    ctx.lineTo(inset, 800 - inset);
    ctx.lineTo(inset, inset);

    ctx.stroke();
    ctx.closePath();
  }

  function average(array, options) {
    var sum = 0;

    array.forEach(function(el, index) {
      sum += el;
    });

    return sum / array.length;
  };

  Visualizer.prototype.calculateSubSpectrums = function(array) {
    this.bass = sumSection(array, { min: 0, max: 83 });
    this.lowMid = sumSection(array, { min: 84, max: 126 });
    this.highMid = sumSection(array, { min: 127, max: 167 });
    this.high = sumSection(array, { min: 168, max: 255 });
  }

  Visualizer.prototype.tick = function(array) {
    if (!this.songCounter) { this.songCounter = 0 }
    // this.tilt = .725 + Math.random() / 200;
    this.calculateSubSpectrums(array);

    var dominantRange;
    var bassDiff;
    var lowMidDiff;
    var highMidDiff;
    var highDiff;

    if (this.lastBass) {
      bassDiff = this.bass - this.lastBass;
      lowMidDiff = this.lowMid - this.lastLowMid;
      highMidDiff = this.highMid - this.lastHighMid;
      highDiff = this.high - this.lastHigh;
    } else {
      bassDiff = 5;
      lowMidDiff = 0;
      highMidDiff = 0;
      highDiff = 0;
    }

    var color, secondaryColor;

    if (!this.ticker || this.ticker % 1 === 0) {
      if (bassDiff > lowMidDiff && bassDiff > highDiff && bassDiff > highMidDiff) {
        dominantRange = "bass";
        color = "#D6000A";
        secondaryColor = "#FFA60D";
      } else if (lowMidDiff > bassDiff && lowMidDiff > highDiff && lowMidDiff > highMidDiff) {
        dominantRange = "lowMid";
        color = 'rgba(' + 0 + ', ' + 0 + ', ' + 255 + ', 1)';
        secondaryColor = "purple";
      } else if (highMidDiff > bassDiff && highMidDiff > highDiff && highMidDiff > lowMidDiff) {
        dominantRange = "highMid";
        color = "#13D120";
        secondaryColor = "#0015E8";
      } else if (highDiff > lowMidDiff && highDiff > bassDiff && highDiff > highMidDiff) {
        dominantRange = "high";
        color = 'rgba(' + 255 + ', ' + 255 + ', ' + 0 + ', 1)';
        secondaryColor = "#0DDDFF";
      }
    }

    var volume = sumSection(array, { min: 0, max: 255 });

    this.volume = volume;

    if (!this.averageVolume || this.ticker % 20 === 0) {
      if (this.averageVolumes.length > 50) { this.averageVolumes.shift() }
      this.averageVolumes.push(this.volume);
      this.averageVolume = average(this.averageVolumes);
    }

    if (!this.tilt || this.ticker % 3 === 0) { this.tilt = .625 + Math.random() / 50 }

    for (var i = 0; i < array.length; i++) {
      var value = array[i];
      var object = this.levelOneObjects[i];
      var circle = this.circles[i];

      object.angle = (256 - (i + .1 * Math.random())) / 256 * 2 * Math.PI - Math.PI / 2;
      object.amplitude = value / 2;

      if (i % 2 === 0) {
        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2.5 * this.baseAmp,
          angleOffset: 0,
          color: secondaryColor,
          tilt: this.tilt,
          ticker: this.songCounter
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2.6 * this.baseAmp,
          angleOffset: 0,
          color: color,
          tilt: this.tilt,
          ticker: this.songCounter
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2 * this.baseAmp,
          angleOffset: 0,
          color: secondaryColor,
          tilt: this.tilt,
          ticker: this.songCounter
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -1.6 * this.baseAmp,
          angleOffset: 0,
          color: color,
          tilt: this.tilt,
          ticker: this.songCounter
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -.9 * this.baseAmp,
          angleOffset: 0,
          color: secondaryColor,
          tilt: this.tilt,
          ticker: this.songCounter
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -.2 * this.baseAmp,
          angleOffset: 0,
          color: color,
          tilt: this.tilt,
          ticker: this.songCounter
        });
      } else {
        drawSquare(this.ctx, 1);

        if (this.volume > 25000) {
          if (this.volume > 26000) { drawSquare(this.ctx, 6, "#444") }
          if (this.volume > 27000) { drawSquare(this.ctx, 11, "#333") }
          if (this.volume > 28000) { drawSquare(this.ctx, 16, "#222") }
          if (this.volume > 29000) { drawSquare(this.ctx, 21, "#111") }
          if (this.volume > 30000) { drawSquare(this.ctx, 26, "#080808") }
        }
      }

      if (this.ticker % 35 === 0) {
        this.lastBass = this.bass;
        this.lastLowMid = this.lowMid;
        this.lastHighMid = this.highMid;
        this.lastHigh = this.high;
      }
    }
    for (var i = 0; i < array.length; i++) {
      var value = array[i];
      var object = this.levelOneObjects[i];
      var circle = this.circles[i];

      circle.angle = (256 - (i + .1 * Math.random())) / 256 * 2 * Math.PI + Math.PI / 2;

      circle.draw(this.ctx, i, {
        drawStyle: "whiteCircle",
        baseAmp: .3 * this.baseAmp,
        angleOffset: this.angleOffset,
        color: color,
        tilt: this.tilt,
        volume: this.volume,
        ticker: this.songCounter
      });

      circle.draw(this.ctx, i, {
        drawStyle: "whiteCircle",
        baseAmp: 1.55 * this.baseAmp,
        angleOffset: this.angleOffset,
        color: color,
        tilt: this.tilt,
        volume: this.volume,
        ticker: this.songCounter
      });

      circle.draw(this.ctx, i, {
        drawStyle: "whiteCircle",
        baseAmp: 3 * this.baseAmp,
        angleOffset: this.angleOffset,
        color: color,
        tilt: this.tilt,
        volume: this.volume,
        ticker: this.songCounter
      });

      circle.draw(this.ctx, i, {
        drawStyle: "circle",
        baseAmp: .3 * this.baseAmp,
        angleOffset: this.angleOffset,
        color: color,
        tilt: this.tilt,
        volume: this.volume,
        ticker: this.songCounter
      });

      circle.draw(this.ctx, i, {
        drawStyle: "circle",
        baseAmp: 1.55 * this.baseAmp,
        angleOffset: this.angleOffset,
        color: color,
        tilt: this.tilt,
        volume: this.volume,
        ticker: this.songCounter
      });

      circle.draw(this.ctx, i, {
        drawStyle: "circle",
        baseAmp: 3 * this.baseAmp,
        angleOffset: this.angleOffset,
        color: color,
        tilt: this.tilt,
        volume: this.volume,
        ticker: this.songCounter
      });
    }
    this.songCounter++;
  }
})(this);
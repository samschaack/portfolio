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

    var color = options.color;
    var tilt = options.tilt;

    options.baseAmp *= .65;

    //5400 nifty breakdown in baby robot

    if (mode === "drum") {
      var centerOffset = 0;
      yInitO = 575 + centerOffset;
      yInitC = 575 + centerOffset;
      yInitCW = 575 + centerOffset;
      yInitOffset = 525;
    } else if (mode === "globeWithCircles") {
      var centerOffset = -75;
      yInitO = 575 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 575;
    } else if (mode === "globe") {
      var centerOffset = -75;
      yInitO = 575 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 575;
      options.angleOffset = 0;
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
    } else if (mode === "supersym") {
      tilt *= .8
      var centerOffset = 50;
      yInitO = 475 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 700;
    }

    var xInit = 400 + (options.baseAmp * Math.cos(this.angle));
    var yInit = yInitOffset + (options.baseAmp * Math.sin(this.angle));

    if (!(options.drawStyle === "whiteCircle")) {
      ctx.beginPath();
    }

    if (options.drawStyle === "circle") {
      var yOffset = options.volume / 500,
          radiusOffset = Math.pow((yOffset / 32), (mode === "globe" || mode === "jellyfish" || mode === "supersym") ? 2.5 : 1.8);

      if (radiusOffset < 1) { radiusOffset = 1 }

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
          radiusOffset = Math.pow((yOffset / 32), (mode === "globe" || mode === "jellyfish" || mode === "supersym") ? 1.875 : 1.8);

      if (radiusOffset < 1) { radiusOffset = 1 }

      x = 400 + (options.baseAmp + this.amplitude) * Math.cos(this.angle + options.angleOffset);
      y = yInitCW - yOffset + (options.baseAmp + this.amplitude) * Math.sin(this.angle + options.angleOffset);

      ctx.fillStyle = "rgba(255, 255, 255, " + (options.innerCircle ? .1 : .3) + ")";
      ctx.arc(
        x,
        tilt * y,
        3 * this.radius * radiusOffset,
        0,
        2 * Math.PI,
        false
      );

      // if (options.innerCircle) { ctx.fill() }
      // ctx.closePath();
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
      var yOffset = options.volume / 500,
          radiusOffset = Math.pow((yOffset / 32), (mode === "symmetry" || mode === "supersym") ? 1.15 : 1.01);

      if (radiusOffset < 1) { radiusOffset = 1 }

      ctx.fillStyle = color;
      ctx.arc(
        xInit,
        (tilt + .075) * yInit,
        1.5 * this.radius * radiusOffset,
        0,
        2 * Math.PI,
        false
      );

      // ctx.fill();

      xInit = 400 + (options.baseAmp * Math.cos(this.angle + (2 * Math.PI) / 256));
      yInit = yInitO + (options.baseAmp * Math.sin(this.angle + (2 * Math.PI) / 256));

      ctx.arc(
        xInit,
        (tilt + .075) * yInit,
        .5 * this.radius * radiusOffset,
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

    $('#tick').text(this.songCounter);

    if (!timeBase) { var timeBase = 423 }

    if (this.songCounter >= 0 && this.songCounter < timeBase * 4.86) {
      mode = "drum";
    } else if (this.songCounter >= timeBase * 4.86 && this.songCounter < timeBase * 6.593) {
      mode = "globeWithCircles";
    } else if (this.songCounter >= timeBase * 6.593 && this.songCounter < timeBase * 9.86) {
      mode = "globe";
    } else if (this.songCounter >= timeBase * 9.86 && this.songCounter < timeBase * 9.86) {
      mode = "jellyfish";
    } else if (this.songCounter >= timeBase * 50.86 && this.songCounter < timeBase * 50.76) {
      mode = "symmetry";
    } else if (this.songCounter >= timeBase * 50.76 && this.songCounter < timeBase * 50.550) {
      mode = "supersym";
    } else if (this.songCounter >= timeBase * 50.550 && this.songCounter < timeBase * 50.333) {
      mode = "drum";
    } else if (this.songCounter >= timeBase * 50.333 && this.songCounter < timeBase * 501) {
      mode = "jellyfish";
    } else if (this.songCounter >= timeBase * 501 && this.songCounter < timeBase * 505) {
      mode = "symmetry";
    } else {
      mode = "supersym";
    }
    // mode = "symmetry"

    this.calculateSubSpectrums(array);

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
        color = "#D6000A";
        secondaryColor = "#FFA60D";
      } else if (lowMidDiff > bassDiff && lowMidDiff > highDiff && lowMidDiff > highMidDiff) {
        color = 'rgba(' + 0 + ', ' + 0 + ', ' + 255 + ', 1)';
        secondaryColor = "purple";
      } else if (highMidDiff > bassDiff && highMidDiff > highDiff && highMidDiff > lowMidDiff) {
        color = "#13D120";
        secondaryColor = "#0015E8";
      } else if (highDiff > lowMidDiff && highDiff > bassDiff && highDiff > highMidDiff) {
        color = 'rgba(' + 255 + ', ' + 255 + ', ' + 0 + ', 1)';
        secondaryColor = "#0DDDFF";
      }
    }

    this.volume = sumSection(array, { min: 0, max: 255 });

    if (!this.averageVolume || this.ticker % 60 === 0) { //20
      if (this.averageVolumes.length > 50) { this.averageVolumes.shift() }
      this.averageVolumes.push(this.volume);
      this.averageVolume = average(this.averageVolumes);
    }

    if (!this.tilt || this.ticker % 3 === 0) { this.tilt = .625 + Math.random() / 50 }

    drawSquare(this.ctx, 1, Math.random() < .5 ? color : secondaryColor);

    if (this.volume > 25000) {
      if (this.volume > 26000) { drawSquare(this.ctx, 6, "#444") }
      if (this.volume > 27000) { drawSquare(this.ctx, 11, "#333") }
      if (this.volume > 28000) { drawSquare(this.ctx, 16, "#222") }
      if (this.volume > 29000) { drawSquare(this.ctx, 21, "#111") }
      if (this.volume > 30000) { drawSquare(this.ctx, 26, "#080808") }
    }

    for (var i = 0; i < array.length; i++) {
      var value = array[i];
      var object = this.levelOneObjects[i];
      var circle = this.circles[i];

      object.angle = (256 - (i + .1 * Math.random())) / 256 * 2 * Math.PI - Math.PI / 2;
      object.amplitude = value / 2;

      // this.ctx.beginPath();

      if (i % 2 === 0) {
        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2.5 * this.baseAmp,
          angleOffset: 0,
          color: secondaryColor,
          tilt: this.tilt,
          volume: this.volume
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2.6 * this.baseAmp,
          angleOffset: 0,
          color: color,
          tilt: this.tilt,
          volume: this.volume
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2 * this.baseAmp,
          angleOffset: 0,
          color: secondaryColor,
          tilt: this.tilt,
          volume: this.volume
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -1.6 * this.baseAmp,
          angleOffset: 0,
          color: color,
          tilt: this.tilt,
          volume: this.volume
        });

        if (i % 4 === 0) {
          object.draw(this.ctx, i, {
            drawStyle: "dotLine",
            baseAmp: -.9 * this.baseAmp,
            angleOffset: 0,
            color: secondaryColor,
            tilt: this.tilt,
            volume: this.volume
          });

          if (mode !== "symmetry" && mode !== "supersym" && mode !== "globe") {
            object.draw(this.ctx, i, {
              drawStyle: "dotLine",
              baseAmp: -.2 * this.baseAmp,
              angleOffset: 0,
              color: color,
              tilt: this.tilt,
              volume: this.volume
            });
          }
        }
      }
      // this.ctx.fill();
      // this.ctx.closePath();
    }

    for (var i = 0; i < array.length; i++) {
      if (i % 2 === 0) {
        var circle = this.circles[i];

        circle.angle = (256 - (i + .1 * Math.random())) / 256 * 2 * Math.PI + Math.PI / 2;

        this.ctx.beginPath();

        if (i % 8 === 0 || (i % 4 && mode === "symmetry" || mode === "supersym")) {
          circle.draw(this.ctx, i, {
            drawStyle: "whiteCircle",
            baseAmp: .3 * this.baseAmp,
            angleOffset: this.angleOffset,
            color: color,
            tilt: this.tilt,
            volume: this.volume,
            innerCircle: true
          });
        }

        circle.draw(this.ctx, i, {
          drawStyle: "whiteCircle",
          baseAmp: 1.55 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: this.volume
        });

        circle.draw(this.ctx, i, {
          drawStyle: "whiteCircle",
          baseAmp: 3 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: this.volume
        });

        this.ctx.fill();
        this.ctx.closePath();
      }

      if (i % 8 === 0 || mode === "symmetry" || mode === "supersym") {
        circle.draw(this.ctx, i, {
          drawStyle: "circle",
          baseAmp: .3 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: this.volume
        });
      }

      if (i % 2 === 0 || mode === "symmetry" || mode === "supersym") {
        if (mode === "symmetry" || mode === "supersym") { this.angleOffset += 2 / 3 * Math.PI }
        circle.draw(this.ctx, i, {
          drawStyle: "circle",
          baseAmp: 1.55 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: this.volume
        });

        if (mode === "symmetry" || mode === "supersym") { this.angleOffset += 2 / 3 * Math.PI }

        circle.draw(this.ctx, i, {
          drawStyle: "circle",
          baseAmp: 3 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: this.volume
        });
      }
    }
// 35
    if (this.ticker % 100 === 0) {
      this.lastBass = this.bass;
      this.lastLowMid = this.lowMid;
      this.lastHighMid = this.highMid;
      this.lastHigh = this.high;
    }

    this.songCounter++;
  }
})(this);
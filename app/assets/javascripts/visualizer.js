(function(root){
  root.Visualizer = function(canvas) {
    this.ctx = canvas.getContext("2d");
    buildObjects.call(this);
    this.baseAmp = 100;
    this.angleOffset = 0;
    this.volumes = [];
    this.transientBlur = 10;
    spinSpeed = .3;
    this.averageVolumes = [];
    this.bassVals = [];
    this.lowMidVals = [];
    this.highMidVals = [];
    this.highVals = [];
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

    if (mode === "drum") {
      var centerOffset = 0;
      yInitO = 575 + centerOffset;
      yInitC = 575 + centerOffset;
      yInitCW = 575 + centerOffset;
      yInitOffset = 525;
      spinSpeed = .3;
    } else if (mode === "globeWithCircles") {
      var centerOffset = -75;
      yInitO = 575 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 575;
      spinSpeed = .2;
    } else if (mode === "globe") {
      var centerOffset = -75;
      yInitO = 575 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 575;
      spinSpeed = .05;
    } else if (mode === "jellyfish") {
      var centerOffset = -50;
      yInitO = 575 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 575;
      spinSpeed = .2;
    } else if (mode === "symmetry") {
      tilt *= .8
      var centerOffset = 50;
      yInitO = 475 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 700;
      spinSpeed = .4;
    } else if (mode === "supersym") {
      tilt *= .8
      var centerOffset = 50;
      yInitO = 475 + centerOffset;
      yInitC = 700 + centerOffset;
      yInitCW = 700 + centerOffset;
      yInitOffset = 700;
      spinSpeed = .6;
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

      if (mode !== "globe") {
        xInit = 400 + (options.baseAmp * Math.cos(this.angle + (2 * Math.PI) / 256));
        yInit = yInitO + (options.baseAmp * Math.sin(this.angle + (2 * Math.PI) / 256));

        ctx.arc(
          xInit,
          (tilt + .075) * yInit,
          .65 * this.radius * radiusOffset,
          0,
          2 * Math.PI,
          false
        );
      }

      ctx.fill();
      ctx.closePath();
    }
  }

  Visualizer.prototype.tick = function(array) {
    if (!this.songCounter) { this.songCounter = 0 }

    $('#tick').text(this.songCounter);

    this.getMode();

    this.calculateSubSpectrums(array);

    this.calculateSubSpectrumAverages();

    var bassDiff,
        lowMidDiff,
        highMidDiff,
        highDiff;

    bassDiff = (this.recentAverageBass - this.averageBass) / this.averageBass;
    lowMidDiff = (this.recentAverageLowMid - this.averageLowMid) / this.averageLowMid;
    highMidDiff = (this.recentAverageHighMid - this.averageHighMid) / this.averageHighMid;
    highDiff = (this.recentAverageHigh - this.averageHigh) / this.averageHigh;

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
    } else {
      color = "#D6000A";
      secondaryColor = "#FFA60D";
    }

    var recentAverageVolume,
        volume = sumSection(array, { min: 0, max: 255 });

    if (this.averageVolumes.length >= 5) {
      recentAverageVolume = sumSection(this.averageVolumes, this.averageVolumes.length - 5, this.averageVolumes) / 5;
    } else {
      recentAverageVolume = volume;
    }

    if (this.songCounter === 0) { this.lastVolume = volume }
    this.volume = volume;

    if (Math.abs(volume - this.lastVolume) < this.transientBlur) {
      volume = this.lastVolume;
    } else {
      volume = recentAverageVolume;
    }

    this.baseAmp = 47 + Math.pow(volume / 225, 1.005);

    if (!this.averageVolume || this.ticker % 60 === 0) {
      if (this.averageVolumes.length > 50) { this.averageVolumes.shift() }
      this.averageVolumes.push(this.volume);
      this.averageVolume = average(this.averageVolumes);
    }

    if (this.volume > this.averageVolume * 1.3) {
        this.angleOffset -= spinSpeed;
      }
    else {
        this.angleOffset += spinSpeed;
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

      if (i % 2 === 0) {
        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2.5 * this.baseAmp,
          angleOffset: 0,
          color: secondaryColor,
          tilt: this.tilt,
          volume: volume
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2.6 * this.baseAmp,
          angleOffset: 0,
          color: color,
          tilt: this.tilt,
          volume: volume
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -2 * this.baseAmp,
          angleOffset: 0,
          color: secondaryColor,
          tilt: this.tilt,
          volume: volume
        });

        object.draw(this.ctx, i, {
          drawStyle: "dotLine",
          baseAmp: -1.6 * this.baseAmp,
          angleOffset: 0,
          color: color,
          tilt: this.tilt,
          volume: volume
        });

        if (i % 4 === 0) {
          object.draw(this.ctx, i, {
            drawStyle: "dotLine",
            baseAmp: -.9 * this.baseAmp,
            angleOffset: 0,
            color: secondaryColor,
            tilt: this.tilt,
            volume: volume
          });

          if (mode !== "symmetry" && mode !== "supersym") {
            if (mode !== "drum") {
                object.draw(this.ctx, i, {
                drawStyle: "dotLine",
                baseAmp: -.5 * this.baseAmp,
                angleOffset: 0,
                color: color,
                tilt: this.tilt,
                volume: volume
              });

              if (i % 8 === 0) {
                object.draw(this.ctx, i, {
                  drawStyle: "dotLine",
                  baseAmp: -.1 * this.baseAmp,
                  angleOffset: 0,
                  color: color,
                  tilt: this.tilt,
                  volume: volume
                });
              }
            } else {
              object.draw(this.ctx, i, {
                drawStyle: "dotLine",
                baseAmp: -.3 * this.baseAmp,
                angleOffset: 0,
                color: color,
                tilt: this.tilt,
                volume: volume
              });
            }
          }
        }
      }
    }

    for (var i = 0; i < array.length; i++) {
      var circle = this.circles[i];

      circle.angle = (256 - (i + .1 * Math.random())) / 256 * 2 * Math.PI + Math.PI / 2;

      this.ctx.beginPath();

      if (i % 2 === 0) {
        if (i % 8 === 0 || (i % 4 && (mode === "symmetry" || mode === "supersym"))) {
          circle.draw(this.ctx, i, {
            drawStyle: "whiteCircle",
            baseAmp: .3 * this.baseAmp,
            angleOffset: this.angleOffset,
            color: color,
            tilt: this.tilt,
            volume: volume,
            innerCircle: true
          });
        }

        circle.draw(this.ctx, i, {
          drawStyle: "whiteCircle",
          baseAmp: 1.55 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: volume
        });
      }

      circle.draw(this.ctx, i, {
        drawStyle: "whiteCircle",
        baseAmp: 3 * this.baseAmp,
        angleOffset: this.angleOffset,
        color: color,
        tilt: this.tilt,
        volume: volume
      });

      this.ctx.fill();
      this.ctx.closePath();

      if (i % 8 === 0 || mode === "symmetry" || mode === "supersym") {
        circle.draw(this.ctx, i, {
          drawStyle: "circle",
          baseAmp: .3 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: volume
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
          volume: volume
        });

        if (mode === "symmetry" || mode === "supersym") { this.angleOffset += 2 / 3 * Math.PI }

        circle.draw(this.ctx, i, {
          drawStyle: "circle",
          baseAmp: 3 * this.baseAmp,
          angleOffset: this.angleOffset,
          color: color,
          tilt: this.tilt,
          volume: volume
        });
      }
    }

    if (Math.abs(this.volume - this.lastVolume) > this.transientBlur) {
      this.lastVolume = this.volume;
    }

    this.songCounter++;
  }

  Visualizer.prototype.calculateSubSpectrums = function(array) {
    this.bass = sumSection(array, { min: 0, max: 83 });
    this.lowMid = sumSection(array, { min: 84, max: 126 });
    this.highMid = sumSection(array, { min: 127, max: 167 });
    this.high = sumSection(array, { min: 168, max: 255 });
  }

  Visualizer.prototype.calculateSubSpectrumAverages = function() {
    if (this.bassVals.length > 50) { this.bassVals.shift() }
    this.bassVals.push(this.bass);
    this.averageBass = average(this.bassVals);
    this.recentAverageBass = sumSection(this.bassVals, { min: this.bassVals.length - 5, max: this.bassVals.length });

    if (this.lowMidVals.length > 50) { this.lowMidVals.shift() }
    this.lowMidVals.push(this.lowMid);
    this.averageLowMid = average(this.lowMidVals);
    this.recentAverageLowMid = sumSection(this.lowMidVals, { min: this.lowMidVals.length - 5, max: this.lowMidVals.length });

    if (this.highMidVals.length > 50) { this.highMidVals.shift() }
    this.highMidVals.push(this.highMid);
    this.averageHighMid = average(this.highMidVals);
    this.recentAverageHighMid = sumSection(this.highMidVals, { min: this.highMidVals.length - 5, max: this.highMidVals.length });

    if (this.highVals.length > 50) { this.highVals.shift() }
    this.highVals.push(this.high);
    this.averageHigh = average(this.highVals);
    this.recentAverageHigh = sumSection(this.highVals, { min: this.highVals.length - 5, max: this.highVals.length });
  }

  Visualizer.prototype.getMode = function() {
    if (!timingCalibrator) { var timingCalibrator = 398 }

    if (this.songCounter >= 0 && this.songCounter < timingCalibrator * 4.95) {
      mode = "drum";
    } else if (this.songCounter >= timingCalibrator * 4.95 && this.songCounter < timingCalibrator * 5.805) {
      mode = "globeWithCircles";
    } else if (this.songCounter >= timingCalibrator * 5.805 && this.songCounter < timingCalibrator * 8.57) {
      mode = "globe";
    } else if (this.songCounter >= timingCalibrator * 8.57 && this.songCounter < timingCalibrator * 10.1) {
      mode = "jellyfish";
    } else if (this.songCounter >= timingCalibrator * 10.1 && this.songCounter < timingCalibrator * 12.15) {
      mode = "symmetry";
    } else if (this.songCounter >= timingCalibrator * 12.15 && this.songCounter < timingCalibrator * 50.550) {
      mode = "supersym";
    } else if (this.songCounter >= timingCalibrator * 50.550 && this.songCounter < timingCalibrator * 50.333) {
      mode = "drum";
    } else if (this.songCounter >= timingCalibrator * 50.333 && this.songCounter < timingCalibrator * 501) {
      mode = "jellyfish";
    } else if (this.songCounter >= timingCalibrator * 501 && this.songCounter < timingCalibrator * 505) {
      mode = "symmetry";
    } else {
      mode = "supersym";
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
})(this);
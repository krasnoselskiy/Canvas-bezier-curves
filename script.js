const config = {
  waveSpeed: 1,
  wavesToBlend: 4,
  curvesNum: 50,
  framesToMove: 120,
}

class waveNoise {
  constructor() {
    this.waveSet = [];
  }

  addWaves(requiredWaves) {
    for (let i = 0; i < requiredWaves; ++i) {
      const randomAngle = Math.random() * 360;
      this.waveSet.push(randomAngle);
    }
  }

  getWave() {
    let blendedWave = 0;
    for (let wave of this.waveSet) {
      blendedWave += Math.sin(wave / 180 * Math.PI);
    }

    return (blendedWave / this.waveSet.length + 1) / 2;
  }

  update() {
    this.waveSet.forEach((e, i) => {
      let rand = Math.random() * (i + 1) * config.waveSpeed;
      this.waveSet[i] = (e + rand) % 360;
    });
  }
}

class Animation { 
  constructor() {
    this.cnv = null;
    this.ctx = null;
    this.size = {
      w: 0,
      h: 0,
      cx: 0,
      cy: 0,
    };
    this.controls = [];
    this.controlsNum = 3;
    this.framesCounter = 0;
    this.typeForStart = 0;
    this.typeForEnd = 0;
  };

  init() {
    this.createCanvas();
    this.createControls();
    this.updateAnimation();
  };

  createCanvas() {
    this.cnv = document.createElement(`canvas`);
    this.ctx = this.cnv.getContext(`2d`);
    this.setCanvasSize();
    document.body.appendChild(this.cnv);
    window.addEventListener(`resize`, () => this.canvasResize());
  };

  createControls() {
    for (let i = 0; i < this.controlsNum + config.curvesNum; ++i) {
      let control = new waveNoise();
      control.addWaves(config.wavesToBlend);
      this.controls.push(control);
    }
  }

  setCanvasSize() {
    this.size.w = this.cnv.width = window.innerWidth;
    this.size.h = this.cnv.height = window.innerHeight;
    this.size.cx = this.size.w / 2;
    this.size.cy = this.size.h / 2;
  }

  canvasResize() {
    this.setCanvasSize();
    this.updateAnimation();
  }

  updateCurves() {
    let c = this.controls;
    let _controlX1 = c[0].getWave() * this.size.w;
    let _controlY1 = c[1].getWave() * this.size.h;
    let _controlX2 = c[2].getWave() * this.size.w;

    for (let i = 0; i < config.curvesNum; i++) {
      let _controlY2 = c[3 + i].getWave();

      let curveParam = {
        startX: 0,
        startY: this.getYPlacementType(this.typeForStart, i),
        controlX1: _controlX1,
        controlY1: _controlY1,
        controlX2: _controlX2,
        controlY2: _controlY2 * this.size.h,
        endX: this.size.w,
        endY: this.size.h,
        alpha: _controlY2,
        hue: 360 / config.curvesNum * i,
      }
  
      this.drawCurve(curveParam);
    }
  }

  drawCurve(
    { startX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY, alpha, hue, }
  ) {
    this.ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
    this.ctx.stroke();
  }

  updateCanvas() {
    this.ctx.fillRect(0, 0, this.size.w, this.size.h);
  }

  updateControls() {
    this.controls.forEach(e => e.update())
  }

  getYPlacementType(type, i) {
    if (type > .6) {
      return this.size.h / config.curvesNum * i;
    } else if ( type > .4) {
      return this.size.h;
    } else if ( type > .2) {
      return this.size.cy;
    } else {
      return 0;
    }
  }

  updateFrameCounter() {
    this.framesCounter = (this.framesCounter + 1) % config.framesToMove;

    if (this.framesCounter === 0) {
      this.typeForStart = Math.random();
      this.typeForEnd = Math.random();
    }
  }

  updateAnimation() {
    this.updateCanvas();
    // this.updateFrameCounter();
    this.updateCurves();
    this.updateControls();
    window.requestAnimationFrame(() => this.updateAnimation());
  }
}

window.onload = () => { new Animation().init() };


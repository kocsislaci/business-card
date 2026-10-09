// Runtime quality controller for the N-body sampling stride.
//
// The star-star pass costs starCount^2 / stride per frame, which is far too
// much for a phone GPU at stride 1 (and on iOS a frame that runs too long can
// lose the WebGL context outright). So every device starts at a cheap stride
// and only steps down while the measured frame time shows headroom:
//
//   - frames are averaged in windows of adaptiveWindowFrames;
//   - a window is "good" when the average is under adaptiveTargetMs and no
//     frame exceeded adaptiveSpikeMs; adaptiveGoodWindows good windows in a row
//     halve the stride;
//   - a window whose average is over adaptiveLimitMs (or that contained a
//     spike) doubles the stride immediately;
//   - stepping down is only allowed during the first adaptiveSettleSeconds, so
//     the controller can't oscillate forever; stepping up stays enabled because
//     phones thermally throttle a minute or two in.
//
// There is no GPU timer on iOS, but requestAnimationFrame waits on the GPU, so
// the frame delta is a usable (if coarse) proxy.
export class AdaptiveQuality {
  constructor(config) {
    this.config = config;
    this.stride = config.sampleStrideInitial;
    this.elapsed = 0;
    this.frames = 0;
    this.sum = 0;
    this.max = 0;
    this.goodWindows = 0;
  }

  // Feeds one frame's raw delta (seconds, unclamped) and returns the stride to
  // use for this frame.
  update(deltaTime) {
    const c = this.config;
    const ms = deltaTime * 1000;

    // First frame has no delta; nothing to measure yet.
    if (ms <= 0) return this.stride;

    this.elapsed += deltaTime;
    this.frames++;
    this.sum += ms;
    this.max = Math.max(this.max, ms);

    if (this.frames < c.adaptiveWindowFrames) return this.stride;

    const avg = this.sum / this.frames;
    const spiked = this.max > c.adaptiveSpikeMs;
    this.frames = 0;
    this.sum = 0;
    this.max = 0;

    if (avg > c.adaptiveLimitMs || spiked) {
      this.goodWindows = 0;
      this.stride = Math.min(this.stride * 2, c.sampleStrideMax);
    } else if (avg < c.adaptiveTargetMs && this.elapsed < c.adaptiveSettleSeconds) {
      this.goodWindows++;
      if (this.goodWindows >= c.adaptiveGoodWindows) {
        this.goodWindows = 0;
        this.stride = Math.max(this.stride / 2, c.sampleStrideMin);
      }
    } else {
      this.goodWindows = 0;
    }

    return this.stride;
  }
}

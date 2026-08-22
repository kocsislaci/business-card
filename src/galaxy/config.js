// ---------------------------------------------------------------------------
// Galaxy simulation parameters.
//
// This is the single place to tune the look and physics of the scene. Every
// value here is fed straight into the GPU simulation / renderer each frame, so
// changing a number and reloading is enough to see the effect.
// ---------------------------------------------------------------------------

export const config = {
  // -- Simulation grid ------------------------------------------------------
  // Stars are stored in a texSize x texSize float texture, so the total star
  // count is texSize * texSize. 128 -> 16,384 stars. Raise for density, but
  // remember the mutual N-body pass is O(starCount^2) on the GPU.
  texSize: 128,

  // -- Physics --------------------------------------------------------------
  // The galactic core is a harmonic potential (uniform-density halo): inward
  // pull grows with radius, a = coreStrength * r. This is the one field in which
  // "speed proportional to radius" is a stable circular orbit, so the disk
  // rotates rigidly without winding up or flying apart.
  // Keep it balanced: coreStrength = angularVelocity^2  (here 1.1^2 = 1.21).
  coreStrength: 1.21,        // strength of the harmonic core pull (= angularVelocity^2)
  G: 0.001,                  // gravitational constant for the star-star (mutual) force
  starMass: 1.0,            // per-star mass used for the mutual N-body force
  starStarStrength: 0.002,   // multiplier on star-star force (keep it small)
  softening: 0.25,          // softening length for star-star (avoids blow-ups)
  damping: 0.0,             // velocity damping per second (0 = energy conserving)
  timeScale: 0.01,           // global time multiplier
  maxDeltaTime: 0.033,      // clamp dt (seconds) so a lag spike can't explode the sim

  // -- Initial star disk ----------------------------------------------------
  diskRadius: 6.0,          // outer radius of the initial disk
  innerRadius: 0.4,         // empty hole around the core
  diskThickness: 0.25,      // vertical (z) gaussian spread of the disk
  angularVelocity: 1.1,     // angular speed (rad/time); star speed = angularVelocity * radius,
                            //   so the disk rotates rigidly and the arms don't wind up
  diskDispersion: 0.05,     // random ("Brownian") velocity spread in the disk

  // -- Central bulge (dense, churning core) --------------------------------
  bulgeFraction: 0.4,       // fraction of all stars packed into the central bulge
  bulgeRadius: 1.3,         // characteristic radius of the bulge blob
  bulgeConcentration: 2.0,  // higher = stars cram more tightly toward the very center
  bulgeDispersion: 0.5,     // random velocity spread in the bulge -> visible churn

  // -- Spiral arms (initial structure) -------------------------------------
  numArms: 5,               // number of spiral arms
  armWinding: 0.7,          // radians the arm rotates per unit radius (tightness)
  armSpread: 0.18,          // lateral scatter off the arm centerline (x radius)
  armSpreadPower: 2.5,      // higher = stars hug the arm centerline more tightly

  // -- Star rendering -------------------------------------------------------
  pointSize: 140.0,         // base point size, divided by clip-space depth
  minPointSize: 1.0,
  maxPointSize: 6.0,
  brightness: 0.4,          // overall star emission (subtle backdrop -> keep low)
  sizeVariation: 0.9,       // 0..1 random per-star spread in size (breaks uniformity)
  brightnessVariation: 0.6, // 0..1 random per-star spread in brightness (twinkle)
  // Color ramps by galactocentric radius: warm, dusty core -> cool outer disk.
  bulgeColor: [1.0, 0.5, 0.2],   // warm amber/brown dense center
  diskColor: [0.55, 0.7, 1.0],   // cool blue-white outer disk
  colorRadius: 5.0,         // radius over which the color blends bulge -> disk

  // -- Camera ---------------------------------------------------------------
  cameraDistance: 12.0,     // distance from the galactic core
  cameraTilt: -55.0,         // degrees off face-on (0 = straight down on the disk,
                            //   90 = edge-on). ~45-65 gives a "looking down at it" angle.

  // -- Background (procedural deep field) ----------------------------------
  // A skybox drawn behind the galaxy: a world-space ray is reconstructed per
  // pixel (so it parallaxes with the camera), then layered with distant stars,
  // faint galaxies, nebula clouds and low-level background mottling.
  backgroundColor: [0.008, 0.011, 0.022], // deep-space base tint
  nebulaColorA: [0.12, 0.05, 0.20],       // nebula tint A (magenta/violet)
  nebulaColorB: [0.02, 0.10, 0.16],       // nebula tint B (teal)
  nebulaIntensity: 0.5,                   // overall nebula/galaxy brightness
  nebulaScale: 2.2,                       // noise frequency of the clouds (higher = finer)
  starBrightness: 0.7,                    // brightness of the distant background stars
  starDensity: 0.5,                       // 0..1, how many distant stars fill the sky
  vignette: 0.45,                         // edge darkening (0 = off, 1 = strong)

  // -- Post-processing (subtle bloom) --------------------------------------
  bloomThreshold: 0.12,     // luminance above which a pixel blooms
  bloomIntensity: 0.7,      // how much bloom is added back on top of the scene
  bloomRadius: 1.0,         // blur step size in bloom-buffer texels
  exposure: 1.0,            // overall exposure before tone mapping
};

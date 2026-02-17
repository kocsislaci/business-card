export const handShakeEffect = {
  apply(state, deltaTime, effectState, config) {
    if (!effectState.time) {
      effectState.time = 0;
    }
    effectState.time += deltaTime;
    
    const intensity = config.intensity;
    const frequency = config.frequency;
    const velocityScale = config.velocityScale;
    const minVelocity = config.minVelocity;
    
    const speed = Math.sqrt(
      state.velocity.x ** 2 + state.velocity.y ** 2
    );
    
    const velocityFactor = Math.max(0, (speed - minVelocity) * velocityScale);
    const amplitude = intensity * (1 + velocityFactor);
    
    const t = effectState.time * frequency * Math.PI * 2;
    const shake = {
      x: amplitude * Math.sin(t) * Math.cos(t * 0.75),
      y: amplitude * Math.cos(t) * Math.sin(t * 1.25)
    };
    
    return {
      position: {
        x: state.position.x + shake.x,
        y: state.position.y + shake.y
      },
      velocity: state.velocity
    };
  }
};

export const idleHandEffect = {
  apply(state, deltaTime, effectState, config) {
    if (!effectState.time) {
      effectState.time = 0;
    }
    effectState.time += deltaTime;
    
    const intensity = config.intensity;
    const frequency = config.frequency;
    const maxVelocity = config.maxVelocity;
    
    const speed = Math.sqrt(
      state.velocity.x ** 2 + state.velocity.y ** 2
    );
    
    const idleFactor = Math.max(0, 1 - (speed / maxVelocity));
    const amplitude = intensity * idleFactor;
    
    const t = effectState.time * frequency * Math.PI * 2;
    const drift = {
      x: amplitude * (Math.sin(t) * 0.6 + Math.sin(t * 1.3) * 0.4),
      y: amplitude * (Math.cos(t * 0.7) * 0.6 + Math.cos(t * 1.7) * 0.4)
    };
    
    return {
      position: {
        x: state.position.x + drift.x,
        y: state.position.y + drift.y
      },
      velocity: state.velocity
    };
  }
};

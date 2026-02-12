export const lerpStrategy = {
  update(current, target, deltaTime, config, velocity) {
    const damping = config.damping;
    const blend = 1.0 - Math.exp(-damping * deltaTime);
    
    return {
      position: {
        x: current.x + (target.x - current.x) * blend,
        y: current.y + (target.y - current.y) * blend
      },
      velocity
    };
  }
};

export const springStrategy = {
  update(current, target, deltaTime, config, velocity) {
  const stiffness = config.stiffness;
    const damping = config.damping;
    
    const forceX = -stiffness * (current.x - target.x) - damping * velocity.x;
    const forceY = -stiffness * (current.y - target.y) - damping * velocity.y;
    
    const newVelocity = {
      x: velocity.x + forceX * deltaTime,
      y: velocity.y + forceY * deltaTime
    };
    
    const newPosition = {
      x: current.x + newVelocity.x * deltaTime,
      y: current.y + newVelocity.y * deltaTime
    };
    
    return {
      position: newPosition,
      velocity: newVelocity
    };
  }
};

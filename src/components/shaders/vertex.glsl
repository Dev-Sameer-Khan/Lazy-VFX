    varying vec2 vUv;
    varying vec3 vColor;
    varying vec3 vColorEnd;
    varying float vProgress;

    uniform float uTime;
    uniform vec2 uFadeSize;
    uniform vec3 uGravity;

    attribute vec3 instanceColor;
    attribute vec3 instanceColorEnd;
    attribute vec3 instanceDirection;
    attribute vec2 instanceLifetime;
    attribute float instanceSpeed;
    attribute vec3 instanceRotationSpeed;

    mat4 rotationX(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat4(
          1,  0,  0,  0,
          0,  c, -s,  0,
          0,  s,  c,  0,
          0,  0,  0,  1
      );
    }
    
    mat4 rotationY(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat4(
           c,  0,  s,  0,
           0,  1,  0,  0,
          -s,  0,  c,  0,
           0,  0,  0,  1
      );
    }
    
    mat4 rotationZ(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat4(
          c, -s,  0,  0,
          s,  c,  0,  0,
          0,  0,  1,  0,
          0,  0,  0,  1
      );
    }
    
    vec3 billboard(vec2 v, mat4 view) {
      vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
      vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
      vec3 p = right * v.x + up * v.y;
      return p;
    }
    

    void main() {
      float startTime = instanceLifetime.x;
      float duration = instanceLifetime.y;
      float age = uTime - startTime;
      vProgress = age / duration;

      if (vProgress < 0.0 || vProgress > 1.0) {
        gl_Position = vec4(vec3(999.9), 1.0);
        return;
      }

      float scale = smoothstep(0.0, uFadeSize.x, vProgress) * smoothstep(1.01, uFadeSize.y, vProgress);
        vec3 gravity = 0.5 * uGravity * (age * age);

      vec3 normalizedDirection = length(instanceDirection) > 0.0 ? normalize(instanceDirection) : vec3(0.0);
      vec3 offset = normalizedDirection * age * instanceSpeed;
      offset += gravity;

      vec3 rotationSpeed = instanceRotationSpeed * age;
      mat4 rotY = rotationY(rotationSpeed.y);
      mat4 rotX = rotationX(rotationSpeed.x);
      mat4 rotZ = rotationZ(rotationSpeed.z);
      mat4 rotationMatrix = rotZ * rotX * rotX;

      vec4 mvPosition;
      #ifdef MESH_MODE
        vec4 startPosition = modelMatrix * instanceMatrix * rotationMatrix * vec4(position * scale , 1.0);
    
        vec3 instancePosition = startPosition.xyz;
    
        vec3 finalPosition = instancePosition + offset;
        mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
      #endif

      #ifdef BILLBOARD_MODE
       vec4 localPos = vec4(position, 1.0);
      localPos.xyz = billboard(position.xy, viewMatrix) * scale;

        vec4 worldPos = modelMatrix * instanceMatrix * rotationMatrix * localPos;
        worldPos.xyz += offset; 
        mvPosition = modelViewMatrix * worldPos;
      #endif
    
      gl_Position = projectionMatrix * mvPosition;

      vUv = uv;
      vColor = instanceColor;
      vColorEnd = instanceColorEnd;
    }
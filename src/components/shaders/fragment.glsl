    varying vec2 vUv;
    varying vec3 vColor;
    varying vec3 vColorEnd;
    varying float vProgress;

    uniform float uIntensity;
    uniform vec2 uFadeAlpha;

    uniform sampler2D uAlphaMap;

    void main() {
    if (vProgress < 0.0 || vProgress > 1.0) {
        discard;
    }
      vec3 color = mix(vColor, vColorEnd, vProgress);
      color *= uIntensity;

    float alpha = smoothstep(0.0, uFadeAlpha.x, vProgress) * smoothstep(1.01, uFadeAlpha.y, vProgress);

    #ifdef ALPHAMAP
        vec4 tex = texture2D(uAlphaMap, vUv);
        gl_FragColor = vec4(color, tex.a * alpha);   
    #else
        gl_FragColor = vec4(color, alpha);
    #endif
    }
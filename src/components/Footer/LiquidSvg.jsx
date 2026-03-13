import { useRef, useEffect, useCallback } from 'react';
import femolaaaSvg from '../../assets/femolaaa.svg';

const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_velocity;
uniform float u_time;
uniform float u_intensity;
in vec2 v_texCoord;
out vec4 outColor;

void main() {
  vec2 uv = v_texCoord;
  vec2 toMouse = uv - u_mouse;
  float dist = length(toMouse);
  float maxDist = 0.45;

  if (dist < maxDist && u_intensity > 0.01) {
    float decay = 1.0 - smoothstep(0.0, maxDist, dist);
    decay *= u_intensity;
    float scale = 0.42;

    float freq = 45.0;
    float ripple = sin(dist * freq - u_time * 2.5) * decay * 0.08 * scale
                 + sin(dist * freq * 1.3 + u_time * 2.0) * decay * 0.06 * scale
                 + sin(dist * freq * 0.7 - u_time * 3.0) * decay * 0.07 * scale;
    vec2 radial = normalize(toMouse + 0.001);
    vec2 tangent = vec2(-radial.y, radial.x);
    float swirl = sin(dist * freq * 1.5 + u_time * 1.8) * decay * 0.05 * scale;
    uv -= radial * ripple + tangent * swirl;

    float velLen = length(u_velocity);
    if (velLen > 0.001) {
      vec2 velDir = u_velocity / velLen;
      float stretchStr = 0.14 * scale * decay * min(velLen * 8.0, 1.0);
      float alongVel = dot(toMouse, velDir);
      float stretch = stretchStr * (1.0 - dist / maxDist) * smoothstep(-0.1, 0.3, alongVel);
      uv -= velDir * stretch;
    }
  }

  outColor = texture(u_texture, vec2(uv.x, 1.0 - uv.y));
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vs, fs) {
  const v = createShader(gl, gl.VERTEX_SHADER, vs);
  const f = createShader(gl, gl.FRAGMENT_SHADER, fs);
  const p = gl.createProgram();
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

export default function LiquidSvg({ className }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, intensity: 0 });
  const timeRef = useRef(0);
  const textureLoadedRef = useRef(false);
  const isOverRef = useRef(false);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1.0 - (e.clientY - rect.top) / rect.height,
      intensity: 1,
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    isOverRef.current = true;
    mouseRef.current.intensity = 1;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isOverRef.current = false;
    mouseRef.current.intensity = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) return;

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
    // #region agent log
    let firstRenderLogged = false;
    // #endregion

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texture = gl.createTexture();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // #region agent log
      fetch('http://127.0.0.1:7853/ingest/b302693a-5a49-404f-ac45-09c3cd44428f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f76f52'},body:JSON.stringify({sessionId:'f76f52',location:'LiquidSvg.jsx:img.onload',message:'Texture loaded',data:{width:img.width,height:img.height,hypothesisId:'H1'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureLoadedRef.current = true;
    };
    img.src = femolaaaSvg;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    let rafId;
    const render = () => {
      timeRef.current += 0.016;
      const m = mouseRef.current;
      if (!isOverRef.current && m.intensity > 0) {
        m.intensity = Math.max(0, m.intensity - 0.03);
      }
      if (m.intensity < 0.01) m.intensity = 0;

      if (textureLoadedRef.current) {
        // #region agent log
        if (!firstRenderLogged) { firstRenderLogged = true; fetch('http://127.0.0.1:7853/ingest/b302693a-5a49-404f-ac45-09c3cd44428f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f76f52'},body:JSON.stringify({sessionId:'f76f52',location:'LiquidSvg.jsx:render',message:'First render with V-flip',data:{hypothesisId:'H1',runId:'post-fix'},timestamp:Date.now()})}).catch(()=>{}); }
        // #endregion
        gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
        gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), m.x, m.y);
        gl.uniform1f(gl.getUniformLocation(program, 'u_time'), timeRef.current);
        gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), m.intensity);

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.enableVertexAttribArray(gl.getAttribLocation(program, 'a_position'));
        gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_position'), 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
        gl.enableVertexAttribArray(gl.getAttribLocation(program, 'a_texCoord'));
        gl.vertexAttribPointer(gl.getAttribLocation(program, 'a_texCoord'), 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      rafId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteTexture(texture);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'absolute', inset: 0, cursor: 'default' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}

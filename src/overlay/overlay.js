// 그린스크린 turtle.mp4 → WebGL2 크로마키 → 투명 오버레이 합성.
// turtleman 레포의 셰이더 알고리즘을 그대로 차용:
//   green excess = G - max(R, B)
//   alpha = 1 - clamp((green_excess - threshold) / softness, 0, 1)
//   spill 제거: G를 max(R,B)로 끌어내림 (가장자리 초록 잔재 제거)
// 출력은 premultiplied alpha (투명 BrowserWindow 위에 깨끗하게 합성됨)

const TUNING = {
  threshold: 0.10,
  softness:  0.18,
  spill:     1.0
};

const popover = document.getElementById('popover');
const video = document.getElementById('src');
const canvas = document.getElementById('keyed');
const hudEl = document.getElementById('hud');
const hudTextEl = document.getElementById('hud-text');

const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
if (!gl) {
  console.error('[overlay] webgl2 unavailable');
}

const VERT = `#version 300 es
in vec2 a_pos;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform float u_threshold;
uniform float u_softness;
uniform float u_spill;
void main() {
  vec4 s = texture(u_tex, v_uv);
  vec3 rgb = s.rgb;
  float maxRB = max(rgb.r, rgb.b);
  float greenExcess = rgb.g - maxRB;
  float keyAmount = clamp((greenExcess - u_threshold) / max(u_softness, 0.0001), 0.0, 1.0);
  float alpha = 1.0 - keyAmount;
  float clampedG = min(rgb.g, maxRB);
  float g = mix(rgb.g, clampedG, u_spill * keyAmount);
  // premultiplied: 투명 윈도우에 깨끗이 합성됨
  outColor = vec4(rgb.r * alpha, g * alpha, rgb.b * alpha, alpha);
}`;

function compile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[overlay] shader compile error', gl.getShaderInfoLog(sh));
  }
  return sh;
}

const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('[overlay] program link error', gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// 풀스크린 쿼드. v는 뒤집어서 텍스처를 위아래 올바르게.
const quad = new Float32Array([
  -1, -1,  0, 1,
   1, -1,  1, 1,
  -1,  1,  0, 0,
   1,  1,  1, 0
]);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

const aPos = gl.getAttribLocation(program, 'a_pos');
const aUv  = gl.getAttribLocation(program, 'a_uv');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(aUv);
gl.vertexAttribPointer(aUv,  2, gl.FLOAT, false, 16, 8);

const uThreshold = gl.getUniformLocation(program, 'u_threshold');
const uSoftness  = gl.getUniformLocation(program, 'u_softness');
const uSpill     = gl.getUniformLocation(program, 'u_spill');
const uTex       = gl.getUniformLocation(program, 'u_tex');

const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.clearColor(0, 0, 0, 0);

let rafId = null;
function frame() {
  rafId = requestAnimationFrame(frame);
  if (video.readyState < 2 || video.videoWidth === 0) return;

  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  gl.uniform1i(uTex, 0);
  gl.uniform1f(uThreshold, TUNING.threshold);
  gl.uniform1f(uSoftness,  TUNING.softness);
  gl.uniform1f(uSpill,     TUNING.spill);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

video.addEventListener('loadedmetadata', () => {
  // 비디오 원본 비율 그대로 popover 박스에 적용 — 어떤 영상으로 바꿔도 자동 대응
  if (video.videoWidth && video.videoHeight) {
    popover.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
  }
});

video.addEventListener('loadeddata', () => {
  video.play().catch((err) => console.warn('[overlay] video play failed', err));
  if (rafId === null) frame();
});

video.addEventListener('error', () => {
  console.error('[overlay] video failed to load');
});

// ── HUD + posture wiring ────────────────────────────────────────────

let hudTimer = null;
function showHud(text, durationMs = 2400) {
  hudTextEl.textContent = text;
  hudEl.classList.remove('hidden');
  hudEl.classList.add('visible');
  if (hudTimer) clearTimeout(hudTimer);
  hudTimer = setTimeout(() => {
    hudEl.classList.remove('visible');
    hudEl.classList.add('hidden');
  }, durationMs);
}

window.turtle.onPosture(({ bad }) => {
  if (bad) {
    popover.classList.remove('hidden');
    popover.classList.add('visible');
    showHud('🐢 거북목입니다 — 자세 펴주세요!', 4000);
  } else {
    popover.classList.remove('visible');
    popover.classList.add('hidden');
    showHud('✓ 좋아요, 바른 자세!', 1800);
  }
});

window.turtle.onStatus(({ message, ready }) => {
  if (!ready || /오류|실패|fail|error/i.test(message)) {
    showHud(message, 1800);
  }
});

// 거북목 검출 — MediaPipe Pose 3D 랜드마크의 z 좌표 사용.
//
// 핵심: 머리(귀)가 카메라에 더 가까워지면 z가 더 작아진다(=음수 방향).
// 어깨의 z를 기준선으로 잡고, (어깨z - 귀z)의 변화량으로 거북목 판정.
//
// 기준 자세 맞추기: 시작 후 첫 20프레임을 사용자의 "기본 자세"로 평균 학습.
// 히스테리시스: 진입/탈출 임계 다르게 + 시간 유지로 깜빡임 방지.

const LANDMARK = {
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12
};

const CONFIG = {
  BASELINE_SAMPLES: 20,       // 20프레임 (10fps에서 ~2초)
  POLL_INTERVAL_MS: 100,      // 10fps — 자세 감지엔 충분, CPU 부담 적음
  ENTER_THRESHOLD: 0.06,      // baseline 대비 이만큼 더 앞으로 나와야 발동
  EXIT_THRESHOLD: 0.03,       // baseline 대비 이만큼 안으로 들어가야 해제
  ENTER_SUSTAIN_MS: 500,
  EXIT_SUSTAIN_MS: 400,
  MIN_VISIBILITY: 0.5
};

const statusEl = document.getElementById('status');
const videoEl = document.getElementById('cam');

let baselineSum = 0;
let baselineCount = 0;
let baseline = null;
let postureBad = false;
let badSince = null;
let goodSince = null;

function setStatus(msg) {
  statusEl.textContent = msg;
  window.turtle.sendStatus({ message: msg, ready: baseline !== null });
}

function landmarkOk(lm) {
  return lm && lm.visibility !== undefined && lm.visibility >= CONFIG.MIN_VISIBILITY;
}

function computeForwardness(landmarks) {
  const lEar = landmarks[LANDMARK.LEFT_EAR];
  const rEar = landmarks[LANDMARK.RIGHT_EAR];
  const lSh  = landmarks[LANDMARK.LEFT_SHOULDER];
  const rSh  = landmarks[LANDMARK.RIGHT_SHOULDER];

  const ears = [lEar, rEar].filter(landmarkOk);
  const shs  = [lSh, rSh].filter(landmarkOk);
  if (ears.length === 0 || shs.length === 0) return null;

  const earZ = ears.reduce((s, p) => s + p.z, 0) / ears.length;
  const shZ  = shs.reduce((s, p) => s + p.z, 0) / shs.length;

  // forwardness > 0: 귀가 어깨보다 카메라에 가까움 (= 머리 앞으로 빠져나옴)
  return shZ - earZ;
}

function onResults(results) {
  // 비디오 자체가 CSS로 거울처럼 보임 — 캔버스에 다시 그릴 필요 없음
  if (!results.poseLandmarks) {
    setStatus('사람이 안 보여요');
    return;
  }

  const forwardness = computeForwardness(results.poseLandmarks);
  if (forwardness === null) {
    setStatus('어깨가 안 보여요 — 카메라에서 한 발짝 떨어져보세요');
    return;
  }

  if (baseline === null) {
    baselineSum += forwardness;
    baselineCount += 1;
    setStatus(`기준 자세 맞추는 중… 바른 자세로 잠깐만 (${baselineCount}/${CONFIG.BASELINE_SAMPLES})`);
    if (baselineCount >= CONFIG.BASELINE_SAMPLES) {
      baseline = baselineSum / baselineCount;
      setStatus(`준비 완료 ✓ baseline=${baseline.toFixed(3)}`);
    }
    return;
  }

  const delta = forwardness - baseline;
  const now = performance.now();

  if (!postureBad) {
    if (delta > CONFIG.ENTER_THRESHOLD) {
      if (badSince === null) badSince = now;
      if (now - badSince >= CONFIG.ENTER_SUSTAIN_MS) {
        postureBad = true;
        goodSince = null;
        window.turtle.sendPosture({ bad: true, delta, baseline });
      }
    } else {
      badSince = null;
    }
  } else {
    if (delta < CONFIG.EXIT_THRESHOLD) {
      if (goodSince === null) goodSince = now;
      if (now - goodSince >= CONFIG.EXIT_SUSTAIN_MS) {
        postureBad = false;
        badSince = null;
        window.turtle.sendPosture({ bad: false, delta, baseline });
      }
    } else {
      goodSince = null;
    }
  }

  setStatus(
    `live=${forwardness.toFixed(3)}  Δ=${delta.toFixed(3)}  ${postureBad ? '🐢 거북목' : '✓ ok'}`
  );
}

async function main() {
  if (typeof Pose === 'undefined') {
    setStatus('MediaPipe Pose 로드 실패 (첫 실행은 인터넷 필요)');
    return;
  }

  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });
  pose.onResults(onResults);

  setStatus('카메라 요청 중…');
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false
    });
  } catch (err) {
    setStatus(`카메라 오류: ${err.message}`);
    return;
  }
  videoEl.srcObject = stream;
  await new Promise((res) => (videoEl.onloadedmetadata = res));
  await videoEl.play();

  setStatus('카메라 준비 ✓ — 자세 추적 시작');

  // setInterval로 폴링 (rAF는 hidden 윈도우에서 throttle 됨).
  // processing 플래그로 비동기 처리 겹침 방지.
  let processing = false;
  setInterval(async () => {
    if (processing) return;
    if (videoEl.readyState < 2) return;
    processing = true;
    try { await pose.send({ image: videoEl }); }
    catch (err) { /* MediaPipe 가끔 일시적 에러; 무시하고 계속 */ }
    processing = false;
  }, CONFIG.POLL_INTERVAL_MS);
}

main().catch((err) => setStatus(`치명적 오류: ${err.message}`));

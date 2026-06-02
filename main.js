// 거북이 코치 — 시스템 트레이에 박혀서 거북목 자세를 감지하는 백그라운드 앱.
//
// 구조:
//   - tray            : 시스템 트레이 아이콘 (우클릭 → 종료)
//   - detectorWin     : 보이지 않는 윈도우. 카메라 + MediaPipe Pose 실행.
//   - overlayWin      : 화면 전체를 덮는 투명 윈도우. 거북이가 슬라이드 인.
//
// 머리가 어깨보다 카메라에 가까워지면(=z 좌표가 작아지면) 거북목으로 판정.

const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen, session } = require('electron');
const path = require('path');

let tray = null;
let detectorWin = null;
let overlayWin = null;
let isQuitting = false;
let baselineReadyHandled = false;

const PIP = { width: 320, height: 240, margin: 24 };
const OFFSCREEN = { x: -3000, y: -3000 };

function pipCoords() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  return {
    x: sw - PIP.width - PIP.margin,
    y: sh - PIP.height - PIP.margin
  };
}

function createDetectorWindow() {
  // 시작 시 우하단에 작은 PIP로 떠 있음 → 사용자가 자세 잡으면서 카메라 영상 확인 가능.
  // 기준 자세 잡힌 후 3초 뒤 화면 밖으로 hide. 트레이 메뉴에서 다시 켤 수 있음.
  const { x, y } = pipCoords();
  detectorWin = new BrowserWindow({
    width: PIP.width,
    height: PIP.height,
    x,
    y,
    show: true,
    skipTaskbar: true,
    frame: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'detector', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });
  detectorWin.loadFile(path.join(__dirname, 'src', 'detector', 'index.html'));

  // 환경 변수 TURTLE_DEBUG=1 로 띄우면 큰 디버그 윈도우 + DevTools
  if (process.env.TURTLE_DEBUG === '1') {
    detectorWin.setBounds({ x: 50, y: 50, width: 480, height: 360 });
    detectorWin.webContents.openDevTools({ mode: 'detach' });
  }
}

function showPipPreview() {
  if (!detectorWin || detectorWin.isDestroyed()) return;
  const { x, y } = pipCoords();
  detectorWin.setBounds({ x, y, width: PIP.width, height: PIP.height });
  if (!detectorWin.isVisible()) detectorWin.show();
}

function hidePipPreview() {
  if (!detectorWin || detectorWin.isDestroyed()) return;
  // hide() 쓰면 Chromium rAF throttle 됨 → 화면 밖 좌표로 옮겨서 visible 유지
  detectorWin.setBounds({
    x: OFFSCREEN.x,
    y: OFFSCREEN.y,
    width: PIP.width,
    height: PIP.height
  });
}

function isPipVisible() {
  if (!detectorWin || detectorWin.isDestroyed()) return false;
  const b = detectorWin.getBounds();
  return b.x > -2000; // 화면 밖이 아닌 경우
}

function createOverlayWindow() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  overlayWin = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'src', 'overlay', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });
  overlayWin.setIgnoreMouseEvents(true, { forward: true });
  overlayWin.setAlwaysOnTop(true, 'screen-saver');
  overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWin.loadFile(path.join(__dirname, 'src', 'overlay', 'index.html'));
  overlayWin.once('ready-to-show', () => overlayWin.show());
}

function createTray() {
  const iconPath = path.join(__dirname, 'tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip('거북이 코치 — 자세 감지 중');

  const rebuildMenu = (statusLabel = '자세 감지 중...') => {
    const pipShown = isPipVisible();
    const menu = Menu.buildFromTemplate([
      { label: '🐢 거북이 코치', enabled: false },
      { label: statusLabel, enabled: false },
      { type: 'separator' },
      {
        label: '카메라 미리보기',
        type: 'checkbox',
        checked: pipShown,
        click: () => {
          if (isPipVisible()) hidePipPreview();
          else showPipPreview();
          rebuildMenu(statusLabel);
        }
      },
      {
        label: '디버그 창 열기',
        click: () => {
          if (!detectorWin) return;
          detectorWin.setBounds({ x: 50, y: 50, width: 480, height: 360 });
          detectorWin.show();
          detectorWin.webContents.openDevTools({ mode: 'detach' });
        }
      },
      { type: 'separator' },
      {
        label: '종료',
        click: () => quitApp()
      }
    ]);
    tray.setContextMenu(menu);
  };

  rebuildMenu();
  tray.rebuildMenu = rebuildMenu;
}

// detector → main → overlay
ipcMain.on('posture-update', (_event, payload) => {
  if (!overlayWin || overlayWin.isDestroyed()) return;
  overlayWin.webContents.send('posture-update', payload);
});

ipcMain.on('detector-status', (_event, payload) => {
  if (overlayWin && !overlayWin.isDestroyed()) {
    overlayWin.webContents.send('detector-status', payload);
  }
  if (tray && tray.rebuildMenu && payload && payload.message) {
    const status = payload.ready ? '자세 감지 중 ✓' : '기준 자세 맞추는 중...';
    tray.rebuildMenu(status);
  }
  // 기준 자세 처음 잡힌 순간: 3초 후 PIP 자동 hide
  if (payload && payload.ready && !baselineReadyHandled) {
    baselineReadyHandled = true;
    setTimeout(() => {
      if (isPipVisible() && process.env.TURTLE_DEBUG !== '1') hidePipPreview();
      if (tray && tray.rebuildMenu) tray.rebuildMenu('자세 감지 중 ✓');
    }, 3000);
  }
});

app.whenReady().then(() => {
  // 카메라 권한 자동 허용 (사용자가 동의한 앱이라는 전제)
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => {
    if (perm === 'media') return cb(true);
    cb(false);
  });

  createTray();
  createOverlayWindow();
  createDetectorWindow();
});

// 모든 윈도우 닫혀도 트레이로 살아남기 (단, 종료 중이 아닐 때만)
app.on('window-all-closed', (e) => {
  if (!isQuitting) e.preventDefault();
});

// 깔끔한 종료 — Windows 트레이 ghost icon + closable:false 윈도우 둘 다 처리
function quitApp() {
  if (isQuitting) return;
  isQuitting = true;

  // 1) 트레이 아이콘 즉시 제거 (안 그러면 hover 전까지 잔상 남음)
  if (tray) {
    try { tray.destroy(); } catch (_) {}
    tray = null;
  }

  // 2) 모든 윈도우 강제 destroy (closable:false 옵션을 우회)
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) {
      try { w.destroy(); } catch (_) {}
    }
  }

  // 3) Electron 정상 종료. 그래도 안 죽으면 0.5초 후 강제 exit
  app.quit();
  setTimeout(() => app.exit(0), 500);
}

// 누가 다른 경로로 quit 호출해도 트레이 정리 보장
app.on('before-quit', () => {
  isQuitting = true;
  if (tray) {
    try { tray.destroy(); } catch (_) {}
    tray = null;
  }
});

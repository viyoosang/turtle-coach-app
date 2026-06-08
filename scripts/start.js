// npm start 안전 런처
//
// 왜 필요한가:
//   Claude Code(또는 VS Code)의 터미널은 ELECTRON_RUN_AS_NODE=1 환경변수를
//   물려준다. 이 변수가 켜져 있으면 electron.exe가 Electron 앱이 아니라
//   "그냥 Node.js"로 동작해서, main.js의 require('electron')이 API 객체 대신
//   문자열(경로)을 돌려준다 → ipcMain 등이 undefined → 앱이 즉시 크래시.
//
//   워크샵 기본 흐름은 "Claude Code가 대신 npm start를 친다"이므로,
//   이 한 겹을 거쳐서 환경변수를 비운 뒤 진짜 Electron으로 앱을 띄운다.
//   환경변수가 원래 없던 환경(일반 터미널, exe 더블클릭)에서는 아무 영향이 없다.

const { spawn } = require('child_process');

// 이 스크립트는 일반 Node로 실행되므로 require('electron')은
// electron.exe의 경로(문자열)를 돌려준다. 그 경로로 진짜 Electron을 띄운다.
const electronPath = require('electron');

// 문제의 환경변수만 제거한 깨끗한 환경을 만든다.
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, ['.'], { stdio: 'inherit', env });

child.on('close', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
  console.error('Electron 실행 실패:', err.message);
  process.exit(1);
});

# CLAUDE.md — 거북이 코치 (turtle-coach)

웹캠으로 거북목 자세를 감지해 화면에 큰 거북이를 띄우는 **Windows 시스템 트레이 앱**(Electron).
바이브 코딩 입문 워크샵의 실습용 프로젝트다. 이 파일을 읽는 **Claude Code는, 코딩을 처음 하는 참가자를 대신해 설치·실행·수정 확인을 진행**한다.

---

## 워크샵 참가자가 처음 받았다면 — 실행까지

참가자가 "이 GitHub 저장소 받아서 실행해줘", "거북이 앱 실행해줘"라고 말하면, Claude는 참가자가 명령을 외우지 않아도 되도록 아래 순서로 직접 진행한다.

워크샵의 기본 흐름은 GitHub clone이다. 참가자가 GitHub URL을 함께 주면 그 URL을 우선 사용한다. 저장소 주소는 워크샵 전에 확정되며, 현재 예상 주소는 `https://github.com/viyoosang/turtle-coach-app` 형식이다. 확정 전에는 임의로 GitHub에 올리거나 remote를 바꾸지 않는다.

탐색기에서 뭘 눌러야 하는지 묻는다면, 루트의 **`00_먼저_실행하기\실행하기.cmd`** 또는 **`00_실행하기.cmd`**를 먼저 안내한다. 빌드된 앱이 있으면 바로 실행하고, 없으면 Claude Code에게 요청할 문장을 보여주는 런처다. 단, GitHub에서 막 clone한 상태에는 `dist/`가 없을 수 있으므로 아래 설치·실행 절차도 그대로 진행할 준비를 한다.

1. **Git 설치와 사용자 정보 확인**
   - GitHub에서 저장소를 처음 받는 상황이면 먼저 Git이 설치되어 있는지 확인한다.

     ```powershell
     git --version
     ```

   - Git이 없거나 오류가 나면 Windows PowerShell에서 아래 명령으로 Git 설치를 시도한다.

     ```powershell
     winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
     ```

   - UAC/관리자 권한 창이 뜨면 참가자에게 승인하라고 안내한다.
   - 설치가 끝나면 **새 터미널 또는 새 Claude Code 세션**에서 다시 `git --version`을 확인한다.
   - `winget`이 없거나 회사 보안 정책으로 막히면 https://git-scm.com 에서 Windows 설치본을 받도록 안내한다.
   - 커밋 실습을 할 예정이라면 Git 사용자 이름과 이메일도 확인한다.

     ```powershell
     git config --global user.name
     git config --global user.email
     ```

   - 비어 있으면 참가자에게 "커밋 작성자 표시용 정보"라고 설명하고 설정을 돕는다. GitHub 로그인 비밀번호가 아니라, 동료와 협업할 때 변경 이력에 보이는 이름/이메일이다.
   - 이름은 본인 이름, 이메일은 회사 메일을 권장한다. 잘 모르겠으면 자기 이름과 회사 메일을 넣으라고 안내한다.

     ```powershell
     git config --global user.name "홍길동"
     git config --global user.email "gildong.hong@visang.com"
     ```

2. **GitHub 저장소 받기 또는 현재 위치 확인**
   - 참가자가 GitHub URL을 줬고 아직 로컬에 저장소가 없다면, 먼저 저장소를 받을 위치로 이동한 뒤 `git clone <URL>`을 실행한다.
   - 예시 URL은 예정 주소다. 워크샵에서 확정된 URL이 있으면 그 주소를 사용한다.

     ```powershell
     git clone https://github.com/viyoosang/turtle-coach-app
     Set-Location turtle-coach-app
     ```

   - 이미 저장소 폴더가 열려 있으면 `git clone`을 다시 하지 않는다.
   - 먼저 PowerShell에서 현재 폴더를 확인한다.

     ```powershell
     Get-Location
     Test-Path package.json
     ```

   - `Test-Path package.json`이 `False`이면, 지금 위치 아래에서 `turtle-coach-app` 폴더를 찾아 그 안으로 이동한다.

     ```powershell
     $repo = Get-ChildItem -Path . -Directory -Filter turtle-coach-app -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
     if ($repo) { Set-Location $repo.FullName }
     Get-Location
     Test-Path package.json
     ```

   - `Test-Path package.json`이 `True`가 된 뒤에만 설치/실행 명령을 친다.
   - 찾지 못하면 `npm install`을 시도하지 말고, 참가자에게 저장소 폴더가 어디 있는지 확인해 달라고 안내한다.
3. **Node.js와 npm 확인**
   - `node -v`와 `npm -v`를 실행한다.
   - Node.js는 **v22.12.0 이상**이어야 한다. Electron 42 설치 도구가 이 버전 이상을 요구한다.
   - 아래처럼 판정하면 된다.

     ```powershell
     node -v
     npm -v
     $nodeOk = $false
     try { $nodeOk = [version]((node -v) -replace '^v','') -ge [version]'22.12.0' } catch { $nodeOk = $false }
     $nodeOk
     ```

   - `node -v`/`npm -v`가 실패하거나 `$nodeOk`가 `False`이면 Windows PowerShell에서 아래 명령으로 Node.js LTS 설치를 시도한다.

     ```powershell
     winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
     ```

   - UAC/관리자 권한 창이 뜨면 참가자에게 승인하라고 안내한다.
   - 설치가 끝나면 **새 터미널 또는 새 Claude Code 세션**에서 다시 `node -v`, `npm -v`, `$nodeOk`를 확인한다.
   - `winget`이 없거나 회사 보안 정책으로 막히면 https://nodejs.org 에서 LTS 설치본을 받도록 안내하고, 설치가 끝날 때까지 `npm install`로 넘어가지 않는다.
4. **의존성 설치**
   - 레포 루트에서 `npm install`을 실행한다.
   - 이 단계는 인터넷이 필요하다. Electron 다운로드가 오래 걸리거나 회사망에서 막히면 에러 메시지를 참가자에게 설명하고 강사에게 도움을 요청하게 한다.
5. **실행**
   - `npm start`를 실행한다.
   - 앱이 뜨면 참가자에게 아래를 안내한다.
     - 작업표시줄 우하단 트레이에 **거북이 아이콘**이 생긴다.
     - 화면 우하단에 **카메라 미리보기(PIP)**가 뜬다.
     - 첫 2초는 바른 자세로 앉아 기준 자세를 학습시킨다.
     - 첫 실행에는 MediaPipe Pose 모델 다운로드와 카메라 권한 허용이 필요하다.
     - 머리를 숙이면 거북이가 등장하고, 자세를 펴면 사라진다.

> Node.js는 워크샵에서 따로 가르치지 않는다. 이 저장소를 실행하는 과정에서 Claude가 확인하고, 없거나 v22.12.0 미만이면 설치 안내까지 맡는다.

---

## 프로젝트 구조 (수정할 때 어디를 볼지)

- **main.js** — Electron 메인 프로세스. 트레이 + `detectorWin`(보이지 않는 카메라 창) + `overlayWin`(전체화면 투명 거북이 창)을 띄운다.
- **00_먼저_실행하기/실행하기.cmd · 00_실행하기.cmd** — 비전공자 참가자가 폴더에서 가장 먼저 볼 실행/안내 런처. 빌드된 앱이 있으면 실행하고, 없으면 Claude Code 안내 문구를 보여준다.
- **src/detector/detector.js** — 카메라 + MediaPipe Pose 로 자세 감지. **거북목 판정 민감도**는 이 파일의 `CONFIG`(`ENTER_THRESHOLD` / `EXIT_THRESHOLD`).
- **src/overlay/** — 화면에 뜨는 거북이.
  - `index.html` — `<video id="src" src="./assets/turtle.mp4">` 로 거북이 영상을 깐다. HUD 문구는 `#hud-text`.
  - `overlay.js` — 그린스크린 `turtle.mp4` 를 WebGL2 **크로마키**로 투명 합성.
  - `overlay.css` — 거북이 크기·위치·색.
  - `assets/turtle.mp4` — 거북이 영상(그린스크린 배경).
- **package.json** — 스크립트: `start`(개발 실행) · `make` · `dist`(배포 빌드).
- **tray-icon.png · tray-icon@2x.png · app-icon.png · app-icon.ico** — 같은 거북이 이미지 기반 아이콘. `build-icons.js`는 아이콘 파일이 준비되어 있는지 확인하는 helper다.
- **dist/ · out/ · node_modules/** — 빌드 산출물·의존성. **수정/커밋 대상 아님.** `dist/`와 zip은 강사용 예비 배포본이며, 워크샵 기본 흐름은 GitHub clone이다.

---

## 워크샵에서 자주 하는 수정 (실습 "바꿔보기")

참가자가 자연어로 요청하면 Claude는 관련 파일을 읽고, 작게 수정한 뒤 `npm start`로 직접 확인한다.

- **알림 문구 바꾸기**
  - 예: "거북목일 때 문구를 더 친절하게 바꾸고, 자세가 좋아지면 칭찬 문구가 나오게 해줘."
  - 주로 `src/overlay/overlay.js`의 `showHud(...)` 문구를 수정한다.
- **거북이 크기·위치·등장 속도 바꾸기**
  - 예: "거북이가 너무 커서 방해돼. 화면 오른쪽 아래에 작게 뜨게 해줘."
  - 주로 `src/overlay/overlay.css`의 `#popover`, transition, transform을 수정한다.
- **알림 색과 모양 바꾸기**
  - 예: "경고 알림은 주황색, 좋아졌을 때는 초록색으로 보이게 해줘."
  - `src/overlay/overlay.css`를 우선 수정하고, 상태별 클래스가 필요하면 `src/overlay/overlay.js`도 함께 수정한다.
- **거북목 민감도 조정**
  - 예: "거북이가 너무 자주 떠. 조금 둔감하게 만들고 깜빡임도 줄여줘."
  - `src/detector/detector.js`의 `CONFIG.ENTER_THRESHOLD`, `EXIT_THRESHOLD`, `ENTER_SUSTAIN_MS`, `EXIT_SUSTAIN_MS`를 조정한다.
  - `ENTER_THRESHOLD`를 키우면 더 둔감해지고, 줄이면 더 예민해진다.
- **거북이 영상 바꾸기**
  - `src/overlay/assets/turtle.mp4`를 다른 영상으로 교체한다.
  - 새 영상이 그린스크린이면 그대로 크로마키 처리된다.
  - 그린스크린이 아니면 `src/overlay/overlay.js`의 크로마키 처리를 조정해야 한다.

수정 후 확인은 `npm start`, 공유용 배포본은 `npm run dist`(→ `dist/거북이코치/거북이코치.exe`, `dist/거북이코치.zip`).

---

## Git 안전망

- GitHub에서 clone한 저장소는 이미 Git 저장소이므로 `git init`은 다시 하지 않는다.
- `git --version`으로 Git 설치 여부를 확인하고, 없으면 `winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements`로 설치를 돕는다.
- `git config --global user.name`, `git config --global user.email`은 커밋 작성자 표시용 정보다. 동료와 협업할 때 변경 이력에 보이는 이름/이메일이며, GitHub 로그인 비밀번호가 아니다.
- 사용자 정보가 비어 있으면 본인 이름과 회사 메일로 설정하도록 돕는다.
- 수정 전후로 `git status`를 보여주고, 참가자가 원하면 `git add .`와 `git commit -m "..."`까지 돕는다.
- 망가뜨려서 되돌리고 싶으면 먼저 어떤 파일이 바뀌었는지 설명한 뒤 `git restore <파일>` 또는 `git restore .`를 제안한다.
- 참가자 PC에 Git 사용자 정보가 없어 commit이 막히면 `git config --global user.name`, `git config --global user.email` 설정을 안내한다.

---

## 환경 / 톤

- **Windows + PowerShell** 전제. 참가자에게는 **한국어로, 명령어 의미를 풀어서** 설명한다.
- 참가자는 비개발자다. **명령은 Claude가 치고**, 참가자에겐 "지금 뭘 왜 하는지" 한 줄로 알려준다.
- Node.js 설치, 패키지 설치, Git 되돌리기처럼 영향이 있는 작업 전에는 무엇을 하는지 짧게 설명한다.
- 막히면 억지로 계속하지 말고, 에러 메시지와 다음 선택지를 먼저 설명한다.

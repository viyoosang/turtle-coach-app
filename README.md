# 🐢 거북이 코치 (turtle-coach)

웹캠으로 거북목 자세를 감지해서 화면에 큰 거북이를 띄워주는 시스템 트레이 앱.

> "머리 숙이면 → 거북이 등장 → 자세 펴면 → 거북이 사라짐"
> 그게 다예요.

레퍼런스: [Gojaehyeon/turtleman](https://github.com/Gojaehyeon/turtleman) (macOS 원본 — 자세 검출 알고리즘 + WebGL 크로마키 셰이더 차용. Windows 호환 + 시스템 트레이 + PIP 미리보기 추가)

---

## 🚀 워크샵에서 실행하기

이 워크샵의 기본 흐름은 **GitHub 저장소 주소를 Claude Code에게 주고, Claude Code가 저장소를 내려받아 `CLAUDE.md`를 읽은 뒤 설치부터 실행까지 대신 진행**하는 것입니다.
Node.js를 미리 몰라도 됩니다. 없거나 너무 오래된 버전이면 Claude가 확인하고 설치 안내부터 진행합니다.
Git을 처음 써도 괜찮습니다. 없으면 Claude가 확인하고 설치 안내부터 진행합니다.

저장소 주소는 워크샵 전에 확정됩니다. 현재 예상 주소는 아래 형식입니다.

```text
https://github.com/viyoosang/turtle-coach-app
```

강사가 최종 주소를 알려주면, 그 주소를 그대로 Claude Code에게 전달하세요.

### 폴더에서 제일 먼저 볼 파일

탐색기에서 폴더를 열었을 때는 **`00_먼저_실행하기`** 폴더를 먼저 보면 됩니다.
그 안의 **`실행하기.cmd`**를 누르면 됩니다. 파일 목록에서 **`00_실행하기.cmd`**가 보이면 그것을 눌러도 됩니다.

- 빌드된 앱이 있으면 `dist\거북이코치\거북이코치.exe`를 바로 실행합니다.
- GitHub에서 막 받은 상태처럼 아직 실행 파일이 없으면, Claude Code에게 말할 문장을 안내합니다.

Claude Code에게 이렇게 말하세요:

```text
아래 GitHub 저장소를 받아서 실행까지 해줘.
https://github.com/viyoosang/turtle-coach-app

CLAUDE.md를 읽고 진행해줘.
Git이나 Node.js가 없거나 오래된 버전이면 설치 안내부터 진행해줘.
```

Claude가 하는 일:

1. `git --version`으로 Git 설치 여부 확인
2. Git이 없으면 Windows에서 설치 안내
3. GitHub 저장소를 `git clone`으로 내려받기
4. `turtle-coach-app` 폴더로 이동
5. `node -v`, `npm -v`로 Node.js/npm 설치 여부 확인
6. Node.js가 없거나 `v22.12.0` 미만이면 Windows에서 Node.js LTS 설치 안내
7. `npm install`로 필요한 부품 설치
8. `npm start`로 앱 실행

설치와 첫 실행에는 인터넷이 필요합니다.
`npm install` 때 Electron을 받고, 앱 첫 실행 때 MediaPipe Pose 모델을 CDN에서 한 번 내려받습니다.

GitHub에서 clone한 저장소는 이미 Git 저장소입니다. 워크샵 중에는 `git init`을 다시 하지 않아도 됩니다.

### Git이 처음이라면

Git은 GitHub 저장소를 받고, 내가 바꾼 내용을 기록하는 도구입니다.
Claude Code가 아래를 확인하고, 없으면 설치 안내를 도와줍니다.

```powershell
git --version
```

Git이 없으면 Windows PowerShell에서 아래 명령으로 설치할 수 있습니다.

```powershell
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
```

회사 보안 정책 등으로 `winget`이 막히면 https://git-scm.com 에서 Windows 설치본을 받아 설치합니다.

설치 후에는 새 터미널을 열고 다시 확인합니다.

```powershell
git --version
```

커밋 실습을 할 때는 이름과 이메일도 설정합니다.
이 정보는 로그인 정보가 아니라 **커밋 작성자 표시용 정보**입니다.
동료와 협업할 때 변경 이력에 "누가 수정했는지" 보여주는 이름/이메일이라고 생각하면 됩니다.

```powershell
git config --global user.name "홍길동"
git config --global user.email "gildong.hong@visang.com"
```

잘 모르겠으면 본인 이름과 회사 메일을 넣으면 됩니다.

### 직접 명령으로 실행해야 할 때

Claude Code가 막히거나 강사가 수동으로 도와줄 때는 PowerShell에서 아래 순서로 실행합니다.
이미 GitHub에서 받은 폴더가 열려 있다면 `git clone`은 다시 하지 말고 그 폴더에서 시작하세요.
아래 URL은 예정 주소입니다. 워크샵에서 강사가 최종 주소를 알려주면 그 주소를 사용하세요.

```powershell
git --version
git clone https://github.com/viyoosang/turtle-coach-app
cd turtle-coach-app
node -v
npm -v
npm install
npm start
```

`node -v` 또는 `npm -v`가 실패하거나 Node.js가 `v22.12.0` 미만이면 Node.js LTS를 먼저 설치합니다.

```powershell
node -v
npm -v
```

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
```

설치 후에는 새 터미널을 열고 다시 `node -v`, `npm -v`를 확인합니다.
회사 보안 정책 등으로 `winget`이 막히면 https://nodejs.org 에서 LTS 설치본을 내려받아 설치합니다.

### 빌드된 앱 또는 zip을 받은 경우

워크샵 기본 흐름은 GitHub clone입니다.
`dist\거북이코치.zip` 또는 `dist\거북이코치\거북이코치.exe`는 강사가 예비용으로 따로 줄 때만 사용합니다.
GitHub에서 clone한 저장소에는 보통 `dist/`가 없습니다.

zip을 받았다면 먼저 압축을 풀고, 풀린 `거북이코치` 폴더 안에서 아래 중 하나를 실행합니다.

```text
00_먼저_실행하기\실행하기.cmd
00_실행하기.cmd
거북이코치.exe
```

첫 실행 시:

1. Windows Defender **"PC 보호"** 화면 → **추가 정보** → **실행**
2. 트레이(작업표시줄 우하단)에 **거북이 아이콘** 등장
   - 안 보이면 ^ 아이콘을 눌러 숨겨진 아이콘 펼치기
   - 항상 보이게 하려면 아이콘을 작업표시줄로 드래그
3. 화면 우하단에 **카메라 미리보기 PIP** 등장
4. Windows 카메라 권한 요청이 뜨면 **허용**
5. 첫 실행에는 MediaPipe Pose 모델을 내려받느라 잠깐 기다릴 수 있음

---

## 📐 기준 자세 맞추기 (자동, ~2초)

앱이 **본인의 바른 자세**를 기억하는 과정. 그래야 그것보다 머리가 더 빠질 때 거북목으로 판정할 수 있어요.

### 왜 필요해요?

사람마다 카메라 거리, 어깨 너비, 앉는 습관이 다르기 때문에 "절대값"으로는 거북목을 판단할 수 없어요.
시작할 때 **본인의 바른 자세**(귀-어깨 거리)를 기억해 두고, 거기서 머리가 더 앞으로 빠지면 거북목으로 판정합니다.

### 뭘 하면 돼요?

- 앱 켜고 **처음 2초는 척추 펴고 바른 자세로** 앉아 있기 (가벼운 군기 OK)
- ⚠️ **평소 거북목 자세로 시작하지 마세요** — 거북목 자세가 기준이 돼버리면, 더 심한 거북목만 알람 줘서 거의 안 뜸
- 어깨 양쪽이 카메라 프레임에 들어와야 함

### 진행 상황

우하단 PIP의 카메라 영상 아래에:
```
기준 자세 맞추는 중… 바른 자세로 잠깐만 (12/20)
...
준비 완료 ✓
```

기준 자세 잡힌 후 **3초 뒤 PIP가 자동으로 사라집니다.**

다시 잡고 싶으면: 트레이 → 종료 → 다시 실행 (켤 때마다 새로 잡음)

---

## 📷 평소 사용

| 상황 | 동작 |
|---|---|
| 머리를 모니터 쪽으로 숙임 (0.5초 이상) | 큰 거북이가 화면 가운데로 슬라이드 인 + 상단 알림 "🐢 거북목입니다 — 자세 펴주세요!" |
| 자세를 다시 폄 (0.4초 이상) | 거북이 슬라이드 아웃 + "✓ 좋아요, 바른 자세!" |

거북이는 클릭이 통과해서 그 위에서 작업 계속 가능.

### 트레이 메뉴 (우클릭)

- **카메라 미리보기** — 본인 자세 다시 보기 (체크 해제하면 화면 밖으로 숨김)
- **디버그 창 열기** — 자세 점수, 변수, DevTools 표시 (튜닝용)
- **종료** — 트레이 아이콘 즉시 사라짐

---

## 🛠 수정하고 빌드하기

코드를 바꾼 뒤에는 개발 실행으로 바로 확인합니다.

```powershell
npm start
```

워크샵에서 추천하는 첫 변형 과제:

- 알림 문구를 더 친절하게 바꾸기
- 거북이 크기와 위치를 덜 방해되게 조정하기
- HUD 경고 색과 성공 색 바꾸기
- 거북목 감지 민감도를 조금 더 둔감하거나 예민하게 조정하기

동료에게 줄 실행 파일과 zip을 만들 때는 Windows에서 아래 명령을 사용합니다.

```powershell
npm run dist
```

결과물:

- `dist/거북이코치/거북이코치.exe`
- `dist/거북이코치.zip`

`npm run make`는 내부 raw 빌드용이고, 워크샵에서는 보통 `npm run dist`만 쓰면 됩니다.

---

## 🐛 트러블슈팅

### `node` 또는 `npm`을 찾을 수 없어요
Node.js가 아직 설치되지 않았거나, 설치 후 새 터미널을 열지 않은 상태입니다.
이 앱의 현재 Electron 버전은 Node.js `v22.12.0` 이상이 필요합니다.

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
```

설치가 끝나면 PowerShell 또는 Claude Code 터미널을 새로 열고 확인합니다.

```powershell
node -v
npm -v
```

`winget`이 막히면 https://nodejs.org 에서 LTS 설치본을 받아 설치합니다.

### Git 설치 또는 커밋 설정이 막혀요
Git이 아직 설치되지 않았거나, 설치 후 새 터미널을 열지 않은 상태일 수 있습니다.

```powershell
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
```

`winget`이 막히면 https://git-scm.com 에서 Windows 설치본을 받아 설치합니다.

설치가 끝나면 PowerShell 또는 Claude Code 터미널을 새로 열고 확인합니다.

```powershell
git --version
```

커밋할 때 이름/이메일을 물어보면 아래처럼 설정합니다.

```powershell
git config --global user.name "홍길동"
git config --global user.email "gildong.hong@visang.com"
```

이 이름과 이메일은 동료가 Git 기록에서 작성자를 알아보는 데 쓰입니다.

### `npm install`이 오래 걸리거나 실패해요
Electron을 내려받는 단계라 인터넷 연결과 회사망 정책의 영향을 받습니다.
에러 메시지를 그대로 확인하고, 사내망에서 `github.com`, `npmjs.com`, Electron 다운로드 주소가 막히지 않았는지 강사에게 알려주세요.

### "사람이 안 보여요" / "어깨가 안 보여요"
- 카메라에서 50~80cm 정도 떨어져 앉기
- **양쪽 어깨가 프레임에 다 들어와야 함**
- 너무 어두우면 인식 어려움 — 얼굴에 빛이 들어오게

### 거북이가 너무 자주 떠요 (과민)
[src/detector/detector.js](src/detector/detector.js)의 `CONFIG`:
```js
ENTER_THRESHOLD: 0.10,  // 0.06 → 0.10 (둔감하게)
EXIT_THRESHOLD: 0.05,
```
저장 후 `npm run dist`로 재빌드.

### 거북이가 안 떠요 (둔감)
```js
ENTER_THRESHOLD: 0.04,
EXIT_THRESHOLD: 0.02,
```

### 거북이가 깜빡거려요
`ENTER_SUSTAIN_MS`, `EXIT_SUSTAIN_MS`를 올리세요 (500 → 1000).

### 크로마키 가장자리에 초록 잔재
[src/overlay/overlay.js](src/overlay/overlay.js)의 `TUNING`:
- 초록 안 지워짐: `threshold: 0.10 → 0.05`
- 거북이 본체 파먹힘: `threshold: 0.10 → 0.15`
- 톱니 자글거림: `softness: 0.18 → 0.30`

### 거북이가 세로/가로로 늘어남
원본 비율은 [src/overlay/overlay.js](src/overlay/overlay.js)의 `loadedmetadata` 처리에서 비디오 메타데이터를 읽어 자동 적용됩니다. 만약 다른 비디오로 바꿨는데 안 맞으면 비디오 코덱 호환성 의심 (mp4 H.264 권장).

### 카메라가 안 잡혀요
- Windows 설정 → 개인정보 보호 및 보안 → 카메라
  - "앱이 카메라에 액세스하도록 허용" ON
  - "데스크톱 앱이 카메라에 액세스하도록 허용" ON
- Teams/Zoom 등이 카메라 점유 중이면 닫고 재시도

### .exe가 실행이 안 돼요
- **폴더 통째로 옮겨야 동작합니다.** `거북이코치.exe` 파일 하나만 복사하면 X (옆에 있는 .dll, .pak, .mp4 파일들이 필요)
- 동료에게 줄 때는 `dist/거북이코치.zip` 통째로

### 트레이 아이콘이 종료 후에도 남아있어요
이미 수정됨 ([main.js](main.js)의 `quitApp()`). 그래도 남으면 작업관리자에서 `거북이코치.exe` 또는 `turtle-coach.exe` 프로세스 종료.

---

## 📁 폴더 구조

```
turtle-coach-app/
├── README.md                ← 지금 이 파일
├── 00_먼저_실행하기/
│   └── 실행하기.cmd          ← 폴더 목록 맨 위쪽에서 찾기 쉬운 실행/안내 런처
├── 00_실행하기.cmd          ← 먼저 눌러볼 수 있는 실행/안내 런처
├── package.json             scripts: start / make / dist
├── main.js                  Electron 메인 (트레이 + 윈도우 + IPC)
├── build-icons.js           아이콘 파일 확인용 helper
├── tray-icon.png, tray-icon@2x.png
├── app-icon.png, app-icon.ico    같은 거북이 이미지 기반 아이콘
├── scripts/
│   └── post-build.ps1       npm run dist 의 정리 단계
├── src/
│   ├── detector/            PIP 카메라 윈도우 (백그라운드 자세 추적)
│   │   ├── index.html
│   │   ├── detector.js      MediaPipe Pose + 기준 자세 학습 + 히스테리시스
│   │   └── preload.js
│   └── overlay/             전체화면 투명 윈도우 (거북이 등장)
│       ├── index.html
│       ├── overlay.css
│       ├── overlay.js       WebGL2 크로마키 셰이더 + 슬라이드 인 애니메이션
│       ├── preload.js
│       └── assets/
│           └── turtle.mp4   거북이 그린스크린 비디오
└── dist/                    npm run dist 빌드 결과 (.gitignore)
    ├── 거북이코치/
    │   ├── 00_먼저_실행하기/
    │   │   └── 실행하기.cmd
    │   ├── 00_실행하기.cmd
    │   ├── 거북이코치.exe
    │   ├── 사용법.md
    │   └── (런타임 파일들)
    └── 거북이코치.zip       동료 공유용 (용량은 Electron 버전에 따라 달라짐)
```

---

## 🔬 거북목 검출 원리

MediaPipe Pose 3D 랜드마크의 `z` 좌표 사용:
- `forwardness = mean(shoulder.z) - mean(ear.z)`
- 머리가 카메라에 가까워지면 ear.z가 작아짐 → forwardness 증가
- baseline 자동 학습 후 `delta = forwardness - baseline` 으로 판정
- 진입/탈출 임계 다르게 + 시간 유지로 깜빡임 방지 (히스테리시스)

`z` 좌표는 2D 화면 위치(x, y)보다 거북목 판정에 훨씬 정확합니다.

---

## 🎨 거북이 비디오 교체

본인이 좋아하는 캐릭터/이미지로 바꾸려면:

1. 그린스크린 영상을 만들어서 `src/overlay/assets/turtle.mp4` 자리에 넣기
   - 배경은 순수 초록 (R=0, G=255, B=0 또는 비슷한 형광 초록)
   - 길이 3~10초, mp4 (H.264)
   - 가로 비율 무관 (자동 적용됨)
2. `npm run dist`로 재빌드

크로마키 임계값이 안 맞으면 위 트러블슈팅 참고.

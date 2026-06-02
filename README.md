# 🐢 거북이 코치 (turtle-coach)

웹캠으로 거북목 자세를 감지해서 화면에 큰 거북이를 띄워주는 시스템 트레이 앱.

> "머리 숙이면 → 거북이 등장 → 자세 펴면 → 거북이 사라짐"
> 그게 다예요.

레퍼런스: [Gojaehyeon/turtleman](https://github.com/Gojaehyeon/turtleman) (macOS 원본 — 자세 검출 알고리즘 + WebGL 크로마키 셰이더 차용. Windows 호환 + 시스템 트레이 + PIP 미리보기 추가)

---

## 🚀 실행

### 빌드된 앱으로 실행 (가장 흔한 경우)

탐색기에서 더블클릭:
```
dist\거북이코치\거북이코치.exe
```

### 첫 실행 시

1. Windows Defender **"PC 보호"** 화면 → **추가 정보** → **실행**
2. 트레이(작업표시줄 우하단)에 **주황 거북이 아이콘** 등장
   - 안 보이면 ^ 아이콘 눌러 숨겨진 아이콘 펼치기
   - 항상 보이게 하려면 아이콘을 작업표시줄로 드래그
3. 화면 우하단에 **카메라 미리보기 PIP** 등장 (셀카 영상)
4. 첫 실행만 Windows에서 카메라 권한 요청 → **허용**

> 첫 실행만 인터넷 필요 (MediaPipe Pose 모델 ~5MB CDN 다운로드 → 이후 캐시됨)

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

## 🛠 직접 빌드하기 (개발자용)

### 처음 한 번

```powershell
cd turtle-coach-app
npm install
node build-icons.js   # tray-icon.png, app-icon.png 생성 (의존성 없이 순수 Node로 PNG 생성)
```

### 실행 / 빌드

```powershell
npm start              # 코드 수정 후 바로 실행 (개발)
npm run make           # out/turtle-coach-win32-x64/ 빌드 (raw)
npm run dist           # dist/거북이코치/거북이코치.exe + dist/거북이코치.zip (배포용)
```

`npm run dist`는 빌드 결과를 한국어 폴더명으로 정리하고 zip까지 생성합니다. 동료에게 줄 때 zip 그대로 슬랙 드래그하면 끝.

---

## 🐛 트러블슈팅

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
[src/overlay/overlay.js:10-14](src/overlay/overlay.js#L10-L14)의 `TUNING`:
- 초록 안 지워짐: `threshold: 0.10 → 0.05`
- 거북이 본체 파먹힘: `threshold: 0.10 → 0.15`
- 톱니 자글거림: `softness: 0.18 → 0.30`

### 거북이가 세로/가로로 늘어남
원본 비율은 [src/overlay/overlay.js:131-136](src/overlay/overlay.js#L131-L136)에서 비디오 메타데이터 읽어서 자동 적용됩니다. 만약 다른 비디오로 바꿨는데 안 맞으면 비디오 코덱 호환성 의심 (mp4 H.264 권장).

### 카메라가 안 잡혀요
- Windows 설정 → 개인정보 보호 및 보안 → 카메라
  - "앱이 카메라에 액세스하도록 허용" ON
  - "데스크톱 앱이 카메라에 액세스하도록 허용" ON
- Teams/Zoom 등이 카메라 점유 중이면 닫고 재시도

### .exe가 실행이 안 돼요
- **폴더 통째로 옮겨야 동작합니다.** `거북이코치.exe` 파일 하나만 복사하면 X (옆에 있는 .dll, .pak, .mp4 파일들이 필요)
- 동료에게 줄 때는 `dist/거북이코치.zip` 통째로

### 트레이 아이콘이 종료 후에도 남아있어요
이미 수정됨 ([main.js:206-226](main.js#L206-L226) `quitApp()`). 그래도 남으면 작업관리자에서 `거북이코치.exe` 또는 `turtle-coach.exe` 프로세스 종료.

---

## 📁 폴더 구조

```
turtle-coach-app/
├── README.md                ← 지금 이 파일
├── package.json             scripts: start / make / dist
├── main.js                  Electron 메인 (트레이 + 윈도우 + IPC)
├── build-icons.js           트레이 아이콘 PNG 생성 (의존성 X)
├── tray-icon.png, app-icon.png   build-icons.js로 생성됨
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
    │   ├── 거북이코치.exe
    │   ├── 사용법.md
    │   └── (런타임 파일들)
    └── 거북이코치.zip       동료 공유용 (~106MB)
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

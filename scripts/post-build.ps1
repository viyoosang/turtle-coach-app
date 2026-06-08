# 빌드 결과를 사용자 친화적으로 정리.
#   out/turtle-coach-win32-x64/turtle-coach.exe
#     ↓
#   dist/거북이코치/거북이코치.exe   ← 더블클릭 한 번이면 됨
#   dist/거북이코치.zip               ← 슬랙/이메일 공유용

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

$root  = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'out\turtle-coach-win32-x64'
$dist  = Join-Path $root 'dist'
$folder = Join-Path $dist '거북이코치'
$zip   = Join-Path $dist '거북이코치.zip'

if (-not (Test-Path $source)) {
  Write-Error "빌드 결과 폴더가 없어요: $source. 먼저 npm run make 를 실행하세요."
}

# dist 폴더 초기화
if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
New-Item -ItemType Directory -Path $dist | Out-Null

# 1) 빌드 결과 이동 + 폴더명 한국어로
Move-Item -Path $source -Destination $folder

# 2) .exe 이름도 한국어로
Rename-Item -Path (Join-Path $folder 'turtle-coach.exe') -NewName '거북이코치.exe'

# 3) README 함께 두기
$readme = Join-Path $root 'README.md'
if (Test-Path $readme) {
  Copy-Item -Path $readme -Destination (Join-Path $folder '사용법.md')
}

# 4) 실행 런처 함께 두기
$launcher = Join-Path $root '00_실행하기.cmd'
if (Test-Path $launcher) {
  Copy-Item -Path $launcher -Destination (Join-Path $folder '00_실행하기.cmd')
}

$launcherFolder = Join-Path $root '00_먼저_실행하기'
if (Test-Path $launcherFolder) {
  Copy-Item -Path $launcherFolder -Destination (Join-Path $folder '00_먼저_실행하기') -Recurse -Force
}

# 5) zip 만들기 (동료 공유용)
Compress-Archive -Path $folder -DestinationPath $zip -Force

# 6) 빌드 임시 폴더 정리
if (Test-Path (Join-Path $root 'out')) {
  Remove-Item -Recurse -Force (Join-Path $root 'out')
}

# 결과 안내
$exeSize  = [math]::Round((Get-Item (Join-Path $folder '거북이코치.exe')).Length / 1MB, 1)
$zipSize  = [math]::Round((Get-Item $zip).Length / 1MB, 1)

Write-Host ''
Write-Host '✓ 빌드 완료' -ForegroundColor Green
Write-Host ''
Write-Host '  본인 실행 :' (Join-Path $folder '거북이코치.exe') "($exeSize MB)"
Write-Host '  동료 공유 :' $zip "($zipSize MB)"
Write-Host ''
Write-Host '  팁: 거북이코치.exe 우클릭 → 바로 가기 만들기 → 바탕화면으로 끌어다 놓으면 매일 한 번 클릭으로 실행!'
Write-Host ''

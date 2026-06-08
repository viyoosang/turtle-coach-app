@echo off
setlocal
chcp 65001 >nul

set "ROOT=%~dp0"
set "LOCAL_EXE=%ROOT%거북이코치.exe"
set "DIST_EXE=%ROOT%dist\거북이코치\거북이코치.exe"

if exist "%LOCAL_EXE%" (
  start "" "%LOCAL_EXE%"
  exit /b 0
)

if exist "%DIST_EXE%" (
  start "" "%DIST_EXE%"
  exit /b 0
)

echo.
echo [거북이 코치] 실습용 저장소입니다.
echo.
echo 명령어를 외울 필요 없습니다.
echo Claude Code에게 아래 한 줄을 그대로 말해 주세요.
echo.
echo   CLAUDE.md 읽고 설치부터 실행까지 해줘.
echo.
pause

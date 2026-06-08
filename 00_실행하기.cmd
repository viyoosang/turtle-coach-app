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
echo [거북이 코치] 실행 파일을 아직 찾지 못했습니다.
echo.
echo GitHub에서 받은 실습용 저장소라면 명령어를 직접 외울 필요 없습니다.
echo Claude Code에게 아래처럼 말해 주세요.
echo.
echo   CLAUDE.md 읽고 설치부터 실행까지 해줘.
echo.
echo 이미 빌드했다면 아래 파일이 있는지 확인해 주세요.
echo.
echo   dist\거북이코치\거북이코치.exe
echo.
pause

@echo off
setlocal
rem Comma-separated names to exclude from zip (folder name is added automatically)
set "IGNORE=devUI,.git,zip.cmd,AGENTS.md,.cursorrules"
set "CUR=%~dp0"
set "CUR=%CUR:~0,-1%"
for %%I in ("%CUR%") do set "FOLDERNAME=%%~nxI"
for %%I in ("%CUR%\..") do set "PARENT=%%~fI"
set "INNERDIR=%CUR%\%FOLDERNAME%\%FOLDERNAME%"
set "ZIPINNER=%INNERDIR%\%FOLDERNAME%.zip"

powershell -NoProfile -Command ^
  "$zipDest = Join-Path '%CUR%' ('%FOLDERNAME%_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.zip'); " ^
  "if (-not (Test-Path '%INNERDIR%')) { New-Item -ItemType Directory -Path '%INNERDIR%' -Force | Out-Null }; " ^
  "$ignoreList = '%IGNORE%'.Split(','); $ignoreList += '%FOLDERNAME%'; $items = Get-ChildItem -LiteralPath '%CUR%' -Force | Where-Object { $ignoreList -notcontains $_.Name -and $_.FullName -notlike '*\.git*' -and $_.Extension -ne '.zip' }; " ^
  "Compress-Archive -Path ($items.FullName) -DestinationPath '%ZIPINNER%' -Force; " ^
  "Move-Item -LiteralPath '%ZIPINNER%' -Destination $zipDest -Force; " ^
  "Remove-Item -LiteralPath '%CUR%\%FOLDERNAME%' -Recurse -Force; " ^
  "Write-Host Created: $zipDest"
endlocal

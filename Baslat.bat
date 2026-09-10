@echo off
chcp 65001 >nul
title Uzun Hikaye - Menu Onizleme
cd /d "%~dp0"

set PORT=8080

echo.
echo   Uzun Hikaye - menu onizleme
echo   ---------------------------

rem Menuyu tarayicida acmak icin kucuk bir yerel sunucu gerekir.
rem Dosyaya cift tiklayarak acmak (file://) calismaz: tarayici
rem guvenlik politikasi menu.json'u okumayi engeller.

where python >nul 2>&1 && (
  echo   Sunucu: python  ^| Adres: http://localhost:%PORT%
  echo   Kapatmak icin bu pencereyi kapatin.
  echo.
  start "" "http://localhost:%PORT%/index.html"
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

where py >nul 2>&1 && (
  echo   Sunucu: py      ^| Adres: http://localhost:%PORT%
  echo   Kapatmak icin bu pencereyi kapatin.
  echo.
  start "" "http://localhost:%PORT%/index.html"
  py -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

where npx >nul 2>&1 && (
  echo   Sunucu: npx serve
  echo   Kapatmak icin bu pencereyi kapatin.
  echo.
  npx --yes serve . -l %PORT%
  goto :eof
)

echo   Python veya Node.js bulunamadi.
echo.
echo   Ikisinden birini kurun:
echo     Python  : https://www.python.org/downloads/
echo     Node.js : https://nodejs.org/
echo.
echo   Not: Siteyi Netlify/Vercel'e yukledikten sonra bu adima
echo   gerek kalmaz, menu dogrudan calisir.
echo.
pause

@echo off
REM Double-click launcher: starts a local HTTP server (loopback only) and
REM opens lifecycle.html in the default browser. Required because opening
REM lifecycle.html directly via file:// blocks fetch() for the search index.
cd /d "%~dp0"

start "" "http://127.0.0.1:8765/lifecycle.html"

echo Starting local server at http://127.0.0.1:8765/ ...
echo Close this window to stop the server.
python -m http.server 8765 --bind 127.0.0.1

pause

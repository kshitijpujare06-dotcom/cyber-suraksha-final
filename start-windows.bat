@echo off
cd /d "%~dp0backend"
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
echo Starting Cyber Suraksha...
npm start

const fs = require('fs');
const { spawn } = require('child_process');

const envFile = fs.readFileSync('msvc_env.txt', 'utf8');
const env = { ...process.env };
for (const line of envFile.split('\n')) {
  if (line.includes('=')) {
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    // Exclude PROMPT etc., keep important ones
    if (['PATH', 'INCLUDE', 'LIB', 'LIBPATH', 'VSCMD_ARG_app_plat'].includes(key) || key.startsWith('VC') || key.startsWith('WindowsSDK')) {
      env[key] = val;
    }
  }
}

// Kill existing vite
try { require('child_process').execSync('taskkill /F /PID 26116'); } catch (e) {}

console.log("Starting npm run tauri dev...");
const child = spawn('npm.cmd', ['run', 'tauri', 'dev'], { 
  env, 
  stdio: 'inherit',
  cwd: process.cwd()
});

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'frontend', 'dist');
const dest = path.join(__dirname, 'backend', 'public');

try {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log('Build files copied successfully to backend/public.');
} catch (err) {
  console.error('Error copying build files:', err);
  process.exit(1);
}

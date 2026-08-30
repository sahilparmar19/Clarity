const fs = require('fs');
// Very basic 1x1 transparent GIF file structure
const emptyGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
fs.writeFileSync('src-tauri/icons/icon.ico', emptyGif);
fs.writeFileSync('src-tauri/icons/32x32.png', emptyGif);
fs.writeFileSync('src-tauri/icons/128x128.png', emptyGif);
fs.writeFileSync('src-tauri/icons/128x128@2x.png', emptyGif);
fs.writeFileSync('src-tauri/icons/icon.icns', emptyGif);

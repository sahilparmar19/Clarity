const fs = require('fs');
// Simple ICO file (16x16, 1 bit per pixel) representing an empty icon to appease tauri-build
const icoHeader = Buffer.from([
  0,0, 1,0, 1,0,  // idReserved, idType, idCount
  16, 16, 0, 0, 1,0, 1,0,  // bWidth, bHeight, bColorCount, bReserved, wPlanes, wBitCount
  0,0,0,0,  22,0,0,0  // dwBytesInRes, dwImageOffset
]);
// 32x32 transparent PNG
const png = Buffer.from('89504E470D0A1A0A0000000D4948445200000020000000200806000000737A7AF4000000017352474200AECE1CE90000000467414D410000B18F0BFC6105000000097048597300000B1300000B1301009A9C180000001B494441545847EDC101010000008220FF73110A0000000010040182E401B20000000049454E44AE426082', 'hex');

fs.writeFileSync('src-tauri/icons/icon.ico', icoHeader);
fs.writeFileSync('src-tauri/icons/32x32.png', png);
fs.writeFileSync('src-tauri/icons/128x128.png', png);
fs.writeFileSync('src-tauri/icons/128x128@2x.png', png);
fs.writeFileSync('src-tauri/icons/icon.icns', Buffer.from('icns'));

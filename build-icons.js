// 아이콘 파일이 준비되어 있는지 확인하는 작은 도우미.
// 앱/트레이 아이콘은 app-icon.png 원본에서 만든 정적 파일로 관리한다.

const fs = require('fs');
const path = require('path');

const ICONS = [
  { file: 'app-icon.png', kind: 'png' },
  { file: 'app-icon.ico', kind: 'ico' },
  { file: 'tray-icon.png', kind: 'png' },
  { file: 'tray-icon@2x.png', kind: 'png' }
];

function readPngSize(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('PNG 파일이 아닙니다.');
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20)
  };
}

function readIcoCount(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) {
    throw new Error('ICO 파일이 아닙니다.');
  }
  return buf.readUInt16LE(4);
}

for (const icon of ICONS) {
  const filePath = path.join(__dirname, icon.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`아이콘 파일이 없습니다: ${icon.file}`);
  }

  const size = fs.statSync(filePath).size;
  if (icon.kind === 'png') {
    const { width, height } = readPngSize(filePath);
    console.log(`✓ ${icon.file} (${width}x${height}, ${size} bytes)`);
  } else {
    const count = readIcoCount(filePath);
    console.log(`✓ ${icon.file} (${count} images, ${size} bytes)`);
  }
}

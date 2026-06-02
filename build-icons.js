// 트레이 아이콘(PNG)을 외부 의존성 없이 만든다.
// 실행: node build-icons.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePng(W, H, paint) {
  const raw = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const [r, g, b, a] = paint(x, y);
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }
  const filtered = Buffer.alloc(H * (W * 4 + 1));
  for (let y = 0; y < H; y++) {
    filtered[y * (W * 4 + 1)] = 0;
    raw.copy(filtered, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(filtered);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// 거북이 풍의 아이콘 — 둥근 등껍질(주황) + 머리(녹색) + 작은 점
function paintTurtle(size) {
  const cx = size / 2;
  const cy = size * 0.58;
  const shellR = size * 0.36;
  const headR = size * 0.18;
  const headCx = cx;
  const headCy = size * 0.22;
  return (x, y) => {
    // 머리(녹색)
    const dhx = x + 0.5 - headCx;
    const dhy = y + 0.5 - headCy;
    if (dhx * dhx + dhy * dhy <= headR * headR) {
      return [0x66, 0xBB, 0x6A, 0xFF];
    }
    // 등껍질 외곽
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 <= shellR * shellR) {
      // 등껍질 패턴 (가운데 진한 주황, 가장자리 어두움)
      const r = Math.sqrt(d2) / shellR;
      const base = r < 0.5
        ? [0xFB, 0x8C, 0x00] // 진한 주황
        : [0xE6, 0x5C, 0x00]; // 어두운 주황
      return [...base, 0xFF];
    }
    return [0, 0, 0, 0];
  };
}

function writeIcon(filename, size) {
  const png = makePng(size, size, paintTurtle(size));
  fs.writeFileSync(path.join(__dirname, filename), png);
  console.log(`✓ ${filename} (${size}x${size}, ${png.length} bytes)`);
}

writeIcon('tray-icon.png', 32);
writeIcon('tray-icon@2x.png', 64);
writeIcon('app-icon.png', 256);

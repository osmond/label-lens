// Generates label-lens app icons as PNG using raw PNG encoding
// Icon concept: blue rounded square, white magnifier lens over 3 ingredient lines

import { createWriteStream } from "fs";
import zlib from "zlib";

function writePNG(path, size) {
  const bg = { r: 59, g: 91, b: 219 }; // brand-500 #3B5BDB
  const data = new Uint8Array(size * size * 4);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.195;        // lens outer radius
  const stroke = size * 0.055;   // lens ring stroke width
  const lineW = size * 0.22;     // ingredient line half-width
  const lineH = size * 0.032;    // line height (rounded)
  const lineGap = size * 0.092;  // gap between lines
  const cornerR = size * 0.22;   // bg rounded corner radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;

      // Rounded square background (iOS icon shape)
      const inRoundedSquare =
        x >= cornerR && x <= size - cornerR && y >= 0 && y <= size ||
        x >= 0 && x <= size && y >= cornerR && y <= size - cornerR ||
        Math.hypot(x - cornerR, y - cornerR) <= cornerR ||
        Math.hypot(x - (size - cornerR), y - cornerR) <= cornerR ||
        Math.hypot(x - cornerR, y - (size - cornerR)) <= cornerR ||
        Math.hypot(x - (size - cornerR), y - (size - cornerR)) <= cornerR;

      if (!inRoundedSquare) {
        data[i + 3] = 0;
        continue;
      }

      // Background
      data[i] = bg.r; data[i+1] = bg.g; data[i+2] = bg.b; data[i+3] = 255;

      // Lens ring (annulus)
      const dist = Math.hypot(dx, dy);
      const inRing = dist >= r - stroke && dist <= r + stroke;

      // Three ingredient lines (small rounded rects, centered below lens center)
      const lineOffsets = [-lineGap, 0, lineGap];
      const lx = lineW * 0.55; // lines slightly left of center
      let inLine = false;
      for (const off of lineOffsets) {
        const ldy = dy - off;
        const ldx = dx + lx * 0.1;
        if (Math.abs(ldx) <= lineW && Math.abs(ldy) <= lineH) {
          // fade ends for rounded feel
          const edgeFade = Math.max(0, (lineW - Math.abs(ldx)) / (lineH * 1.5));
          if (edgeFade > 0.15) inLine = true;
        }
      }

      if (inRing || inLine) {
        data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255;
      }
    }
  }

  // Pack into PNG
  const chunks = [];

  function crc32(buf) {
    let c = 0xffffffff;
    for (const b of buf) {
      c ^= b;
      for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const t = Buffer.from(type);
    const d = Buffer.from(data);
    const len = Buffer.alloc(4); len.writeUInt32BE(d.length);
    const crcData = Buffer.concat([t, d]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, t, d, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  chunks.push(chunk("IHDR", ihdr));

  // IDAT - raw scanlines with filter byte
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = y * (size * 4 + 1) + 1 + x * 4;
      raw[dst] = data[src]; raw[dst+1] = data[src+1];
      raw[dst+2] = data[src+2]; raw[dst+3] = data[src+3];
    }
  }
  chunks.push(chunk("IDAT", zlib.deflateSync(raw)));
  chunks.push(chunk("IEND", Buffer.alloc(0)));

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ws = createWriteStream(path);
  ws.write(sig);
  for (const c of chunks) ws.write(c);
  ws.end();
  console.log(`Written ${path} (${size}x${size})`);
}

writePNG("public/icon-192.png", 192);
writePNG("public/icon-512.png", 512);

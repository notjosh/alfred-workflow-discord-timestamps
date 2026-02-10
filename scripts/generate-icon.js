import { createWriteStream } from "node:fs";
import { deflateSync } from "node:zlib";

const SIZE = 256;
const BLURPLE = [88, 101, 242];
const WHITE = [255, 255, 255];
const BORDER = [70, 80, 200];

const pixels = Buffer.alloc(SIZE * SIZE * 4);

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const idx = (y * SIZE + x) * 4;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 110) {
      // Fill with blurple
      pixels[idx] = BLURPLE[0];
      pixels[idx + 1] = BLURPLE[1];
      pixels[idx + 2] = BLURPLE[2];
      pixels[idx + 3] = 255;

      // Clock hour hand (pointing to ~2 o'clock)
      const hx = dx * 0.866 + dy * 0.5; // rotate -30deg
      if (Math.abs(hx) < 5 && dy < 0 && dist < 55 && dist > 8) {
        pixels[idx] = WHITE[0];
        pixels[idx + 1] = WHITE[1];
        pixels[idx + 2] = WHITE[2];
      }

      // Clock minute hand (pointing to 12)
      if (Math.abs(dx) < 4 && dy < 0 && dist < 75 && dist > 8) {
        pixels[idx] = WHITE[0];
        pixels[idx + 1] = WHITE[1];
        pixels[idx + 2] = WHITE[2];
      }

      // Center dot
      if (dist < 10) {
        pixels[idx] = WHITE[0];
        pixels[idx + 1] = WHITE[1];
        pixels[idx + 2] = WHITE[2];
      }
    } else if (dist < 116) {
      // Anti-aliased border
      const alpha = Math.max(0, Math.min(255, (116 - dist) * 42));
      pixels[idx] = BORDER[0];
      pixels[idx + 1] = BORDER[1];
      pixels[idx + 2] = BORDER[2];
      pixels[idx + 3] = Math.round(alpha);
    } else {
      pixels[idx + 3] = 0; // transparent
    }
  }
}

// Encode as PNG
function createPng(width, height, rgba) {
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crc32Table[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  const crc32Table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc32Table[n] = c;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData));
    return Buffer.concat([len, typeAndData, crc]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    rawRows.push(Buffer.from([0])); // filter: none
    rawRows.push(rgba.subarray(y * width * 4, (y + 1) * width * 4));
  }
  const raw = Buffer.concat(rawRows);
  const compressed = deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const png = createPng(SIZE, SIZE, pixels);
const out = createWriteStream(new URL("../icon.png", import.meta.url));
out.write(png);
out.end();
console.log(`Created icon.png (${png.length} bytes)`);

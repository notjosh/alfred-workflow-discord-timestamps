import { mkdir } from "node:fs/promises";
import sharp from "sharp";

// Fluent Flat-inspired clock face, adapted for Discord blurple.
// ViewBox 32×32 (matching Microsoft Fluent Emoji proportions).
// Bezel ring, white face, blurple minute hand, dark hour hand, center hub.

const BLURPLE = "#5865F2";
const BLURPLE_DARK = "#4752C4";
const FACE = "#FFFFFF";
const HOUR_HAND = "#23272A";
const CENTER_HUB = "#5865F2";

function clockSvg(hour, minute) {
  // Angles in degrees, 0 = 12 o'clock, clockwise
  const minuteAngle = (minute / 60) * 360;
  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <!-- Face -->
  <circle cx="16" cy="16" r="12" fill="${FACE}"/>

  <!-- Hour ticks -->
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 360;
    return `<line x1="16" y1="5.5" x2="16" y2="7" stroke="#B8B8B8" stroke-width="0.8" stroke-linecap="round" transform="rotate(${a} 16 16)"/>`;
  }).join("\n  ")}

  <!-- Hour hand (short, thick, dark) -->
  <line x1="16" y1="16" x2="16" y2="9" stroke="${HOUR_HAND}" stroke-width="2" stroke-linecap="round" transform="rotate(${hourAngle} 16 16)"/>

  <!-- Minute hand (long, thinner, blurple) -->
  <line x1="16" y1="16" x2="16" y2="6.5" stroke="${BLURPLE}" stroke-width="1.8" stroke-linecap="round" transform="rotate(${minuteAngle} 16 16)"/>

  <!-- Center hub -->
  <circle cx="16" cy="16" r="1.5" fill="${CENTER_HUB}"/>

  <!-- Bezel ring -->
  <circle cx="16" cy="16" r="13.5" fill="none" stroke="${BLURPLE}" stroke-width="3"/>

  <!-- Inner bezel highlight (subtle) -->
  <circle cx="16" cy="16" r="12" fill="none" stroke="${BLURPLE_DARK}" stroke-width="0.3" opacity="0.3"/>
</svg>`;
}

const outDir = new URL("../icons/", import.meta.url);
await mkdir(outDir, { recursive: true });

let totalBytes = 0;
let count = 0;

for (let h = 0; h < 12; h++) {
  for (let m = 0; m < 60; m += 5) {
    const name = `clock-${String(h).padStart(2, "0")}-${String(m).padStart(2, "0")}.png`;
    const svg = clockSvg(h, m);
    const png = await sharp(Buffer.from(svg)).resize(64, 64).png().toBuffer();
    await sharp(png).toFile(new URL(name, outDir).pathname);
    totalBytes += png.length;
    count++;
  }
}

// Also generate the main workflow icon (256×256) at a fixed time
const iconSvg = clockSvg(10, 10);
await sharp(Buffer.from(iconSvg))
  .resize(256, 256)
  .png()
  .toFile(new URL("../icon.png", import.meta.url).pathname);

console.log(
  `Generated ${count} icons (${(totalBytes / 1024).toFixed(1)} KB total) + icon.png`,
);

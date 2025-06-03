// src/svgGenerator.ts
import { TokenTx } from "./fetchTransactions";
import { CANVAS_SIZE, BLOCK_SIZE, ROTATION_ANGLES, TINT_OPACITY } from "./constants";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

const GRID_COUNT = CANVAS_SIZE / BLOCK_SIZE;

export function generateSvg(txs: TokenTx[]): string {
  let svg = `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `<rect width="100%" height="100%" fill="white" />\n`;

  for (const tx of txs) {
    const srcX = randInt(0, GRID_COUNT) * BLOCK_SIZE;
    const srcY = randInt(0, GRID_COUNT) * BLOCK_SIZE;
    const angle = ROTATION_ANGLES[randInt(0, ROTATION_ANGLES.length)];
    const tintColor = tx.isBuy ? "green" : "red";

    svg += `<rect x="${srcX}" y="${srcY}" width="${BLOCK_SIZE}" height="${BLOCK_SIZE}" `;
    svg += `fill="${tintColor}" fill-opacity="${TINT_OPACITY}" `;
    svg += `transform="rotate(${angle}, ${srcX + BLOCK_SIZE / 2}, ${srcY + BLOCK_SIZE / 2})" />\n`;
  }

  svg += `</svg>`;
  return svg;
}

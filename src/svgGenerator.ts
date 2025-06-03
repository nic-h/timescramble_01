// src/svgGenerator.ts - GRID-SNAPPED WITH VARIED SIZES
import * as fs from "fs";
import * as path from "path";
import { TokenTx } from "./fetchTransactions";
import { CANVAS_SIZE, BLOCK_SIZE } from "./constants";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Snap to 16px grid
function snapToGrid(coord: number, gridSize: number = 16): number {
  return Math.floor(coord / gridSize) * gridSize;
}

const ROTATIONS = [90, 180, 270];

const bgImagePath = path.join(__dirname, "..", "src", "constants-bg-url.txt");
const bgImageBase64 = fs.readFileSync(bgImagePath, "utf8").trim();

function isOverlapping(x: number, y: number, size: number, usedPositions: Array<{x: number, y: number, size: number}>): boolean {
  return usedPositions.some(pos => 
    x < pos.x + pos.size && x + size > pos.x &&
    y < pos.y + pos.size && y + size > pos.y
  );
}

export function generateSvg(txs: TokenTx[]): string {
  let svg = `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" xmlns="http://www.w3.org/2000/svg">\n`;
  
  svg += `<defs>\n`;
  
  let clipId = 0;
  const moveData: Array<{srcX: number, srcY: number, destX: number, destY: number, size: number, angle: number}> = [];
  const usedPositions: Array<{x: number, y: number, size: number}> = [];
  
  // Generate move data for each transaction
  for (const tx of txs) {
    const txAmount = parseFloat(tx.amount);
    
    if (txAmount < 500) {
      // TINY TRADE: 3-5 tiny blocks (16px)
      const numBlocks = randInt(3, 6);
      for (let i = 0; i < numBlocks; i++) {
        const srcX = snapToGrid(randInt(0, CANVAS_SIZE - BLOCK_SIZE));
        const srcY = snapToGrid(randInt(0, CANVAS_SIZE - BLOCK_SIZE));
        
        // Find non-overlapping destination
        let destX, destY;
        let attempts = 0;
        do {
          destX = snapToGrid(randInt(0, CANVAS_SIZE - BLOCK_SIZE));
          destY = snapToGrid(randInt(0, CANVAS_SIZE - BLOCK_SIZE));
          attempts++;
        } while (isOverlapping(destX, destY, BLOCK_SIZE, usedPositions) && attempts < 50);
        
        if (attempts < 50) {
          const angle = ROTATIONS[randInt(0, ROTATIONS.length)];
          
          svg += `<clipPath id="clip${clipId}">`;
          svg += `<rect x="${destX}" y="${destY}" width="${BLOCK_SIZE}" height="${BLOCK_SIZE}" />`;
          svg += `</clipPath>\n`;
          
          moveData.push({srcX, srcY, destX, destY, size: BLOCK_SIZE, angle});
          usedPositions.push({x: destX, y: destY, size: BLOCK_SIZE});
          clipId++;
        }
      }
    } else if (txAmount < 5000) {
      // MEDIUM TRADE: 2-3 medium blocks (32px)
      const blockSize = 32;
      const numBlocks = randInt(2, 4);
      
      for (let i = 0; i < numBlocks; i++) {
        const srcX = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
        const srcY = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
        
        let destX, destY;
        let attempts = 0;
        do {
          destX = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
          destY = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
          attempts++;
        } while (isOverlapping(destX, destY, blockSize, usedPositions) && attempts < 50);
        
        if (attempts < 50) {
          const angle = ROTATIONS[randInt(0, ROTATIONS.length)];
          
          svg += `<clipPath id="clip${clipId}">`;
          svg += `<rect x="${destX}" y="${destY}" width="${blockSize}" height="${blockSize}" />`;
          svg += `</clipPath>\n`;
          
          moveData.push({srcX, srcY, destX, destY, size: blockSize, angle});
          usedPositions.push({x: destX, y: destY, size: blockSize});
          clipId++;
        }
      }
    } else {
      // BIG TRADE: 1-2 large blocks (64-128px, grid-snapped)
      const blockSize = snapToGrid(Math.min(128, Math.max(64, Math.log10(txAmount) * 20)));
      const numBlocks = randInt(1, 3);
      
      for (let i = 0; i < numBlocks; i++) {
        const srcX = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
        const srcY = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
        
        let destX, destY;
        let attempts = 0;
        do {
          destX = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
          destY = snapToGrid(randInt(0, CANVAS_SIZE - blockSize));
          attempts++;
        } while (isOverlapping(destX, destY, blockSize, usedPositions) && attempts < 50);
        
        if (attempts < 50) {
          const angle = ROTATIONS[randInt(0, ROTATIONS.length)];
          
          svg += `<clipPath id="clip${clipId}">`;
          svg += `<rect x="${destX}" y="${destY}" width="${blockSize}" height="${blockSize}" />`;
          svg += `</clipPath>\n`;
          
          moveData.push({srcX, srcY, destX, destY, size: blockSize, angle});
          usedPositions.push({x: destX, y: destY, size: blockSize});
          clipId++;
        }
      }
    }
  }
  
  svg += `</defs>\n`;
  
  // Add background image
  svg += `<image href="${bgImageBase64}" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" />\n`;
  
  // Add the moved pieces
  clipId = 0;
  for (const move of moveData) {
    const offsetX = move.destX - move.srcX;
    const offsetY = move.destY - move.srcY;
    
    svg += `<image href="${bgImageBase64}" `;
    svg += `x="${offsetX}" y="${offsetY}" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" `;
    svg += `clip-path="url(#clip${clipId})" `;
    svg += `transform="rotate(${move.angle}, ${move.destX + move.size/2}, ${move.destY + move.size/2})" />\n`;
    clipId++;
  }
  
  svg += `</svg>`;
  return svg;
}
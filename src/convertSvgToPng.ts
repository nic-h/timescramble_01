// src/convertSvgToPng.ts - Cairo version
import * as fs from "fs";
import * as path from "path";
import { createCanvas, loadImage } from "canvas";

export async function convertSvgToPng(
  svgString: string,
  outputName: string
): Promise<string> {
  // Extract width/height from SVG
  const widthMatch = svgString.match(/width="(\d+)"/);
  const heightMatch = svgString.match(/height="(\d+)"/);
  
  const width = widthMatch ? parseInt(widthMatch[1]) : 512;
  const height = heightMatch ? parseInt(heightMatch[1]) : 512;

  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Convert SVG string to data URL
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
  
  try {
    // Load SVG as image and draw to canvas
    const img = await loadImage(svgDataUrl);
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png');
    
    // Save to file
    const pngTempPath = path.join(__dirname, `${outputName}.png`);
    fs.writeFileSync(pngTempPath, pngBuffer);
    
    return pngTempPath;
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    throw error;
  }
}
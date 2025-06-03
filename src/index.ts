// src/index.ts - MORE VARIED TRADE SIZES
import * as fs from "fs";
import * as path from "path";
import { fetchTransactions, TokenTx } from "./fetchTransactions";
import { generateSvg } from "./svgGenerator";
import { convertSvgToPng } from "./convertSvgToPng";
import { uploadPngToIpfs, uploadJsonToIpfs } from "./ipfsUploader";
import { CANVAS_SIZE } from "./constants";

async function main() {
  // 50 DUMMY TRANSACTIONS WITH MORE VARIETY
  const dummyTxs: TokenTx[] = [];
  for (let i = 0; i < 50; i++) {
    let amount: string;
    const rand = Math.random();
    
    if (rand < 0.4) {
      // 40% tiny trades (< 500)
      amount = (Math.random() * 500).toString();
    } else if (rand < 0.7) {
      // 30% medium trades (500-5000)
      amount = (500 + Math.random() * 4500).toString();
    } else {
      // 30% big trades (5000+)
      amount = (5000 + Math.random() * 50000).toString();
    }
    
    dummyTxs.push({
      from: `0x${i.toString().padStart(40, '0')}` as `0x${string}`,
      to: `0x${(i+100).toString().padStart(40, '0')}` as `0x${string}`,
      tokenId: `test${i}`,
      txHash: `0x${i.toString().padStart(62, '0')}abc` as `0x${string}`,
      blockNumber: 123 + i,
      amount: amount,
      isBuy: Math.random() > 0.5
    });
  }

  console.log(`Using ${dummyTxs.length} dummy transactions for testing.`);

  // 2) Generate SVG
  const svgString = generateSvg(dummyTxs);
  const svgOutputPath = path.join(__dirname, "output.svg");
  fs.writeFileSync(svgOutputPath, svgString, "utf8");
  console.log("SVG generated:", svgOutputPath);

  // 3) Convert SVG → PNG
  const pngPath = await convertSvgToPng(svgString, "output");
  console.log("PNG generated:", pngPath);

  // 4) Pin PNG to IPFS
  const imageUri = await uploadPngToIpfs(pngPath);
  console.log("PNG pinned to IPFS:", imageUri);

  // 5) Build metadata JSON
  const metadata = {
    name: "Dynamic Zora Coin Snapshot",
    description: "Auto-generated snapshot based on latest transfers",
    image: imageUri,
    attributes: [
      { trait_type: "Canvas Size", value: CANVAS_SIZE },
      { trait_type: "Transaction Count", value: dummyTxs.length },
    ],
  };

  // 6) Pin metadata JSON to IPFS
  const metadataUri = await uploadJsonToIpfs(metadata);
  console.log("Metadata pinned to IPFS:", metadataUri);

  console.log("✅ Dynamic artwork generated and uploaded to IPFS!");
  console.log("📋 Metadata URI:", metadataUri);
  console.log("🎨 Image URI:", imageUri);
}

main().catch((err) => {
  console.error("Error in main:", err);
  process.exit(1);
});
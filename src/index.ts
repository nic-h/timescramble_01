// src/index.ts - BACK TO REAL TRANSACTIONS
import * as fs from "fs";
import * as path from "path";
import { createServer } from 'http';
import { fetchTransactions, TokenTx } from "./fetchTransactions";
import { generateSvg } from "./svgGenerator";
import { convertSvgToPng } from "./convertSvgToPng";
import { uploadPngToIpfs, uploadJsonToIpfs } from "./ipfsUploader";
import { CANVAS_SIZE } from "./constants";

async function main() {
  // (Optional) Log the last fetched block
  const lastBlockFile = path.join(__dirname, "../data/lastBlock.txt");
  if (fs.existsSync(lastBlockFile)) {
    const last = fs.readFileSync(lastBlockFile, "utf8");
    console.log("Resuming from block:", last);
  }

  // 1) Fetch new transfers - BACK TO REAL DATA
  const tokenTxs: TokenTx[] = await fetchTransactions();
  if (tokenTxs.length === 0) {
    console.log("No new transfers detected.");
    return;
  }
  console.log(`Fetched ${tokenTxs.length} new transfers.`);

  // 2) Generate SVG
  const svgString = generateSvg(tokenTxs);
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
      { trait_type: "Transaction Count", value: tokenTxs.length },
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

// Only start server if this is the web service
if (process.env.PORT) {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Timeframe Zora Coin service is running');
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
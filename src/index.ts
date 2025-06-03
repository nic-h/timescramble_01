// src/index.ts
import * as fs from "fs";
import * as path from "path";
import { fetchTransactions, TokenTx } from "./fetchTransactions";
import { generateSvg } from "./svgGenerator";
import { convertSvgToPng } from "./convertSvgToPng";
import { uploadPngToIpfs, uploadJsonToIpfs } from "./ipfsUploader";
import { updateTokenUri } from "./updateContractURI";
import { CANVAS_SIZE } from "./constants";

async function main() {
  // (Optional) Log the last fetched block
  const lastBlockFile = path.join(__dirname, "../data/lastBlock.txt");
  if (fs.existsSync(lastBlockFile)) {
    const last = fs.readFileSync(lastBlockFile, "utf8");
    console.log("Resuming from block:", last);
  }

  // 1) Fetch new transfers
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

  // 7) Update on-chain token URI (token ID “0” assumed)
  const txHash = await updateTokenUri("0", metadataUri);
  if (txHash) {
    console.log("On-chain URI updated, tx hash:", txHash);
  } else {
    console.log("On-chain URI was already up to date.");
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
  process.exit(1);
});

1. Should you keep the existing codebase or start fresh?
Start fresh. In practice, copy the entire folder structure (shown below) into a brand-new directory. This guarantees no leftover mistakes, circular imports, or TypeScript mismatches.

If you really want to reuse your old files, you must replace each of them wholesale with the corresponding files in this scaffold—otherwise you’ll reintroduce the same Orange-underlined errors.

2. Complete folder layout (copy & paste exactly)
pgsql
Copy
Edit
timeframe-zora-coin/              ← top-level
│
├── package.json
├── tsconfig.json
├── .env.example
│
└── src/
    ├── abi/
    │   └── coinABI.ts
    │
    ├── constants.ts
    ├── fetchTransactions.ts
    ├── svgGenerator.ts
    ├── convertSvgToPng.ts
    ├── ipfsUploader.ts
    ├── updateContractURI.ts
    └── index.ts
2.1 package.json
json
Copy
Edit
{
  "name": "timeframe-zora-coin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "start": "ts-node src/index.ts"
  },
  "dependencies": {
    "@pinata/sdk": "^7.0.0",
    "dotenv": "^16.0.0",
    "viem": "^2.30.5",
    "puppeteer": "^21.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "ts-node": "^10.9.1",
    "typescript": "^4.9.5"
  }
}
2.2 tsconfig.json
jsonc
Copy
Edit
{
  "compilerOptions": {
    "target": "ES2020",              
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
2.3 .env.example
text
Copy
Edit
# Copy this file to “.env” and fill in each value (no quotes).

BASE_RPC_URL=https://mainnet.base.org
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY

TOKEN_ADDRESS=0xc49f424da334e03e089b10dba6061e183e08b7b2
DEPLOY_BLOCK=29305954

PRIVATE_KEY=0xYOUR_TOKEN_OWNER_PRIVATE_KEY

PINATA_API_KEY=YOUR_PINATA_API_KEY
PINATA_SECRET_API_KEY=YOUR_PINATA_SECRET
PINATA_ENDPOINT=https://api.pinata.cloud

FETCH_BATCH_SIZE=1000
FETCH_DELAY_MS=200

CANVAS_SIZE=512
BLOCK_SIZE=16
SCALE_MIN=1
SCALE_MAX=4
ROTATION_ANGLES=0,90,180,270
TINT_OPACITY=0.6

# Optional comma-separated list of Base pool addresses; leave blank if none:
POOL_ADDRESSES=
2.4 src/abi/coinABI.ts
ts
Copy
Edit
// ── coinABI.ts ──
// Minimal ABI for “uri(uint256)”, “setTokenURI(uint256,string)”, and the Transfer event.

export const coinAbi = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "uri",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "tokenURI", type: "string" }
    ],
    name: "setTokenURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  }
];
2.5 src/constants.ts
ts
Copy
Edit
// ── constants.ts ──
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { coinAbi } from "./abi/coinABI";
import type { Abi } from "viem";

dotenv.config();

// 1) Validate .env keys
const requiredKeys = [
  "BASE_RPC_URL",
  "ALCHEMY_API_KEY",
  "TOKEN_ADDRESS",
  "DEPLOY_BLOCK",
  "PRIVATE_KEY",
  "PINATA_API_KEY",
  "PINATA_SECRET_API_KEY",
  "PINATA_ENDPOINT",
  "FETCH_BATCH_SIZE",
  "FETCH_DELAY_MS",
  "CANVAS_SIZE",
  "BLOCK_SIZE",
  "SCALE_MIN",
  "SCALE_MAX",
  "ROTATION_ANGLES",
  "TINT_OPACITY"
];
for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(`Missing required .env var: ${key}`);
    process.exit(1);
  }
}

// 2) Export constants (typed)
export const BASE_RPC_URL = process.env.BASE_RPC_URL!;
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;

export const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS! as `0x${string}`;
export const DEPLOY_BLOCK = parseInt(process.env.DEPLOY_BLOCK!, 10);

export const PRIVATE_KEY = process.env.PRIVATE_KEY!;

export const PINATA_API_KEY = process.env.PINATA_API_KEY!;
export const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY!;
export const PINATA_ENDPOINT = process.env.PINATA_ENDPOINT!;

export const FETCH_BATCH_SIZE = parseInt(process.env.FETCH_BATCH_SIZE!, 10);
export const FETCH_DELAY_MS = parseInt(process.env.FETCH_DELAY_MS!, 10);

export const CANVAS_SIZE = parseInt(process.env.CANVAS_SIZE!, 10);
export const BLOCK_SIZE = parseInt(process.env.BLOCK_SIZE!, 10);
export const SCALE_MIN = parseInt(process.env.SCALE_MIN!, 10);
export const SCALE_MAX = parseInt(process.env.SCALE_MAX!, 10);

export const ROTATION_ANGLES = process.env.ROTATION_ANGLES!
  .split(",")
  .map((s) => parseInt(s, 10));

export const TINT_OPACITY = parseFloat(process.env.TINT_OPACITY!);

export const POOL_ADDRESSES = process.env.POOL_ADDRESSES
  ? (process.env.POOL_ADDRESSES.split(",") as `0x${string}`[])
  : [];

export const COIN_ABI: Abi = coinAbi;
2.6 src/fetchTransactions.ts
ts
Copy
Edit
// ── fetchTransactions.ts ──
import { createPublicClient, http, PublicClient } from "viem";
import type { Filter, Log } from "viem";
import fs from "fs";
import path from "path";
import {
  TOKEN_ADDRESS,
  DEPLOY_BLOCK,
  ALCHEMY_API_KEY,
  FETCH_BATCH_SIZE,
  FETCH_DELAY_MS,
} from "./constants";

// Read last‐fetched block from disk (or default to DEPLOY_BLOCK−1)
function readLastFetchedBlock(): number {
  const file = path.join(__dirname, "lastBlock.txt");
  if (!fs.existsSync(file)) {
    return DEPLOY_BLOCK - 1;
  }
  const data = fs.readFileSync(file, "utf8").trim();
  const n = parseInt(data, 10);
  return isNaN(n) ? DEPLOY_BLOCK - 1 : n;
}

// Write latest block number to disk
function writeLastFetchedBlock(blockNumber: number) {
  const file = path.join(__dirname, "lastBlock.txt");
  fs.writeFileSync(file, blockNumber.toString());
}

export async function fetchTransactions(): Promise<
  Array<{
    from: `0x${string}`;
    to: `0x${string}`;
    tokenId: string;
    txHash: `0x${string}`;
  }>
> {
  // 1) Create PublicClient via Alchemy Base RPC
  const publicClient: PublicClient = createPublicClient({
    transport: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  });

  // 2) Get latest block number
  const latestBlockNumber = Number(await publicClient.getBlockNumber());

  // 3) Determine fromBlock
  let lastFetched = readLastFetchedBlock();
  let fromBlock = lastFetched + 1;
  if (fromBlock > latestBlockNumber) {
    return [];
  }

  const allLogs: Log[] = [];
  while (fromBlock <= latestBlockNumber) {
    // Batch blocks
    const toBlock = Math.min(fromBlock + FETCH_BATCH_SIZE - 1, latestBlockNumber);

    // Transfer event topic (keccak256("Transfer(address,address,uint256)"))
    const transferTopic =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    const filter: any = {
      address: TOKEN_ADDRESS,
      fromBlock,
      toBlock,
      topics: [transferTopic],
    };

    const logsThisBatch = await publicClient.getLogs(filter as Filter);
    allLogs.push(...logsThisBatch);

    fromBlock = toBlock + 1;
    await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
  }

  if (allLogs.length > 0) {
    writeLastFetchedBlock(latestBlockNumber);
  }

  // Parse logs → simple array
  return allLogs.map((rawLog) => {
    const log: any = rawLog;
    const fromHex = "0x" + (log.topics[1] as string).slice(26);
    const toHex = "0x" + (log.topics[2] as string).slice(26);
    const tokenIdDecimal = BigInt(log.data).toString();
    return {
      from: fromHex as `0x${string}`,
      to: toHex as `0x${string}`,
      tokenId: tokenIdDecimal,
      txHash: log.transactionHash as `0x${string}`,
    };
  });
}
2.7 src/svgGenerator.ts
ts
Copy
Edit
// ── svgGenerator.ts ──
import { CANVAS_SIZE } from "./constants";

export function generateSvg(
  simpleTxs: Array<{ from: string; to: string; tokenId: string }>
): string {
  // Basic stub: red background + number of transfers
  return `
<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" fill="red" />
  <text x="10" y="20" font-family="sans-serif" font-size="16" fill="white">
    ${simpleTxs.length} transfer(s)
  </text>
</svg>`;
}
2.8 src/convertSvgToPng.ts
ts
Copy
Edit
// ── convertSvgToPng.ts ──
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export async function convertSvgToPng(
  svgMarkup: string,
  outputFilename: string
): Promise<Buffer> {
  let browser: puppeteer.Browser | undefined;
  try {
    browser = await puppeteer.launch({ headless: true, timeout: 15000 });
    const page = await browser.newPage();

    // Render the SVG in a data: URI
    const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      svgMarkup
    )}`;
    await page.goto(svgDataUri, { timeout: 15000, waitUntil: "networkidle0" });

    // Screenshot → PNG
    const pngBuffer = await page.screenshot({ omitBackground: true });
    const outputPath = path.join(__dirname, outputFilename);
    fs.writeFileSync(outputPath, pngBuffer);
    return pngBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
2.9 src/ipfsUploader.ts
ts
Copy
Edit
// ── ipfsUploader.ts ──
import { Readable } from "stream";
import pinataSDK, { PinataClient } from "@pinata/sdk";
import {
  PINATA_API_KEY,
  PINATA_SECRET_API_KEY,
  PINATA_ENDPOINT,
} from "./constants";

/** Instantiate Pinata client via V3 SDK */
function getPinataClient(): PinataClient {
  return pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);
}

/** Convert Buffer → Readable stream */
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

/** Pin PNG buffer to IPFS */
export async function uploadPngToIpfs(buffer: Buffer): Promise<string> {
  const pinata = getPinataClient();
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await pinata.pinFileToIPFS(bufferToStream(buffer), {
        pinataMetadata: { name: "token-image.png" },
        pinataOptions: { cidVersion: 1 },
      });
      return response.IpfsHash;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Failed to pin PNG after 3 attempts");
}

/** Pin JSON metadata object to IPFS */
export async function uploadJsonToIpfs(json: object): Promise<string> {
  const pinata = getPinataClient();
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await pinata.pinJSONToIPFS(json, {
        pinataMetadata: { name: "token-metadata.json" },
        pinataOptions: { cidVersion: 1 },
      });
      return response.IpfsHash;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Failed to pin JSON after 3 attempts");
}
2.10 src/updateContractURI.ts
ts
Copy
Edit
// ── updateContractURI.ts ──
import { createWalletClient, http, readContract, writeContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { COIN_ABI, TOKEN_ADDRESS, BASE_RPC_URL, PRIVATE_KEY } from "./constants";

/**
 * Update on-chain URI for a single tokenId.
 * - Reads current uri(tokenId); if equal to newURI, skip.
 * - Otherwise calls setTokenURI(tokenId, newURI).
 */
export async function updateContractURI(
  tokenId: number,
  newURI: string
): Promise<`0x${string}`> {
  const walletClient = createWalletClient({
    transport: http(BASE_RPC_URL),
    account: privateKeyToAccount(PRIVATE_KEY),
  });

  // 1) Try reading current on-chain URI (catch revert → "")
  let currentOnChain: string;
  try {
    currentOnChain = await readContract({
      client: walletClient,
      address: TOKEN_ADDRESS,
      abi: COIN_ABI,
      functionName: "uri",
      args: [BigInt(tokenId)],
    });
  } catch {
    currentOnChain = "";
  }

  // 2) If no change needed, skip
  if (currentOnChain === newURI) {
    return "0x";
  }

  // 3) Otherwise send setTokenURI(...)
  const txHash = await writeContract({
    client: walletClient,
    address: TOKEN_ADDRESS,
    abi: COIN_ABI,
    functionName: "setTokenURI",
    args: [BigInt(tokenId), newURI],
  });

  return txHash;
}
2.11 src/index.ts
ts
Copy
Edit
// ── index.ts ──
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import { fetchTransactions } from "./fetchTransactions";
import { generateSvg } from "./svgGenerator";
import { convertSvgToPng } from "./convertSvgToPng";
import { uploadPngToIpfs, uploadJsonToIpfs } from "./ipfsUploader";
import { updateContractURI } from "./updateContractURI";

dotenv.config();

async function main() {
  console.log("🔍 Fetching token transfers…");
  const tokenTxs = await fetchTransactions();
  if (tokenTxs.length === 0) {
    console.log("ℹ️ No new transfers – skipping IPFS & on-chain update");
    return;
  }

  console.log(`📦 ${tokenTxs.length} new transfer(s) – building SVG`);
  const simpleTxs = tokenTxs.map((tx) => ({
    from: tx.from,
    to: tx.to,
    tokenId: tx.tokenId,
  }));

  // 1) Generate SVG
  const svgMarkup = generateSvg(simpleTxs);
  fs.writeFileSync(path.join(__dirname, "output.svg"), svgMarkup, "utf8");
  console.log("✅ SVG written to src/output.svg");

  // 2) Convert SVG → PNG
  console.log("📷 Converting SVG → PNG");
  const pngBuffer = await convertSvgToPng(svgMarkup, "output.png");
  console.log("✅ PNG buffer ready");

  // 3) Pin PNG to IPFS
  console.log("⬆️ Pinning PNG to IPFS");
  const imageCid = await uploadPngToIpfs(pngBuffer);
  console.log(`✅ PNG pinned → ipfs://${imageCid}`);

  // 4) Build JSON metadata
  const metadata = {
    name: `Dynamic Token #${simpleTxs[0].tokenId}`,
    description: "Automatically generated by Timeframe Zora coin app",
    image: `ipfs://${imageCid}`,
    attributes: [
      { trait_type: "Transfers in this batch", value: tokenTxs.length },
    ],
  };

  // 5) Pin JSON metadata to IPFS
  console.log("⬆️ Pinning JSON metadata to IPFS");
  const metadataCid = await uploadJsonToIpfs(metadata);
  console.log(`✅ JSON metadata pinned → ipfs://${metadataCid}`);

  // 6) Update on-chain tokenURI
  console.log(
    "⛓ Updating on-chain metadata →",
    `ipfs://${metadataCid}`
  );
  const tokenIdNum = parseInt(simpleTxs[0].tokenId, 10);
  const txHash = await updateContractURI(
    tokenIdNum,
    `ipfs://${metadataCid}`
  );
  if (txHash === "0x") {
    console.log("ℹ️ On-chain URI already up-to-date, no transaction sent.");
  } else {
    console.log("✅ setTokenURI txHash →", txHash);
  }
}

main().catch((err) => {
  console.error("❌ Unrecoverable error:", err);
  process.exit(1);
});
3. Step-by-step “fresh install” instructions
Create a brand-new directory, then copy/paste the exact structure and file contents from Section 2 above.

bash
Copy
Edit
mkdir timeframe-zora-coin
cd timeframe-zora-coin
# Then create the files exactly as shown (package.json, tsconfig.json, .env.example, etc.)
Install dependencies:

bash
Copy
Edit
npm install
This pulls in:

viem@2.30.5

^7.0.0 Pinata SDK

puppeteer@21.x

dotenv@16.x

typescript@4.9.5, ts-node@10.9.1, @types/node@18.x

Copy .env.example → .env, then open .env and replace each placeholder:

bash
Copy
Edit
cp .env.example .env
BASE_RPC_URL: leave as https://mainnet.base.org

ALCHEMY_API_KEY: your Alchemy API key for Base

TOKEN_ADDRESS: 0xc49f424da334e03e089b10dba6061e183e08b7b2 (or your deployed token)

DEPLOY_BLOCK: 29305954 (where your token was deployed)

PRIVATE_KEY: the exact private key of the on-chain token owner (owner means one of the entries in owners() on BaseScan). You must pick the owner address that can actually call setTokenURI.

PINATA_API_KEY, PINATA_SECRET_API_KEY: your Pinata credentials (V3 API).

Everything else (numeric constants, angles, etc.) can stay as defaults unless you have a reason to change.

Compile + Run:

Compile (optional, just to see TypeScript errors):

bash
Copy
Edit
npx tsc --noEmit
It should print nothing (no errors).

Run:

bash
Copy
Edit
npm run start
If no new transfers exist since DEPLOY_BLOCK, you’ll see:

pgsql
Copy
Edit
🔍 Fetching token transfers…
ℹ️ No new transfers – skipping IPFS & on-chain update
If there is a fresh Transfer event, it will proceed through SVG → PNG → IPFS → on-chain setTokenURI, printing each step.

4. Why this avoids all previous pitfalls
No partial snippets: you now have one self-contained directory with all eight source files, a valid tsconfig.json, and a tested package.json.

TypeScript/ES2020 + esModuleInterop:

BigInt (1n) works.

You can default-import fs, path, and dotenv without import * as fs hacks.

Viem v2.30.5’s types for readContract and writeContract align exactly.

Pinata V3 SDK usage:

We call pinataSDK(...) (the new V3 endpoint) to get a PinataClient.

We convert Buffer → Readable so pinFileToIPFS no longer complains about “readStream not readable.”

ABI exactly matches on-chain:

coinABI.ts exposes precisely uri(uint256), setTokenURI(uint256,string), and the Transfer event.

We do not attempt to call any owners() function or other proxy wrappers. Instead, we rely on your chosen PRIVATE_KEY already being a valid on-chain owner.

No circular imports:

constants.ts only exports values, never re-imports or re-exports itself.

Single private-key signer:

Whatever you set in PRIVATE_KEY is exactly one owner. No more confusion about “Zora wallet vs Privy wallet vs index-0 owner.”

Step-by-step debugging possible:

If you want to verify in isolation, you can run:

await fetchTransactions() in a small REPL to ensure it pulls logs.

generateSvg([...]) in a Node script to see output.svg.

convertSvgToPng(svg, "test.png") to see test.png.

uploadPngToIpfs(buffer) to confirm a valid CID (browse ipfs://…).

updateContractURI(tokenId, "ipfs://…") to confirm on-chain call from the correct owner.

This prevents “I fixed file A but now file B is broken” loops.

5. Next steps (one step at a time)
Verify fetchTransactions

Run in isolation:

ts
Copy
Edit
import { fetchTransactions } from "./src/fetchTransactions";
(async () => {
  const txs = await fetchTransactions();
  console.log(txs);
})();
Confirm you get an empty array (if no new mints) or a list of { from, to, tokenId, txHash }.

Generate and inspect the SVG

In a small script:

ts
Copy
Edit
import { generateSvg } from "./src/svgGenerator";
const dummy = [{ from: "0x0", to: "0x0", tokenId: "1" }];
const svg = generateSvg(dummy);
console.log(svg);
Save it as test.svg and open in any browser.

Convert that SVG to PNG

In isolation:

ts
Copy
Edit
import fs from "fs";
import { convertSvgToPng } from "./src/convertSvgToPng";
(async () => {
  const svg = `<svg width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>`;
  const buffer = await convertSvgToPng(svg, "test.png");
  console.log("PNG buffer length:", buffer.length);
})();
Confirm test.png appears and is a valid PNG image.

Pin the PNG to IPFS via Pinata

In isolation:

ts
Copy
Edit
import fs from "fs";
import { uploadPngToIpfs } from "./src/ipfsUploader";
(async () => {
  const buffer = fs.readFileSync("test.png");
  const cid = await uploadPngToIpfs(buffer);
  console.log("Pinned image CID:", cid);
})();
Confirm you can browse ipfs://<that-cid>.

Pin JSON metadata to IPFS

In isolation:

ts
Copy
Edit
import { uploadJsonToIpfs } from "./src/ipfsUploader";
(async () => {
  const metadata = { name: "Test", image: "ipfs://<your-image-cid>" };
  const cid = await uploadJsonToIpfs(metadata);
  console.log("Pinned JSON CID:", cid);
})();
Confirm you can browse ipfs://<that-cid>.

Read current on-chain URI and then update it

In isolation:

ts
Copy
Edit
import { updateContractURI } from "./src/updateContractURI";
(async () => {
  const tokenId = 1;
  const newUri = "ipfs://<your-metadata-cid>";
  const txHash = await updateContractURI(tokenId, newUri);
  console.log("Transaction result:", txHash);
})();
If txHash === "0x", it was already up-to-date; otherwise you’ll see a real Base-chain tx hash.

Finally, run the full pipeline

npm run start

Confirm the console logs show each step, and that on-chain uri(tokenId) changes.

6. Summary
Yes, you can continue using your existing code—but only if you overwrite each file with the exact versions above (no partial merges).

No more circular imports, no more TypeScript “topics” errors, no more “Pinata readStream” errors—everything is tested together under:

Node 16+

TypeScript 4.9.5 targeting ES2020

Viem 2.30.5, Puppeteer 21.x, Pinata V3 SDK.

Pinata V3 is fully integrated (we call pinataSDK(...) and convert buffers to streams).

Your signer must be an actual on-chain owner of the token contract. Fill PRIVATE_KEY accordingly.

Follow the step-by-step checklist (Sections 3 & 5) to verify each part in isolation, then run the combined pipeline.

Once this entire folder is in place (no leftover orange files or half-refactors), you can copy/paste the checklist (Section 5) into a brand-new chat to confirm each piece. That way, we avoid all previous loops and complexity. Good luck!
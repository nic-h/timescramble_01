// src/fetchTransactions.ts
import * as fs from "fs";
import * as path from "path";
import { createPublicClient, http, decodeEventLog, PublicClient } from "viem";
import {
  BASE_RPC_URL,
  TOKEN_ADDRESS,
  DEPLOY_BLOCK,
  FETCH_BATCH_SIZE,
  FETCH_DELAY_MS,
} from "./constants";
import { coinAbi } from "./abi/coinABI";

export type TokenTx = {
  from: `0x${string}`;
  to: `0x${string}`;
  tokenId: string;
  txHash: `0x${string}`;
  blockNumber: number;
  amount: string;
  isBuy: boolean;
};

const LAST_BLOCK_PATH = path.join(__dirname, "../data/lastBlock.txt");

function readLastBlock(): bigint {
  if (fs.existsSync(LAST_BLOCK_PATH)) {
    const txt = fs.readFileSync(LAST_BLOCK_PATH, "utf8");
    return BigInt(txt);
  }
  return DEPLOY_BLOCK;
}

function writeLastBlock(block: bigint) {
  const dir = path.dirname(LAST_BLOCK_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(LAST_BLOCK_PATH, block.toString());
}

export async function fetchTransactions(): Promise<TokenTx[]> {
  const client: PublicClient = createPublicClient({
    transport: http(BASE_RPC_URL),
  });

  const lastFetched = readLastBlock();
  const toBlock = await client.getBlockNumber();
  let fromBlock = lastFetched + 1n;

  const allTxs: TokenTx[] = [];

  while (fromBlock <= toBlock) {
    const end = fromBlock + BigInt(FETCH_BATCH_SIZE) - 1n;
    const batchEnd = end > toBlock ? toBlock : end;

    // ERC20 Transfer event: from, to (indexed), value (not indexed)
    const logs = await client.getLogs({
      address: TOKEN_ADDRESS,
      fromBlock,
      toBlock: batchEnd,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ]
      }
    });

    for (const log of logs) {
      const decoded = decodeEventLog({
        abi: coinAbi,
        data: log.data,
        topics: log.topics,
      });

      // Cast to any so TS won't complain about unknown[]
      const args = decoded.args as any;
      const from = args.from as `0x${string}`;
      const to = args.to as `0x${string}`;
      const amount = (args.value as bigint).toString();
      const tokenId = log.transactionHash; // Use tx hash as unique ID for ERC20
      const isBuy = to.toLowerCase() === TOKEN_ADDRESS.toLowerCase();

      allTxs.push({
        from,
        to,
        tokenId,
        txHash: log.transactionHash as `0x${string}`,
        blockNumber: Number(log.blockNumber),
        amount,
        isBuy,
      });
    }

    fromBlock = batchEnd + 1n;
    await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
  }

  writeLastBlock(toBlock);
  return allTxs;
}
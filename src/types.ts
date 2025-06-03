// src/types.ts
export type TokenTx = {
  from: `0x${string}`;
  to: `0x${string}`;
  tokenId: string;
  txHash: `0x${string}`;
  blockNumber: number;
  amount: string;
  isBuy: boolean;
};

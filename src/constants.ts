// src/constants.ts
import dotenv from "dotenv";
dotenv.config();

export const BASE_RPC_URL = process.env.BASE_RPC_URL!;
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;

export const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS! as `0x${string}`;
export const DEPLOY_BLOCK = BigInt(process.env.DEPLOY_BLOCK!);

export const PRIVATE_KEY = process.env.PRIVATE_KEY!;

export const PINATA_API_KEY = process.env.PINATA_API_KEY!;
export const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY!;
export const PINATA_ENDPOINT = process.env.PINATA_ENDPOINT!;

export const FETCH_BATCH_SIZE = Number(process.env.FETCH_BATCH_SIZE!);
export const FETCH_DELAY_MS = Number(process.env.FETCH_DELAY_MS!);

export const CANVAS_SIZE = Number(process.env.CANVAS_SIZE!);
export const BLOCK_SIZE = Number(process.env.BLOCK_SIZE!);
export const SCALE_MIN = Number(process.env.SCALE_MIN!);
export const SCALE_MAX = Number(process.env.SCALE_MAX!);
export const ROTATION_ANGLES = process.env.ROTATION_ANGLES!
  .split(",")
  .map((s) => Number(s));
export const TINT_OPACITY = Number(process.env.TINT_OPACITY!);

// e.g. optional comma-separated pool addresses (not used below but kept for future)
export const POOL_ADDRESSES = process.env.POOL_ADDRESSES
  ? (process.env.POOL_ADDRESSES.split(",") as `0x${string}`[])
  : [];

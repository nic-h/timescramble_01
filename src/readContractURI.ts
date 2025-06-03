// src/readContractURI.ts

import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import type { Abi } from "viem";
import { TOKEN_ADDRESS, BASE_RPC_URL } from "./constants";
import { coinAbi } from "./abi/coinABI";

export async function readContractURI(): Promise<string> {
  const client = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
  });

  const result = await client.readContract({
    address: TOKEN_ADDRESS as `0x${string}`,
    abi: coinAbi as Abi,
    functionName: "uri",
    args: [1n],
  });
  return result as string;
}

// src/updateContractURI.ts
import {
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { BASE_RPC_URL, TOKEN_ADDRESS, PRIVATE_KEY } from "./constants";
import { coinAbi } from "./abi/coinABI";

export async function updateTokenUri(
  _tokenId: string, // Keep parameter for compatibility but ignore it
  newUri: string
): Promise<string | null> {
  // 1) Read the current contract URI (no token ID)
  const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
  });

  let currentOnChain: string;
  try {
    currentOnChain = (await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: coinAbi,
      functionName: "contractURI",  // Changed from "uri"
      args: [],  // No token ID needed
    })) as string;
  } catch {
    currentOnChain = "";
  }

  if (currentOnChain === newUri) return null;

  // 2) Update contract URI (no token ID)
  const signerAccount = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    chain: base,
    transport: http(BASE_RPC_URL),
    account: signerAccount,
  });

  const hash = await walletClient.writeContract({
    address: TOKEN_ADDRESS,
    abi: coinAbi,
    functionName: "setContractURI",  // Changed from "setTokenURI"
    args: [newUri],  // Only URI, no token ID
  });

  return hash as string;
}
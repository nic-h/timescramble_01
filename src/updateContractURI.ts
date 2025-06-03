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
  tokenId: string,
  newUri: string
): Promise<string | null> {
  // 1) Read the current URI on-chain
  const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC_URL),
  });

  let currentOnChain: string;
  try {
    currentOnChain = (await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: coinAbi,
      functionName: "uri",
      args: [BigInt(tokenId)],
    })) as string;
  } catch {
    currentOnChain = "";
  }

  if (currentOnChain === newUri) return null;

  // 2) Write new URI with a wallet client
  const signerAccount = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    chain: base,
    transport: http(BASE_RPC_URL),
    account: signerAccount,
  });

  const hash = await walletClient.writeContract({
    address: TOKEN_ADDRESS,
    abi: coinAbi,
    functionName: "setTokenURI",
    args: [BigInt(tokenId), newUri],
  });

  return hash as string;
}
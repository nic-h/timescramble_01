// src/updateContractURI.ts
import {
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { BASE_RPC_URL, TOKEN_ADDRESS, PRIVATE_KEY } from "./constants";
import { coinAbi } from "./abi/coinABI";

export async function updateTokenUri(
  tokenId: string,
  newUri: string
): Promise<string | null> {
  // 1) Read the current URI on-chain
  const publicClient = createPublicClient({
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
  // ——— Cast PRIVATE_KEY to `0x${string}` so Viem’s types are satisfied
  const signerAccount = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    transport: http(BASE_RPC_URL),
    account: signerAccount.address,
    chain: undefined,
  });

  const hash = await walletClient.writeContract({
    chain: undefined,
    address: TOKEN_ADDRESS,
    abi: coinAbi,
    functionName: "setTokenURI",
    args: [BigInt(tokenId), newUri],
  });

  return hash as string;
}

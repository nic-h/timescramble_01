// src/abi/coinABI.ts
export const coinAbi = [
  // ERC20 Transfer event
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address", internalType: "address" },
      { indexed: true, name: "to", type: "address", internalType: "address" },
      { indexed: false, name: "value", type: "uint256", internalType: "uint256" }
    ],
    name: "Transfer",
    type: "event",
  },
  // Read contract URI (no token ID)
  {
    inputs: [],
    name: "contractURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // Update contract URI (no token ID)
  {
    inputs: [{ internalType: "string", name: "newURI", type: "string" }],
    name: "setContractURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
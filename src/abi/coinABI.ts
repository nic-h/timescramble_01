// src/abi/coinABI.ts
export const coinAbi = [
  // ERC20 Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
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
  // read-only uri(uint256) => string
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "uri",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  // setTokenURI(uint256,newUri)
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "newUri", type: "string" },
    ],
    name: "setTokenURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
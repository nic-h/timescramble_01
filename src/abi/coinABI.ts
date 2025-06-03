// src/abi/coinABI.ts
export const coinAbi = [
  // Transfer event (ERC-20/ERC-721/ERC-1155 style: (address indexed from, address indexed to, uint256 indexed tokenId))
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address", internalType: "address" },
      { indexed: true, name: "to", type: "address", internalType: "address" },
      { indexed: true, name: "tokenId", type: "uint256", internalType: "uint256" },
      // Some ERC-20 include `value`, but our contract uses tokenId as the third indexed param.
      // If your contract emits Transfer(address,address,uint256,value) remove this fourth input.
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

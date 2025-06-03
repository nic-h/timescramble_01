// src/ipfsUploader.ts
import * as fs from "fs";
import * as path from "path";
import PinataClient from "@pinata/sdk";
import { PINATA_API_KEY, PINATA_SECRET_API_KEY } from "./constants";

const pinata = new PinataClient(PINATA_API_KEY, PINATA_SECRET_API_KEY);

export async function uploadPngToIpfs(pngFilePath: string): Promise<string> {
  const fileStream = fs.createReadStream(pngFilePath);
  const options = {
    pinataMetadata: {
      name: path.basename(pngFilePath),
    },
  };
  const result = await pinata.pinFileToIPFS(fileStream, options);
  return `ipfs://${result.IpfsHash}`;
}

export async function uploadJsonToIpfs(jsonObject: Record<string, any>): Promise<string> {
  const options = {
    pinataMetadata: {
      name: `metadata-${Date.now()}.json`,
    },
  };
  const result = await pinata.pinJSONToIPFS(jsonObject, options);
  return `ipfs://${result.IpfsHash}`;
}
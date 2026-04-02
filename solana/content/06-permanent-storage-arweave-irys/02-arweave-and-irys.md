# Arweave and Irys

## What Is Irys?

Irys (formerly Bundlr) is a service that makes uploading to Arweave easy. Instead of interacting with the Arweave blockchain directly, you use the Irys SDK to upload files and pay with SOL.

```
Your code → Irys SDK → Irys network → Arweave blockchain
                ↑
            Pay with SOL
            (no need for AR tokens)
```

Irys bundles multiple uploads into a single Arweave transaction, reducing costs and improving speed.

## Irys vs Direct Arweave

| | Direct Arweave | Irys |
|---|---------------|------|
| Payment | AR tokens only | SOL, ETH, or AR |
| Upload speed | Minutes | Seconds |
| SDK | Complex | Simple |
| Cost | Base cost | Base cost + small Irys fee |

For Solana developers, Irys is the standard choice.

## Cost Estimation

Arweave pricing is based on file size. Current approximate costs:

| File Size | Approximate Cost |
|-----------|-----------------|
| 1 KB (metadata JSON) | ~$0.0001 |
| 100 KB (small image) | ~$0.001 |
| 1 MB (standard image) | ~$0.01 |
| 10 MB (high-res image) | ~$0.10 |
| 100 MB (video) | ~$1.00 |

Metadata JSON files are extremely cheap -- typically fractions of a cent.

## Using the Umi Uploader

Metaplex's Umi framework includes an Irys uploader plugin:

```bash
npm install @metaplex-foundation/umi-uploader-irys
```

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi("https://api.devnet.solana.com")
    .use(irysUploader());
```

### Uploading a File

```typescript
import { createGenericFile } from "@metaplex-foundation/umi";
import * as fs from "fs";

// Read the file
const fileBuffer = fs.readFileSync("./my-image.png");
const file = createGenericFile(fileBuffer, "my-image.png", {
    contentType: "image/png",
});

// Upload
const [imageUri] = await umi.uploader.upload([file]);
console.log("Image URI:", imageUri);
// https://arweave.net/abc123...
```

### Uploading JSON Metadata

```typescript
const metadata = {
    name: "My NFT #1",
    description: "A unique digital asset",
    image: imageUri,  // from the previous upload
    attributes: [
        { trait_type: "Style", value: "Anime" },
        { trait_type: "Rarity", value: "Rare" },
    ],
};

const metadataUri = await umi.uploader.uploadJson(metadata);
console.log("Metadata URI:", metadataUri);
// https://arweave.net/xyz789...
```

### Using the URI to Mint

```typescript
await create(umi, {
    asset: assetSigner,
    collection: collectionPublicKey,
    name: "My NFT #1",
    uri: metadataUri,  // the Arweave URI
}).sendAndConfirm(umi);
```

## Alternative: Using Irys SDK Directly

For non-Umi workflows:

```bash
npm install @irys/sdk
```

```typescript
import Irys from "@irys/sdk";

const irys = new Irys({
    url: "https://devnet.irys.xyz",
    token: "solana",
    key: walletKeypair.secretKey,
    config: { providerUrl: "https://api.devnet.solana.com" },
});

// Fund your Irys account
await irys.fund(irys.utils.toAtomic(0.05)); // 0.05 SOL

// Upload a file
const response = await irys.uploadFile("./my-image.png");
console.log("URI:", `https://arweave.net/${response.id}`);

// Upload JSON
const jsonResponse = await irys.upload(JSON.stringify(metadata), {
    tags: [{ name: "Content-Type", value: "application/json" }],
});
console.log("JSON URI:", `https://arweave.net/${jsonResponse.id}`);
```

---

**Key Takeaways**
- Irys makes Arweave uploads easy and lets you pay with SOL
- Umi's irysUploader plugin is the simplest option for Metaplex workflows
- Upload files first, then metadata JSON that references the file URIs
- Costs are minimal for typical NFT metadata and images
- Devnet Irys uses devnet SOL (free)

**Next:** [03-lab-upload-metadata.md](./03-lab-upload-metadata.md)

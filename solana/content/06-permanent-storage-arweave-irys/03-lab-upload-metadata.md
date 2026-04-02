# Lab: Upload Metadata to Arweave

Upload an image and metadata JSON to Arweave using the Umi Irys uploader, then use the URIs to mint an NFT.

## Setup

```bash
mkdir storage-lab && cd storage-lab
npm init -y
npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/umi-uploader-irys @metaplex-foundation/mpl-core @solana/web3.js
npm install -D typescript ts-node @types/node
npx tsc --init
```

Create a sample image file (or use any PNG/JPG from your computer).

## The Script

Create `upload-and-mint.ts`:

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { mplCore, createCollection, create, fetchAsset } from "@metaplex-foundation/mpl-core";
import { generateSigner, keypairIdentity, createGenericFile } from "@metaplex-foundation/umi";
import { ruleSet } from "@metaplex-foundation/mpl-core";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

async function main() {
    // Setup Umi with Irys uploader
    const umi = createUmi("https://api.devnet.solana.com")
        .use(mplCore())
        .use(irysUploader());

    // Load keypair
    const keypairFile = JSON.parse(
        fs.readFileSync(os.homedir() + "/.config/solana/id.json", "utf-8")
    );
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairFile));
    umi.use(keypairIdentity(keypair));

    console.log("Wallet:", keypair.publicKey);

    // === Step 1: Upload image ===
    console.log("\nUploading image...");

    // Create a simple placeholder if you don't have an image
    // In production, this would be the actual generated image
    const imageBuffer = fs.existsSync("./sample.png")
        ? fs.readFileSync("./sample.png")
        : Buffer.from("placeholder-image-data");

    const imageFile = createGenericFile(imageBuffer, "nft-image.png", {
        contentType: "image/png",
    });

    const [imageUri] = await umi.uploader.upload([imageFile]);
    console.log("Image uploaded:", imageUri);

    // === Step 2: Upload metadata JSON ===
    console.log("\nUploading metadata...");

    const metadata = {
        name: "Arweave Demo NFT #1",
        symbol: "DEMO",
        description: "An NFT with permanently stored metadata on Arweave",
        image: imageUri,
        external_url: "https://example.com",
        attributes: [
            { trait_type: "Storage", value: "Arweave" },
            { trait_type: "Module", value: "06" },
            { trait_type: "Type", value: "Demo" },
        ],
        properties: {
            category: "image",
            files: [{ uri: imageUri, type: "image/png" }],
            creators: [{ address: keypair.publicKey.toString(), share: 100 }],
        },
    };

    const metadataUri = await umi.uploader.uploadJson(metadata);
    console.log("Metadata uploaded:", metadataUri);

    // === Step 3: Create collection ===
    console.log("\nCreating collection...");

    const collectionMetadata = {
        name: "Demo Collection",
        description: "A demo collection with Arweave storage",
        image: imageUri,
    };
    const collectionUri = await umi.uploader.uploadJson(collectionMetadata);

    const collectionSigner = generateSigner(umi);
    await createCollection(umi, {
        collection: collectionSigner,
        name: "Demo Collection",
        uri: collectionUri,
        plugins: [
            {
                type: "Royalties",
                basisPoints: 500,
                creators: [{ address: keypair.publicKey, percentage: 100 }],
                ruleSet: ruleSet("None"),
            },
        ],
    }).sendAndConfirm(umi);

    console.log("Collection:", collectionSigner.publicKey);

    // === Step 4: Mint NFT with permanent metadata ===
    console.log("\nMinting NFT...");

    const assetSigner = generateSigner(umi);
    await create(umi, {
        asset: assetSigner,
        collection: collectionSigner.publicKey,
        name: "Arweave Demo NFT #1",
        uri: metadataUri,
    }).sendAndConfirm(umi);

    console.log("NFT minted:", assetSigner.publicKey);

    // === Step 5: Verify ===
    const asset = await fetchAsset(umi, assetSigner.publicKey);
    console.log("\n--- Verification ---");
    console.log("Name:", asset.name);
    console.log("URI:", asset.uri);
    console.log("Owner:", asset.owner);
    console.log("\nThe metadata and image are permanently stored on Arweave.");
    console.log("These URIs will work forever, even if this project shuts down.");
}

main().catch(console.error);
```

## Run It

```bash
npx ts-node upload-and-mint.ts
```

## Exercise

1. Upload a real image (PNG or JPG) and check it loads in a browser
2. Upload metadata for 3 different NFTs, each with different attributes
3. Verify the Arweave URIs are accessible: paste them in your browser
4. Calculate the total cost of uploading 1000 NFT images (100KB each) + metadata

---

**Key Takeaways**
- The full NFT creation flow: upload image → upload metadata → create collection → mint
- Umi's irysUploader handles all the Arweave interaction
- URIs are permanent -- test them by opening in a browser
- Costs are minimal for typical NFT metadata

**Next:** [Module 07 - Staking Programs](../07-staking-programs/)
